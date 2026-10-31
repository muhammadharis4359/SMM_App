'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { Sparkles, Calendar, Layers, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function CampaignsStudioPage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [campaignName, setCampaignName] = useState('Fall Brand Authority Sprint');
  const [objective, setObjective] = useState('AWARENESS');
  const [platforms, setPlatforms] = useState<string[]>(['META_IG', 'LINKEDIN', 'YOUTUBE']);
  const [postsPerWeek, setPostsPerWeek] = useState(4);
  const [notes, setNotes] = useState('Focus on digital transformation, client acquisition systems, and BMS agency capabilities.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedResult, setGeneratedResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchCampaigns = async () => {
    try {
      const meRes = await fetch('/api/v1/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      const meData = await meRes.json();
      const activeWs = meData.workspaces[0];
      if (activeWs) {
        setWorkspace(activeWs);
        const res = await fetch(`/api/v1/workspaces/${activeWs.id}/campaigns`);
        const data = await res.json();
        setCampaigns(data.campaigns || []);

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handlePlatformToggle = (platform: string) => {
    setPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.id) return;
    setIsGenerating(true);
    setError('');
    setGeneratedResult(null);

    try {
      const res = await fetch(`/api/v1/workspaces/${workspace.id}/campaigns/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignName,
          objective,
          platforms,
          postsPerWeek,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Campaign generation failed.');
      }

      setGeneratedResult(data);
      await fetchCampaigns();
    } catch (err: any) {
      setError(err.message || 'Error running AI Campaign generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchCampaigns();
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          currentWorkspace={workspace}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <main style={{ padding: '28px 32px', flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
              AI Campaign Planner & Strategy Studio
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              One brief powers a multi-pillar campaign with platform-adapted creative concepts and posting windows.
            </p>
          </div>

          {error && (
            <div
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.15)',
                border: '1px solid #EF4444',
                color: '#EF4444',
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: '22px',
                fontSize: '0.85rem',
              }}
            >
              {error}
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.8fr', gap: '28px' }}>
            {/* Left: Campaign Brief Input Form */}
            <div className="bms-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Sparkles size={18} color="var(--brandive-blue)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Campaign Brief & Parameters
                </h2>
              </div>

              <form onSubmit={handleGenerate}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="bms-label">Campaign Name</label>
                  <input
                    type="text"
                    value={campaignName}
                    onChange={(e) => setCampaignName(e.target.value)}
                    className="bms-input"
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="bms-label">Campaign Objective</label>
                  <select
                    value={objective}
                    onChange={(e) => setObjective(e.target.value)}
                    className="bms-select"
                  >
                    <option value="AWARENESS">Brand Awareness & Digital Authority</option>
                    <option value="LEADS">Lead Generation & Consultations</option>
                    <option value="PRODUCT_LAUNCH">Product or Service Launch</option>
                    <option value="ENGAGEMENT">Audience Engagement & Community</option>
                    <option value="RECRUITMENT">Talent Recruitment</option>
                  </select>
                </div>

                {/* Platform Selection */}
                <div style={{ marginBottom: '18px' }}>
                  <label className="bms-label">Target Channels</label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    {[
                      { key: 'META_IG', label: 'Instagram' },
                      { key: 'META_FB', label: 'Facebook' },
                      { key: 'LINKEDIN', label: 'LinkedIn' },
                      { key: 'YOUTUBE', label: 'YouTube' },
                    ].map((p) => {
                      const isSelected = platforms.includes(p.key);
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => handlePlatformToggle(p.key)}
                          style={{
                            padding: '9px 12px',
                            borderRadius: '8px',
                            border: `1px solid ${isSelected ? 'var(--brandive-blue)' : 'var(--border)'}`,
                            backgroundColor: isSelected ? 'rgba(14, 136, 211, 0.15)' : 'rgba(8, 13, 26, 0.6)',
                            color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                            fontSize: '0.82rem',
                            fontWeight: isSelected ? 600 : 400,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            transition: 'all 0.15s ease',
                          }}
                        >
                          <span>{p.label}</span>
                          {isSelected && <CheckCircle2 size={14} color="var(--brandive-blue)" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ marginBottom: '18px' }}>
                  <label className="bms-label">Posting Cadence (posts / week)</label>
                  <input
                    type="number"
                    min={1}
                    max={14}
                    value={postsPerWeek}
                    onChange={(e) => setPostsPerWeek(Number(e.target.value))}
                    className="bms-input"
                  />
                </div>

                <div style={{ marginBottom: '22px' }}>
                  <label className="bms-label">Brief Notes & Key Focus</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Specific value propositions, key talking points, or offers..."
                    className="bms-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating || platforms.length === 0}
                  className="bms-btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <Sparkles size={16} />
                  <span>{isGenerating ? 'Synthesizing Campaign Plan...' : 'Generate AI Campaign Plan'}</span>
                </button>
              </form>
            </div>

            {/* Right: Output or Active Campaigns */}
            <div>
              {generatedResult ? (
                <div className="bms-card" style={{ padding: '26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CheckCircle2 size={18} color="#10B981" />
                      <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
                        Generated Campaign Plan
                      </h2>
                    </div>
                    <Link href="/calendar" className="bms-btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>
                      <span>View in Calendar</span>
                      <ArrowRight size={14} />
                    </Link>
                  </div>

                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px', lineHeight: 1.6 }}>
                    {generatedResult.summary}
                  </p>

                  <div style={{ marginBottom: '20px' }}>
                    <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                      Identified Content Pillars:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {generatedResult.campaign.pillars.map((pillar: string, idx: number) => (
                        <span
                          key={idx}
                          style={{
                            backgroundColor: 'rgba(14, 136, 211, 0.15)',
                            border: '1px solid var(--border-brand)',
                            color: 'var(--brandive-blue)',
                            fontSize: '0.75rem',
                            padding: '4px 10px',
                            borderRadius: '6px',
                            fontWeight: 500,
                          }}
                        >
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '10px' }}>
                    Generated Posts Added to Calendar ({generatedResult.contentItems.length} posts):
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '360px', overflowY: 'auto' }}>
                    {generatedResult.contentItems.map((item: any) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '12px 14px',
                          backgroundColor: 'rgba(8, 13, 26, 0.6)',
                          border: '1px solid var(--border)',
                          borderRadius: '8px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--brandive-blue)' }}>
                            {item.platform}
                          </span>
                          <span className="bms-badge badge-approval">AWAITING APPROVAL</span>
                        </div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                          {item.title || item.caption.substring(0, 100)}...
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Existing Campaigns List */
                <div className="bms-card" style={{ padding: '26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                    <Layers size={18} color="var(--brandive-blue)" />
                    <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
                      Active Campaigns
                    </h2>
                  </div>

                  {campaigns.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
                      No campaigns created yet. Submit the brief to start planning!
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      {campaigns.map((c) => (
                        <div
                          key={c.id}
                          style={{
                            padding: '18px',
                            backgroundColor: 'rgba(8, 13, 26, 0.6)',
                            border: '1px solid var(--border)',
                            borderRadius: '10px',
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <div style={{ fontSize: '0.98rem', fontWeight: 600, color: '#FFFFFF' }}>
                              {c.name}
                            </div>
                            <span className="bms-badge badge-published">{c.status}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                            Objective: {c.objective} • Total Posts: {c.totalPosts}
                          </div>
                          <div style={{ display: 'flex', gap: '6px', marginTop: '10px', flexWrap: 'wrap' }}>
                            {c.pillars?.map((p: string, i: number) => (
                              <span
                                key={i}
                                style={{
                                  fontSize: '0.72rem',
                                  color: 'var(--text-muted)',
                                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                                  padding: '2px 8px',
                                  borderRadius: '4px',
                                }}
                              >
                                {p}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />
    </div>
  );
}
