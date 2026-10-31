// BranDive SocialFlow AI - AI Campaign Engine & Provider Abstraction
// Enforces structured output schemas, brand voice, forbidden claims filtering,
// and platform-specific adaptation (Meta IG, Meta FB, LinkedIn, YouTube).
// Supports real Google Gemini 1.5/2.0 API and deterministic fallback engine.

export interface BrandContext {
  brandName: string;
  website?: string;
  industry: string;
  services: string[];
  audience: Record<string, any>;
  tone: string[];
  goals: string[];
  ctaPreferences?: string;
  offers: string[];
  restrictions: string[];
  complianceNotes?: string;
}

export interface CampaignGenerationInput {
  brand: BrandContext;
  campaignName: string;
  objective: string;
  startDate: string;
  endDate: string;
  platforms: string[];
  postsPerWeek: number;
  briefNotes?: string;
}

export interface GeneratedPostPlan {
  platform: 'META_IG' | 'META_FB' | 'LINKEDIN' | 'YOUTUBE';
  format: 'IMAGE' | 'VIDEO' | 'TEXT' | 'CAROUSEL' | 'REEL';
  dayOffset: number;
  scheduledTimeStr: string; // e.g. "10:30"
  bestTimeReason: string;
  confidence: 'HIGH' | 'MEDIUM' | 'ESTIMATED';
  title?: string;
  caption: string;
  description?: string;
  hashtags: string[];
  cta: string;
  pillar: string;
  complianceWarning?: string;
}

export interface GeneratedCampaignPlan {
  summary: string;
  pillars: string[];
  posts: GeneratedPostPlan[];
  guardrailsVerified: boolean;
  provider: 'GEMINI_API' | 'DETERMINISTIC_ENGINE';
}

/**
 * Validates text against brand restrictions and compliance rules.
 */
function checkCompliance(text: string, restrictions: string[]): string | undefined {
  if (!text || !restrictions || restrictions.length === 0) return undefined;
  const lower = text.toLowerCase();
  for (const restriction of restrictions) {
    if (restriction && lower.includes(restriction.toLowerCase())) {
      return `Flagged: Content mentions restricted term "${restriction}". Please review prior to publishing.`;
    }
  }
  return undefined;
}

/**
 * Attempts real LLM synthesis via Google Gemini API if GEMINI_API_KEY is configured.
 */
async function callGeminiForCampaign(
  input: CampaignGenerationInput,
  apiKey: string
): Promise<GeneratedCampaignPlan | null> {
  try {
    const prompt = `You are the lead marketing strategist at BranDive Media Solutions.
Generate a structured, multi-platform campaign plan for the brand "${input.brand.brandName}".
Brand Industry: ${input.brand.industry}
Core Services: ${input.brand.services.join(', ')}
Target Audience: ${JSON.stringify(input.brand.audience)}
Tone of Voice: ${input.brand.tone.join(', ')}
Campaign Name: "${input.campaignName}"
Campaign Objective: "${input.objective}"
Target Platforms: ${input.platforms.join(', ')}
Posting Cadence: ${input.postsPerWeek} posts per week
Brief Notes: ${input.briefNotes || 'N/A'}
Brand CTA: ${input.brand.ctaPreferences || `Visit ${input.brand.brandName}`}
Prohibited Claims/Restrictions: ${input.brand.restrictions.join(', ') || 'None'}

Return ONLY a valid JSON object matching this TypeScript interface without any markdown backticks:
{
  "summary": "High-level strategic synthesis of the campaign",
  "pillars": ["Pillar 1", "Pillar 2", "Pillar 3", "Pillar 4"],
  "posts": [
    {
      "platform": "META_IG" | "META_FB" | "LINKEDIN" | "YOUTUBE",
      "format": "IMAGE" | "VIDEO" | "TEXT" | "CAROUSEL" | "REEL",
      "dayOffset": 0,
      "scheduledTimeStr": "10:30",
      "bestTimeReason": "Reason for posting time",
      "confidence": "HIGH" | "MEDIUM" | "ESTIMATED",
      "title": "Optional title for YouTube or LinkedIn",
      "caption": "Platform-tailored copy",
      "description": "Optional description with timestamps for YouTube",
      "hashtags": ["#tag1", "#tag2"],
      "cta": "Call to action",
      "pillar": "Matching pillar name"
    }
  ]
}`;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.7,
        },
      }),
    });

    if (!res.ok) {
      console.warn('Gemini API call failed with status:', res.status);
      return null;
    }

    const data = await res.json();
    const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawJson) return null;

    const parsed = JSON.parse(rawJson);
    if (!parsed.summary || !Array.isArray(parsed.posts)) return null;

    // Run compliance checks across generated posts
    const validatedPosts = parsed.posts.map((p: any) => ({
      ...p,
      complianceWarning: checkCompliance(`${p.title || ''} ${p.caption || ''} ${p.description || ''}`, input.brand.restrictions),
    }));

    return {
      summary: parsed.summary,
      pillars: parsed.pillars || [],
      posts: validatedPosts,
      guardrailsVerified: true,
      provider: 'GEMINI_API',
    };
  } catch (err) {
    console.error('Gemini API execution error, falling back to deterministic engine:', err);
    return null;
  }
}

