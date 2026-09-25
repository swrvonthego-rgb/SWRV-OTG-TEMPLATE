import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ChevronLeft, CheckCircle, FileText, Loader } from 'lucide-react';

import { PATH_LABELS, getIntakePath, buildIntakeQuestions, type AnswerValue, type Question } from '../intake.config';
import type { IntakePath } from '../site.config';

// ── COMPONENT ─────────────────────────────────────────────────────────
// intakePath: which question set to use when serviceId isn't a catalog
// service (e.g. "The Full Ride" card) — otherwise it's worked out from the
// catalog via getIntakePath.
interface Props { isOpen: boolean; onClose: () => void; serviceId?: string; serviceName?: string; intakePath?: IntakePath; }

export const ProjectIntake: React.FC<Props> = ({ isOpen, onClose, serviceId, serviceName, intakePath }) => {
  const [path, setPath] = useState<IntakePath | null>(null);
  const [step, setStep] = useState<'select' | 'questions' | 'ai-followup' | 'contact' | 'brief' | 'done'>('select');
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentInput, setCurrentInput] = useState<AnswerValue>('');
  const [followups, setFollowups] = useState<Question[]>([]);
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-set path from serviceId
  useEffect(() => {
    if (isOpen && (serviceId || intakePath)) {
      const p = getIntakePath(serviceId) ?? intakePath ?? null;
      if (p) { setPath(p); setStep('questions'); setQIdx(0); }
    }
  }, [isOpen, serviceId, intakePath]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setPath(null); setStep('select'); setQIdx(0);
        setAnswers({}); setCurrentInput(''); setFollowups([]);
        setBrief(''); setLoading(false); setName(''); setEmail('');
        setPhone(''); setSubmitting(false); setError('');
      }, 300);
    }
  }, [isOpen]);

  const questions = React.useMemo(
    () => buildIntakeQuestions(serviceId, { path }),
    [path, serviceId],
  );
  const allQs = [...questions, ...followups];
  const currentQ = allQs[qIdx];
  const progress = allQs.length ? Math.round(((qIdx) / allQs.length) * 100) : 0;

  const handleSelectOption = (opt: string) => {
    if (!currentQ) return;
    if (currentQ.type === 'single') {
      setCurrentInput(opt);
    } else {
      const arr = Array.isArray(currentInput) ? [...currentInput] : [];
      const idx = arr.indexOf(opt);
      if (idx > -1) arr.splice(idx, 1); else arr.push(opt);
      setCurrentInput(arr);
    }
  };

  const isSelected = (opt: string) => {
    if (Array.isArray(currentInput)) return currentInput.includes(opt);
    return currentInput === opt;
  };

  const canAdvance = () => {
    if (currentQ?.optional) return true;
    if (Array.isArray(currentInput)) return currentInput.length > 0;
    return String(currentInput).trim().length > 0;
  };

  const advance = async () => {
    if (!currentQ) return;
    const newAnswers = { ...answers, [currentQ.id]: currentInput };
    setAnswers(newAnswers);
    setCurrentInput('');

    const isLastHardcoded = qIdx === questions.length - 1;
    const isLast = qIdx === allQs.length - 1;

    if (isLastHardcoded && followups.length === 0) {
      // Get AI follow-ups
      setLoading(true);
      try {
        const res = await fetch('/api/intake-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'followup', path, answers: newAnswers }),
        });
        const data = await res.json();
        if (data.questions?.length) {
          setFollowups(data.questions.map((q: string, i: number) => ({
            id: `ai_${i}`, question: q, type: 'textarea' as const, optional: true,
            placeholder: 'Share as much detail as helpful…',
          })));
          setQIdx(qIdx + 1);
        } else {
          setStep('contact');
        }
      } catch {
        setStep('contact');
      }
      setLoading(false);
    } else if (isLast) {
      setStep('contact');
    } else {
      setQIdx(qIdx + 1);
    }
  };

  const generateBrief = async () => {
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/intake-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'brief', path, answers, name, email, phone, serviceName }),
      });
      const data = await res.json();
      setBrief(data.brief || 'Your project brief has been received.');
      setStep('brief');
    } catch {
      setError('Connection error. Please email info@swrvonthego.pro');
    }
    setSubmitting(false);
  };

  const submitBrief = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/intake-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, pathLabel: path ? PATH_LABELS[path] : 'Project', answers, name, email, phone, brief, serviceName }),
      });
      setStep('done');
    } catch {
      setStep('done'); // still complete even if email fails
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const Gold = '#c8a84b';
  const BG  = 'rgba(10,8,4,0.98)';
  const BORDER = 'rgba(255,255,255,0.08)';

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-2xl max-h-[90svh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: BG, border: '1px solid rgba(200,168,75,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: Gold }}>
              {path ? `${PATH_LABELS[path]} Intake` : 'Project Intake'}
            </p>
            {serviceName && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{serviceName}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Progress bar */}
        {step === 'questions' && (
          <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${Gold}, #e8c96a)` }} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8">

          {/* ── SELECT PATH ── */}
          {step === 'select' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-2">What are we building?</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Select the category closest to what you need. We'll ask the right questions from there.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PATH_LABELS).map(([key, label]) => (
                  <button key={key}
                    onClick={() => { setPath(key as IntakePath); setStep('questions'); setQIdx(0); }}
                    className="p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${BORDER}` }}>
                    <p className="font-bold text-sm text-white">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {key === 'website' ? 'Presence, Platform, Ecosystem, Fundraising' :
                       key === 'video'   ? 'Music video, Promo, Events, Reels, AI' :
                       key === 'music'   ? 'Production, Mixing, Mastering, Recording' :
                       key === 'brand'   ? 'Logo, Identity, Photography, Strategy' :
                       key === 'business'? 'Pitch decks, Plans, Books, LLC' :
                       key === 'podcast' ? 'Launch kit, Recording, Distribution' :
                       'Coaching, Artist Dev, Strategy'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── QUESTIONS ── */}
          {step === 'questions' && currentQ && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-bold" style={{ color: Gold }}>
                  {qIdx + 1} of {allQs.length}
                </span>
                {currentQ.optional && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>Optional</span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mb-2 leading-tight">{currentQ.question}</h2>
              {currentQ.sub && <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentQ.sub}</p>}
              {currentQ.help && (
                <details className="mb-5 rounded-lg px-4 py-3" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.2)' }}>
                  <summary className="text-sm font-semibold cursor-pointer" style={{ color: '#e8c96a' }}>How do I do this?</summary>
                  <ol className="mt-2 space-y-2 list-decimal pl-5">
                    {currentQ.help.map((st, i) => <li key={i} className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>{st}</li>)}
                  </ol>
                </details>
              )}

              {/* Options */}
              {currentQ.options && (
                <div className="flex flex-col gap-2 mb-6">
                  {currentQ.options.map(opt => (
                    <button key={opt} onClick={() => handleSelectOption(opt)}
                      className="w-full p-3.5 rounded-xl text-left transition-all text-sm"
                      style={{
                        background: isSelected(opt) ? 'rgba(200,168,75,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected(opt) ? 'rgba(200,168,75,0.5)' : BORDER}`,
                        color: isSelected(opt) ? '#ede8dc' : 'rgba(255,255,255,0.7)',
                        fontWeight: isSelected(opt) ? 600 : 400,
                      }}>
                      <span className="mr-3" style={{ color: isSelected(opt) ? Gold : 'transparent' }}>✓</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Text input */}
              {(currentQ.type === 'text' || currentQ.type === 'textarea') && (
                <textarea
                  ref={inputRef}
                  rows={currentQ.type === 'textarea' ? 4 : 2}
                  value={String(currentInput)}
                  onChange={e => setCurrentInput(e.target.value)}
                  placeholder={currentQ.placeholder || 'Your answer…'}
                  className="w-full px-4 py-3 text-sm outline-none resize-none mb-4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, color: '#fff', lineHeight: 1.7 }}
                />
              )}
            </div>
          )}

          {/* ── AI LOADING ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader size={32} style={{ color: Gold }} className="animate-spin mb-4" />
              <p className="text-sm font-semibold text-white">Generating follow-up questions…</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Based on everything you've told us so far</p>
            </div>
          )}

          {/* ── CONTACT ── */}
          {step === 'contact' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Almost there.</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                We'll generate your project brief and send a copy to your email. SWRV will follow up within 24 hours.
              </p>
              {[
                { label: 'Your Name *', val: name, set: setName, type: 'text', ph: 'Full name' },
                { label: 'Email *', val: email, set: setEmail, type: 'email', ph: 'your@email.com' },
                { label: 'Phone (optional)', val: phone, set: setPhone, type: 'tel', ph: '(000) 000-0000' },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    className="w-full px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, color: '#fff' }} />
                </div>
              ))}
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
          )}

          {/* ── BRIEF PREVIEW ── */}
          {step === 'brief' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
                  <FileText size={18} color="#0a0804" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Your Project Brief</h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Review before we send it to SWRV</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl mb-6 text-xs leading-relaxed whitespace-pre-wrap"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', maxHeight: 300, overflowY: 'auto' }}>
                {brief}
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
                <CheckCircle size={32} color="#0a0804" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Brief Submitted 🎉</h2>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                SWRV has everything they need to get started.
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Check your email for a copy. Expect a response within 24 hours.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!loading && step !== 'done' && (
          <div className="px-6 pb-6 pt-2 border-t flex gap-3 items-center" style={{ borderColor: BORDER }}>
            {step === 'questions' && qIdx > 0 && (
              <button onClick={() => { setQIdx(q => q - 1); setCurrentInput(answers[allQs[qIdx - 1]?.id] || ''); }}
                className="p-3 rounded-full" style={{ border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.4)' }}>
                <ChevronLeft size={18} />
              </button>
            )}
            {step === 'select' ? null :
             step === 'questions' ? (
               <button onClick={advance} disabled={!canAdvance()}
                 className="flex-1 py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                 style={{ background: canAdvance() ? `linear-gradient(135deg,${Gold},#e8c96a)` : 'rgba(255,255,255,0.06)', color: canAdvance() ? '#0a0804' : 'rgba(255,255,255,0.25)' }}>
                 {qIdx === allQs.length - 1 ? 'Finish →' : 'Next'} <ArrowRight size={16} />
               </button>
             ) : step === 'contact' ? (
               <button onClick={generateBrief} disabled={!name || !email || submitting}
                 className="flex-1 py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                 style={{ background: name && email ? `linear-gradient(135deg,${Gold},#e8c96a)` : 'rgba(255,255,255,0.06)', color: name && email ? '#0a0804' : 'rgba(255,255,255,0.25)' }}>
                 {submitting ? 'Generating…' : 'Generate My Brief →'}
               </button>
             ) : step === 'brief' ? (
               <button onClick={submitBrief} disabled={submitting}
                 className="flex-1 py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                 style={{ background: `linear-gradient(135deg,${Gold},#e8c96a)`, color: '#0a0804', boxShadow: '0 8px 24px rgba(200,168,75,0.35)' }}>
                 {submitting ? 'Sending…' : 'Send to SWRV →'}
               </button>
             ) : null}
          </div>
        )}
        {step === 'done' && (
          <div className="px-6 pb-6">
            <button onClick={onClose}
              className="w-full py-3.5 rounded-full font-black text-sm"
              style={{ background: `linear-gradient(135deg,${Gold},#e8c96a)`, color: '#0a0804' }}>
              Back to SWRV On The Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
