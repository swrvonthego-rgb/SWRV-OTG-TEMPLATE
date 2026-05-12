import React, { useEffect } from 'react';

export const BrandTransmission: React.FC = () => {

  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === 'TRANSMISSION_COMPLETE') {
        document.getElementById('ecosystem')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('message', handler);
    return () => window.removeEventListener('message', handler);
  }, []);

  return (
    <>
      <section id="swrv-ecosystem" className="relative bg-black overflow-hidden py-20 px-6 flex flex-col items-center text-center">

        {/* Scanline texture */}
        <div className="pointer-events-none absolute inset-0 opacity-30" style={{
          background: 'repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 4px)',
        }} />

        {/* Radial glow */}
        <div className="pointer-events-none absolute inset-0" style={{
          background: 'radial-gradient(ellipse 70% 55% at 50% 50%, rgba(255,215,0,0.07) 0%, transparent 70%)',
        }} />

        {/* Label */}
        <p className="relative z-10 mb-5 text-xs tracking-[0.5em] uppercase" style={{
          fontFamily: "'Share Tech Mono', monospace", color: 'rgba(0,255,255,0.55)'
        }}>
          // THE SWRV ECOSYSTEM
        </p>

        {/* Headline */}
        <h2 className="relative z-10 font-black uppercase leading-none mb-4" style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: 'clamp(2.2rem, 7vw, 5.5rem)',
          color: '#FF4D00',
          textShadow: '0 0 30px rgba(255,77,0,0.5), 0 0 60px rgba(255,77,0,0.2)',
          letterSpacing: '0.04em',
        }}>
          SWRV ECOSYSTEM
        </h2>

        {/* Rule */}
        <div className="relative z-10 mb-6" style={{
          width: 80, height: 1, background: '#FF4D00', boxShadow: '0 0 8px #FF4D00'
        }} />

        {/* Sub copy */}
        <p className="relative z-10 mb-8 max-w-lg leading-relaxed" style={{
          fontFamily: "'Share Tech Mono', monospace",
          fontSize: 'clamp(0.72rem, 1.5vw, 0.9rem)',
          color: 'rgba(224,248,255,0.55)',
          letterSpacing: '0.06em',
        }}>
          Swerve on Roadblocks. Let Love GPS.
          <br />
          Tap the screen below — then tap <strong style={{ color: 'rgba(0,255,255,0.8)' }}>[ INITIATE TRANSMISSION ]</strong> to begin.
        </p>

        {/* ── Embedded iframe ──
            The iframe's own "INITIATE TRANSMISSION" start screen is the ONE tap.
            That tap is a gesture INSIDE the iframe context — iOS unlocks audio. ── */}
        <div className="relative z-10 w-full" style={{
          maxWidth: 900,
          aspectRatio: '16/9',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 0 0 1px rgba(255,215,0,0.25), 0 24px 64px rgba(0,0,0,0.8), 0 0 40px rgba(255,77,0,0.08)',
        }}>
          <iframe
            src="/brand-transmission.html"
            title="Swrv On-The-Go — Brand Transmission"
            style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            allow="autoplay; speech-synthesis; microphone; fullscreen"
          />
        </div>

        {/* Corner HUD accents */}
        <span className="pointer-events-none absolute top-6 left-6 w-5 h-5 border-t border-l" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
        <span className="pointer-events-none absolute top-6 right-6 w-5 h-5 border-t border-r" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
        <span className="pointer-events-none absolute bottom-6 left-6 w-5 h-5 border-b border-l" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
        <span className="pointer-events-none absolute bottom-6 right-6 w-5 h-5 border-b border-r" style={{ borderColor: 'rgba(0,255,255,0.3)' }} />
      </section>
    </>
  );
};
