import React from 'react';

const milestones = [
  { year: '2005', label: 'Where It Started', detail: 'Zion "SWRV" Birdsong began building brands and telling stories before the industry had a name for it.' },
  { year: '2010', label: 'The Movement Grows', detail: 'Clients from music, ministry, athletics, and business. Real people. Real visions. Real results.' },
  { year: '2015', label: 'Full Service Unlocked', detail: 'Expanded into photography, videography, original music, jingles, and brand media production.' },
  { year: '2020', label: 'Built to Evolve', detail: 'When the world shut down, SWRV adapted. New platforms, new tools, same love-driven mission.' },
  { year: 'NOW', label: 'SWRV On The Go', detail: 'A full-service brand ecosystem that swerves with you — wherever your vision is trying to go.' },
];

export const AboutSWRV: React.FC = () => {
  return (
    <section id="about-swrv" className="py-28 bg-black text-white">
      <div className="container mx-auto px-6 max-w-5xl">

        {/* Header */}
        <div className="mb-20">
          <p className="text-lion-orange text-xs font-bold tracking-[0.4em] uppercase mb-4">// ORIGIN STORY</p>
          <h2 className="text-5xl md:text-7xl font-black uppercase leading-none tracking-tight mb-6">
            ABOUT<br />
            <span className="text-lion-orange">SWRV ON THE GO</span>
          </h2>
          <div className="w-16 h-[2px] bg-lion-orange mb-8" />
          <p className="text-white/70 text-lg leading-relaxed max-w-2xl">
            We didn't start as an agency. We started as a calling — a genuine desire to help artists, 
            visionaries, and everyday people show the world who they really are.
          </p>
        </div>

        {/* Story Block */}
        <div className="grid md:grid-cols-2 gap-16 mb-24">
          <div>
            <h3 className="text-2xl font-black uppercase text-white mb-5 tracking-wide">Where We Come From</h3>
            <p className="text-white/65 leading-loose mb-5">
              Over 20 years ago, Zion "SWRV" Birdsong started doing something most people couldn't put 
              a category on — helping people build their brand before branding was cool. Musicians. 
              Coaches. Pastors. Business owners. People with a vision and no roadmap to execute it.
            </p>
            <p className="text-white/65 leading-loose">
              He showed up with a camera, a microphone, a genuine care for people's stories, 
              and a relentless drive to make their vision real. That's not a pitch. That's just 
              what happened — over and over — for two decades.
            </p>
          </div>
          <div>
            <h3 className="text-2xl font-black uppercase text-white mb-5 tracking-wide">What We've Been Doing</h3>
            <p className="text-white/65 leading-loose mb-5">
              Photography. Videography. Original music and jingles. Commercials. Radio shows turned 
              podcasts. Vision and mission statements. Brand strategy. Web presence. Content creation 
              from concept to delivery.
            </p>
            <p className="text-white/65 leading-loose">
              Not as separate vendors charging you three different invoices — but as one integrated 
              team that knows your story, your voice, and your vision. We build with you. Not just for you.
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-24">
          <h3 className="text-xl font-black uppercase text-white/40 tracking-[0.3em] mb-12">// 20+ YEARS OF REAL WORK</h3>
          <div className="relative">
            {/* Line */}
            <div className="absolute left-0 md:left-1/2 top-0 bottom-0 w-[1px] bg-white/10 md:-translate-x-1/2" />

            <div className="space-y-12">
              {milestones.map((m, i) => (
                <div key={m.year} className={`relative flex ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'} items-start gap-8 pl-8 md:pl-0`}>
                  {/* Dot */}
                  <div className="absolute left-[-5px] md:left-1/2 top-1 w-3 h-3 rounded-full bg-lion-orange md:-translate-x-1/2 shrink-0" />

                  {/* Year */}
                  <div className={`hidden md:block w-1/2 ${i % 2 === 0 ? 'text-right pr-12' : 'text-left pl-12'}`}>
                    <span className="text-5xl font-black text-white/10 tracking-tight">{m.year}</span>
                  </div>

                  {/* Content */}
                  <div className={`w-full md:w-1/2 ${i % 2 === 0 ? 'pl-0 md:pl-12' : 'pr-0 md:pr-12'}`}>
                    <span className="text-lion-orange text-xs font-bold tracking-widest uppercase">{m.year}</span>
                    <h4 className="text-white font-bold text-lg mt-1 mb-2">{m.label}</h4>
                    <p className="text-white/55 text-sm leading-relaxed">{m.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Where We're Going */}
        <div className="border border-white/10 p-10 md:p-14 bg-white/[0.02]">
          <p className="text-lion-orange text-xs font-bold tracking-[0.4em] uppercase mb-4">// WHERE WE'RE GOING</p>
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
