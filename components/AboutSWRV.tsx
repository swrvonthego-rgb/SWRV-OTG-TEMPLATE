import React from 'react';
import { ABOUT } from '../site.config';

export const AboutSWRV: React.FC = () => {
  return (
    <section id="about-swrv" className="py-28 bg-black text-white">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header */}
        <div className="mb-20">
          <p className="text-lion-orange text-xs font-bold tracking-[0.4em] uppercase mb-4">
            {ABOUT.eyebrow}
          </p>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tight mb-6">
            {ABOUT.title}<br />
            <span className="text-lion-orange">{ABOUT.titleAccent}</span>
          </h2>
          <div className="w-16 h-[2px] bg-lion-orange mb-8" />
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            {ABOUT.intro}
          </p>
        </div>

        {/* Story Blocks */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          {ABOUT.blocks.map((block) => (
            <div key={block.heading}>
              <h3 className="text-2xl font-black uppercase text-white mb-5 tracking-wide">
                {block.heading}
              </h3>
              {block.paragraphs.map((p, i) => (
                <p key={i} className="text-white/65 leading-loose mb-5 last:mb-0">
                  {p}
                </p>
              ))}
            </div>
          ))}
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <h3 className="text-xl font-black uppercase text-white/40 tracking-[0.3em] mb-12">
            // 20+ YEARS OF REAL WORK
          </h3>
          <div className="relative">
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 md:-translate-x-1/2" />
            <div className="space-y-12">
              {ABOUT.timeline.map((m, i) => (
                <div
                  key={m.year}
                  className={`relative flex ${
                    i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  } items-start gap-8 pl-8 md:pl-0`}
                >
                  <div className="absolute left-[-5px] md:left-1/2 top-1 w-3 h-3 rounded-full bg-lion-orange md:-translate-x-1/2 shrink-0" />
                  <div
                    className={`hidden md:block w-1/2 ${
                      i % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'
                    }`}
                  >
                    <span className="text-5xl font-black text-white/10 tracking-tight">
                      {m.year}
                    </span>
                  </div>
                  <div
                    className={`w-full md:w-1/2 ${
                      i % 2 === 0 ? 'pl-0 md:pl-12' : 'pr-0 md:pr-12'
                    }`}
                  >
                    <span className="text-lion-orange text-xs font-bold tracking-widest uppercase">
                      {m.year}
                    </span>
                    <h4 className="text-white font-bold text-lg mt-1 mb-2">{m.label}</h4>
                    <p className="text-white/55 text-sm leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Where We're Going (kept inline since it's a one-off block) */}
        <div className="border border-white/10 p-10 md:p-14 bg-white/[0.02]">
          <p className="text-lion-orange text-xs font-bold tracking-[0.4em] uppercase mb-4">
            // WHERE WE'RE GOING
          </p>
          <h3 className="text-3xl md:text-4xl font-black uppercase leading-tight mb-6">
            The Mission<br />Never Stopped.
          </h3>
          <p className="text-white/65 leading-loose max-w-2xl mb-8">
            SWRV On The Go is expanding — more services, more builders, more ways to bring your
            vision to life fast. From 48-hour landing pages to full brand ecosystems, from monthly
            care plans to cinematic brand videos — we're building the infrastructure that lets every
            artist, every entrepreneur, and every movement get the brand support they deserve.
          </p>
          <p className="text-white font-bold text-lg">
            We don't stop. <span className="text-lion-orange">We Swerve On The Go.</span>
          </p>
        </div>

      </div>
    </section>
  );
};
