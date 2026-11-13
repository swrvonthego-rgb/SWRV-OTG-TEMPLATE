# AGENTS

## "Clients on the Go" — the client quote template

When Zion says **"Clients on the Go"** (or "the clients template", "a client
quote"), he means this quote system — not a new project, not a new repo.

- `quotes.ts` — **one entry per client**, keyed by the slug in their link:
  artist, project, quote number, date, format, `minSongs`, `courtesyPct`, and
  the vision notes (`lede` + `points`, with `**bold**` and `*italic*`).
- `pages/QuotePage.tsx` — the template that renders any entry at
  `/quote/<slug>`. All money comes from `quoteMusicOrder()` in `site.config.ts`;
  no price is ever typed into the page or the entry.
- `pages/quote-page.css` — the quote's design system, matched to Book & Pay.

### Rules

- The order is **always half now, half on completion**. There is no pay-in-full
  path on a quote.
- Totals, bundle %, per-song price, the due-now amount, the Cash App link and
  the add-a-song ladder are computed. To change a number, change the deal
  (`minSongs`, `courtesyPct`) or `site.config.ts` — never the markup.
- **Adding a client is one entry in `quotes.ts`.** Nothing else changes.
- **Never change an existing client's page when adding a new one.** Before
  deploying, load each existing quote and confirm its approved copy and totals
  still render. `deebeauxx` (DeeBeauxx / Living the Dream) is final.
- Deploy by committing and pushing to `main`; GitHub Actions runs
  `wrangler deploy`. There are no wrangler credentials in the workspace, so
  `npx wrangler deploy` will not work here.
- New client details usually arrive as a call transcript. Pull the project name,
  format, song count and their creative direction from it; write the vision
  notes in their language rather than generic copy. Ask if the transcript is
  thin on direction.

### Known limit

This template prices **music recording** (songs, bundle ladder, per-song). A
speaking engagement, workshop, consulting or design project does not fit it and
needs its own variant — do not force those into a song count.
