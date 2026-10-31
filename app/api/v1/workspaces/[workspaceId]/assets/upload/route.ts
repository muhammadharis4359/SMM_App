import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const category = (formData.get('category') as string) || 'GENERAL';
    const tagsRaw = (formData.get('tags') as string) || '[]';

    if (!file) {
      return NextResponse.json({ error: 'No file provided in form data.' }, { status: 400 });
    }

    // 1. Validation: MIME Type and Size
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'video/mp4',
      'video/quicktime',
      'application/pdf',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Unsupported media type: ${file.type}. Allowed: JPG, PNG, WEBP, GIF, MP4, MOV, PDF.` },
        { status: 400 }
      );
    }

    const maxSizeBytes = file.type.startsWith('video') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: `File size exceeds allowed limit (${(maxSizeBytes / (1024 * 1024)).toFixed(0)} MB).` },
        { status: 400 }
      );
    }

    // 2. Read bytes & compute checksum
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');

    // 3. Save to public/uploads/
    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });

    const ext = path.extname(file.name) || (file.type.startsWith('video') ? '.mp4' : '.png');
    const safeFilename = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;
    const filePath = path.join(uploadDir, safeFilename);

    await fs.writeFile(filePath, buffer);

    const storageKey = `/uploads/${safeFilename}`;
    const fileType = file.type.startsWith('video')
      ? 'VIDEO'
      : file.type.startsWith('image')
      ? 'IMAGE'
      : 'DOCUMENT';

    let tags = [];
    try {
      tags = JSON.parse(tagsRaw);
    } catch {
      tags = tagsRaw.split(',').map((t) => t.trim()).filter(Boolean);
    }

    // 4. Record BrandAsset in DB
    const asset = await prisma.brandAsset.create({
      data: {
        workspaceId,
        uploadedBy: session.userId,
        filename: file.name,
        storageKey,
        fileType,
        mimeType: file.type,
        sizeBytes: file.size,
        checksum,
        category,
        tagsJson: JSON.stringify(tags),
        processingStatus: 'READY',
      },
    });

    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: 'MEDIA_ASSET_UPLOADED',
      resourceType: 'BRAND_ASSET',
      resourceId: asset.id,
      metadata: { filename: file.name, sizeBytes: file.size, mimeType: file.type },
    });

    return NextResponse.json({
      success: true,
      asset: {
        ...asset,
        tags,
      },
    });
  } catch (err: any) {
    console.error('File Upload Error:', err);
    return NextResponse.json({ error: err.message || 'File upload failed.' }, { status: 500 });
  }
}
