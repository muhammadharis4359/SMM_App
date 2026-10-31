import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN']);
  if (!access) return forbiddenResponse();

  try {
    const current = access.workspace.emergencyPaused;
    const newPausedState = !current;

    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: { emergencyPaused: newPausedState },
    });

    // Create Notification
    await prisma.notification.create({
      data: {
        workspaceId,
        userId: session.userId,
        type: newPausedState ? 'PUBLISH_FAILED' : 'PUBLISH_SUCCESS',
        title: newPausedState ? 'Emergency Pause Activated' : 'Publishing Resumed',
        message: newPausedState
          ? 'All automated and scheduled publishing has been globally frozen across all connected channels.'
          : 'Global publishing freeze has been lifted. Scheduled jobs are active.',
      },
    });

    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: newPausedState ? 'EMERGENCY_PAUSE_ACTIVATED' : 'EMERGENCY_PAUSE_DEACTIVATED',
      resourceType: 'WORKSPACE',
      resourceId: workspaceId,
      metadata: { paused: newPausedState },
    });

    return NextResponse.json({
      success: true,
      emergencyPaused: updated.emergencyPaused,
      message: newPausedState
        ? 'Emergency Pause activated: all publishing is safely frozen.'
        : 'Publishing resumed: scheduled posts are active.',
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to toggle emergency pause.' }, { status: 500 });
  }
}
