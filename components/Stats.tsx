import React from 'react';

export const Stats: React.FC = () => {
  return (
    <section className="py-20 bg-lion-dark text-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-800">
          <div>
            <div className="text-4xl md:text-5xl font-bold text-lion-orange mb-2">25+</div>
            <div className="text-sm md:text-base text-white/80">Years of Guidance</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-lion-orange mb-2">350+</div>
            <div className="text-sm md:text-base text-white/80">Routes Mapped</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-lion-orange mb-2">1M+</div>
            <div className="text-sm md:text-base text-white/80">Lives Impacted</div>
          </div>
          <div>
            <div className="text-4xl md:text-5xl font-bold text-lion-orange mb-2">500</div>
            <div className="text-sm md:text-base text-white/80">Partners</div>
          </div>
        </div>
      </div>
    </section>
  );
};