'use client';

import React, { useState } from 'react';
import { Bell, AlertTriangle, LogOut, Sparkles, ChevronDown, RefreshCw, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface HeaderProps {
  currentWorkspace: {
    id: string;
    name: string;
    emergencyPaused: boolean;
    timezone: string;
  };
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  onCreateWithAI?: () => void;
}

export default function Header({
  currentWorkspace,
  unreadNotificationsCount = 3,
  onOpenNotifications,
  onManualSync,
  isSyncing = false,
  onCreateWithAI,
}: HeaderProps) {
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  return (
    <header
      style={{
        padding: '22px 32px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#070B14',
        zIndex: 30,
        borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
      }}
    >
      {/* Left: Greeting & Subtitle */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <h1
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
            }}
          >
            Good morning, Team 👋
          </h1>
          {currentWorkspace.emergencyPaused && (
            <span
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid #EF4444',
                color: '#EF4444',
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              <AlertTriangle size={12} /> PAUSED
            </span>
          )}
        </div>
        <p style={{ fontSize: '0.84rem', color: '#64748B', marginTop: '3px' }}>
          Your AI is ready to plan, create and publish content that grows your brand.
        </p>
      </div>

      {/* Right: Actions & User Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Create with AI glowing gradient button */}
        {onCreateWithAI ? (
          <button
            onClick={onCreateWithAI}
            className="btn-cyber-gradient"
            style={{
              padding: '9px 18px',
              fontSize: '0.84rem',
            }}
          >
            <Sparkles size={16} />
            <span>Create with AI</span>
          </button>
        ) : (
          <Link
            href="/campaigns"
            className="btn-cyber-gradient"
            style={{
              padding: '9px 18px',
              fontSize: '0.84rem',
              textDecoration: 'none',
            }}
          >
            <Sparkles size={16} />
            <span>Create with AI</span>
          </Link>
        )}

        {/* Sync Trigger button */}
        {onManualSync && (
          <button
            onClick={onManualSync}
            disabled={isSyncing}
            title="Trigger Queue Check"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: isSyncing ? 'var(--brandive-blue)' : '#94A3B8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: isSyncing ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <RefreshCw size={16} className={isSyncing ? 'animate-spin' : ''} />
          </button>
        )}

        {/* Notification Bell */}
        <button
          onClick={onOpenNotifications}
          style={{
            position: 'relative',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: '#0F172A',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            color: '#94A3B8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          <Bell size={17} />
          {unreadNotificationsCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: '-3px',
                right: '-3px',
                backgroundColor: '#6366F1',
                color: '#FFFFFF',
                fontSize: '10px',
                fontWeight: 700,
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 8px rgba(99, 102, 241, 0.8)',
              }}
            >
              {unreadNotificationsCount}
            </span>
          )}
        </button>

        {/* User Profile Chip */}
        <div style={{ position: 'relative' }}>
          <div
            onClick={() => setShowUserMenu(!showUserMenu)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '5px 10px 5px 6px',
              borderRadius: '12px',
              backgroundColor: '#0F172A',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
          >
            {/* Avatar Initials */}
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '10px',
                backgroundColor: '#1E293B',
                color: '#38BDF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.8rem',
              }}
            >
              BD
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.2 }}>
                BranDive Team
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>Admin</div>
            </div>
            <ChevronDown size={14} color="#64748B" />
          </div>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div
              style={{
                position: 'absolute',
                right: 0,
                top: 'calc(100% + 8px)',
                width: '200px',
                backgroundColor: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                padding: '8px',
                boxShadow: '0 12px 30px rgba(0,0,0,0.6)',
                zIndex: 60,
              }}
            >
              <div style={{ padding: '8px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFF' }}>
                  {currentWorkspace.name}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#64748B' }}>
                  TZ: {currentWorkspace.timezone}
                </div>
              </div>

              <Link
                href="/billing"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  color: '#94A3B8',
                  textDecoration: 'none',
                  borderRadius: '6px',
                }}
                onClick={() => setShowUserMenu(false)}
              >
                <User size={14} /> Account & Billing
              </Link>

              <button
                onClick={handleLogout}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 10px',
                  fontSize: '0.8rem',
                  color: '#EF4444',
                  background: 'none',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <LogOut size={14} /> Log out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
