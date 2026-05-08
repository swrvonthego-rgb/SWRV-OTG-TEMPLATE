import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './roadmap.css';
import { RoadmapConfig, SWRV_ROADMAP_CONFIG, Theme } from './config';
import { RoadmapResult, ScreenId } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';

// ════════════════════════════════════════════════════════════
// PROPS
// ════════════════════════════════════════════════════════════
export interface RoadmapProps {
  /** Show or hide the experience (renders fullscreen overlay when open) */
  isOpen: boolean;
  /** Called when the user closes the experience */
  onClose: () => void;
  /** Per-client configuration. Defaults to SWRV. */
  config?: RoadmapConfig;
  /** API endpoint for the AI. Defaults to /api/roadmap. */
  apiEndpoint?: string;
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

const PROGRESS_PCT: Record<ScreenId, number> = {
  intro: 0,
  disclaimer: 20,
  vision: 40,
  email: 55,
  processing: 70,
  results: 100,
};

const VALID_THEMES: Theme[] = ['luxe', 'cyberpunk', 'earth', 'street', 'sonic'];

function detectLitPills(text: string): Set<string> {
  const t = text.toLowerCase();
  const map: Record<string, string[]> = {
    morning: ['morning', 'waking', 'wake', 'sunrise', 'breakfast', 'coffee', 'dawn'],
    afternoon: ['afternoon', 'lunch', 'midday', 'noon'],
    evening: ['evening', 'sunset', 'dinner', 'dusk'],
    night: ['night', 'sleep', 'bed', 'stars', 'moonlight', 'late'],
  };
  const lit = new Set<string>();
  for (const [key, kws] of Object.entries(map)) {
    if (kws.some((k) => t.includes(k))) lit.add(key);
  }
  return lit;
}

function wordCount(s: string): number {
  return s.trim().split(/\s+/).filter((w) => w.length > 0).length;
}

function renderInlineEmphasis(text: string): React.ReactNode {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith('**') && p.endsWith('**')) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <React.Fragment key={i}>{p}</React.Fragment>;
  });
}

