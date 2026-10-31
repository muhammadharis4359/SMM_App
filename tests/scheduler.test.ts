import { describe, it, expect, beforeEach } from 'vitest';
import { SocialGateway } from '../lib/social/connectors';

describe('Durable Publisher & Social Platform Connectors', () => {
  it('should resolve correct connectors for supported platforms', () => {
    const metaConnector = SocialGateway.getConnector('META_IG');
    expect(metaConnector).toBeDefined();
    expect(metaConnector.platform).toBe('META');

    const liConnector = SocialGateway.getConnector('LINKEDIN');
    expect(liConnector).toBeDefined();
    expect(liConnector.platform).toBe('LINKEDIN');

    const ytConnector = SocialGateway.getConnector('YOUTUBE');
    expect(ytConnector).toBeDefined();
    expect(ytConnector.platform).toBe('YOUTUBE');
  });

  it('should enforce platform daily post limits and capabilities', () => {
    const metaCaps = SocialGateway.getConnector('META_IG').getCapabilities();
    expect(metaCaps.dailyPostLimit).toBe(25); // Meta Instagram 25 posts/24h rolling limit
    expect(metaCaps.publishPhoto).toBe(true);

    const liCaps = SocialGateway.getConnector('LINKEDIN').getCapabilities();
    expect(liCaps.dailyPostLimit).toBe(20);
    expect(liCaps.publishDocument).toBe(true);

    const ytCaps = SocialGateway.getConnector('YOUTUBE').getCapabilities();
    expect(ytCaps.dailyPostLimit).toBe(6); // Default 10k quota / 1600 units per upload = 6 videos
    expect(ytCaps.publishVideo).toBe(true);
    expect(ytCaps.publishPhoto).toBe(false);
  });

  it('should execute simulated publishing in Demo Mode with clear [DEMO MODE] flag and valid mock ID', async () => {
    const connector = SocialGateway.getConnector('META_IG');
    const result = await connector.publish(
      {
        id: 'test-item-1',
        workspaceId: 'ws-123',
        platform: 'META_IG',
        format: 'IMAGE',
        caption: 'Testing Demo Mode publishing in BranDive SocialFlow AI',
        hashtags: ['#Test'],
        mediaUrls: ['/logo.png'],
      },
      'fake_token',
      true // isDemo
    );

    expect(result.success).toBe(true);
    expect(result.isDemo).toBe(true);
    expect(result.platformPostId).toMatch(/^demo_meta_/);
    expect(result.platformUrl).toContain('instagram.com/p/demo_meta_');
  });
});
