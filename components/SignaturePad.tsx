import React, { useEffect, useRef, useState } from 'react';

// A small signature box that works with a finger, stylus or mouse. Ink is
// dark on a white card (like paper) so the saved PNG reads anywhere.
// onChange gets a PNG data URL once there's a real signature (enough ink
// that a stray tap doesn't count), or null when cleared.
export function SignaturePad({ onChange, height = 150 }: { onChange: (png: string | null) => void; height?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const last = useRef<{ x: number; y: number } | null>(null);
  const inkLength = useRef(0);
  const [hasInk, setHasInk] = useState(false);

  // Size the canvas to its box at the screen's pixel density.
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    const w = c.clientWidth;
    c.width = Math.round(w * ratio);
    c.height = Math.round(height * ratio);
    const ctx = c.getContext('2d')!;
    ctx.scale(ratio, ratio);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#111';
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, height);
  }, [height]);

  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const down = (e: React.PointerEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drawing.current = true;
    last.current = point(e);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current || !last.current) return;
    e.preventDefault();
    const p = point(e);
    const ctx = e.currentTarget.getContext('2d')!;
    ctx.beginPath();
    ctx.moveTo(last.current.x, last.current.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    inkLength.current += Math.hypot(p.x - last.current.x, p.y - last.current.y);
    last.current = p;
  };
  const up = () => {
    if (!drawing.current) return;
    drawing.current = false;
    last.current = null;
    const signed = inkLength.current > 40;
    setHasInk(signed);
    onChange(signed ? canvasRef.current!.toDataURL('image/png') : null);
  };
  const clear = () => {
    const c = canvasRef.current!;
    const ctx = c.getContext('2d')!;
    ctx.fillRect(0, 0, c.width, c.height);
    inkLength.current = 0;
    setHasInk(false);
    onChange(null);
  };

  return (
    <div>
      <div className="relative rounded-xl overflow-hidden" style={{ background: '#fff' }}>
        <canvas
          ref={canvasRef}
          aria-label="Sign here with your finger or mouse"
          style={{ width: '100%', height, display: 'block', touchAction: 'none', cursor: 'crosshair' }}
          onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onPointerLeave={up}
        />
        {!hasInk && (
          <span className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm" style={{ color: '#9a9a9a' }}>
            Sign here with your finger
          </span>
        )}
        <span className="absolute left-4 right-4 bottom-8 pointer-events-none" style={{ borderTop: '1px solid #d6d6d6' }} />
      </div>
      <div className="flex justify-end mt-1.5">
        <button type="button" onClick={clear} className="text-xs underline" style={{ color: 'rgba(255,255,255,0.5)' }}>Clear</button>
      </div>
    </div>
  );
}
