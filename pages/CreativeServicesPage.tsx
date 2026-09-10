import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ServicesMenu } from '../modules/services-menu/ServicesMenu';

// Suite 2 — Creative Services. ServicesMenu was already a "browse
// everything" catalog (grouped by category, with search) — the closest
// existing thing to a real directory — so it becomes this suite's page
// body directly, full-bleed, exactly as it already looked as an overlay.
export const CreativeServicesPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <ServicesMenu
      isOpen={true}
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
