import React, { useCallback, useEffect, useRef, useState } from 'react';

// A scrollable region that tells people it scrolls: soft fades on the edges
// that still have content, plus a tappable arrow (sideways) or "more below"
// pill (up and down). Everything disappears when nothing is cut off, so
// content that fits looks exactly as before.
interface Props extends React.HTMLAttributes<HTMLDivElement> {
  // React 19 dropped `children` from HTMLAttributes, so both are declared
  // explicitly here (this component wraps content and takes classes).
  children?: React.ReactNode;
  className?: string;
  axis: 'x' | 'y';
  /** Classes for the outer, positioned wrapper. */
  wrapperClassName?: string;
  /** Colour of the edge fades; match the surface behind the region. */
  fadeColor: string;
  /** Colours of the arrow / pill. */
  accentBg: string;
  accentFg: string;
  label?: string;
}

export function ScrollHint({ axis, wrapperClassName, fadeColor, accentBg, accentFg, label, className, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [more, setMore] = useState({ start: false, end: false });

  const measure = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const pos = axis === 'x' ? el.scrollLeft : el.scrollTop;
    const size = axis === 'x' ? el.clientWidth : el.clientHeight;
    const total = axis === 'x' ? el.scrollWidth : el.scrollHeight;
    setMore({ start: pos > 8, end: pos + size < total - 8 });
  }, [axis]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const mo = new MutationObserver(measure);
    mo.observe(el, { childList: true, subtree: true });
    window.addEventListener('resize', measure);
    return () => { ro.disconnect(); mo.disconnect(); window.removeEventListener('resize', measure); };
  }, [measure]);

  const nudge = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    const step = (axis === 'x' ? el.clientWidth : el.clientHeight) * 0.7 * dir;
    el.scrollBy({ [axis === 'x' ? 'left' : 'top']: step, behavior: 'smooth' } as ScrollToOptions);
  };

  const fade = (side: 'start' | 'end') => {
    const toward = axis === 'x' ? (side === 'start' ? 'right' : 'left') : (side === 'start' ? 'bottom' : 'top');
    const pos: React.CSSProperties = axis === 'x'
      ? { top: 0, bottom: 0, width: 56, [side === 'start' ? 'left' : 'right']: 0 }
      : { left: 0, right: 0, height: 56, [side === 'start' ? 'top' : 'bottom']: 0 };
    return (
      <div aria-hidden="true" style={{ position: 'absolute', pointerEvents: 'none', zIndex: 2, background: `linear-gradient(to ${toward}, ${fadeColor}, transparent)`, ...pos }} />
    );
  };

  return (
    <div className={wrapperClassName} style={{ position: 'relative', minHeight: 0 }}>
      <div ref={ref} className={className} onScroll={measure} {...rest}>{children}</div>
      {more.start && fade('start')}
      {more.end && fade('end')}
      {axis === 'x' && more.end && (
        <button type="button" aria-label={label || 'Scroll right for more'} onClick={() => nudge(1)}
          style={{ position: 'absolute', right: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 40, height: 40, borderRadius: '50%', border: 'none', background: accentBg, color: accentFg, fontSize: 22, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>›</button>
      )}
      {axis === 'x' && more.start && (
        <button type="button" aria-label="Scroll left" onClick={() => nudge(-1)}
          style={{ position: 'absolute', left: 6, top: '50%', transform: 'translateY(-50%)', zIndex: 3, width: 40, height: 40, borderRadius: '50%', border: 'none', background: accentBg, color: accentFg, fontSize: 22, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.35)' }}>‹</button>
      )}
      {axis === 'y' && more.end && (
        <button type="button" aria-label={label || 'Scroll down for more'} onClick={() => nudge(1)}
          style={{ position: 'absolute', left: '50%', bottom: 10, transform: 'translateX(-50%)', zIndex: 3, padding: '8px 16px', borderRadius: 999, border: 'none', background: accentBg, color: accentFg, fontSize: 13, fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,0.4)' }}>↓ More below</button>
      )}
    </div>
  );
}
