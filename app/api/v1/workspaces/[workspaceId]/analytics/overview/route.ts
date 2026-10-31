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

  // Status breakdown
  const statusCounts = await prisma.contentItem.groupBy({
    by: ['status'],
    where: { workspaceId },
    _count: true,
  });

  const statusMap: Record<string, number> = {
    DRAFT: 0,
    AWAITING_APPROVAL: 0,
    APPROVED: 0,
    SCHEDULED: 0,
    PUBLISHED: 0,
    FAILED: 0,
  };
  statusCounts.forEach((sc) => {
    statusMap[sc.status] = sc._count;
  });

  // Platform breakdown
  const platformCounts = await prisma.contentItem.groupBy({
    by: ['platform'],
    where: { workspaceId },
    _count: true,
  });

  // Aggregated platform metrics
  const metricsAgg = await prisma.platformMetric.groupBy({
    by: ['metricKey'],
    where: {
      contentItem: { workspaceId },
    },
    _sum: { metricValue: true },
  });

  const metricsMap: Record<string, number> = {
    IMPRESSIONS: 0,
    REACH: 0,
    LIKES: 0,
    COMMENTS: 0,
    VIEWS: 0,
  };
  metricsAgg.forEach((m) => {
    metricsMap[m.metricKey] = m._sum.metricValue || 0;
  });

  // Recent 5 published posts with performance
  const recentPublished = await prisma.contentItem.findMany({
    where: { workspaceId, status: 'PUBLISHED' },
    orderBy: { publishedAt: 'desc' },
    take: 5,
    include: {
      platformMetrics: true,
      socialAccount: { select: { accountName: true, isDemo: true } },
    },
  });

  return NextResponse.json({
    totals: {
      totalPosts: Object.values(statusMap).reduce((a, b) => a + b, 0),
      published: statusMap.PUBLISHED,
      scheduled: statusMap.SCHEDULED,
      awaitingApproval: statusMap.AWAITING_APPROVAL,
      failed: statusMap.FAILED,
      drafts: statusMap.DRAFT,
    },
    statusBreakdown: statusMap,
    platformDistribution: platformCounts.map((p) => ({ platform: p.platform, count: p._count })),
    performanceMetrics: metricsMap,
    recentPosts: recentPublished.map((p) => ({
      ...p,
      metrics: p.platformMetrics.reduce((acc: any, m) => {
        acc[m.metricKey] = m.metricValue;
        return acc;
      }, {}),
    })),
  });
}
