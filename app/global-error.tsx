'use client';

import React from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#080D1A',
          color: '#F8FAFC',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          textAlign: 'center',
          padding: '24px',
        }}
      >
        <h2 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '12px' }}>Something went wrong</h2>
        <p style={{ color: '#94A3B8', maxWidth: '400px', marginBottom: '24px', fontSize: '0.9rem' }}>
          An unexpected error occurred while loading this page.
        </p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: '#0E88D3',
            color: '#FFFFFF',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
