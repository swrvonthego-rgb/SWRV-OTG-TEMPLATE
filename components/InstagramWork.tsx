import React from 'react';
import { Instagram, ArrowUpRight } from 'lucide-react';
import { SOCIAL } from '../site.config';

const HANDLE = 'swrvonthego';

export const InstagramWork: React.FC = () => {
  const profileUrl = SOCIAL.instagram || `https://instagram.com/${HANDLE}`;

  return (
    <section
      id="work"
      style={{ background: '#060608', padding: '90px 0', color: '#ede8dc' }}
    >
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 48, alignItems: 'center' }}>
          <div style={{ flex: '1 1 340px', maxWidth: 520 }}>
            <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.35em', textTransform: 'uppercase', color: 'rgba(200,168,75,0.85)', marginBottom: 16 }}>
              THE WORK
            </p>
            <h2 style={{ fontFamily: 'Georgia, serif', fontStyle: 'italic', fontSize: 'clamp(30px,5vw,46px)', fontWeight: 400, lineHeight: 1.1, margin: '0 0 20px', color: '#fff' }}>
              See it in motion.
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(237,232,220,0.6)', lineHeight: 1.75, margin: '0 0 28px' }}>
              Music videos, brand content, events, and behind-the-scenes — all of it lives on the SWRV On The Go Instagram. Tap through the latest or follow along.
            </p>
            <a
              href={profileUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '14px 28px', background: 'linear-gradient(135deg,#c8a84b,#a07830)', color: '#0d0d0d', borderRadius: 999, fontWeight: 700, fontSize: 13, letterSpacing: '0.08em', textTransform: 'uppercase', textDecoration: 'none' }}
            >
              <Instagram size={18} /> @{HANDLE} <ArrowUpRight size={14} />
            </a>
          </div>

          <div style={{ flex: '1 1 340px', display: 'flex', justifyContent: 'center' }}>
            <iframe
              title="SWRV On The Go on Instagram"
              src={`https://www.instagram.com/${HANDLE}/embed`}
              loading="lazy"
              scrolling="no"
              style={{ width: '100%', maxWidth: 400, height: 520, border: '1px solid rgba(255,255,255,0.1)', borderRadius: 16, background: '#fff' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
