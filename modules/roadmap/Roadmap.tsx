import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './roadmap.css';
import { RoadmapConfig, SWRV_ROADMAP_CONFIG, Theme, renderSystemPrompt } from './config';
import { RoadmapResult, ScreenId } from './types';
import { useSpeechRecognition } from './hooks/useSpeechRecognition';
import { SERVICES, ROADMAP_PRICING } from '../../site.config';
import { PHASE_2_QUESTIONS, BOOK_WISDOM_PROMPT } from './phase2-questions';

// Lookup priceNumeric by service name for accurate total (handles $125/hr, Custom Quote, etc.)
const SERVICE_PRICE_MAP = new Map(SERVICES.map(s => [s.name, s.priceNumeric]));

// ════════════════════════════════════════════════════════════
// PROPS
// ════════════════════════════════════════════════════════════
export interface RoadmapProps {
  /** Show or hide the experience (renders fullscreen overlay when open) */
  isOpen: boolean;
  /** Called when the user closes the experience */
  onClose: () => void;
  /** Called when user clicks "Let's Build This Together" CTA to open services menu */
  onOpenServices?: () => void;
  /** Per-client configuration. Defaults to SWRV. */
  config?: RoadmapConfig;
  /** API endpoint for the AI. Defaults to /api/roadmap. */
  apiEndpoint?: string;
}

// ════════════════════════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════════════════════════

