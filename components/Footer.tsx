import React from 'react';
import { Facebook, Twitter, Linkedin, Youtube, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#121212] text-white pt-24 pb-12 border-t border-gray-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-20">
          
          <div className="col-span-2 lg:col-span-2 pr-8">
            <img 
              src="https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png" 
              alt="Swrv On The Go Logo" 
              className="h-16 w-auto object-contain mb-6"
              referrerPolicy="no-referrer"
            />
            <div className="mb-6">
              <p className="text-gray-300 tracking-[0.2em] uppercase text-[10px] md:text-xs font-bold">
                <span className="text-lion-orange text-sm">S</span>erving{' '}
                <span className="text-lion-orange text-sm">W</span>ith{' '}
                <span className="text-lion-orange text-sm">R</span>ighteous{' '}
                <span className="text-lion-orange text-sm">V</span>ision
              </p>
            </div>
            <p className="text-gray-400 mb-8 max-w-md leading-relaxed text-sm">
              Zion SWRV Birdsong Headquarters. The central hub for artist development, physical training, authorship, and wisdom. Let Love GPS.
            </p>
            <div className="flex gap-6 items-center">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Follow Zion:</span>
              <Instagram className="w-5 h-5 text-gray-500 hover:text-lion-orange cursor-pointer transition-colors" />
              <Youtube className="w-5 h-5 text-gray-500 hover:text-lion-orange cursor-pointer transition-colors" />
              <Linkedin className="w-5 h-5 text-gray-500 hover:text-lion-orange cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h5 className="font-bold mb-6 text-white uppercase text-sm tracking-wider">The Ecosystem</h5>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Artist Development</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Brand Planning & LLCs</li>
              <li><a href="https://trainbyob.me" target="_blank" rel="noopener noreferrer" className="hover:text-lion-orange transition-colors">BYOB Training</a></li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">SWRV In Your Gift (Book)</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">The RoadMap (Book)</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">SWRV Talk Podcast</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6 text-white uppercase text-sm tracking-wider">Content Pillars</h5>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Training (BYOB)</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Wisdom & Motivation</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Artist Development</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Behind The Scenes</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold mb-6 text-white uppercase text-sm tracking-wider">Connect</h5>
            <ul className="space-y-4 text-gray-500 text-sm font-medium">
              <li className="hover:text-lion-orange cursor-pointer transition-colors">About Zion</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Contact</li>
              <li className="hover:text-lion-orange cursor-pointer transition-colors">Book a Consultation</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600 font-medium">
          <div className="flex gap-8 mb-4 md:mb-0">
            <span className="hover:text-white cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer transition-colors">Terms of Use</span>
          </div>
          <div>
            &copy; {new Date().getFullYear()} SWRV On The Go LLC. All Rights Reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};