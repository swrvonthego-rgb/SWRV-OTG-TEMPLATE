import React, { useState } from 'react';
import { LAUNCH_MODE } from '../site.config';

export const LaunchBanner: React.FC = () => {
  const [dismissed, setDismissed] = useState(false);
  if (!LAUNCH_MODE.active || dismissed) return null;

  return (
    <div
      style={{
        background: 'linear-gradient(135deg,#1a1408 0%,#0a0804 50%,#1a1408 100%)',
        borderBottom: '1px solid rgba(200,168,75,0.4)',
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        position: 'relative',
        zIndex: 100,
      }}
    >
      {/* Ambient glow */}
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center,rgba(200,168,75,0.08),transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center', position: 'relative' }}>
        <span style={{
          padding: '4px 12px',
          background: 'linear-gradient(135deg,#c8a84b,#e8c96a)',
          color: '#0a0804',
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          borderRadius: 4,
          flexShrink: 0,
        }}>
          {LAUNCH_MODE.badge}
        </span>

        <p style={{ margin: 0, fontSize: 13, color: 'rgba(237,232,220,0.9)', fontWeight: 500, letterSpacing: '0.02em', textAlign: 'center' }}>
          <span style={{ color: '#c8a84b', fontWeight: 700 }}>SWRV On The Go</span> is officially open for business — now accepting new clients.
        </p>

        <a
          href="#contact"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 16px',
            border: '1px solid rgba(200,168,75,0.5)',
            color: '#c8a84b',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            borderRadius: 999,
            textDecoration: 'none',
            transition: 'all 0.2s',
            flexShrink: 0,
            whiteSpace: 'nowrap',
          }}
        >
          Reach Out →
        </a>
      </div>

      <button
        onClick={() => setDismissed(true)}
        style={{ position: 'absolute', right: 16, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 18, lineHeight: 1, padding: 4 }}
      >
        ×
      </button>
    </div>
  );
};
