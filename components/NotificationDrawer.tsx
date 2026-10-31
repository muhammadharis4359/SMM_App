'use client';

import React from 'react';
import { X, CheckCheck, Bell, AlertCircle, CheckCircle, Info } from 'lucide-react';

interface NotificationItem {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
}

export default function NotificationDrawer({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
}: NotificationDrawerProps) {
  if (!isOpen) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'PUBLISH_SUCCESS':
        return <CheckCircle size={16} color="#10B981" />;
      case 'PUBLISH_FAILED':
        return <AlertCircle size={16} color="#EF4444" />;
      case 'APPROVAL_NEEDED':
        return <AlertCircle size={16} color="#F59E0B" />;
      default:
        return <Info size={16} color="var(--brandive-blue)" />;
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(4px)',
        zIndex: 60,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '380px',
          maxWidth: '100%',
          height: '100%',
          backgroundColor: 'var(--card)',
          borderLeft: '1px solid var(--border)',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '-10px 0 30px rgba(0,0,0,0.5)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '18px 20px',
            borderBottom: '1px solid var(--border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell size={18} color="var(--brandive-blue)" />
            <span style={{ fontFamily: 'Lexend', fontWeight: 600, fontSize: '1rem', color: '#FFFFFF' }}>
              Notifications
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={onMarkAllRead}
              className="bms-btn-secondary"
              style={{ padding: '4px 8px', fontSize: '0.72rem' }}
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              <span>Mark Read</span>
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Notification List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '12px' }}>
          {notifications.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              No notifications yet.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {notifications.map((n) => (
                <div
                  key={n.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    backgroundColor: n.read ? 'rgba(255, 255, 255, 0.02)' : 'rgba(14, 136, 211, 0.08)',
                    border: `1px solid ${n.read ? 'var(--border)' : 'var(--border-brand)'}`,
                    display: 'flex',
                    gap: '10px',
                  }}
                >
                  <div style={{ marginTop: '2px' }}>{getIcon(n.type)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#FFFFFF' }}>{n.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                      {n.message}
                    </div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
