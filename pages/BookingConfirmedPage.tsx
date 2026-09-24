import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

// Landing spot for Stripe Checkout's success_url after a self-serve
// deposit payment (see /api/checkout in src/worker.js). The order record
// and receipt email are both already handled server-side by the time a
// client sees this page — this is purely reassurance, not a step that
// does anything itself.
export const BookingConfirmedPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0804' }}>
      <div className="max-w-md w-full text-center py-16">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255,77,0,0.12)' }}>
          <CheckCircle2 size={32} color="#FF4D00" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">You're booked.</h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          Your deposit went through and a confirmation email is on its way. Stripe will invoice the remaining balance automatically — nothing else for you to do right now.
        </p>
        <Link to="/" className="inline-flex px-8 py-3 rounded-full font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #FF4D00, #ff7433)', color: '#fff' }}>
          Back to SWRV On The Go
        </Link>
      </div>
    </div>
  );
};
