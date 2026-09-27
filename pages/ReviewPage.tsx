import React from 'react';
import { useParams } from 'react-router-dom';
import { ReviewForm } from '../components/ReviewForm';

// /review/<token> — the link sent to a paying client after their project.
export const ReviewPage: React.FC = () => {
  const { token = '' } = useParams();
  return (
    <div className="min-h-screen px-4 py-12" style={{ background: '#0a0804' }}>
      <div className="max-w-xl mx-auto">
        <p className="text-xs font-bold tracking-[0.3em] uppercase text-center" style={{ color: '#c8a84b' }}>SWRV On The Go</p>
        <h1 className="text-3xl md:text-4xl font-black text-white text-center mt-2 mb-8">Share your experience</h1>
        <div className="rounded-2xl p-5" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <ReviewForm token={token} />
        </div>
      </div>
    </div>
  );
};
