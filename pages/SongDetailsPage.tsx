import React, { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';
import { buildIntakeQuestions } from '../intake.config';
import { IntakeFields, FIELD_STYLE, firstMissing, toIntakePayload, type Answers } from '../components/IntakeFields';

const Orange = '#FF4D00';
const Gold = '#c8a84b';

// Custom birthday song details — linked from a client's deposit invoice
// (e.g. /song?name=Thanayi&date=2027-05-29) so the song brief arrives with
// the booking. Questions come from the 'song' set in intake.config.ts;
// answers are saved as a booking (so the date shows on the calendar and in
// /admin) and emailed to SWRV.
export const SongDetailsPage: React.FC = () => {
  const [params] = useSearchParams();
  const questions = useMemo(() => buildIntakeQuestions(undefined, { path: 'song', forCheckout: true }), []);
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
    const missing = firstMissing(questions, answers);
    if (missing) { setError(`Please answer: "${missing.question}"`); return; }
    setSubmitting(true); setError('');
    try {
      const res = await fetch('/api/song-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), eventDate, intake: toIntakePayload(questions, answers) }),
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
        <h1 className="text-3xl md:text-4xl font-black text-white text-center mt-2 mb-3">Your Custom Birthday Song</h1>

        {done ? (
          <div className="text-center py-12">
            <CheckCircle2 size={40} color={Orange} className="mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">Got it — thank you!</p>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Your song details are with Zion. If anything comes up before the big day, just reply to your invoice email.
            </p>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-6">
            <p className="text-sm text-center" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Tell us the story, and we'll write and record a song that's unmistakably theirs.
            </p>
            <div className="grid gap-3">
              <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
              <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
              <label className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                Party date
                <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                  className="mt-1 w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none" style={{ ...FIELD_STYLE, colorScheme: 'dark' }} />
              </label>
            </div>

            <IntakeFields questions={questions} answers={answers} onChange={setAnswers} />

            {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}
            <button type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff' }}>
              {submitting ? 'Sending…' : 'Send My Song Details →'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
