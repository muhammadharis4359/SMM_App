import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, verifyWorkspaceAccess, unauthorizedResponse, forbiddenResponse } from '@/lib/auth';
import { checkFeatureQuota } from '@/lib/quotas';
import { generateCampaignPlan } from '@/lib/ai/campaignEngine';
import { logAuditEvent } from '@/lib/audit';
import crypto from 'crypto';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const session = await getSession(req);
  if (!session) return unauthorizedResponse();

  const { workspaceId } = await params;
  const access = await verifyWorkspaceAccess(session.userId, workspaceId, ['OWNER', 'ADMIN', 'MEMBER']);
  if (!access) return forbiddenResponse();

  // 1. Quota Check
  const quotaCheck = await checkFeatureQuota(workspaceId, 'AI_RUN');
  if (!quotaCheck.allowed) {
    return NextResponse.json({ error: quotaCheck.reason, code: 'QUOTA_EXCEEDED' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { campaignName, objective, platforms, postsPerWeek, startDate, endDate, notes } = body;

    if (!campaignName || !platforms || platforms.length === 0) {
      return NextResponse.json(
        { error: 'Campaign name and at least one target platform are required.' },
        { status: 400 }
      );
    }

    // 2. Fetch Brand Profile
    const brandProfile = await prisma.brandProfile.findUnique({
      where: { workspaceId },
    });

    const brandContext = {
      brandName: brandProfile?.brandName || access.workspace.name,
      website: brandProfile?.website || '',
      industry: brandProfile?.industry || 'Digital Services',
      services: brandProfile?.servicesJson ? JSON.parse(brandProfile.servicesJson) : [],
      audience: brandProfile?.audienceJson ? JSON.parse(brandProfile.audienceJson) : {},
      tone: brandProfile?.toneJson ? JSON.parse(brandProfile.toneJson) : ['Professional'],
      goals: brandProfile?.goalsJson ? JSON.parse(brandProfile.goalsJson) : [objective],
      ctaPreferences: brandProfile?.ctaPreferences || undefined,
      offers: brandProfile?.offersJson ? JSON.parse(brandProfile.offersJson) : [],
      restrictions: brandProfile?.restrictionsJson ? JSON.parse(brandProfile.restrictionsJson) : [],
      complianceNotes: brandProfile?.complianceNotes || undefined,
    };

    // 3. Generate Campaign Content Plan via AI Gateway
    const planResult = await generateCampaignPlan({
      brand: brandContext,
      campaignName,
      objective: objective || 'AWARENESS',
      startDate: startDate || new Date().toISOString(),
      endDate: endDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      platforms,
      postsPerWeek: postsPerWeek || 4,
      briefNotes: notes,
    });

    // 4. Create Campaign Record
    const start = new Date(startDate || Date.now());
    const end = new Date(endDate || Date.now() + 14 * 24 * 60 * 60 * 1000);

    const campaign = await prisma.campaign.create({
      data: {
        workspaceId,
        name: campaignName,
        objective: objective || 'AWARENESS',
        briefJson: JSON.stringify({
          notes,
          platforms,
          postsPerWeek,
          summary: planResult.summary,
        }),
        pillarsJson: JSON.stringify(planResult.pillars),
        startAt: start,
        endAt: end,
        status: 'ACTIVE',
        createdBy: session.userId,
      },
    });

    // 5. Create Content Items in Calendar
    const createdItems = [];
    const baseDate = new Date(start);

    for (const postPlan of planResult.posts) {
      const scheduledDate = new Date(baseDate);
      scheduledDate.setDate(baseDate.getDate() + postPlan.dayOffset);
      const [hours, minutes] = postPlan.scheduledTimeStr.split(':').map(Number);
      scheduledDate.setHours(hours || 10, minutes || 0, 0, 0);

      // Connect to existing social account for this platform if one exists
      const socialAcc = await prisma.socialAccount.findFirst({
        where: { workspaceId, platform: postPlan.platform, connectionStatus: 'CONNECTED' },
      });

      const isAutoPublishEligible =
        access.workspace.approvalMode === 'AUTO_PUBLISH' && !postPlan.complianceWarning;
      const initialStatus = isAutoPublishEligible ? 'SCHEDULED' : 'AWAITING_APPROVAL';
      const initialIdempotencyKey = isAutoPublishEligible
        ? `job_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`
        : null;

      const item = await prisma.contentItem.create({
        data: {
          workspaceId,
          campaignId: campaign.id,
          socialAccountId: socialAcc?.id || null,
          platform: postPlan.platform,
          format: postPlan.format,
          title: postPlan.title || null,
          caption: postPlan.caption,
          description: postPlan.description || null,
          hashtagsJson: JSON.stringify(postPlan.hashtags),
          tagsJson: JSON.stringify(postPlan.hashtags),
          status: initialStatus,
          scheduledAt: scheduledDate,
          timezone: access.workspace.timezone,
          idempotencyKey: initialIdempotencyKey,
          approvedBy: isAutoPublishEligible ? session.userId : null,
          approvedAt: isAutoPublishEligible ? new Date() : null,
          metadataJson: JSON.stringify({
            confidence: postPlan.confidence,
            bestTimeReason: postPlan.bestTimeReason,
            pillar: postPlan.pillar,
            complianceWarning: postPlan.complianceWarning,
            isDemo: socialAcc ? socialAcc.isDemo : true,
            autoScheduled: isAutoPublishEligible,
          }),
        },
      });

      if (isAutoPublishEligible && initialIdempotencyKey) {
        await prisma.publishJob.create({
          data: {
            contentItemId: item.id,
            workspaceId,
            idempotencyKey: initialIdempotencyKey,
            scheduledAt: scheduledDate,
            status: 'QUEUED',
          },
        });
      }

      createdItems.push(item);
    }

    // 6. Record AI Run & Metering
    await prisma.aIRun.create({
      data: {
        workspaceId,
        featureKey: 'CAMPAIGN_PLAN',
        provider: process.env.AI_PROVIDER || 'MOCK',
        model: 'gemini-1.5-flash',
        promptTokens: 1450,
        completionTokens: 820,
        estimatedCost: 0.002,
        status: 'SUCCESS',
      },
    });

    // 7. Audit Log
    await logAuditEvent({
      workspaceId,
      actorUserId: session.userId,
      action: 'CAMPAIGN_GENERATED',
      resourceType: 'CAMPAIGN',
      resourceId: campaign.id,
      metadata: { campaignName, postsGenerated: createdItems.length },
    });

    return NextResponse.json({
      success: true,
      campaign: {
        ...campaign,
        brief: JSON.parse(campaign.briefJson),
        pillars: JSON.parse(campaign.pillarsJson),
      },
      contentItems: createdItems,
      summary: planResult.summary,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Campaign generation failed.' }, { status: 500 });
  }
}
