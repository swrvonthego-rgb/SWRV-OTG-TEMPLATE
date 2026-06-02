import React, { useEffect } from 'react';

export const BrandTransmission: React.FC<{ skipIntro?: boolean }> = ({ skipIntro = false }) => {

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
    <section
      id="brand-transmission"
      style={{
        position: 'relative',
        width: '100%',
        height: '100svh',
        minHeight: 600,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      {/* iframe fills the entire section — tap inside it triggers audio on iOS */}
      <iframe
        src={skipIntro ? "about:blank" : "/brand-transmission.html"}
        loading="lazy"
        title="Swrv On-The-Go — Brand Transmission"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
        }}
        allow="autoplay; speech-synthesis; microphone; fullscreen"
      />
    </section>
  );
};
