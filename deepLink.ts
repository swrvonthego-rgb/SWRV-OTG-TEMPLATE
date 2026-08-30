// ════════════════════════════════════════════════════════════
// deepLink.ts — clean-path deep link resolver
// ════════════════════════════════════════════════════════════
//
// Cloudflare's `not_found_handling: single-page-application` serves
// index.html for unknown paths WITHOUT running the Worker, so the
// Worker's SHORTCUTS redirects never fire for direct navigations.
// We resolve the intent from the pathname here — client-side, and
// WITHOUT rewriting the address bar — so shared links both work AND
// stay clean (e.g. the URL stays /roadmap, not /?roadmap=start).
//
// Consumed by App.tsx (roadmap open, section scroll, catalog tab) and
// Roadmap.tsx (skip straight into the test). One source of truth.
// ════════════════════════════════════════════════════════════

// Clean paths that drop the visitor straight into the Roadmap test.
export const ROADMAP_PATHS = ['/roadmap', '/the-roadmap', '/start', '/test', '/roadmap-test'];

// Vision Portal — /vision/:slug drops a client business's own customers
// straight into a tenant-branded Roadmap (see modules/roadmap/Roadmap.tsx's
// `tenantSlug` prop). Plain /roadmap above is unaffected and stays the
// default SWRV experience.
const VISION_PATH_RE = /^\/vision\/([a-z0-9-]+)$/;

export function visionTenantSlug(): string | null {
  const match = path().match(VISION_PATH_RE);
  return match ? match[1] : null;
}

// Clean paths → homepage section anchors.
export const SECTION_HASH: Record<string, string> = {
  '/portfolio': 'portfolio',
  '/about': 'about-swrv',
  '/contact': 'contact',
  '/byob': 'byob',
  '/shop': 'shop',
  '/websites': 'need-a-website',
  '/templates': 'website-templates',
  '/revving-up': 'revving-up',
};

// Clean paths → Full Menu catalog tabs.
export const CATALOG_TAB: Record<string, string> = {
  '/menu': 'videography',
  '/videography': 'videography',
  '/video': 'videography',
  '/audio': 'audio-production',
  '/music': 'audio-production',
  '/web': 'web-digital',
  '/brand': 'brand-identity',
  '/coaching': 'coaching',
  '/business': 'content-business',
};

// Current pathname with any trailing slashes stripped ('' → '/').
function path(): string {
  if (typeof window === 'undefined') return '/';
  return window.location.pathname.replace(/\/+$/, '') || '/';
}

export function roadmapParam(): string | null {
  if (typeof window === 'undefined') return null;
  return new URLSearchParams(window.location.search).get('roadmap');
}

// Should the roadmap overlay be open at all? (?roadmap=1|start OR a roadmap
// path OR a /vision/:slug tenant link)
export function isRoadmapOpenIntent(): boolean {
  const rm = roadmapParam();
  return rm === '1' || rm === 'start' || ROADMAP_PATHS.includes(path()) || !!visionTenantSlug();
}

// Should we skip the "Before You Begin" gate and drop straight into the test?
export function isRoadmapStartIntent(): boolean {
  return roadmapParam() === 'start' || ROADMAP_PATHS.includes(path()) || !!visionTenantSlug();
}

// Resolve a homepage section id from a clean path or a #hash.
// Catalog paths resolve to the Full Menu section so we scroll there.
export function sectionTarget(): string | null {
  if (typeof window === 'undefined') return null;
  const p = path();
  if (SECTION_HASH[p]) return SECTION_HASH[p];
  if (CATALOG_TAB[p]) return 'full-menu';
  const h = window.location.hash.replace('#', '');
  return h || null;
}

// Resolve the catalog tab from a clean path or ?catalog=.
export function catalogTab(): string | null {
  if (typeof window === 'undefined') return null;
  const p = path();
  if (CATALOG_TAB[p]) return CATALOG_TAB[p];
  return new URLSearchParams(window.location.search).get('catalog');
}

// True for any non-root entry — used to skip the splash + intro video.
export function isDeepLinkEntry(): boolean {
  if (typeof window === 'undefined') return false;
  const { hash, search } = window.location;
  return !!(hash || search || path() !== '/');
}
