import React, { useEffect, useRef } from 'react';
import { VideoIntro } from './VideoIntro';
import { HERO_CAROUSEL } from '../site.config';

type HeroCardData = (typeof HERO_CAROUSEL.column1)[number];
const column1Cards: readonly HeroCardData[] = HERO_CAROUSEL.column1;
const column2Cards: readonly HeroCardData[] = HERO_CAROUSEL.column2;

const HeroCard: React.FC<{ image?: string; video?: string; title: string; subtitle?: string; className?: string }> = ({ image, video, title, subtitle, className }) => (
  <div className={`relative group overflow-hidden rounded-lg w-full flex-shrink-0 border border-white/10 backdrop-blur-md bg-white/5 shadow-2xl ${className}`}>
    {video ? (
       <video 
          src={video} 
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100"
       />
    ) : (
       <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-80 group-hover:opacity-100" />
    )}
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent"></div>
    <div className="absolute bottom-4 left-4 right-4 z-10">
      {subtitle && <div className="text-lion-orange text-xs font-bold mb-1 uppercase tracking-wider">{subtitle}</div>}
      <h3 className="text-white font-bold text-lg md:text-xl leading-tight uppercase drop-shadow-md">{title}</h3>
    </div>
    
    {/* Glass shimmer effect */}
    <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent pointer-events-none mix-blend-overlay"></div>
  </div>
);

export const Hero: React.FC<{ onOpenConsultation: () => void }> = ({ onOpenConsultation }) => {
  return (
    <section id="hero-section" className="relative min-h-screen bg-[#050505] pt-32 pb-20 overflow-hidden flex items-center">
      
      {/* Video Background */}
      <div className="absolute inset-0 z-0">
        <video 
          src={HERO_CAROUSEL.backgroundVideo}
          autoPlay 
          muted 
          loop 
          playsInline 
          className="w-full h-full object-cover opacity-60"
        />
        
        {/* Vignette */}
        <div className="absolute inset-0 bg-radial-gradient-center z-10 pointer-events-none opacity-90"></div>
        {/* Top Fade */}
        <div className="absolute top-0 left-0 w-full h-40 bg-gradient-to-b from-[#050505] to-transparent z-10"></div>
        {/* Bottom Fade */}
        <div className="absolute bottom-0 left-0 w-full h-40 bg-gradient-to-t from-[#050505] to-transparent z-10"></div>
      </div>

      <div className="container mx-auto px-4 z-20 grid lg:grid-cols-2 gap-12 items-center h-full">
        
        {/* Left: Typography */}
        <div className="text-left space-y-12 relative">
           
          <div className="relative">
            <h1 className="font-extrabold leading-none tracking-tighter drop-shadow-2xl">
              <span className="block text-lion-orange" style={{fontSize:'clamp(5rem,16vw,11rem)',lineHeight:1}}>{HERO_CAROUSEL.title.line1}</span>
              <span className="block text-white text-4xl md:text-5xl lg:text-6xl mt-2">{HERO_CAROUSEL.title.line2}</span>
            </h1>
            
            <div className="mt-6 flex items-center gap-4 animate-in fade-in slide-in-from-left-8 duration-1000 delay-300 fill-mode-both">
              <div className="h-[2px] w-12 bg-lion-orange shadow-[0_0_10px_#FF4D00]"></div>
              <p className="text-gray-300 tracking-[0.25em] md:tracking-[0.4em] uppercase text-xs md:text-sm font-bold">
                <span className="text-lion-orange text-base md:text-lg drop-shadow-[0_0_8px_rgba(255,77,0,0.8)]">S</span>erving{' '}
                <span className="text-lion-orange text-base md:text-lg drop-shadow-[0_0_8px_rgba(255,77,0,0.8)]">W</span>ith{' '}
                <span className="text-lion-orange text-base md:text-lg drop-shadow-[0_0_8px_rgba(255,77,0,0.8)]">R</span>ighteous{' '}
                <span className="text-lion-orange text-base md:text-lg drop-shadow-[0_0_8px_rgba(255,77,0,0.8)]">V</span>ision
              </p>
            </div>
          </div>
          
          <div className="flex flex-col gap-6 pl-6 border-l-[6px] border-lion-orange rounded-sm max-w-xl backdrop-blur-md bg-black/60 p-6 border-r border-t border-b border-r-white/5 border-t-white/5 border-b-white/5 shadow-2xl">
             <h2 className="text-3xl md:text-4xl font-bold text-white tracking-wide leading-tight">
              {HERO_CAROUSEL.taglineHeading} <br/>
              <span className="text-lion-orange drop-shadow-[0_0_25px_rgba(255,77,0,0.6)]">{HERO_CAROUSEL.taglineAccent}</span>
            </h2>
             <p className="text-gray-300 font-light text-lg leading-relaxed">
              {HERO_CAROUSEL.taglineBody}
            </p>

            {/* Hero CTAs */}
            <div className="flex gap-3 flex-wrap mt-6">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('swrv:open-roadmap'))}
                className="inline-flex items-center gap-2 px-6 py-3 font-bold text-sm tracking-wider rounded-full transition-all"
                style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', boxShadow: '0 6px 20px rgba(200,168,75,0.35)' }}
              >
                Take the Roadmap
              </button>
              <a href="#ecosystem"
                className="inline-flex items-center gap-2 px-6 py-3 font-semibold text-sm tracking-wider rounded-full transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.2)', color: 'rgba(255,255,255,0.8)' }}
              >
                See Services →
              </a>
            </div>
          </div>
          
          <VideoIntro />
        </div>

        {/* Right: "Bento" Grid Animation */}
        <div className="grid grid-cols-2 gap-6 h-[700px] overflow-hidden relative" style={{ maskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)', WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%, black 90%, transparent)' }}>
           
           {/* Lane 1: Moving Up */}
           <div className="space-y-6 animate-scroll-up">
              {[...column1Cards, ...column1Cards, ...column1Cards, ...column1Cards].map((card, idx) => (
                  <HeroCard 
                    key={`col1-${idx}`}
                    image={card.image}
                    video={card.video}
                    title={card.title}
                    subtitle={card.subtitle}
                    className="h-80"
                  />
              ))}
           </div>

           {/* Lane 2: Moving Down */}
           <div className="space-y-6 animate-scroll-down">
              {[...column2Cards, ...column2Cards, ...column2Cards, ...column2Cards].map((card, idx) => (
                  <HeroCard 
                    key={`col2-${idx}`}
                    image={card.image}
                    video={card.video}
                    title={card.title}
                    subtitle={card.subtitle}
                    className="h-80"
                  />
              ))}
           </div>
        </div>

      </div>
      
      <style>{`
        @keyframes scroll-up {
          0% { transform: translateY(0); }
          100% { transform: translateY(-25%); } 
        }
        @keyframes scroll-down {
          0% { transform: translateY(-25%); }
          100% { transform: translateY(0); }
        }
        .animate-scroll-up {
          animation: scroll-up 40s linear infinite;
        }
        .animate-scroll-down {
          animation: scroll-down 40s linear infinite;
        }
        .animate-scroll-up:hover, .animate-scroll-down:hover {
           animation-play-state: paused;
        }
        .bg-radial-gradient-center {
            background: radial-gradient(circle at center, transparent 0%, rgba(5,5,5,0.8) 100%);
        }
      `}</style>
    </section>
  );
};