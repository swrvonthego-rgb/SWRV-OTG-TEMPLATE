import React, { useEffect, useMemo, useState } from 'react';
import { MUSIC_VIDEO_PRICING, quoteMusicOrder } from '../site.config';
import './quote-page.css';

// ════════════════════════════════════════════════════════════════════════
// CLIENT QUOTE — DeeBeauxx / Living the Dream EP
//
// Styled as the SWRV Book & Pay checkout so a client reading a quote sees the
// same design system they pay in: white sheet, system type, orange CTA,
// Total / Due now / On completion.
//
// The order is ALWAYS half now, half before delivery — there is no
// pay-in-full path here.
//
// The numbers are NOT typed in. They come from the same quoteMusicOrder()
// the Book & Pay modal and the Worker use, including the add-a-song ladder,
// so a quote can never drift from what checkout would charge.
//
// Every rule appears exactly once: the half-down/3-day rule lives only in
// "How we work it", and the final-payment-before-delivery rule only beside
// the balance.
// ════════════════════════════════════════════════════════════════════════

// ── PER-ARTIST BLOCK ─────────────────────────────────────────────────────
// This quote is the template for every artist: everything that changes from
// one client to the next lives here. The pricing, the sections, the payment
// rules and the layout below stay as they are.
const CLIENT = {
  artist: 'DeeBeauxx',
  project: 'Living the Dream',
  quoteNo: 'Quote 001',
  date: 'Nov 12, 2026',
  format: 'EP recording',
  audio: 'audio only',
};

const MIN_SONGS = 4;

// Her quote runs on the standard ladder, then an extra courtesy comes off so
// she can see exactly what was given to her: the four-song bundle is $3,400
// (15%) and the extra 5% is $200, so she pays $3,200. Taken off the list base
// it stays a whole number at every count she picks.
const COURTESY_PCT = 5;
const courtesyFor = (base: number) => Math.round(base * COURTESY_PCT) / 100;

const PAY = {
  cashTag: 'SwrvOnTheGo',
  phone: '404-272-0155',
  phoneLink: '+14042720155',
  email: 'swrvonthego@gmail.com',
};

const LOGO = 'https://res.cloudinary.com/dzqxce5hv/image/upload/v1772222265/Swerve_Badge_eow6m0.png';

// She starts at four and can add from there; the pricing function clamps the
// same ceiling the Book & Pay builder uses.
const MAX_SONGS = MUSIC_VIDEO_PRICING.maxPerType;
const SONG_STEPS = Array.from(
  { length: MAX_SONGS - MIN_SONGS + 1 },
  (_, i) => MIN_SONGS + i,
);

