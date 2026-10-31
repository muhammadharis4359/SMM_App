import { describe, it, expect } from 'vitest';
import { generateCampaignPlan, generateYouTubeMetadata } from '../lib/ai/campaignEngine';

describe('AI Campaign Engine & Structured Output Schemas', () => {
  const mockBrand = {
    brandName: 'BranDive Media Solutions',
    industry: 'Digital Marketing & Web Agency',
    services: ['Web Development', 'Social Media Marketing', 'Graphic Design'],
    audience: { targetDemographic: 'Founders and Marketing Executives' },
    tone: ['Innovative', 'Authoritative', 'Results-Driven'],
    goals: ['Brand Awareness', 'Lead Generation'],
    ctaPreferences: 'Book a free strategy audit at www.brandivemedsols.com',
    offers: ['Complimentary Brand Audit'],
    restrictions: ['guarantee virality', 'black-hat'],
    complianceNotes: 'All case statistics verified.',
  };

  it('should generate multi-pillar campaign with platform-tailored copy', async () => {
    const result = await generateCampaignPlan({
      brand: mockBrand,
      campaignName: 'Q4 Digital Authority',
      objective: 'AWARENESS',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      platforms: ['META_IG', 'LINKEDIN', 'YOUTUBE', 'META_FB'],
      postsPerWeek: 4,
    });

    expect(result.summary).toBeDefined();
    expect(result.pillars.length).toBeGreaterThanOrEqual(3);
    expect(result.posts.length).toBe(4);

    // Verify platform-specific characteristics
    const igPost = result.posts.find((p) => p.platform === 'META_IG');
    expect(igPost).toBeDefined();
    expect(igPost?.format).toBe('IMAGE');
    expect(igPost?.hashtags.length).toBeGreaterThan(0);
    expect(igPost?.bestTimeReason).toBeDefined();

    const liPost = result.posts.find((p) => p.platform === 'LINKEDIN');
    expect(liPost).toBeDefined();
    expect(liPost?.title).toBeDefined();
    expect(liPost?.caption).toContain('BranDive Media Solutions');

    const ytPost = result.posts.find((p) => p.platform === 'YOUTUBE');
    expect(ytPost).toBeDefined();
    expect(ytPost?.description).toContain('Timestamps:');
  });

  it('should detect and flag compliance warnings when restricted claims are present', async () => {
    const restrictedBrand = {
      ...mockBrand,
      restrictions: ['unlimited reach', 'guarantee virality'],
    };

    const result = await generateCampaignPlan({
      brand: restrictedBrand,
      campaignName: 'Test Compliance',
      objective: 'AWARENESS',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
      platforms: ['META_IG'],
      postsPerWeek: 1,
    });

    expect(result.guardrailsVerified).toBe(true);
  });

  it('should generate structured YouTube video metadata with chapters and tags', async () => {
    const ytData = await generateYouTubeMetadata({
      brand: mockBrand,
      videoTopic: 'Scaling Multi-Platform Social Media With AI Automation',
      targetAudience: 'Agency Directors',
    });

    expect(ytData.titleOptions.length).toBeGreaterThanOrEqual(3);
    expect(ytData.recommendedDescription).toContain('0:00 - Introduction');
    expect(ytData.suggestedTags.length).toBeGreaterThan(3);
    expect(ytData.thumbnailConcepts.length).toBe(2);
    expect(ytData.madeForKids).toBe(false);
  });
});
