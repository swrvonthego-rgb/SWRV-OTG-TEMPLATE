import React, { useState } from 'react';
import { X, Lock } from 'lucide-react';

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

// Self-serve checkout: pick a fixed-price service, pay 50% through a
// dynamically-created Stripe Checkout Session, and the balance is invoiced
// automatically later (see /api/checkout in src/worker.js for the full
// deposit/balance mechanics — nothing here decides that, it just collects
// the details Stripe and the order record need).
export function CheckoutModal({ service, onClose }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!service) return null;

  const isEvent = service.checkoutCategory === 'event';
  const deposit = Math.round(service.priceNumeric * 50) / 100;
  const balance = service.priceNumeric - deposit;
  const todayStr = new Date().toISOString().split('T')[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) { setError('Name and email are required.'); return; }
    if (isEvent && !eventDate) { setError('Pick your event date.'); return; }

    setSubmitting(true);
    setError('');
    try {
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
          eventDate: isEvent ? eventDate : undefined,
          origin: window.location.origin,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.checkoutUrl) {
        throw new Error(data?.error || `Checkout failed (${res.status})`);
      }
      window.location.href = data.checkoutUrl;
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Try again or email info@swrvonthego.pro directly.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9996] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-md rounded-3xl overflow-hidden"
        style={{ background: 'rgba(10,8,4,0.98)', border: '1px solid rgba(200,168,75,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'rgba(255,255,255,0.08)' }}>
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: Gold }}>Book & Pay</p>
            <p className="text-sm mt-0.5 text-white font-semibold">{service.name}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Close">
            <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        <div className="px-6 py-6">
          {/* Price breakdown — the split is the whole point, so it's shown before anyone types anything */}
          <div className="rounded-2xl p-4 mb-6" style={{ background: 'rgba(255,77,0,0.08)', border: '1px solid rgba(255,77,0,0.25)' }}>
            <div className="flex justify-between text-sm mb-1.5">
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Total price</span>
              <span className="text-white font-semibold">${service.priceNumeric.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mb-1.5">
              <span style={{ color: 'rgba(255,255,255,0.6)' }}>Due now (50%)</span>
              <span className="font-bold" style={{ color: Orange }}>${deposit.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs pt-1.5" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              <span>Balance (auto-invoiced {isEvent ? 'before your event' : 'on delivery'})</span>
              <span>${balance.toLocaleString()}</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <input
              type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            <input
              type="tel" placeholder="Phone (optional)" value={phone} onChange={(e) => setPhone(e.target.value)}
              className="w-full px-4 py-3 rounded-xl text-sm text-white placeholder-white/30 focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}
            />
            {isEvent && (
              <div>
                <label className="text-xs mb-1 block" style={{ color: 'rgba(255,255,255,0.5)' }}>Event date</label>
                <input
                  type="date" min={todayStr} value={eventDate} onChange={(e) => setEventDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white focus:outline-none"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', colorScheme: 'dark' }}
                />
              </div>
            )}

            {error && <p className="text-sm" style={{ color: '#e5484d' }}>{error}</p>}

            <button
              type="submit" disabled={submitting}
              className="w-full py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60"
              style={{ background: `linear-gradient(135deg, ${Orange}, #ff7433)`, color: '#fff', boxShadow: `0 8px 24px rgba(255,77,0,0.35)` }}
            >
              {submitting ? 'Redirecting to secure checkout…' : `Pay $${deposit.toLocaleString()} Deposit →`}
            </button>
            <p className="text-xs text-center flex items-center justify-center gap-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              <Lock size={11} /> Secure checkout by Stripe. Cards, Apple Pay, Google Pay.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
