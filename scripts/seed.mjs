import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Initializing BranDive SocialFlow AI with clean production slate...');

  // 1. Clean out all dummy content, metrics, jobs, and notifications for a fresh real start
  await prisma.platformMetric.deleteMany({});
  await prisma.publishJob.deleteMany({});
  await prisma.approvalEvent.deleteMany({});
  await prisma.contentAsset.deleteMany({});
  await prisma.contentItem.deleteMany({});
  await prisma.campaign.deleteMany({});
  await prisma.notification.deleteMany({});
  console.log('🧹 Cleaned all dummy content items, campaigns, and metrics.');

  // 2. Plans (Basic, Diamond, Premium)
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
        maxStorageBytes: 100 * 1024 * 1024,
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
        'Multiple Workspaces',
        'Up to 8 Connected Social Accounts',
        'Weekly & Monthly AI Campaign Planning',
        'Rule-Based Auto-Publishing',
        'Best-Time Recommendation Engine',
        'YouTube Metadata & Chapter Assistant',
        'Priority Support'
      ]),
      quotasJson: JSON.stringify({
        maxWorkspaces: 3,
        maxSocialAccounts: 8,
        maxAiRunsPerMonth: 150,
        maxScheduledPostsPerMonth: 250,
        maxStorageBytes: 1024 * 1024 * 1024,
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
        'Multiple Client Workspaces (Up to 10)',
        'Up to 25 Connected Accounts',
        'Multi-Pillar Campaign Planning',
        'Multi-Step Role-Based Approvals',
        'Client-Ready Analytics & Exports',
        'Dedicated Priority Agency Support'
      ]),
      quotasJson: JSON.stringify({
        maxWorkspaces: 10,
        maxSocialAccounts: 25,
        maxAiRunsPerMonth: 500,
        maxScheduledPostsPerMonth: 1000,
        maxStorageBytes: 10 * 1024 * 1024 * 1024,
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

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 3. Real Admin User (admin@brandivemedsols.com)
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@brandivemedsols.com' },
    update: {
      passwordHash,
      displayName: 'Muhammad Haris (Admin)'
    },
    create: {
      email: 'admin@brandivemedsols.com',
      passwordHash,
      displayName: 'Muhammad Haris (Admin)',
      status: 'ACTIVE'
    }
  });

  // Secondary demo user
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@brandivemedsols.com' },
    update: {
      passwordHash,
      displayName: 'BranDive Team (Demo)'
    },
    create: {
      email: 'demo@brandivemedsols.com',
      passwordHash,
      displayName: 'BranDive Team (Demo)',
      status: 'ACTIVE'
    }
  });

  // ==========================================
  // 4. WORKSPACE 1: BranDive Media Solutions (Agency HQ)
  // ==========================================
  let wsBranDive = await prisma.workspace.findFirst({
    where: { name: 'BranDive Media Solutions' }
  });

  if (!wsBranDive) {
    wsBranDive = await prisma.workspace.create({
      data: {
        name: 'BranDive Media Solutions',
        ownerUserId: adminUser.id,
        timezone: 'America/New_York',
        locale: 'en-US',
        approvalMode: 'MANUAL',
        emergencyPaused: false
      }
    });
  } else {
    await prisma.workspace.update({
      where: { id: wsBranDive.id },
      data: { ownerUserId: adminUser.id }
    });
  }

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: wsBranDive.id,
        userId: adminUser.id
      }
    },
    update: { role: 'OWNER' },
    create: {
      workspaceId: wsBranDive.id,
      userId: adminUser.id,
      role: 'OWNER'
    }
  });

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: wsBranDive.id,
        userId: demoUser.id
      }
    },
    update: { role: 'MEMBER' },
    create: {
      workspaceId: wsBranDive.id,
      userId: demoUser.id,
      role: 'MEMBER'
    }
  });

  await prisma.subscription.upsert({
    where: { workspaceId: wsBranDive.id },
    update: {
      planId: 'premium',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    },
    create: {
      workspaceId: wsBranDive.id,
      planId: 'premium',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    }
  });

  // Brand Profile for BranDive Media Solutions
  await prisma.brandProfile.upsert({
    where: { workspaceId: wsBranDive.id },
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
      workspaceId: wsBranDive.id,
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

  // BranDive Social Accounts
  const brandiveSocials = [
    {
      workspaceId: wsBranDive.id,
      platform: 'META_IG',
      platformAccountId: 'bms_ig_101',
      accountName: '@brandivemedsols (Instagram)',
      accountType: 'BUSINESS_PROFILE',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights']),
      capabilitiesJson: JSON.stringify({ publishPhoto: true, publishReel: true, publishCarousel: true, readInsights: true }),
      encryptedToken: 'ENC_TOKEN_BMS_IG',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: wsBranDive.id,
      platform: 'META_FB',
      platformAccountId: 'bms_fb_202',
      accountName: 'BranDive Media Solutions (Page)',
      accountType: 'PAGE',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']),
      capabilitiesJson: JSON.stringify({ publishPhoto: true, publishVideo: true, readInsights: true }),
      encryptedToken: 'ENC_TOKEN_BMS_FB',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: wsBranDive.id,
      platform: 'LINKEDIN',
      platformAccountId: 'bms_li_303',
      accountName: 'BranDive Media Solutions (Agency)',
      accountType: 'ORGANIZATION',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['w_organization_social', 'r_organization_social']),
      capabilitiesJson: JSON.stringify({ publishText: true, publishImage: true, publishDocument: true }),
      encryptedToken: 'ENC_TOKEN_BMS_LI',
      tokenExpiresAt: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: wsBranDive.id,
      platform: 'YOUTUBE',
      platformAccountId: 'bms_yt_404',
      accountName: 'BranDive Media (YouTube Channel)',
      accountType: 'CHANNEL',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['https://www.googleapis.com/auth/youtube.upload']),
      capabilitiesJson: JSON.stringify({ uploadVideo: true, scheduleVideo: true, customThumbnails: true }),
      encryptedToken: 'ENC_TOKEN_BMS_YT',
      tokenExpiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    }
  ];

  for (const sa of brandiveSocials) {
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

  // ==========================================
  // 5. WORKSPACE 2: learn2growrich (Client Account)
  // ==========================================
  let wsL2GR = await prisma.workspace.findFirst({
    where: { name: 'learn2growrich' }
  });

  if (!wsL2GR) {
    wsL2GR = await prisma.workspace.create({
      data: {
        name: 'learn2growrich',
        ownerUserId: adminUser.id,
        timezone: 'America/New_York',
        locale: 'en-US',
        approvalMode: 'MANUAL',
        emergencyPaused: false
      }
    });
  } else {
    await prisma.workspace.update({
      where: { id: wsL2GR.id },
      data: { ownerUserId: adminUser.id }
    });
  }

  await prisma.workspaceMember.upsert({
    where: {
      workspaceId_userId: {
        workspaceId: wsL2GR.id,
        userId: adminUser.id
      }
    },
    update: { role: 'OWNER' },
    create: {
      workspaceId: wsL2GR.id,
      userId: adminUser.id,
      role: 'OWNER'
    }
  });

  await prisma.subscription.upsert({
    where: { workspaceId: wsL2GR.id },
    update: {
      planId: 'diamond',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    },
    create: {
      workspaceId: wsL2GR.id,
      planId: 'diamond',
      status: 'ACTIVE',
      currentPeriodStart: now,
      currentPeriodEnd: nextMonth
    }
  });

  // Brand Profile for learn2growrich
  await prisma.brandProfile.upsert({
    where: { workspaceId: wsL2GR.id },
    update: {
      brandName: 'learn2growrich',
      website: 'https://learn2growrich.com',
      industry: 'Wealth Creation, Financial Mindset & Business Mastery',
      servicesJson: JSON.stringify([
        'Wealth Mindset Masterclasses',
        'High-Income Skills Frameworks',
        'Passive Income Blueprint',
        'Investment & Capital Allocation Guides',
        'Entrepreneurial Growth Coaching'
      ]),
      audienceJson: JSON.stringify({
        targetDemographic: 'Aspiring Entrepreneurs, Wealth Builders, Investors, Young Professionals seeking Financial Freedom',
        regions: ['Global', 'North America', 'Europe', 'Asia'],
        ageGroup: '20-45'
      }),
      toneJson: JSON.stringify([
        'Empowering',
        'Action-Oriented',
        'High-Impact',
        'Practical',
        'Inspiring',
        'No-Nonsense'
      ]),
      language: 'en',
      goalsJson: JSON.stringify([
        'Educate 100,000+ Individuals on Wealth Building',
        'Cultivate Strong Mindset & Daily Execution Habits',
        'Drive Academy Enrolment & Community Growth'
      ]),
      ctaPreferences: 'Download Free Wealth Acceleration Guide | Join the learn2growrich Masterclass',
      offersJson: JSON.stringify([
        'Free 7-Day Wealth Mindset Challenge',
        'Complete Financial Freedom Roadmap'
      ]),
      restrictionsJson: JSON.stringify([
        'No get-rich-quick scams or unbacked crypto hype',
        'Always emphasize discipline, skill acquisition, and risk management'
      ]),
      complianceNotes: 'Educational and informational content only. Financial disclaimers included where appropriate.'
    },
    create: {
      workspaceId: wsL2GR.id,
      brandName: 'learn2growrich',
      website: 'https://learn2growrich.com',
      industry: 'Wealth Creation, Financial Mindset & Business Mastery',
      servicesJson: JSON.stringify([
        'Wealth Mindset Masterclasses',
        'High-Income Skills Frameworks',
        'Passive Income Blueprint',
        'Investment & Capital Allocation Guides',
        'Entrepreneurial Growth Coaching'
      ]),
      audienceJson: JSON.stringify({
        targetDemographic: 'Aspiring Entrepreneurs, Wealth Builders, Investors, Young Professionals seeking Financial Freedom',
        regions: ['Global', 'North America', 'Europe', 'Asia'],
        ageGroup: '20-45'
      }),
      toneJson: JSON.stringify([
        'Empowering',
        'Action-Oriented',
        'High-Impact',
        'Practical',
        'Inspiring',
        'No-Nonsense'
      ]),
      language: 'en',
      goalsJson: JSON.stringify([
        'Educate 100,000+ Individuals on Wealth Building',
        'Cultivate Strong Mindset & Daily Execution Habits',
        'Drive Academy Enrolment & Community Growth'
      ]),
      ctaPreferences: 'Download Free Wealth Acceleration Guide | Join the learn2growrich Masterclass',
      offersJson: JSON.stringify([
        'Free 7-Day Wealth Mindset Challenge',
        'Complete Financial Freedom Roadmap'
      ]),
      restrictionsJson: JSON.stringify([
        'No get-rich-quick scams or unbacked crypto hype',
        'Always emphasize discipline, skill acquisition, and risk management'
      ]),
      complianceNotes: 'Educational and informational content only. Financial disclaimers included where appropriate.'
    }
  });

  // learn2growrich Social Accounts
  const l2grSocials = [
    {
      workspaceId: wsL2GR.id,
      platform: 'META_IG',
      platformAccountId: 'l2gr_ig_501',
      accountName: '@learn2growrich (Instagram)',
      accountType: 'BUSINESS_PROFILE',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['instagram_basic', 'instagram_content_publish', 'instagram_manage_insights']),
      capabilitiesJson: JSON.stringify({ publishPhoto: true, publishReel: true, publishCarousel: true, readInsights: true }),
      encryptedToken: 'ENC_TOKEN_L2GR_IG',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: wsL2GR.id,
      platform: 'META_FB',
      platformAccountId: 'l2gr_fb_502',
      accountName: 'learn2growrich Academy (Facebook Community)',
      accountType: 'PAGE',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['pages_show_list', 'pages_read_engagement', 'pages_manage_posts']),
      capabilitiesJson: JSON.stringify({ publishPhoto: true, publishVideo: true, readInsights: true }),
      encryptedToken: 'ENC_TOKEN_L2GR_FB',
      tokenExpiresAt: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: wsL2GR.id,
      platform: 'LINKEDIN',
      platformAccountId: 'l2gr_li_503',
      accountName: 'learn2growrich (LinkedIn Company)',
      accountType: 'ORGANIZATION',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['w_organization_social', 'r_organization_social']),
      capabilitiesJson: JSON.stringify({ publishText: true, publishImage: true, publishDocument: true }),
      encryptedToken: 'ENC_TOKEN_L2GR_LI',
      tokenExpiresAt: new Date(now.getTime() + 55 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    },
    {
      workspaceId: wsL2GR.id,
      platform: 'YOUTUBE',
      platformAccountId: 'l2gr_yt_504',
      accountName: 'learn2growrich Official (YouTube)',
      accountType: 'CHANNEL',
      isDemo: true,
      connectionStatus: 'CONNECTED',
      scopesJson: JSON.stringify(['https://www.googleapis.com/auth/youtube.upload']),
      capabilitiesJson: JSON.stringify({ uploadVideo: true, scheduleVideo: true, customThumbnails: true }),
      encryptedToken: 'ENC_TOKEN_L2GR_YT',
      tokenExpiresAt: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000),
      lastSyncAt: now
    }
  ];

  for (const sa of l2grSocials) {
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

  // Clean, fresh welcoming notifications
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: wsBranDive.id,
        userId: adminUser.id,
        type: 'WORKSPACE_INITIALIZED',
        title: 'Agency Workspace Ready',
        message: 'BranDive Media Solutions is live. Your clean calendar is ready for real campaign planning.',
        read: false
      },
      {
        workspaceId: wsL2GR.id,
        userId: adminUser.id,
        type: 'WORKSPACE_INITIALIZED',
        title: 'Client Workspace Ready',
        message: 'learn2growrich is live. Your clean calendar is ready for wealth mindset content.',
        read: false
      }
    ]
  });

  console.log('✨ Fresh production slate successfully initialized!');
  console.log('   - 0 dummy campaigns');
  console.log('   - 0 dummy posts / calendar items');
  console.log('   - 0 dummy metrics');
  console.log('   - Both workspaces configured with full brand profiles and channels.');
}

main()
  .catch((e) => {
    console.error('Error during clean seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
