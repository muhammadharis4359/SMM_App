import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { checkFeatureQuota } from '@/lib/quotas';
import { encryptToken } from '@/lib/crypto';
import { logAuditEvent } from '@/lib/audit';

export async function POST(req: NextRequest) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { workspaceId, platform, accountName, accountType, isDemo } = body;

    if (!workspaceId || !platform || !accountName) {
      return NextResponse.json({ error: 'workspaceId, platform, and accountName are required.' }, { status: 400 });
    }

    const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN']);
    if (!access) return forbiddenResponse();

    // 1. Quota Check
    const quota = await checkFeatureQuota(workspaceId, 'SOCIAL_ACCOUNT');
    if (!quota.allowed) {
      return NextResponse.json({ error: quota.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 });
    }

    const platformAccountId = `acc_${platform.toLowerCase()}_${Date.now()}`;
    const encryptedToken = encryptToken(isDemo ? `ENC_DEMO_TOKEN_${platform}` : 'token_simulated_secure');

    const expiresAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000); // 60 days

    const account = await prisma.socialAccount.create({
      data: {
        workspaceId,
        platform,
        platformAccountId,
        accountName,
        accountType: accountType || 'PAGE',
        isDemo: isDemo !== false,
        connectionStatus: 'CONNECTED',
        encryptedToken,
        tokenExpiresAt: expiresAt,
        scopesJson: JSON.stringify(['publish_content', 'read_insights']),
        capabilitiesJson: JSON.stringify({
          publishPhoto: true,
          publishVideo: true,
          readInsights: true,
        }),
        lastSyncAt: new Date(),
      },
    });

    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: 'SOCIAL_ACCOUNT_CONNECTED',
      resourceType: 'SOCIAL_ACCOUNT',
      resourceId: account.id,
      metadata: { platform, accountName, isDemo: account.isDemo },
    });

    return NextResponse.json({
      success: true,
      account: {
        ...account,
        encryptedToken: undefined, // Never expose encrypted token
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to connect social account.' }, { status: 500 });
  }
}
