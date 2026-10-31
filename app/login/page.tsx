'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed.');
      }

      router.push('/');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = () => {
    setEmail('demo@brandivemedsols.com');
    setPassword('Password123!');
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Glow */}
      <div
        style={{
          position: 'absolute',
          width: '500px',
          height: '500px',
          backgroundColor: 'rgba(14, 136, 211, 0.12)',
          borderRadius: '50%',
          filter: 'blur(100px)',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          pointerEvents: 'none',
        }}
      />

      <div
        className="bms-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          padding: '36px 32px',
          position: 'relative',
          zIndex: 10,
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <img
            src="/logo.png"
            alt="BranDive Media Solutions"
            style={{
              height: '48px',
              margin: '0 auto 14px auto',
              objectFit: 'contain',
              borderRadius: '8px',
            }}
          />
          <h1 style={{ fontSize: '1.45rem', fontWeight: 700, color: '#FFFFFF' }}>
            BranDive SocialFlow <span style={{ color: 'var(--brandive-blue)' }}>AI</span>
          </h1>
          <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Multi-Platform Campaign Automation SaaS
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#EF4444',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              marginBottom: '18px',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label className="bms-label">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="bms-input"
              required
            />
          </div>

          <div style={{ marginBottom: '22px' }}>
            <label className="bms-label">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="bms-input"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bms-btn-primary"
            style={{ width: '100%', padding: '11px', fontSize: '0.92rem' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Credentials Quick-Fill Button */}
        <div
          style={{
            marginTop: '22px',
            paddingTop: '18px',
            borderTop: '1px solid var(--border)',
            textAlign: 'center',
          }}
        >
          <button
            type="button"
            onClick={handleDemoFill}
            className="bms-btn-secondary"
            style={{
              width: '100%',
              fontSize: '0.78rem',
              padding: '8px',
              borderColor: 'var(--border-brand)',
            }}
          >
            <Sparkles size={14} color="var(--brandive-blue)" />
            <span>Fill Demo Account (demo@brandivemedsols.com)</span>
          </button>
          <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>
            Password: <code>Password123!</code>
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            fontSize: '0.72rem',
            color: 'var(--text-muted)',
            marginTop: '20px',
          }}
        >
          <ShieldCheck size={14} color="var(--brandive-blue)" />
          <span>Strict Tenant Isolation & AES-256 Encrypted Token Vault</span>
        </div>
      </div>
    </div>
  );
}
