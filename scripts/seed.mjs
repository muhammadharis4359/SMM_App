import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding BranDive SocialFlow AI production database...');

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
  console.log('✅ Plans seeded (Basic, Diamond, Premium).');

  const now = new Date();
  const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Real Admin User (admin@brandivemedsols.com)
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
  console.log(`✅ Production Admin initialized: ${adminUser.email} (Password: Password123!)`);

  // Also maintain demo user
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
  // 3. WORKSPACE 1: BranDive Media Solutions (Agency)
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

  // Ensure Admin is OWNER of BranDive Media Solutions
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

  // Demo user member
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

  // Subscription (Premium Plan for Agency)
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

  // BranDive Campaign & Items
  let bmsCampaign = await prisma.campaign.findFirst({
    where: { workspaceId: wsBranDive.id, name: 'Digital Growth Accelerate 2026' }
  });
  if (!bmsCampaign) {
    bmsCampaign = await prisma.campaign.create({
      data: {
        workspaceId: wsBranDive.id,
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
        createdBy: adminUser.id
      }
    });
  }

  const bmsItems = [
    {
      workspaceId: wsBranDive.id,
      campaignId: bmsCampaign.id,
      platform: 'META_IG',
      format: 'IMAGE',
      caption: 'Transforming complex digital vision into seamless reality. At BranDive Media Solutions, we engineer growth systems that empower modern enterprises. 🚀 Dive into digital excellence with automated multi-channel workflows.\n\nLink in bio to book your complimentary brand audit.',
      hashtagsJson: JSON.stringify(['#DigitalExcellence', '#BranDiveMedia', '#GrowthMarketing', '#SaaSAutomation', '#AgencyLife']),
      status: 'PUBLISHED',
      publishedAt: new Date(now.getTime() - 24 * 60 * 60 * 1000),
      platformPostId: 'bms_ig_post_987654',
      platformUrl: 'https://instagram.com/p/bms_ig_post_987654',
      metadataJson: JSON.stringify({ isDemo: true, likes: 142, comments: 19 })
    },
    {
      workspaceId: wsBranDive.id,
      campaignId: bmsCampaign.id,
      platform: 'LINKEDIN',
      format: 'TEXT',
      title: 'The Shift to Autonomy: Why Modern Agencies Plan Once and Publish Programmatically',
      caption: 'The future of social media marketing is not about publishing more noise; it is about orchestrating precision.\n\nWhen brands establish structured content pillars, adapt copy natively per channel, and maintain strict human approval guardrails, consistency stops being a chore.\n\nAt BranDive Media Solutions, we built SocialFlow AI to bridge the gap between creative brief and dependable multi-platform scheduling.\n\nHow is your organization adapting its content distribution this quarter?',
      hashtagsJson: JSON.stringify(['#SocialMediaStrategy', '#MarketingAutomation', '#DigitalTransformation', '#B2BMarketing']),
      status: 'SCHEDULED',
      scheduledAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
      metadataJson: JSON.stringify({ isDemo: true })
    },
    {
      workspaceId: wsBranDive.id,
      campaignId: bmsCampaign.id,
      platform: 'YOUTUBE',
      format: 'VIDEO',
      title: 'How BranDive SocialFlow AI Automates Multi-Platform Campaigns',
      caption: 'Explore how BranDive SocialFlow AI turns a single campaign brief into platform-ready calendars for YouTube, Meta, and LinkedIn.',
      description: 'Discover how BranDive SocialFlow AI turns a single campaign brief and brand asset library into platform-optimized schedules across Instagram, Facebook, LinkedIn, and YouTube.\n\nTimestamps:\n0:00 - Introduction to SocialFlow AI\n01:45 - Connecting Official Social APIs\n04:10 - Brand Onboarding & Voice Profiles\n07:30 - Autonomous Planning vs Human Approval\n11:15 - Real-time Publishing & Analytics\n\nLearn more: https://www.brandivemedsols.com\nContact: contact@brandivemedsols.com',
      tagsJson: JSON.stringify(['social media automation', 'brandive media solutions', 'socialflow ai', 'marketing agency', 'youtube scheduling']),
      metadataJson: JSON.stringify({ categoryId: '28', madeForKids: false, visibility: 'PUBLIC', isDemo: true }),
      status: 'AWAITING_APPROVAL',
      scheduledAt: new Date(now.getTime() + 28 * 60 * 60 * 1000)
    },
    {
      workspaceId: wsBranDive.id,
      campaignId: bmsCampaign.id,
      platform: 'META_FB',
      format: 'IMAGE',
      caption: 'Is your brand content calendar ready for next week? Plan your campaign themes once, let our platform generate tailored variations, and schedule with confidence. Discover how BranDive Media Solutions powers modern brands.',
      hashtagsJson: JSON.stringify(['#BrandGrowth', '#BranDive', '#DigitalMarketing']),
      metadataJson: JSON.stringify({ isDemo: true }),
      status: 'DRAFT'
    }
  ];

  for (const item of bmsItems) {
    const existing = await prisma.contentItem.findFirst({
      where: { workspaceId: item.workspaceId, platform: item.platform, caption: item.caption }
    });
    if (!existing) {
      const createdItem = await prisma.contentItem.create({ data: item });
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

  // ==========================================
  // 4. WORKSPACE 2: learn2growrich (Client Account)
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

  // Ensure Admin is OWNER of learn2growrich
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

  // Subscription (Diamond Plan for Client)
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

  // learn2growrich Connected Social Accounts
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

  // learn2growrich Campaign & Posts
  let l2grCampaign = await prisma.campaign.findFirst({
    where: { workspaceId: wsL2GR.id, name: 'Wealth Freedom Blueprint 2026' }
  });
  if (!l2grCampaign) {
    l2grCampaign = await prisma.campaign.create({
      data: {
        workspaceId: wsL2GR.id,
        name: 'Wealth Freedom Blueprint 2026',
        objective: 'ENGAGEMENT',
        briefJson: JSON.stringify({
          focus: 'Daily financial mastery habits, high-income skill development, and mindset transformation',
          targetPlatforms: ['META_IG', 'META_FB', 'LINKEDIN', 'YOUTUBE'],
          cadence: '5 posts weekly'
        }),
        pillarsJson: JSON.stringify([
          'Wealth Mindset Secrets',
          'High-Income Skill Stacks',
          'Passive Income Architecture',
          'Daily Discipline & Execution'
        ]),
        startAt: now,
        endAt: new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
        status: 'ACTIVE',
        createdBy: adminUser.id
      }
    });
  }

  const l2grItems = [
    {
      workspaceId: wsL2GR.id,
      campaignId: l2grCampaign.id,
      platform: 'META_IG',
      format: 'CAROUSEL',
      caption: 'The math is simple: if you only rely on a single income stream, you are one step away from financial vulnerability. 📈\n\nHere are 5 financial habits that separate the 1% from everyone else:\n1. Pay yourself first before monthly expenses.\n2. Reinvest capital into cash-flowing assets.\n3. Master one high-income skill before seeking passive income.\n4. Avoid lifestyle inflation as income rises.\n5. Think in decades, execute in days.\n\nSave this post for later. Drop "GROW" in the comments and we will DM you the free Wealth Acceleration Roadmap! 🚀🔥',
      hashtagsJson: JSON.stringify(['#learn2growrich', '#WealthMindset', '#FinancialFreedom', '#InvestingTips', '#PassiveIncome', '#Entrepreneurship']),
      status: 'PUBLISHED',
      publishedAt: new Date(now.getTime() - 12 * 60 * 60 * 1000),
      platformPostId: 'l2gr_ig_post_1001',
      platformUrl: 'https://instagram.com/p/l2gr_ig_post_1001',
      metadataJson: JSON.stringify({ isDemo: true, likes: 388, comments: 42 })
    },
    {
      workspaceId: wsL2GR.id,
      campaignId: l2grCampaign.id,
      platform: 'LINKEDIN',
      format: 'TEXT',
      title: 'Why High Earners Still Go Broke: The Psychology of Wealth Preservation',
      caption: 'Income is NOT wealth. Wealth is what you keep, compound, and leverage.\n\nToo many professionals focus 100% on increasing salary without building an investment engine. In this guide, we break down how to convert active earned income into enduring equity.\n\nKey takeaway: When your money works harder than you do, freedom becomes inevitable.\n\nWhat is your primary investment vehicle this year? Let us discuss below.',
      hashtagsJson: JSON.stringify(['#WealthCreation', '#PersonalFinance', '#FinancialLiteracy', '#learn2growrich', '#CareerGrowth']),
      status: 'SCHEDULED',
      scheduledAt: new Date(now.getTime() + 8 * 60 * 60 * 1000),
      metadataJson: JSON.stringify({ isDemo: true })
    },
    {
      workspaceId: wsL2GR.id,
      campaignId: l2grCampaign.id,
      platform: 'YOUTUBE',
      format: 'VIDEO',
      title: 'The $10K/Month Skill Stack: How Anyone Can Start in 2026',
      caption: 'Comprehensive roadmap breaking down the highest ROI skills to learn and monetize this year.',
      description: 'In this masterclass by learn2growrich, we explore the exact 4-step framework to master high-value digital skills and create sustainable cash flow.\n\nTimestamps:\n0:00 - The Wealth Mindset Shift\n02:30 - Identifying High-Demand Skills\n06:15 - Building Proof of Work\n10:45 - Scaling Beyond 1-on-1 Time\n\nVisit: https://learn2growrich.com\nEnroll in the Academy: https://learn2growrich.com/masterclass',
      tagsJson: JSON.stringify(['wealth building', 'learn2growrich', 'financial freedom', 'passive income', 'business growth', 'skill stack']),
      metadataJson: JSON.stringify({ categoryId: '27', madeForKids: false, visibility: 'PUBLIC', isDemo: true }),
      status: 'AWAITING_APPROVAL',
      scheduledAt: new Date(now.getTime() + 36 * 60 * 60 * 1000)
    },
    {
      workspaceId: wsL2GR.id,
      campaignId: l2grCampaign.id,
      platform: 'META_FB',
      format: 'IMAGE',
      caption: 'True financial freedom isn\'t about buying luxuries; it\'s about owning your time. What is one positive financial habit you are building this month? Tell the learn2growrich community below! 👇',
      hashtagsJson: JSON.stringify(['#MindsetShift', '#learn2growrich', '#DailyHabits', '#FinancialFreedom']),
      metadataJson: JSON.stringify({ isDemo: true }),
      status: 'DRAFT'
    }
  ];

  for (const item of l2grItems) {
    const existing = await prisma.contentItem.findFirst({
      where: { workspaceId: item.workspaceId, platform: item.platform, caption: item.caption }
    });
    if (!existing) {
      const createdItem = await prisma.contentItem.create({ data: item });
      if (item.status === 'PUBLISHED') {
        await prisma.platformMetric.createMany({
          data: [
            { contentItemId: createdItem.id, metricKey: 'IMPRESSIONS', metricValue: 5420, source: 'PLATFORM_API', definition: 'Times displayed on feed' },
            { contentItemId: createdItem.id, metricKey: 'REACH', metricValue: 4110, source: 'PLATFORM_API', definition: 'Unique accounts reached' },
            { contentItemId: createdItem.id, metricKey: 'LIKES', metricValue: 388, source: 'PLATFORM_API', definition: 'Post reactions' },
            { contentItemId: createdItem.id, metricKey: 'COMMENTS', metricValue: 42, source: 'PLATFORM_API', definition: 'Total comments' }
          ]
        });
      }
    }
  }

  // Notifications for both workspaces
  await prisma.notification.createMany({
    data: [
      {
        workspaceId: wsBranDive.id,
        userId: adminUser.id,
        type: 'APPROVAL_NEEDED',
        title: 'Review Needed: YouTube Video Concept',
        message: 'Content draft for "How BranDive SocialFlow AI Automates Multi-Platform Campaigns" is awaiting approval.',
        read: false
      },
      {
        workspaceId: wsBranDive.id,
        userId: adminUser.id,
        type: 'PUBLISH_SUCCESS',
        title: 'Post Published Successfully',
        message: 'Instagram post was published on schedule for BranDive Media Solutions.',
        read: true
      },
      {
        workspaceId: wsL2GR.id,
        userId: adminUser.id,
        type: 'APPROVAL_NEEDED',
        title: 'Client Review: $10K/Month Skill Stack Masterclass',
        message: 'YouTube video draft for learn2growrich is ready for your sign-off.',
        read: false
      },
      {
        workspaceId: wsL2GR.id,
        userId: adminUser.id,
        type: 'PUBLISH_SUCCESS',
        title: 'High Engagement Alert: 5 Financial Habits Carousel',
        message: 'learn2growrich Instagram post surpassed 5,400 impressions with 42 comments.',
        read: true
      }
    ]
  });

  console.log('🎉 Seed complete! Production Admin (admin@brandivemedsols.com) created with access to:');
  console.log(`   1. 🏢 BranDive Media Solutions (${wsBranDive.id}) [Agency, Premium Plan]`);
  console.log(`   2. 🚀 learn2growrich (${wsL2GR.id}) [Client, Diamond Plan]`);
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
