import React, { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface PublicReview {
  display_name: string | null;
  rating: number;
  review_text: string;
  service_name: string | null;
  owner_reply: string | null;
  published_at: string;
}

// Reviews from verified paying clients that Swerve has published. Renders
// nothing until there's at least one.
export function ClientReviews() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  useEffect(() => {
    fetch('/api/reviews').then((r) => (r.ok ? r.json() : { reviews: [] })).then((d) => setReviews(d.reviews || [])).catch(() => {});
  }, []);
  if (!reviews.length) return null;

  return (
    <section className="sm-category">
      <div className="sm-cat-header">
        <span className="sm-cat-emoji">⭐</span>
        <div className="sm-cat-text">
          <h2 className="sm-cat-label">Client Reviews</h2>
          <p className="sm-cat-tagline">From verified SWRV clients.</p>
        </div>
      </div>
      <div className="sm-grid">
        {reviews.map((r, i) => (
          <article key={i} className="sm-card">
            <div className="flex gap-0.5 mb-2" aria-label={`${r.rating} out of 5 stars`}>
              {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} fill={n <= r.rating ? '#c8a84b' : 'transparent'} color="#c8a84b" strokeWidth={1.5} />)}
            </div>
            <p className="sm-card-blurb" style={{ whiteSpace: 'pre-wrap' }}>“{r.review_text}”</p>
            <p className="text-xs mt-3" style={{ color: 'rgba(237,232,220,0.6)' }}>
              — {r.display_name || 'Verified client'}{r.service_name ? ` · ${r.service_name}` : ''}
            </p>
            {r.owner_reply && (
              <p className="text-xs mt-3 pl-3" style={{ borderLeft: '2px solid rgba(200,168,75,0.5)', color: 'rgba(237,232,220,0.7)' }}>
                <strong style={{ color: '#e8c96a' }}>Response from Swerve:</strong> {r.owner_reply}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}
