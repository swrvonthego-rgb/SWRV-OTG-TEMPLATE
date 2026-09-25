import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, Lock } from 'lucide-react';
import { ACCESS_QUESTIONS } from '../intake.config';
import { IntakeFields, FIELD_STYLE, firstMissing, toIntakePayload, type Answers } from '../components/IntakeFields';

const Orange = '#FF4D00';
const Gold = '#c8a84b';

// Standalone "give us posting access" page for clients booked outside the
// Book & Pay flow (e.g. from an invoice): /access?name=...&date=...
// Same questions and walkthrough as the Event intake (ACCESS_QUESTIONS in
// intake.config.ts). No password is ever collected here.
export const AccessPage: React.FC = () => {
  const [params] = useSearchParams();
  const [name, setName] = useState(params.get('name') || '');
  const [email, setEmail] = useState('');
  const [eventDate, setEventDate] = useState(params.get('date') || '');
  const [answers, setAnswers] = useState<Answers>({});
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Your name and email are required.'); return; }
    const missing = firstMissing(ACCESS_QUESTIONS, answers);
    if (missing) { setError(`Please answer: "${missing.question}"`); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/access-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), eventDate, intake: toIntakePayload(ACCESS_QUESTIONS, answers) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `Something went wrong (${res.status})`);
      setDone(true);
      window.scrollTo({ top: 0 });
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Email info@swrvonthego.pro directly.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#0a0804' }}>
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-center" style={{ color: Gold }}>SWRV On The Go</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center mt-2 mb-3">Give Us Posting Access</h1>

        {done ? (
          <div className="text-center py-12">
            <CheckCircle2 size={40} color={Orange} className="mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">You're all set — thank you!</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              We'll confirm we can see your account before the day. Remove us after the event from the same screen.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <p className="text-sm text-center flex items-center justify-center gap-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
              <Lock size={13} /> We never ask for your password. You add us, and you can remove us anytime.
            </p>
            <div className="grid gap-3">
              <input id="access-name" type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
              <input id="access-email" type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
              <label className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Event date
                <input id="access-date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none" style={{ ...FIELD_STYLE, colorScheme: 'dark' }} />
              </label>
            </div>

            <IntakeFields questions={ACCESS_QUESTIONS} answers={answers} onChange={setAnswers} />

            {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff' }}>
              {submitting ? 'Sending…' : 'Confirm Access →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
