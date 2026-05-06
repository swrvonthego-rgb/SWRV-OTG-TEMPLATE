import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Maximize, Minimize, RotateCcw, X } from 'lucide-react';

export const SecondaryIntro: React.FC<{ skipIntro?: boolean }> = ({ skipIntro = false }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<'waiting' | 'playing' | 'ended'>('waiting');
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isCinematic, setIsCinematic] = useState(false);
  const [isDismissed, setIsDismissed] = useState(skipIntro);

  const handleDismiss = () => {
    if (videoRef.current) videoRef.current.pause();
    document.body.style.overflow = '';
    setPhase('ended');
    setIsDismissed(true);
    document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    // Wait for the initial video to finish shrinking (3s delay + 1.2s transition)
    const timer = setTimeout(() => {
      setPhase('playing');
      if (videoRef.current) {
        videoRef.current.muted = false;
        setIsMuted(false);
        videoRef.current.play().catch(console.error);
      }
    }, 4200);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (phase === 'playing') {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  useEffect(() => {
    if (phase === 'ended') {
      // Automatically go to the SWRV Artist Services section
      document.getElementById('hero-section')?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [phase]);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleEnded = () => {
    if (phase !== 'ended') {
      setPhase('ended');
    }
    
    // Automatically mute after it finishes playing and loop it
    if (videoRef.current) {
      videoRef.current.muted = true;
      setIsMuted(true);
      videoRef.current.play().catch(console.error);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = async () => {
    if (!document.fullscreenElement) {
      await containerRef.current?.requestFullscreen().catch(console.error);
    } else {
      await document.exitFullscreen().catch(console.error);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      // Unmute when replaying so they can hear it again
      videoRef.current.muted = false;
      setIsMuted(false);
      setIsCinematic(false);
      videoRef.current.play().catch(console.error);
      setPhase('playing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const { currentTime, duration } = videoRef.current;
      // Assuming the S logo appears in the last 4 seconds of the video
      // This will resize the video to fit the iPhone view so the logo isn't cropped
      if (duration && duration - currentTime <= 4) {
        setIsCinematic(true);
      } else if (currentTime < 1) {
        setIsCinematic(false);
      }
    }
  };

  if (isDismissed) return null;

  let wrapperClasses = '';
  if (phase === 'waiting') {
    wrapperClasses = 'fixed inset-0 opacity-0 pointer-events-none -z-10';
  } else if (phase === 'playing') {
    wrapperClasses = 'fixed inset-0 w-full h-screen bg-black overflow-hidden opacity-100 z-[100]';
  } else if (phase === 'ended') {
    wrapperClasses = 'relative w-full h-screen bg-black overflow-hidden z-10';
  }

  return (
    <div ref={containerRef} className={wrapperClasses} style={{ overflowAnchor: 'none' }}>
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/dastq6bk5/video/upload/v1775906956/copy_506106AC-E7D2-4CDF-A553-6E2DC5A6894F_ckn5nm_cynppw.mov"
        playsInline
        onEnded={handleEnded}
        onTimeUpdate={handleTimeUpdate}
        className={`w-full h-full transition-all duration-1000 ease-in-out ${
          isCinematic ? 'object-contain scale-100' : 'object-cover scale-105'
        }`}
      />
      
      {/* Controls */}
      {(phase === 'playing' || phase === 'ended') && (
        <div className="absolute bottom-8 right-8 flex items-center gap-4 z-50">
          <button 
            onClick={handleReplay}
            className="p-3 bg-black/50 hover:bg-lion-orange text-white rounded-full backdrop-blur-sm transition-all"
            title="Replay"
          >
            <RotateCcw size={20} />
          </button>
          <button 
            onClick={toggleMute}
            className="p-3 bg-black/50 hover:bg-lion-orange text-white rounded-full backdrop-blur-sm transition-all"
            title={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
          </button>
          <button 
            onClick={toggleFullscreen}
            className="p-3 bg-black/50 hover:bg-lion-orange text-white rounded-full backdrop-blur-sm transition-all"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
          </button>
          <button
            onClick={handleDismiss}
            className="p-3 bg-black/50 hover:bg-red-500 text-white rounded-full backdrop-blur-sm transition-all"
            title="Close video"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );
};
