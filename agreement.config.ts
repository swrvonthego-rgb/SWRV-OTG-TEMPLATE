import type { Service } from './site.config';

// ════════════════════════════════════════════════════════════
// agreement.config.ts — the service agreement signed at checkout
// ════════════════════════════════════════════════════════════
// Built from the package itself (site.config.ts) plus the site's Terms of
// Service (public/terms.html), so it never promises anything the site
// doesn't already say. The Book & Pay modal shows it and the Worker
// rebuilds it on its own from the catalog when saving a signature, so the
// stored text can't be edited by the browser. Bump AGREEMENT_VERSION
// whenever the wording below changes.
// ════════════════════════════════════════════════════════════

export const AGREEMENT_VERSION = '2026-09-27';

export interface AgreementInput {
  service: Service;
  optionLabel?: string;
  addOnLabels: string[];
  totalCents: number;
  dueTodayCents: number;
  clientName: string;
  clientEmail: string;
  date?: string; // event date or preferred start date, yyyy-MM-dd
}

export interface Agreement {
  title: string;
  // One-line facts for the compact receipt view.
  summary: { label: string; value: string }[];
  // Numbered clauses for the full agreement.
  clauses: { heading: string; body: string }[];
}

const usd = (cents: number) => `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: cents % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;

export function buildAgreement(a: AgreementInput): Agreement {
  const s = a.service;
  const monthly = s.checkoutCategory === 'monthly';
  const event = s.checkoutCategory === 'event';
  const pkg = [s.name, a.optionLabel].filter(Boolean).join(' — ') + (a.addOnLabels.length ? ` + ${a.addOnLabels.join(' + ')}` : '');

  const summary = [
    { label: 'Client', value: `${a.clientName} (${a.clientEmail})` },
    { label: 'Package', value: pkg },
    { label: event ? 'Event date' : 'Start date', value: a.date || 'To be confirmed' },
    { label: monthly ? 'Monthly investment' : 'Total investment', value: `${usd(a.totalCents)}${monthly ? '/month' : ''}` },
    { label: monthly ? 'Due today (first month)' : 'Due today (50% deposit)', value: usd(a.dueTodayCents) },
  ];
  if (!monthly) summary.push({ label: 'Balance', value: `${usd(a.totalCents - a.dueTodayCents)}, invoiced ${event ? 'before the event' : 'on delivery'}` });

  const scope = [
    s.blurb,
    s.includes?.length ? `Included: ${s.includes.join('; ')}.` : '',
    s.notIncludes?.length ? `Not included: ${s.notIncludes.join('; ')}.` : '',
    s.deliveryDays ? `Estimated delivery: ${s.deliveryDays} days after kickoff.` : '',
  ].filter(Boolean).join(' ');

  const payment = monthly
    ? `The first month (${usd(a.dueTodayCents)}) is paid today. The same amount is billed every month on the same date until the plan is cancelled. The client can cancel anytime by emailing info@swrvonthego.pro before the next billing date.`
    : `A 50% deposit (${usd(a.dueTodayCents)}) is paid today and confirms the booking. The balance (${usd(a.totalCents - a.dueTodayCents)}) is invoiced ${event ? 'before the event' : 'when the work is delivered'} and is due on that invoice.`;

  const clauses = [
    { heading: 'Services', body: `SWRV On The Go will provide ${pkg}. ${scope}` },
    { heading: 'Payment', body: payment },
    ...(s.terms ? [{ heading: 'Package terms', body: s.terms }] : []),
    // Live performances have nothing to revise.
    ...(event && s.revisions == null ? [] : [{ heading: 'Revisions', body: s.revisions != null
      ? `This package includes ${s.revisions} round${s.revisions === 1 ? '' : 's'} of revisions. Additional revisions beyond the included rounds may be billed at SWRV's standard hourly rate.`
      : 'Revisions are handled as described in the package. Additional revisions beyond what is included may be billed at SWRV\'s standard hourly rate.' }]),
    { heading: 'Refunds', body: 'Because the work is custom, refunds are handled case by case. Contact info@swrvonthego.pro within 48 hours of the project kickoff with any concerns.' },
    { heading: 'Rights', body: 'Upon full payment, the client receives full rights to the delivered work product, except where the package terms above say otherwise. SWRV On The Go may display completed work in its portfolio unless otherwise agreed in writing.' },
    { heading: 'Terms of Service', body: 'This agreement includes the SWRV On The Go Terms of Service at swrvonthego.pro/terms.' },
    { heading: 'Electronic signature', body: 'By signing below, the client agrees to this agreement and agrees that this electronic signature is as valid as a handwritten one.' },
  ];

  return { title: `Service Agreement — ${s.name}`, summary, clauses };
}

// Plain text of the whole agreement, in a stable order. The Worker stores
// this exact text and its SHA-256 fingerprint with each signature.
export function agreementText(ag: Agreement): string {
  return [
    ag.title,
    `Version ${AGREEMENT_VERSION}`,
    '',
    ...ag.summary.map((l) => `${l.label}: ${l.value}`),
    '',
    ...ag.clauses.map((c, i) => `${i + 1}. ${c.heading}. ${c.body}`),
  ].join('\n');
}
