import { NextRequest, NextResponse } from 'next/server';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { SocialGateway } from '@/lib/social/connectors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { platform } = await params;
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get('workspaceId');

  if (!workspaceId) {
    return NextResponse.json({ error: 'workspaceId is required.' }, { status: 400 });
  }

  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN']);
  if (!access) return forbiddenResponse();

  try {
    const connector = SocialGateway.getConnector(platform.toUpperCase());
    const statePayload = Buffer.from(
      JSON.stringify({
        workspaceId,
        userId: session.userId,
        timestamp: Date.now(),
      })
    ).toString('base64url');

    const authUrl = connector.getAuthUrl(workspaceId, statePayload);
    return NextResponse.redirect(authUrl);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to generate OAuth URL.' }, { status: 500 });
  }
}
