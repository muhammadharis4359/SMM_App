import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN', 'MEMBER', 'VIEWER']);
  if (!access) return forbiddenResponse();

  try {
    const items = await prisma.contentItem.findMany({
      where: {
        workspaceId,
        status: { in: ['PUBLISHED', 'SCHEDULED', 'APPROVED', 'DRAFT'] },
      },
      include: {
        campaign: true,
        platformMetrics: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    const rows: string[] = [];
    // Header
    rows.push([
      'Post_ID',
      'Platform',
      'Status',
      'Campaign',
      'Title_or_Caption_Snippet',
      'Scheduled_For',
      'Published_At',
      'Impressions',
      'Reach',
      'Likes',
      'Comments',
      'Shares',
      'External_Platform_ID'
    ].map(escapeCsv).join(','));

    for (const item of items) {
      const metricsMap: Record<string, number> = {};
      for (const m of item.platformMetrics) {
        metricsMap[m.metricKey] = m.metricValue;
      }

      const snippet = (item.title || item.caption).replace(/\r?\n/g, ' ').substring(0, 100);
      const row = [
        item.id,
        item.platform,
        item.status,
        item.campaign?.name || 'Unassigned',
        snippet,
        item.scheduledAt ? item.scheduledAt.toISOString() : '',
        item.publishedAt ? item.publishedAt.toISOString() : '',
        metricsMap['IMPRESSIONS'] || 0,
        metricsMap['REACH'] || 0,
        metricsMap['LIKES'] || 0,
        metricsMap['COMMENTS'] || 0,
        metricsMap['SHARES'] || 0,
        item.platformPostId || item.platformUrl || '',
      ];

      rows.push(row.map(escapeCsv).join(','));
    }

    const csvContent = rows.join('\r\n');

    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: 'ANALYTICS_REPORT_EXPORTED',
      resourceType: 'ANALYTICS',
      metadata: { rowCount: items.length },
    });

    const dateStr = new Date().toISOString().split('T')[0];
    const filename = `brandive_analytics_${access.workspace.name.replace(/[^a-zA-Z0-9]/g, '_')}_${dateStr}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (err: any) {
    console.error('Analytics CSV Export Error:', err);
    return NextResponse.json({ error: 'Failed to generate analytics export.' }, { status: 500 });
  }
}

function escapeCsv(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}
