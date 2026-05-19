import React from 'react';
import { STATS } from '../site.config';

export const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-lion-dark text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800 mb-14">
          {STATS.map((stat, i) => (
            <div key={i}>
              <div className="text-4xl md:text-5xl font-bold text-lion-orange mb-2">
                {stat.value}
              </div>
              <div className="text-sm md:text-base text-white/80">{stat.label}</div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <p className="text-white/40 text-sm mb-4 tracking-wider uppercase">Ready to add yours?</p>
          <a href="#contact"
            className="inline-flex items-center gap-2 px-7 py-3 font-bold text-sm tracking-widest uppercase rounded-full transition-all"
            style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804' }}>
            Book a Service →
          </a>
        </div>
      </div>
    </section>
  );
};
