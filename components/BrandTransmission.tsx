import React, { useState, useEffect } from 'react';
import { Play, X } from 'lucide-react';

export const BrandTransmission: React.FC = () => {
  const [open, setOpen] = useState(false);

  // Close the modal automatically when the transmission finishes
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'TRANSMISSION_COMPLETE') {
        setOpen(false);
        setTimeout(() => {
          document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' });
        }, 300);
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <>
      {/* ── Section ── */}
      <section id="swrv-ecosystem" className="relative bg-black overflow-hidden py-28 px-6 flex flex-col items-center text-center">

        {/* Subtle scanline texture */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            background:
              'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)',
          }}
        />

        {/* Radial glow behind content */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,215,0,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Label */}
        <p
          className="relative z-10 mb-5 text-xs tracking-[0.5em] uppercase"
          style={{ fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0,255,255,0.55)' }}
        >
          // THE SWRV ECOSYSTEM
        </p>

        {/* Headline */}
        <h2
          className="relative z-10 font-black uppercase leading-none mb-4"
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: 'clamp(2.2rem, 7vw, 5.5rem)',
            color: '#FF4D00',
            textShadow: '0 0 30px rgba(255,77,0,0.5), 0 0 60px rgba(255,77,0,0.2)',
            letterSpacing: '0.04em',
          }}
        >
          SWRV ECOSYSTEM
        </h2>

        {/* Rule */}
        <div
          className="relative z-10 mb-6"
          style={{ width: 80, height: 1, background: '#FF4D00', boxShadow: '0 0 8px #FF4D00' }}
        />

        {/* Sub copy */}
        <p
          className="relative z-10 mb-10 max-w-lg leading-relaxed"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: 'clamp(0.72rem, 1.5vw, 0.9rem)',
            color: 'rgba(224,248,255,0.55)',
            letterSpacing: '0.06em',
          }}
        >
          Swerve on Roadblocks. Let Love GPS.
          <br />
          Watch the full cinematic overview of the Swrv On-The-Go ecosystem.
        </p>

        {/* Play button */}
        <button
          onClick={() => setOpen(true)}
          className="relative z-10 group flex items-center gap-4 border px-10 py-5 uppercase tracking-widest text-sm font-bold transition-all duration-300"
          style={{
            fontFamily: "'Share Tech Mono', monospace",
            borderColor: '#FFD700',
            color: '#FFD700',
            background: 'rgba(0,0,0,0)',
            boxShadow: '0 0 20px rgba(255,215,0,0.15)',
            fontSize: 'clamp(0.6rem, 1.3vw, 0.78rem)',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,215,0,0.1)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 35px rgba(255,215,0,0.4)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = 'rgba(0,0,0,0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 0 20px rgba(255,215,0,0.15)';
          }}
        >
          <Play size={18} fill="currentColor" />
          Initiate Transmission
        </button>

        {/* Meet the Artist link */}
        {/* Meet the Artist link removed as requested */}

        {/* Corner HUD accents */}
        <span className="pointer-events-none absolute top-6 left-6 w-5 h-5 border-t border-l" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
        <span className="pointer-events-none absolute top-6 right-6 w-5 h-5 border-t border-r" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
        <span className="pointer-events-none absolute bottom-6 left-6 w-5 h-5 border-b border-l" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
        <span className="pointer-events-none absolute bottom-6 right-6 w-5 h-5 border-b border-r" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
      </section>

      {/* ── Fullscreen modal overlay ── */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] bg-black"
          style={{ animation: 'fadeIn 0.4s ease' }}
        >
          {/* Close button */}
          <button
            onClick={() => setOpen(false)}
            className="absolute top-4 right-4 z-[10000] flex items-center gap-2 text-xs uppercase tracking-widest border px-4 py-2 transition-all duration-200"
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              borderColor: 'rgba(0,255,255,0.4)',
              color: 'rgba(0,255,255,0.7)',
              background: 'rgba(0,0,10,0.85)',
              backdropFilter: 'blur(6px)',
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = '#00FFFF';
              (e.currentTarget as HTMLButtonElement).style.color = '#00FFFF';
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(0,255,255,0.4)';
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(0,255,255,0.7)';
            }}
          >
            <X size={14} />
            Close
          </button>

          {/* The full brand transmission experience in an iframe */}
          <iframe
            key={open}
            src={`/brand-transmission.html?t=${Date.now()}`}
            title="Swrv On-The-Go — Brand Transmission"
            className="w-full h-full border-0"
            allow="autoplay; speech-synthesis; microphone"
          />
        </div>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
      `}</style>
    </>
  );
};
