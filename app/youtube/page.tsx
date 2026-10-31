'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { Video, Sparkles, CheckCircle2, Clock, Image as ImageIcon, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getActiveWorkspace } from '@/lib/clientWorkspace';

export default function YouTubeStudioPage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [videoTopic, setVideoTopic] = useState('How Multi-Platform Campaign Automation Transforms Agencies');
  const [targetAudience, setTargetAudience] = useState('Founders, Marketing Leaders & Agency Owners');
  const [notes, setNotes] = useState('Highlight structured content pillars, brand voice compliance, and official API scheduling.');
  const [isGenerating, setIsGenerating] = useState(false);
  const [metadataResult, setMetadataResult] = useState<any>(null);
  const [selectedTitle, setSelectedTitle] = useState('');
  const [madeForKids, setMadeForKids] = useState(false);
  const [notice, setNotice] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchWorkspace = async () => {
    try {
      const meRes = await fetch('/api/v1/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      const meData = await meRes.json();
      const activeWs = getActiveWorkspace(meData.workspaces);
      if (activeWs) {
        setWorkspace(activeWs);

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchWorkspace();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.id) return;
    setIsGenerating(true);
    setMetadataResult(null);

    try {
      const res = await fetch('/api/v1/youtube/generate-metadata', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          videoTopic,
          targetAudience,
          notes,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMetadataResult(data.metadata);
      if (data.metadata?.titleOptions?.length > 0) {
        setSelectedTitle(data.metadata.titleOptions[0]);
      }
    } catch (err: any) {
      alert(err.message || 'Generation failed.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAddToCalendar = async () => {
    if (!workspace.id || !metadataResult) return;

    try {
      const scheduledTime = new Date(Date.now() + 48 * 60 * 60 * 1000); // 2 days in future
      const res = await fetch(`/api/v1/workspaces/${workspace.id}/calendar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform: 'YOUTUBE',
          format: 'VIDEO',
          title: selectedTitle,
          caption: selectedTitle,
          description: metadataResult.recommendedDescription,
          tags: metadataResult.suggestedTags,
          scheduledAt: scheduledTime.toISOString(),
          status: 'AWAITING_APPROVAL',
          metadata: {
            categoryId: metadataResult.categoryId,
            madeForKids,
            isDemo: true,
          },
        }),
      });

      setNotice('YouTube video post queued into Calendar awaiting approval!');
      setTimeout(() => setNotice(''), 4500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchWorkspace();
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          currentWorkspace={workspace}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <main style={{ padding: '28px 32px', flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {notice && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.85rem',
              }}
            >
              <CheckCircle2 size={16} color="#10B981" />
              <span>{notice}</span>
            </div>
          )}

          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
              YouTube Metadata Assistant & Publishing Studio
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              AI video synthesis: search-optimized titles, automated timestamped chapters, tags, thumbnail briefs, and compliance.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.6fr', gap: '28px' }}>
            {/* Input Form */}
            <div className="bms-card" style={{ padding: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <Video size={18} color="var(--brandive-blue)" />
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Video Subject & Brief
                </h2>
              </div>

              <form onSubmit={handleGenerate}>
                <div style={{ marginBottom: '16px' }}>
                  <label className="bms-label">Video Core Topic / Working Title</label>
                  <input
                    type="text"
                    value={videoTopic}
                    onChange={(e) => setVideoTopic(e.target.value)}
                    className="bms-input"
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="bms-label">Target Viewer Audience</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    className="bms-input"
                  />
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label className="bms-label">Specific Talking Points or Timestamps</label>
                  <textarea
                    rows={4}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="bms-textarea"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isGenerating}
                  className="bms-btn-primary"
                  style={{ width: '100%', padding: '12px' }}
                >
                  <Sparkles size={16} />
                  <span>{isGenerating ? 'Synthesizing Metadata...' : 'Generate YouTube Package'}</span>
                </button>
              </form>

              {/* YouTube Quota & Policy Notice */}
              <div
                style={{
                  marginTop: '24px',
                  padding: '14px',
                  backgroundColor: 'rgba(8, 13, 26, 0.6)',
                  border: '1px solid var(--border)',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                  YouTube API Quota Governance:
                </div>
                Standard YouTube Data API v3 projects have a daily quota of 10,000 units. Video upload operations consume 1,600 units per video (~6 uploads/day).
              </div>
            </div>

            {/* Generated Metadata Output */}
            <div>
              {metadataResult ? (
                <div className="bms-card" style={{ padding: '26px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <h2 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF' }}>
                      Optimized YouTube Package
                    </h2>
                    <span className="bms-badge badge-published">GENERATED</span>
                  </div>

                  {/* Title Options */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="bms-label">Recommended Title Options (Select Preferred):</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {metadataResult.titleOptions.map((t: string, idx: number) => {
                        const isSelected = selectedTitle === t;
                        return (
                          <div
                            key={idx}
                            onClick={() => setSelectedTitle(t)}
                            style={{
                              padding: '10px 14px',
                              borderRadius: '8px',
                              border: `1px solid ${isSelected ? 'var(--brandive-blue)' : 'var(--border)'}`,
                              backgroundColor: isSelected ? 'rgba(14, 136, 211, 0.15)' : 'rgba(8, 13, 26, 0.5)',
                              color: isSelected ? '#FFFFFF' : 'var(--text-secondary)',
                              fontSize: '0.84rem',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <span>{t}</span>
                            {isSelected && <CheckCircle2 size={16} color="var(--brandive-blue)" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Description with Chapters */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="bms-label">Optimized Description & Timestamped Chapters</label>
                    <textarea
                      rows={8}
                      value={metadataResult.recommendedDescription}
                      readOnly
                      className="bms-textarea"
                      style={{ fontSize: '0.8rem', lineHeight: 1.6 }}
                    />
                  </div>

                  {/* Tags */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="bms-label">Suggested Keyword Tags</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {metadataResult.suggestedTags.map((tag: string) => (
                        <span
                          key={tag}
                          style={{
                            fontSize: '0.72rem',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            padding: '3px 8px',
                            borderRadius: '4px',
                            color: 'var(--text-secondary)',
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Thumbnail Concepts */}
                  <div style={{ marginBottom: '20px' }}>
                    <label className="bms-label">Creative Thumbnail Concept Briefs</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      {metadataResult.thumbnailConcepts.map((concept: any, idx: number) => (
                        <div
                          key={idx}
                          style={{
                            padding: '12px',
                            backgroundColor: 'rgba(8, 13, 26, 0.6)',
                            border: '1px solid var(--border)',
                            borderRadius: '8px',
                          }}
                        >
                          <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--brandive-blue)' }}>
                            {concept.concept}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                            {concept.visualDescription}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* COPPA Compliance */}
                  <div
                    style={{
                      padding: '12px',
                      backgroundColor: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.25)',
                      borderRadius: '8px',
                      marginBottom: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                    }}
                  >
                    <input
                      type="checkbox"
                      id="kids"
                      checked={madeForKids}
                      onChange={(e) => setMadeForKids(e.target.checked)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <label htmlFor="kids" style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                      Mandatory COPPA Declaration: Is this video content explicitly "Made for Kids"? (Default: No)
                    </label>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                    <Link href="/calendar" className="bms-btn-secondary">
                      Go to Calendar
                    </Link>
                    <button onClick={handleAddToCalendar} className="bms-btn-primary">
                      Queue to Content Calendar
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  className="bms-card"
                  style={{
                    padding: '60px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <Video size={42} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
                  <div style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                    Fill out the video brief to synthesize title options, chapter timestamps, and tags.
                  </div>
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
