import React, { useRef, useState, useEffect } from 'react';
import { Volume2, VolumeX, Play, Pause, RotateCcw } from 'lucide-react';

export const AutoServices: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
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

  const replayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="relative w-full bg-black flex flex-col">
      {/* Full Screen Video Section */}
      <div className="relative w-full h-screen">
        <video
          ref={videoRef}
          src="https://res.cloudinary.com/dastq6bk5/video/upload/v1775906956/copy_506106AC-E7D2-4CDF-A553-6E2DC5A6894F_ckn5nm_cynppw.mov"
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
        />
        
        {/* Video Controls */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center gap-6 bg-black/50 backdrop-blur-md px-6 py-3 rounded-full border border-white/10 z-10">
          <button 
            onClick={togglePlay}
            className="text-white hover:text-lion-orange transition-colors"
            aria-label={isPlaying ? "Pause" : "Play"}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          
          <button 
            onClick={replayVideo}
            className="text-white hover:text-lion-orange transition-colors"
            aria-label="Replay"
          >
            <RotateCcw size={24} />
          </button>
          
          <button 
            onClick={toggleMute}
            className="text-white hover:text-lion-orange transition-colors"
            aria-label={isMuted ? "Unmute" : "Mute"}
          >
            {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
          </button>
        </div>
      </div>

      {/* Auto Services Section Underneath */}
      <div className="py-24 bg-white text-black">
        <div className="container mx-auto px-4">
          <div className="mb-16 text-center">
            <h2 className="text-4xl md:text-5xl font-bold text-black mb-4 uppercase tracking-tight">
              Swrv-On-The-Go <span className="text-lion-orange">Auto Services</span>
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto text-lg">
              Premium automotive care and detailing services that come to you, ensuring your ride is always ready for the spotlight.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8 border border-gray-200 rounded-xl hover:border-lion-orange transition-colors group">
              <h3 className="text-2xl font-bold mb-4 group-hover:text-lion-orange transition-colors">Mobile Detailing</h3>
              <p className="text-gray-600">Comprehensive interior and exterior cleaning, paint correction, and ceramic coating at your location.</p>
            </div>
            <div className="p-8 border border-gray-200 rounded-xl hover:border-lion-orange transition-colors group">
              <h3 className="text-2xl font-bold mb-4 group-hover:text-lion-orange transition-colors">Fleet Maintenance</h3>
              <p className="text-gray-600">Routine maintenance and upkeep for artist tour vehicles and executive transport fleets.</p>
            </div>
            <div className="p-8 border border-gray-200 rounded-xl hover:border-lion-orange transition-colors group">
              <h3 className="text-2xl font-bold mb-4 group-hover:text-lion-orange transition-colors">Emergency Assist</h3>
              <p className="text-gray-600">On-demand roadside assistance and quick-fix solutions to keep your journey uninterrupted.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
