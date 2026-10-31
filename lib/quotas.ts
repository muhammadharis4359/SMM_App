import { prisma } from './prisma';

export interface PlanQuotas {
  maxWorkspaces: number;
  maxSocialAccounts: number;
  maxAiRunsPerMonth: number;
  maxScheduledPostsPerMonth: number;
  maxStorageBytes: number;
  videoAnalysisMinutes: number;
  canAutoPublish: boolean;
}

export interface WorkspaceUsageStats {
  planId: string;
  planName: string;
  quotas: PlanQuotas;
  usage: {
    socialAccounts: number;
    aiRunsCurrentPeriod: number;
    scheduledPostsCurrentPeriod: number;
    storageBytesTotal: number;
  };
  warnings: string[];
}

export async function getWorkspaceQuotasAndUsage(workspaceId: string): Promise<WorkspaceUsageStats> {
  // 1. Fetch Subscription & Plan
  const subscription = await prisma.subscription.findUnique({
    where: { workspaceId },
    include: { plan: true },
  });

  const planId = subscription?.planId || 'basic';
  const plan = subscription?.plan || (await prisma.plan.findUnique({ where: { id: 'basic' } }));
  const quotas: PlanQuotas = plan?.quotasJson
    ? JSON.parse(plan.quotasJson)
    : {
        maxWorkspaces: 1,
        maxSocialAccounts: 3,
        maxAiRunsPerMonth: 30,
        maxScheduledPostsPerMonth: 60,
        maxStorageBytes: 100 * 1024 * 1024,
        videoAnalysisMinutes: 15,
        canAutoPublish: false,
      };

  const periodStart = subscription?.currentPeriodStart || new Date(new Date().setDate(1));

  // 2. Count Social Accounts
  const socialAccountsCount = await prisma.socialAccount.count({
    where: { workspaceId, connectionStatus: 'CONNECTED' },
  });

  // 3. Count AI Runs in Current Period
  const aiRunsCount = await prisma.aIRun.count({
    where: {
      workspaceId,
      createdAt: { gte: periodStart },
    },
  });

  // 4. Count Scheduled/Published Posts in Current Period
  const postsCount = await prisma.contentItem.count({
    where: {
      workspaceId,
      createdAt: { gte: periodStart },
      status: { in: ['SCHEDULED', 'PUBLISHED', 'PUBLISHING'] },
    },
  });

  // 5. Total Storage Bytes
  const storageAgg = await prisma.brandAsset.aggregate({
    where: { workspaceId },
    _sum: { sizeBytes: true },
  });
  const storageBytes = storageAgg._sum.sizeBytes || 0;

  // 6. Generate Proactive Warnings
  const warnings: string[] = [];
  if (socialAccountsCount >= quotas.maxSocialAccounts) {
    warnings.push(`Social account quota reached (${socialAccountsCount}/${quotas.maxSocialAccounts}). Upgrade plan to connect more.`);
  } else if (socialAccountsCount >= quotas.maxSocialAccounts - 1) {
    warnings.push(`You are approaching your connected accounts limit (${socialAccountsCount}/${quotas.maxSocialAccounts}).`);
  }

  if (aiRunsCount >= quotas.maxAiRunsPerMonth * 0.85) {
    warnings.push(`AI generation allowance is at ${Math.round((aiRunsCount / quotas.maxAiRunsPerMonth) * 100)}% capacity for this billing period.`);
  }

  return {
    planId,
    planName: plan?.name || 'Basic',
    quotas,
    usage: {
      socialAccounts: socialAccountsCount,
      aiRunsCurrentPeriod: aiRunsCount,
      scheduledPostsCurrentPeriod: postsCount,
      storageBytesTotal: storageBytes,
    },
    warnings,
  };
}

export async function checkFeatureQuota(
  workspaceId: string,
  feature: 'AI_RUN' | 'SOCIAL_ACCOUNT' | 'SCHEDULED_POST' | 'AUTO_PUBLISH'
): Promise<{ allowed: boolean; reason?: string }> {
  const stats = await getWorkspaceQuotasAndUsage(workspaceId);

  switch (feature) {
    case 'AI_RUN':
      if (stats.usage.aiRunsCurrentPeriod >= stats.quotas.maxAiRunsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly AI generation quota reached (${stats.usage.aiRunsCurrentPeriod}/${stats.quotas.maxAiRunsPerMonth}). Upgrade your plan to run more AI campaign generations.`,
        };
      }
      return { allowed: true };

    case 'SOCIAL_ACCOUNT':
      if (stats.usage.socialAccounts >= stats.quotas.maxSocialAccounts) {
        return {
          allowed: false,
          reason: `Maximum connected accounts reached (${stats.usage.socialAccounts}/${stats.quotas.maxSocialAccounts}) for the ${stats.planName} plan. Upgrade to Diamond or Premium to add more channels.`,
        };
      }
      return { allowed: true };

    case 'SCHEDULED_POST':
      if (stats.usage.scheduledPostsCurrentPeriod >= stats.quotas.maxScheduledPostsPerMonth) {
        return {
          allowed: false,
          reason: `Monthly scheduled post quota reached (${stats.usage.scheduledPostsCurrentPeriod}/${stats.quotas.maxScheduledPostsPerMonth}). Upgrade to increase your publishing capacity.`,
        };
      }
      return { allowed: true };

    case 'AUTO_PUBLISH':
      if (!stats.quotas.canAutoPublish) {
        return {
          allowed: false,
          reason: `Rule-based auto-publishing requires the Diamond or Premium plan. Your current plan (${stats.planName}) supports manual approval.`,
        };
      }
      return { allowed: true };

    default:
      return { allowed: true };
  }
}
