import React, { useEffect, useMemo, useState } from 'react';
import { X, Lock, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isBefore, startOfToday,
} from 'date-fns';
import { buildIntakeQuestions, type Question } from '../../intake.config';
import { IntakeFields, FIELD_STYLE, firstMissing, toIntakePayload, type Answers } from '../../components/IntakeFields';

export interface CheckoutService {
  id: string;
  name: string;
  priceNumeric: number;
  checkoutCategory?: 'event' | 'project';
}

interface Props {
  service: CheckoutService | null;
  onClose: () => void;
}

const Gold = '#c8a84b';
const Orange = '#FF4D00';

type Step = 'date' | 'intake' | 'details';

// Book & Pay: pick a date on the calendar → answer the intake for this
// service (questions come from intake.config.ts, which derives them from
// the service catalog) → pay 50% through a Stripe Checkout Session. The
// balance is invoiced automatically later — see /api/checkout in
// src/worker.js.
export function CheckoutModal({ service, onClose }: Props) {
  const [step, setStep] = useState<Step>('date');
  const [month, setMonth] = useState(startOfMonth(startOfToday()));
  const [date, setDate] = useState<Date | null>(null);
  const [bookedDates, setBookedDates] = useState<string[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const questions = useMemo<Question[]>(
    () => (service ? buildIntakeQuestions(service.id, { forCheckout: true }) : []),
    [service],
  );

  // Fresh state each time a different service is opened.
  useEffect(() => {
    if (!service) return;
    setStep('date'); setMonth(startOfMonth(startOfToday())); setDate(null);
    setAnswers({}); setError(''); setSubmitting(false);
    fetch('/api/booked-dates')
      .then((r) => (r.ok ? r.json() : { dates: [] }))
      .then((d) => setBookedDates(Array.isArray(d.dates) ? d.dates : []))
      .catch(() => {});
  }, [service]);

  if (!service) return null;

  const isEvent = service.checkoutCategory === 'event';
  const deposit = Math.round(service.priceNumeric * 50) / 100;
  const balance = service.priceNumeric - deposit;
  const today = startOfToday();
  const days = eachDayOfInterval({ start: startOfWeek(startOfMonth(month)), end: endOfWeek(endOfMonth(month)) });
  const dateKey = (d: Date) => format(d, 'yyyy-MM-dd');
  // Only event bookings block on a taken date — a website kickoff doesn't
  // collide with an evening gig.
  const isTaken = (d: Date) => isEvent && bookedDates.includes(dateKey(d));

  const goToDetails = () => {
    const missing = firstMissing(questions, answers);
    if (missing) { setError(`Please answer: "${missing.question}"`); return; }
    setError(''); setStep('details');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    if (!date) { setError('Pick a date first.'); setStep('date'); return; }

    setSubmitting(true);
    setError('');
    try {
      const intake = toIntakePayload(questions, answers);
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceId: service.id,
          serviceName: service.name,
          category: service.checkoutCategory || 'project',
          priceCents: Math.round(service.priceNumeric * 100),
          customerName: name.trim(),
          customerEmail: email.trim(),
          customerPhone: phone.trim() || undefined,
          eventDate: isEvent ? dateKey(date) : undefined,
          startDate: isEvent ? undefined : dateKey(date),
          intake,
          origin: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) throw new Error(data?.error || `Checkout failed (${res.status})`);
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again or email info@swrvonthego.pro directly.');
      setSubmitting(false);
    }
  };

  const stepLabels: Record<Step, string> = { date: '1 · Date', intake: '2 · Details', details: '3 · Pay' };

  return (
    <div className="fixed inset-0 z-[9996] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-lg max-h-[92svh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: 'rgba(10,8,4,0.98)', border: '1px solid rgba(200,168,75,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: Gold }}>Book & Pay · {stepLabels[step]}</p>
            <p className="text-sm mt-0.5 text-white font-semibold">{service.name} — ${service.priceNumeric.toLocaleString()}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close">
            <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* ── STEP 1: CALENDAR ── */}
          {step === 'date' && (
            <div>
              <h3 className="text-white font-bold text-lg mb-1">{isEvent ? 'Pick your event date' : 'Pick your preferred start date'}</h3>
              <p className="text-xs mb-5" style={{ color: 'rgba(255,255,255,0.45)' }}>
                {isEvent ? 'Dates already booked are crossed out.' : "We'll kick off your project on or around this date."}
              </p>
              <div className="flex items-center justify-between mb-3">
                <button type="button" onClick={() => setMonth(subMonths(month, 1))} disabled={!isBefore(today, startOfMonth(month))}
                  className="p-2 rounded-full hover:bg-white/10 disabled:opacity-20" aria-label="Previous month">
                  <ChevronLeft size={16} color="#fff" />
                </button>
                <span className="text-white font-semibold text-sm">{format(month, 'MMMM yyyy')}</span>
                <button type="button" onClick={() => setMonth(addMonths(month, 1))} className="p-2 rounded-full hover:bg-white/10" aria-label="Next month">
                  <ChevronRight size={16} color="#fff" />
                </button>
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d, i) => (
                  <span key={i} className="text-[10px] font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>{d}</span>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {days.map((d) => {
                  const inMonth = isSameMonth(d, month);
                  const past = isBefore(d, today);
                  const taken = isTaken(d);
                  const disabled = !inMonth || past || taken;
                  const selected = date && isSameDay(d, date);
                  return (
                    <button key={d.toISOString()} type="button" disabled={disabled} onClick={() => setDate(d)}
                      className="aspect-square rounded-lg text-sm transition-all"
                      style={{
                        background: selected ? Orange : 'transparent',
                        color: selected ? '#fff' : disabled ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.85)',
                        border: selected ? `1px solid ${Orange}` : '1px solid rgba(255,255,255,0.06)',
                        textDecoration: taken && inMonth ? 'line-through' : 'none',
                        cursor: disabled ? 'not-allowed' : 'pointer',
                        visibility: inMonth ? 'visible' : 'hidden',
                      }}>
                      {format(d, 'd')}
                    </button>
                  );
                })}
              </div>
              {date && (
                <p className="text-sm mt-4 text-center text-white">Selected: <strong>{format(date, 'EEEE, MMMM d, yyyy')}</strong></p>
              )}
              <button type="button" disabled={!date} onClick={() => setStep(questions.length ? 'intake' : 'details')}
                className="w-full mt-5 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-40"
                style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff' }}>
                Continue →
              </button>
            </div>
          )}

          {/* ── STEP 2: INTAKE ── */}
          {step === 'intake' && (
            <div className="space-y-6">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                A few quick questions so we show up ready. Anything marked optional can be skipped.
              </p>
              <IntakeFields questions={questions} answers={answers} onChange={setAnswers} />
              {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}
              <div className="flex gap-2">
                <button type="button" onClick={() => { setError(''); setStep('date'); }}
                  className="px-5 py-3.5 rounded-xl text-sm font-semibold" style={{ ...FIELD_STYLE, color: 'rgba(255,255,255,0.7)' }}>
                  Back
                </button>
                <button type="button" onClick={goToDetails}
                  className="flex-1 py-3.5 rounded-xl font-bold text-sm"
                  style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff' }}>
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 3: CONTACT + PAY ── */}
          {step === 'details' && (
            <div>
              <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)' }}>
                {date && (
                  <div className="flex justify-between text-sm mb-1.5">
                    <span style={{ color: 'rgba(255,255,255,0.6)' }}>{isEvent ? 'Event date' : 'Start date'}</span>
                    <span className="text-white font-semibold">{format(date, 'MMM d, yyyy')}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total price</span>
                  <span className="text-white font-semibold">${service.priceNumeric.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-1.5">
                  <span style={{ color: 'rgba(255,255,255,0.6)' }}>Due now (50%)</span>
                  <span className="font-bold" style={{ color: Orange }}>${deposit.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                  <span>Balance (auto-invoiced {isEvent ? 'before your event' : 'when your project is delivered'})</span>
                  <span>${balance.toLocaleString()}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3">
                <input type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
                <input type="email" placeholder="Email (your receipt goes here)" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />
                <input type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none" style={FIELD_STYLE} />

                {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}

                <div className="flex gap-2">
                  <button type="button" onClick={() => { setError(''); setStep(questions.length ? 'intake' : 'date'); }}
                    className="px-5 py-3.5 rounded-xl text-sm font-semibold" style={{ ...FIELD_STYLE, color: 'rgba(255,255,255,0.7)' }}>
                    Back
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 py-3.5 rounded-xl font-bold text-sm transition-all disabled:opacity-60"
                    style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff', boxShadow: '0 8px 24px rgba(255,77,0,0.35)' }}>
                    {submitting ? 'Redirecting to secure checkout…' : `Pay $${deposit.toLocaleString()} Deposit →`}
                  </button>
                </div>
                <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  <Lock size={11} /> Secure checkout by Stripe. Cards, Apple Pay, Google Pay.
                </p>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
