import React, { useState } from 'react';
import { Database, Globe, FileText, CheckCircle, ArrowRight, Mic, BookOpen, Shield, Star, Briefcase, Music } from 'lucide-react';
import { SERVICES } from '../constants';
import { VisionRoadmapBuilder } from './VisionRoadmapBuilder';

const IconMap: Record<string, React.ReactNode> = {
  "Database": <Mic size={40} strokeWidth={1.5} />,
  "Globe": <Star size={40} strokeWidth={1.5} />,
  "FileText": <BookOpen size={40} strokeWidth={1.5} />,
  "CheckCircle": <Shield size={40} strokeWidth={1.5} />,
  "Briefcase": <Briefcase size={40} strokeWidth={1.5} />,
  "Music": <Music size={40} strokeWidth={1.5} />
};

export const Services: React.FC = () => {
  const [isVisionRoadmapOpen, setIsVisionRoadmapOpen] = useState(false);

  return (
    <>
    <section id="ecosystem" className="py-24 bg-white">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="mb-20">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            {/* Left: Title + Description + Streaming */}
            <div className="md:col-span-3">
              <div className="mb-4">
                <h3 className="text-sm font-bold text-gray-900 tracking-widest uppercase mb-2">
                  Zion SWRV Birdsong
                </h3>
                <div className="w-16 h-1.5 bg-lion-orange rounded-full"></div>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-black leading-tight mb-4">
                The SWRV Ecosystem
              </h2>
              <div className="inline-flex items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-lion-orange/10 border border-lion-orange/30 text-lion-orange text-xs font-bold tracking-[0.2em] uppercase rounded-sm">Coming Soon</span>
                <span className="text-gray-400 text-xs tracking-wide">Full ecosystem launching soon</span>
              </div>
              <p className="text-gray-600 max-w-xl text-lg leading-relaxed mb-8">
                <span className="font-bold text-black">You are the brand.</span> Build something people can be a part of. Explore our central hub for artist development, physical training partnership, vocal mastery, authorship, and wisdom. Whether you're an independent creator or part of a label, everything here is designed to empower you to own your lane and build your legacy.
              </p>
              {/* Streaming Links */}
              <div className="flex flex-col gap-3">
                <p className="text-xs font-bold text-gray-400 tracking-[0.25em] uppercase">Stream the music</p>
                <div className="flex items-center gap-5">
                  <a href="https://open.spotify.com/artist/3noCTilUeexCew6d0okQA9/discography" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-600 hover:text-[#1DB954] transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/></svg>
                    <span className="text-sm font-semibold tracking-wide group-hover:underline">Spotify</span>
                  </a>
                  <a href="https://music.apple.com/us/artist/swrv-birdsong/1683244084" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-600 hover:text-[#FA243C] transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M23.994 6.124a9.23 9.23 0 0 0-.24-2.19c-.317-1.31-1.062-2.31-2.18-3.043A5.022 5.022 0 0 0 19.7.237a10.1 10.1 0 0 0-1.838-.122C17.137.072 16.415.05 15.692.05H8.31c-.724 0-1.446.021-2.17.064A10.1 10.1 0 0 0 4.3.237a5.022 5.022 0 0 0-1.874.654C1.31 1.624.564 2.624.247 3.934a9.23 9.23 0 0 0-.24 2.19C-.006 6.848-.02 7.572-.02 8.296v7.408c0 .724.014 1.448.028 2.172a9.23 9.23 0 0 0 .24 2.19c.317 1.31 1.062 2.31 2.18 3.043a5.022 5.022 0 0 0 1.874.654c.625.094 1.258.132 1.838.146.724.042 1.446.064 2.17.064h7.382c.736 0 1.446-.021 2.17-.064.58-.014 1.213-.052 1.838-.146a5.022 5.022 0 0 0 1.874-.654c1.118-.733 1.863-1.733 2.18-3.043a9.23 9.23 0 0 0 .24-2.19c.014-.724.028-1.448.028-2.172V8.296c0-.724-.014-1.448-.028-2.172zM16.95 17.08c0 .18-.032.328-.064.456a1.474 1.474 0 0 1-.764.908c-.284.154-.612.234-.96.246-.54.018-1.08-.166-1.428-.516-.348-.35-.528-.852-.516-1.392.012-.54.21-1.032.576-1.368.366-.336.876-.504 1.416-.486.186.006.36.036.528.084V11.1l-4.476 1.002v5.516c0 .18-.032.328-.064.456a1.474 1.474 0 0 1-.764.908c-.284.154-.612.234-.96.246-.54.018-1.08-.166-1.428-.516-.348-.35-.528-.852-.516-1.392.012-.54.21-1.032.576-1.368.366-.336.876-.504 1.416-.486.186.006.36.036.528.084V9.888c0-.252.072-.474.216-.648.144-.174.336-.294.564-.348l5.316-1.26c.156-.036.312-.024.444.036.132.06.234.168.288.312.036.096.054.204.054.324v8.766z"/></svg>
                    <span className="text-sm font-semibold tracking-wide group-hover:underline">Apple Music</span>
                  </a>
                  <a href="https://www.youtube.com/channel/UC8EPUWGx3Jld-eUH19lpxBA" target="_blank" rel="noopener noreferrer" className="group flex items-center gap-2 text-gray-600 hover:text-[#FF0000] transition-colors">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
                    <span className="text-sm font-semibold tracking-wide group-hover:underline">YouTube</span>
                  </a>
                </div>
              </div>
            </div>
            {/* Right: Helmet Image */}
            <div className="md:col-span-2 flex flex-col items-center">
              <a href="https://swrvbirdsong.netlify.app/" target="_blank" rel="noopener noreferrer" className="block group">
                <img
                  src="https://res.cloudinary.com/dastq6bk5/image/upload/v1775906943/1752950982581945_2_kk3jt3_ui7upw.png"
                  alt="Meet the leader of the revolution"
                  style={{ width: '100%', maxWidth: 380, display: 'block', border: '2.5px solid #D4572A', boxShadow: '0 16px 48px 0 rgba(10,8,4,0.16)', borderRadius: '18px' }}
                  className="transition-transform duration-300 group-hover:scale-105 mx-auto"
                />
                <p className="text-center mt-3 text-sm font-bold tracking-[0.18em] uppercase text-lion-orange">
                  Meet the leader of the revolution →
                </p>
              </a>
            </div>
          </div>
        </div>
        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {SERVICES.map((service, idx) => {
            const isBrandPlanning = service.title === "Brand Planning";
            const isArtistDev = service.title === "Artist Development";
            const isBYOB = service.title === "BYOB Training";
            const isAuthorship = service.title === "Authorship";
            const isPodcast = service.title === "SWRV Talk Podcast";
            const isExternal = isBYOB || isAuthorship || isPodcast;
            const href = isBYOB ? "https://trainbyob.me" : isAuthorship ? "https://swrvbirdsong.netlify.app/#books" : isPodcast ? "https://swrvbirdsong.netlify.app/#podcast" : `#${service.title.toLowerCase().replace(/\s+/g, '-')}`;
            return (
              <div
                key={idx} 
                className={`relative border-b border-gray-200 pb-8 transition-colors duration-300 block ${isBrandPlanning || isArtistDev ? 'cursor-not-allowed select-none' : 'group cursor-pointer hover:border-lion-orange'}`}
                onClick={() => !isBrandPlanning && !isArtistDev && isBrandPlanning && setIsVisionRoadmapOpen(true)}
              >
                {(isBrandPlanning || isArtistDev) && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
                    <div className="rotate-[-20deg] border-4 border-lion-orange/70 px-5 py-2 opacity-80">
                      <span className="text-lion-orange text-sm font-black tracking-[0.3em] uppercase">Coming Soon</span>
                    </div>
                  </div>
                )}
                {!isBrandPlanning && !isArtistDev ? (
                  <a 
                    href={href}
                    target={isExternal ? "_blank" : "_self"}
                    rel={isExternal ? "noopener noreferrer" : ""}
                    className="block"
                  >
                    <div className="text-gray-400 mb-8 group-hover:text-lion-orange transition-colors duration-300">
                      {IconMap[service.icon]}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-1 group-hover:text-lion-orange transition-colors">
                      {service.title}
                    </h3>
                    {isBYOB && (
                      <p className="text-xs font-semibold text-lion-orange tracking-widest uppercase mb-4">Be Your Own Bodyguard</p>
                    )}
                    {!isBYOB && <div className="mb-4" />}
                    <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                      {service.description}
                    </p>
                    <div className="flex items-center text-lion-orange font-bold text-sm tracking-wide opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                      {isBYOB ? "VISIT TRAINBYOB.ME" : isAuthorship ? "VIEW BOOKS" : isPodcast ? "LISTEN TO THE PODCAST" : "EXPLORE BRANCH"} <ArrowRight size={16} className="ml-2" />
                    </div>
                  </a>
                ) : (
                  <div className="block pointer-events-none opacity-50">
                    <div className="text-gray-400 mb-8">
                      {IconMap[service.icon]}
                    </div>
                    <h3 className="text-xl font-bold text-black mb-1">
                      {service.title}
                    </h3>
                    <div className="mb-4" />
                    <p className="text-gray-600 mb-8 leading-relaxed text-sm">
                      {service.description}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>

    <VisionRoadmapBuilder
      isOpen={isVisionRoadmapOpen}
      onClose={() => setIsVisionRoadmapOpen(false)}
    />
    </>
  );
};