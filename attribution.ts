// ════════════════════════════════════════════════════════════
// attribution.ts — where did this lead actually come from?
// ════════════════════════════════════════════════════════════
//
// Captures UTM params + referrer the FIRST time someone lands, and
// keeps them for 30 days. Without this, a completed Roadmap or a
// captured email can't be traced back to the ad, post, or channel that
// produced it — so there's no way to know what marketing is working.
//
// Stored on first touch (not last) so the original source survives the
// visitor bouncing around the site before converting.
// ════════════════════════════════════════════════════════════

const KEY = 'swrv_attribution';
const TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export interface Attribution {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer?: string;
  landing_page?: string;
  first_seen?: string;
}

/**
 * Call once on app load. Records first-touch attribution if we don't
 * already have a fresh one. Safe to call repeatedly.
 */
export function initAttribution(): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = localStorage.getItem(KEY);
    if (existing) {
      const parsed = JSON.parse(existing) as Attribution;
      const ts = parsed.first_seen ? Date.parse(parsed.first_seen) : 0;
      if (ts && Date.now() - ts < TTL_MS) return; // still fresh — keep first touch
    }

    const p = new URLSearchParams(window.location.search);
    const ref = document.referrer || '';
    // Ignore self-referrals — they tell us nothing about acquisition.
    const isSelf = ref.includes(window.location.hostname);

    const data: Attribution = {
      utm_source: p.get('utm_source') || undefined,
      utm_medium: p.get('utm_medium') || undefined,
      utm_campaign: p.get('utm_campaign') || undefined,
      utm_content: p.get('utm_content') || undefined,
      utm_term: p.get('utm_term') || undefined,
      referrer: !ref || isSelf ? undefined : ref,
      landing_page: window.location.pathname || '/',
      first_seen: new Date().toISOString(),
    };
    localStorage.setItem(KEY, JSON.stringify(data));
  } catch { /* private mode etc — attribution is best-effort */ }
}

/** Read stored attribution (empty object if none/unavailable). */
export function getAttribution(): Attribution {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Attribution) : {};
  } catch { return {}; }
}

/**
 * Compact single-string summary for storing next to a captured email
 * (e.g. "instagram / social / spring-promo | ref: t.co").
 * Returns '' when we have nothing useful — i.e. direct traffic.
 */
export function attributionSummary(): string {
  const a = getAttribution();
  const parts: string[] = [];
  const utm = [a.utm_source, a.utm_medium, a.utm_campaign].filter(Boolean).join(' / ');
  if (utm) parts.push(utm);
  if (a.referrer) {
    try { parts.push(`ref: ${new URL(a.referrer).hostname}`); }
    catch { parts.push(`ref: ${a.referrer}`); }
  }
  if (a.landing_page && a.landing_page !== '/') parts.push(`landed: ${a.landing_page}`);
  return parts.join(' | ');
}