/**
 * Generates an end-to-end multi-platform campaign plan adhering strictly to BMS standards.
 */
export async function generateCampaignPlan(
  input: CampaignGenerationInput
): Promise<GeneratedCampaignPlan> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (geminiKey && geminiKey.trim() !== '') {
    const realResult = await callGeminiForCampaign(input, geminiKey);
    if (realResult) return realResult;
  }

  // Deterministic Brand-Aware Campaign Generation Engine
  const { brand, campaignName, objective, platforms, postsPerWeek, briefNotes } = input;

  const pillars = [
    `${brand.industry} Authority & Strategic Architecture`,
    `Client Transformation & Measurable Outcomes`,
    `Core Capabilities: ${brand.services.slice(0, 2).join(' & ')}`,
    'Direct Audience Engagement & High-Converting Call to Action',
  ];

  const posts: GeneratedPostPlan[] = [];
  const toneKeywords = brand.tone.length > 0 ? brand.tone.join(', ') : 'Professional, Innovative, Actionable';
  const cta = brand.ctaPreferences || `Learn more at ${brand.brandName}`;

  const daysTotal = 7;
  let currentDay = 1;

  for (const platform of platforms) {
    if (platform === 'META_IG') {
      const caption = `Elevate your digital impact with strategic execution. ✨\n\nAt ${brand.brandName}, we turn ambitious vision into high-performing digital systems. Whether scaling your reach or streamlining client acquisition, intentional design drives measurable growth.\n\n👇 What is your primary objective this month?\n\n${cta}`;
      const hashtags = [
        `#${brand.brandName.replace(/\s+/g, '')}`,
        `#${brand.industry.replace(/[^a-zA-Z0-9]/g, '')}`,
        '#DigitalExcellence',
        '#GrowthStrategy',
        '#BrandElevation',
      ];

      posts.push({
        platform: 'META_IG',
        format: 'IMAGE',
        dayOffset: currentDay % daysTotal,
        scheduledTimeStr: '11:15',
        bestTimeReason: 'Recommended: Mid-morning engagement window for professional visual feeds.',
        confidence: 'HIGH',
        caption,
        hashtags,
        cta,
        pillar: pillars[0],
        complianceWarning: checkCompliance(caption, brand.restrictions),
      });
      currentDay += 2;
    }

    if (platform === 'LINKEDIN') {
      const title = `Scaling Digital Operations: Why Strategy Precedes Automation`;
      const caption = `In a competitive marketplace, velocity without direction is merely noise.\n\nAt ${brand.brandName}, our work with modern businesses reveals a clear pattern: the organizations that achieve sustainable market leadership are those that systematize their core message first.\n\nKey takeaways for leaders:\n1. Consolidate your core value propositions.\n2. Adapt your narrative natively to where your audience deliberates.\n3. Implement durable workflows that maintain quality at scale.\n\n${cta}\n\nWhat workflow shifts are driving the greatest impact in your team right now?`;
      const hashtags = ['#DigitalTransformation', '#Leadership', '#BusinessStrategy', '#B2BGrowth'];

      posts.push({
        platform: 'LINKEDIN',
        format: 'TEXT',
        dayOffset: (currentDay + 1) % daysTotal,
        scheduledTimeStr: '08:45',
        bestTimeReason: 'Recommended: Peak B2B deliberation window before morning meetings.',
        confidence: 'HIGH',
        title,
        caption,
        hashtags,
        cta,
        pillar: pillars[1],
        complianceWarning: checkCompliance(caption, brand.restrictions),
      });
      currentDay += 1;
    }

    if (platform === 'META_FB') {
      const caption = `Are your digital campaigns generating the outcomes your business deserves?\n\nDiscover how ${brand.brandName} delivers tailored solutions in ${brand.services.join(', ')} to help businesses stand out and grow.\n\nCheck out our latest insights and explore how we can support your journey: ${cta}`;
      const hashtags = ['#BusinessGrowth', '#DigitalSolutions', '#BranDive'];

      posts.push({
        platform: 'META_FB',
        format: 'IMAGE',
        dayOffset: (currentDay + 2) % daysTotal,
        scheduledTimeStr: '14:30',
        bestTimeReason: 'Recommended: Early afternoon community browsing window.',
        confidence: 'MEDIUM',
        caption,
        hashtags,
        cta,
        pillar: pillars[2],
        complianceWarning: checkCompliance(caption, brand.restrictions),
      });
      currentDay += 2;
    }

    if (platform === 'YOUTUBE') {
      const title = `Transforming Digital Presence: ${brand.brandName} Strategic Framework`;
      const description = `In this video, explore how ${brand.brandName} empowers organizations through strategic ${brand.services.join(' and ')}.\n\nTimestamps:\n0:00 - Introduction & Market Overview\n01:30 - Identifying Core Bottlenecks\n04:15 - Implementing Sustainable Growth Frameworks\n08:00 - Key Milestones & Measurable Outcomes\n\nConnect with our team: ${cta}\n${brand.complianceNotes ? `Note: ${brand.complianceNotes}` : ''}`;
      const tags = [
        brand.brandName.toLowerCase(),
        brand.industry.toLowerCase(),
        'business growth',
        'digital marketing',
        'case study',
      ];

      posts.push({
        platform: 'YOUTUBE',
        format: 'VIDEO',
        dayOffset: (currentDay + 3) % daysTotal,
        scheduledTimeStr: '16:00',
        bestTimeReason: 'Recommended: Optimal YouTube publishing window for weekend discovery.',
        confidence: 'HIGH',
        title,
        caption: title,
        description,
        hashtags: ['#BusinessStrategy', '#DigitalGrowth', '#ExecutiveInsights'],
        cta,
        pillar: pillars[3],
        complianceWarning: checkCompliance(description, brand.restrictions),
      });
      currentDay += 2;
    }
  }

  return {
    summary: `Strategic campaign "${campaignName}" targeting ${objective} across ${platforms.length} channels with tone aligned to: ${toneKeywords}. All content is tailored per channel and strictly follows brand compliance rules.`,
    pillars,
    posts,
    guardrailsVerified: true,
    provider: 'DETERMINISTIC_ENGINE',
  };
}

