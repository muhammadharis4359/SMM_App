import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ accountId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { accountId } = await params;
  const account = await prisma.socialAccount.findUnique({
    where: { id: accountId },
  });

  if (!account) {
    return NextResponse.json({ error: 'Social account not found.' }, { status: 404 });
  }

  const access = await verifyWorkspaceAccess(session.userId, account.workspaceId, ['OWNER', 'ADMIN']);
  if (!access) return forbiddenResponse();

  try {
    // 1. Requirement 6.2: Pause all pending posts bound to this account
    await prisma.contentItem.updateMany({
      where: {
        socialAccountId: accountId,
        status: { in: ['SCHEDULED', 'AWAITING_APPROVAL'] },
      },
      data: {
        status: 'AWAITING_APPROVAL',
        failureMessage: `Channel disconnected: Scheduled post was paused because ${account.accountName} was unlinked.`,
      },
    });

    // 2. Remove account record
    await prisma.socialAccount.delete({
      where: { id: accountId },
    });

    await logAuditEvent({
      workspaceId: account.workspaceId,
      actorUserId: session.userId,
      action: 'SOCIAL_ACCOUNT_DISCONNECTED',
      resourceType: 'SOCIAL_ACCOUNT',
      resourceId: accountId,
      metadata: { platform: account.platform, accountName: account.accountName },
    });

    return NextResponse.json({
      success: true,
      message: `Account ${account.accountName} disconnected and pending posts paused safely.`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to disconnect account.' }, { status: 500 });
  }
}
