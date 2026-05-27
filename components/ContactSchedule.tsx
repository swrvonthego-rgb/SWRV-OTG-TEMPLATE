import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, ChevronLeft, ChevronRight, CreditCard, Zap, Upload, FileText, X as XIcon, Paperclip, Trash2 } from 'lucide-react';
import { SCHEDULING, SERVICES, PAYMENT_CONFIG, SERVICE_ASSETS, LAUNCH_MODE } from '../site.config';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameDay, isBefore, startOfToday, getDay, eachDayOfInterval, addBusinessDays } from 'date-fns';

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
type PayMethod = 'klarna' | 'afterpay' | 'affirm' | 'zip' | 'sezzle' | 'paylater' | 'paypal' | 'cashapp' | 'venmo' | 'card';


// ── VISION FILE PARSER ────────────────────────────────────────────────
interface ParsedVision {
  roadmapName: string;
  gift: string;
  vision: string;
  services: string;
  total: string;
  rawContent: string;
}

function parseRoadmapFile(text: string): ParsedVision | null {
  const lines = text.split('\n').map(l => l.trim());
  const nameLine = lines[0] || '';
  const nameMatch = nameLine.match(/THE ROADMAP — (.+)/);
  const roadmapName = nameMatch ? nameMatch[1].trim() : '';

  const HEADERS = [
    'YOUR GIFT','YOUR WORK','YOUR PURPOSE',
    'HOW WE GOT HERE — THE EVIDENCE',
    'YOUR HAPPILY EVER AFTER — MAPPED',
    'THE BLUEPRINT — WHAT THIS LIFE REQUIRES',
    'YOUR BRAND IDENTITY','YOUR VISION — WHAT IT COSTS TO BUILD',
    'RECOMMENDED SERVICES — ORDERED BY PHASE',
    'A WORD FOR YOU',
  ];

  const sections: Record<string, string[]> = {};
  let cur = '';
  for (const line of lines) {
    if (HEADERS.includes(line)) { cur = line; sections[cur] = sections[cur] || []; }
    else if (cur && line && !line.startsWith('─')) sections[cur].push(line);
  }

  const get = (key: string) => (sections[key] || []).join(' ').trim();
  const gift    = get('YOUR GIFT');
  const vision  = get('YOUR HAPPILY EVER AFTER — MAPPED');
  const total   = lines.find(l => l.startsWith('TOTAL ESTIMATED INVESTMENT:'))?.replace('TOTAL ESTIMATED INVESTMENT:', '').trim() || '';
  const svcs    = (sections['RECOMMENDED SERVICES — ORDERED BY PHASE'] || []).filter(l => l.startsWith('[')).join('\n');

  if (!gift && !vision) return null;

  const rawContent = [
    roadmapName ? `VISION OWNER: ${roadmapName}` : '',
    gift   ? `GIFT: ${gift}` : '',
    vision ? `VISION SUMMARY: ${vision}` : '',
    svcs   ? `RECOMMENDED SERVICES:\n${svcs}` : '',
    total  ? `TOTAL: ${total}` : '',
  ].filter(Boolean).join('\n\n');

  return { roadmapName, gift, vision, services: svcs, total, rawContent };
}