const PROGRESS_PCT: Record<ScreenId, number> = {
  paywall: -1,
  intro: 0,
  email: 14,
  disclaimer: 28,
  duration: 42,
  vision: 56,
  phase2: 70,
  processing: 85,
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
  onOpenServices,
  config = SWRV_ROADMAP_CONFIG,
  apiEndpoint = '/api/roadmap',
}) => {
  // ── Screen / progress ─────────────────────────────────────
  // Check for paid session (Stripe redirect or PayPal manual confirm)
  const checkPaid = () => {
    if (typeof window === 'undefined') return false;
    if (sessionStorage.getItem('swrv_rm_paid') === '1') return true;
    const params = new URLSearchParams(window.location.search);
    if (params.get('rm_paid') === '1') {
      sessionStorage.setItem('swrv_rm_paid', '1');
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('rm_paid');
      window.history.replaceState({}, '', url.toString());
      return true;
    }
    return false;
  };

  const [screen, setScreen] = useState<ScreenId>(() => {
    if (typeof window === 'undefined') return 'paywall';
    return sessionStorage.getItem('swrv_rm_paid') === '1' ? 'intro' : 'paywall';
  });
  const QV_QUESTIONS = [
    { id: "problem",    q: "What's the problem you couldn't ignore that made you want to find — or BE — the solution?",     ph: "The thing that kept showing up in your life until you stopped pretending you didn't see it." },
    { id: "easy",       q: "What do you do most easily that others can't seem to do?",                                      ph: "The thing people always come to you for. The thing that feels like breathing to you and like math to everyone else." },
    { id: "younger",    q: "What would you do for the younger or past version of you — in your hardest times?",            ph: "If you could go back and be there for yourself, what would you show up with?" },
    { id: "allmoods",   q: "What do you unconsciously commit to doing in all moods — happy, mad, sad, bored?",             ph: "What do you keep coming back to no matter how you feel?" },
    { id: "loved",      q: "What do your family and friends love most about you?",                                          ph: "What do the people closest to you say when they brag about you to someone else?" },
    { id: "afraid",     q: "What makes you afraid or intimidates you when you think about actually doing it?",             ph: "The thing that excites and terrifies you at the same time." },
    { id: "pride",      q: "What do you have a sense of pride in — and what conversations do you feel uncomfortable being left out of?", ph: "What can you talk about for hours and feel like an expert?" },
    { id: "yearn",      q: "What do you yearn to do for others?",                                                          ph: "If you could fix one thing in someone else's life, what would it be?" },
    { id: "seeself",    q: "Who do you very badly want to see yourself as?",                                               ph: "The version of you that you are always reaching for." },
    { id: "undeniable", q: "What is that special something — even people who don't like you can't deny about you?",       ph: "The thing your critics can't take away from you." },
  ];
  const [qvIdx, setQvIdx] = useState(0);
  const [qvAnswers, setQvAnswers] = useState<Record<string, string>>({});
  const [qvResult, setQvResult] = useState<{ gift: string; direction: string; services: Array<{name:string;price:string;why:string}> } | null>(null);
  const [paymentPending, setPaymentPending] = useState(false);
  const [phase2Answers, setPhase2Answers] = useState<Record<string, string>>({});
  const [phase2Idx, setPhase2Idx] = useState(0);
  const [progress, setProgress] = useState(0);

  // ── User input ────────────────────────────────────────────
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [nameError, setNameError] = useState(false);
  const [vision, setVision] = useState('');
  const [interimVision, setInterimVision] = useState('');
  const [shake, setShake] = useState(false);

  // ── Video mute overlay ───────────────────────────────────
  const [videoMuted, setVideoMuted] = useState(true); // start muted so autoplay works

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
  // Music player panel — replaces the simple mute-toggle on the speaker icon
  const [musicPanelOpen, setMusicPanelOpen] = useState(false);
  const [manualTrackId, setManualTrackId] = useState<Theme | null>(() => {
    const stored = ls.get('roadmap-manual-track');
    return stored && VALID_THEMES.includes(stored as Theme) ? (stored as Theme) : null;
  });
  const [loop, setLoop] = useState<boolean>(() => ls.get('roadmap-music-loop') !== '0');
  const audioRef = useRef<HTMLAudioElement>(null);
  const nowPlayingTimerRef = useRef<number | null>(null);

  // ── Vision session timer (5 min / 10 min) ─────
  const [sessionDuration, setSessionDuration] = useState<5 | 10 | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null); // seconds

  // ── Session persistence (finish-later) ───────────────────
  // Each session gets a stable ID so progress can be saved/restored.
  // Stored in localStorage; if KV binding is configured on the worker,
  // /api/save-progress and /api/load-progress also persist server-side.
  const sessionIdRef = useRef<string>('');
  if (!sessionIdRef.current) {
    const existing = ls.get('roadmap-session-id');
    sessionIdRef.current = existing || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
    if (!existing) ls.set('roadmap-session-id', sessionIdRef.current);
  }

  // ── Refs ─────────────────────────────────────────────────
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const skinPanelRef = useRef<HTMLDivElement>(null);
  const skinToggleRef = useRef<HTMLButtonElement>(null);
  const musicPanelRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const musicToggleRef = useRef<HTMLButtonElement>(null);

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
  const micTarget = React.useRef<"vision" | "phase2">("vision");
  const mic = useSpeechRecognition({ onTranscript: handleTranscript });

  // ── Effective vision (committed + live interim) ─────────
  const effectiveVision = useMemo(() => {
    if (!interimVision) return vision;
    const sep = vision && !vision.endsWith(' ') ? ' ' : '';
    return vision + sep + interimVision;
  }, [vision, interimVision]);

  const litPills = useMemo(() => detectLitPills(effectiveVision), [effectiveVision]);
  const words = useMemo(() => wordCount(effectiveVision), [effectiveVision]);

  // ── Active track metadata (manual override > theme default) ────
  const activeThemeMeta = useMemo(
    () => config.themes.find((t) => t.id === theme) ?? config.themes[0],
    [config.themes, theme],
  );
  const effectiveTrack = useMemo(() => {
    const trackThemeId = manualTrackId ?? theme;
    return config.themes.find((t) => t.id === trackThemeId)?.audio ?? null;
  }, [config.themes, manualTrackId, theme]);
  // List of tracks that have audio (for the music panel)
  const tracksWithAudio = useMemo(
    () => config.themes.filter((t) => t.audio !== null),
    [config.themes],
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

  // ── Persist theme + apply audio track on change ────────
  useEffect(() => {
    ls.set('roadmap-skin', theme);
    const audio = audioRef.current;
    if (!audio) return;

    if (!effectiveTrack) {
      audio.pause();
      audio.removeAttribute('src');
      audio.load();
      setNowPlaying(null);
      return;
    }

    // Swap source if different
    if (audio.src !== effectiveTrack.url) {
      audio.src = effectiveTrack.url;
      audio.volume = 0.45;
    }

    if (firstGestureDone && !musicMuted) {
      audio.play()
        .then(() => announceTrack(effectiveTrack.name))
        .catch(() => { /* autoplay blocked — wait for next gesture */ });
    }
  }, [theme, effectiveTrack, firstGestureDone, musicMuted]);

  // Persist loop & manual track choices
  useEffect(() => { ls.set('roadmap-music-loop', loop ? '1' : '0'); }, [loop]);
  useEffect(() => {
    if (manualTrackId) ls.set('roadmap-manual-track', manualTrackId);
  }, [manualTrackId]);

  // ── Mic + Music: music keeps playing during speaking, user controls volume via slider ──
  // Slider is uncontrolled (no React state) so adjusting volume won't trigger re-renders
  // that could interrupt the active speech recognition session.
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !effectiveTrack) return;
    if (mic.isListening) {
      // Initial duck when mic starts — user can adjust UP via slider after
      audio.volume = 0.15;
      const slider = document.getElementById('vision-volume-slider') as HTMLInputElement | null;
      if (slider) slider.value = '0.15';
      if (firstGestureDone && !musicMuted) {
        audio.play().catch(() => { /* autoplay blocked */ });
      }
    } else {
      audio.volume = 0.45; // restore to normal listening volume
      if (firstGestureDone && !musicMuted) {
        audio.play().catch(() => { /* autoplay blocked */ });
      }
    }
  }, [mic.isListening, effectiveTrack, firstGestureDone, musicMuted]);

  // ── Click outside skin/music panels to close them ────────
  useEffect(() => {
    if (!skinPanelOpen && !musicPanelOpen) return;
    const onDocClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (skinPanelRef.current?.contains(t)) return;
      if (skinToggleRef.current?.contains(t)) return;
      if (musicPanelRef.current?.contains(t)) return;
      if (musicToggleRef.current?.contains(t)) return;
      setSkinPanelOpen(false);
      setMusicPanelOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [skinPanelOpen, musicPanelOpen]);

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

  // ── Music controls (panel) ───────────────────────────────
  const playTrack = useCallback((trackThemeId: Theme) => {
    setManualTrackId(trackThemeId);
    setMusicMuted(false);
    setFirstGestureDone(true);
    ls.set('roadmap-music-muted', '0');
  }, []);

  const skipNext = useCallback(() => {
    if (tracksWithAudio.length === 0) return;
    const currentId = manualTrackId ?? theme;
    const currentIdx = tracksWithAudio.findIndex((t) => t.id === currentId);
    const nextIdx = (currentIdx + 1) % tracksWithAudio.length;
    playTrack(tracksWithAudio[nextIdx].id);
  }, [tracksWithAudio, manualTrackId, theme, playTrack]);

  const skipPrev = useCallback(() => {
    if (tracksWithAudio.length === 0) return;
    const currentId = manualTrackId ?? theme;
    const currentIdx = tracksWithAudio.findIndex((t) => t.id === currentId);
    const prevIdx = (currentIdx - 1 + tracksWithAudio.length) % tracksWithAudio.length;
    playTrack(tracksWithAudio[prevIdx].id);
  }, [tracksWithAudio, manualTrackId, theme, playTrack]);

  // Toggle music: clicking speaker icon now opens the panel.
  // The panel itself has a play/pause button.
  const toggleMusicPanel = useCallback(() => {
    setMusicPanelOpen((o) => !o);
    setSkinPanelOpen(false);
  }, []);

  const toggleMusicMute = useCallback(() => {
    if (!effectiveTrack) {
      showToast('No track for this skin yet — pick a different world or track.');
      return;
    }
    const next = !musicMuted;
    setMusicMuted(next);
    ls.set('roadmap-music-muted', next ? '1' : '0');
    const audio = audioRef.current;
    if (!audio) return;
    if (next) {
      audio.pause();
      announceTrack(null);
    } else {
      setFirstGestureDone(true);
      audio.play()
        .then(() => announceTrack(effectiveTrack.name))
        .catch(() => { /* blocked */ });
    }
  }, [effectiveTrack, musicMuted, showToast, announceTrack]);

  // ── First gesture (start music if not muted) ─────────────
  const startMusicOnFirstGesture = useCallback(() => {
    if (firstGestureDone || musicMuted) return;
    setFirstGestureDone(true);
    const audio = audioRef.current;
    if (!audio || !effectiveTrack) return;
    if (audio.src !== effectiveTrack.url) audio.src = effectiveTrack.url;
    audio.volume = 0.45;
    audio.play()
      .then(() => announceTrack(effectiveTrack.name))
      .catch(() => { /* blocked */ });
  }, [firstGestureDone, musicMuted, effectiveTrack, announceTrack]);

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
    setPhase2Answers({});
    setPhase2Idx(0);
    setQvIdx(0);
    setQvAnswers({});
    setPhase2Answers({});
    setPhase2Idx(0);
    goTo("intro");
  }, [goTo, mic]);

  const goToEmail = useCallback(() => {
    if (!userName.trim()) {
      setNameError(true);
      window.setTimeout(() => setNameError(false), 2000);
      nameInputRef.current?.focus();
      return;
    }
    startMusicOnFirstGesture();
    goTo('email');
  }, [userName, goTo, startMusicOnFirstGesture]);

  // After email: go to disclaimer (skip allowed too)
  const goToDisclaimerFromEmail = useCallback(
    (skipEmail = false) => {
      if (skipEmail) setUserEmail('');
      goTo('disclaimer');
    },
    [goTo],
  );

  // After disclaimer: pick session duration
  const selectDuration = useCallback(
    (mins: 5 | 10 | null) => {
      setSessionDuration(mins);
      setTimeRemaining(mins === null ? null : mins * 60);
      goTo('vision');
    },
    [goTo],
  );

  // Forward-ref so submitVision (defined first) can call proceedToProcess (defined later)
  const proceedToProcessRef = useRef<(skipEmail: boolean) => void>(() => {});

  const submitVision = useCallback(() => {
    mic.stop();
    if (words < 30) {
      setShake(true);
      window.setTimeout(() => setShake(false), 500);
      showToast('Paint the full picture — morning, work, evening, night.');
      return;
    }
    // Phase 1 complete — move to Phase 2 (16 guided questions)
    goTo('phase2');
    setPhase2Idx(0);
  }, [words, mic, showToast, goTo]);

  // ── API call ─────────────────────────────────────────────
  const callApi = useCallback(
    async (visionText: string) => {
      const timeoutPromise = new Promise<never>((_, reject) =>
        window.setTimeout(() => reject(new Error('TIMEOUT')), 45000),
      );

      try {
        // Format Phase 2 answers as a labeled block
        const phase2Block = PHASE_2_QUESTIONS
          .map(q => {
            const ans = (phase2Answers[q.id] || '').trim();
            return ans ? `Q${q.number}. ${q.question}\nA: ${ans}` : '';
          })
          .filter(Boolean)
          .join('\n\n');

        const fetchPromise = fetch(apiEndpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system: renderSystemPrompt(config) + '\n\n' + BOOK_WISDOM_PROMPT,
            messages: [
              {
                role: 'user',
                content: `Name: ${userName}\nEmail: ${userEmail || 'not provided'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPHASE 1 — THEIR VISION (told in their own words)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${visionText}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nPHASE 2 — THE 16 GUIDED QUESTIONS\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n${phase2Block || '(no Phase 2 answers provided)'}\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nNow combine both phases into the final assessment. Phase 1 shows you what they see. Phase 2 shows you who they are. Weave them into one complete blueprint.`,
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
        // Strip markdown fences if present
        let clean = raw.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
        // Extract the JSON object even if model added preamble like "Zion, here's your roadmap: {..}"
        const jsonMatch = clean.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('No JSON object found in response');
        }
        clean = jsonMatch[0];
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
    [apiEndpoint, userName, userEmail, goTo, phase2Answers],
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

  // Keep the ref pointing at the latest version
  useEffect(() => { proceedToProcessRef.current = proceedToProcess; }, [proceedToProcess]);

  // ── Vision timer countdown ───────────────────────────────
  // Only ticks when the vision screen is active and a duration was set.
  useEffect(() => {
    if (screen !== 'vision' || timeRemaining === null) return;
    if (timeRemaining <= 0) {
      // Auto-submit if user has typed at least 30 words; otherwise gently nudge.
      if (words >= 30) {
        proceedToProcessRef.current(false);
      } else {
        showToast("Time's up — paint a fuller picture and we'll wrap when you're ready.");
        setTimeRemaining(60); // give them another minute
      }
      return;
    }
    const t = window.setTimeout(() => setTimeRemaining((r) => (r === null ? null : r - 1)), 1000);
    return () => window.clearTimeout(t);
  }, [screen, timeRemaining, words, showToast]);

  // ── Video autoplay: play intro video as soon as Roadmap opens ──
  // Pause it when user navigates away from intro screen or closes Roadmap.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isOpen && screen === 'intro') {
      // Try to play with sound; if blocked, fall back to muted autoplay
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Browser blocked autoplay with sound — try muted as fallback
          video.muted = true;
          video.play().catch(() => {
            // Even muted failed; user will need to press play manually
          });
        });
      }
    } else {
      // Pause when leaving intro screen or closing Roadmap
      video.pause();
    }
  }, [isOpen, screen]);

  // ── Persistence: save progress to localStorage on each major step ──
  // (If KV is configured on the worker, /api/save-progress will also persist
  //  server-side via a fire-and-forget background save.)
  useEffect(() => {
    if (screen === 'intro') return;
    const snapshot = {
      sessionId: sessionIdRef.current,
      screen,
      userName,
      userEmail,
      vision,
      sessionDuration,
      result,
      ts: Date.now(),
    };
    try {
      localStorage.setItem('roadmap-progress', JSON.stringify(snapshot));
    } catch { /* full or disabled */ }
    // Best-effort server-side save (silent fail if endpoint not configured)
    if (userEmail) {
      fetch('/api/save-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(snapshot),
      }).catch(() => { /* server-side persistence optional */ });
    }
  }, [screen, userName, userEmail, vision, sessionDuration, result]);

  // ── Send results email after AI generation completes ─────
  // Fire-and-forget. If RESEND_API_KEY isn't set on the worker, the worker
  // returns a 200 with status=skipped and we just don't notify the user.
  useEffect(() => {
    if (!result || !userEmail) return;
    fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: userEmail,
        userName,
        sessionId: sessionIdRef.current,
        result,
        brand: { name: config.brandName, url: config.brandUrl, ctaUrl: config.ctaUrl },
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data?.status === 'sent') {
          showToast(`Roadmap also sent to ${userEmail} ✓`);
        }
      })
      .catch(() => { /* silent — already showing on screen */ });
  }, [result, userEmail, userName, config, showToast]);
  const handleSave = useCallback(() => {
    if (!result) return;
    const date = new Date().toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
    const total = (result.recommended_services || []).reduce((sum, s) => {
      // Use catalog priceNumeric first (handles $125/hr, Custom Quote, $300/batch)
      const catalogPrice = SERVICE_PRICE_MAP.get(s.name);
      if (catalogPrice !== undefined) return sum + catalogPrice;
      const n = parseInt((s.price || '').replace(/[^0-9]/g, ''));
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
    lines.push('');
    if (result.evidence) {
      lines.push('HOW WE GOT HERE — THE EVIDENCE');
      lines.push(result.evidence);
      lines.push('');
    }
    lines.push('YOUR HAPPILY EVER AFTER — MAPPED'); lines.push(result.vision_summary); lines.push('');
    if (result.blueprint) {
      lines.push('THE BLUEPRINT — WHAT THIS LIFE REQUIRES');
      if (result.blueprint.reverse_engineering) { lines.push('  HOW YOU GOT HERE'); lines.push('  ' + result.blueprint.reverse_engineering); lines.push(''); }
      if (result.blueprint.mindset)             { lines.push('  MINDSET');           lines.push('  ' + result.blueprint.mindset); lines.push(''); }
      if (result.blueprint.discipline)          { lines.push('  DAILY DISCIPLINE');  lines.push('  ' + result.blueprint.discipline); lines.push(''); }
      if (result.blueprint.diet)                { lines.push('  DIET & NUTRITION');  lines.push('  ' + result.blueprint.diet); lines.push(''); }
      if (result.blueprint.fitness)             { lines.push('  FITNESS');           lines.push('  ' + result.blueprint.fitness); lines.push(''); }
      if (result.blueprint.community)           { lines.push('  YOUR CIRCLE');       lines.push('  ' + result.blueprint.community); lines.push(''); }
      if (result.blueprint.work_ethic)          { lines.push('  WORK ETHIC');        lines.push('  ' + result.blueprint.work_ethic); lines.push(''); }
    }
    lines.push('YOUR BRAND IDENTITY'); lines.push(result.business_name_idea); lines.push(result.website_blueprint); lines.push('');
    lines.push('BRAND COLORS');
    (result.brand_colors || []).forEach((c) => {
      lines.push(`  ${c.name} (${c.hex}) — ${c.meaning}`);
    });
    lines.push('');
    if ((result.vision_services_map || []).length > 0) {
      lines.push('YOUR VISION — WHAT IT COSTS TO BUILD');
      result.vision_services_map.forEach((item) => {
        lines.push(`  ${item.vision_element}`);
        if (item.quote) lines.push(`  "${item.quote}"`);
        (item.services || []).forEach((svc) => {
          lines.push(`    → ${svc.name} — ${svc.price}`);
          if (svc.connection) lines.push(`      ${svc.connection}`);
        });
        lines.push('');
      });
    }
    lines.push('RECOMMENDED SERVICES — ORDERED BY PHASE');
    (result.recommended_services || []).forEach((s) => {
      lines.push(`  [${(s as any).phase || ''}] ${s.name} — ${s.price}`);
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
        // Use catalog priceNumeric first (handles $125/hr, Custom Quote, variable rates)
        const catalogPrice = SERVICE_PRICE_MAP.get(s.name);
        if (catalogPrice !== undefined) return sum + catalogPrice;
        const n = parseInt((s.price || '').replace(/[^0-9]/g, ''));
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

  const hasMusic = !!effectiveTrack;
  const musicBtnClass = [
    'music-toggle',
    !hasMusic ? 'no-track' : '',
    musicMuted || !hasMusic ? 'muted' : '',
    hasMusic && !musicMuted && firstGestureDone ? 'playing' : '',
  ].filter(Boolean).join(' ');

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <div
      className="roadmap-experience"
      data-theme={theme}
      role="dialog"
      aria-modal="true"
      aria-label="The Roadmap Experience"
    >
      <div id="progress-bar" style={{ width: `${progress}%` }} />

      {/* Background music — single audio element, source swapped per track */}
      <audio ref={audioRef} loop={loop} preload="none" crossOrigin="anonymous" />

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

      {/* Music toggle — clicking opens the music panel (track picker + loop + play/pause) */}
      <button
        ref={musicToggleRef}
        type="button"
        className={musicBtnClass}
        onClick={toggleMusicPanel}
        aria-label="Open music player"
        title={!hasMusic ? 'No track for this skin yet' : musicMuted ? 'Music off — open player' : 'Music player'}
      >
        <svg className="icon-on" viewBox="0 0 24 24"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" /></svg>
        <svg className="icon-off" viewBox="0 0 24 24"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" /></svg>
      </button>

      {/* Music player panel */}
      <div ref={musicPanelRef} className={`music-panel ${musicPanelOpen ? 'open' : ''}`}>
        <div className="music-panel-title">Music</div>
        <div className="music-current">
          {effectiveTrack ? `♪  ${effectiveTrack.name}` : 'No track for this skin'}
        </div>
        {tracksWithAudio.length > 0 && (
          <div className="music-tracks">
            {tracksWithAudio.map((t) => {
              const currentId = manualTrackId ?? theme;
              const isActive = currentId === t.id;
              return (
                <div
                  key={t.id}
                  className={`music-track ${isActive ? 'active' : ''}`}
                  onClick={() => playTrack(t.id)}
                >
                  <span className="music-track-name">{t.name}</span>
                  <span className="music-track-vibe">{t.audio?.name}</span>
                </div>
              );
            })}
          </div>
        )}
        <div className="music-controls">
          <button type="button" className="music-ctrl-btn" onClick={skipPrev} aria-label="Previous track" title="Previous">‹‹</button>
          <button type="button" className="music-ctrl-btn primary" onClick={toggleMusicMute} aria-label={musicMuted ? 'Play' : 'Pause'}>
            {musicMuted ? '▶' : '❚❚'}
          </button>
          <button type="button" className="music-ctrl-btn" onClick={skipNext} aria-label="Next track" title="Next">››</button>
        </div>
        <label className="music-loop">
          <input type="checkbox" checked={loop} onChange={(e) => setLoop(e.target.checked)} />
          <span>Loop current track</span>
        </label>
      </div>

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

      {/* ════════════════════════════════════════════════
           SCREEN 0 — PAYWALL
           Shows before everything else.
           Full Roadmap ($1) vs Quick Vision (free).
      ═══════════════════════════════════════════════ */}
      <section id="screen-paywall" className={`screen ${screen === 'paywall' ? 'active' : ''}`}>
        <div className="grain" />
        <div className="paywall-wrap">
          <p className="paywall-eyebrow">CHOOSE YOUR EXPERIENCE</p>
          <h2 className="paywall-title">Before You Begin</h2>
          <p className="paywall-sub">
            The Roadmap maps your vision to your path — and to the exact services that build it.<br/>
            Choose how deep you want to go.
          </p>

          {/* Vision scriptures */}
          <div className="paywall-scriptures">
            <p className="paywall-vision-line">Vision is your purpose in pictures.</p>
            <div className="paywall-scripture">
              <p className="paywall-scripture-text">"Without vision, the people cast off restraint and run wild with no direction."</p>
              <span className="paywall-scripture-ref">Proverbs 29:18</span>
            </div>
            <div className="paywall-scripture">
              <p className="paywall-scripture-text">"Write the vision, make it plain — so the people you want to see it can help you run with it."</p>
              <span className="paywall-scripture-ref">Habakkuk 2:2</span>
            </div>
          </div>

          <div className="paywall-single">
              <div className="paywall-card paywall-card-paid" style={{ maxWidth: 480, margin: '0 auto' }}>
                <div className="paywall-card-badge paywall-badge-gold">
                  {ROADMAP_PRICING.full.price}
                </div>
                <h3 className="paywall-card-title">{ROADMAP_PRICING.full.label}</h3>
                <p className="paywall-card-tagline">{ROADMAP_PRICING.full.tagline}</p>
                <ul className="paywall-card-bullets">
                  {[...ROADMAP_PRICING.full.bulletPoints].map((b, i) => (
                    <li key={i}><span className="paywall-check paywall-check-gold">✓</span>{b}</li>
                  ))}
                </ul>
                {!paymentPending ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {ROADMAP_PRICING.full.stripeLink && (
                      <button type="button" className="paywall-btn paywall-btn-paid"
                        onClick={() => {
                          window.open(ROADMAP_PRICING.full.stripeLink, '_blank', 'noopener');
                          setPaymentPending(true);
                        }}>
                        Pay with Card →
                      </button>
                    )}
                    {ROADMAP_PRICING.full.paypalLink && (
                      <button type="button" className="paywall-btn paywall-btn-free"
                        style={{ background: 'rgba(0,112,186,0.12)', borderColor: 'rgba(0,112,186,0.4)', color: '#60a5fa' }}
                        onClick={() => {
                          window.open(ROADMAP_PRICING.full.paypalLink, '_blank', 'noopener');
                          setPaymentPending(true);
                        }}>
                        Pay with PayPal →
                      </button>
                    )}
                    {!ROADMAP_PRICING.full.stripeLink && !ROADMAP_PRICING.full.paypalLink && (
                      <p className="paywall-coming">Payment setup coming soon.</p>
                    )}
                  </div>
                ) : (
                  <div className="paywall-pending">
                    <p className="paywall-pending-text">
                      Complete your {ROADMAP_PRICING.full.price} payment in the tab that opened, then tap below.
                    </p>
                    <button type="button" className="paywall-btn paywall-btn-paid"
                      onClick={() => {
                        sessionStorage.setItem('swrv_rm_paid', '1');
                        setPaymentPending(false);
                        goTo('intro');
                      }}>
                      I've Paid — Begin →
                    </button>
                    <button type="button" className="paywall-pending-back"
                      onClick={() => setPaymentPending(false)}>
                      ← Go back
                    </button>
                  </div>
                )}
              </div>
            </div></div>
      </section>

      {/* ════════ SCREEN 3.75 — PHASE 2 (16 GUIDED QUESTIONS) ════════ */}
      <section id="screen-phase2" className={`screen ${screen === 'phase2' ? 'active' : ''}`}>
        <div className="phase2-wrap">
          {(() => {
            const q = PHASE_2_QUESTIONS[phase2Idx];
            const total = PHASE_2_QUESTIONS.length;
            const answer = phase2Answers[q.id] || '';
            const isLast = phase2Idx === total - 1;
            return (
              <>
                <div className="phase2-progress-row">
                  <span className="phase2-step">Question {phase2Idx + 1} of {total}</span>
                  <div className="phase2-progress-bar">
                    <div className="phase2-progress-fill" style={{ width: `${((phase2Idx + 1) / total) * 100}%` }} />
                  </div>
                </div>

                {phase2Idx === 0 && (
                  <p className="phase2-intro">
                    You painted the picture. Now let's bring it into focus.<br/>
                    16 questions. Take your time. Be honest. There's no wrong answer.
                  </p>
                )}

                <h2 className="phase2-question">{q.question}</h2>
                {q.context && <p className="phase2-context">{q.context}</p>}

                <div className="phase2-mic-row">
                  <button type="button"
                    className={"mic-btn" + (mic.isListening && micTarget.current === "phase2" ? " recording" : "")}
                    onClick={() => { micTarget.current = "phase2"; mic.toggle(); }}
                    disabled={mic.state === "unsupported"} title="Speak your answer">
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/></svg>
                  </button>
                  <button type="button" className={musicBtnClass}
                    onClick={() => setMusicMuted(m => !m)} title={musicMuted ? "Unmute" : "Mute music"}>
                    {musicMuted
                      ? <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                      : <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                    }
                  </button>
                  {mic.isListening && micTarget.current === "phase2" && <span className="phase2-recording-label">● Recording…</span>}
                </div>
                <textarea
                  className="phase2-input"
                  rows={4}
                  placeholder={q.placeholder || 'Type or tap the mic to speak your answer…'}
                  value={answer}
                  onChange={e => setPhase2Answers(prev => ({ ...prev, [q.id]: e.target.value }))}
                  autoFocus
                />

                <div className="phase2-actions">
                  {phase2Idx > 0 && (
                    <button type="button" className="btn-ghost"
                      onClick={() => setPhase2Idx(i => i - 1)}>
                      ← Back
                    </button>
                  )}
                  <button type="button" className="btn-ghost phase2-skip"
                    onClick={() => {
                      if (isLast) {
                        proceedToProcessRef.current(false);
                      } else {
                        setPhase2Idx(i => i + 1);
                      }
                    }}>
                    Skip
                  </button>
                  <button type="button" className="btn-primary"
                    disabled={!answer.trim()}
                    onClick={() => {
                      if (isLast) {
                        proceedToProcessRef.current(false);
                      } else {
                        setPhase2Idx(i => i + 1);
                      }
                    }}>
                    {isLast ? 'Complete →' : 'Next →'}
                  </button>
                </div>

                <p className="phase2-finish-anytime">
                  Done early? <button type="button" className="phase2-finish-link"
                    onClick={() => proceedToProcessRef.current(false)}>
                    Finish now and generate my roadmap →
                  </button>
                </p>
              </>
            );
          })()}
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

              {/* ── GIFT / WORK / PURPOSE ── */}
              <div className="r-card">
                <div className="r-label">Your Gift</div>
                <div className="r-title">{result.gift}</div>
              </div>
              <div className="r-card r-card-pair">
                <div className="r-half">
                  <div className="r-label">Your Work</div>
                  <div className="r-body">{result.work}</div>
                </div>
                <div className="r-half">
                  <div className="r-label">Your Purpose</div>
                  <div className="r-body">{result.purpose}</div>
                </div>
              </div>

              {/* ── EVIDENCE — How we got here ── */}
              {result.evidence && (
                <div className="r-card r-card-evidence">
                  <div className="r-label">
                    <span className="r-label-dot" style={{ background: '#64c8ff' }} />
                    How We Got Here — Not Fortune-Telling, Just Facts
                  </div>
                  <div className="r-body evidence-body">{result.evidence}</div>
                </div>
              )}

              {/* ── VISION SUMMARY ── */}
              <div className="r-card r-card-vision">
                <div className="r-label">Your Happily Ever After — Mapped</div>
                <div className="r-body vision-body">{result.vision_summary}</div>
              </div>

              {/* ── BLUEPRINT — Deep life analysis ── */}
              {result.blueprint && (
                <div className="r-card">
                  <div className="r-label">The Blueprint — What This Life Actually Requires</div>
                  <p className="blueprint-intro">Based on what you described, here is the full picture of what sustains this vision.</p>
                  <div className="blueprint-grid">
                    {[
                      { key: 'reverse_engineering', label: '🔍 How You Got Here', value: result.blueprint.reverse_engineering },
                      { key: 'mindset',             label: '🧠 Mindset',          value: result.blueprint.mindset },
                      { key: 'discipline',          label: '⚡ Daily Discipline',  value: result.blueprint.discipline },
                      { key: 'diet',                label: '🥗 Diet & Nutrition',  value: result.blueprint.diet },
                      { key: 'fitness',             label: '💪 Fitness',           value: result.blueprint.fitness },
                      { key: 'community',           label: '🤝 Your Circle',       value: result.blueprint.community },
                      { key: 'work_ethic',          label: '🎯 Work Ethic',        value: result.blueprint.work_ethic },
                    ].filter(b => b.value).map((b) => (
                      <div key={b.key} className="blueprint-item">
                        <div className="blueprint-label">{b.label}</div>
                        <div className="blueprint-body">{b.value}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── BRAND IDENTITY ── */}
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

              {/* ── VISION → SERVICES MAP ── */}
              {(result.vision_services_map || []).length > 0 && (
                <div className="r-card">
                  <div className="r-label">Your Vision — What It Costs to Build</div>
                  <p className="vsmap-intro">Everything you described has a price. Here's exactly what builds each part of your vision — so you know why every dollar is there.</p>
                  <div className="vsmap">
                    {(result.vision_services_map || []).map((item, i) => (
                      <div key={i} className="vsmap-row">
                        <div className="vsmap-left">
                          <div className="vsmap-element">{item.vision_element}</div>
                          {item.quote && <div className="vsmap-quote">"{item.quote}"</div>}
                        </div>
                        <div className="vsmap-arrow">→</div>
                        <div className="vsmap-right">
                          {(item.services || []).map((svc, j) => (
                            <div key={j} className="vsmap-svc">
                              <span className="vsmap-svc-name">{svc.name}</span>
                              <span className="vsmap-svc-price">{svc.price}</span>
                              {svc.connection && <span className="vsmap-svc-why">{svc.connection}</span>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SERVICE CHAIN ── */}
              <div className="r-card">
                <div className="r-label">Your Full Roadmap to Reality — {config.brandName} Services</div>
                <p className="svc-chain-intro">Ordered as you would actually use them — each one builds on or enables the next.</p>
                {(['Foundation', 'Production', 'Delivery', 'Growth'] as const).map((phase) => {
                  const phaseServices = (result.recommended_services || [])
                    .filter(s => (s as any).phase === phase)
                    .sort((a, b) => ((a as any).order || 0) - ((b as any).order || 0));
                  if (phaseServices.length === 0) return null;
                  return (
                    <div key={phase} className="svc-phase">
                      <div className="svc-phase-label">{phase}</div>
                      <div className="services-grid">
                        {phaseServices.map((s, i) => (
                          <div key={i} className="svc-card svc-card-chain">
                            <div className="svc-step">{(s as any).order || (i + 1)}</div>
                            <div className="svc-content">
                              <div className="svc-name">{s.name}</div>
                              <div className="svc-why">{s.why}</div>
                              <div className="svc-price">{s.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {!(result.recommended_services || []).some(s => (s as any).phase) && (
                  <div className="services-grid">
                    {(result.recommended_services || []).map((s, i) => (
                      <div key={i} className="svc-card svc-card-chain">
                        <div className="svc-step">{i + 1}</div>
                        <div className="svc-content">
                          <div className="svc-name">{s.name}</div>
                          <div className="svc-why">{s.why}</div>
                          {/* Component breakdown */}
                          {(s as any).components?.length > 0 && (
                            <div className="svc-components">
                              <p className="svc-components-label">What this is made of:</p>
                              {((s as any).components as Array<{name:string;what:string;note?:string}>).map((comp, ci) => (
                                <div key={ci} className="svc-component">
                                  <span className="svc-comp-name">{comp.name}</span>
                                  <span className="svc-comp-what">{comp.what}</span>
                                  {comp.note && <span className="svc-comp-note">{comp.note}</span>}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ── VISION ELEVATION — What they said, and what they didn't think about ── */}
              {(result as any).vision_elevation && (
                <div className="elevation-section">
                  <div className="cta-eyebrow" style={{ marginBottom: 6 }}>YOUR VISION, ELEVATED</div>
                  <h3 className="route-title">What You're Actually Building</h3>
                  <div className="elevation-card">
                    <p className="elevation-text">{(result as any).vision_elevation.elevated}</p>
                  </div>
                  {((result as any).vision_elevation.unseen_needs || []).length > 0 && (
                    <div className="elevation-unseen">
                      <p className="route-block-label" style={{ marginBottom: 16 }}>What You Haven't Thought About Yet</p>
                      <div className="unseen-grid">
                        {((result as any).vision_elevation.unseen_needs as string[]).map((need, i) => (
                          <div key={i} className="unseen-item">
                            <span className="unseen-num">{i + 1}</span>
                            <p className="unseen-text">{need}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* ── THE ROUTE ── */}
              {(result.roadmap_timeline || []).length > 0 && (
                <div className="route-section">
                  <div className="cta-eyebrow" style={{ marginBottom: 6 }}>THE ROUTE</div>
                  <h3 className="route-title">Your Gift. Your Vehicle. Here's the Drive.</h3>
                  <p className="route-sub">You told us where you're going. Here's the map — phase by phase, what to expect, what to prepare for, and who you need to become to get there.</p>
                  <div className="route-phases">
                    {(result.roadmap_timeline || []).map((phase, i) => (
                      <div key={i} className="route-phase">
                        <div className="route-phase-header">
                          <div className="route-phase-num">{i + 1}</div>
                          <div>
                            <div className="route-phase-label">{phase.phase} · <span className="route-phase-time">{phase.timeframe}</span></div>
                            <div className="route-phase-title">{phase.title}</div>
                          </div>
                        </div>
                        <p className="route-phase-desc">{phase.description}</p>
                        {(phase.milestones || []).length > 0 && (
                          <div className="route-phase-block">
                            <p className="route-block-label">Milestones</p>
                            <ul className="route-list">{(phase.milestones || []).map((m: string, j: number) => <li key={j}><span className="route-check">✓</span>{m}</li>)}</ul>
                          </div>
                        )}
                        {(phase.challenges || []).length > 0 && (
                          <div className="route-phase-block">
                            <p className="route-block-label">Prepare For</p>
                            <ul className="route-list">{(phase.challenges || []).map((ch: string, j: number) => <li key={j}><span className="route-warn">→</span>{ch}</li>)}</ul>
                          </div>
                        )}
                        {phase.character_needed && (
                          <div className="route-phase-block">
                            <p className="route-block-label">Character Required</p>
                            <p className="route-character">{phase.character_needed}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ── Q&A REFLECTION ── */}
              {(result.qa_reflection || []).length > 0 && (
                <div className="qa-section">
                  <div className="cta-eyebrow" style={{ marginBottom: 6 }}>YOUR COORDINATES</div>
                  <h3 className="route-title">Everything You Said — Mapped</h3>
                  <p className="route-sub">The exact questions we asked and your answers — clarified. This is what built your Roadmap.</p>
                  <div className="qa-list">
                    {(result.qa_reflection || []).map((qa, i) => (
                      <div key={i} className="qa-item">
                        <p className="qa-question"><span className="qa-num">Q{i + 1}  </span>{qa.question}</p>
                        <p className="qa-answer">{qa.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              {/* ── CTA ── */}
              <div className="cta-block">
                <div className="cta-eyebrow">What's Next</div>
                <p className="cta-body">{result.closing_word}</p>
                {onOpenServices ? (
                  <button
                    type="button"
                    className="btn-cta"
                    onClick={() => {
                      // Broadcast recommended services so ServicesMenu highlights them
                      const names = (result.recommended_services || []).map(s => s.name);
                      window.dispatchEvent(new CustomEvent('swrv:roadmap-recommendations', { detail: names }));
                      onOpenServices();
                    }}
                  >
                    {config.copy.resultsCtaButton}
                  </button>
                ) : (
                  <a href={config.ctaUrl} className="btn-cta" target="_blank" rel="noopener noreferrer">
                    {config.copy.resultsCtaButton}
                  </a>
                )}
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
