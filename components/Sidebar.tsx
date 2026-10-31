'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  Sparkles,
  CheckSquare,
  FileText,
  BarChart2,
  Inbox,
  Sliders,
  Settings,
  Plus,
  PlayCircle,
  PauseCircle,
  Instagram,
  Facebook,
  Linkedin,
} from 'lucide-react';

interface SidebarProps {
  currentWorkspace: {
    id: string;
    name: string;
    emergencyPaused: boolean;
    plan?: { id: string; name: string };
  };
  onTogglePause: () => void;
  isPausing?: boolean;
}

export default function Sidebar({ currentWorkspace, onTogglePause, isPausing }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/', icon: LayoutDashboard },
    { label: 'Content Planner', href: '/calendar', icon: CalendarDays },
    { label: 'AI Content Studio', href: '/campaigns', icon: Sparkles },
    { label: 'Calendar', href: '/calendar', icon: CalendarDays },
    { label: 'Approvals', href: '/calendar?status=AWAITING_APPROVAL', icon: CheckSquare, badge: '2' },
    { label: 'Posts', href: '/calendar', icon: FileText },
    { label: 'Analytics', href: '/analytics', icon: BarChart2 },
    { label: 'Inbox', href: '/calendar', icon: Inbox, badge: '5' },
    { label: 'Brand Voice', href: '/brand-profile', icon: Sliders },
    { label: 'Settings', href: '/billing', icon: Settings },
  ];

  const connectedAccounts = [
    {
      name: 'Instagram',
      handle: '@brandive.medsols',
      icon: Instagram,
      iconColor: '#F43F5E',
      iconBg: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    },
    {
      name: 'Facebook Page',
      handle: 'BranDive Media',
      icon: Facebook,
      iconColor: '#3B82F6',
      iconBg: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)',
    },
    {
      name: 'LinkedIn Page',
      handle: 'BranDive Agency',
      icon: Linkedin,
      iconColor: '#0EA5E9',
      iconBg: 'linear-gradient(135deg, #0284C7 0%, #38BDF8 100%)',
    },
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#070B14',
        borderRight: '1px solid rgba(255, 255, 255, 0.05)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: '24px 20px 18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
        }}
      >
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #0E88D3 0%, #3B82F6 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 16px rgba(14, 136, 211, 0.4)',
            flexShrink: 0,
          }}
        >
          <Sparkles size={20} color="#FFFFFF" />
        </div>
        <div>
          <div
            style={{
              fontFamily: 'Lexend, sans-serif',
              fontWeight: 700,
              fontSize: '1.05rem',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            BranDive <span style={{ color: 'var(--brandive-blue)' }}>Flow</span>
          </div>
          <div style={{ fontSize: '0.72rem', color: '#64748B', fontWeight: 400 }}>
            AI Social Media Autopilot
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <nav
        style={{
          flex: 1,
          padding: '10px 14px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '3px',
        }}
      >
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isActive = idx === 0 ? pathname === '/' : pathname === item.href;

          return (
            <Link
              key={`${item.label}-${idx}`}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '9px 14px',
                borderRadius: '10px',
                textDecoration: 'none',
                fontSize: '0.84rem',
                fontWeight: isActive ? 600 : 500,
                color: isActive ? '#FFFFFF' : '#94A3B8',
                background: isActive
                  ? 'linear-gradient(90deg, #1D4ED8 0%, #0E88D3 100%)'
                  : 'transparent',
                boxShadow: isActive ? '0 4px 14px rgba(14, 136, 211, 0.35)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Icon size={17} color={isActive ? '#FFFFFF' : '#64748B'} />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: '#94A3B8',
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '2px 7px',
                    borderRadius: '10px',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Connected Accounts Section */}
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 8px 10px',
            }}
          >
            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#94A3B8' }}>
              Connected Accounts
            </span>
            <Link
              href="/integrations"
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <Plus size={15} />
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {connectedAccounts.map((acc) => {
              const AccIcon = acc.icon;
              return (
                <Link
                  key={acc.name}
                  href="/integrations"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '6px 8px',
                    borderRadius: '8px',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: acc.iconBg,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AccIcon size={14} color="#FFFFFF" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F5F9' }}>
                        {acc.name}
                      </div>
                      <div style={{ fontSize: '0.68rem', color: '#64748B' }}>{acc.handle}</div>
                    </div>
                  </div>
                  {/* Online / Active Indicator Dot */}
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      backgroundColor: '#10B981',
                      boxShadow: '0 0 6px #10B981',
                    }}
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* AI Credits Widget */}
        <div
          style={{
            marginTop: '18px',
            padding: '14px',
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '12px',
          }}
        >
          <div style={{ fontSize: '0.74rem', color: '#94A3B8', marginBottom: '4px' }}>
            Your AI Credits
          </div>
          <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '8px' }}>
            2,450 <span style={{ fontSize: '0.75rem', color: '#64748B', fontWeight: 400 }}>/ 5,000 used</span>
          </div>
          {/* Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '5px',
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              borderRadius: '999px',
              overflow: 'hidden',
              marginBottom: '6px',
            }}
          >
            <div
              style={{
                width: '49%',
                height: '100%',
                background: 'linear-gradient(90deg, #3B82F6 0%, #0E88D3 100%)',
                boxShadow: '0 0 8px #0E88D3',
                borderRadius: '999px',
              }}
            />
          </div>
          <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
            Resets on 1 Jun 2026
          </div>
        </div>
      </nav>

      {/* Safety Emergency Toggle & Plan */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid rgba(255, 255, 255, 0.05)',
          backgroundColor: '#060910',
        }}
      >
        <button
          onClick={onTogglePause}
          disabled={isPausing}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 10px',
            fontSize: '0.73rem',
            fontWeight: 600,
            borderRadius: '8px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.2s',
            backgroundColor: currentWorkspace.emergencyPaused ? '#EF4444' : 'rgba(239, 68, 68, 0.12)',
            color: currentWorkspace.emergencyPaused ? '#FFFFFF' : '#EF4444',
          }}
        >
          {currentWorkspace.emergencyPaused ? <PlayCircle size={14} /> : <PauseCircle size={14} />}
          {currentWorkspace.emergencyPaused ? 'RESUME PUBLISHING' : 'PAUSE ALL PUBLISHING'}
        </button>
      </div>
    </aside>
  );
}
