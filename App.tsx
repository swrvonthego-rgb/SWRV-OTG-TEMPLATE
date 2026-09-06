import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom';

// ── Suite pages ──────────────────────────────────────────────
import { Lobby } from './pages/Lobby';
import { CreativeServicesPage } from './pages/CreativeServicesPage';
import { WebsiteDesignPage } from './pages/WebsiteDesignPage';
import { ZionSuitePage } from './pages/ZionSuitePage';
import { FamilyPage } from './pages/FamilyPage';
import { AboutShopContactPage } from './pages/AboutShopContactPage';

// ── Full-bleed, self-contained experiences (own close/back button) ──
import { Roadmap } from './modules/roadmap/Roadmap';
import { Byob } from './modules/byob/Byob';
import { Birdsong } from './modules/birdsong/Birdsong';
import { ProjectIntake } from './components/ProjectIntake';

// ── Global chrome ────────────────────────────────────────────
import { LiveChat } from './components/LiveChat';
import { AdminPage } from './modules/admin/AdminPage';

import { visionTenantSlug, resolveLegacyRedirect } from './deepLink';
import { initAttribution } from './attribution';

// Record first-touch marketing attribution (UTM + referrer) before React
// mounts, so a lead captured later can be traced to the channel that sent it.
initAttribution();

// ── CONSOLE FINGERPRINT ─────────────────────────────────────────────
// Fires once on load — brands the devtools, deters casual copying
if (typeof window !== 'undefined') {
  const s1 = 'color:#c8a84b;font-size:18px;font-weight:900;font-family:Georgia,serif';
  const s2 = 'color:#ede8dc;font-size:12px;font-family:monospace';
  const s3 = 'color:#888;font-size:11px';
  console.log('%cSWRV ON THE GO', s1);
  console.log('%c© 2025 Swerve (Robert Birdsong). All rights reserved.', s2);
  console.log('%cThis site is proprietary. Unauthorized copying is prohibited.', s3);
  console.log('%cswrvonthego.pro', s3);
}

// Any old bookmarked/shared/indexed path that isn't a real route anymore
// (see LEGACY_REDIRECTS in deepLink.ts) lands here and gets sent to its
// new suite instead of 404ing.
const LegacyRedirect: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    const target = resolveLegacyRedirect(location.pathname);
    navigate(target || '/', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return null;
};

const AppShell: React.FC = () => {
  const navigate = useNavigate();
  const [intakeService, setIntakeService] = useState<{ id: string; name: string } | null>(null);

  // ── REFERRAL TRACKING ─────────────────────────────────────────────
  // Capture ?ref=CODE from URL and store in localStorage for attribution
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      localStorage.setItem('swrv_ref', ref.toUpperCase());
      localStorage.setItem('swrv_ref_ts', Date.now().toString());
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    }
    const ts = localStorage.getItem('swrv_ref_ts');
    if (ts && Date.now() - parseInt(ts) > 30 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem('swrv_ref');
      localStorage.removeItem('swrv_ref_ts');
    }
  }, []);

  // ── Global "open X" events (dispatched from Header, Hero, LiveChat,
  // Footer, NeedAWebsite, ServicesMenu, etc.) now navigate to a real
  // route instead of toggling overlay state. The event contract itself
  // is unchanged, so none of those dispatchers needed to change.
  useEffect(() => {
    const handler = () => navigate('/roadmap');
    window.addEventListener('swrv:open-roadmap', handler);
    return () => window.removeEventListener('swrv:open-roadmap', handler);
  }, [navigate]);

  useEffect(() => {
    const handler = () => navigate('/creative-services');
    window.addEventListener('swrv:open-services', handler);
    return () => window.removeEventListener('swrv:open-services', handler);
  }, [navigate]);

  useEffect(() => {
    const handler = () => {
      navigate('/zion');
      // Let Zion mount, then jump to #booking via its existing section listener.
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('swrv:zion-section', { detail: 'booking' }));
      }, 350);
    };
    window.addEventListener('swrv:open-zion-booking', handler);
    return () => window.removeEventListener('swrv:open-zion-booking', handler);
  }, [navigate]);

  // Services menu / cards can open intake for a specific service — this
  // stays a global overlay (not a route) since it can be triggered from
  // any suite page.
  useEffect(() => {
    const handler = (e: Event) => {
      const { id, name } = (e as CustomEvent<{ id: string; name: string }>).detail;
      setIntakeService({ id, name });
    };
    window.addEventListener('swrv:open-intake', handler);
    return () => window.removeEventListener('swrv:open-intake', handler);
  }, []);

  return (
    <>
      <Routes>
        <Route path="/admin" element={<AdminPage />} />
        <Route path="/" element={<Lobby />} />
        <Route
          path="/roadmap"
          element={
            <Roadmap
              isOpen={true}
              onClose={() => navigate('/')}
              onOpenServices={() => navigate('/creative-services')}
              tenantSlug={visionTenantSlug()}
            />
          }
        />
        <Route
          path="/vision/:slug"
          element={
            <Roadmap
              isOpen={true}
              onClose={() => navigate('/')}
              onOpenServices={() => navigate('/creative-services')}
              tenantSlug={visionTenantSlug()}
            />
          }
        />
        <Route path="/creative-services" element={<CreativeServicesPage />} />
        <Route path="/website-design" element={<WebsiteDesignPage />} />
        <Route path="/zion" element={<ZionSuitePage />} />
        <Route path="/family" element={<FamilyPage />} />
        <Route path="/family/byob" element={<Byob isOpen={true} onClose={() => navigate('/family')} />} />
        <Route path="/family/birdsong" element={<Birdsong isOpen={true} onClose={() => navigate('/family')} />} />
        <Route path="/about" element={<AboutShopContactPage />} />
        <Route path="*" element={<LegacyRedirect />} />
      </Routes>

      {/* Project Intake — full intake form overlay, reachable from any page */}
      <ProjectIntake
        isOpen={!!intakeService}
        onClose={() => setIntakeService(null)}
        serviceId={intakeService?.id}
        serviceName={intakeService?.name}
      />

      {/* Live Chat — floating widget bottom-right, on every page */}
      <LiveChat
        onOpenBooking={() => {
          navigate('/about');
          setTimeout(() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }), 200);
        }}
      />
    </>
  );
};

const App: React.FC = () => (
  <BrowserRouter>
    <AppShell />
  </BrowserRouter>
);

export default App;
