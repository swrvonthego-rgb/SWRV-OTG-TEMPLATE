import React, { useEffect, useState } from 'react';

interface ReviewRow {
  id: number;
  client_name: string | null;
  service_name: string | null;
  display_name: string | null;
  rating: number;
  review_text: string | null;
  suggestions: string | null;
  allow_public: number;
  status: 'pending' | 'published' | 'hidden';
  hide_reason: string | null;
  owner_reply: string | null;
  created_at: string;
}

// /admin → Reviews. Every review lands here first. Publish genuine ones
// whatever the rating; hide only for one of the listed reasons (the FTC's
// rule bars suppressing reviews just because they're negative).
export function ReviewsAdmin() {
  const [rows, setRows] = useState<ReviewRow[]>([]);
  const [reasons, setReasons] = useState<string[]>([]);
  const [replyDraft, setReplyDraft] = useState<Record<number, string>>({});
  const [hideReason, setHideReason] = useState<Record<number, string>>({});
  const [error, setError] = useState('');

  const load = () => fetch('/api/admin/reviews', { credentials: 'same-origin' })
    .then((r) => (r.ok ? r.json() : { reviews: [], hideReasons: [] }))
    .then((d) => { setRows(d.reviews || []); setReasons(d.hideReasons || []); });
  useEffect(() => { load(); }, []);

  const act = async (id: number, body: Record<string, unknown>) => {
    setError('');
    const res = await fetch('/api/admin/reviews', {
      method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id, ...body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) setError(data.error || 'Something went wrong');
    load();
  };

  return (
    <div className="space-y-4">
      <p className="text-white/30 text-xs">
        Reviews from verified paying clients. Nothing is public until you publish it. Publish genuine reviews whatever
        the rating, and hide one only for a listed reason. A thoughtful public reply is the best answer to a low review.
        Private suggestions are never shown publicly.
      </p>
      {error && <p className="text-sm text-red-400">{error}</p>}
      {rows.length === 0 && <p className="text-white/30 text-sm">No reviews yet.</p>}
      {rows.map((r) => (
        <div key={r.id} className="rounded-xl border border-white/10 p-4 text-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <span className="text-lion-orange tracking-widest">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</span>
              <span className="text-white/60 ml-2">{r.client_name} · {r.service_name}</span>
            </div>
            <span className={`uppercase tracking-widest text-[10px] ${r.status === 'published' ? 'text-green-400' : r.status === 'hidden' ? 'text-white/30' : 'text-lion-orange'}`}>
              {r.status}{r.hide_reason ? ` · ${r.hide_reason}` : ''}
            </span>
          </div>
          {r.review_text && <p className="text-white/80 whitespace-pre-wrap mb-2">“{r.review_text}”</p>}
          <p className="text-white/30 text-xs mb-2">
            {r.allow_public ? `OK to publish as "${r.display_name || 'Verified client'}"` : 'Client asked to keep this private'} · {r.created_at} UTC
          </p>
          {r.suggestions && (
            <div className="rounded-lg bg-white/[0.03] border border-white/10 p-3 mb-3">
              <div className="text-[10px] uppercase tracking-widest text-white/30 mb-1">Private suggestions</div>
              <p className="text-white/70 whitespace-pre-wrap text-xs">{r.suggestions}</p>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-2">
            {r.allow_public === 1 && r.status !== 'published' && (
              <button onClick={() => act(r.id, { action: 'publish' })} className="px-3 py-1.5 rounded-lg bg-green-600/80 text-white text-xs font-semibold">Publish</button>
            )}
            {r.status !== 'hidden' && (
              <>
                <select value={hideReason[r.id] || ''} onChange={(e) => setHideReason({ ...hideReason, [r.id]: e.target.value })}
                  className="bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-xs text-white/70">
                  <option value="">Hide for a reason…</option>
                  {reasons.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
                {hideReason[r.id] && (
                  <button onClick={() => act(r.id, { action: 'hide', reason: hideReason[r.id] })} className="px-3 py-1.5 rounded-lg border border-white/20 text-white/70 text-xs">Hide</button>
                )}
              </>
            )}
          </div>
          <div className="mt-3 flex gap-2">
            <input value={replyDraft[r.id] ?? r.owner_reply ?? ''} onChange={(e) => setReplyDraft({ ...replyDraft, [r.id]: e.target.value })}
              placeholder="Public reply from Swerve (optional)"
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white placeholder-white/30" />
            <button onClick={() => act(r.id, { action: 'reply', reply: replyDraft[r.id] ?? r.owner_reply ?? '' })}
              className="px-3 py-1.5 rounded-lg border border-lion-orange/50 text-lion-orange text-xs">Save reply</button>
          </div>
        </div>
      ))}
    </div>
  );
}
