'use client';

import React, { useEffect, useState } from 'react';
import Sidebar from '@/components/Sidebar';
import Header from '@/components/Header';
import NotificationDrawer from '@/components/NotificationDrawer';
import { Building2, Save, CheckCircle2, ShieldAlert, Sparkles, Globe, Target, Volume2 } from 'lucide-react';

export default function BrandProfilePage() {
  const [workspace, setWorkspace] = useState<any>({
    id: '',
    name: 'BranDive Media Solutions',
    timezone: 'America/New_York',
    emergencyPaused: false,
    plan: { id: 'diamond', name: 'Diamond' },
  });
  const [brandName, setBrandName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');
  const [servicesInput, setServicesInput] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [toneInput, setToneInput] = useState('');
  const [ctaPreferences, setCtaPreferences] = useState('');
  const [offersInput, setOffersInput] = useState('');
  const [restrictionsInput, setRestrictionsInput] = useState('');
  const [complianceNotes, setComplianceNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  const fetchProfile = async () => {
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

        const res = await fetch(`/api/v1/workspaces/${activeWs.id}/brand-profile`);
        const data = await res.json();
        if (data.brandProfile) {
          const bp = data.brandProfile;
          setBrandName(bp.brandName || activeWs.name);
          setWebsite(bp.website || '');
          setIndustry(bp.industry || '');
          setServicesInput(Array.isArray(bp.services) ? bp.services.join(', ') : '');
          setTargetAudience(
            typeof bp.audience === 'object'
              ? bp.audience.targetDemographic || JSON.stringify(bp.audience)
              : ''
          );
          setToneInput(Array.isArray(bp.tone) ? bp.tone.join(', ') : '');
          setCtaPreferences(bp.ctaPreferences || '');
          setOffersInput(Array.isArray(bp.offers) ? bp.offers.join(', ') : '');
          setRestrictionsInput(Array.isArray(bp.restrictions) ? bp.restrictions.join(', ') : '');
          setComplianceNotes(bp.complianceNotes || '');
        }

        const notifRes = await fetch(`/api/v1/workspaces/${activeWs.id}/notifications`);
        const notifData = await notifRes.json();
        setNotifications(notifData.notifications || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspace.id) return;
    setIsSaving(true);
    setNotice('');

    try {
      const services = servicesInput.split(',').map((s) => s.trim()).filter(Boolean);
      const tone = toneInput.split(',').map((t) => t.trim()).filter(Boolean);
      const offers = offersInput.split(',').map((o) => o.trim()).filter(Boolean);
      const restrictions = restrictionsInput.split(',').map((r) => r.trim()).filter(Boolean);

      const res = await fetch(`/api/v1/workspaces/${workspace.id}/brand-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brandName,
          website,
          industry,
          services,
          audience: { targetDemographic: targetAudience },
          tone,
          ctaPreferences,
          offers,
          restrictions,
          complianceNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save brand profile.');
      }

      setNotice('Brand profile & voice guidelines updated successfully!');
      setTimeout(() => setNotice(''), 4000);
    } catch (err: any) {
      alert(err.message || 'Error saving profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--background)' }}>
      <Sidebar
        currentWorkspace={workspace}
        onTogglePause={async () => {
          await fetch(`/api/v1/workspaces/${workspace.id}/toggle-pause`, { method: 'POST' });
          await fetchProfile();
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
              Brand Profile & Voice Guidelines
            </h1>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              The AI campaign engine references these settings to ensure all post copy matches your authentic voice and adheres to strict compliance guardrails.
            </p>
          </div>

          {notice && (
            <div
              style={{
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                border: '1px solid #10B981',
                color: '#FFFFFF',
                padding: '12px 18px',
                borderRadius: '8px',
                marginBottom: '24px',
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

          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Section 1: Core Brand Identity */}
              <div className="bms-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <Building2 size={18} color="var(--brandive-blue)" />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFFFFF' }}>
                    1. Identity & Market Position
                  </h2>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Brand / Company Name</label>
                  <input
                    type="text"
                    value={brandName}
                    onChange={(e) => setBrandName(e.target.value)}
                    className="bms-input"
                    required
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Official Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://www.company.com"
                    className="bms-input"
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Industry & Category</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    placeholder="e.g. Digital Marketing & Web Agency"
                    className="bms-input"
                  />
                </div>

                <div>
                  <label className="bms-label">Products & Core Services (comma separated)</label>
                  <input
                    type="text"
                    value={servicesInput}
                    onChange={(e) => setServicesInput(e.target.value)}
                    placeholder="Web Development, Campaign Automation, Branding"
                    className="bms-input"
                  />
                </div>
              </div>

              {/* Section 2: Audience & Voice */}
              <div className="bms-card" style={{ padding: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                  <Volume2 size={18} color="var(--brandive-blue)" />
                  <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFFFFF' }}>
                    2. Tone & Target Demographics
                  </h2>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Target Audience & Geography</label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="Business Owners, Founders, Global Enterprise"
                    className="bms-input"
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Brand Tone Descriptors (comma separated)</label>
                  <input
                    type="text"
                    value={toneInput}
                    onChange={(e) => setToneInput(e.target.value)}
                    placeholder="Innovative, Authoritative, Approachable, Results-Driven"
                    className="bms-input"
                  />
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <label className="bms-label">Default Call-To-Action (CTA)</label>
                  <input
                    type="text"
                    value={ctaPreferences}
                    onChange={(e) => setCtaPreferences(e.target.value)}
                    placeholder="Book your free brand audit | Visit www.brandivemedsols.com"
                    className="bms-input"
                  />
                </div>

                <div>
                  <label className="bms-label">Active Value Propositions / Offers</label>
                  <input
                    type="text"
                    value={offersInput}
                    onChange={(e) => setOffersInput(e.target.value)}
                    placeholder="Complimentary Strategy Consultation"
                    className="bms-input"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Guardrails & Compliance Notes */}
            <div className="bms-card" style={{ padding: '24px', marginTop: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
                <ShieldAlert size={18} color="#F59E0B" />
                <h2 style={{ fontSize: '1.05rem', fontWeight: 600, color: '#FFFFFF' }}>
                  3. Safety Guardrails, Prohibited Claims & Legal Disclaimers
                </h2>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <label className="bms-label">Prohibited Words, Claims, or Competitors (comma separated)</label>
                  <textarea
                    rows={4}
                    value={restrictionsInput}
                    onChange={(e) => setRestrictionsInput(e.target.value)}
                    placeholder="Do not guarantee virality, No black-hat engagement tactics, Never claim unverified price discounts"
                    className="bms-textarea"
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    The AI engine will reject or flag any generated content attempting to use these expressions.
                  </span>
                </div>

                <div>
                  <label className="bms-label">Mandatory Disclaimers / Compliance Notes</label>
                  <textarea
                    rows={4}
                    value={complianceNotes}
                    onChange={(e) => setComplianceNotes(e.target.value)}
                    placeholder="All client performance statistics reflect verified case results. Results may vary by market."
                    className="bms-textarea"
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'block' }}>
                    Automatically appended or referenced where required by industry standards.
                  </span>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" disabled={isSaving} className="bms-btn-primary" style={{ padding: '10px 24px' }}>
                <Save size={16} />
                <span>{isSaving ? 'Saving Profile...' : 'Save Brand Voice & Guidelines'}</span>
              </button>
            </div>
          </form>
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
