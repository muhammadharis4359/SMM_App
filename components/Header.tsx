'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  AlertTriangle,
  LogOut,
  Sparkles,
  ChevronDown,
  RefreshCw,
  Building2,
  Rocket,
  Check,
  Sliders,
  Share2,
  CreditCard,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { setActiveWorkspace } from '@/lib/clientWorkspace';

interface WorkspaceItem {
  id: string;
  name: string;
  role: string;
  timezone: string;
  emergencyPaused?: boolean;
  plan?: {
    id: string;
    name: string;
    status: string;
  };
}

interface HeaderProps {
  currentWorkspace: {
    id: string;
    name: string;
    emergencyPaused: boolean;
    timezone: string;
    plan?: any;
    role?: string;
  };
  allWorkspaces?: WorkspaceItem[];
  onSelectWorkspace?: (ws: WorkspaceItem) => void;
  unreadNotificationsCount?: number;
  onOpenNotifications?: () => void;
  onManualSync?: () => void;
  isSyncing?: boolean;
  onCreateWithAI?: () => void;
  user?: {
    email: string;
    displayName: string;
  };
}

export default function Header({
  currentWorkspace,
  allWorkspaces,
  onSelectWorkspace,
  unreadNotificationsCount = 3,
  onOpenNotifications,
  onManualSync,
  isSyncing = false,
  onCreateWithAI,
  user,
}: HeaderProps) {
  const router = useRouter();
  const [workspacesList, setWorkspacesList] = useState<WorkspaceItem[]>(allWorkspaces || []);
  const [userInfo, setUserInfo] = useState<{ email: string; displayName: string } | null>(user || null);
  const [showWsMenu, setShowWsMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (allWorkspaces && allWorkspaces.length > 0) {
      setWorkspacesList(allWorkspaces);
    }
  }, [allWorkspaces]);

  useEffect(() => {
    // If workspaces list or user info wasn't passed, fetch from /api/v1/me
    if (workspacesList.length === 0 || !userInfo) {
      fetch('/api/v1/me')
        .then((res) => {
          if (res.ok) return res.json();
          return null;
        })
        .then((data) => {
          if (data) {
            if (data.workspaces && data.workspaces.length > 0) {
              setWorkspacesList(data.workspaces);
            }
            if (data.user) {
              setUserInfo(data.user);
            }
          }
        })
        .catch(() => {});
    }
  }, []);

  const handleLogout = async () => {
    await fetch('/api/v1/auth/logout', { method: 'POST' });
    router.push('/login');
    router.refresh();
  };

  const handleSwitchWorkspace = (targetWs: WorkspaceItem) => {
    setShowWsMenu(false);
    setShowUserMenu(false);
    setActiveWorkspace(targetWs.id);
    if (onSelectWorkspace) {
      onSelectWorkspace(targetWs);
    } else {
      window.location.reload();
    }
  };

  const isClientWorkspace = currentWorkspace.name.toLowerCase().includes('learn2growrich');

  // Compute initials for avatar
  const displayName = userInfo?.displayName || 'Muhammad Haris';
  const email = userInfo?.email || 'admin@brandivemedsols.com';
  const initials = displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'MH';

  return (
    <header
      style={{
        padding: '18px 32px 14px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        position: 'sticky',
        top: 0,
        backgroundColor: '#070B14',
        zIndex: 30,
        borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
      }}
    >
      {/* Left: Greeting & Workspace Switcher */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1
              style={{
                fontFamily: 'Lexend, sans-serif',
                fontSize: '1.45rem',
                fontWeight: 700,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
              }}
            >
              Control Center 👋
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
          <p style={{ fontSize: '0.82rem', color: '#64748B', marginTop: '2px' }}>
            Autopilot Campaign & Social Media Management
          </p>
        </div>

        {/* Central Workspace Switcher Pill Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              setShowWsMenu(!showWsMenu);
              setShowUserMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '6px 14px 6px 10px',
              borderRadius: '12px',
              backgroundColor: '#0F172A',
              border: '1px solid rgba(14, 136, 211, 0.35)',
              boxShadow: '0 0 14px rgba(14, 136, 211, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            <div
              style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: isClientWorkspace
                  ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                  : 'linear-gradient(135deg, #0E88D3 0%, #3B82F6 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
              }}
            >
              {isClientWorkspace ? <Rocket size={15} /> : <Building2 size={15} />}
            </div>

            <div style={{ textAlign: 'left' }}>
              <div
                style={{
                  fontSize: '0.84rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <span>{currentWorkspace.name || 'Select Workspace'}</span>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: '4px',
                    backgroundColor: isClientWorkspace
                      ? 'rgba(168, 85, 247, 0.2)'
                      : 'rgba(14, 136, 211, 0.2)',
                    color: isClientWorkspace ? '#C084FC' : '#38BDF8',
                    border: `1px solid ${isClientWorkspace ? 'rgba(168, 85, 247, 0.4)' : 'rgba(14, 136, 211, 0.4)'}`,
                  }}
                >
                  {isClientWorkspace ? 'CLIENT' : 'AGENCY HQ'}
                </span>
              </div>
            </div>

            <ChevronDown size={14} color="#94A3B8" />
          </button>

          {/* Workspace Switcher Dropdown */}
          {showWsMenu && (
            <div
              style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                left: 0,
                width: '320px',
                backgroundColor: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '8px',
                boxShadow: '0 18px 40px rgba(0, 0, 0, 0.75)',
                zIndex: 60,
                backdropFilter: 'blur(20px)',
              }}
            >
              <div
                style={{
                  padding: '8px 10px 10px',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Switch Managed Entity
                </span>
                <span style={{ fontSize: '0.7rem', color: '#38BDF8', fontWeight: 600 }}>
                  2 Workspaces
                </span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '6px' }}>
                {workspacesList.map((ws) => {
                  const isActive = ws.id === currentWorkspace.id;
                  const isClient = ws.name.toLowerCase().includes('learn2growrich');

                  return (
                    <div
                      key={ws.id}
                      onClick={() => handleSwitchWorkspace(ws)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: isActive ? 'rgba(14, 136, 211, 0.12)' : 'transparent',
                        border: isActive ? '1px solid rgba(14, 136, 211, 0.35)' : '1px solid transparent',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        transition: 'all 0.15s ease',
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            background: isClient
                              ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                              : 'linear-gradient(135deg, #0E88D3 0%, #3B82F6 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#FFFFFF',
                            flexShrink: 0,
                          }}
                        >
                          {isClient ? <Rocket size={16} /> : <Building2 size={16} />}
                        </div>
                        <div>
                          <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#FFFFFF' }}>
                            {ws.name}
                          </div>
                          <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                            {isClient ? 'Client Account' : 'Own Agency'} • {ws.plan?.name || 'Diamond'} Plan
                          </div>
                        </div>
                      </div>

                      {isActive && (
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontSize: '0.72rem',
                            color: '#10B981',
                            fontWeight: 700,
                          }}
                        >
                          <Check size={14} /> Active
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions & User Chip */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Create with AI glowing button */}
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
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowWsMenu(false);
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '5px 12px 5px 6px',
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
              {initials}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#F1F5F9', lineHeight: 1.2 }}>
                {displayName}
              </div>
              <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                {email}
              </div>
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
                width: '240px',
                backgroundColor: '#0F172A',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                borderRadius: '14px',
                padding: '8px',
                boxShadow: '0 18px 40px rgba(0,0,0,0.75)',
                zIndex: 60,
              }}
            >
              <div style={{ padding: '8px 10px 10px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#FFF' }}>
                  {displayName}
                </div>
                <div style={{ fontSize: '0.7rem', color: '#38BDF8' }}>
                  {email}
                </div>
              </div>

              {/* Quick links to core settings */}
              <div style={{ padding: '4px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <Link
                  href="/brand-profile"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: '#94A3B8',
                    textDecoration: 'none',
                    borderRadius: '8px',
                  }}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Sliders size={14} /> Brand Voice & Identity
                </Link>

                <Link
                  href="/integrations"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 10px',
                    fontSize: '0.8rem',
                    color: '#94A3B8',
                    textDecoration: 'none',
                    borderRadius: '8px',
                  }}
                  onClick={() => setShowUserMenu(false)}
                >
                  <Share2 size={14} /> Connected Social Channels
                </Link>

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
                    borderRadius: '8px',
                  }}
                  onClick={() => setShowUserMenu(false)}
                >
                  <CreditCard size={14} /> Plans & Agency Quotas
                </Link>
              </div>

              <div style={{ paddingTop: '4px' }}>
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
                    borderRadius: '8px',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <LogOut size={14} /> Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