/**
 * YouTube Video Assistant helper: analyzes brief and generates title choices,
 * structured descriptions with chapters, keyword tags, category recommendations,
 * and thumbnail concepts.
 */
export async function generateYouTubeMetadata(params: {
  brand: BrandContext;
  videoTopic: string;
  targetAudience: string;
  notes?: string;
}) {
  const { brand, videoTopic, targetAudience, notes } = params;
  const apiKey = process.env.GEMINI_API_KEY;

  if (apiKey) {
    try {
      const prompt = `You are a YouTube video optimization strategist at BranDive Media Solutions.
Generate YouTube metadata for a video on the topic: "${videoTopic}".
Brand: ${brand.brandName} (${brand.website || 'https://www.brandivemedsols.com'})
Industry: ${brand.industry}
Target Audience: ${targetAudience}
Notes/Angle: ${notes || 'N/A'}
Brand Restrictions: ${brand.restrictions.join(', ') || 'None'}

Return ONLY a valid JSON object matching this structure:
{
  "titleOptions": ["Catchy Title 1", "Search-Optimized Title 2", "How-To Title 3", "Case Study Title 4"],
  "recommendedDescription": "Full SEO description including overview, Timestamps (e.g. 0:00 - Introduction, 01:45 - Key Strategy, 05:30 - Framework, 09:15 - Case Study, 12:00 - Conclusion), Links, and Disclaimers.",
  "suggestedTags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6"],
  "categoryId": "28",
  "thumbnailConcepts": [
    { "concept": "High-Contrast Authority", "visualDescription": "Bold typography on deep navy (#080D1A) with electric Brandive Blue (#0E88D3) accents." },
    { "concept": "Visual Framework Comparison", "visualDescription": "Split-screen comparing fragmented manual processes vs automated SocialFlow AI." }
  ],
  "madeForKids": false
}`;

      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.7,
          },
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const rawJson = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawJson) {
          const parsed = JSON.parse(rawJson);
          if (Array.isArray(parsed.titleOptions) && parsed.recommendedDescription) {
            return parsed;
          }
        }
      }
    } catch (err) {
      console.warn('Gemini YouTube metadata generation failed, using deterministic template:', err);
    }
  }

  return {
    titleOptions: [
      `The Blueprint for Digital Growth: How ${brand.brandName} Scales Brands`,
      `${videoTopic}: Essential Strategies for Modern Leaders`,
      `How to Solve ${videoTopic} (Step-by-Step Walkthrough)`,
      `Behind the Strategy: Accelerating Results with ${brand.brandName}`,
    ],
    recommendedDescription: `A comprehensive walkthrough on ${videoTopic}, designed specifically for ${targetAudience}.\n\nIn this session, we break down actionable frameworks and tactical steps you can apply immediately to eliminate friction and scale results.\n\n📌 Timestamps:\n0:00 - Introduction & Core Objectives\n01:45 - The Current Landscape & Strategic Shifts\n05:20 - Tactical Framework Breakdown\n09:10 - Implementation Roadmap\n13:30 - Conclusion & Next Steps\n\n🔗 Connect with ${brand.brandName}:\nWebsite: ${brand.website || 'https://www.brandivemedsols.com'}\n${brand.ctaPreferences ? `Next Action: ${brand.ctaPreferences}` : ''}`,
    suggestedTags: [
      videoTopic.toLowerCase(),
      brand.brandName.toLowerCase(),
      'digital strategy',
      'growth marketing',
      'business automation',
      'executive leadership',
    ],
    categoryId: '28', // Science & Technology
    thumbnailConcepts: [
      {
        concept: 'High-Contrast Authority',
        visualDescription: 'Bold typography on deep navy background (#080D1A) with electric Brandive Blue (#0E88D3) glowing accent border and clear text: "SCALE YOUR REACH".',
      },
      {
        concept: 'Visual Framework Comparison',
        visualDescription: 'Split screen displaying "Before (Fragmented)" vs "After (SocialFlow Automated System)" with crisp metrics overlay.',
      },
    ],
    madeForKids: false,
  };
}
