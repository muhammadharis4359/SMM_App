import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { SocialGateway } from '@/lib/social/connectors';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId);
  if (!access) return forbiddenResponse();

  const accounts = await prisma.socialAccount.findMany({
    where: { workspaceId },
    select: {
      id: true,
      platform: true,
      platformAccountId: true,
      accountName: true,
      accountType: true,
      scopesJson: true,
      capabilitiesJson: true,
      tokenExpiresAt: true,
      connectionStatus: true,
      isDemo: true,
      lastSyncAt: true,
      createdAt: true,
      _count: {
        select: { contentItems: true },
      },
    },
    orderBy: { platform: 'asc' },
  });

  // Available platform connector definitions
  const availablePlatforms = [
    {
      key: 'META_IG',
      name: 'Instagram Professional',
      description: 'Publish photos, reels, and carousels. Requires professional account linked to Facebook Page.',
      isConfigured: SocialGateway.getConnector('META_IG').isConfigured(),
      capabilities: SocialGateway.getConnector('META_IG').getCapabilities(),
      authUrl: SocialGateway.getConnector('META_IG').getAuthUrl(workspaceId, 'state_meta_ig'),
    },
    {
      key: 'META_FB',
      name: 'Facebook Pages',
      description: 'Publish Page updates, media posts, and track page engagement.',
      isConfigured: SocialGateway.getConnector('META_FB').isConfigured(),
      capabilities: SocialGateway.getConnector('META_FB').getCapabilities(),
      authUrl: SocialGateway.getConnector('META_FB').getAuthUrl(workspaceId, 'state_meta_fb'),
    },
    {
      key: 'LINKEDIN',
      name: 'LinkedIn (Profile & Page)',
      description: 'Publish articles, corporate updates, and media. Supports 3 or 5 posts/week cadences.',
      isConfigured: SocialGateway.getConnector('LINKEDIN').isConfigured(),
      capabilities: SocialGateway.getConnector('LINKEDIN').getCapabilities(),
      authUrl: SocialGateway.getConnector('LINKEDIN').getAuthUrl(workspaceId, 'state_linkedin'),
    },
    {
      key: 'YOUTUBE',
      name: 'YouTube Channel',
      description: 'Upload videos, generate titles, descriptions with chapters, and manage scheduled visibility.',
      isConfigured: SocialGateway.getConnector('YOUTUBE').isConfigured(),
      capabilities: SocialGateway.getConnector('YOUTUBE').getCapabilities(),
      authUrl: SocialGateway.getConnector('YOUTUBE').getAuthUrl(workspaceId, 'state_youtube'),
    },
  ];

  return NextResponse.json({
    connectedAccounts: accounts.map((a) => ({
      ...a,
      scopes: a.scopesJson ? JSON.parse(a.scopesJson) : [],
      capabilities: a.capabilitiesJson ? JSON.parse(a.capabilitiesJson) : {},
      postsCount: a._count.contentItems,
    })),
    availablePlatforms,
  });
}
