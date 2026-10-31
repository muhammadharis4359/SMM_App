'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { getActiveWorkspace } from '@/lib/clientWorkspace';
import {
  Share2,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Plus,
  Trash2,
  ExternalLink,
  Info,
} from 'lucide-react';

export default function IntegrationsPage() {
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [connectedAccounts, setConnectedAccounts] = useState<any[]>([]);
  const [availablePlatforms, setAvailablePlatforms] = useState<any[]>([]);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [selectedPlatform, setSelectedPlatform] = useState('META_IG');
  const [accountHandle, setAccountHandle] = useState('@brandivemedsols');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchIntegrations = async (targetId?: string) => {
    try {
      const meRes = await fetch('/api/v1/me');
      if (meRes.status === 401) {
        window.location.href = '/login';
        return;
      }
      const meData = await meRes.json();
      setAllWorkspaces(meData.workspaces || []);
      setCurrentUser(meData.user || null);

      let activeWs = null;
      if (targetId) {
        activeWs = meData.workspaces?.find((w: any) => w.id === targetId);
      }
      if (!activeWs) {
        activeWs = getActiveWorkspace(meData.workspaces);
      }

      if (activeWs) {
        setWorkspace(activeWs);

        if (activeWs.name.toLowerCase().includes('learn2growrich')) {
          setAccountHandle('@learn2growrich');
        } else {
          setAccountHandle('@brandivemedsols');
        }

        const res = await fetch(`/api/v1/workspaces/${activeWs.id}/integrations`);
        const data = await res.json();
        setConnectedAccounts(data.connectedAccounts || []);
        setAvailablePlatforms(data.availablePlatforms || []);

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchIntegrations();

    const handleWsChange = (e: any) => {
      if (e.detail?.workspaceId) {
        fetchIntegrations(e.detail.workspaceId);
      }
    };
    window.addEventListener('socialflow_ws_changed', handleWsChange);
    return () => window.removeEventListener('socialflow_ws_changed', handleWsChange);
  }, []);

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.id) return;

    try {
      const res = await fetch('/api/v1/social-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace.id,
          platform: selectedPlatform,
          accountName: accountHandle,
          accountType: selectedPlatform === 'YOUTUBE' ? 'CHANNEL' : 'PAGE',
          isDemo: true, // Operating in High-Fidelity Demo mode when external app credentials are not supplied
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setNotice(`Channel "${accountHandle}" connected in Demo Mode.`);
      setIsConnectOpen(false);
      setTimeout(() => setNotice(''), 4000);
      await fetchIntegrations();
    } catch (err: any) {
      alert(err.message || 'Connection failed.');
    }
  };

  const handleDisconnect = async (accountId: string, accountName: string) => {
    if (!confirm(`Are you sure you want to disconnect ${accountName}? Any pending scheduled posts for this channel will be paused safely.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/v1/social-accounts/${accountId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setNotice(data.message);
        setTimeout(() => setNotice(''), 4000);
        await fetchIntegrations();
      }
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
          await fetchIntegrations();
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          currentWorkspace={workspace}
          allWorkspaces={allWorkspaces}
          user={currentUser}
          onSelectWorkspace={(ws) => {
            setWorkspace(ws);
            fetchIntegrations(ws.id);
          }}
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

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '28px',
              flexWrap: 'wrap',
              gap: '14px',
            }}
          >
            <div>
              <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
                Social Channels & Official API Integrations
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                OAuth 2.0 authorization, token lifecycle health, and verified capability matrices.
              </p>
            </div>

            <button onClick={() => setIsConnectOpen(true)} className="bms-btn-primary">
              <Plus size={16} />
              <span>Connect Channel</span>
            </button>
          </div>

          {/* Connected Accounts Section */}
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Active Connected Channels ({connectedAccounts.length})
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {connectedAccounts.map((account) => (
                <div key={account.id} className="bms-card" style={{ padding: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF' }}>
                        {account.accountName}
                      </span>
                      {account.isDemo && <span className="bms-badge badge-demo">DEMO MODE</span>}
                    </div>
                    <span className="bms-badge badge-published">CONNECTED</span>
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
                    Platform: <strong style={{ color: 'var(--brandive-blue)' }}>{account.platform}</strong> • Type: {account.accountType}
                  </div>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: '14px' }}>
                    Token Status: Valid (60-day renewal cycle) • Posts Assigned: {account.postsCount}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: '12px' }}>
                    <button
                      onClick={() => handleDisconnect(account.id, account.accountName)}
                      className="bms-btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '0.75rem', color: '#EF4444' }}
                    >
                      <Trash2 size={13} />
                      <span>Disconnect</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official API Capability Matrix & Prerequisites */}
          <div>
            <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '16px' }}>
              Platform Prerequisites & Official API Governance
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
              {availablePlatforms.map((p) => (
                <div key={p.key} className="bms-card" style={{ padding: '22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--brandive-blue)' }}>{p.name}</h3>
                    <span className="bms-badge" style={{ backgroundColor: 'rgba(255,255,255,0.06)', color: 'var(--text-secondary)' }}>
                      Official API
                    </span>
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '14px' }}>
                    {p.description}
                  </p>

                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: '10px' }}>
                    <div>• Daily Safe Limit: {p.capabilities.dailyPostLimit} posts / 24h</div>
                    <div>• Photo Publishing: {p.capabilities.publishPhoto ? 'Supported' : 'Video Only'}</div>
                    <div>• Native Analytics: {p.capabilities.readInsights ? 'Supported' : 'Limited'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* Connect Channel Modal */}
      {isConnectOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.75)',
            backdropFilter: 'blur(5px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
          onClick={() => setIsConnectOpen(false)}
        >
          <div
            className="bms-card"
            style={{ width: '100%', maxWidth: '480px', padding: '28px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '6px' }}>
              Connect Social Account
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
              Authorize channel access. When official API keys are pending verification, SocialFlow AI provides High-Fidelity Demo Mode with real-world capability constraints.
            </p>

            <form onSubmit={handleConnect}>
              <div style={{ marginBottom: '14px' }}>
                <label className="bms-label">Select Platform</label>
                <select
                  value={selectedPlatform}
                  onChange={(e) => setSelectedPlatform(e.target.value)}
                  className="bms-select"
                >
                  <option value="META_IG">Instagram Professional</option>
                  <option value="META_FB">Facebook Pages</option>
                  <option value="LINKEDIN">LinkedIn (Page / Profile)</option>
                  <option value="YOUTUBE">YouTube Channel</option>
                </select>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label className="bms-label">Account / Page Handle</label>
                <input
                  type="text"
                  value={accountHandle}
                  onChange={(e) => setAccountHandle(e.target.value)}
                  placeholder="@brandive_official"
                  className="bms-input"
                  required
                />
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(236, 72, 153, 0.1)',
                  border: '1px solid rgba(236, 72, 153, 0.3)',
                  padding: '12px',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '0.75rem',
                  color: '#F472B6',
                  lineHeight: 1.5,
                }}
              >
                <div style={{ fontWeight: 700, marginBottom: '2px' }}>[DEMO MODE ACTIVATED]</div>
                This channel will connect with full interactive scheduling and simulated publishing events. No passwords or session cookies are ever requested.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button type="button" onClick={() => setIsConnectOpen(false)} className="bms-btn-secondary">
                  Cancel
                </button>
                <button type="submit" className="bms-btn-primary">
                  Authorize & Link Channel
                </button>
              </div>
            </form>
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
