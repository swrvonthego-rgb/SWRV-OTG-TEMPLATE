import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw, Maximize, Minimize, X } from 'lucide-react';

export const ShowcaseVideo: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLElement>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const handleDismiss = () => {
    if (videoRef.current) videoRef.current.pause();
    setIsDismissed(true);
  };

  useEffect(() => {
    // Start paused and at the beginning
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }

    // Wait exactly 3 seconds (when the first video starts shrinking)
    // then play this video with full volume.
    const timer = setTimeout(() => {
      setIsMuted(false);
      setIsPlaying(true);
      if (videoRef.current) {
        videoRef.current.muted = false;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(err => {
            console.error("Autoplay blocked:", err);
            // Fallback if somehow still blocked
            setIsMuted(true);
            if (videoRef.current) {
              videoRef.current.muted = true;
              videoRef.current.play().catch(e => console.log(e));
            }
          });
        }
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleReplay = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    // Exit fullscreen if active before scrolling
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    // Scroll to the next section smoothly
    window.scrollTo({
      top: window.innerHeight,
      behavior: 'smooth'
    });
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <section ref={containerRef} className={`relative w-full h-screen bg-black overflow-hidden transition-all duration-500 ${isDismissed ? 'hidden' : ''}`}>
      <video
        ref={videoRef}
        src="https://res.cloudinary.com/dastq6bk5/video/upload/v1775906956/copy_506106AC-E7D2-4CDF-A553-6E2DC5A6894F_ckn5nm_cynppw.mov"
        muted={isMuted}
        onEnded={handleVideoEnded}
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      />
      
      {/* Controls Overlay */}
      <div className="absolute bottom-8 right-8 flex items-center gap-3 z-20 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
        <button 
          onClick={togglePlay}
          className="text-white hover:text-lion-orange transition-colors p-1.5"
          aria-label={isPlaying ? "Pause" : "Play"}
        >
          {isPlaying ? <Pause size={20} /> : <Play size={20} />}
        </button>
        
        <button 
          onClick={handleReplay}
          className="text-white hover:text-lion-orange transition-colors p-1.5"
          aria-label="Replay"
        >
          <RotateCcw size={20} />
        </button>
        
        <button 
          onClick={toggleMute}
          className="text-white hover:text-lion-orange transition-colors p-1.5"
          aria-label={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
        </button>

        <div className="w-px h-5 bg-white/20 mx-1"></div>

        <button 
          onClick={toggleFullscreen}
          className="text-white hover:text-lion-orange transition-colors p-1.5"
          aria-label={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        >
          {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
        </button>

        <div className="w-px h-5 bg-white/20 mx-1"></div>

        <button
          onClick={handleDismiss}
          className="text-white hover:text-red-400 transition-colors p-1.5"
          aria-label="Close video"
        >
          <X size={20} />
        </button>
      </div>

      {/* Gradient overlays for smooth blending */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none"></div>
    </section>
  );
};
