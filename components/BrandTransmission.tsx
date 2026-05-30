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
        src="/brand-transmission.html"
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
