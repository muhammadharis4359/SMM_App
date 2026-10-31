'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import Link from 'next/link';
import { getActiveWorkspace, setActiveWorkspace } from '@/lib/clientWorkspace';
import {
  CalendarDays,
  Sparkles,
  TrendingUp,
  Clock,
  FileText,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
  Send,
  Check,
  X,
  Play,
  Lightbulb,
  Edit3,
  CheckCircle2,
  Calendar,
  Instagram,
  Facebook,
  Linkedin,
  Eye,
  Heart,
  MousePointer,
  Bot,
} from 'lucide-react';

export default function DashboardOverviewPage() {
  const [allWorkspaces, setAllWorkspaces] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });

  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [actionNotice, setActionNotice] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // AI Assistant input state
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([
    'Carousel: 5 productivity hacks for modern marketing agencies',
    'Reel: How AI autopilot schedules multi-platform campaigns',
    'Post: Why leading brands plan once and publish programmatically',
  ]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Filter state for calendar
  const [selectedPlatform, setSelectedPlatform] = useState('ALL');
  const [selectedTimeframe, setSelectedTimeframe] = useState('Week');
  const [performanceTimeframe, setPerformanceTimeframe] = useState('This Week');

  // Load real workspace and notifications
  const fetchWorkspace = async (targetId?: string) => {
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

        // Customize AI suggestions based on whether the entity is learn2growrich or BranDive
        if (activeWs.name.toLowerCase().includes('learn2growrich')) {
          setAiSuggestions([
            'Carousel: 5 financial habits that separate the 1% from everyone else',
            'Reel: Why your income is not your wealth (Equity vs Salary)',
            'Post: The $10K/month skill stack roadmap for 2026',
          ]);
        } else {
          setAiSuggestions([
            'Carousel: 5 productivity hacks for modern marketing agencies',
            'Reel: How AI autopilot schedules multi-platform campaigns',
            'Post: Why leading brands plan once and publish programmatically',
          ]);
        }

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error('Error fetching workspace:', err);
    }
  };

  useEffect(() => {
    fetchWorkspace();

    const handleWsChange = (e: any) => {
      if (e.detail?.workspaceId) {
        fetchWorkspace(e.detail.workspaceId);
      }
    };
    window.addEventListener('socialflow_ws_changed', handleWsChange);
    return () => window.removeEventListener('socialflow_ws_changed', handleWsChange);
  }, []);

  // Emergency Pause Handler
  const handleToggleEmergencyPause = async () => {
    if (!workspace.id) return;
    try {
      const res = await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setWorkspace((prev: any) => ({ ...prev, emergencyPaused: data.emergencyPaused }));
        setActionNotice(data.message);
        setTimeout(() => setActionNotice(''), 4000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Trigger Publisher Worker Tick
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/v1/scheduler/tick', { method: 'POST' });
      const data = await res.json();
      setActionNotice(`Scheduler cycle complete: ${data.processedCount} jobs processed.`);
      setTimeout(() => setActionNotice(''), 4000);
      await fetchWorkspace();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Calendar Post Dataset exactly matching the Cyber Magic UI/UX layout
  const [calendarPosts, setCalendarPosts] = useState<any[]>([
    // Mon 19
    {
      id: 'p1',
      day: 'Mon 19',
      dayKey: 'mon',
      platform: 'INSTAGRAM',
      time: '10:00 AM',
      title: '5 Design Trends to Watch in 2025',
      image: '/thumbnails/thumb_trends.svg',
      status: 'Scheduled',
      caption: 'The future of digital interface design is here. Explore our breakdown of dynamic glassmorphism and AI-assisted typography for 2025.',
    },
    {
      id: 'p2',
      day: 'Mon 19',
      dayKey: 'mon',
      platform: 'LINKEDIN',
      time: '01:30 PM',
      title: 'Why Brand Strategy Drives Long-Term Growth',
      image: '/thumbnails/thumb_strategy.svg',
      status: 'Scheduled',
      caption: 'Tactics win moments; brand strategy wins markets. Here is how BranDive positions companies for sustained market leadership.',
    },
    // Tue 20
    {
      id: 'p3',
      day: 'Tue 20',
      dayKey: 'tue',
      platform: 'FACEBOOK',
      time: '11:00 AM',
      title: 'Behind the Scenes of Our Creative Process',
      image: '/thumbnails/thumb_bts.svg',
      status: 'Scheduled',
      caption: 'From rough wireframes to polished multi-channel campaigns: a peek inside the BranDive Media Solutions studio.',
    },
    {
      id: 'p4',
      day: 'Tue 20',
      dayKey: 'tue',
      platform: 'INSTAGRAM',
      time: '04:00 PM',
      title: 'How AI is Changing Content Creation',
      image: '/thumbnails/thumb_ai.svg',
      status: 'Scheduled',
      caption: 'AI does not replace creativity—it scales human intention. Discover how our SocialFlow autopilot system works.',
    },
    // Wed 21 (Active Day)
    {
      id: 'p5',
      day: 'Wed 21',
      dayKey: 'wed',
      platform: 'LINKEDIN',
      time: '10:30 AM',
      title: '3 Ways Data Improves Marketing Decisions',
      image: '/thumbnails/thumb_analytics.svg',
      status: 'Scheduled',
      caption: 'Stop guessing what works. Discover the 3 core metrics our enterprise clients track to guarantee return on ad spend.',
    },
    {
      id: 'p6',
      day: 'Wed 21',
      dayKey: 'wed',
      platform: 'INSTAGRAM',
      time: '02:00 PM',
      title: 'Office Vibes Wednesday ✨',
      image: '/thumbnails/thumb_bts.svg',
      status: 'Scheduled',
      caption: 'Midweek momentum at BranDive Media Solutions. Building tomorrow digital landmarks today.',
    },
    // Thu 22
    {
      id: 'p7',
      day: 'Thu 22',
      dayKey: 'thu',
      platform: 'FACEBOOK',
      time: '11:30 AM',
      title: 'New Project Spotlight',
      image: '/thumbnails/thumb_spotlight.svg',
      status: 'Pending Review',
      caption: 'Celebrating our latest enterprise digital transformation project. See the full case study on our portal.',
    },
    {
      id: 'p8',
      day: 'Thu 22',
      dayKey: 'thu',
      platform: 'LINKEDIN',
      time: '03:00 PM',
      title: '5 Content Tips That Actually Work',
      image: '/thumbnails/thumb_tips.svg',
      status: 'Pending Review',
      caption: 'Actionable tips you can implement today to increase social engagement by 35% without expanding your ad budget.',
    },
    // Fri 23
    {
      id: 'p9',
      day: 'Fri 23',
      dayKey: 'fri',
      platform: 'INSTAGRAM',
      time: '10:00 AM',
      title: 'Client Success Stories',
      image: '/thumbnails/thumb_trends.svg',
      status: 'Draft',
      caption: 'How one medical tech company 4x their organic social reach in 60 days with BranDive SocialFlow AI.',
    },
    {
      id: 'p10',
      day: 'Fri 23',
      dayKey: 'fri',
      platform: 'FACEBOOK',
      time: '04:30 PM',
      title: 'Q&A Friday Ask Us Anything',
      image: '/thumbnails/thumb_strategy.svg',
      status: 'Draft',
      caption: 'Got questions about web design, video production, or automated social media? Drop them below!',
    },
    // Sat 24
    {
      id: 'p11',
      day: 'Sat 24',
      dayKey: 'sat',
      platform: 'LINKEDIN',
      time: '11:00 AM',
      title: 'Weekend Motivation Keep Building',
      image: '/thumbnails/thumb_spotlight.svg',
      status: 'Scheduled',
      caption: 'Consistency is the ultimate differentiator. Have an inspiring and productive weekend!',
    },
    // Sun 25
    {
      id: 'p12',
      day: 'Sun 25',
      dayKey: 'sun',
      platform: 'INSTAGRAM',
      time: '06:00 PM',
      title: 'Sunday Reset Plan. Rest. Win.',
      image: '/thumbnails/thumb_trends.svg',
      status: 'Scheduled',
      caption: 'Recharging for another big week of growth and impact. What are your core goals for this coming week?',
    },
  ]);

  // Approval queue items
  const [approvalQueue, setApprovalQueue] = useState<any[]>([
    {
      id: 'q1',
      title: 'New Project Spotlight',
      platform: 'Facebook',
      time: 'May 22, 11:30 AM',
      image: '/thumbnails/thumb_spotlight.svg',
    },
    {
      id: 'q2',
      title: '5 Content Tips That Actually Work',
      platform: 'LinkedIn',
      time: 'May 22, 03:00 PM',
      image: '/thumbnails/thumb_tips.svg',
    },
  ]);

  const handleApproveItem = (id: string, title: string) => {
    setApprovalQueue((prev) => prev.filter((item) => item.id !== id));
    setCalendarPosts((prev) =>
      prev.map((p) => (p.title === title ? { ...p, status: 'Scheduled' } : p))
    );
    setActionNotice(`Approved: "${title}" is now scheduled for publishing.`);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleRejectItem = (id: string, title: string) => {
    setApprovalQueue((prev) => prev.filter((item) => item.id !== id));
    setCalendarPosts((prev) =>
      prev.map((p) => (p.title === title ? { ...p, status: 'Draft' } : p))
    );
    setActionNotice(`Rejected: "${title}" moved back to draft.`);
    setTimeout(() => setActionNotice(''), 3500);
  };

  const handleAskAi = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiPrompt.trim()) return;
    setIsAiGenerating(true);
    setTimeout(() => {
      setAiSuggestions((prev) => [
        `Generated: ${aiPrompt} (Tailored for BranDive)`,
        ...prev.slice(0, 2),
      ]);
      setAiPrompt('');
      setIsAiGenerating(false);
      setActionNotice('New content ideas synthesized by BranDive AI!');
      setTimeout(() => setActionNotice(''), 3000);
    }, 800);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'INSTAGRAM':
        return <Instagram size={13} color="#F43F5E" />;
      case 'FACEBOOK':
        return <Facebook size={13} color="#3B82F6" />;
      case 'LINKEDIN':
        return <Linkedin size={13} color="#0EA5E9" />;
      default:
        return <CalendarDays size={13} color="#94A3B8" />;
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'Scheduled') {
      return (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: 'rgba(14, 136, 211, 0.16)',
            color: '#38BDF8',
          }}
        >
          Scheduled
        </span>
      );
    }
    if (status === 'Pending Review') {
      return (
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: '10px',
            backgroundColor: 'rgba(245, 158, 11, 0.18)',
            color: '#F59E0B',
          }}
        >
          Pending Review
        </span>
      );
    }
    return (
      <span
        style={{
          fontSize: '10px',
          fontWeight: 600,
          padding: '2px 8px',
          borderRadius: '10px',
          backgroundColor: 'rgba(168, 85, 247, 0.18)',
          color: '#C084FC',
        }}
      >
        Draft
      </span>
    );
  };

  const daysList = [
    { label: 'Mon 19', key: 'mon' },
    { label: 'Tue 20', key: 'tue' },
    { label: 'Wed 21', key: 'wed', isToday: true },
    { label: 'Thu 22', key: 'thu' },
    { label: 'Fri 23', key: 'fri' },
    { label: 'Sat 24', key: 'sat' },
    { label: 'Sun 25', key: 'sun' },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#070B14' }}>
      {/* Sleek Dark Cyber Sidebar with BranDive Branding */}
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={handleToggleEmergencyPause}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Header Matching Cyber Magic Layout */}
        <Header
          currentWorkspace={workspace}
          allWorkspaces={allWorkspaces}
          user={currentUser}
          onSelectWorkspace={(ws) => {
            setWorkspace(ws);
            fetchWorkspace(ws.id);
          }}
          unreadNotificationsCount={notifications.filter((n) => !n.read).length || 3}
          onOpenNotifications={() => setIsNotifOpen(true)}
          onManualSync={handleManualSync}
          isSyncing={isSyncing}
          onCreateWithAI={() => setIsCreateOpen(true)}
        />

        {/* Global Action Banner */}
        {actionNotice && (
          <div
            style={{
              margin: '0 32px 14px',
              padding: '10px 16px',
              borderRadius: '8px',
              backgroundColor: 'rgba(14, 136, 211, 0.15)',
              border: '1px solid rgba(14, 136, 211, 0.4)',
              color: '#38BDF8',
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>{actionNotice}</span>
            <button
              onClick={() => setActionNotice('')}
              style={{ background: 'none', border: 'none', color: '#38BDF8', cursor: 'pointer' }}
            >
              <X size={14} />
            </button>
          </div>
        )}

        <main style={{ padding: '0 32px 36px', flex: 1 }}>
          {/* Row 1: 4 KPI Cards Matching Reference Image */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '16px',
              marginBottom: '24px',
            }}
          >
            {/* Card 1: Upcoming Posts */}
            <div
              className="cyber-card"
              style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>Upcoming Posts</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
                  24
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', fontWeight: 500 }}>
                  ↑ 20% vs last 7 days
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(6, 182, 212, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarDays size={22} color="#06B6D4" />
              </div>
            </div>

            {/* Card 2: Engagement (This week) with Wave Sparkline */}
            <div
              className="cyber-card"
              style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>Engagement (This week)</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
                  8.7K
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', fontWeight: 500 }}>
                  ↑ 32% vs last 7 days
                </div>
              </div>
              {/* Blue Wave Sparkline SVG */}
              <div style={{ width: '80px', height: '36px' }}>
                <svg width="80" height="36" viewBox="0 0 80 36" fill="none">
                  <path
                    d="M2 28 C 15 28, 20 8, 32 16 C 44 24, 52 4, 64 12 C 72 16, 76 6, 78 8"
                    stroke="#0E88D3"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="78" cy="8" r="3" fill="#38BDF8" />
                </svg>
              </div>
            </div>

            {/* Card 3: Content Created */}
            <div
              className="cyber-card"
              style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>Content Created</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
                  56
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', fontWeight: 500 }}>
                  ↑ 18% vs last 7 days
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(168, 85, 247, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <FileText size={22} color="#A855F7" />
              </div>
            </div>

            {/* Card 4: Time Saved */}
            <div
              className="cyber-card"
              style={{ padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
            >
              <div>
                <div style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 500 }}>Time Saved</div>
                <div style={{ fontSize: '1.9rem', fontWeight: 700, color: '#FFFFFF', marginTop: '6px' }}>
                  16.5h
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10B981', marginTop: '4px', fontWeight: 500 }}>
                  ↑ 42% vs last 7 days
                </div>
              </div>
              <div
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '12px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Clock size={22} color="#F59E0B" />
              </div>
            </div>
          </div>

          {/* Row 2: Middle Split Section (Two Columns) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1.85fr) minmax(320px, 1fr)',
              gap: '24px',
              alignItems: 'start',
            }}
          >
            {/* Left Column: Weekly Calendar Matrix + Content Pipeline */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', minWidth: 0 }}>
              {/* Content Calendar Matrix Card */}
              <div className="cyber-card" style={{ padding: '22px' }}>
                {/* Calendar Header with Controls */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                    marginBottom: '18px',
                  }}
                >
                  <h2
                    style={{
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '1.12rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    Content Calendar
                  </h2>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {/* Date Navigator */}
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        backgroundColor: '#0F172A',
                        padding: '4px 10px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.78rem',
                        color: '#F1F5F9',
                      }}
                    >
                      <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                        <ChevronLeft size={14} />
                      </button>
                      <span>May 19 – May 25, 2025</span>
                      <button style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                        <ChevronRight size={14} />
                      </button>
                    </div>

                    {/* Today Button */}
                    <button
                      style={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '5px 12px',
                        fontSize: '0.78rem',
                        color: '#F1F5F9',
                        cursor: 'pointer',
                      }}
                    >
                      Today
                    </button>

                    {/* Platform Filter Dropdown */}
                    <select
                      value={selectedPlatform}
                      onChange={(e) => setSelectedPlatform(e.target.value)}
                      style={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        color: '#F1F5F9',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="ALL">All Platforms</option>
                      <option value="INSTAGRAM">Instagram</option>
                      <option value="FACEBOOK">Facebook</option>
                      <option value="LINKEDIN">LinkedIn</option>
                    </select>

                    {/* Week / Month Dropdown */}
                    <select
                      value={selectedTimeframe}
                      onChange={(e) => setSelectedTimeframe(e.target.value)}
                      style={{
                        backgroundColor: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '5px 10px',
                        fontSize: '0.78rem',
                        color: '#F1F5F9',
                        cursor: 'pointer',
                        outline: 'none',
                      }}
                    >
                      <option value="Week">Week</option>
                      <option value="Month">Month</option>
                    </select>

                    {/* Gear / Settings */}
                    <button
                      style={{
                        background: '#0F172A',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        borderRadius: '8px',
                        padding: '6px',
                        color: '#94A3B8',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Settings size={14} />
                    </button>
                  </div>
                </div>

                {/* 7-Day Matrix Columns */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: '10px',
                    overflowX: 'auto',
                    paddingBottom: '10px',
                  }}
                >
                  {daysList.map((d) => {
                    const dayItems = calendarPosts.filter(
                      (p) =>
                        p.dayKey === d.key &&
                        (selectedPlatform === 'ALL' || p.platform === selectedPlatform)
                    );

                    return (
                      <div
                        key={d.key}
                        className={d.isToday ? 'calendar-day-active' : ''}
                        style={{
                          borderRadius: '12px',
                          backgroundColor: d.isToday ? 'rgba(14, 136, 211, 0.05)' : '#070B14',
                          border: d.isToday
                            ? '1px solid rgba(14, 136, 211, 0.45)'
                            : '1px solid rgba(255, 255, 255, 0.04)',
                          padding: '10px 8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px',
                          minWidth: '130px',
                        }}
                      >
                        {/* Day Header */}
                        <div
                          style={{
                            textAlign: 'center',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            color: d.isToday ? '#38BDF8' : '#94A3B8',
                            paddingBottom: '4px',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                          }}
                        >
                          {d.label}
                        </div>

                        {/* Cards inside Day */}
                        {dayItems.map((post) => (
                          <div
                            key={post.id}
                            onClick={() => setSelectedPost(post)}
                            style={{
                              backgroundColor: '#0D1322',
                              border: '1px solid rgba(255, 255, 255, 0.06)',
                              borderRadius: '10px',
                              padding: '8px',
                              cursor: 'pointer',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(14, 136, 211, 0.5)';
                              e.currentTarget.style.transform = 'translateY(-1px)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.06)';
                              e.currentTarget.style.transform = 'translateY(0)';
                            }}
                          >
                            {/* Platform Pill & Time */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              {getPlatformIcon(post.platform)}
                              <span style={{ fontSize: '0.68rem', color: '#94A3B8' }}>{post.time}</span>
                            </div>

                            {/* Thumbnail Preview */}
                            <div
                              style={{
                                width: '100%',
                                height: '62px',
                                borderRadius: '6px',
                                overflow: 'hidden',
                                backgroundColor: '#131B2E',
                              }}
                            >
                              <img
                                src={post.image}
                                alt={post.title}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>

                            {/* Headline */}
                            <div
                              style={{
                                fontSize: '0.72rem',
                                color: '#F1F5F9',
                                fontWeight: 500,
                                lineHeight: 1.3,
                                maxHeight: '2.6em',
                                overflow: 'hidden',
                              }}
                            >
                              {post.title}
                            </div>

                            {/* Status Chip */}
                            <div style={{ marginTop: '2px' }}>{getStatusBadge(post.status)}</div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>

                {/* Centered Add Content Button */}
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                  <button
                    onClick={() => setIsCreateOpen(true)}
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.16)',
                      border: '1px solid rgba(99, 102, 241, 0.35)',
                      color: '#A5B4FC',
                      padding: '7px 20px',
                      borderRadius: '999px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.28)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'rgba(99, 102, 241, 0.16)';
                    }}
                  >
                    <Plus size={14} /> Add Content
                  </button>
                </div>
              </div>

              {/* Content Pipeline Card */}
              <div className="cyber-card" style={{ padding: '20px' }}>
                <h3
                  style={{
                    fontFamily: 'Lexend, sans-serif',
                    fontSize: '0.98rem',
                    fontWeight: 600,
                    color: '#FFFFFF',
                    marginBottom: '16px',
                  }}
                >
                  Content Pipeline
                </h3>

                {/* Pipeline Stages Flow */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  {/* Step 1: Idea Generation */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(245, 158, 11, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Lightbulb size={17} color="#F59E0B" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Idea Generation</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>18</div>
                    </div>
                  </div>

                  <span style={{ color: '#475569', fontSize: '1.2rem' }}>→</span>

                  {/* Step 2: In Progress */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(56, 189, 248, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Edit3 size={17} color="#38BDF8" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>In Progress</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>12</div>
                    </div>
                  </div>

                  <span style={{ color: '#475569', fontSize: '1.2rem' }}>→</span>

                  {/* Step 3: Ready for Review */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(168, 85, 247, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <FileText size={17} color="#A855F7" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Ready for Review</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>7</div>
                    </div>
                  </div>

                  <span style={{ color: '#475569', fontSize: '1.2rem' }}>→</span>

                  {/* Step 4: Approved */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(16, 185, 129, 0.12)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <CheckCircle2 size={17} color="#10B981" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Approved</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>24</div>
                    </div>
                  </div>

                  <span style={{ color: '#475569', fontSize: '1.2rem' }}>→</span>

                  {/* Step 5: Scheduled */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        backgroundColor: 'rgba(14, 136, 211, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Calendar size={17} color="#0E88D3" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94A3B8' }}>Scheduled</div>
                      <div style={{ fontSize: '1.05rem', fontWeight: 700, color: '#FFFFFF' }}>24</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Performance Line Chart, AI Assistant, Approval Queue */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Content Performance Line Chart Card */}
              <div className="cyber-card" style={{ padding: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '14px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    Content Performance
                  </h3>

                  <select
                    value={performanceTimeframe}
                    onChange={(e) => setPerformanceTimeframe(e.target.value)}
                    style={{
                      backgroundColor: '#0F172A',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      borderRadius: '8px',
                      padding: '4px 8px',
                      fontSize: '0.74rem',
                      color: '#94A3B8',
                      outline: 'none',
                    }}
                  >
                    <option value="This Week">This Week</option>
                    <option value="Last 30 Days">Last 30 Days</option>
                  </select>
                </div>

                {/* Line Chart Component with SVG */}
                <div style={{ position: 'relative', width: '100%', height: '170px' }}>
                  {/* Peak Tooltip Callout */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '12px',
                      right: '38px',
                      backgroundColor: '#0F172A',
                      border: '1px solid rgba(14, 136, 211, 0.5)',
                      borderRadius: '6px',
                      padding: '2px 8px',
                      fontSize: '10px',
                      fontWeight: 700,
                      color: '#FFFFFF',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
                    }}
                  >
                    12.4K
                  </div>

                  <svg width="100%" height="100%" viewBox="0 0 340 150" fill="none">
                    {/* Y Axis Guide Lines */}
                    <line x1="30" y1="20" x2="330" y2="20" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                    <line x1="30" y1="55" x2="330" y2="55" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                    <line x1="30" y1="90" x2="330" y2="90" stroke="rgba(255, 255, 255, 0.05)" strokeDasharray="3 3" />
                    <line x1="30" y1="125" x2="330" y2="125" stroke="rgba(255, 255, 255, 0.05)" />

                    {/* Y Axis Labels */}
                    <text x="10" y="24" fill="#64748B" fontSize="9">15K</text>
                    <text x="10" y="59" fill="#64748B" fontSize="9">10K</text>
                    <text x="14" y="94" fill="#64748B" fontSize="9">5K</text>
                    <text x="18" y="128" fill="#64748B" fontSize="9">0</text>

                    {/* Blue Line (Reach) */}
                    <path
                      d="M35 110 C 70 100, 110 80, 150 90 C 190 100, 230 40, 270 25 C 290 18, 310 32, 325 35"
                      stroke="#0E88D3"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                    <circle cx="270" cy="25" r="4" fill="#38BDF8" />

                    {/* Purple Line (Engagement) */}
                    <path
                      d="M35 120 C 70 115, 110 105, 150 110 C 190 115, 230 75, 270 65 C 290 60, 310 70, 325 68"
                      stroke="#A855F7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* Green Line (Clicks) */}
                    <path
                      d="M35 124 C 70 122, 110 118, 150 120 C 190 122, 230 100, 270 95 C 290 92, 310 98, 325 96"
                      stroke="#10B981"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />

                    {/* X Axis Date Labels */}
                    <text x="32" y="142" fill="#64748B" fontSize="8">May 19</text>
                    <text x="78" y="142" fill="#64748B" fontSize="8">May 20</text>
                    <text x="124" y="142" fill="#64748B" fontSize="8">May 21</text>
                    <text x="170" y="142" fill="#64748B" fontSize="8">May 22</text>
                    <text x="216" y="142" fill="#64748B" fontSize="8">May 23</text>
                    <text x="262" y="142" fill="#64748B" fontSize="8">May 24</text>
                    <text x="306" y="142" fill="#64748B" fontSize="8">May 25</text>
                  </svg>
                </div>

                {/* Legend */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '20px',
                    marginTop: '10px',
                    fontSize: '0.74rem',
                    color: '#94A3B8',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0E88D3' }} />
                    <span>Reach</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#A855F7' }} />
                    <span>Engagement</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    <span>Clicks</span>
                  </div>
                </div>
              </div>

              {/* AI Assistant Card (Beta) */}
              <div className="cyber-card" style={{ padding: '22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                  <h3
                    style={{
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    AI Assistant
                  </h3>
                  <span
                    style={{
                      backgroundColor: 'rgba(99, 102, 241, 0.16)',
                      color: '#A5B4FC',
                      fontSize: '10px',
                      fontWeight: 600,
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    Beta
                  </span>
                </div>

                {/* Bot recommendation bubble */}
                <div
                  style={{
                    backgroundColor: 'rgba(15, 23, 42, 0.75)',
                    border: '1px solid rgba(255, 255, 255, 0.05)',
                    borderRadius: '12px',
                    padding: '14px',
                    marginBottom: '14px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <div
                      style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(14, 136, 211, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Bot size={16} color="#38BDF8" />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.78rem', color: '#E2E8F0', fontWeight: 500, lineHeight: 1.4 }}>
                        Here are some content ideas for this week designed for higher engagement:
                      </div>
                      <ul
                        style={{
                          listStyle: 'none',
                          marginTop: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px',
                        }}
                      >
                        {aiSuggestions.map((item, i) => (
                          <li
                            key={i}
                            style={{
                              fontSize: '0.74rem',
                              color: '#94A3B8',
                              lineHeight: 1.4,
                              display: 'flex',
                              gap: '6px',
                            }}
                          >
                            <span style={{ color: '#0E88D3' }}>•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Generate More Ideas Button */}
                <button
                  onClick={() => {
                    setIsAiGenerating(true);
                    setTimeout(() => {
                      setAiSuggestions([
                        'Carousel: 3 Mistakes Agencies Make When Pitching Web Redesigns',
                        'Short: Behind the scenes editing a commercial campaign',
                        'Insight: How AI automation saves 16 hours every week',
                      ]);
                      setIsAiGenerating(false);
                      setActionNotice('Generated fresh BranDive content concepts!');
                      setTimeout(() => setActionNotice(''), 3000);
                    }, 600);
                  }}
                  style={{
                    width: '100%',
                    backgroundColor: 'rgba(14, 136, 211, 0.1)',
                    border: '1px solid rgba(14, 136, 211, 0.28)',
                    borderRadius: '8px',
                    padding: '8px',
                    fontSize: '0.76rem',
                    fontWeight: 600,
                    color: '#38BDF8',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    marginBottom: '14px',
                    transition: 'all 0.2s',
                  }}
                >
                  <Sparkles size={14} />
                  <span>{isAiGenerating ? 'Synthesizing Ideas...' : 'Generate More Ideas'}</span>
                </button>

                {/* Ask AI Anything Input Bar */}
                <form onSubmit={handleAskAi} style={{ position: 'relative' }}>
                  <input
                    type="text"
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="Ask AI anything..."
                    style={{
                      width: '100%',
                      backgroundColor: '#070B14',
                      border: '1px solid rgba(255, 255, 255, 0.08)',
                      borderRadius: '10px',
                      padding: '10px 40px 10px 14px',
                      fontSize: '0.8rem',
                      color: '#F1F5F9',
                      outline: 'none',
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      position: 'absolute',
                      right: '8px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#0E88D3',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Send size={15} />
                  </button>
                </form>
              </div>

              {/* Approval Queue Card */}
              <div className="cyber-card" style={{ padding: '22px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                  }}
                >
                  <h3
                    style={{
                      fontFamily: 'Lexend, sans-serif',
                      fontSize: '0.98rem',
                      fontWeight: 600,
                      color: '#FFFFFF',
                    }}
                  >
                    Approval Queue
                  </h3>
                  <Link
                    href="/calendar?status=AWAITING_APPROVAL"
                    style={{ fontSize: '0.74rem', color: '#0E88D3', textDecoration: 'none', fontWeight: 500 }}
                  >
                    View all
                  </Link>
                </div>

                {approvalQueue.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '16px 0', color: '#64748B', fontSize: '0.78rem' }}>
                    All posts in queue are reviewed!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {approvalQueue.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px',
                          backgroundColor: '#070B14',
                          border: '1px solid rgba(255, 255, 255, 0.05)',
                          borderRadius: '10px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <img
                            src={item.image}
                            alt={item.title}
                            style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#F1F5F9' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.68rem', color: '#64748B' }}>
                              {item.platform} • {item.time}
                            </div>
                          </div>
                        </div>

                        {/* Approve / Reject Actions */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <button
                            onClick={() => handleApproveItem(item.id, item.title)}
                            title="Approve Post"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(16, 185, 129, 0.15)',
                              border: '1px solid rgba(16, 185, 129, 0.4)',
                              color: '#10B981',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => handleRejectItem(item.id, item.title)}
                            title="Reject to Draft"
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: 'rgba(239, 68, 68, 0.15)',
                              border: '1px solid rgba(239, 68, 68, 0.4)',
                              color: '#EF4444',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              cursor: 'pointer',
                            }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Post Detail / Inspection Modal */}
      {selectedPost && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="cyber-card"
            style={{ width: '100%', maxWidth: '520px', padding: '24px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {getPlatformIcon(selectedPost.platform)}
                <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#38BDF8' }}>
                  {selectedPost.platform}
                </span>
                <span style={{ fontSize: '0.74rem', color: '#94A3B8' }}>• {selectedPost.time}</span>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <div style={{ width: '100%', height: '180px', borderRadius: '8px', overflow: 'hidden', marginBottom: '14px' }}>
              <img
                src={selectedPost.image}
                alt={selectedPost.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>

            <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '8px' }}>
              {selectedPost.title}
            </h3>

            <p style={{ fontSize: '0.82rem', color: '#94A3B8', lineHeight: 1.5, marginBottom: '16px' }}>
              {selectedPost.caption}
            </p>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <div>{getStatusBadge(selectedPost.status)}</div>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onClick={() => {
                    handleApproveItem(selectedPost.id, selectedPost.title);
                    setSelectedPost(null);
                  }}
                  className="bms-btn-primary"
                  style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                >
                  Approve Post
                </button>
                <button
                  onClick={() => setSelectedPost(null)}
                  className="bms-btn-secondary"
                  style={{ fontSize: '0.78rem', padding: '6px 14px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create with AI Quick Modal */}
      {isCreateOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            backdropFilter: 'blur(8px)',
            zIndex: 70,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
          onClick={() => setIsCreateOpen(false)}
        >
          <div
            className="cyber-card"
            style={{ width: '100%', maxWidth: '480px', padding: '26px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} color="#38BDF8" />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFFFFF' }}>
                  Create with AI
                </h3>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <p style={{ fontSize: '0.82rem', color: '#94A3B8', marginBottom: '18px', lineHeight: 1.5 }}>
              Choose whether you want to launch a complete multi-pillar campaign or generate a quick platform post using BranDive SocialFlow AI.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <Link
                href="/campaigns"
                className="btn-cyber-gradient"
                style={{
                  padding: '12px',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                }}
                onClick={() => setIsCreateOpen(false)}
              >
                Launch Multi-Pillar Campaign Studio
              </Link>

              <Link
                href="/calendar"
                className="bms-btn-secondary"
                style={{
                  padding: '12px',
                  justifyContent: 'center',
                  textDecoration: 'none',
                  fontSize: '0.85rem',
                }}
                onClick={() => setIsCreateOpen(false)}
              >
                Schedule Manual Content in Calendar
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* In-app Notification Drawer */}
      <NotificationDrawer
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))}
      />
    </div>
  );
}
