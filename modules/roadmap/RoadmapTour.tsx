import React, { useEffect, useLayoutEffect, useState, useCallback } from 'react';

// ════════════════════════════════════════════════════════════
// RoadmapTour — first-run coach-marks
// ════════════════════════════════════════════════════════════
// A brief "here's what you can do" walkthrough that pops up the first
// time someone opens the Roadmap. Each step spotlights one control
// (dims everything else) with a short tooltip. Tap Next, or click
// anywhere off the card, to advance. Shows once (localStorage), with a
// small "?" button to replay it later.
//
// Steps whose target element isn't on screen yet (e.g. the mic, which
// only appears on question screens) render as a centered card with no
// spotlight — so the tour still explains them up front.
// ════════════════════════════════════════════════════════════

export interface TourStep {
  /** CSS selector for the element to spotlight (searched within .roadmap-experience). */
  selector?: string;
  emoji: string;
  title: string;
  body: string;
}

interface Rect { top: number; left: number; width: number; height: number; }

interface Props {
  open: boolean;
  steps: TourStep[];
  onClose: () => void;
}

export const RoadmapTour: React.FC<Props> = ({ open, steps, onClose }) => {
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  const step = steps[i];

  // Measure the current step's target (if any). Re-measure on resize/scroll.
  const measure = useCallback(() => {
    if (!step?.selector) { setRect(null); return; }
    const root = document.querySelector('.roadmap-experience');
    const el = root?.querySelector(step.selector) as HTMLElement | null;
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) { setRect(null); return; }
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [step]);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    // Measure again next frame in case the layout is still settling.
    const raf = requestAnimationFrame(measure);
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', measure);
      window.removeEventListener('scroll', measure, true);
    };
  }, [open, measure]);

  // Reset to step 0 whenever the tour is (re)opened.
  useEffect(() => { if (open) setI(0); }, [open]);

  const finish = useCallback(() => { onClose(); }, [onClose]);
  const next = useCallback(() => {
    if (i >= steps.length - 1) finish();
    else setI((n) => n + 1);
  }, [i, steps.length, finish]);

  if (!open || !step) return null;

  const pad = 8;
  const isLast = i === steps.length - 1;

  // Spotlight ring geometry (only when we have a target).
  const ring = rect ? {
    top: rect.top - pad,
    left: rect.left - pad,
    width: rect.width + pad * 2,
    height: rect.height + pad * 2,
  } : null;

  // Card placement: below the target if there's room, else above; centered
  // when there's no target.
  let cardStyle: React.CSSProperties;
  if (ring) {
    const vh = window.innerHeight;
    const below = ring.top + ring.height + 14;
    const placeBelow = below < vh - 200;
    const cardTop = placeBelow ? below : Math.max(14, ring.top - 14);
    // Keep the card horizontally on-screen, roughly aligned to the target.
    const rawLeft = ring.left + ring.width / 2;
    const clampedLeft = Math.min(Math.max(rawLeft, 170), window.innerWidth - 170);
    cardStyle = {
      top: cardTop,
      left: clampedLeft,
      transform: `translateX(-50%)${placeBelow ? '' : ' translateY(-100%)'}`,
    };
  } else {
    cardStyle = { top: '50%', left: '50%', transform: 'translate(-50%,-50%)' };
  }

  return (
    <div className="rm-tour" role="dialog" aria-modal="true" aria-label="Roadmap walkthrough">
      {/* Click-catcher: tapping anywhere off the card advances the tour */}
      <div className="rm-tour-catch" onClick={next} />

      {/* Spotlight ring around the target (pointer-events none so it never blocks) */}
      {ring && (
        <div
          className="rm-tour-ring"
          style={{ top: ring.top, left: ring.left, width: ring.width, height: ring.height }}
        />
      )}

      {/* Tooltip card */}
      <div className="rm-tour-card" style={cardStyle} onClick={(e) => e.stopPropagation()}>
        <div className="rm-tour-emoji" aria-hidden="true">{step.emoji}</div>
        <div className="rm-tour-title">{step.title}</div>
        <div className="rm-tour-body">{step.body}</div>
        <div className="rm-tour-foot">
          <div className="rm-tour-dots">
            {steps.map((_, k) => (
              <span key={k} className={'rm-tour-dot' + (k === i ? ' on' : '')} />
            ))}
          </div>
          <div className="rm-tour-btns">
            {!isLast && (
              <button type="button" className="rm-tour-skip" onClick={finish}>Skip</button>
            )}
            <button type="button" className="rm-tour-next" onClick={next}>
              {isLast ? 'Got it' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
