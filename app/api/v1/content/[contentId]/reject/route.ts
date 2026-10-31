import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
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
    const body = await req.json().catch(() => ({}));
    const reason = body.reason || 'Rejected by reviewer.';

    const updated = await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        status: 'REJECTED',
        failureMessage: reason,
      },
    });

    // Remove any queued publish job
    if (content.idempotencyKey) {
      await prisma.publishJob.deleteMany({
        where: { idempotencyKey: content.idempotencyKey },
      });
    }

    await prisma.approvalEvent.create({
      data: {
        contentItemId: content.id,
        actorUserId: session.userId,
        action: 'REJECT',
        comment: reason,
      },
    });

    await logAuditEvent({
      workspaceId: content.workspaceId,
      actorUserId: session.userId,
      action: 'CONTENT_REJECTED',
      resourceType: 'CONTENT_ITEM',
      resourceId: contentId,
      metadata: { reason },
    });

    return NextResponse.json({
      success: true,
      message: 'Post rejected.',
      item: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Rejection failed.' }, { status: 500 });
  }
}
