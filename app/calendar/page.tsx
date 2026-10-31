'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import {
  CalendarDays,
  List,
  Filter,
  CheckCircle,
  XCircle,
  Play,
  Clock,
  Sparkles,
  Edit3,
  ExternalLink,
  AlertCircle,
  Eye,
} from 'lucide-react';

export default function CalendarPage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [items, setItems] = useState<any[]>([]);
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [viewMode, setViewMode] = useState<'LIST' | 'GRID'>('LIST');
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [editCaption, setEditCaption] = useState('');
  const [editTitle, setEditTitle] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchCalendar = async () => {
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
        const url = `/api/v1/workspaces/${activeWs.id}/calendar?platform=${filterPlatform}&status=${filterStatus}`;
        const res = await fetch(url);
        const data = await res.json();
        setItems(data.items || []);

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendar();
  }, [filterPlatform, filterStatus]);

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/content/${id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: 'Approved via calendar review.' }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Post approved and queued for publishing!');
        setSelectedItem(null);
        await fetchCalendar();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt('Please enter rejection feedback for revision:');
    if (!reason) return;
    try {
      const res = await fetch(`/api/v1/content/${id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Post marked as rejected for revision.');
        setSelectedItem(null);
        await fetchCalendar();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePublishNow = async (id: string) => {
    try {
      const res = await fetch(`/api/v1/content/${id}/publish-now`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setActionNotice(`Successfully published to ${data.outcome.platformPostId}!`);
        setSelectedItem(null);
        await fetchCalendar();
      } else {
        alert(data.outcome?.error || 'Publishing error.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveEdits = async () => {
    if (!selectedItem) return;
    try {
      const res = await fetch(`/api/v1/content/${selectedItem.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: editCaption, title: editTitle }),
      });
      const data = await res.json();
      if (data.success) {
        setActionNotice('Post copy updated successfully. Status reset to review.');
        setSelectedItem(null);
        await fetchCalendar();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openItemModal = (item: any) => {
    setSelectedItem(item);
    setEditCaption(item.caption);
    setEditTitle(item.title || '');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="bms-badge badge-published">PUBLISHED</span>;
      case 'SCHEDULED':
        return <span className="bms-badge badge-scheduled">SCHEDULED</span>;
      case 'AWAITING_APPROVAL':
        return <span className="bms-badge badge-approval">AWAITING APPROVAL</span>;
      case 'FAILED':
        return <span className="bms-badge badge-failed">FAILED</span>;
      default:
        return <span className="bms-badge badge-draft">DRAFT</span>;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchCalendar();
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          currentWorkspace={workspace}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <main style={{ padding: '28px 32px', flex: 1, maxWidth: '1440px', margin: '0 auto', width: '100%' }}>
          {actionNotice && (
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
              <CheckCircle size={16} color="#10B981" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* Page Title & View Controls */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
                Content Calendar & Schedule
              </h1>
              <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Review, approve, and orchestrate publishing across all connected channels.
              </p>
            </div>

            {/* Filter Bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <select
                value={filterPlatform}
                onChange={(e) => setFilterPlatform(e.target.value)}
                className="bms-select"
                style={{ width: '160px', padding: '7px 12px', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Platforms</option>
                <option value="META_IG">Instagram</option>
                <option value="META_FB">Facebook</option>
                <option value="LINKEDIN">LinkedIn</option>
                <option value="YOUTUBE">YouTube</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bms-select"
                style={{ width: '170px', padding: '7px 12px', fontSize: '0.8rem' }}
              >
                <option value="ALL">All Statuses</option>
                <option value="AWAITING_APPROVAL">Awaiting Approval</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="FAILED">Failed</option>
              </select>

              <div style={{ display: 'flex', backgroundColor: 'var(--card)', borderRadius: '8px', border: '1px solid var(--border)', padding: '2px' }}>
                <button
                  onClick={() => setViewMode('LIST')}
                  style={{
                    background: viewMode === 'LIST' ? 'var(--brandive-blue)' : 'transparent',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  title="List view"
                >
                  <List size={16} />
                </button>
                <button
                  onClick={() => setViewMode('GRID')}
                  style={{
                    background: viewMode === 'GRID' ? 'var(--brandive-blue)' : 'transparent',
                    color: '#FFFFFF',
                    border: 'none',
                    padding: '6px 10px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                  }}
                  title="Grid view"
                >
                  <CalendarDays size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* Items Container */}
          {items.length === 0 ? (
            <div className="bms-card" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <CalendarDays size={42} style={{ margin: '0 auto 14px auto', opacity: 0.4 }} />
              <div style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                No posts found matching the selected filters.
              </div>
            </div>
          ) : viewMode === 'LIST' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((item) => (
                <div
                  key={item.id}
                  className="bms-card"
                  style={{
                    padding: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '20px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(14, 136, 211, 0.15)',
                        border: '1px solid var(--border-brand)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: 'var(--brandive-blue)',
                        flexShrink: 0,
                      }}
                    >
                      {item.platform.replace('META_', '')}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        {getStatusBadge(item.status)}
                        {item.socialAccount?.isDemo && <span className="bms-badge badge-demo">DEMO MODE</span>}
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                          {item.scheduledAt
                            ? new Date(item.scheduledAt).toLocaleString([], {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Unscheduled'}
                        </span>
                        {item.metadata?.confidence && (
                          <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            Confidence: {item.metadata.confidence}
                          </span>
                        )}
                      </div>

                      {item.title && (
                        <div style={{ fontSize: '0.92rem', fontWeight: 600, color: '#FFFFFF', marginTop: '6px' }}>
                          {item.title}
                        </div>
                      )}

                      <div
                        style={{
                          fontSize: '0.84rem',
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          maxWidth: '680px',
                        }}
                      >
                        {item.caption}
                      </div>

                      {item.hashtags.length > 0 && (
                        <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                          {item.hashtags.slice(0, 4).map((tag: string) => (
                            <span key={tag} style={{ fontSize: '0.7rem', color: 'var(--brandive-blue)' }}>
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                    <button
                      onClick={() => openItemModal(item)}
                      className="bms-btn-secondary"
                      style={{ padding: '7px 12px', fontSize: '0.78rem' }}
                    >
                      <Eye size={13} />
                      <span>Review / Edit</span>
                    </button>

                    {item.status === 'AWAITING_APPROVAL' && (
                      <button
                        onClick={() => handleApprove(item.id)}
                        className="bms-btn-primary"
                        style={{ padding: '7px 12px', fontSize: '0.78rem' }}
                      >
                        <CheckCircle size={13} />
                        <span>Approve</span>
                      </button>
                    )}

                    {item.status !== 'PUBLISHED' && (
                      <button
                        onClick={() => handlePublishNow(item.id)}
                        className="bms-btn-secondary"
                        style={{ padding: '7px 12px', fontSize: '0.78rem', color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.4)' }}
                        title="Publish immediately"
                      >
                        <Play size={13} />
                        <span>Publish Now</span>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Grid View */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {items.map((item) => (
                <div key={item.id} className="bms-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--brandive-blue)' }}>
                      {item.platform}
                    </span>
                    {getStatusBadge(item.status)}
                  </div>

                  {item.title && (
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
                      {item.title}
                    </div>
                  )}

                  <div
                    style={{
                      fontSize: '0.82rem',
                      color: 'var(--text-secondary)',
                      flex: 1,
                      lineHeight: 1.5,
                      marginBottom: '14px',
                      display: '-webkit-box',
                      WebkitLineClamp: 4,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {item.caption}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Scheduled: {item.scheduledAt ? new Date(item.scheduledAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Draft'}
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => openItemModal(item)} className="bms-btn-secondary" style={{ flex: 1, padding: '6px', fontSize: '0.75rem' }}>
                      Inspect
                    </button>
                    {item.status === 'AWAITING_APPROVAL' && (
                      <button onClick={() => handleApprove(item.id)} className="bms-btn-primary" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Post Review & Editor Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(6px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="bms-card"
            style={{
              width: '100%',
              maxWidth: '680px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Post Review & Platform Preview
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--brandive-blue)', fontWeight: 600 }}>
                    {selectedItem.platform}
                  </span>
                  {getStatusBadge(selectedItem.status)}
                </div>
              </div>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* Editable Content */}
            {selectedItem.title !== null && (
              <div style={{ marginBottom: '16px' }}>
                <label className="bms-label">Title / Headline</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="bms-input"
                />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="bms-label">Caption / Primary Copy</label>
              <textarea
                rows={6}
                value={editCaption}
                onChange={(e) => setEditCaption(e.target.value)}
                className="bms-textarea"
              />
            </div>

            {selectedItem.description && (
              <div style={{ marginBottom: '16px' }}>
                <label className="bms-label">Description (YouTube timestamps & links)</label>
                <textarea
                  rows={4}
                  value={selectedItem.description}
                  readOnly
                  className="bms-textarea"
                  style={{ opacity: 0.8 }}
                />
              </div>
            )}

            {/* Rationale and AI metadata */}
            {selectedItem.metadata?.bestTimeReason && (
              <div
                style={{
                  backgroundColor: 'rgba(14, 136, 211, 0.08)',
                  border: '1px solid var(--border-brand)',
                  borderRadius: '8px',
                  padding: '12px 14px',
                  marginBottom: '20px',
                  fontSize: '0.78rem',
                  color: 'var(--text-secondary)',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--brandive-blue)' }}>AI Best-Time Recommendation</div>
                <div style={{ marginTop: '2px' }}>{selectedItem.metadata.bestTimeReason}</div>
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '10px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                {selectedItem.status === 'AWAITING_APPROVAL' && (
                  <button onClick={() => handleApprove(selectedItem.id)} className="bms-btn-primary">
                    <CheckCircle size={15} />
                    <span>Approve Post</span>
                  </button>
                )}
                {selectedItem.status !== 'REJECTED' && selectedItem.status !== 'PUBLISHED' && (
                  <button onClick={() => handleReject(selectedItem.id)} className="bms-btn-secondary" style={{ color: '#EF4444' }}>
                    <XCircle size={15} />
                    <span>Reject</span>
                  </button>
                )}
                {selectedItem.status !== 'PUBLISHED' && (
                  <button onClick={() => handlePublishNow(selectedItem.id)} className="bms-btn-secondary" style={{ color: '#10B981', borderColor: 'rgba(16, 185, 129, 0.4)' }}>
                    <Play size={15} />
                    <span>Publish Now</span>
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setSelectedItem(null)} className="bms-btn-secondary">
                  Cancel
                </button>
                <button onClick={handleSaveEdits} className="bms-btn-primary">
                  Save Copy Edits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />
    </div>
  );
}
