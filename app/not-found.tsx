import React from 'react';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#080D1A',
        color: '#F8FAFC',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        padding: '24px',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(14, 136, 211, 0.15)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '20px',
          border: '1px solid rgba(14, 136, 211, 0.3)',
        }}
      >
        <span style={{ fontSize: '28px', fontWeight: 800, color: '#38BDF8' }}>404</span>
      </div>
      <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>Page Not Found</h1>
      <p style={{ color: '#94A3B8', maxWidth: '440px', marginBottom: '28px', fontSize: '0.95rem' }}>
        The page you are looking for does not exist or has been moved within BranDive SocialFlow AI.
      </p>
      <Link
        href="/"
        style={{
          backgroundColor: '#0E88D3',
          color: '#FFFFFF',
          padding: '12px 24px',
          borderRadius: '8px',
          textDecoration: 'none',
          fontWeight: 600,
          fontSize: '0.9rem',
          boxShadow: '0 4px 14px rgba(14, 136, 211, 0.35)',
        }}
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
