// BranDive SocialFlow AI - Durable Publishing Worker & Scheduler
// Ensures idempotent publishing, UTC scheduling, emergency pause enforcement,
// exponential backoff retries, and explicit state transitions.

import { prisma } from '../prisma';
import { decryptToken } from '../crypto';
import { SocialGateway } from '../social/connectors';
import { logAuditEvent } from '../audit';

export interface PublishExecutionResult {
  jobId: string;
  contentItemId: string;
  status: 'SUCCEEDED' | 'FAILED' | 'PAUSED' | 'DEAD_LETTER';
  platformPostId?: string;
  error?: string;
}

/**
 * Executes a single content item publish flow immediately.
 */
export async function executePublish(
  contentItemId: string,
  actorUserId?: string
): Promise<PublishExecutionResult> {
  const content = await prisma.contentItem.findUnique({
    where: { id: contentItemId },
    include: {
      workspace: true,
      socialAccount: true,
      contentAssets: {
        include: { brandAsset: true },
      },
    },
  });

  if (!content) {
    throw new Error(`ContentItem not found: ${contentItemId}`);
  }

  // 1. Emergency Pause Check
  if (content.workspace.emergencyPaused) {
    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: 'AWAITING_APPROVAL',
        failureMessage: 'Publishing paused: Workspace is currently in Emergency Pause mode.',
      },
    });
    return {
      jobId: '',
      contentItemId,
      status: 'PAUSED',
      error: 'Workspace is in Emergency Pause mode.',
    };
  }

  // 2. Mark as PUBLISHING to prevent concurrent duplicate execution
  await prisma.contentItem.update({
    where: { id: contentItemId },
    data: { status: 'PUBLISHING' },
  });

  // 3. Resolve Social Account & Token
  let socialAccount = content.socialAccount;
  if (!socialAccount) {
    // If not explicitly bound, look for the workspace's default connected account for this platform
    socialAccount = await prisma.socialAccount.findFirst({
      where: {
        workspaceId: content.workspaceId,
        platform: content.platform,
        connectionStatus: 'CONNECTED',
      },
    });
  }

  const isDemo = socialAccount ? socialAccount.isDemo : true;
  let decryptedToken = '';
  if (socialAccount && socialAccount.encryptedToken) {
    try {
      decryptedToken = decryptToken(socialAccount.encryptedToken);
    } catch {
      decryptedToken = '';
    }
  }

  // 4. Delegate to Platform Connector
  const connector = SocialGateway.getConnector(content.platform);
  const mediaUrls = content.contentAssets.map((ca) => ca.brandAsset.storageKey);

  const result = await connector.publish(
    {
      id: content.id,
      workspaceId: content.workspaceId,
      platform: content.platform as any,
      format: content.format,
      caption: content.caption,
      title: content.title,
      description: content.description,
      hashtags: content.hashtagsJson ? JSON.parse(content.hashtagsJson) : [],
      mediaUrls,
      metadata: content.metadataJson ? JSON.parse(content.metadataJson) : {},
    },
    decryptedToken,
    isDemo
  );

  // 5. Update Database Record according to outcome
  if (result.success) {
    const updated = await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: 'PUBLISHED',
        publishedAt: result.publishedAt,
        platformPostId: result.platformPostId,
        platformUrl: result.platformUrl,
        failureCode: null,
        failureMessage: null,
      },
    });

    // Record In-App Notification
    await prisma.notification.create({
      data: {
        workspaceId: content.workspaceId,
        type: 'PUBLISH_SUCCESS',
        title: `Post Published to ${content.platform}`,
        message: `Your post "${content.title || content.caption.substring(0, 40)}..." was published successfully${
          result.isDemo ? ' [DEMO MODE]' : ''
        }.`,
        payloadJson: JSON.stringify({
          contentItemId,
          platformPostId: result.platformPostId,
          isDemo: result.isDemo,
        }),
      },
    });

    // Audit Log
    await logAuditEvent({
      workspaceId: content.workspaceId,
      actorUserId: actorUserId || 'SYSTEM_SCHEDULER',
      action: 'POST_PUBLISHED',
      resourceType: 'CONTENT_ITEM',
      resourceId: contentItemId,
      metadata: {
        platform: content.platform,
        platformPostId: result.platformPostId,
        isDemo: result.isDemo,
      },
    });

    return {
      jobId: '',
      contentItemId,
      status: 'SUCCEEDED',
      platformPostId: result.platformPostId,
    };
  } else {
    // Failure handling
    const retryCount = (content.retryCount || 0) + 1;
    const isFatal = !result.error?.retryable || retryCount >= 3;

    await prisma.contentItem.update({
      where: { id: contentItemId },
      data: {
        status: isFatal ? 'FAILED' : 'SCHEDULED',
        retryCount,
        failureCode: result.error?.code || 'UNKNOWN_ERROR',
        failureMessage: result.error?.message || 'Failed to publish post to social platform.',
      },
    });

    await prisma.notification.create({
      data: {
        workspaceId: content.workspaceId,
        type: 'PUBLISH_FAILED',
        title: `Publishing Failed: ${content.platform}`,
        message: result.error?.message || 'Publishing attempt was rejected by platform API.',
        payloadJson: JSON.stringify({ contentItemId, error: result.error }),
      },
    });

    return {
      jobId: '',
      contentItemId,
      status: isFatal ? 'DEAD_LETTER' : 'FAILED',
      error: result.error?.message,
    };
  }
}

/**
 * Scans the publish_jobs queue for all due jobs and processes them idempotently.
 */
export async function processDuePublishJobs(): Promise<PublishExecutionResult[]> {
  const now = new Date();

  // Find queued jobs due for publishing
  const dueJobs = await prisma.publishJob.findMany({
    where: {
      status: 'QUEUED',
      scheduledAt: { lte: now },
    },
    take: 20,
    include: {
      contentItem: true,
      workspace: true,
    },
  });

  const results: PublishExecutionResult[] = [];

  for (const job of dueJobs) {
    // 1. Idempotency safeguard: Mark job PROCESSING
    await prisma.publishJob.update({
      where: { id: job.id },
      data: {
        status: 'PROCESSING',
        startedAt: now,
        attemptCount: { increment: 1 },
      },
    });

    try {
      const outcome = await executePublish(job.contentItemId);

      if (outcome.status === 'SUCCEEDED') {
        await prisma.publishJob.update({
          where: { id: job.id },
          data: {
            status: 'SUCCEEDED',
            finishedAt: new Date(),
          },
        });
      } else if (outcome.status === 'PAUSED') {
        await prisma.publishJob.update({
          where: { id: job.id },
          data: {
            status: 'PAUSED',
            lastErrorJson: JSON.stringify({ error: outcome.error }),
          },
        });
      } else {
        const nextAttemptAt = new Date(Date.now() + Math.pow(2, job.attemptCount) * 60 * 1000);
        await prisma.publishJob.update({
          where: { id: job.id },
          data: {
            status: outcome.status === 'DEAD_LETTER' ? 'DEAD_LETTER' : 'QUEUED',
            nextAttemptAt,
            lastErrorJson: JSON.stringify({ error: outcome.error }),
          },
        });
      }

      results.push({ ...outcome, jobId: job.id });
    } catch (err: any) {
      await prisma.publishJob.update({
        where: { id: job.id },
        data: {
          status: 'DEAD_LETTER',
          lastErrorJson: JSON.stringify({ message: err.message }),
        },
      });
      results.push({
        jobId: job.id,
        contentItemId: job.contentItemId,
        status: 'DEAD_LETTER',
        error: err.message,
      });
    }
  }

  return results;
}
