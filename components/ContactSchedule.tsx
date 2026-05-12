import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, CreditCard, Zap } from 'lucide-react';
import { SCHEDULING, SERVICES } from '../site.config';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, addDays, isBefore, startOfToday, getDay, eachDayOfInterval, addBusinessDays } from 'date-fns';

const TIME_SLOTS = SCHEDULING.timeSlots;
const AVAILABLE_DAYS = SCHEDULING.availableDays;

// Delivery day estimates by service (working days)
const DELIVERY_DAYS: Record<string, number> = {
  'brand-planning': 1, 'logo-design': 10, 'photography': 7,
  'content-system': 5, 'website-presence': 7, 'website-platform': 14,
  'website-ecosystem': 21, 'enterprise-ecosystem': 60, 'fundraising-site': 14,
  'website-maintenance': 3, 'website-management': 3,
  'full-song': 5, 'music-production': 5, 'mixing': 3, 'mastering': 2,
  'jingle': 5, 'voiceover': 2, 'audiobook': 14, 'live-recording': 1,
  'audio-edit-alacarte': 2, 'podcast-launch': 7, 'podcast-editing': 2,
  'music-video': 7, 'video-promo': 2, 'on-site-video': 5, 'live-streaming': 1,
  'short-form-content': 3, 'ai-motion-30': 2, 'ai-motion-60': 3, 'ai-motion-120': 5,
  'video-edit-alacarte': 3, 'pitch-deck': 3, 'keynote-slides': 3,
  'book-format': 7, 'llc-formation': 5, 'vocal-training': 1,
  'recording-booth': 1, 'artist-development': 30, 'consulting-call': 1,
};

type Step = 'service' | 'calendar' | 'details' | 'payment' | 'success';
type PayMethod = 'klarna' | 'card' | 'later';

