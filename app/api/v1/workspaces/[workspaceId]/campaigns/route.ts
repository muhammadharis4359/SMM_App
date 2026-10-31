import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId);
  if (!access) return forbiddenResponse();

  const campaigns = await prisma.campaign.findMany({
    where: { workspaceId },
    include: {
      contentItems: {
        select: { id: true, platform: true, format: true, status: true, scheduledAt: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({
    campaigns: campaigns.map((c) => ({
      ...c,
      brief: JSON.parse(c.briefJson || '{}'),
      pillars: JSON.parse(c.pillarsJson || '[]'),
      totalPosts: c.contentItems.length,
      publishedCount: c.contentItems.filter((i) => i.status === 'PUBLISHED').length,
    })),
  });
}
