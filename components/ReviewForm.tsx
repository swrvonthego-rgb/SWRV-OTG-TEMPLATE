import React, { useEffect, useState } from 'react';
import { CheckCircle2, Star } from 'lucide-react';
import { FIELD_STYLE } from './IntakeFields';

const Orange = '#FF4D00';
const Gold = '#c8a84b';

// A paying client's review + private suggestions, posted to /api/review
// with their private token. Nothing here goes public on its own: every
// review is read by Swerve first (see handleReview in src/worker.js).
export function ReviewForm({ token }: { token: string }) {
  const [info, setInfo] = useState<{ clientName: string; service: string; eligible: boolean; submitted: boolean } | null>(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [review, setReview] = useState('');
  const [suggestions, setSuggestions] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [allowPublic, setAllowPublic] = useState(false);
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/review?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        setInfo(d);
        if (d?.clientName) setDisplayName(d.clientName.split(' ')[0]);
      })
      .catch(() => setInfo(null));
  }, [token]);

  if (!info) return null;
  if (!info.eligible) {
    return <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.5)' }}>Reviews open once your project is complete and paid.</p>;
  }
  if (info.submitted || done) {
    return (
      <div className="text-center py-6">
        <CheckCircle2 size={36} color={Orange} className="mx-auto mb-3" />
        <p className="text-white font-semibold">Thank you for sharing your experience.</p>
        <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {done && rating > 0 && rating <= 3
            ? "We're sorry it wasn't perfect. Swerve will personally reach out to make it right."
            : 'It means a great deal to our team.'}
        </p>
      </div>
    );
  }

  const submit = async () => {
    if (!rating) { setError('Please choose a star rating.'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/review', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, rating, review, suggestions, displayName, allowPublic }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setDone(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please email info@swrvonthego.pro.');
    } finally {
      setSending(false);
    }
  };

  const input = 'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none';
  const shown = hover || rating;

  return (
    <div className="space-y-5">
      <div className="text-center">
        <p className="text-white font-semibold mb-1">How was your experience?</p>
        <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{info.service}</p>
        <div className="flex justify-center gap-2" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((n) => (
            <button key={n} type="button" aria-label={`${n} star${n > 1 ? 's' : ''}`}
              onClick={() => setRating(n)} onMouseEnter={() => setHover(n)} className="p-1">
              <Star size={34} fill={n <= shown ? Gold : 'transparent'} color={n <= shown ? Gold : 'rgba(255,255,255,0.3)'} strokeWidth={1.5} />
            </button>
          ))}
        </div>
        {rating > 0 && rating <= 3 && (
          <p className="text-xs mt-3" style={{ color: 'rgba(255,255,255,0.6)' }}>
            We're sorry it wasn't perfect. Tell us what happened below, and Swerve will personally reach out to make it right.
          </p>
        )}
      </div>

      <div>
        <p className="text-white text-sm font-semibold mb-1">Your review</p>
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>What stood out about working with us? Please keep it respectful. Honest feedback is always welcome.</p>
        <textarea value={review} onChange={(e) => setReview(e.target.value)} rows={4} maxLength={2000}
          placeholder="Share your experience…" className={input} style={FIELD_STYLE} />
      </div>

      <div>
        <p className="text-white text-sm font-semibold mb-1">Suggestions for us <span className="font-normal text-xs" style={{ color: Gold }}>· private</span></p>
        <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Only Swerve sees this. What could we do better next time?</p>
        <textarea value={suggestions} onChange={(e) => setSuggestions(e.target.value)} rows={3} maxLength={2000}
          placeholder="Anything we could improve…" className={input} style={FIELD_STYLE} />
      </div>

      {review.trim() && (
        <div className="space-y-2">
          <label className="flex items-start gap-3 text-sm cursor-pointer" style={{ color: 'rgba(255,255,255,0.8)' }}>
            <input type="checkbox" checked={allowPublic} onChange={(e) => setAllowPublic(e.target.checked)} className="mt-1" />
            <span>SWRV may share my review on its website</span>
          </label>
          {allowPublic && (
            <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={60}
              placeholder="Name to show, e.g. Tyeisha M." className={input} style={FIELD_STYLE} />
          )}
        </div>
      )}

      {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}
      <button type="button" onClick={submit} disabled={sending}
        className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60"
        style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff' }}>
        {sending ? 'Sending…' : 'Submit review'}
      </button>
    </div>
  );
}
