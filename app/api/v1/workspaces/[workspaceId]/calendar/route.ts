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

  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const status = searchParams.get('status');
  const campaignId = searchParams.get('campaignId');

  const whereClause: any = { workspaceId };
  if (platform && platform !== 'ALL') whereClause.platform = platform;
  if (status && status !== 'ALL') whereClause.status = status;
  if (campaignId) whereClause.campaignId = campaignId;

  const items = await prisma.contentItem.findMany({
    where: whereClause,
    include: {
      campaign: { select: { id: true, name: true } },
      socialAccount: { select: { id: true, accountName: true, isDemo: true } },
      contentAssets: {
        include: { brandAsset: true },
      },
      approvalEvents: {
        orderBy: { createdAt: 'desc' },
        take: 3,
        include: { actor: { select: { displayName: true } } },
      },
      publishJobs: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      platformMetrics: true,
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return NextResponse.json({
    items: items.map((item) => ({
      ...item,
      hashtags: item.hashtagsJson ? JSON.parse(item.hashtagsJson) : [],
      tags: item.tagsJson ? JSON.parse(item.tagsJson) : [],
      metadata: item.metadataJson ? JSON.parse(item.metadataJson) : {},
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  try {
    const body = await req.json();
    const { platform, format, title, caption, description, tags, hashtags, scheduledAt, metadata } = body;

    if (!platform || !caption) {
      return NextResponse.json({ error: 'Platform and caption are required.' }, { status: 400 });
    }

    const socialAccount = await prisma.socialAccount.findFirst({
      where: { workspaceId, platform, connectionStatus: 'CONNECTED' },
    });

    const isAutoPublish = access.workspace.approvalMode === 'AUTO_PUBLISH';
    const status = isAutoPublish ? 'SCHEDULED' : 'AWAITING_APPROVAL';

    const item = await prisma.contentItem.create({
      data: {
        workspaceId,
        socialAccountId: socialAccount?.id || null,
        platform,
        format: format || 'TEXT',
        title: title || null,
        caption,
        description: description || null,
        hashtagsJson: JSON.stringify(hashtags || []),
        tagsJson: JSON.stringify(tags || []),
        metadataJson: JSON.stringify(metadata || {}),
        status,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : new Date(Date.now() + 24 * 60 * 60 * 1000),
        timezone: access.workspace.timezone,
        approvedBy: isAutoPublish ? session.userId : null,
        approvedAt: isAutoPublish ? new Date() : null,
      },
    });

    return NextResponse.json({ success: true, item });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to schedule item' }, { status: 500 });
  }
}