const money = (n: number) =>
  `$${n.toLocaleString('en-US', {
    minimumFractionDigits: n % 1 ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;

// The add-a-song ladder, priced by the same function the checkout uses:
// four songs is the minimum, and the bundle percentage for the WHOLE order
// steps up as songs are added, so the per-song price falls with the order.
const SONG_LADDER = SONG_STEPS.map((n) => {
  const row = quoteMusicOrder(n, 0);
  const total = row.total - courtesyFor(row.base);
  return {
    songs: n,
    pct: row.discountPct,
    standard: row.total,
    total,
    perSong: total / n,
  };
});

const INCLUDED: { name: string; text: string }[] = [
  {
    name: 'Custom-produced beat',
    text: 'Produced for that song\'s lane — not a lease, not a template.',
  },
  {
    name: 'Vocal production',
    text: 'Stacking, ad-libs, comping and tuning. Every take that matters, in its place.',
  },
  {
    name: 'The Birdsong Method',
    text: 'Vocal coaching in the booth — breath, pitch, phrasing, and the delivery that sells the story.',
  },
  {
    name: 'Mix',
    text: 'Balance, EQ, space and effects. Your vocal sitting on top where it belongs.',
  },
  {
    name: 'Master',
    text: 'Loud, clean, and streaming-ready across Spotify, Apple Music, YouTube and the car.',
  },
  {
    name: 'Master WAV + MP3',
    text: 'WAV for distribution, video and DJs. MP3 for quick shares and pitches.',
  },
  {
    name: 'Project stems',
    text: 'Every track exported and labeled. Yours to keep, remix, or take anywhere.',
  },
  {
    name: 'Show mix',
    text: 'A live-ready version for performances, so the record hits the same in the room.',
  },
];

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch {
    return false;
  }
}

const Accordion: React.FC<{
  id: string;
  title: string;
  meta?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ id, title, meta, open, onToggle, children }) => (
  <section className="q-sec">
    <button
      type="button"
      className="q-sec-head"
      aria-expanded={open}
      aria-controls={`${id}-panel`}
      onClick={onToggle}
    >
      <span className="q-sec-text">
        <span className="q-sec-title">{title}</span>
        {meta && <span className="q-sec-meta">{meta}</span>}
      </span>
      <span className={`q-plus ${open ? 'is-open' : ''}`} aria-hidden="true">
        {open ? '−' : '+'}
      </span>
    </button>
    <div
      id={`${id}-panel`}
      className={`q-panel ${open ? 'is-open' : ''}`}
      role="region"
      aria-hidden={!open}
    >
      <div>
        <div className="q-panel-inner">{children}</div>
      </div>
    </div>
  </section>
);

export function QuotePage() {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<string | null>(null);
  // Starts at four. Everything priced on the page — total, bundle percentage,
  // per song, both payments, the Cash App amount and the sticky bar — is
  // derived from this one number.
  const [songs, setSongs] = useState(MIN_SONGS);

  const quote = useMemo(() => quoteMusicOrder(songs, 0), [songs]);
  // Standard ladder price, then her courtesy. Both payments read from this
  // total, so the half is always exactly half of what she owes.
  const courtesy = courtesyFor(quote.base);
  const total = quote.total - courtesy;
  const dueNow = Math.round(total / 2);
  const balance = total - dueNow;
  const perSong = total / songs;
  // Half now only — the single payment link on the page, following the count.
  const cashAppHalfUrl = `https://cash.app/$${PAY.cashTag}/${dueNow}`;
  // Apple Cash is person-to-person, so no link can pre-fill the amount the way
  // Cash App can. This opens Messages with the amount already written in it;
  // she taps the Apple Cash button there and sends it.
  const appleCashUrl = `sms:${PAY.phoneLink}&body=${encodeURIComponent(
    `Apple Cash ${money(dueNow)} — ${CLIENT.project} (${CLIENT.artist})`,
  )}`;

  const toggle = (id: string) => setOpen((cur) => ({ ...cur, [id]: !cur[id] }));

  useEffect(() => {
    const previous = document.title;
    document.title = `Your quote — ${CLIENT.project} · SWRV On The Go`;
    return () => {
      document.title = previous;
    };
  }, []);

  const handleCopy = async (text: string, key: string) => {
    const ok = await copyText(text);
    if (!ok) return;
    setCopied(key);
    window.setTimeout(() => setCopied((cur) => (cur === key ? null : cur)), 1800);
  };

  return (
    <main className="q-page">
      <div className="q-wrap">
        <article className="q-sheet">
          {/* ── HEADER ── */}
          <header className="q-hero">
            <div className="q-brand-row">
              <img className="q-badge" src={LOGO} alt="SWRV On The Go" />
              <div>
                <p className="q-brand">SWRV On The Go</p>
                <p className="q-meta-line">
                  {CLIENT.quoteNo} · {CLIENT.date}
                </p>
              </div>
            </div>

            <p className="q-eyebrow">Prepared for {CLIENT.artist}</p>
            <h1 className="q-title">{CLIENT.project}</h1>
            <p className="q-lede">
              {CLIENT.format} · {songs} songs · {CLIENT.audio}
            </p>
          </header>

          <div className="q-body">
            {/* ── SONG COUNT — the checkout's own stepper, starting at four ── */}
            <div className="q-step">
              <div>
                <p className="q-step-label">Songs</p>
                <p className="q-step-sub">{money(MUSIC_VIDEO_PRICING.song)} each</p>
              </div>
              <div className="q-step-controls">
                <button
                  type="button"
                  className="q-step-btn q-step-less"
                  aria-label="One fewer song"
                  disabled={songs <= MIN_SONGS}
                  onClick={() => setSongs((n) => Math.max(MIN_SONGS, n - 1))}
                >
                  −
                </button>
                <span className="q-step-count" aria-live="polite">
                  {songs}
                </span>
                <button
                  type="button"
                  className="q-step-btn q-step-more"
                  aria-label="One more song"
                  disabled={songs >= MAX_SONGS}
                  onClick={() => setSongs((n) => Math.min(MAX_SONGS, n + 1))}
                >
                  +
                </button>
              </div>
            </div>

            {/* ── TOTAL — the checkout's own Total / Due now / On completion ── */}
            <div className="q-total">
              <div className="q-total-hero">
                <span className="q-total-label">Total</span>
                <span className="q-total-hero-right">
                  <span className="q-amount">{money(total)}</span>
                  <span className="q-was">standard {money(quote.total)}</span>
                </span>
              </div>

              <ul className="q-lines">
                <li>
                  <span>
                    {songs} custom songs
                    <span className="q-lines-sub">{money(MUSIC_VIDEO_PRICING.song)} each</span>
                  </span>
                  <span>{money(quote.base)}</span>
                </li>
                <li className="q-line-save">
                  <span>
                    Bundle discount
                    <span className="q-lines-sub">
                      {quote.discountPct}% off · {songs}-song tier
                    </span>
                  </span>
                  <span>−{money(quote.discount)}</span>
                </li>
                <li className="q-line-save">
                  <span>
                    Your courtesy discount
                    <span className="q-lines-sub">
                      quoted at {money(quote.total)} · yours at {money(total)}
                    </span>
                  </span>
                  <span>−{money(courtesy)}</span>
                </li>
                <li>
                  <span>
                    Per song after the bundle
                    <span className="q-lines-sub">what each record actually costs you</span>
                  </span>
                  <span>{money(perSong)}</span>
                </li>
              </ul>

              <div className="q-save">
                <span className="q-save-badge">You&apos;re saving {money(quote.discount + courtesy)}</span>
                <span className="q-save-pct">{quote.discountPct}% bundle</span>
              </div>

              <div className="q-split">
                <div>
                  <span className="q-split-label">Due now</span>
                  <span className="q-split-value">{money(dueNow)}</span>
                </div>
                <div>
                  <span className="q-split-label">On completion</span>
                  <span className="q-split-value q-split-muted">{money(balance)}</span>
                </div>
              </div>
            </div>

            <a className="q-pay-btn" href={cashAppHalfUrl} target="_blank" rel="noopener noreferrer">
              Pay {money(dueNow)} now with Cash App
              <span aria-hidden="true">→</span>
            </a>
            <a className="q-btn-soft" href={appleCashUrl}>
              Pay with Apple Pay · {money(dueNow)}
            </a>
            <p className="q-cta-note">
              Opens Messages with {money(dueNow)} written in — tap Apple Cash there and send.
            </p>

            {/* ── ADDING SONGS — collapsed with the rest of the detail ── */}
            <Accordion
              id="adding"
              title="Adding songs"
              meta="Up to 10 songs"
              open={!!open.adding}
              onToggle={() => toggle('adding')}
            >
              <div className="q-add q-add-plain">
                <p className="q-add-lede">
                  Every song you add re-prices the whole order at the bundle rate.
                </p>
              <ul className="q-add-rows">
                {SONG_LADDER.map((row) => {
                  const current = row.songs === songs;
                  return (
                    <li key={row.songs}>
                      <button
                        type="button"
                        className={`q-add-row ${current ? 'is-current' : ''}`}
                        aria-pressed={current}
                        onClick={() => setSongs(row.songs)}
                      >
                        <span className="q-add-left">
                          <span className="q-add-songs">
                            {row.songs} songs{current ? ' · this quote' : ''}
                          </span>
                          <span className="q-add-meta">
                            {row.pct}% bundle · {money(row.perSong)} a song
                          </span>
                        </span>
                        <span className="q-add-total">{money(row.total)}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
                <a className="q-btn-soft" href={`sms:${PAY.phoneLink}`}>
                  Text Zion your final count
                </a>
              </div>
            </Accordion>

            {/* ── DETAIL ── */}
            <Accordion
              id="vision"
              title="The vision"
              meta={CLIENT.project}
              open={!!open.vision}
              onToggle={() => toggle('vision')}
            >
              <p className="q-body-text">
                One EP, one mood, and a name you already had before any of this started.
              </p>
              <ul className="q-vision">
                <li>
                  <strong>Early-2000s glamour pop</strong> — the lane you and Zion already tapped on
                  the last record. Janet, Toni, Britney, Beyoncé energy: big hooks, clean lines,
                  expensive.
                </li>
                <li>
                  <strong>A rap record with Buckhead Baddy energy</strong> — that{' '}
                  <em>Bills, Bills, Bills</em> bounce and a ladies&rsquo; anthem in the spirit of{' '}
                  <em>Nice For What</em>. For the girls who run their own everything.
                </li>
                <li>
                  <strong>A &rsquo;90s R&amp;B / hip-hop soul moment</strong> — Mary, Lil Kim,{' '}
                  <em>I Can Love You</em> and <em>Ladies Night</em> energy. The kind of record that
                  makes a grown woman grab her purse and her friend.
                </li>
                <li>
                  <strong>An &rsquo;80s funk record</strong> with that <em>Flashlight</em> feel — the
                  groove that opens a City Girls song and never apologizes.
                </li>
                <li>
                  <strong>A cover</strong>, because the girls don&rsquo;t do them anymore. Not
                  reinvented — delivered, the way <em>Who Can I Run To</em> and{' '}
                  <em>I&rsquo;m Every Woman</em> stayed the same song and still became somebody
                  else&rsquo;s hit.
                </li>
                <li>
                  <strong>Dancehall on that Fiesta riddim energy</strong> — the rhythm that carried{' '}
                  <em>Dude</em> and a hundred other records, because that&rsquo;s how Jamaica does
                  it: one riddim, everybody&rsquo;s story on it.
                </li>
                <li>
                  <strong>A power ballad</strong> in the <em>Love On The Brain</em> lane, where the
                  voice does the heavy lifting.
                </li>
              </ul>
            </Accordion>

            <Accordion
              id="included"
              title="What every song includes"
              meta={`${INCLUDED.length} · every song`}
              open={!!open.included}
              onToggle={() => toggle('included')}
            >
              <ul className="q-deliv">
                {INCLUDED.map((item) => (
                  <li key={item.name}>
                    <span className="q-tick" aria-hidden="true">
                      ✓
                    </span>
                    <span>
                      <strong>{item.name}</strong>
                      <span className="q-deliv-text">{item.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </Accordion>

            <Accordion
              id="how"
              title="How we work it"
              meta="1 week a song"
              open={!!open.how}
              onToggle={() => toggle('how')}
            >
              <ol className="q-steps">
                <li>
                  <strong>Half down books the session.</strong> We need it at least 3 days (72
                  hours) before the session so we can make accommodations for the gig.
                </li>
                <li>
                  <strong>One week per song.</strong> Three days to write and build it, four days to
                  record and finish it, one song at a time.
                </li>
                <li>
                  <strong>You&rsquo;re in the room.</strong> Vocals, coaching and decisions happen
                  together — The Birdsong Method is the reason the takes land.
                </li>
                <li>
                  <strong>Final payment before delivery.</strong> The last {money(balance)} is
                  paid before the finished songs leave the studio. Nothing leaves until the sound is
                  complete — that protects the record and the sound of it.
                </li>
              </ol>
            </Accordion>

            {/* ── PROTECTION — stated once, before any release talk ── */}
            <section className="q-rights">
              <p className="q-rights-title">Copyright &amp; credits</p>
              <p className="q-rights-text">
                No song goes public, to social media, or into promotion until it is copywritten and
                split sheets are signed. That protects the integrity of the song and puts the
                credits where they belong — with the writers and composers who created it.
              </p>
            </section>

            <div className="q-dash" />

            {/* ── PAY ── */}
            <section id="pay" className="q-pay">
              <p className="q-eyebrow">Pay</p>
              <h2 className="q-pay-title">{money(dueNow)} to start</h2>

              <div className="q-pay-card">
                <div className="q-pay-card-head">
                  <span className="q-pay-name">Cash App</span>
                  <span className="q-pay-tag">${PAY.cashTag}</span>
                </div>
                <a
                  className="q-pay-btn"
                  href={cashAppHalfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open Cash App · {money(dueNow)}
                  <span aria-hidden="true">→</span>
                </a>
                <p className="q-pay-note">Opens Cash App with {money(dueNow)} already in it.</p>
              </div>

              <div className="q-pay-card">
                <div className="q-pay-card-head">
                  <span className="q-pay-name">Apple Pay</span>
                  <span className="q-pay-tag">Apple Cash</span>
                </div>
                <div className="q-copy-row">
                  <span className="q-copy-value">{PAY.phone}</span>
                  <button
                    type="button"
                    className="q-copy-btn"
                    onClick={() => handleCopy(PAY.phone, 'phone')}
                  >
                    {copied === 'phone' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <div className="q-copy-row">
                  <span className="q-copy-value">{PAY.email}</span>
                  <button
                    type="button"
                    className="q-copy-btn"
                    onClick={() => handleCopy(PAY.email, 'email')}
                  >
                    {copied === 'email' ? 'Copied ✓' : 'Copy'}
                  </button>
                </div>
                <a className="q-btn-soft" href={appleCashUrl}>
                  Open Messages · send {money(dueNow)}
                </a>
                <p className="q-pay-note">
                  One tap opens a text to Zion. Tap Apple Cash in Messages and send{' '}
                  {money(dueNow)}.
                </p>
              </div>

              <div className="q-balance">
                <span>Balance before delivery</span>
                <strong>{money(balance)}</strong>
              </div>

              <p className="q-pay-foot">
                Send Zion a screenshot when the half lands, and we start with the first song.
              </p>
            </section>

            <footer className="q-foot">
              <p>Prepared by Zion SWRV Birdsong · SWRV On The Go</p>
              <p>
                Questions before you send?{' '}
                <a href="mailto:info@swrvonthego.pro">info@swrvonthego.pro</a>
              </p>
            </footer>
          </div>
        </article>
      </div>

      {/* ── STICKY DUE-NOW BAR ── */}
      <div className="q-sticky">
        <div className="q-sticky-inner">
          <div>
            <p className="q-sticky-label">Due now · half</p>
            <p className="q-sticky-amount">{money(dueNow)}</p>
          </div>
          <a className="q-sticky-btn" href="#pay">
            Pay
          </a>
        </div>
      </div>
    </main>
  );
}

export default QuotePage;
