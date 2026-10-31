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
    include: { workspace: true },
  });

  if (!content) {
    return NextResponse.json({ error: 'Content item not found.' }, { status: 404 });
  }

  const access = await verifyWorkspaceAccess(session.userId, content.workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  try {
    const body = await req.json().catch(() => ({}));
    const comment = body.comment || 'Approved by user.';

    const newStatus = content.scheduledAt ? 'SCHEDULED' : 'APPROVED';
    const idempotencyKey = content.idempotencyKey || `job_${content.id}_${Date.now()}`;

    const updated = await prisma.contentItem.update({
      where: { id: contentId },
      data: {
        status: newStatus,
        approvedBy: session.userId,
        approvedAt: new Date(),
        idempotencyKey,
      },
    });

    // If scheduled, ensure PublishJob exists in queue
    if (newStatus === 'SCHEDULED' && content.scheduledAt) {
      await prisma.publishJob.upsert({
        where: { idempotencyKey },
        update: {
          scheduledAt: content.scheduledAt,
          status: 'QUEUED',
        },
        create: {
          contentItemId: content.id,
          workspaceId: content.workspaceId,
          idempotencyKey,
          scheduledAt: content.scheduledAt,
          status: 'QUEUED',
        },
      });
    }

    await prisma.approvalEvent.create({
      data: {
        contentItemId: content.id,
        actorUserId: session.userId,
        action: 'APPROVE',
        comment,
      },
    });

    await logAuditEvent({
      workspaceId: content.workspaceId,
      actorUserId: session.userId,
      action: 'CONTENT_APPROVED',
      resourceType: 'CONTENT_ITEM',
      resourceId: contentId,
    });

    return NextResponse.json({
      success: true,
      message: `Post approved and set to ${newStatus}.`,
      item: updated,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Approval failed.' }, { status: 500 });
  }
}
