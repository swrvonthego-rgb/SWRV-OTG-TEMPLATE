import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ServicesMenu } from '../modules/services-menu/ServicesMenu';

// Suite 2 — Creative Services. ServicesMenu was already a "browse
// everything" catalog (grouped by category, with search) — the closest
// existing thing to a real directory — so it becomes this suite's page
// body directly, full-bleed, exactly as it already looked as an overlay.
export const CreativeServicesPage: React.FC = () => {
  const navigate = useNavigate();
  // /content#sm-cat-web-digital etc. (from the landing page) scrolls to that section.
  useEffect(() => {
    const id = window.location.hash.replace('#', '');
    if (!id) return;
    const t = window.setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
    return () => window.clearTimeout(t);
  }, []);
  return (
    <ServicesMenu
      isOpen={true}
      isHome
      onClose={() => navigate('/')}
      onBookStrategyCall={() => {
        navigate('/about');
        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('swrv:preset-topic', { detail: 'Strategy Call' }));
          document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 150);
      }}
    />
  );
};
