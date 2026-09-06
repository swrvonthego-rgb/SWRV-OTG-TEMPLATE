import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap } from 'lucide-react';
import { Zion } from '../modules/zion/Zion';
import { ArtistDevelopment } from '../components/ArtistDevelopment';

// Suite 4 — Zion & Artist Development. Zion's page is already a
// complete, self-contained full-screen experience (its own close/back
// button, own scroll) — reused as-is. ArtistDevelopment was built as a
// centered modal dialog and was never mounted anywhere in the app; it's
// wired up here for the first time via a floating button, without
// touching Zion.tsx's internals.
export const ZionSuitePage: React.FC = () => {
  const navigate = useNavigate();
  const [showDevelopment, setShowDevelopment] = useState(false);

  return (
    <>
      <Zion isOpen={true} onClose={() => navigate('/')} />

      <button
        type="button"
        onClick={() => setShowDevelopment(true)}
        aria-label="Open Artist Development"
        style={{
          position: 'fixed', bottom: '24px', left: '24px', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '12px 20px', borderRadius: '999px',
          background: 'rgba(10,8,4,0.9)', border: '1.5px solid #c8a84b',
          color: '#c8a84b', fontSize: '12px', fontWeight: 700,
          letterSpacing: '0.15em', textTransform: 'uppercase', cursor: 'pointer',
        }}
      >
        <GraduationCap size={18} />
        Artist Development
      </button>

      <ArtistDevelopment isOpen={showDevelopment} onClose={() => setShowDevelopment(false)} />
    </>
  );
};