export const ContactSchedule: React.FC = () => {
  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<typeof SERVICES[0] | null>(null);
  const [cart, setCart] = useState<Array<typeof SERVICES[0]>>([]);
  const cartTotal = cart.reduce((sum, s) => sum + s.priceNumeric, 0);
  const showPricing = !LAUNCH_MODE.active;

  const addToCart = (svc: typeof SERVICES[0]) => {
    setCart(prev => prev.find(s => s.id === svc.id) ? prev : [...prev, svc]);
  };
  const removeFromCart = (id: string) => setCart(prev => prev.filter(s => s.id !== id));

  // Listen for external add-to-cart events from the Marketplace section
  useEffect(() => {
    const handler = (e: Event) => {
      const { serviceId } = (e as CustomEvent<{ serviceId: string }>).detail;
      const svc = SERVICES.find(s => s.id === serviceId);
      if (svc) {
        addToCart(svc);
        document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
      }
    };
    window.addEventListener('swrv:add-to-cart', handler);
    return () => window.removeEventListener('swrv:add-to-cart', handler);
  }, []);
  const checkoutCart = () => {
    if (cart.length === 0) return;
    // Use first item for calendar delivery calculation; full cart in email
    setSelectedService(cart[0]);
    setStep('calendar');
  };
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
  const [parsedVision, setParsedVision] = useState<ParsedVision | null>(null);
  const [projectFiles, setProjectFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState('');
  const referralCode = typeof localStorage !== 'undefined' ? localStorage.getItem('swrv_ref') || '' : '';
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [assetLink, setAssetLink] = useState('');
  const [fileDragging, setFileDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      const topic = (e as CustomEvent<string>).detail;
      const found = SERVICES.find(s => s.name.toLowerCase().includes('strategy') || s.name.toLowerCase().includes('consult'));
      if (found) setSelectedService(found);
      setServiceSearch('');
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

  const handleVisionUpload = (file: File) => {
    setUploadError('');
    if (!file.name.endsWith('.txt')) {
      setUploadError('Please upload a .txt file — the one you downloaded from your Roadmap.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseRoadmapFile(text);
      if (!parsed) {
        setUploadError('Could not read this file. Make sure it is your downloaded Roadmap.');
        return;
      }
      setParsedVision(parsed);
      setMessage(parsed.rawContent);
      // Auto-fill name if empty
      if (!name && parsed.roadmapName) setName(parsed.roadmapName);
    };
    reader.readAsText(file);
  };

  const clearVision = () => {
    setParsedVision(null);
    setMessage('');
    setUploadError('');
  };

  const ALLOWED_TYPES = ['image/jpeg','image/png','image/gif','image/webp','application/pdf','application/zip','application/x-zip-compressed','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','text/plain','audio/mpeg','audio/wav','audio/x-wav','video/mp4','video/quicktime'];
  const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
  const MAX_FILES = 5;

  const handleProjectFileAdd = (files: FileList | null) => {
    if (!files) return;
    setFileError('');
    const toAdd = Array.from(files).slice(0, MAX_FILES - projectFiles.length);
    const invalid = toAdd.filter(f => !ALLOWED_TYPES.includes(f.type));
    const tooBig = toAdd.filter(f => f.size > MAX_FILE_SIZE);
    if (invalid.length) { setFileError(`Unsupported file type. Accepted: images, PDF, Word, audio, video, ZIP.`); return; }
    if (tooBig.length) { setFileError(`Files must be under 15MB each.`); return; }
    if (projectFiles.length + toAdd.length > MAX_FILES) { setFileError(`Max ${MAX_FILES} files per booking.`); return; }
    setProjectFiles(prev => [...prev, ...toAdd]);
  };

  const removeProjectFile = (idx: number) => setProjectFiles(prev => prev.filter((_, i) => i !== idx));

  const handleBook = async () => {
    if (!selectedService || !selectedDate || !selectedTime || !name || !email) return;
    setSubmitting(true);
    setSubmitError('');
    try {
      const res = await fetch('/api/booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          serviceName: cart.length > 1
            ? cart.map(s => s.name).join(' + ')
            : selectedService.name,
          servicePrice: cart.length > 1
            ? '$' + cartTotal.toLocaleString() + ' total'
            : selectedService.price,
          cartItems: cart.map(s => ({ name: s.name, price: s.price })),
          kickoffDate: format(selectedDate, 'EEEE, MMMM d, yyyy'),
          kickoffTime: selectedTime,
          deliveryDate: deliveryDate ? format(deliveryDate, 'MMMM d, yyyy') : '',
          name, email, phone, message, payMethod,
          assetLink,
          uploadedFileNames: uploadedFiles.map(f => `${f.name} (${(f.size / 1024).toFixed(0)}KB)`).join(', '),
        }),
      });
      const data = await res.json();
      if (data.ok) {
        setStep('success');
        // Open payment link in new tab for direct payment methods
        const payLinks: Record<string, string> = {
          paypal:  PAYMENT_CONFIG.paypal.includes('REPLACE') ? '' : PAYMENT_CONFIG.paypal,
          cashapp: PAYMENT_CONFIG.cashapp.includes('REPLACE') ? '' : PAYMENT_CONFIG.cashapp,
          venmo:   PAYMENT_CONFIG.venmo.includes('REPLACE') ? '' : PAYMENT_CONFIG.venmo,
        };
        const link = payLinks[payMethod];
        if (link) {
          setTimeout(() => window.open(link, '_blank', 'noopener'), 800);
        }
      } else {
        setSubmitError('Something went wrong. Try again or email info@swrvonthego.pro');
      }
    } catch {
      setSubmitError('Connection error. Email info@swrvonthego.pro directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const STEP_KEYS: Step[] = ['service', 'calendar', 'details', 'payment', 'success'];

  if (step === 'success') {
    const bnplName = PAYMENT_CONFIG.bnpl.find(b => b.id === payMethod)?.name;
    const isDirectPay = ['paypal','cashapp','venmo'].includes(payMethod);
    const isCard = payMethod === 'card';
    const isBnplPending = PAYMENT_CONFIG.bnpl.find(b => b.id === payMethod)?.pending;
    const shopUrl = 'https://swrv.printful.me/';

    return (
      <section id="contact" className="py-24 bg-black text-white">
        <div className="max-w-xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
            <CheckCircle size={32} color="#0a0804" />
          </div>
          <h2 className="text-3xl font-black mb-3">You're Booked 🎉</h2>
          <p className="text-white/60 mb-2">Confirmation email on the way. SWRV will confirm within 24 hours.</p>

          {/* Payment next step */}
          {isBnplPending && bnplName && (
            <div className="p-4 rounded-2xl mb-4 text-sm" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <p className="font-bold text-white mb-1">{bnplName} payment link incoming</p>
              <p className="text-white/40 text-xs">Check your email — SWRV will send you a secure {bnplName} link. You pay in 4. They pay SWRV in full.</p>
            </div>
          )}
          {isDirectPay && (
            <div className="p-4 rounded-2xl mb-4 text-sm" style={{ background: 'rgba(0,112,186,0.08)', border: '1px solid rgba(0,112,186,0.2)' }}>
              <p className="font-bold text-white mb-1">Complete your payment</p>
              <p className="text-white/40 text-xs mb-3">Opening {payMethod === 'paypal' ? 'PayPal' : payMethod === 'cashapp' ? 'Cash App' : 'Venmo'} now. If it didn't open automatically:</p>
              <a href={payMethod === 'paypal' ? PAYMENT_CONFIG.paypal : payMethod === 'cashapp' ? PAYMENT_CONFIG.cashapp : PAYMENT_CONFIG.venmo}
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold"
                style={{ background: 'rgba(0,112,186,0.2)', color: '#60a5fa', border: '1px solid rgba(0,112,186,0.3)' }}>
                Open {payMethod === 'paypal' ? 'PayPal' : payMethod === 'cashapp' ? 'Cash App' : 'Venmo'} →
              </a>
            </div>
          )}
          {isCard && (
            <div className="p-4 rounded-2xl mb-4 text-sm" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)' }}>
              <p className="text-white/50 text-xs">SWRV will send an invoice to your email with a secure card payment link.</p>
            </div>
          )}

          {/* Delivery date */}
          {selectedService && deliveryDate && (
            <div className="p-4 rounded-2xl mb-6" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.2)' }}>
              <p className="text-xs text-white/40 mb-1">Estimated delivery</p>
              <p className="text-lg font-bold" style={{ color: '#c8a84b' }}>{format(deliveryDate, 'MMMM d, yyyy')}</p>
            </div>
          )}

          {/* ── SHOP UPSELL ── */}
          <div className="rounded-2xl overflow-hidden mb-8" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div className="px-5 pt-4 pb-2">
              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(200,168,75,0.6)' }}>WHILE YOU'RE HERE</p>
              <p className="font-bold text-white text-base mb-1">Visit the SWRV Shop</p>
              <p className="text-xs mb-4" style={{ color: 'rgba(255,255,255,0.35)' }}>Books · Apparel · Gear — built for the revolution.</p>
            </div>
            <a href={shopUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-between px-5 py-3 transition-all"
              style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804' }}>
              <span className="font-black text-sm tracking-wide">SWERVE Get In Gear →</span>
              <span className="text-xs font-semibold opacity-70">swrv.printful.me</span>
            </a>
          </div>

          <button onClick={() => { setStep('service'); setSelectedService(null); setSelectedDate(null); setSelectedTime(''); setCurrentMonth(new Date()); setName(''); setEmail(''); setPhone(''); setMessage(''); setPayMethod('klarna'); setSubmitting(false); setSubmitError(''); setParsedVision(null); setUploadError(''); setIsDragging(false); setProjectFiles([]); setFileError(''); setUploadedFiles([]); setAssetLink(''); setCart([]); }}
            className="text-white/30 text-sm underline hover:text-white/60">Book another service</button>
        </div>
      </section>
    );
  }

  return (
    <section id="contact" className="py-20 bg-black text-white">
      <div className="max-w-3xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs font-bold tracking-[0.4em] uppercase mb-2" style={{ color: '#c8a84b' }}>BOOK YOUR SERVICE</p>
          <h2 className="text-4xl md:text-5xl font-black mb-3">
            {step === 'service' && "Let's Get to Work."}
            {step === 'calendar' && "Pick Your Kickoff Date"}
            {step === 'details' && "Tell Us About You"}
            {step === 'payment' && (showPricing ? "How Do You Want to Pay?" : "Send Your Request")}
          </h2>
          <p className="text-white/40 text-sm">
            {step === 'service' && "Pick your service. Prices are exact — no surprises, no upsells."}
            {step === 'calendar' && "Choose the day you want to kick this off."}
            {step === 'details' && "Name, email, and any notes. That's it."}
            {step === 'payment' && (showPricing ? "BNPL options let you pay in 4. SWRV gets paid in full upfront." : "Submit this request and SWRV will follow up with custom pricing within 24 hours.")}
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
          <div className="flex flex-col gap-0">

            {/* ── CART ── */}
            {cart.length > 0 && (
              <div className="mb-6 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(200,168,75,0.35)', background: 'rgba(200,168,75,0.05)' }}>
                <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
                  <span className="text-xs font-bold tracking-[0.2em] uppercase" style={{ color: '#c8a84b' }}>
                    Your Cart · {cart.length} item{cart.length > 1 ? 's' : ''}
                  </span>
                  {showPricing && <span className="font-black text-sm" style={{ color: '#c8a84b' }}>${cartTotal.toLocaleString()}</span>}
                </div>
                <div className="flex flex-col divide-y" style={{ borderColor: 'rgba(255,255,255,0.05)' }}>
                  {cart.map(item => (
                    <div key={item.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                      <span className="text-sm text-white flex-1 truncate">{item.name}</span>
                      {showPricing && <span className="text-sm font-bold flex-shrink-0" style={{ color: '#c8a84b' }}>{item.price}</span>}
                      <button type="button" onClick={() => removeFromCart(item.id)}
                        className="text-xs flex-shrink-0 hover:text-red-400 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <XIcon size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="px-4 pb-4 pt-3 flex flex-col gap-2">
                  {showPricing && cartTotal >= 500 && (
                    <p className="text-xs text-center pb-1" style={{ color: 'rgba(200,168,75,0.6)' }}>
                      Pay in 4 via Klarna: 4 × ${(cartTotal / 4).toFixed(0)} — SWRV gets paid in full
                    </p>
                  )}
                  <button onClick={checkoutCart}
                    className="w-full py-3.5 rounded-full font-black text-sm"
                    style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', boxShadow: '0 8px 24px rgba(200,168,75,0.4)' }}>
                    {showPricing ? `Checkout — $${cartTotal.toLocaleString()} →` : 'Proceed to Booking →'}
                  </button>
                  <button type="button" onClick={() => setCart([])}
                    className="text-xs text-center py-1 hover:text-white/60 transition-colors"
                    style={{ color: 'rgba(255,255,255,0.25)' }}>
                    Clear cart
                  </button>
                </div>
              </div>
            )}

            {/* ── SERVICE SEARCH ── */}
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Search services…"
                value={serviceSearch}
                onChange={e => setServiceSearch(e.target.value)}
                className="w-full px-4 py-3 text-sm outline-none pl-10"
                style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, color: '#fff' }}
              />
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
              </span>
            </div>

            {/* ── SERVICE LIST ── */}
            <div className="flex flex-col gap-2">
              {SERVICES
                .filter(svc => !serviceSearch || svc.name.toLowerCase().includes(serviceSearch.toLowerCase()) || svc.blurb.toLowerCase().includes(serviceSearch.toLowerCase()))
                .map(svc => {
                  const inCart = cart.some(s => s.id === svc.id);
                  return (
                    <div key={svc.id}
                      className="flex items-start gap-4 p-4 rounded-2xl transition-all"
                      style={{
                        background: inCart ? 'rgba(200,168,75,0.08)' : 'rgba(255,255,255,0.03)',
                        border: `1px solid ${inCart ? 'rgba(200,168,75,0.4)' : 'rgba(255,255,255,0.08)'}`,
                      }}>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm mb-0.5">{svc.name}</p>
                        <p className="text-xs leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.45)' }}>{svc.blurb}</p>
                        <div className="flex flex-wrap gap-2">
                          {(svc as any).deliveryDays && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                              ⏱ {(svc as any).deliveryDays}d
                            </span>
                          )}
                          {(svc as any).revisions > 0 && (
                            <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.4)' }}>
                              ↩ {(svc as any).revisions} rev
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        {showPricing && (
                          <>
                            <p className="font-bold text-sm" style={{ color: '#c8a84b' }}>{svc.price}</p>
                            {svc.priceNumeric >= 500 && (
                              <p className="text-xs" style={{ color: 'rgba(200,168,75,0.5)' }}>
                                4× ${(svc.priceNumeric / 4).toFixed(0)}
                              </p>
                            )}
                          </>
                        )}
                        <button
                          type="button"
                          onClick={() => inCart ? removeFromCart(svc.id) : addToCart(svc)}
                          className="text-xs px-3 py-1.5 rounded-full font-bold transition-all"
                          style={{
                            background: inCart ? 'rgba(200,168,75,0.15)' : 'rgba(255,255,255,0.08)',
                            color: inCart ? '#c8a84b' : 'rgba(255,255,255,0.6)',
                            border: `1px solid ${inCart ? 'rgba(200,168,75,0.4)' : 'rgba(255,255,255,0.12)'}`,
                          }}>
                          {inCart ? '✓ Added' : '+ Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>

            {cart.length === 0 && (
              <p className="text-xs text-center mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
                Add services above, then tap Checkout.
              </p>
            )}
          </div>
        )}

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
          <div className="flex flex-col gap-5">

            {/* ── PROJECT ASSETS ── */}
            {selectedService && SERVICE_ASSETS[selectedService.id] && (() => {
              const req = SERVICE_ASSETS[selectedService.id];
              return (
                <div>
                  <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(200,168,75,0.6)' }}>
                    PROJECT ASSETS
                  </p>
                  <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>{req.title}</p>

                  {/* Required + Optional checklists */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
                      <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,80,80,0.7)' }}>Required</p>
                      {req.required.map((r, i) => (
                        <p key={i} className="text-xs mb-1 flex gap-1.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                          <span style={{ color: 'rgba(200,168,75,0.8)', flexShrink: 0 }}>→</span>{r}
                        </p>
                      ))}
                    </div>
                    {req.optional.length > 0 && (
                      <div className="p-3 rounded-xl" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                        <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.3)' }}>Optional but helpful</p>
                        {req.optional.map((r, i) => (
                          <p key={i} className="text-xs mb-1 flex gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                            <span style={{ flexShrink: 0 }}>+</span>{r}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  {req.note && (
                    <p className="text-xs mb-4 px-3 py-2 rounded-xl" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)', color: 'rgba(200,168,75,0.8)' }}>
                      ⚠ {req.note}
                    </p>
                  )}

                  {/* File Upload */}
                  <label
                    onDragOver={e => { e.preventDefault(); setFileDragging(true); }}
                    onDragLeave={() => setFileDragging(false)}
                    onDrop={e => {
                      e.preventDefault(); setFileDragging(false);
                      const files = Array.from(e.dataTransfer.files).slice(0, 8);
                      setUploadedFiles(prev => [...prev, ...files].slice(0, 8));
                    }}
                    className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl cursor-pointer transition-all mb-3"
                    style={{
                      border: `1.5px dashed ${fileDragging ? 'rgba(200,168,75,0.7)' : 'rgba(255,255,255,0.1)'}`,
                      background: fileDragging ? 'rgba(200,168,75,0.05)' : 'transparent',
                    }}>
                    <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      Drop files here, or <span style={{ color: '#c8a84b' }}>browse</span>
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>{req.formats} · Up to 8 files</p>
                    <input type="file" accept={req.formats} multiple className="sr-only"
                      onChange={e => {
                        const files = Array.from(e.target.files || []).slice(0, 8);
                        setUploadedFiles(prev => [...prev, ...files].slice(0, 8));
                        e.target.value = '';
                      }} />
                  </label>

                  {/* Uploaded file list */}
                  {uploadedFiles.length > 0 && (
                    <div className="mb-3 flex flex-col gap-1.5">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl text-xs"
                          style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.15)' }}>
                          <span style={{ color: '#c8a84b' }}>✓</span>
                          <span className="flex-1 mx-2 truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{f.name}</span>
                          <span style={{ color: 'rgba(255,255,255,0.3)' }}>{(f.size / 1024).toFixed(0)}KB</span>
                          <button type="button" onClick={() => setUploadedFiles(files => files.filter((_, j) => j !== i))}
                            className="ml-2" style={{ color: 'rgba(255,255,255,0.3)' }}>×</button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Large file link */}
                  <div>
                    <label className="block text-xs mb-1.5 uppercase tracking-widest font-bold" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      LARGE FILES — Paste a Google Drive, Dropbox, or WeTransfer link
                    </label>
                    <input type="url" value={assetLink} onChange={e => setAssetLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      className="w-full px-4 py-2.5 text-xs outline-none"
                      style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, color: '#fff' }} />
                    <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      For audio stems, video files, raw images, or anything over 50MB — share via cloud link.
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* ── VISION UPLOAD ── */}
            {!parsedVision ? (
              <div>
                <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(200,168,75,0.6)' }}>
                  HAVE YOUR ROADMAP?
                </p>
                <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  Upload your downloaded Roadmap and your vision auto-populates below. We see exactly what you're building — no guessing, no back-and-forth.
                </p>
                <label
                  onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={e => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) handleVisionUpload(f); }}
                  className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl cursor-pointer transition-all"
                  style={{
                    border: `1.5px dashed ${isDragging ? 'rgba(200,168,75,0.7)' : 'rgba(255,255,255,0.12)'}`,
                    background: isDragging ? 'rgba(200,168,75,0.06)' : 'rgba(255,255,255,0.02)',
                  }}>
                  <Upload size={20} style={{ color: isDragging ? '#c8a84b' : 'rgba(255,255,255,0.25)' }} />
                  <p className="text-xs font-semibold" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Drop your Roadmap here, or <span style={{ color: '#c8a84b' }}>browse</span>
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>.txt file only</p>
                  <input type="file" accept=".txt" className="sr-only"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleVisionUpload(f); e.target.value = ''; }} />
                </label>
                {uploadError && (
                  <p className="text-xs mt-2" style={{ color: '#f87171' }}>{uploadError}</p>
                )}
                <p className="text-xs mt-2 text-center" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  No Roadmap yet? Skip this — just fill in your details below.
                </p>
              </div>
            ) : (
              /* ── VISION LOADED CARD ── */
              <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(200,168,75,0.3)', background: 'rgba(200,168,75,0.05)' }}>
                <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid rgba(200,168,75,0.15)' }}>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
                      <CheckCircle size={12} color="#0a0804" />
                    </div>
                    <span className="text-xs font-bold tracking-[0.15em] uppercase" style={{ color: '#c8a84b' }}>Vision Loaded</span>
                    {parsedVision.roadmapName && (
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>— {parsedVision.roadmapName}</span>
                    )}
                  </div>
                  <button type="button" onClick={clearVision} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                    <XIcon size={14} style={{ color: 'rgba(255,255,255,0.35)' }} />
                  </button>
                </div>
                {parsedVision.gift && (
                  <div className="px-4 pt-3 pb-2">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(200,168,75,0.5)' }}>Your Gift</p>
                    <p className="text-sm font-semibold leading-snug" style={{ color: '#ede8dc' }}>{parsedVision.gift}</p>
                  </div>
                )}
                {parsedVision.vision && (
                  <div className="px-4 pb-3 pt-1">
                    <p className="text-xs font-bold uppercase tracking-[0.15em] mb-1" style={{ color: 'rgba(200,168,75,0.5)' }}>Your Vision</p>
                    <p className="text-xs leading-relaxed line-clamp-3" style={{ color: 'rgba(255,255,255,0.5)' }}>{parsedVision.vision}</p>
                  </div>
                )}
                {parsedVision.total && (
                  <div className="px-4 pb-3 flex items-center gap-2">
                    <FileText size={12} style={{ color: 'rgba(200,168,75,0.5)' }} />
                    <span className="text-xs" style={{ color: 'rgba(200,168,75,0.6)' }}>Roadmap total: {parsedVision.total}</span>
                  </div>
                )}
              </div>
            )}

            {/* ── PROJECT ASSETS — What SWRV needs from you ── */}
            <div>
              {(selectedService as any).assetsNeeded?.length > 0 && (
                <div className="p-4 rounded-2xl mb-3" style={{ background: 'rgba(200,168,75,0.05)', border: '1px solid rgba(200,168,75,0.15)' }}>
                  <p className="text-xs font-bold tracking-[0.15em] uppercase mb-2" style={{ color: 'rgba(200,168,75,0.7)' }}>What We Need From You</p>
                  <ul className="flex flex-col gap-1.5">
                    {((selectedService as any).assetsNeeded as string[]).map((item: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>
                        <span style={{ color: '#c8a84b', flexShrink: 0, marginTop: 1 }}>→</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1.5" style={{ color: 'rgba(255,255,255,0.4)' }}>UPLOAD PROJECT ASSETS</p>
              <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>
                Attach logos, photos, audio files, briefs — anything we need to start. Max 5 files, 15MB each.
              </p>

              {/* Uploaded files list */}
              {projectFiles.length > 0 && (
                <div className="flex flex-col gap-2 mb-3">
                  {projectFiles.map((file, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                      <Paperclip size={14} style={{ color: '#c8a84b', flexShrink: 0 }} />
                      <span className="flex-1 text-xs truncate" style={{ color: 'rgba(255,255,255,0.7)' }}>{file.name}</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{(file.size / 1024).toFixed(0)}KB</span>
                      <button type="button" onClick={() => removeProjectFile(i)} className="p-1 hover:text-red-400 transition-colors" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {projectFiles.length < 5 && (
                <label
                  className="flex items-center justify-center gap-2 py-3 rounded-xl cursor-pointer transition-all text-xs"
                  style={{ border: '1.5px dashed rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', color: 'rgba(255,255,255,0.35)' }}
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleProjectFileAdd(e.dataTransfer.files); }}>
                  <Upload size={14} />
                  <span>Add files <span style={{ color: '#c8a84b' }}>browse</span></span>
                  <input type="file" multiple accept="image/*,.pdf,.doc,.docx,.txt,.zip,.mp3,.wav,.mp4,.mov" className="sr-only"
                    onChange={e => { handleProjectFileAdd(e.target.files); e.target.value = ''; }} />
                </label>
              )}

              {fileError && <p className="text-xs mt-2" style={{ color: '#f87171' }}>{fileError}</p>}
            </div>

            {/* ── FIELDS ── */}
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

            {/* Project details — auto-filled if vision uploaded, otherwise manual */}
            <div>
              <label className="block text-xs font-bold mb-1.5" style={{ color: 'rgba(255,255,255,0.4)', letterSpacing: '0.1em' }}>
                {parsedVision ? 'YOUR VISION (auto-populated from Roadmap)' : 'PROJECT DETAILS (optional)'}
              </label>
              <textarea value={message} onChange={e => setMessage(e.target.value)} rows={parsedVision ? 5 : 3}
                placeholder={parsedVision ? '' : "Tell us about your project — vision, references, anything that helps…"}
                className="w-full px-4 py-3 text-sm outline-none resize-none"
                style={{
                  background: parsedVision ? 'rgba(200,168,75,0.04)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${parsedVision ? 'rgba(200,168,75,0.2)' : 'rgba(255,255,255,0.1)'}`,
                  borderRadius: 12, color: parsedVision ? 'rgba(237,232,220,0.7)' : '#fff',
                  fontSize: parsedVision ? 12 : 14,
                }} />
              {parsedVision && (
                <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.2)' }}>
                  Edit above if needed — this goes directly to the SWRV team.
                </p>
              )}
            </div>

            <div className="flex gap-3 mt-1">
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
              {cart.length > 1 ? (
                <>
                  {cart.map(item => (
                    <div key={item.id} className="flex justify-between items-center mb-1.5">
                      <p className="text-sm text-white">{item.name}</p>
                      <p className="text-sm font-bold" style={{ color: '#c8a84b' }}>{item.price}</p>
                    </div>
                  ))}
                  <div className="flex justify-between items-center mt-3 pt-3" style={{ borderTop: '1px solid rgba(200,168,75,0.2)' }}>
                    <p className="font-bold text-white">Total</p>
                    <p className="font-black text-lg" style={{ color: '#c8a84b' }}>${cartTotal.toLocaleString()}</p>
                  </div>
                </>
              ) : (
                <div className="flex justify-between items-center mb-2">
                  <p className="font-bold text-white">{selectedService.name}</p>
                  <p className="font-black text-lg" style={{ color: '#c8a84b' }}>{selectedService.price}</p>
                </div>
              )}
              {selectedDate && <p className="text-xs mt-2" style={{ color: 'rgba(255,255,255,0.4)' }}>Kickoff: {format(selectedDate, 'MMMM d, yyyy')} at {selectedTime} CST</p>}
              {deliveryDate && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>Delivery by: {format(deliveryDate, 'MMMM d, yyyy')}</p>}
            </div>

            {/* ── BUY NOW PAY LATER — only when pricing is on ── */}
            {showPricing && (
              <>
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>BUY NOW, PAY LATER</p>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>SWRV receives full payment immediately. You repay your provider interest-free.</p>
            <div className="flex flex-col gap-2 mb-5">
              {PAYMENT_CONFIG.bnpl.map((opt) => {
                const sel = payMethod === opt.id;
                return (
                  <button key={opt.id} onClick={() => setPayMethod(opt.id as any)}
                    className="w-full p-4 rounded-2xl text-left transition-all"
                    style={{
                      background: sel ? `${opt.color}12` : 'rgba(255,255,255,0.02)',
                      border: `1.5px solid ${sel ? opt.color + '60' : 'rgba(255,255,255,0.07)'}`,
                      opacity: opt.pending && !sel ? 0.7 : 1,
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: sel ? opt.color : 'rgba(255,255,255,0.12)', border: `2px solid ${sel ? opt.color : 'rgba(255,255,255,0.2)'}` }} />
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-sm" style={{ color: sel ? opt.color : '#fff' }}>{opt.name}</p>
                            {opt.pending && (
                              <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded"
                                style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                                SETUP REQUIRED
                              </span>
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{opt.tagline}</p>
                        </div>
                      </div>
                      <p className="text-sm font-black" style={{ color: sel ? opt.color : 'rgba(255,255,255,0.3)' }}>
                        4× ${((cart.length > 1 ? cartTotal : selectedService.priceNumeric) / 4).toFixed(0)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* ── FULL PAYMENT OPTIONS ── */}
            <p className="text-xs font-bold tracking-[0.2em] uppercase mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>PAY IN FULL</p>
            <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>Pay the full amount now via your preferred platform.</p>
            <div className="flex flex-col gap-2 mb-6">
              {[
                { id: 'paypal',  label: 'PayPal',    sub: 'Instant. Buyer protection included.',    color: '#0070BA', icon: '🅿️' },
                { id: 'cashapp', label: 'Cash App',  sub: 'Simple. Direct. Instant.',               color: '#00D632', icon: '💵' },
                { id: 'venmo',   label: 'Venmo',     sub: 'Quick and familiar.',                    color: '#3396CD', icon: '💳' },
                { id: 'card',    label: 'Credit / Debit Card', sub: 'Visa, Mastercard, Amex — all accepted.', color: '#c8a84b', icon: '💳' },
              ].map(opt => {
                const sel = payMethod === opt.id;
                return (
                  <button key={opt.id} onClick={() => setPayMethod(opt.id as any)}
                    className="w-full p-3.5 rounded-2xl text-left transition-all"
                    style={{
                      background: sel ? `${opt.color}14` : 'rgba(255,255,255,0.02)',
                      border: `1.5px solid ${sel ? opt.color + '55' : 'rgba(255,255,255,0.07)'}`,
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ background: sel ? opt.color : 'rgba(255,255,255,0.12)', border: `2px solid ${sel ? opt.color : 'rgba(255,255,255,0.2)'}` }} />
                        <div>
                          <p className="font-bold text-sm" style={{ color: sel ? opt.color : '#fff' }}>{opt.label}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>{opt.sub}</p>
                        </div>
                      </div>
                      {showPricing && <p className="text-sm font-black" style={{ color: sel ? opt.color : 'rgba(255,255,255,0.3)' }}>{selectedService.price}</p>}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Context note for selected payment */}
            {(PAYMENT_CONFIG.bnpl.find(b => b.id === payMethod)?.pending) && (
              <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                You selected {PAYMENT_CONFIG.bnpl.find(b => b.id === payMethod)?.name}. After booking, SWRV will send you a direct payment link. You pay in 4 installments — SWRV receives the full amount upfront.
              </div>
            )}
            {payMethod === 'paypal' && PAYMENT_CONFIG.paypal && !PAYMENT_CONFIG.paypal.includes('REPLACE') && (
              <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(0,112,186,0.08)', border: '1px solid rgba(0,112,186,0.2)', color: 'rgba(100,180,255,0.8)' }}>
                After submitting, you will be redirected to complete payment via PayPal.
              </div>
            )}
            {(payMethod === 'cashapp' || payMethod === 'venmo') && (
              <div className="p-3 rounded-xl mb-4 text-xs" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
                After submitting, you will be redirected to complete payment.
              </div>
            )}
              </>
            )}

            {!showPricing && (
              <div className="p-5 rounded-2xl mb-6 text-sm" style={{ background: 'rgba(200,168,75,0.06)', border: '1px solid rgba(200,168,75,0.2)', color: 'rgba(255,255,255,0.75)', lineHeight: 1.7 }}>
                <p className="font-bold mb-2" style={{ color: '#c8a84b', letterSpacing: '0.05em' }}>NO PAYMENT REQUIRED — INQUIRY ONLY</p>
                <p>Submit your request and SWRV will follow up within 24 hours with custom pricing and next steps. No card needed today.</p>
              </div>
            )}

            {submitError && (
              <p className="text-red-400 text-xs text-center mb-2 w-full">{submitError}</p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setStep('details')} className="flex-1 py-3 rounded-full font-bold text-sm"
                style={{ border: '1px solid rgba(255,255,255,0.15)', color: 'rgba(255,255,255,0.5)' }}>← Back</button>
              <button onClick={handleBook} disabled={submitting}
                className="flex-1 py-3 rounded-full font-black text-sm transition-all hover:scale-[1.02] disabled:opacity-60 disabled:scale-100"
                style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)', color: '#0a0804', boxShadow: '0 8px 24px rgba(200,168,75,0.4)' }}>
                {submitting ? 'Submitting…' : !showPricing ? 'Send Booking Request →' :
                 ['klarna','afterpay','affirm','zip','sezzle','paylater'].includes(payMethod)
                   ? `Book — Pay Later via ${PAYMENT_CONFIG.bnpl.find(b => b.id === payMethod)?.name || payMethod} →`
                   : payMethod === 'paypal'  ? 'Book + Pay via PayPal →'
                   : payMethod === 'cashapp' ? 'Book + Pay via Cash App →'
                   : payMethod === 'venmo'   ? 'Book + Pay via Venmo →'
                   : `Submit Booking — $${cartTotal > 0 ? cartTotal.toLocaleString() : selectedService.price} →`}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
