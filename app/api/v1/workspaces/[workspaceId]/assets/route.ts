import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId);
  if (!access) return forbiddenResponse();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  const whereClause: any = { workspaceId };
  if (category && category !== 'ALL') {
    whereClause.category = category;
  }

  const assets = await prisma.brandAsset.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    assets: assets.map((a) => ({
      ...a,
      tags: a.tagsJson ? JSON.parse(a.tagsJson) : [],
      dimensions: a.dimensionsJson ? JSON.parse(a.dimensionsJson) : null,
    })),
  });
}

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
    const body = await req.json();
    const { filename, storageKey, fileType, mimeType, sizeBytes, category, tags } = body;

    if (!filename || !storageKey) {
      return NextResponse.json({ error: 'Filename and storageKey are required.' }, { status: 400 });
    }

    const asset = await prisma.brandAsset.create({
      data: {
        workspaceId,
        uploadedBy: session.userId,
        filename,
        storageKey,
        fileType: fileType || 'IMAGE',
        mimeType: mimeType || 'image/jpeg',
        sizeBytes: sizeBytes || 10240,
        category: category || 'GENERAL',
        tagsJson: JSON.stringify(tags || []),
        processingStatus: 'READY',
      },
    });

    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: 'ASSET_UPLOADED',
      resourceType: 'BRAND_ASSET',
      resourceId: asset.id,
      metadata: { filename, sizeBytes },
    });

    return NextResponse.json({ success: true, asset });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to register asset.' }, { status: 500 });
  }
}
