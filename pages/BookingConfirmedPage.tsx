import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2 } from 'lucide-react';

// Landing spot for Stripe Checkout's success_url after a self-serve
// deposit payment (see /api/checkout in src/worker.js). The order record
// and receipt email are both already handled server-side by the time a
// client sees this page — this is purely reassurance, not a step that
// does anything itself.
export const BookingConfirmedPage: React.FC = () => {
  const params = new URLSearchParams(window.location.search);
  const monthly = params.get('plan') === 'monthly';
  // Brand packages continue straight into The Roadmap (see /api/checkout).
  const roadmapNext = params.get('next') === 'roadmap';
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0a0804' }}>
      <div className="max-w-md w-full text-center py-16">
        <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'rgba(255,77,0,0.12)' }}>
          <CheckCircle2 size={32} color="#FF4D00" />
        </div>
        <h1 className="text-3xl font-black text-white mb-3">{monthly ? "You're on board." : "You're booked."}</h1>
        <p className="text-sm leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.55)' }}>
          {monthly
            ? "Your first month is paid and your plan is active. A welcome email is on its way, and we'll reach out within one business day to set up access and plan your content."
            : 'Your deposit went through and a confirmation email is on its way. Stripe will invoice the remaining balance automatically — nothing else for you to do right now.'}
        </p>
        {roadmapNext && (
          <div className="text-left rounded-2xl p-5 mb-8" style={{ background: 'rgba(200,168,75,0.08)', border: '1px solid rgba(200,168,75,0.3)' }}>
            <p className="text-xs font-bold tracking-[0.25em] uppercase mb-2" style={{ color: '#c8a84b' }}>Your next step</p>
            <p className="text-white font-semibold mb-1">Map your long-term vision</p>
            <p className="text-sm leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
              We build your brand from where it's going, not just where it is. Take The Roadmap (about 10 minutes): walk through your vision and answer the questionnaire, and we'll plan everything we create around it.
            </p>
            <Link to="/roadmap" className="inline-flex px-6 py-3 rounded-full font-bold text-sm"
              style={{ background: 'linear-gradient(135deg, #FF4D00, #ff7433)', color: '#fff' }}>
              Start The Roadmap →
            </Link>
          </div>
        )}
        <Link to="/" className={roadmapNext ? 'inline-flex text-sm underline' : 'inline-flex px-8 py-3 rounded-full font-bold text-sm'}
          style={roadmapNext ? { color: 'rgba(255,255,255,0.5)' } : { background: 'linear-gradient(135deg, #FF4D00, #ff7433)', color: '#fff' }}>
          Back to SWRV On The Go
        </Link>
      </div>
    </div>
  );
};
