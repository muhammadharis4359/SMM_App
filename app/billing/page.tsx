'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export default function BillingPage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [usageStats, setUsageStats] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notice, setNotice] = useState('');

  const fetchUsage = async () => {
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

        const res = await fetch(`/api/v1/workspaces/${activeWs.id}/usage`);
        const data = await res.json();
        setUsageStats(data);

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: '$29',
      period: 'per month',
      description: 'Ideal for solo creators and small businesses building their online presence.',
      features: [
        '1 Workspace',
        'Up to 3 Connected Social Accounts',
        '30 AI Campaign Generations / mo',
        '60 Scheduled Posts / mo',
        '100 MB Asset Storage',
        'Manual Approval Workflow',
      ],
    },
    {
      id: 'diamond',
      name: 'Diamond',
      badge: 'RECOMMENDED',
      price: '$79',
      period: 'per month',
      description: 'For growing brands scaling engagement with autonomous campaign workflows.',
      features: [
        '1 Workspace',
        'Up to 8 Connected Social Accounts',
        '150 AI Campaign Generations / mo',
        '250 Scheduled Posts / mo',
        '1 GB Asset Storage',
        'Rule-Based Auto-Publishing',
        'Best-Time Recommendation Engine',
        'YouTube Metadata Assistant',
      ],
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$199',
      period: 'per month',
      description: 'Engineered for digital marketing agencies and multi-brand enterprises.',
      features: [
        'Multiple Client Workspaces (Up to 5)',
        'Up to 20 Connected Channels',
        '500 AI Campaign Generations / mo',
        '1,000 Scheduled Posts / mo',
        '10 GB Asset Storage',
        'Role-Based Multi-Step Approvals',
        'Client-Ready Exports & Reports',
        'Priority Dedicated Support',
      ],
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchUsage();
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
              Subscription Tier & Quota Usage
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Clear usage boundaries, active feature flags, and seamless tier upgrades.
            </p>
          </div>

          {/* Usage Counters Box */}
          {usageStats && (
            <div className="bms-card" style={{ padding: '24px', marginBottom: '32px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
                  Current Billing Period Consumption ({usageStats.planName} Tier)
                </h2>
                <span className="bms-badge badge-published">ACTIVE SUBSCRIPTION</span>
              </div>

              {usageStats.warnings?.length > 0 && (
                <div style={{ marginBottom: '18px' }}>
                  {usageStats.warnings.map((w: string, i: number) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        border: '1px solid rgba(245, 158, 11, 0.3)',
                        color: '#F59E0B',
                        padding: '10px 14px',
                        borderRadius: '6px',
                        fontSize: '0.8rem',
                        marginBottom: '6px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      <AlertTriangle size={15} />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
                {/* AI Runs */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>AI Campaign Runs</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {usageStats.usage.aiRunsCurrentPeriod} / {usageStats.quotas.maxAiRunsPerMonth}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (usageStats.usage.aiRunsCurrentPeriod / usageStats.quotas.maxAiRunsPerMonth) * 100)}%`,
                        height: '100%',
                        backgroundColor: 'var(--brandive-blue)',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Social Accounts */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Connected Channels</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {usageStats.usage.socialAccounts} / {usageStats.quotas.maxSocialAccounts}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (usageStats.usage.socialAccounts / usageStats.quotas.maxSocialAccounts) * 100)}%`,
                        height: '100%',
                        backgroundColor: '#10B981',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Scheduled Posts */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Monthly Scheduled Posts</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {usageStats.usage.scheduledPostsCurrentPeriod} / {usageStats.quotas.maxScheduledPostsPerMonth}
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (usageStats.usage.scheduledPostsCurrentPeriod / usageStats.quotas.maxScheduledPostsPerMonth) * 100)}%`,
                        height: '100%',
                        backgroundColor: '#38BDF8',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>Media Storage</span>
                    <span style={{ fontWeight: 600, color: '#FFFFFF' }}>
                      {(usageStats.usage.storageBytesTotal / (1024 * 1024)).toFixed(1)} MB / {(usageStats.quotas.maxStorageBytes / (1024 * 1024)).toFixed(0)} MB
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (usageStats.usage.storageBytesTotal / usageStats.quotas.maxStorageBytes) * 100)}%`,
                        height: '100%',
                        backgroundColor: '#8B5CF6',
                        borderRadius: '4px',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Comparison */}
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '20px' }}>
              Available Subscription Packages
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
              {plans.map((plan) => {
                const isCurrent = (usageStats?.planId || 'diamond') === plan.id;
                return (
                  <div
                    key={plan.id}
                    className="bms-card"
                    style={{
                      padding: '28px',
                      borderRadius: '12px',
                      border: plan.badge ? '2px solid var(--brandive-blue)' : '1px solid var(--border)',
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    {plan.badge && (
                      <span
                        className="bms-badge"
                        style={{
                          position: 'absolute',
                          top: '-12px',
                          right: '24px',
                          backgroundColor: 'var(--brandive-blue)',
                          color: '#FFFFFF',
                          fontWeight: 700,
                        }}
                      >
                        {plan.badge}
                      </span>
                    )}

                    <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#FFFFFF' }}>{plan.name}</div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', minHeight: '38px' }}>
                      {plan.description}
                    </p>

                    <div style={{ margin: '18px 0', display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                      <span style={{ fontSize: '2.2rem', fontWeight: 800, color: '#FFFFFF' }}>{plan.price}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{plan.period}</span>
                    </div>

                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, marginBottom: '24px' }}>
                      {plan.features.map((feat, i) => (
                        <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-primary)' }}>
                          <CheckCircle2 size={15} color="var(--brandive-blue)" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>

                    <button
                      disabled={isCurrent}
                      className={isCurrent ? 'bms-btn-secondary' : 'bms-btn-primary'}
                      style={{ width: '100%', padding: '10px' }}
                    >
                      {isCurrent ? 'Current Active Tier' : 'Upgrade Plan'}
                    </button>
                  </div>
                );
              })}
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