export const ContactSchedule: React.FC = () => {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [payMethod, setPayMethod] = useState<PayMethod>('klarna');
  const [serviceSearch, setServiceSearch] = useState('');

  useEffect(() => {
    const handler = (e: Event) => {
      const topic = (e as CustomEvent<string>).detail;
      const found = SERVICES.find(s => s.name.toLowerCase().includes('strategy') || s.name.toLowerCase().includes('consult'));
      if (found) setSelectedService(found);
      setStep('service');
    };
    window.addEventListener('swrv:preset-topic', handler);
    return () => window.removeEventListener('swrv:preset-topic', handler);
  }, []);

  const today = startOfToday();
  const monthStart = startOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(endOfMonth(currentMonth));
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd });
  const isAvailable = (d: Date) => !isBefore(d, today) && isSameMonth(d, currentMonth) && AVAILABLE_DAYS.includes(getDay(d));

  const deliveryDate = selectedDate && selectedService
    ? addBusinessDays(selectedDate, DELIVERY_DAYS[selectedService.id] || 7)
    : null;

  const klarnaAmount = selectedService ? (selectedService.priceNumeric / 4).toFixed(2) : '0';

  const filteredServices = SERVICES.filter(s =>
    !serviceSearch || s.name.toLowerCase().includes(serviceSearch.toLowerCase()) || s.category.includes(serviceSearch.toLowerCase())
  );

  // Group filtered services by category
  const grouped = {
    identity: filteredServices.filter(s => s.category === 'identity'),
    execution: filteredServices.filter(s => s.category === 'execution'),
    experience: filteredServices.filter(s => s.category === 'experience'),
  };

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !name || !email) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: selectedService.name,
          servicePrice: selectedService.price,
          kickoffDate: format(selectedDate, 'EEEE, MMMM d, yyyy'),
          kickoffTime: selectedTime,
          deliveryDate: deliveryDate ? format(deliveryDate, 'MMMM d, yyyy') : '',
          name, email, phone, message, payMethod,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStep('success');
      } else {
        setSubmitError('Something went wrong. Try again or email info@swrvonthego.pro');
      }
    } catch {
      setSubmitError('Connection error. Email info@swrvonthego.pro directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_LABELS: Record<Step, string> = {
    service: '1. Service', calendar: '2. Date', details: '3. Details', payment: '4. Payment', success: '✓'
  };
  const STEP_KEYS: Step[] = ['service', 'calendar', 'details', 'payment', 'success'];

  if (step === 'success') {
    return (
      <section id="contact" className="py-24 bg-black text-white">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
            <CheckCircle size={32} color="#0a0804" />
          </div>
          <h2 className="text-3xl font-black mb-3">Booking Submitted 🎉</h2>
          <p className="text-white/60 mb-2">Your email app should be open — send it and you're set.</p>
          <p className="text-white/40 text-sm mb-8">SWRV On The Go will confirm your time within 24 hours.</p>
          {selectedService && deliveryDate && (
            <div className="p-4 rounded-2xl mb-8" style={{ background: 'rgba(200,168,75,0.1)', border: '1px solid rgba(200,168,75,0.2)' }}>
              <p className="text-sm text-white/50 mb-1">Estimated delivery</p>
              <p className="text-lg font-bold" style={{ color: '#c8a84b' }}>{format(deliveryDate, 'MMMM d, yyyy')}</p>
            </div>
          )}
          <button onClick={() => { setStep('service'); setSelectedService(null); setSelectedDate(null); setSelectedTime(''); setName(''); setEmail(''); setPhone(''); setMessage(''); setPayMethod('klarna'); setSubmitting(false); setSubmitError(''); }}
            className="text-white/40 text-sm underline hover:text-white/70">Book another service</button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-black text-white">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.4em] uppercase mb-2" style={{ color: '#c8a84b' }}>BOOK A SESSION</p>
          <h2 className="text-4xl md:text-5xl font-black mb-3">
            {step === 'service' && "What Are We Building?"}
            {step === 'calendar' && "Pick Your Kickoff Date"}
            {step === 'details' && "Tell Us About You"}
            {step === 'payment' && "How Do You Want to Pay?"}
          </h2>
          <p className="text-white/40 text-sm">
            {step === 'service' && "Select a service. Everything will be explained — no surprises."}
            {step === 'calendar' && "Choose the day you want to kick this off."}
            {step === 'details' && "Name, email, and any notes. That's it."}
            {step === 'payment' && "Klarna lets you pay in 4. We get paid in full upfront."}
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-10">
          {STEP_KEYS.slice(0, -1).map((s, i) => (
            <React.Fragment key={s}>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                  style={{
                    background: step === s ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : STEP_KEYS.indexOf(step) > STEP_KEYS.indexOf(s) ? 'rgba(200,168,75,0.3)' : 'rgba(255,255,255,0.08)',
                    color: step === s ? '#0a0804' : STEP_KEYS.indexOf(step) > STEP_KEYS.indexOf(s) ? '#c8a84b' : 'rgba(255,255,255,0.3)',
                  }}>
                  {STEP_KEYS.indexOf(step) > STEP_KEYS.indexOf(s) ? '✓' : i + 1}
                </div>
                <span className="hidden sm:block text-xs font-semibold" style={{ color: step === s ? '#c8a84b' : 'rgba(255,255,255,0.3)' }}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </span>
              </div>
              {i < 3 && <div className="w-6 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />}
            </React.Fragment>
          ))}
        </div>

        {/* ── STEP 1: SERVICE SELECTION ── */}
        {step === 'service' && (
          <div>
            <input
              type="search"
              placeholder="Search services…"
              value={serviceSearch}
              onChange={e => setServiceSearch(e.target.value)}
              className="w-full px-5 py-3 mb-6 text-sm outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 999, color: '#fff' }}
            />
            {Object.entries({ 'Brand Identity': grouped.identity, 'Production & Digital': grouped.execution, 'Coaching & Mentorship': grouped.experience })
              .filter(([, svcs]) => svcs.length > 0)
              .map(([cat, svcs]) => (
                <div key={cat} className="mb-8">
                  <p className="text-xs font-bold tracking-[0.25em] uppercase mb-3" style={{ color: 'rgba(200,168,75,0.6)' }}>{cat}</p>
                  <div className="grid gap-3">
                    {svcs.map(svc => (
                      <button key={svc.id} onClick={() => { setSelectedService(svc); setStep('calendar'); }}
                        className="w-full text-left p-4 rounded-2xl transition-all hover:scale-[1.01]"
                        style={{
                          background: selectedService?.id === svc.id ? 'rgba(200,168,75,0.12)' : 'rgba(255,255,255,0.03)',
                          border: `1px solid ${selectedService?.id === svc.id ? 'rgba(200,168,75,0.5)' : 'rgba(255,255,255,0.08)'}`,
                          boxShadow: selectedService?.id === svc.id ? '0 4px 20px rgba(200,168,75,0.15)' : 'none',
                        }}>
                        <div className="flex justify-between items-start gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-white text-sm mb-1">{svc.name}</p>
                            <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{svc.blurb}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="font-bold text-sm" style={{ color: '#c8a84b' }}>{svc.price}</p>
                            {svc.priceNumeric >= 500 && (
                              <p className="text-xs mt-0.5" style={{ color: 'rgba(200,168,75,0.5)' }}>
                                4× ${(svc.priceNumeric / 4).toFixed(0)} Klarna
                              </p>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
          </div>
        )}

        {/* ── STEP 2: CALENDAR ── */}
        {step === 'calendar' && selectedService && (
          <div>
            {/* Service summary pill */}
            <div className="flex items-center gap-3 p-3 rounded-2xl mb-6" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)' }}>
              <div className="flex-1">
                <p className="font-bold text-sm text-white">{selectedService.name}</p>
                <p className="text-xs" style={{ color: '#c8a84b' }}>{selectedService.price}</p>
              </div>
              <button onClick={() => setStep('service')} className="text-xs underline" style={{ color: 'rgba(255,255,255,0.3)' }}>Change</button>
            </div>

            {/* Month nav */}
            <div className="flex items-center justify-between mb-4">
              <button onClick={() => setCurrentMonth(m => subMonths(m, 1))} className="p-2 hover:text-lion-orange transition-colors"><ChevronLeft size={20} /></button>
              <p className="font-bold text-lg">{format(currentMonth, 'MMMM yyyy')}</p>
              <button onClick={() => setCurrentMonth(m => addMonths(m, 1))} className="p-2 hover:text-lion-orange transition-colors"><ChevronRight size={20} /></button>
            </div>
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
                <div key={d} className="text-center text-xs font-bold py-1" style={{ color: 'rgba(255,255,255,0.3)' }}>{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 mb-6">
              {calendarDays.map(day => {
                const avail = isAvailable(day);
                const sel = selectedDate && isSameDay(day, selectedDate);
                return (
                  <button key={day.toString()} onClick={() => avail && setSelectedDate(day)} disabled={!avail}
                    className="aspect-square rounded-xl text-sm font-semibold transition-all"
                    style={{
                      background: sel ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : avail ? 'rgba(255,255,255,0.05)' : 'transparent',
                      color: sel ? '#0a0804' : avail ? '#fff' : 'rgba(255,255,255,0.15)',
                      border: sel ? 'none' : avail ? '1px solid rgba(255,255,255,0.1)' : 'none',
                      cursor: avail ? 'pointer' : 'default',
                    }}>
                    {isSameMonth(day, currentMonth) ? format(day, 'd') : ''}
                  </button>
                );
              })}
            </div>

            {/* Time slots */}
            {selectedDate && (
              <div className="mb-6">
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>Select a time (CST)</p>
                <div className="grid grid-cols-3 gap-2">
                  {TIME_SLOTS.map((t: string) => (
                    <button key={t} onClick={() => setSelectedTime(t)}
                      className="py-2.5 text-sm font-semibold rounded-xl transition-all"
                      style={{
                        background: selectedTime === t ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : 'rgba(255,255,255,0.05)',
                        color: selectedTime === t ? '#0a0804' : '#fff',
                        border: selectedTime === t ? 'none' : '1px solid rgba(255,255,255,0.1)',
                      }}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery estimate */}
            {selectedDate && deliveryDate && (
              <div className="p-4 rounded-2xl mb-6 flex items-center gap-3" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.15)' }}>
                <Clock size={18} style={{ color: '#c8a84b', flexShrink: 0 }} />
                <div>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Estimated delivery by</p>
                  <p className="font-bold text-sm" style={{ color: '#c8a84b' }}>{format(deliveryDate, 'MMMM d, yyyy')}</p>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('service')} className="flex-1 py-3 rounded-full font-bold text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>
                ← Back
              </button>
              <button onClick={() => setStep('details')} disabled={!selectedDate || !selectedTime}
                className="flex-1 py-3 rounded-full font-bold text-sm transition-all"
                style={{
                  background: selectedDate && selectedTime ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : 'rgba(255,255,255,0.08)',
                  color: selectedDate && selectedTime ? '#0a0804' : 'rgba(255,255,255,0.25)',
                }}>
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: DETAILS ── */}
        {step === 'details' && (
          <div className="flex flex-col gap-4">
            {[
              { label: 'Full Name *', val: name, set: setName, type: 'text', ph: 'Your name' },
              { label: 'Email Address *', val: email, set: setEmail, type: 'email', ph: 'your@email.com' },
              { label: 'Phone (optional)', val: phone, set: setPhone, type: 'tel', ph: '(000) 000-0000' },
            ].map(({ label, val, set, type, ph }) => (
              <div key={label}>
                <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>{label.toUpperCase()}</label>
                <input type={type} value={val} onChange={e => set(e.target.value)} placeholder={ph}
                  className="w-full px-4 py-3 text-sm outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
              </div>
            ))}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>PROJECT DETAILS (optional)</label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={3}
                placeholder="Tell us about your project — vision, references, anything that helps…"
                className="w-full px-4 py-3 text-sm outline-none resize-none"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }} />
            </div>
            <div className="flex gap-3 mt-2">
              <button onClick={() => setStep('calendar')} className="flex-1 py-3 rounded-full font-bold text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>← Back</button>
              <button onClick={() => setStep('payment')} disabled={!name || !email}
                className="flex-1 py-3 rounded-full font-bold text-sm"
                style={{
                  background: name && email ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : 'rgba(255,255,255,0.08)',
                  color: name && email ? '#0a0804' : 'rgba(255,255,255,0.25)',
                }}>Continue →</button>
            </div>
          </div>
        )}

        {/* ── STEP 4: PAYMENT ── */}
        {step === 'payment' && selectedService && (
          <div>
            {/* Order summary */}
            <div className="p-5 rounded-2xl mb-6" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.2)' }}>
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(200,168,75,0.6)' }}>ORDER SUMMARY</p>
              <div className="flex justify-between items-center mb-2">
                <p className="font-bold text-white">{selectedService.name}</p>
                <p className="font-black text-lg" style={{ color: '#c8a84b' }}>{selectedService.price}</p>
              </div>
              {selectedDate && <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Kickoff: {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime} CST</p>}
              {deliveryDate && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Delivery by: {format(deliveryDate, 'MMMM d, yyyy')}</p>}
            </div>

            {/* Payment methods */}
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.4)' }}>CHOOSE HOW TO PAY</p>
            <div className="flex flex-col gap-3 mb-6">
              {/* Klarna */}
              <button onClick={() => setPayMethod('klarna')}
                className="w-full p-4 rounded-2xl text-left transition-all"
                style={{
                  background: payMethod === 'klarna' ? 'rgba(255,184,0,0.1)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${payMethod === 'klarna' ? 'rgba(255,184,0,0.5)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: payMethod === 'klarna' ? '#c8a84b' : 'rgba(255,255,255,0.1)', border: '2px solid', borderColor: payMethod === 'klarna' ? '#c8a84b' : 'rgba(255,255,255,0.2)' }}>
                      {payMethod === 'klarna' && <div className="w-full h-full rounded-full" style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }} />}
                    </div>
                    <div>
                      <p className="font-black text-sm" style={{ color: '#FFB800' }}>Klarna</p>
                      <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Buy now, pay later — 4 interest-free payments</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-black text-lg" style={{ color: '#FFB800' }}>4× ${klarnaAmount}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>We receive full payment</p>
                  </div>
                </div>
                <div className="flex gap-1 mt-2 flex-wrap">
                  {['Pay in 4', 'No interest', 'Instant approval', 'Preferred'].map(tag => (
                    <span key={tag} className="px-2 py-0.5 text-xs rounded-full" style={{ background: 'rgba(255,184,0,0.1)', color: 'rgba(255,184,0,0.8)' }}>{tag}</span>
                  ))}
                </div>
              </button>

              {/* Card */}
              <button onClick={() => setPayMethod('card')}
                className="w-full p-4 rounded-2xl text-left transition-all"
                style={{
                  background: payMethod === 'card' ? 'rgba(200,168,75,0.08)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${payMethod === 'card' ? 'rgba(200,168,75,0.4)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: payMethod === 'card' ? '#c8a84b' : 'rgba(255,255,255,0.1)', border: '2px solid', borderColor: payMethod === 'card' ? '#c8a84b' : 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <CreditCard size={15} style={{ color: payMethod === 'card' ? '#c8a84b' : 'rgba(255,255,255,0.4)' }} />
                      <p className="font-bold text-sm text-white">Credit / Debit Card</p>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Pay in full — Visa, Mastercard, Amex</p>
                  </div>
                  <p className="ml-auto font-bold" style={{ color: '#c8a84b' }}>{selectedService.price}</p>
                </div>
              </button>

              {/* Invoice */}
              <button onClick={() => setPayMethod('later')}
                className="w-full p-4 rounded-2xl text-left transition-all"
                style={{
                  background: payMethod === 'later' ? 'rgba(200,168,75,0.06)' : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${payMethod === 'later' ? 'rgba(200,168,75,0.3)' : 'rgba(255,255,255,0.08)'}`,
                }}>
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ background: payMethod === 'later' ? '#c8a84b' : 'rgba(255,255,255,0.1)', border: '2px solid', borderColor: payMethod === 'later' ? '#c8a84b' : 'rgba(255,255,255,0.2)' }} />
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap size={15} style={{ color: payMethod === 'later' ? '#c8a84b' : 'rgba(255,255,255,0.4)' }} />
                      <p className="font-bold text-sm text-white">Invoice / Pay Later</p>
                    </div>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>Discuss payment terms with SWRV directly</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Klarna note */}
            {payMethod === 'klarna' && (
              <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(255,184,0,0.06)', border: '1px solid rgba(255,184,0,0.15)', color: 'rgba(255,184,0,0.7)' }}>
                ✓ Klarna pays SWRV in full immediately. You pay Klarna in 4 interest-free installments of <strong style={{ color: '#FFB800' }}>${klarnaAmount}</strong> every 2 weeks.
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('details')} className="flex-1 py-3 rounded-full font-bold text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>← Back</button>
              {submitError && (
                <p className="text-red-400 text-xs text-center mb-2">{submitError}</p>
              )}
              <button onClick={handleBook} disabled={submitting}
                className="flex-1 py-3 rounded-full font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', boxShadow: '0 8px 24px rgba(200,168,75,0.4)' }}>
                {submitting ? 'Submitting…' : payMethod === 'klarna' ? `Request Klarna — 4× $${klarnaAmount} →` : payMethod === 'card' ? `Submit Booking — ${selectedService.price} →` : 'Submit Booking →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
