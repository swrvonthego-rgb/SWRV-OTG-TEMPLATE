import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle2, FolderOpen, Lock } from 'lucide-react';
import { FIELD_STYLE } from '../components/IntakeFields';

const Orange = '#FF4D00';
const Gold = '#c8a84b';

interface Delivery {
  clientName: string;
  title: string;
  message: string | null;
  driveUrl: string | null;
  rawUrl: string | null;
  amountDueCents: number;
  lineDescription: string | null;
  paid: boolean;
}

// A client's private delivery page: /delivered/<token>. Created in /admin →
// Deliveries. Everything a client needs after the work is done, on one
// screen: the work, raw footage, "post it for me", requests, and payment.
export const DeliveryPage: React.FC = () => {
  const { token = '' } = useParams();
  const [params] = useSearchParams();
  const [d, setD] = useState<Delivery | null>(null);
  const [loadError, setLoadError] = useState('');

  const [feeling, setFeeling] = useState('');
  const [changes, setChanges] = useState('');
  const [wantRaw, setWantRaw] = useState(false);
  const [postForMe, setPostForMe] = useState('');
  const [igHandle, setIgHandle] = useState('');
  const [songs, setSongs] = useState('');
  const [other, setOther] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState('');
  // Optional gratuity: a percentage of the amount due, or a custom amount.
  const [tipChoice, setTipChoice] = useState<'none' | '10' | '15' | '20' | 'custom'>('none');
  const [customTip, setCustomTip] = useState('');
  const justPaid = params.get('paid') === '1';

  useEffect(() => {
    fetch(`/api/delivery?t=${encodeURIComponent(token)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setD)
      .catch(() => setLoadError("This link isn't valid anymore. Email info@swrvonthego.pro and we'll send you a fresh one."));
  }, [token]);

  const money = (c: number) => `$${(c / 100).toLocaleString('en-US', { minimumFractionDigits: c % 100 ? 2 : 0 })}`;

  const send = async () => {
    const answers = [
      feeling && { id: 'feeling', question: 'How does everything look?', answer: feeling },
      changes.trim() && { id: 'changes', question: 'Changes or requests', answer: changes.trim() },
      wantRaw && { id: 'raw', question: 'Raw footage', answer: 'Yes, please send the raw footage' },
      postForMe && { id: 'postForMe', question: 'Post it for me?', answer: postForMe },
      postForMe.startsWith('Yes') && igHandle.trim() && { id: 'igHandle', question: 'Instagram handle', answer: igHandle.trim() },
      postForMe.startsWith('Yes') && songs.trim() && { id: 'songs', question: 'Songs to connect', answer: songs.trim() },
      other.trim() && { id: 'other', question: 'Anything else', answer: other.trim() },
    ].filter(Boolean);
    if (!answers.length) { setError('Pick at least one answer above first.'); return; }
    setSending(true); setError('');
    try {
      const res = await fetch('/api/delivery/respond', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, answers }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Something went wrong.');
      setSent(true);
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Reply to our email instead.');
    } finally {
      setSending(false);
    }
  };

  const pay = async () => {
    setPaying(true); setPayError('');
    try {
      const res = await fetch('/api/delivery/pay', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, tipCents }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) throw new Error(data.error || 'Payment could not start.');
      window.location.href = data.checkoutUrl;
    } catch (e: any) {
      setPayError(e.message || 'Payment could not start.');
      setPaying(false);
    }
  };

  const card = { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' };
  const choice = (on: boolean) => ({
    background: on ? 'rgba(255,77,0,0.12)' : 'rgba(255,255,255,0.04)',
    border: `1px solid ${on ? Orange : 'rgba(255,255,255,0.12)'}`,
    color: '#fff',
  });
  const input = 'w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none';

  if (loadError) return <Shell><p className="text-center text-sm py-16" style={{ color: 'rgba(255,255,255,0.6)' }}>{loadError}</p></Shell>;
  if (!d) return <Shell><p className="text-center text-sm py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>Loading…</p></Shell>;

  const paid = d.paid || justPaid;
  const tipCents = tipChoice === 'none' ? 0
    : tipChoice === 'custom' ? Math.max(0, Math.round((parseFloat(customTip) || 0) * 100))
    : Math.round(d.amountDueCents * Number(tipChoice) / 100);
  const totalCents = d.amountDueCents + tipCents;

  return (
    <Shell>
      <h1 className="text-3xl md:text-4xl font-black text-white text-center mt-2 mb-2">Your content is ready, {d.clientName}.</h1>
      <p className="text-center text-sm mb-8" style={{ color: 'rgba(255,255,255,0.5)' }}>{d.title}</p>

      {d.message && (
        <div className="rounded-2xl p-5 mb-6" style={{ ...card, borderColor: 'rgba(200,168,75,0.35)' }}>
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: 'rgba(255,255,255,0.8)' }}>{d.message}</p>
          <p className="text-sm mt-3" style={{ color: Gold }}>— Swerve, SWRV On The Go</p>
        </div>
      )}

      {/* 1 · The work */}
      {d.driveUrl && (
        <a href={d.driveUrl} target="_blank" rel="noreferrer"
          className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl font-bold text-base mb-3"
          style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff', boxShadow: '0 8px 24px rgba(255,77,0,0.3)' }}>
          <FolderOpen size={20} /> View your content
        </a>
      )}
      {d.rawUrl && (
        <a href={d.rawUrl} target="_blank" rel="noreferrer" className="block text-center text-sm underline mb-6" style={{ color: Gold }}>
          Download your raw footage
        </a>
      )}

      {/* 2 · Feedback + requests */}
      <div className="rounded-2xl p-5 mt-6 mb-6 space-y-5" style={card}>
        {sent ? (
          <div className="text-center py-6">
            <CheckCircle2 size={36} color={Orange} className="mx-auto mb-3" />
            <p className="text-white font-semibold">Got it — thank you!</p>
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Swerve will get back to you shortly.</p>
            <button type="button" onClick={() => setSent(false)} className="text-xs underline mt-3" style={{ color: 'rgba(255,255,255,0.45)' }}>Send something else</button>
          </div>
        ) : (
          <>
            <div>
              <p className="text-white font-semibold mb-2">How does everything look?</p>
              <div className="grid gap-2">
                {['I love it', 'Almost there, I have a few changes'].map((o) => (
                  <button key={o} type="button" onClick={() => setFeeling(o)} className="text-left px-4 py-3 rounded-xl text-sm" style={choice(feeling === o)}>{o}</button>
                ))}
              </div>
              {feeling.startsWith('Almost') && (
                <textarea value={changes} onChange={(e) => setChanges(e.target.value)} rows={3} placeholder="Tell us what to change: which piece, and what you'd like different."
                  className={`${input} mt-2`} style={FIELD_STYLE} />
              )}
            </div>

            {!d.rawUrl && (
              <label className="flex items-start gap-3 px-4 py-3 rounded-xl text-sm cursor-pointer" style={choice(wantRaw)}>
                <input type="checkbox" checked={wantRaw} onChange={(e) => setWantRaw(e.target.checked)} className="mt-0.5" />
                <span>Send me the raw footage too<span className="block text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>The original, unedited clips from your shoot.</span></span>
              </label>
            )}

            <div>
              <p className="text-white font-semibold mb-1">Want us to post it for you?</p>
              <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>We'll publish to your Instagram and connect each piece to the right song.</p>
              <div className="grid gap-2">
                {['Yes, post them for me', "No thanks, I'll post them myself"].map((o) => (
                  <button key={o} type="button" onClick={() => setPostForMe(o)} className="text-left px-4 py-3 rounded-xl text-sm" style={choice(postForMe === o)}>{o}</button>
                ))}
              </div>
              {postForMe.startsWith('Yes') && (
                <div className="space-y-2 mt-2">
                  <input value={igHandle} onChange={(e) => setIgHandle(e.target.value)} placeholder="Your Instagram handle, e.g. @yourname" className={input} style={FIELD_STYLE} />
                  <textarea value={songs} onChange={(e) => setSongs(e.target.value)} rows={3} placeholder="Which songs should we use? Name them per piece, or say 'you pick' and we'll match each one."
                    className={input} style={FIELD_STYLE} />
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    Next, give us posting access in two minutes, with no password:{' '}
                    <a href={`/access?name=${encodeURIComponent(d.clientName)}`} target="_blank" rel="noreferrer" className="underline" style={{ color: Gold }}>set up access →</a>
                  </p>
                </div>
              )}
            </div>

            <div>
              <p className="text-white font-semibold mb-2">Anything else you need?</p>
              <textarea value={other} onChange={(e) => setOther(e.target.value)} rows={2} placeholder="Questions, ideas, anything at all."
                className={input} style={FIELD_STYLE} />
            </div>

            {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}
            <button type="button" onClick={send} disabled={sending}
              className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60" style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
              {sending ? 'Sending…' : 'Send to SWRV'}
            </button>
          </>
        )}
      </div>

      {/* 3 · Payment */}
      {d.amountDueCents > 0 && (
        <div className="rounded-2xl p-5 mb-10" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)' }}>
          {paid ? (
            <div className="text-center py-2">
              <CheckCircle2 size={32} color="#46a758" className="mx-auto mb-2" />
              <p className="text-white font-semibold">Paid — thank you!</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>Your receipt is on its way from Stripe.</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-white font-semibold">Amount due</span>
                <span className="text-2xl font-black" style={{ color: Orange }}>{money(d.amountDueCents)}</span>
              </div>
              {d.lineDescription && <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.55)' }}>{d.lineDescription}</p>}

              <div className="mb-4">
                <p className="text-white text-sm font-semibold mb-1">Add a gratuity</p>
                <p className="text-xs mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>Optional, and always appreciated by the team who created your content.</p>
                <div className="grid grid-cols-5 gap-1.5">
                  {([['none', 'None'], ['10', '10%'], ['15', '15%'], ['20', '20%'], ['custom', 'Other']] as const).map(([k, label]) => (
                    <button key={k} type="button" onClick={() => setTipChoice(k)}
                      className="py-2.5 rounded-lg text-xs font-semibold" style={choice(tipChoice === k)}>{label}</button>
                  ))}
                </div>
                {tipChoice === 'custom' && (
                  <input value={customTip} onChange={(e) => setCustomTip(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal"
                    placeholder="Gratuity amount in $" className={`${input} mt-2`} style={FIELD_STYLE} />
                )}
                {tipCents > 0 && (
                  <div className="text-xs mt-3 space-y-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
                    <div className="flex justify-between"><span>Amount due</span><span>{money(d.amountDueCents)}</span></div>
                    <div className="flex justify-between"><span>Gratuity</span><span>{money(tipCents)}</span></div>
                    <div className="flex justify-between text-white font-semibold pt-1" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}><span>Total today</span><span>{money(totalCents)}</span></div>
                  </div>
                )}
              </div>
              <button type="button" onClick={pay} disabled={paying}
                className="w-full py-4 rounded-xl font-bold text-sm disabled:opacity-60"
                style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff', boxShadow: '0 8px 24px rgba(255,77,0,0.35)' }}>
                {paying ? 'Opening secure checkout…' : `Pay ${money(totalCents)} →`}
              </button>
              {payError && <p className="text-sm mt-2" style={{ color: '#e5484d' }}>{payError}</p>}
              <p className="text-xs text-center mt-3 flex items-center justify-center gap-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                <Lock size={11} /> Secure checkout by Stripe. Cards, Apple Pay, Google Pay.
              </p>
              <p className="text-xs text-center mt-2" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Want changes first? Send your requests above and pay whenever you're happy.
              </p>
            </>
          )}
        </div>
      )}
    </Shell>
  );
};

const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="min-h-screen px-4 py-12" style={{ background: '#0a0804' }}>
    <div className="max-w-xl mx-auto">
      <p className="text-xs font-bold tracking-[0.3em] uppercase text-center" style={{ color: Gold }}>SWRV On The Go</p>
      {children}
    </div>
  </div>
);
