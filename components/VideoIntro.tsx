import React, { useEffect, useRef, useState } from 'react';

export const VideoIntro: React.FC = () => {
  const [phase, setPhase] = useState<'fullscreen' | 'transitioning' | 'inline'>('fullscreen');
  const containerRef = useRef<HTMLDivElement>(null);
  const [fixedStyle, setFixedStyle] = useState<React.CSSProperties>({
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    zIndex: 9999,
    borderRadius: '0px',
    objectFit: 'cover',
  });

  useEffect(() => {
    if (phase === 'fullscreen' || phase === 'transitioning') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    const startTransition = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setPhase('transitioning');
        
        // We use top/left/width/height to allow object-fit: cover to animate smoothly
        // across different aspect ratios.
        setFixedStyle({
          position: 'fixed',
          top: `${rect.top}px`,
          left: `${rect.left}px`,
          width: `${rect.width}px`,
          height: `${rect.height}px`,
          zIndex: 9999,
          borderRadius: '12px',
          objectFit: 'cover',
          transition: 'all 1.2s ease-in-out',
        });

        setTimeout(() => {
          setPhase('inline');
        }, 1200);
      }
    };

    const timer = setTimeout(startTransition, 3000);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {/* Fullscreen overlay background that fades out */}
      {(phase === 'fullscreen' || phase === 'transitioning') && (
        <div 
          className="fixed inset-0 bg-black z-[9998]"
          style={{
            opacity: phase === 'fullscreen' ? 1 : 0,
            transition: 'opacity 1.2s ease-in-out',
            pointerEvents: 'none'
          }}
        />
      )}

      {/* Inline placeholder */}
      <div 
        ref={containerRef} 
        className="relative w-full max-w-[480px] aspect-video rounded-xl overflow-hidden shadow-2xl border border-white/10 bg-black/50 my-8"
      >
        <video
          src="https://res.cloudinary.com/dastq6bk5/video/upload/v1775906948/SWRV_WEB_4k_gifq4n_u5zwta.mp4"
          autoPlay
          muted
          loop
          playsInline
          style={phase === 'inline' ? {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            borderRadius: '12px',
            objectFit: 'cover',
          } : fixedStyle}
        />
      </div>
    </>
  );
};
