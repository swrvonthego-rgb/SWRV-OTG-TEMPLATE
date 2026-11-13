// ════════════════════════════════════════════════════════════════════════
// QUOTES — one entry per artist
//
// Every quote page at /quote/<slug> renders from the entry with that slug.
// Nothing about a client is typed into the page itself: the total, bundle
// percentage, per-song price, the half-now split, the Cash App amount and the
// add-a-song ladder all come from quoteMusicOrder() in site.config.ts, so a
// new quote can never drift from what checkout would charge.
//
// TO ADD A CLIENT
//   1. Copy the entry below, change the key and `slug` to whatever goes in
//      the link (letters, numbers, dashes — /quote/that-word).
//   2. Fill the fields from the call transcript.
//   3. Write their vision points — a line or two per song idea, in their
//      words. Song titles go in *asterisks*, the way she said them.
//   4. Deploy. The link is live at swrvonthego.pro/quote/<slug>.
//
// WHAT ALREADY AGREES WITH ITSELF, so it never needs typing: prices, tier
// discounts (5/10/15/20%), the per-song math, half now / half on completion,
// the Apple Cash amount and every row of the ladder.
// ════════════════════════════════════════════════════════════════════════

export type QuoteClient = {
  // ── who it's for ────────────────────────────────────────────────────────
  slug: string;
  /** Artist name as it should read on the page and in the payment text. */
  artist: string;
  /** The project title — the page's headline. */
  project: string;
  /** Quote number for their records, e.g. "Quote 004". */
  quoteNo: string;
  /** Date it was sent, written how they should read it. */
  date: string;
  /** "EP recording" · "Single" · "Mixtape" — what they're buying. */
  format: string;
  /** "audio only" until video is part of the deal. */
  audio: string;

  // ── the deal ────────────────────────────────────────────────────────────
  /** Smallest order you'll take. The stepper stops here and the ladder starts here. */
  minSongs: number;
  /** Extra % off the list price, on top of the bundle tier. 0 for no courtesy. */
  courtesyPct: number;

  // ── the read ────────────────────────────────────────────────────────────
  vision: {
    /** One line that sums the project up. */
    lede: string;
    /** One point per song idea or direction, from the transcript. */
    points: string[];
  };
};

export const QUOTES: Record<string, QuoteClient> = {
  deebeauxx: {
    slug: 'deebeauxx',
    artist: 'DeeBeauxx',
    project: 'Living the Dream',
    quoteNo: 'Quote 001',
    date: 'Nov 12, 2026',
    format: 'EP recording',
    audio: 'audio only',

    // Four songs is her deal, and the extra 5% off the list base is exactly
    // the $200 courtesy: the four-song bundle is $3,400 (15%), she pays $3,200.
    minSongs: 4,
    courtesyPct: 5,

    vision: {
      lede: 'One EP, one mood, and a name you already had before any of this started.',
      points: [
        '**Early-2000s glamour pop** — the lane you and Zion already tapped on the last record. Janet, Toni, Britney, Beyoncé energy: big hooks, clean lines, expensive.',
        '**A rap record with Buckhead Baddy energy** — that *Bills, Bills, Bills* bounce and a ladies’ anthem in the spirit of *Nice For What*. For the girls who run their own everything.',
        '**A ’90s R&B / hip-hop soul moment** — Mary, Lil Kim, *I Can Love You* and *Ladies Night* energy. The kind of record that makes a grown woman grab her purse and her friend.',
        '**An ’80s funk record** with that *Flashlight* feel — the groove that opens a City Girls song and never apologizes.',
        '**A cover**, because the girls don’t do them anymore. Not reinvented — delivered, the way *Who Can I Run To* and *I’m Every Woman* stayed the same song and still became somebody else’s hit.',
        '**Dancehall on that Fiesta riddim energy** — the rhythm that carried *Dude* and a hundred other records, because that’s how Jamaica does it: one riddim, everybody’s story on it.',
        '**A power ballad** in the *Love On The Brain* lane, where the voice does the heavy lifting.',
      ],
    },
  },
};

/** Slug lookup — case-insensitive so a link typed in caps still opens. */
export const getQuote = (slug?: string): QuoteClient | undefined =>
  slug ? QUOTES[slug.trim().toLowerCase()] : undefined;
