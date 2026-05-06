import React, { useState, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import { NAV_ITEMS } from '../constants';
import { Button } from './Button';

export const Header: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header className="fixed w-full z-50 font-sans">
      {/* Top Utility Bar - Hidden on mobile, visible on desktop */}
      <div className={`hidden lg:flex justify-end items-center gap-6 px-8 py-2 bg-black transition-all duration-300 ${scrolled ? 'h-0 overflow-hidden py-0' : 'h-10'}`}>
        <a href="https://trainbyob.me" target="_blank" rel="noopener noreferrer" className="text-[10px] font-bold text-gray-300 hover:text-white tracking-wider uppercase">Train BYOB</a>
        <a href="#books" className="text-[10px] font-bold text-gray-300 hover:text-white tracking-wider uppercase">Books</a>
        <a href="#podcast" className="text-[10px] font-bold text-gray-300 hover:text-white tracking-wider uppercase">Podcast</a>
        
        <div className="flex items-center">
            <button className="flex items-center gap-1 bg-lion-orange text-white px-3 py-1 text-[11px] font-bold rounded-sm hover:bg-[#FF6020] transition-colors">
              <span>Connect</span>
              <ChevronDown size={12} />
            </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className={`bg-black transition-all duration-300 border-b border-gray-800 ${scrolled ? 'py-2 shadow-lg' : 'py-4'}`}>
        <div className="container mx-auto px-4 md:px-8 flex justify-between items-center h-full">
          
          {/* Logo */}
          <a href="#swrv-ecosystem" className="flex items-center z-50 cursor-pointer hover:opacity-80 transition-opacity">
            <img 
              src="https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png" 
              alt="Swrv On The Go Logo" 
              className="h-10 md:h-12 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {NAV_ITEMS.map((item) => (
              <a 
                key={item.label} 
                href={item.href}
                target={item.target}
                rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                className="text-[13px] font-bold text-white hover:text-lion-orange transition-colors tracking-wide"
              >
                {item.label}
              </a>
            ))}
             <a href="#" className="text-[13px] font-bold text-lion-orange hover:text-white transition-colors tracking-wide">
                BOOK NOW
            </a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
             <Button variant="primary" size="sm" className="!rounded-sm !text-[12px] !px-6 !py-2.5">
               GET IN TOUCH
             </Button>
          </div>

          {/* Mobile Toggle */}
          <button 
            className="lg:hidden z-50 text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>

          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="absolute top-0 left-0 w-full h-screen bg-black flex flex-col items-center justify-center gap-8 lg:hidden z-40">
              {NAV_ITEMS.map((item) => (
                <a 
                  key={item.label} 
                  href={item.href}
                  target={item.target}
                  rel={item.target === '_blank' ? 'noopener noreferrer' : undefined}
                  className="text-xl font-bold text-white hover:text-lion-orange"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button variant="primary" size="lg">GET IN TOUCH</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};