import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { AboutSWRV } from '../components/AboutSWRV';
import { Shop } from '../modules/shop/Shop';
import { Pipeline } from '../components/Pipeline';
import { ContactSchedule } from '../components/ContactSchedule';

// Suite 6 — About, Shop & Contact. Old hash links (#contact, #shop,
// #revving-up) keep working since those ids are unchanged on the
// underlying components — this page just scrolls to them on arrival.
export const AboutShopContactPage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-white font-sans text-lion-black">
      <Header />
      <main className="pt-28 md:pt-32">
        <AboutSWRV />
        <Shop />
        <Pipeline />
        <ContactSchedule />
      </main>
      <Footer />
    </div>
  );
};
