import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { contentId } = await params;
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
    include: {
      campaign: true,
      socialAccount: true,
      contentAssets: { include: { brandAsset: true } },
      approvalEvents: {
        include: { actor: { select: { displayName: true } } },
        orderBy: { createdAt: 'desc' },
      },
      platformMetrics: true,
    },
  });

  if (!content) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  const access = await verifyWorkspaceAccess(session.userId, content.workspaceId);
  if (!access) return forbiddenResponse();

  return NextResponse.json({
    item: {
      ...content,
      hashtags: content.hashtagsJson ? JSON.parse(content.hashtagsJson) : [],
      tags: content.tagsJson ? JSON.parse(content.tagsJson) : [],
      metadata: content.metadataJson ? JSON.parse(content.metadataJson) : {},
    },
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ contentId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { contentId } = await params;
  const content = await prisma.contentItem.findUnique({
    where: { id: contentId },
  });

  if (!content) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  const access = await verifyWorkspaceAccess(session.userId, content.workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  try {
    const body = await req.json();
    const updateData: any = {};

    if (body.caption !== undefined) updateData.caption = body.caption;
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.format !== undefined) updateData.format = body.format;
    if (body.hashtags !== undefined) updateData.hashtagsJson = JSON.stringify(body.hashtags);
    if (body.scheduledAt !== undefined) updateData.scheduledAt = new Date(body.scheduledAt);

    // If an approved or scheduled item is edited, return to AWAITING_APPROVAL per safety rules
    if (content.status === 'SCHEDULED' || content.status === 'APPROVED') {
      updateData.status = 'AWAITING_APPROVAL';
    }

    const updated = await prisma.contentItem.update({
      where: { id: contentId },
      data: updateData,
    });

    await prisma.approvalEvent.create({
      data: {
        contentItemId: content.id,
        actorUserId: session.userId,
        action: 'EDIT',
        comment: 'User modified post content or schedule.',
      },
    });

    await logAuditEvent({
      workspaceId: content.workspaceId,
      actorUserId: session.userId,
      action: 'CONTENT_EDITED',
      resourceType: 'CONTENT_ITEM',
      resourceId: contentId,
    });

    return NextResponse.json({
      success: true,
      item: {
        ...updated,
        hashtags: updated.hashtagsJson ? JSON.parse(updated.hashtagsJson) : [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to update post.' }, { status: 500 });
  }
}