// localStorage helpers — fail silently in private mode etc.
const ls = {
  get(key: string): string | null {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set(key: string, val: string) {
    try { localStorage.setItem(key, val); } catch { /* noop */ }
  },
};

// ════════════════════════════════════════════════════════════
// COMPONENT
// ════════════════════════════════════════════════════════════
export const Roadmap: React.FC<RoadmapProps> = ({
  isOpen,
  onClose,
  config = SWRV_ROADMAP_CONFIG,
  apiEndpoint = '/api/roadmap',
}) => {
  // ── Screen / progress ─────────────────────────────────────
  const [screen, setScreen] = useState<ScreenId>('intro');
  const [progress, setProgress] = useState(0);

  // ── User input ────────────────────────────────────────────
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [nameError, setNameError] = useState(false);
  const [vision, setVision] = useState('');
  const [interimVision, setInterimVision] = useState('');
  const [shake, setShake] = useState(false);

  // ── Toast ────────────────────────────────────────────────
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  // ── Processing ───────────────────────────────────────────
  const [activeStep, setActiveStep] = useState(0);
  const [doneSteps, setDoneSteps] = useState<Set<number>>(new Set());
  const [showTimeout, setShowTimeout] = useState(false);

  // ── Result ───────────────────────────────────────────────
  const [result, setResult] = useState<RoadmapResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ── Theme ────────────────────────────────────────────────
  const [theme, setTheme] = useState<Theme>(() => {
    const stored = ls.get('roadmap-skin');
    if (stored && VALID_THEMES.includes(stored as Theme)) return stored as Theme;
    return config.defaultTheme;
  });
  const [skinPanelOpen, setSkinPanelOpen] = useState(false);

  // ── Music ────────────────────────────────────────────────
  const [musicMuted, setMusicMuted] = useState<boolean>(() => ls.get('roadmap-music-muted') === '1');
  const [firstGestureDone, setFirstGestureDone] = useState(false);
  const [nowPlaying, setNowPlaying] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const nowPlayingTimerRef = useRef<number | null>(null);

  // ── Refs ─────────────────────────────────────────────────
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const skinPanelRef = useRef<HTMLDivElement>(null);
  const skinToggleRef = useRef<HTMLButtonElement>(null);

  // ── Speech recognition ───────────────────────────────────
  const handleTranscript = useCallback((appendFinal: string, interim: string) => {
    if (appendFinal) {
      setVision((prev) => {
        const sep = prev && !prev.endsWith(' ') ? ' ' : '';
        return prev + sep + appendFinal;
      });
      setInterimVision('');
    } else {
      setInterimVision(interim);
    }
  }, []);
  const mic = useSpeechRecognition({ onTranscript: handleTranscript });

  // ── Effective vision (committed + live interim) ─────────
  const effectiveVision = useMemo(() => {
    if (!interimVision) return vision;
    const sep = vision && !vision.endsWith(' ') ? ' ' : '';
    return vision + sep + interimVision;
  }, [vision, interimVision]);

  const litPills = useMemo(() => detectLitPills(effectiveVision), [effectiveVision]);
  const words = useMemo(() => wordCount(effectiveVision), [effectiveVision]);

  // ── Active theme metadata ────────────────────────────────
  const activeThemeMeta = useMemo(
    () => config.themes.find((t) => t.id === theme) ?? config.themes[0],
    [config.themes, theme],
  );

  // ── Progress bar ─────────────────────────────────────────
  useEffect(() => {
    setProgress(PROGRESS_PCT[screen]);
  }, [screen]);

  // ── Reset UI when overlay opens/closes ───────────────────
  useEffect(() => {
    if (!isOpen) {
      mic.stop();
      // pause music when closed
      if (audioRef.current) audioRef.current.pause();
    } else {
      window.scrollTo(0, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // ── Persist theme + apply audio track on theme change ───
  useEffect(() => {
    ls.set('roadmap-skin', theme);
    const audio = audioRef.current;
    if (!audio) return;

    const trackConfig = activeThemeMeta.audio;
    if (!trackConfig) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setNowPlaying(null);
      return;
    }

    // Swap source if different
    if (audio.src !== trackConfig.url) {
      audio.src = trackConfig.url;
      audio.volume = 0.45;
    }

    if (firstGestureDone && !musicMuted) {
      audio.play()
        .then(() => announceTrack(trackConfig.name))
        .catch(() => { /* autoplay blocked — wait for next gesture */ });
    }
  }, [theme, activeThemeMeta, firstGestureDone, musicMuted]);

  // ── Click outside skin panel to close it ─────────────────
  useEffect(() => {
    if (!skinPanelOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (skinPanelRef.current?.contains(t)) return;
      if (skinToggleRef.current?.contains(t)) return;
      setSkinPanelOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [skinPanelOpen]);

  // ── Toast helper ─────────────────────────────────────────
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimerRef.current !== null) window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  // ── Now-playing pill helper ──────────────────────────────
  const announceTrack = useCallback((name: string | null) => {
    setNowPlaying(name);
    if (nowPlayingTimerRef.current !== null) window.clearTimeout(nowPlayingTimerRef.current);
    if (name) {
      nowPlayingTimerRef.current = window.setTimeout(() => setNowPlaying(null), 3200);
    }
  }, []);

  // ── Music toggle ─────────────────────────────────────────
  const toggleMusic = useCallback(() => {
    const audio = audioRef.current;
    if (!activeThemeMeta.audio) {
      showToast('No music for this skin yet — try a different world.');
      return;
    }
    const next = !musicMuted;
    setMusicMuted(next);
    ls.set('roadmap-music-muted', next ? '1' : '0');
    if (!audio) return;
    if (next) {
      audio.pause();
      announceTrack(null);
    } else {
      setFirstGestureDone(true);
      audio.play()
        .then(() => announceTrack(activeThemeMeta.audio!.name))
        .catch(() => { /* blocked */ });
    }
  }, [activeThemeMeta, musicMuted, showToast, announceTrack]);

  // ── First gesture (start music if not muted) ─────────────
  const startMusicOnFirstGesture = useCallback(() => {
    if (firstGestureDone || musicMuted) return;
    setFirstGestureDone(true);
    const audio = audioRef.current;
    const cfg = activeThemeMeta.audio;
    if (!audio || !cfg) return;
    if (audio.src !== cfg.url) audio.src = cfg.url;
    audio.volume = 0.45;
    audio.play()
      .then(() => announceTrack(cfg.name))
      .catch(() => { /* blocked */ });
  }, [firstGestureDone, musicMuted, activeThemeMeta, announceTrack]);

  // ── Navigation ───────────────────────────────────────────
  const goTo = useCallback((id: ScreenId) => {
    setScreen(id);
    window.requestAnimationFrame(() => {
      const exp = document.querySelector('.roadmap-experience');
      if (exp) (exp as HTMLElement).scrollTop = 0;
    });
  }, []);

  const handleStartOver = useCallback(() => {
    mic.stop();
    setVision('');
    setInterimVision('');
    setUserName('');
    setUserEmail('');
    setNameError(false);
    setResult(null);
    setError(null);
    setActiveStep(0);
    setDoneSteps(new Set());
    setShowTimeout(false);
    goTo('intro');
  }, [goTo, mic]);

  const goToDisclaimer = useCallback(() => {
    if (!userName.trim()) {
      setNameError(true);
      window.setTimeout(() => setNameError(false), 2000);
      nameInputRef.current?.focus();
      return;
    }
    startMusicOnFirstGesture();
    goTo('disclaimer');
  }, [userName, goTo, startMusicOnFirstGesture]);

  const submitVision = useCallback(() => {
    mic.stop();
    if (words < 30) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      showToast('Paint the full picture — morning, work, evening, night.');
      return;
    }
    goTo('email');
  }, [words, mic, showToast, goTo]);

  // ── API call ─────────────────────────────────────────────
  const callApi = useCallback(
    async (visionText: string) => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        window.setTimeout(() => reject(new Error('TIMEOUT')), 45000),
      );

      try {
        const fetchPromise = fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Name: ${userName}\nEmail: ${userEmail || 'not provided'}\n\nVision:\n${visionText}`,
              },
            ],
          }),
        });

        const res = (await Promise.race([fetchPromise, timeoutPromise])) as Response;

        if (!res.ok) {
          const errData = await res.json().catch(() => ({} as any));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const raw = (data.content || [])
          .map((b: { text?: string }) => b.text || '')
          .join('');
        const clean = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        const parsed: RoadmapResult = JSON.parse(clean);

        setActiveStep(-1);
        setDoneSteps(new Set([0, 1, 2, 3, 4]));
        setResult(parsed);
        setError(null);
        goTo('results');
      } catch (err: any) {
        if (err.message === 'TIMEOUT') {
          setError('The response is taking too long. Your vision is saved — tap Try Again.');
        } else if (err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
          setError('Connection issue. Check your internet and try again.');
        } else {
          setError(err.message || 'Something went sideways. Your vision is safe — tap Try Again.');
        }
        goTo('results');
      }
    },
    [apiEndpoint, userName, userEmail, goTo],
  );

  const proceedToProcess = useCallback(
    (skipEmail = false) => {
      if (skipEmail) setUserEmail('');
      goTo('processing');
      setActiveStep(0);
      setDoneSteps(new Set());
      setShowTimeout(false);

      const totalSteps = config.copy.processingSteps.length;
      const stepInterval = 950;
      let i = 0;

      const tick = () => {
        if (i > 0) setDoneSteps((prev) => new Set(prev).add(i - 1));
        if (i < totalSteps) {
          setActiveStep(i);
          i += 1;
          if (i < totalSteps) window.setTimeout(tick, stepInterval);
          else callApi(vision);
        }
      };
      window.setTimeout(tick, 200);
      window.setTimeout(() => setShowTimeout(true), 20000);
    },
    [config.copy.processingSteps.length, callApi, vision, goTo],
  );

  // ── Save as text file ────────────────────────────────────
  const handleSave = useCallback(() => {
    if (!result) return;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const total = (result.recommended_services || []).reduce((sum, s) => {
      const n = parseInt((s.price || '').replace(/\D/g, ''));
      return sum + (isNaN(n) ? 0 : n);
    }, 0);

    const lines: string[] = [];
    lines.push(`THE ROADMAP — ${userName}`);
    lines.push(`Generated by ${config.brandName} · ${config.brandUrl}`);
    lines.push(`Mapped on ${date}`);
    lines.push('─'.repeat(44));
    lines.push('');
    lines.push('YOUR GIFT'); lines.push(result.gift); lines.push('');
    lines.push('YOUR WORK'); lines.push(result.work); lines.push('');
    lines.push('YOUR PURPOSE'); lines.push(result.purpose); lines.push('');
    lines.push('YOUR HAPPILY EVER AFTER — MAPPED'); lines.push(result.vision_summary); lines.push('');
    lines.push('YOUR BRAND IDENTITY'); lines.push(result.business_name_idea); lines.push(result.website_blueprint); lines.push('');
    lines.push('BRAND COLORS');
    (result.brand_colors || []).forEach((c) => {
      lines.push(`  ${c.name} (${c.hex}) — ${c.meaning}`);
    });
    lines.push('');
    lines.push('RECOMMENDED SERVICES');
    (result.recommended_services || []).forEach((s) => {
      lines.push(`  ${s.name} — ${s.price}`);
      lines.push(`    ${s.why}`);
    });
    lines.push('');
    lines.push(`TOTAL ESTIMATED INVESTMENT: $${total.toLocaleString()}`);
    lines.push('');
    lines.push('A WORD FOR YOU'); lines.push(result.closing_word);

    const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${userName.replace(/\s+/g, '_')}_Roadmap_${config.brandName.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    showToast('Roadmap saved ✓');
  }, [result, userName, config, showToast]);

  // ── Sync textarea while not focused ──────────────────────
  useEffect(() => {
    if (textareaRef.current && document.activeElement !== textareaRef.current) {
      textareaRef.current.value = effectiveVision;
    }
  }, [effectiveVision]);

  if (!isOpen) return null;

  // ── Computed for results screen ──────────────────────────
  const total = result
    ? (result.recommended_services || []).reduce((sum, s) => {
        const n = parseInt((s.price || '').replace(/\D/g, ''));
        return sum + (isNaN(n) ? 0 : n);
      }, 0)
    : 0;

  const closingForCta = (result?.closing_word || '').trim();
  const firstEnd = closingForCta.search(/(?<=[.!?])\s+[A-Z]/);
  const ctaHeadline = firstEnd > 0
    ? closingForCta.substring(0, firstEnd + 1)
    : closingForCta.split(/[.!?]/)[0] + (closingForCta ? '.' : '');

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });

  const hasMusic = !!activeThemeMeta.audio;
  const musicBtnClass = [
    'music-toggle',
    !hasMusic ? 'no-track' : '',
    musicMuted || !hasMusic ? 'muted' : '',
    hasMusic && !musicMuted && firstGestureDone ? 'playing' : '',
  ].filter(Boolean).join(' ');

  return (
    <div
      className="roadmap-experience"
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="The Roadmap Experience"
    >
      <div id="progress-bar" style={{ width: `${progress}%` }} />

      {/* Background music — single audio element, source swapped per theme */}
      <audio ref={audioRef} loop preload="none" crossOrigin="anonymous" />

      {/* Now-playing pill (top center) */}
      <div id="now-playing" className={nowPlaying ? 'show' : ''}>
        {nowPlaying ? `♪  ${nowPlaying}` : ''}
      </div>

      {/* Close button — host-site escape hatch (top-LEFT to avoid the skin/music controls) */}
      <button
        type="button"
        className="rm-close"
        onClick={onClose}
        aria-label="Close The Roadmap"
        title="Close"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
        </svg>
      </button>

      {/* Music toggle (top-right area) */}
      <button
        type="button"
        className={musicBtnClass}
        onClick={toggleMusic}
        aria-label="Toggle music"
        title={!hasMusic ? 'No music for this skin yet' : musicMuted ? 'Music off — tap to play' : 'Music on — tap to mute'}
      >
        <svg className="icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
        <svg className="icon-off" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
      </button>

      {/* Skin / theme switcher */}
      <button
        ref={skinToggleRef}
        type="button"
        className="skin-toggle"
        onClick={() => setSkinPanelOpen((o) => !o)}
        aria-label="Change skin"
      >
        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c1.66 0 3-1.34 3-3 0-.78-.29-1.48-.78-2.01-.47-.51-.78-1.21-.78-1.99 0-1.66 1.34-3 3-3h1.78c2.49 0 4.51-2.02 4.51-4.51C22.73 5.62 17.85 2 12 2zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 8 6.5 8 8 8.67 8 9.5 7.33 11 6.5 11zm3-4C8.67 7 8 6.33 8 5.5S8.67 4 9.5 4s1.5.67 1.5 1.5S10.33 7 9.5 7zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 4 14.5 4s1.5.67 1.5 1.5S15.33 7 14.5 7zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 8 17.5 8s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" /></svg>
      </button>
      <div ref={skinPanelRef} className={`skin-panel ${skinPanelOpen ? 'open' : ''}`}>
        <div className="skin-panel-title">Choose Your World</div>
        {config.themes.map((t) => (
          <div
            key={t.id}
            className={`skin-option ${theme === t.id ? 'active' : ''}`}
            onClick={() => {
              setTheme(t.id);
              setSkinPanelOpen(false);
            }}
          >
            <div className={`skin-swatch ${t.id}`} />
            <div>
              <div className="skin-name">{t.name}</div>
              <span className="skin-tagline">{t.tagline}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ════════ SCREEN 1 — INTRO ════════ */}
      <section id="screen-intro" className={`screen ${screen === 'intro' ? 'active' : ''}`}>
        <div className="grain" />
        <div className="intro-content">
          <span className="logo-mark">{config.copy.introLogo}</span>
          <h1 className="intro-title">
            {config.copy.introTitle.line1}<br />
            <em>{config.copy.introTitle.emphasis}</em><br />
            {config.copy.introTitle.line3}
          </h1>
          <p className="intro-sub">{config.copy.introSub}</p>

          <div className="video-wrap">
            <button
              type="button"
              className="video-cover"
              onClick={() => showToast('Video dropping soon — Swerve is recording 🎬')}
            >
              <span className="play-ring">
                <svg viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
              </span>
              <span className="video-label">{config.copy.videoLabel}</span>
            </button>
          </div>

          <div className="name-field-wrap">
            <label className="field-label" htmlFor="user-name">{config.copy.nameFieldLabel}</label>
            <input
              ref={nameInputRef}
              id="user-name"
              className={`text-input ${nameError ? 'error' : ''}`}
              type="text"
              placeholder={nameError ? 'Please enter your name' : config.copy.namePlaceholder}
              maxLength={40}
              autoComplete="given-name"
              autoCorrect="off"
              spellCheck={false}
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') goToDisclaimer(); }}
            />
          </div>

          <button type="button" className="btn-primary" onClick={goToDisclaimer}>
            {config.copy.introCta}
          </button>
        </div>
      </section>

      {/* ════════ SCREEN 2 — DISCLAIMER ════════ */}
      <section id="screen-disclaimer" className={`screen ${screen === 'disclaimer' ? 'active' : ''}`}>
        <div className="disc-box">
          <div className="disc-ornament">
            <span />
            <svg viewBox="0 0 24 24"><path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" /></svg>
            <span />
          </div>
          <h2 className="disc-title">
            {config.copy.disclaimerTitle.line1}<br />{config.copy.disclaimerTitle.line2}
          </h2>
          {config.copy.disclaimerBody.map((p, i) => (
            <p key={i} className="disc-text">{renderInlineEmphasis(p)}</p>
          ))}
          <hr className="disc-rule" />
          <p className="disc-note">{config.copy.disclaimerNote}</p>
          <div className="btn-row">
            <button type="button" className="btn-ghost" onClick={() => goTo('intro')}>
              {config.copy.disclaimerBack}
            </button>
            <button type="button" className="btn-primary" onClick={() => goTo('vision')}>
              {config.copy.disclaimerNext}
            </button>
          </div>
        </div>
      </section>

      {/* ════════ SCREEN 3 — VISION ════════ */}
      <section id="screen-vision" className={`screen ${screen === 'vision' ? 'active' : ''}`}>
        <nav className="vision-nav">
          <span className="logo-mark" style={{ margin: 0 }}>The Roadmap</span>
          <span className="step-label">Your Vision</span>
        </nav>
        <div className="vision-main">
          <h2 className="vision-prompt">
            {config.copy.visionPrompt.line1} <em>{config.copy.visionPrompt.emphasis}</em><br />
            {config.copy.visionPrompt.line3.split('\n').map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}{i < arr.length - 1 ? <br /> : null}
              </React.Fragment>
            ))}
          </h2>
          <p className="vision-sub">{config.copy.visionSub}</p>

          <div className="time-row">
            {(['morning', 'afternoon', 'evening', 'night'] as const).map((key) => {
              const labels = {
                morning: '☀ Morning', afternoon: '◑ Afternoon',
                evening: '◐ Evening', night: '☽ Night',
              };
              return (
                <div key={key} className={`time-pill ${litPills.has(key) ? 'lit' : ''}`}>
                  {labels[key]}
                </div>
              );
            })}
          </div>

          <textarea
            ref={textareaRef}
            className={`vision-textarea ${shake ? 'shake' : ''}`}
            placeholder={config.copy.visionPlaceholder}
            value={effectiveVision}
            onChange={(e) => { setVision(e.target.value); setInterimVision(''); }}
            onFocus={(e) => {
              window.setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'start' }), 300);
            }}
          />

          <div className="mic-section">
            <button
              type="button"
              className={`mic-btn ${mic.isListening ? 'recording' : ''}`}
              onClick={mic.toggle}
              title="Speak your vision"
              aria-label="Toggle voice input"
              disabled={mic.state === 'unsupported'}
            >
              <svg viewBox="0 0 24 24"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" /></svg>
            </button>
            <div className={`viz-bars ${mic.isListening ? 'active' : ''}`}>
              {mic.bars.map((h, i) => (
                <div key={i} className="viz-bar" style={{ height: `${h}px` }} />
              ))}
            </div>
            <span className="mic-status">
              {mic.state === 'unsupported' && 'Not supported — use Chrome or Edge'}
              {mic.state === 'blocked' && 'Mic blocked — allow mic in browser settings'}
              {mic.state === 'network-error' && 'Network error — check connection'}
              {mic.state === 'requesting' && 'Asking for mic permission…'}
              {mic.state === 'listening' && 'Listening — tap to stop'}
              {mic.state === 'idle' && 'Tap to speak'}
            </span>
            {mic.state === 'idle' && <span className="mic-note">Chrome / Edge recommended</span>}
          </div>

          <div className="word-counter">{words} word{words !== 1 ? 's' : ''}</div>

          <div className="vision-footer">
            <span className="char-hint">
              {words > 0 && words < 30 ? `${30 - words} more words to unlock` : ''}
            </span>
            <button type="button" className="btn-primary" onClick={submitVision}>
              {config.copy.visionCta}
            </button>
          </div>
        </div>
      </section>

      {/* ════════ SCREEN 3.5 — EMAIL ════════ */}
      <section id="screen-email" className={`screen ${screen === 'email' ? 'active' : ''}`}>
        <div className="email-box">
          <div className="disc-ornament" style={{ marginBottom: 28 }}>
            <span />
            <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" /></svg>
            <span />
          </div>
          <h2 className="email-title">
            {config.copy.emailTitle.line1}<br />{config.copy.emailTitle.line2}
          </h2>
          <p className="email-sub">{config.copy.emailSub}</p>
          <div className="email-fields">
            <input
              className="text-input"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              value={userEmail}
              onChange={(e) => setUserEmail(e.target.value)}
              style={{ maxWidth: '100%', textAlign: 'left', padding: '14px 18px', fontSize: 16 }}
              onKeyDown={(e) => { if (e.key === 'Enter') proceedToProcess(false); }}
            />
          </div>
          <button
            type="button"
            className="btn-primary"
            onClick={() => proceedToProcess(false)}
            style={{ width: '100%', maxWidth: 360 }}
          >
            {config.copy.emailCta}
          </button>
          <button type="button" className="skip-link" onClick={() => proceedToProcess(true)}>
            {config.copy.emailSkip}
          </button>
        </div>
      </section>

      {/* ════════ SCREEN 4 — PROCESSING ════════ */}
      <section id="screen-processing" className={`screen ${screen === 'processing' ? 'active' : ''}`}>
        <div className="processing-wrap">
          <div className="orb">
            <div className="orb-ring" />
            <div className="orb-ring" />
            <div className="orb-ring" />
            <div className="orb-core" />
          </div>
          <h2 className="proc-title">{config.copy.processingTitle}</h2>
          <p className="proc-name">{userName ? `${userName}, this is your truth.` : ''}</p>
          <ul className="proc-steps">
            {config.copy.processingSteps.map((label, i) => {
              const klass = doneSteps.has(i) ? 'done' : activeStep === i ? 'active' : '';
              return (
                <li key={i} className={`proc-step ${klass}`}>
                  <div className="step-dot" />{label}
                </li>
              );
            })}
          </ul>
          <p className={`timeout-msg ${showTimeout ? 'visible' : ''}`}>
            Taking a little longer than usual — still working on your vision...<br />
            <span style={{ fontSize: 11, opacity: 0.6 }}>Do not refresh the page.</span>
          </p>
        </div>
      </section>

      {/* ════════ SCREEN 5 — RESULTS ════════ */}
      <section id="screen-results" className={`screen ${screen === 'results' ? 'active' : ''}`}>
        {error ? (
          <div className="results-content">
            <div className="r-card" style={{ textAlign: 'center', padding: '56px 28px' }}>
              <div className="r-label" style={{ justifyContent: 'center' }}>We hit a snag</div>
              <div className="r-body" style={{ marginTop: 14, opacity: 0.6, fontSize: 16 }}>{error}</div>
              <button
                type="button"
                className="btn-primary"
                style={{ marginTop: 32 }}
                onClick={() => { setError(null); goTo('vision'); }}
              >
                ← Try Again
              </button>
            </div>
          </div>
        ) : result ? (
          <>
            <div className="results-hero">
              <span className="logo-mark">{config.copy.introLogo}</span>
              <h1 className="results-headline">
                {config.copy.resultsHeadline.plain} <em>{config.copy.resultsHeadline.emphasis}</em>
              </h1>
              <p className="results-meta">{userName} · Mapped on {date}</p>
              <div className="action-row">
                <button type="button" className="btn-save" onClick={handleSave}>
                  <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" /></svg>
                  Save Roadmap
                </button>
                <button type="button" className="btn-save" onClick={() => window.print()}>
                  <svg viewBox="0 0 24 24"><path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z" /></svg>
                  Print
                </button>
              </div>
            </div>

            <div className="results-content">
              <div className="r-card">
                <div className="r-label">Your Gift</div>
                <div className="r-title">{result.gift}</div>
              </div>
              <div className="r-card">
                <div className="r-label">Your Work</div>
                <div className="r-body">{result.work}</div>
              </div>
              <div className="r-card">
                <div className="r-label">Your Purpose</div>
                <div className="r-body">{result.purpose}</div>
              </div>
              <div className="r-card">
                <div className="r-label">Your Happily Ever After — Mapped</div>
                <div className="r-body">{result.vision_summary}</div>
              </div>
              <div className="r-card">
                <div className="r-label">Your Brand Identity</div>
                <div className="r-title">{result.business_name_idea}</div>
                <div className="r-body" style={{ marginBottom: 22 }}>{result.website_blueprint}</div>
                <div className="brand-pal">
                  {(result.brand_colors || []).map((c, i) => (
                    <div key={i} className="pal-item">
                      <div className="pal-circle" style={{ background: c.hex }} />
                      <div className="pal-name">
                        {c.name}<br />
                        <small style={{ opacity: 0.4, fontSize: 9 }}>{c.hex}</small>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="color-meanings">
                  {(result.brand_colors || []).map((c, i) => (
                    <div key={i} className="color-meaning-row">
                      <div className="color-dot" style={{ background: c.hex }} />
                      <span>
                        <strong style={{ color: 'var(--ink-bright)', opacity: 0.85 }}>{c.name}:</strong>{' '}
                        {c.meaning}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="r-card">
                <div className="r-label">What It Takes — {config.brandName} Services</div>
                <div className="services-grid">
                  {(result.recommended_services || []).map((s, i) => (
                    <div key={i} className="svc-card">
                      <div className="svc-name">{s.name}</div>
                      <div className="svc-why">{s.why}</div>
                      <div className="svc-price">{s.price}</div>
                    </div>
                  ))}
                </div>
                <div className="total-row">
                  <span className="total-label">Estimated Investment</span>
                  <span className="total-amount">${total.toLocaleString()}</span>
                </div>
              </div>
              <div className="cta-block">
                <div className="cta-eyebrow">What's Next</div>
                <div className="cta-headline">{ctaHeadline}</div>
                <p className="cta-body">{result.closing_word}</p>
                <a href={config.ctaUrl} className="btn-cta" target="_blank" rel="noopener noreferrer">
                  {config.copy.resultsCtaButton}
                </a>
                <button type="button" className="reset-btn" onClick={handleStartOver}>
                  ← Start a New Vision
                </button>
              </div>
            </div>
          </>
        ) : null}
      </section>

      {toast && <div id="toast" className="show">{toast}</div>}
    </div>
  );
};

export default Roadmap;
