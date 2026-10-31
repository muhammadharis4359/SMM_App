import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { encryptToken } from '@/lib/crypto';
import { SocialGateway } from '@/lib/social/connectors';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const { platform } = await params;
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (error) {
    return NextResponse.redirect(`${appUrl}/integrations?error=${encodeURIComponent(error)}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${appUrl}/integrations?error=missing_code_or_state`);
  }

  try {
    // 1. Decode & Verify State Payload
    const decodedState = JSON.parse(Buffer.from(state, 'base64url').toString('utf8'));
    const { workspaceId, userId } = decodedState;

    if (!workspaceId) {
      return NextResponse.redirect(`${appUrl}/integrations?error=invalid_state`);
    }

    // 2. Exchange Authorization Code for Token
    const connector = SocialGateway.getConnector(platform.toUpperCase());
    const redirectUri = `${appUrl}/api/v1/integrations/${platform}/callback`;

    const tokenResult = await connector.exchangeCodeForToken(code, redirectUri);

    // 3. Encrypt sensitive token in vault
    const encryptedToken = encryptToken(tokenResult.accessToken);
    const expiresAt = tokenResult.expiresIn
      ? new Date(Date.now() + tokenResult.expiresIn * 1000)
      : null;

    // 4. Save SocialAccount to database
    const mappedPlatform =
      platform.toUpperCase() === 'META'
        ? tokenResult.accountType === 'BUSINESS_PROFILE'
          ? 'META_IG'
          : 'META_FB'
        : platform.toUpperCase();

    const account = await prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_platformAccountId: {
          workspaceId,
          platform: mappedPlatform,
          platformAccountId: tokenResult.platformAccountId,
        },
      },
      update: {
        accountName: tokenResult.accountName,
        accountType: tokenResult.accountType,
        encryptedToken,
        tokenExpiresAt: expiresAt,
        connectionStatus: 'CONNECTED',
        isDemo: false, // Confirmed Real OAuth Connection!
        scopesJson: JSON.stringify(tokenResult.scopes),
        capabilitiesJson: JSON.stringify(tokenResult.capabilities),
        lastSyncAt: new Date(),
      },
      create: {
        workspaceId,
        platform: mappedPlatform,
        platformAccountId: tokenResult.platformAccountId,
        accountName: tokenResult.accountName,
        accountType: tokenResult.accountType,
        encryptedToken,
        tokenExpiresAt: expiresAt,
        connectionStatus: 'CONNECTED',
        isDemo: false,
        scopesJson: JSON.stringify(tokenResult.scopes),
        capabilitiesJson: JSON.stringify(tokenResult.capabilities),
        lastSyncAt: new Date(),
      },
    });

    await logAuditEvent({
      workspaceId,
      actorUserId: userId || 'OAUTH_FLOW',
      action: 'OAUTH_ACCOUNT_CONNECTED',
      resourceType: 'SOCIAL_ACCOUNT',
      resourceId: account.id,
      metadata: { platform: mappedPlatform, accountName: tokenResult.accountName },
    });

    return NextResponse.redirect(`${appUrl}/integrations?connected=true&channel=${encodeURIComponent(tokenResult.accountName)}`);
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    return NextResponse.redirect(`${appUrl}/integrations?error=${encodeURIComponent(err.message || 'OAuth failed')}`);
  }
}
