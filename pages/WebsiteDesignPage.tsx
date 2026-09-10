import React from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { NeedAWebsite } from '../components/NeedAWebsite';

// Suite 3 — Website Design. $300 templates + custom builds.
export const WebsiteDesignPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white font-sans text-lion-black">
      <Header />
      <main className="pt-28 md:pt-32">
        <NeedAWebsite />
      </main>
      <Footer />
    </div>
  );
};
