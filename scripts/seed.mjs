import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BranDive SocialFlow AI database...');

  // 1. Create or update Plans
  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      description: 'Ideal for solo creators and small businesses building their online presence.',
      priceMonthly: 29.0,
      active: true,
      featuresJson: JSON.stringify([
        '1 Workspace',
        'Up to 3 Connected Social Accounts',
        'Monthly AI Content Calendar',
        'Core Platform Scheduling',
        'Manual Approval Workflow',
        'Standard Support'
      ]),
      quotasJson: JSON.stringify({
        maxWorkspaces: 1,
        maxSocialAccounts: 3,
        maxAiRunsPerMonth: 30,
        maxScheduledPostsPerMonth: 60,
        maxStorageBytes: 100 * 1024 * 1024, // 100 MB
        videoAnalysisMinutes: 15,
        canAutoPublish: false
      })
    },
    {
      id: 'diamond',
      name: 'Diamond',
      description: 'For growing businesses and brands ready to scale with autonomous workflows.',
      priceMonthly: 79.0,
      active: true,
      featuresJson: JSON.stringify([
        '1 Workspace',
        'Up to 8 Connected Social Accounts',
        'Weekly & Monthly AI Campaign Planning',
        'Rule-Based Auto-Publishing',
        'Best-Time Recommendation Engine',
        'YouTube Metadata & Chapter Assistant',
        'Priority Support'
      ]),
      quotasJson: JSON.stringify({
        maxWorkspaces: 1,
        maxSocialAccounts: 8,
        maxAiRunsPerMonth: 150,
        maxScheduledPostsPerMonth: 250,
        maxStorageBytes: 1024 * 1024 * 1024, // 1 GB
        videoAnalysisMinutes: 90,
        canAutoPublish: true
      })
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Engineered for marketing agencies and high-volume multi-brand teams.',
      priceMonthly: 199.0,
      active: true,
      featuresJson: JSON.stringify([
        'Multiple Client Workspaces (Up to 5)',
        'Up to 20 Connected Accounts',
        'Multi-Pillar Campaign Planning',
        'Multi-Step Role-Based Approvals',
        'Client-Ready Analytics & Exports',
        'Dedicated Priority Agency Support'
      ]),
      quotasJson: JSON.stringify({
        maxWorkspaces: 5,
        maxSocialAccounts: 20,
        maxAiRunsPerMonth: 500,
        maxScheduledPostsPerMonth: 1000,
        maxStorageBytes: 10 * 1024 * 1024 * 1024, // 10 GB
        videoAnalysisMinutes: 300,
        canAutoPublish: true
      })
    }
  ];

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { id: plan.id },
      update: plan,
      create: plan
    });
  }
  console.log('✅ Plans seeded (Basic, Diamond, Premium).');

  // 2. Demo User
  const passwordHash = await bcrypt.hash('Password123!', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@brandivemedsols.com' },
    update: {
      passwordHash,
      displayName: 'Alex Vance (BMS Team)'
    },
    create: {
      email: 'demo@brandivemedsols.com',
      passwordHash,
      displayName: 'Alex Vance (BMS Team)',
      status: 'ACTIVE'
    }
  });
  console.log(`✅ Demo user initialized: ${user.email} (Password: Password123!)`);

  // 3. Demo Workspace
  let workspace = await prisma.workspace.findFirst({
    where: { ownerUserId: user.id }
  });

  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: 'BranDive Media Solutions',
        ownerUserId: user.id,
        timezone: 'America/New_York',
        locale: 'en-US',
        approvalMode: 'MANUAL',
        emergencyPaused: false
      }
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: 'OWNER'
      }
    });
  }
  console.log(`✅ Demo workspace initialized: ${workspace.name} (${workspace.id})`);

  // 4. Subscription (Diamond Plan)
  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  await prisma.subscription.upsert({
    where: { workspaceId: workspace.id },
    update: {
      planId: 'diamond',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    },
    create: {
      workspaceId: workspace.id,
      planId: 'diamond',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    }
  });

  // 5. Brand Profile
  await prisma.brandProfile.upsert({
    where: { workspaceId: workspace.id },
    update: {
      brandName: 'BranDive Media Solutions',
      website: 'https://www.brandivemedsols.com',
      industry: 'Digital Marketing & Web Agency',
      servicesJson: JSON.stringify([
        'Full-Stack Web Development',
        'Social Media Campaign Management',
        'Graphic Design & Brand Identity',
        'AI Automation & Growth Roadmaps'
      ]),
      audienceJson: JSON.stringify({
        targetDemographic: 'Business Owners, Founders, Marketing Directors',
        regions: ['North America', 'United Kingdom', 'Global'],
        ageGroup: '25-54'
      }),
      toneJson: JSON.stringify([
        'Innovative',
        'Authoritative',
        'Results-Driven',
        'Approachable',
        'Forward-Thinking'
      ]),
      language: 'en',
      goalsJson: JSON.stringify([
        'Establish Digital Authority',
        'Drive High-Value Inbound Inquiries',
        'Promote AI-Powered Campaign SaaS'
      ]),
      ctaPreferences: 'Book a Growth Audit | Visit www.brandivemedsols.com',
      offersJson: JSON.stringify([
        'Complimentary Social Growth Audit for Qualified Brands',
        'Turnkey Web & Social Transformation Packages'
      ]),
      restrictionsJson: JSON.stringify([
        'Do not guarantee overnight virality',
        'Never promote black-hat engagement tactics',
        'Do not mention unverified pricing'
      ]),
      complianceNotes: 'All client testimonials and statistics must reflect verified case results.'
    },
    create: {
      workspaceId: workspace.id,
      brandName: 'BranDive Media Solutions',
      website: 'https://www.brandivemedsols.com',
      industry: 'Digital Marketing & Web Agency',
      servicesJson: JSON.stringify([
        'Full-Stack Web Development',
        'Social Media Campaign Management',
        'Graphic Design & Brand Identity',
        'AI Automation & Growth Roadmaps'
      ]),
      audienceJson: JSON.stringify({
        targetDemographic: 'Business Owners, Founders, Marketing Directors',
        regions: ['North America', 'United Kingdom', 'Global'],
        ageGroup: '25-54'
      }),
      toneJson: JSON.stringify([
        'Innovative',
        'Authoritative',
        'Results-Driven',
        'Approachable',
        'Forward-Thinking'
      ]),
      language: 'en',
      goalsJson: JSON.stringify([
        'Establish Digital Authority',
        'Drive High-Value Inbound Inquiries',
        'Promote AI-Powered Campaign SaaS'
      ]),
      ctaPreferences: 'Book a Growth Audit | Visit www.brandivemedsols.com',
      offersJson: JSON.stringify([
        'Complimentary Social Growth Audit for Qualified Brands',
        'Turnkey Web & Social Transformation Packages'
      ]),
      restrictionsJson: JSON.stringify([
        'Do not guarantee overnight virality',
        'Never promote black-hat engagement tactics',
        'Do not mention unverified pricing'
      ]),
      complianceNotes: 'All client testimonials and statistics must reflect verified case results.'
    }
  });
  console.log('✅ Brand profile configured with official BMS details.');

  // 6. Brand Assets
  const assets = [
    {
      workspaceId: workspace.id,
      uploadedBy: user.id,
      filename: 'brandive-primary-logo.png',
      storageKey: '/logo.png',
      fileType: 'LOGO',
      mimeType: 'image/png',
      sizeBytes: 11101,
      category: 'LOGO',
      tagsJson: JSON.stringify(['logo', 'branding', 'official']),
      processingStatus: 'READY'
    },
    {
      workspaceId: workspace.id,
      uploadedBy: user.id,
      filename: 'hero-digital-excellence.jpg',
      storageKey: '/logo.jpg',
      fileType: 'IMAGE',
      mimeType: 'image/jpeg',
      sizeBytes: 17087,
      category: 'PROMO',
      tagsJson: JSON.stringify(['hero', 'campaign', 'brand']),
      processingStatus: 'READY'
    }
  ];

  for (const asset of assets) {
    const existing = await prisma.brandAsset.findFirst({
      where: { workspaceId: workspace.id, filename: asset.filename }
    });
    if (!existing) {
      await prisma.brandAsset.create({ data: asset });
    }
  }

  // 7. Social Accounts (High-Fidelity Demo Mode with realistic capability flags)
  const socialAccounts = [
    {
      workspaceId: workspace.id,
      platform: 'META_IG',
      platformAccountId: 'demo_ig_101',
      accountName: '@brandivemedsols (Instagram)',
      accountType: 'BUSINESS_PROFILE',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights']),
      capabilitiesJson: JSON.stringify({
        publishPhoto: true,
        publishReel: true,
        publishCarousel: true,
        readInsights: true,
        maxDailyPosts: 25
      }),
      encryptedToken: 'ENC_DEMO_TOKEN_META_IG',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: workspace.id,
      platform: 'META_FB',
      platformAccountId: 'demo_fb_202',
      accountName: 'BranDive Media Solutions (Page)',
      accountType: 'PAGE',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']),
      capabilitiesJson: JSON.stringify({
        publishPhoto: true,
        publishVideo: true,
        publishLink: true,
        readInsights: true
      }),
      encryptedToken: 'ENC_DEMO_TOKEN_META_FB',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: workspace.id,
      platform: 'LINKEDIN',
      platformAccountId: 'demo_li_303',
      accountName: 'BranDive Media Solutions (Company Page)',
      accountType: 'ORGANIZATION',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['w_organization_social', 'r_organization_social']),
      capabilitiesJson: JSON.stringify({
        publishText: true,
        publishImage: true,
        publishDocument: true,
        recommendedWeeklyPosts: 5
      }),
      encryptedToken: 'ENC_DEMO_TOKEN_LINKEDIN',
      tokenExpiresAt: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: workspace.id,
      platform: 'YOUTUBE',
      platformAccountId: 'demo_yt_404',
      accountName: 'BranDive Media (YouTube Channel)',
      accountType: 'CHANNEL',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['https://www.googleapis.com/auth/youtube.upload', 'https://www.googleapis.com/auth/youtube.readonly']),
      capabilitiesJson: JSON.stringify({
        uploadVideo: true,
        scheduleVideo: true,
        customThumbnails: true,
        maxUploadQuotaPerDay: 6
      }),
      encryptedToken: 'ENC_DEMO_TOKEN_YOUTUBE',
      tokenExpiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    }
  ];

  for (const sa of socialAccounts) {
    await prisma.socialAccount.upsert({
      where: {
        workspaceId_platform_platformAccountId: {
          workspaceId: sa.workspaceId,
          platform: sa.platform,
          platformAccountId: sa.platformAccountId
        }
      },
      update: sa,
      create: sa
    });
  }
  console.log('✅ Connected Social Accounts seeded in Demo Mode (Meta IG, Meta FB, LinkedIn, YouTube).');

  // 8. Demo Campaign & Content Items
  let campaign = await prisma.campaign.findFirst({
    where: { workspaceId: workspace.id, name: 'Digital Growth Accelerate 2026' }
  });

  if (!campaign) {
    campaign = await prisma.campaign.create({
      data: {
        workspaceId: workspace.id,
        name: 'Digital Growth Accelerate 2026',
        objective: 'AWARENESS',
        briefJson: JSON.stringify({
          focus: 'Showcase BranDive multi-disciplinary agency power and AI automated campaign scheduling',
          targetPlatforms: ['META_IG', 'META_FB', 'LINKEDIN', 'YOUTUBE'],
          cadence: '4 posts weekly'
        }),
        pillarsJson: JSON.stringify([
          'Digital Excellence Showcase',
          'AI Automation Insights',
          'Client Growth Strategies',
          'Behind The Build'
        ]),
        startAt: now,
        endAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdBy: user.id
      }
    });
  }

  // 9. Content Items across states (Published, Scheduled, Awaiting Approval, Draft)
  const scheduledTime1 = new Date(now.getTime() + 4 * 60 * 60 * 1000); // 4 hours in future
  const scheduledTime2 = new Date(now.getTime() + 28 * 60 * 60 * 1000); // tomorrow

  const demoItems = [
    {
      workspaceId: workspace.id,
      campaignId: campaign.id,
      platform: 'META_IG',
      format: 'IMAGE',
      caption: 'Transforming complex digital vision into seamless reality. At BranDive Media Solutions, we engineer growth systems that empower modern enterprises. 🚀 Dive into digital excellence with automated multi-channel workflows.\n\nLink in bio to book your complimentary brand audit.',
      hashtagsJson: JSON.stringify(['#DigitalExcellence', '#BranDiveMedia', '#GrowthMarketing', '#SaaSAutomation', '#AgencyLife']),
      status: 'PUBLISHED',
      publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      platformPostId: 'demo_ig_post_987654',
      platformUrl: 'https://instagram.com/p/demo_ig_post_987654',
      metadataJson: JSON.stringify({ isDemo: true, likes: 142, comments: 19 })
    },
    {
      workspaceId: workspace.id,
      campaignId: campaign.id,
      platform: 'LINKEDIN',
      format: 'TEXT',
      title: 'The Shift to Autonomy: Why Modern Agencies Plan Once and Publish Programmatically',
      caption: 'The future of social media marketing is not about publishing more noise; it is about orchestrating precision.\n\nWhen brands establish structured content pillars, adapt copy natively per channel, and maintain strict human approval guardrails, consistency stops being a chore.\n\nAt BranDive Media Solutions, we built SocialFlow AI to bridge the gap between creative brief and dependable multi-platform scheduling.\n\nHow is your organization adapting its content distribution this quarter?',
      hashtagsJson: JSON.stringify(['#SocialMediaStrategy', '#MarketingAutomation', '#DigitalTransformation', '#B2BMarketing']),
      status: 'SCHEDULED',
      scheduledAt: scheduledTime1,
      idempotencyKey: `job_${workspace.id}_li_${scheduledTime1.getTime()}`,
      metadataJson: JSON.stringify({ isDemo: true })
    },
    {
      workspaceId: workspace.id,
      campaignId: campaign.id,
      platform: 'YOUTUBE',
      format: 'VIDEO',
      title: 'How BranDive SocialFlow AI Automates Multi-Platform Campaigns',
      caption: 'Explore how BranDive SocialFlow AI turns a single campaign brief into platform-ready calendars for YouTube, Meta, and LinkedIn.',
      description: 'Discover how BranDive SocialFlow AI turns a single campaign brief and brand asset library into platform-optimized schedules across Instagram, Facebook, LinkedIn, and YouTube.\n\nTimestamps:\n0:00 - Introduction to SocialFlow AI\n01:45 - Connecting Official Social APIs\n04:10 - Brand Onboarding & Voice Profiles\n07:30 - Autonomous Planning vs Human Approval\n11:15 - Real-time Publishing & Analytics\n\nLearn more: https://www.brandivemedsols.com\nContact: contact@brandivemedsols.com',
      tagsJson: JSON.stringify(['social media automation', 'brandive media solutions', 'socialflow ai', 'marketing agency', 'youtube scheduling']),
      metadataJson: JSON.stringify({
        categoryId: '28',
        madeForKids: false,
        visibility: 'PUBLIC',
        isDemo: true
      }),
      status: 'AWAITING_APPROVAL',
      scheduledAt: scheduledTime2
    },
    {
      workspaceId: workspace.id,
      campaignId: campaign.id,
      platform: 'META_FB',
      format: 'IMAGE',
      caption: 'Is your brand content calendar ready for next week? Plan your campaign themes once, let our platform generate tailored variations, and schedule with confidence. Discover how BranDive Media Solutions powers modern brands.',
      hashtagsJson: JSON.stringify(['#BrandGrowth', '#BranDive', '#DigitalMarketing']),
      metadataJson: JSON.stringify({ isDemo: true }),
      status: 'DRAFT'
    }
  ];

  for (const item of demoItems) {
    const existing = await prisma.contentItem.findFirst({
      where: {
        workspaceId: item.workspaceId,
        platform: item.platform,
        caption: item.caption
      }
    });

    if (!existing) {
      const createdItem = await prisma.contentItem.create({ data: item });

      // If scheduled, add PublishJob
      if (item.status === 'SCHEDULED' && item.scheduledAt) {
        await prisma.publishJob.create({
          data: {
            contentItemId: createdItem.id,
            workspaceId: workspace.id,
            idempotencyKey: item.idempotencyKey || `job_${createdItem.id}`,
            scheduledAt: item.scheduledAt,
            status: 'QUEUED'
          }
        });
      }

      // If published, add demo metrics
      if (item.status === 'PUBLISHED') {
        await prisma.platformMetric.createMany({
          data: [
            { contentItemId: createdItem.id, metricKey: 'IMPRESSIONS', metricValue: 3420, source: 'PLATFORM_API', definition: 'Times displayed on feed' },
            { contentItemId: createdItem.id, metricKey: 'REACH', metricValue: 2890, source: 'PLATFORM_API', definition: 'Unique accounts reached' },
            { contentItemId: createdItem.id, metricKey: 'LIKES', metricValue: 142, source: 'PLATFORM_API', definition: 'Post reactions' },
            { contentItemId: createdItem.id, metricKey: 'COMMENTS', metricValue: 19, source: 'PLATFORM_API', definition: 'Total comments' }
          ]
        });
      }
    }
  }
  console.log('✅ Content items, publish jobs, and platform metrics seeded.');

  // 10. Notifications & Audit Logs
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: user.id,
        type: 'APPROVAL_NEEDED',
        title: 'Review Needed: YouTube Video Concept',
        message: 'Content draft for "How BranDive SocialFlow AI Automates Multi-Platform Campaigns" is awaiting approval.',
        read: false
      },
      {
        workspaceId: workspace.id,
        userId: user.id,
        type: 'PUBLISH_SUCCESS',
        title: 'Post Published Successfully',
        message: 'Instagram post was published on schedule (Demo Mode).',
        read: true
      }
    ]
  });

  await prisma.auditLog.create({
    data: {
      workspaceId: workspace.id,
      actorUserId: user.id,
      action: 'WORKSPACE_INITIALIZED',
      resourceType: 'WORKSPACE',
      resourceId: workspace.id,
      metadataJson: JSON.stringify({ version: '1.0.0', seeded: true })
    }
  });

  console.log('🎉 Seed process successfully finished!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
