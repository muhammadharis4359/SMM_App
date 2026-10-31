'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { ShieldCheck, History, UserCheck, Lock } from 'lucide-react';
import { getActiveWorkspace } from '@/lib/clientWorkspace';

export default function AuditPage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchAuditLogs = async () => {
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

        // Fetch notifications
        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const sampleLogs = [
    {
      id: 'log-1',
      action: 'POST_APPROVED',
      resourceType: 'CONTENT_ITEM',
      actor: 'Alex Vance',
      timestamp: 'Today at 02:45 PM',
      details: 'Approved scheduled LinkedIn post for B2B Automation Sprint.',
    },
    {
      id: 'log-2',
      action: 'CAMPAIGN_GENERATED',
      resourceType: 'CAMPAIGN',
      actor: 'Alex Vance',
      timestamp: 'Today at 01:15 PM',
      details: 'AI Campaign Engine synthesized 4 multi-platform content items.',
    },
    {
      id: 'log-3',
      action: 'SOCIAL_ACCOUNT_CONNECTED',
      resourceType: 'SOCIAL_ACCOUNT',
      actor: 'Alex Vance',
      timestamp: 'Today at 11:30 AM',
      details: 'Connected Instagram Professional channel (@brandivemedsols).',
    },
    {
      id: 'log-4',
      action: 'WORKSPACE_INITIALIZED',
      resourceType: 'WORKSPACE',
      actor: 'System Admin',
      timestamp: 'Yesterday at 09:00 AM',
      details: 'Initial workspace tenant and Diamond plan subscription provisioned.',
    },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchAuditLogs();
        }}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <Header
          currentWorkspace={workspace}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length}
          onOpenNotifications={() => setIsNotifOpen(true)}
        />

        <main style={{ padding: '28px 32px', flex: 1, maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          <div style={{ marginBottom: '28px' }}>
            <h1 style={{ fontSize: '1.65rem', fontWeight: 700, color: '#FFFFFF' }}>
              Security Governance & Audit Trail
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Immutable compliance logs. Every account connection, post approval, and publishing attempt is permanently recorded.
            </p>
          </div>

          <div className="bms-card" style={{ padding: '26px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
              <History size={18} color="var(--brandive-blue)" />
              <h2 style={{ fontSize: '1.15rem', fontWeight: 600, color: '#FFFFFF' }}>
                Recent Operational Activity
              </h2>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sampleLogs.map((log) => (
                <div
                  key={log.id}
                  style={{
                    padding: '16px',
                    backgroundColor: 'rgba(8, 13, 26, 0.6)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <div
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(14, 136, 211, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lock size={16} color="var(--brandive-blue)" />
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFFFFF' }}>
                          {log.action}
                        </span>
                        <span className="bms-badge" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)' }}>
                          {log.resourceType}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '3px' }}>
                        {log.details}
                      </div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                      {log.actor}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {log.timestamp}
                    </div>
                  </div>
                </div>
              ))}
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
