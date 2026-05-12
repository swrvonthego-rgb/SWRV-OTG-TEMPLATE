import './zion.css';
import { ZION_CONFIG as Z } from './config';
import React, { useState, useEffect, useRef } from 'react';

interface ZionProps { isOpen: boolean; onClose: () => void; }
export function Zion({ isOpen, onClose }: ZionProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Scroll reveal refs
  const revealRefs = useRef<(HTMLElement | null)[]>([]);

  // Listen for section navigation events (e.g. from Services page podcast/books cards)
  useEffect(() => {
    const handler = (e: Event) => {
      const section = (e as CustomEvent<string>).detail;
      if (!section) return;
      // Small delay to let the overlay finish opening
      setTimeout(() => {
        const el = document.querySelector(`.zion-page #${section}`);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 300);
    };
    window.addEventListener('swrv:zion-section', handler);
    return () => window.removeEventListener('swrv:zion-section', handler);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        // Use the .zion-page overlay as the scroll root, not the document
        root: document.querySelector('.zion-page'),
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
      }
    );

    // Safety fallback: after 800ms, force-reveal any elements still hidden
    // (covers case where observer doesn't fire due to layout edge cases)
    const fallback = setTimeout(() => {
      revealRefs.current.forEach(el => { if (el) el.classList.add('active'); });
    }, 800);

    revealRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => {
      observer.disconnect();
      clearTimeout(fallback);
    };
  }, []);

  const addToRefs = (el: HTMLElement | null) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSubmit = async () => {
    if (!firstName || !email || !message) {
      showToast('Please fill in name, email, and message.');
      return;
    }
    showToast('Sending...');
    setIsSending(true);
    try {
      const res = await fetch('/api/zion-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          inquiryType: inquiryType || 'General',
          message: message.trim(),
        }),
      });
      if (!res.ok) throw new Error('Server error');
      setIsSending(false);
      showToast('Message sent. Zion will be in touch soon.');
      setFirstName(''); setLastName(''); setEmail(''); setInquiryType(''); setMessage('');
    } catch (err) {
      setIsSending(false);
      showToast('Something went wrong. Try again or email info@swrvonthego.pro directly.');
    }
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    document.body.style.overflow = '';
  };

  const toggleMenu = () => {
    const newState = !isMenuOpen;
    setIsMenuOpen(newState);
    document.body.style.overflow = newState ? 'hidden' : '';
  };

  if (!isOpen) return null;
  return (
    <div className="zion-page" role="dialog" aria-modal="true">
      {/* Fixed-position close button (X) — like Roadmap */}
      <button
        type="button"
        onClick={onClose}
        aria-label="Close artist page"
        style={{
          position:'fixed', top:'18px', right:'18px', zIndex:9999,
          width:'44px', height:'44px', borderRadius:'50%',
          background:'rgba(10,8,4,0.85)', border:'1.5px solid var(--color-gold)',
          color:'var(--color-gold)', display:'flex', alignItems:'center',
          justifyContent:'center', cursor:'pointer', backdropFilter:'blur(8px)',
          fontSize:'22px', fontFamily:'sans-serif', lineHeight:1,
          boxShadow:'0 4px 24px rgba(0,0,0,0.4)',
        }}
      >×</button>
      <>
      {/* NAV */}
      <nav>
        <a href="#hero" className="nav-logo">SWRV</a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#music">Music</a></li>
          <li><a href="#books">Books</a></li>
          <li><a href="#podcast">Podcast</a></li>
          <li><a href="#booking">Book Me</a></li>
          <li><button onClick={onClose} className="nav-back" style={{background:"none",border:"none",cursor:"pointer",font:"inherit",color:"inherit",padding:0}}>{Z.identity.backLabel}</button></li>
        </ul>
        <button 
          className={`mobile-menu-btn ${isMenuOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* MOBILE NAV */}
      <div className={`mobile-nav ${isMenuOpen ? 'active' : ''}`}>
        <a href="#about" onClick={closeMenu}>About</a>
        <a href="#services" onClick={closeMenu}>Services</a>
        <a href="#music" onClick={closeMenu}>Music</a>
        <a href="#books" onClick={closeMenu}>Books</a>
        <a href="#podcast" onClick={closeMenu}>Podcast</a>
        <a href="#booking" onClick={closeMenu}>Book Me</a>
        <button onClick={() => { closeMenu(); onClose(); }} style={{background:"none",border:"none",cursor:"pointer",fontSize:"1.5rem",color:"var(--color-accent)",marginTop:"2rem"}}>{Z.identity.backLabel}</button>
      </div>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-bg"></div>
        <div className="hero-lines"></div>

        {/* Hero portrait */}
        <div className="zion-hero-portrait-fixed">
          <img 
            src={Z.hero.portraitUrl}
            alt={`${Z.identity.firstName} ${Z.identity.lastName}`}
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover', 
              objectPosition: 'center top', 
              filter: 'brightness(0.75) contrast(1.1) saturate(0.9)'
            }}
            referrerPolicy="no-referrer"
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, var(--color-deep) 0%, rgba(10,8,4,0.25) 50%, rgba(10,8,4,0.55) 100%)' }}></div>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, var(--color-deep) 0%, transparent 30%)' }}></div>
        </div>

        <div style={{ position: 'relative', zIndex: 2 }}>
          <p className="hero-eyebrow">{Z.identity.roles}</p>
          <h1 className="hero-name">{Z.identity.firstName} <span>{Z.identity.middle}</span><br/>{Z.identity.lastName}</h1>
          <p className="hero-sub"><span style={{ color: 'var(--color-gold)' }}>S</span>erving <span style={{ color: 'var(--color-gold)' }}>W</span>ith <span style={{ color: 'var(--color-gold)' }}>R</span>ighteous <span style={{ color: 'var(--color-gold)' }}>V</span>ision</p>
          <p className="hero-slogan">{Z.identity.slogan}</p>
          <div className="hero-cta">
            <a href={Z.hero.primaryCta.href} className="btn btn-primary">{Z.hero.primaryCta.label}</a>
            <a href={Z.hero.secondaryCta.href} className="btn btn-outline">{Z.hero.secondaryCta.label}</a>
          </div>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line"></div>
          <span>Scroll</span>
        </div>
      </section>

      {/* PHILOSOPHY STRIP */}
      <div style={{ height: '12px', background: 'repeating-linear-gradient(90deg, #000 0px, #000 16px, #C8A84B 16px, #C8A84B 32px)', backgroundSize: '32px 12px' }}></div>
      <div className="philosophy-strip" style={{ borderTop: '3px solid #000', borderBottom: '3px solid #000' }}>
        <span className="philosophy-text">
          🏁 SWRV · SWERVE ON YOUR ROADBLOCKS · LET LOVE GPS · SERVING WITH RIGHTEOUS VISION · 🏁 SWRV · SWERVE ON YOUR ROADBLOCKS · LET LOVE GPS · SERVING WITH RIGHTEOUS VISION · 🏁 SWRV · SWERVE ON YOUR ROADBLOCKS · LET LOVE GPS · SERVING WITH RIGHTEOUS VISION ·&nbsp;
        </span>
      </div>
      <div style={{ height: '12px', backgroundImage: 'repeating-conic-gradient(#000 0% 25%, #C8A84B 0% 50%)', backgroundSize: '16px 12px' }}></div>

      {/* ABOUT */}
      <section className="about" id="about">
        <div className="about-text reveal" ref={addToRefs}>
          <p className="section-label">Who I Am</p>
          <h2 className="section-title">The Story Behind The Sound</h2>
          <p className="section-body">
            I've been in the music industry since I was 17—writing, producing, performing, and sharing my artistry wherever the road takes me, often on a motorcycle with a travel guitar and speakers on my saddlebags. For the last two years, I've lived in Taipei, Taiwan, and spent creative time in Germany. Before that, I trained privately in ATL and martial arts for 15 years, wrote books and toured in Ohio, built businesses, and made music that needed to be heard. Art won't let me sit still, and I'm not waiting for anyone's validation to do what comes naturally to my heart. I'm building my own lane and sharing everything I know with people ready to do the same. I know there are many like me who want to empty out their gifts on this world before they leave it, without asking permission. My hope is to be a Zion—a city on a hill, full of light and love, helping others shine. If one person is inspired, I did my job. Let's begin this revolution – who's with me?
          </p>
          <a href="#booking" className="btn btn-primary" style={{ display: 'inline-block', marginTop: '1rem' }}>Work With Me</a>
        </div>
        <div className="reveal reveal-delay-1" ref={addToRefs}>
          <div style={{ position: 'relative', marginBottom: '2px' }}>
            <img 
              src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/8A350C02-C84D-41B2-8893-80A79AF3883D_kwild2_flwsqm.png" 
              alt="Zion SWRV Birdsong" 
              style={{ width: '100%', display: 'block', filter: 'brightness(0.9) contrast(1.05)' }} 
              referrerPolicy="no-referrer"
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%', background: 'linear-gradient(to top, var(--color-warm-dark), transparent)' }}></div>
          </div>
          <div className="about-stats">
            <div className="stat-box">
              <div className="stat-number">24+</div>
              <div className="stat-label">Years in Music</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">2</div>
              <div className="stat-label">Books Published</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">∞</div>
              <div className="stat-label">Songs to Release</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">SWRV</div>
              <div className="stat-label">One Movement</div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="services">
        <p className="section-label reveal" ref={addToRefs}>What I Offer</p>
        <h2 className="section-title reveal" ref={addToRefs}>Services</h2>
        <div className="services-grid">
          <div className="service-card reveal" ref={addToRefs}>
            <div className="service-icon">🎤</div>
            <div className="service-name">Live Performance</div>
            <p className="service-desc">Original music, spoken word, and intimate acoustic sets. I bring the full experience — voice, guitar, and presence. Available for bookstores, events, private gatherings, and pop-up performances.</p>
          </div>
          <div className="service-card reveal reveal-delay-1" ref={addToRefs}>
            <div className="service-icon">🎵</div>
            <div className="service-name">Songwriting & Production</div>
            <p className="service-desc">Original song creation, co-writing, beat production, and full audio production. I play by ear and work fast. Gospel, R&B, hip-hop, and everything in between.</p>
          </div>
          <div className="service-card reveal reveal-delay-2" ref={addToRefs}>
            <div className="service-icon">🎙️</div>
            <div className="service-name">Voice Acting</div>
            <p className="service-desc">Character voices, narration, and voiceover work. Trained, distinct, and versatile. Available for games, films, audio books, and commercial projects.</p>
          </div>
          <div className="service-card reveal" ref={addToRefs}>
            <div className="service-icon">🗣️</div>
            <div className="service-name">Voice Training</div>
            <p className="service-desc">Develop your vocal instrument — tone, control, range, and presence. Whether you're a singer, speaker, or performer, I help you find and own the full power of your voice.</p>
          </div>
          <div className="service-card reveal reveal-delay-1" ref={addToRefs}>
            <div className="service-icon">📡</div>
            <div className="service-name">Music & Brand Consulting</div>
            <p className="service-desc">I help independent artists understand the landscape — distribution, sync licensing, DIY production, and how to operate your music like a business. Plus brand identity, positioning, and how to make your movement visible.</p>
          </div>
        </div>
      </section>

      {/* PHOTO EDITORIAL — left photo only, right side transparent to expose hero portrait behind */}
      <div style={{ overflow: 'hidden', background: 'transparent' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', background: 'transparent' }}>
          <div style={{ position: 'relative', overflow: 'hidden' }} className="editorial-photo">
            <img 
              src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/IMG_3064_2_ol70jx_sfkj3v.jpg"
              alt="Zion SWRV Birdsong"
              style={{ 
                width: '100%',
                height: '520px',
                objectFit: 'cover',
                objectPosition: 'center',
                display: 'block',
                filter: 'brightness(0.82) contrast(1.08)'
              }}
              referrerPolicy="no-referrer"
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '1.75rem 2rem', background: 'linear-gradient(to top, rgba(10,8,4,0.92) 0%, transparent 100%)' }}>
              <p style={{ fontSize: '0.63rem', letterSpacing: '0.3em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '0.35rem' }}>In Motion</p>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.5, color: 'rgba(237,232,220,0.7)', fontFamily: "'DM Serif Display', serif", fontStyle: 'italic' }}>On the road. On the stage. In the work.</p>
            </div>
          </div>
          {/* Right column intentionally empty — exposes fixed hero portrait behind */}
        </div>
      </div>

      {/* MUSIC */}
      <section className="services" id="music" style={{ background: 'var(--color-deep)' }}>
        <p className="section-label reveal" ref={addToRefs}>Latest Release</p>
        <h2 className="section-title reveal" ref={addToRefs}>GNC</h2>
        <div className="reveal" ref={addToRefs} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginTop: '2rem' }}>
          <div>
            <div style={{ position: 'relative', width: '100%', paddingBottom: '56.25%', background: '#18141c', borderRadius: '14px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.25)', border: '1px solid rgba(200,168,75,0.15)' }}>
              <iframe src="https://www.youtube.com/embed/9sYrhjYyPKg?rel=0&modestbranding=1" title="GNC — SWRV Birdsong" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowFullScreen style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}></iframe>
            </div>
          </div>
          <div>
            <p className="section-body" style={{ marginBottom: '2rem' }}>The new single "GNC" is out now on all platforms. Stream it, add it to your playlist, and share it with somebody who needs to hear it.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="https://open.spotify.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-icon">
                <span>🎵</span> Listen on Spotify
              </a>
              <a href="https://music.apple.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-icon">
                <span>🎵</span> Listen on Apple Music
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="btn btn-outline btn-icon">
                <span>▶️</span> Watch on YouTube
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKS */}
      <section className="books" id="books">
        <p className="section-label reveal" ref={addToRefs}>The Word</p>
        <h2 className="section-title reveal" ref={addToRefs}>Books by Zion SWRV Birdsong</h2>
        <div className="books-grid">
          <div className="book-card reveal" ref={addToRefs}>
            <div className="book-number">01</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <a href="https://swrv.gumroad.com/l/snlfqh" target="_blank" rel="noreferrer">
                <img 
                  src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/769053C7-044E-4832-BA3C-C39F2A29C408_x0yr1g_xenrqb.jpg" 
                  alt="SWRV In Your Gift eBook" 
                  style={{ width: '100%', display: 'block', border: '1px solid rgba(200,168,75,0.15)', transition: 'opacity 0.3s', boxShadow: '0 4px 32px 0 rgba(10,8,4,0.45) inset, 0 0 0 8px rgba(10,8,4,0.12) inset', background: 'radial-gradient(ellipse at center,rgba(10,8,4,0.18) 60%,transparent 100%)' }} 
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')} 
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')} 
                  referrerPolicy="no-referrer"
                />
              </a>
              <a href="https://swrv.gumroad.com/l/gbxwm" target="_blank" rel="noreferrer">
                <img 
                  src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/45A4D87C-B4CC-45B7-A097-B914D1500CBC_vpszsw_v4lwgf.jpg" 
                  alt="SWRV In Your Gift Audiobook" 
                  style={{ width: '100%', display: 'block', border: '1px solid rgba(200,168,75,0.15)', transition: 'opacity 0.3s', boxShadow: '0 4px 32px 0 rgba(10,8,4,0.45) inset, 0 0 0 8px rgba(10,8,4,0.12) inset', background: 'radial-gradient(ellipse at center,rgba(10,8,4,0.18) 60%,transparent 100%)' }} 
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')} 
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')} 
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>
            <p className="book-tag">Philosophy · Self-Discovery</p>
            <h3 className="book-title">SWRV In Your Gift</h3>
            <p className="book-desc">A guide to identifying, owning, and operating in your God-given gift. Written for creators, travelers, and freedom fighters who know they carry something real but haven't fully stepped into it yet.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: 'auto' }}>
              <a href="https://swrv.gumroad.com/l/snlfqh" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">PDF eBook — $9.99</a>
              <a href="https://swrv.gumroad.com/l/gbxwm" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Audiobook — $14.99</a>
              <a href="https://swrv.gumroad.com/l/xfoyr" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Bundle — $19.99</a>
            </div>
          </div>
          <div className="book-card reveal reveal-delay-1" ref={addToRefs}>
            <div className="book-number">02</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <a href="https://swrv.gumroad.com/l/gopltf" target="_blank" rel="noreferrer">
                <img 
                  src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854243/The_Roadmap_Front_Cover_fqpeds_xzluya.jpg" 
                  alt="The Road Map eBook" 
                  style={{ width: '100%', display: 'block', border: '1px solid rgba(200,168,75,0.15)', transition: 'opacity 0.3s', boxShadow: '0 4px 32px 0 rgba(10,8,4,0.45) inset, 0 0 0 8px rgba(10,8,4,0.12) inset', background: 'radial-gradient(ellipse at center,rgba(10,8,4,0.18) 60%,transparent 100%)' }} 
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')} 
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')} 
                  referrerPolicy="no-referrer"
                />
              </a>
              <a href="https://swrv.gumroad.com/l/sztrkj" target="_blank" rel="noreferrer">
                <img 
                  src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854243/The_Roadmap_Front_Cover_AUDIOBOOK_gwjmil_es50v6.jpg" 
                  alt="The Road Map Audiobook" 
                  style={{ width: '100%', display: 'block', border: '1px solid rgba(200,168,75,0.15)', transition: 'opacity 0.3s', boxShadow: '0 4px 32px 0 rgba(10,8,4,0.45) inset, 0 0 0 8px rgba(10,8,4,0.12) inset', background: 'radial-gradient(ellipse at center,rgba(10,8,4,0.18) 60%,transparent 100%)' }} 
                  onMouseOver={(e) => (e.currentTarget.style.opacity = '0.8')} 
                  onMouseOut={(e) => (e.currentTarget.style.opacity = '1')} 
                  referrerPolicy="no-referrer"
                />
              </a>
            </div>
            <p className="book-tag">Lifestyle · Mindset</p>
            <h3 className="book-title">The Road Map</h3>
            <p className="book-desc">Life is a highway and you're going to hit roadblocks. This book is about staying on the move — swerving obstacles, taking the highway of thinking, and letting love be your GPS through it all.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.6rem', marginTop: 'auto' }}>
              <a href="https://swrv.gumroad.com/l/gopltf" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">Workbook — $14.99</a>
              <a href="https://swrv.gumroad.com/l/sztrkj" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Audiobook — $14.99</a>
              <a href="https://swrv.gumroad.com/l/qegyp" target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Bundle — $19.99</a>
            </div>
          </div>
        </div>
      </section>

      {/* SWRV TALK PODCAST */}
      <section id="podcast" style={{ background: 'var(--color-deep)', padding: '6rem 2.5rem' }}>
        <p className="section-label reveal" ref={addToRefs}>The Conversation</p>
        <h2 className="section-title reveal" ref={addToRefs}>SWRV Talk Podcast</h2>
        <div className="reveal" ref={addToRefs} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '3rem', alignItems: 'center', marginTop: '2.5rem' }}>
          <div>
            <img 
              src="https://res.cloudinary.com/dlxkwdyk7/image/upload/v1775854242/swrv-talk-podcast_oykssi.jpg" 
              alt="SWRV Talk Podcast" 
              style={{ width: '100%', display: 'block', borderRadius: '14px', border: '1px solid rgba(200,168,75,0.15)', boxShadow: '0 8px 40px 0 rgba(10,8,4,0.4)' }} 
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <p className="section-body" style={{ marginBottom: '1.5rem' }}>Wisdom, motivation, and behind-the-scenes stories from the journey. SWRV Talk is where Zion SWRV Birdsong speaks from the heart — raw, real, and uncut. Tune in to the conversation.</p>
            <p style={{ fontSize: '0.72rem', letterSpacing: '0.25em', textTransform: 'uppercase', color: 'var(--color-gold)', marginBottom: '1.25rem' }}>Available On</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
              <a href="https://podcasters.spotify.com/pod/show/swrv-birdsong" target="_blank" rel="noreferrer" className="btn btn-outline btn-icon btn-sm">🎵 Spotify</a>
              <a href="https://podcasts.apple.com/us/podcast/swrv-talk/id1510634517" target="_blank" rel="noreferrer" className="btn btn-outline btn-icon btn-sm">🎧 Apple Podcasts</a>
            </div>
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section className="booking" id="booking">
        <div className="booking-inner">
          <div className="reveal" ref={addToRefs}>
            <p className="section-label">Join The Movement</p>
            <h2 className="section-title">Let's Create Together</h2>
            <p className="section-body">I'm not just performing—I'm leading a cultural shift. Whether you want to amplify the message through live experience, collaborate on something revolutionary, or tap into a new perspective, let's connect and make an impact.</p>
            <div className="booking-note">
              <strong>Performances & Experiences</strong> — Live music that moves people. Bookstore takeovers, community events, and cultural spaces where we can shift the narrative together.<br/><br/>
              <strong>Creative Collaborations</strong> — Songwriting, production, features, or visionary projects. I collaborate with artists and creators who are ready to push boundaries.<br/><br/>
              <strong>Strategic Consulting</strong> — Artist development, brand consulting, and cultural strategy. If you're building something meaningful, let's talk.
            </div>
          </div>
          <div className="reveal reveal-delay-1" ref={addToRefs}>
            <div className="booking-form" id="bookingForm">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Your name" />
                </div>
                <div className="form-group">
                  <label>Last Name</label>
                  <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Last name" />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="your@email.com" />
              </div>
              <div className="form-group">
                <label>Inquiry Type</label>
                <select value={inquiryType} onChange={(e) => setInquiryType(e.target.value)}>
                  <option value="">Select one...</option>
                  <option>Live Performance / Booking</option>
                  <option>Songwriting / Production</option>
                  <option>Voice Acting</option>
                  <option>Music Consulting</option>
                  <option>Book Signing Event</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Tell Me About It</label>
                <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="What are you looking for? Dates, venue, vision — share what you've got."></textarea>
              </div>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={isSending} style={{ alignSelf: 'flex-start', opacity: isSending ? 0.6 : 1, cursor: isSending ? 'not-allowed' : 'pointer' }}>{isSending ? 'Sending…' : 'Send It →'}</button>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-brand">
          Zion SWRV Birdsong
          <small>SWRV — Serving With Righteous Vision</small>
        </div>
        <ul className="footer-links">
          <li><a href="#about">About</a></li>
          <li><a href="#services">Services</a></li>
          <li><a href="#books">Books</a></li>
          <li><a href="#podcast">Podcast</a></li>
          <li><a href="#booking">Book Me</a></li>
        </ul>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <a href="https://instagram.com/swrvbirdsong" target="_blank" rel="noreferrer" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.3s' }} onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-gold)')} onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            @SWRVBIRDSONG
          </a>
          <a href="https://facebook.com/swrvbirdsong" target="_blank" rel="noreferrer" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.3s' }} onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-gold)')} onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            @SWRVBIRDSONG
          </a>
          <a href="https://www.youtube.com/@swrvbirdsong" target="_blank" rel="noreferrer" style={{ color: 'var(--color-muted)', textDecoration: 'none', fontSize: '0.78rem', letterSpacing: '0.08em', display: 'flex', alignItems: 'center', gap: '0.4rem', transition: 'color 0.3s' }} onMouseOver={(e) => (e.currentTarget.style.color = 'var(--color-gold)')} onMouseOut={(e) => (e.currentTarget.style.color = 'var(--color-muted)')}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a2.997 2.997 0 0 0-2.108-2.12C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.39.566A2.997 2.997 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a2.997 2.997 0 0 0 2.108 2.12C4.495 20.5 12 20.5 12 20.5s7.505 0 9.39-.566a2.997 2.997 0 0 0 2.108-2.12C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z"/></svg>
            @SWRVBIRDSONG
          </a>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()} Zion SWRV Birdsong · swrvonthego.pro</p>
      </footer>

      {/* SWRV OTG ECOSYSTEM LINK BAR */}
      <div className="ecosystem-bar">
        <span>Part of the</span>
        <button onClick={onClose} style={{background:"none",border:"none",cursor:"pointer",font:"inherit",color:"inherit",padding:0,textDecoration:"underline"}}>SWRV ON THE GO ECOSYSTEM →</button>
        <span>Full-service branding · Built around you</span>
      </div>

      {/* TOAST */}
      <div className={`toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
    </>
    </div>
    );
  }
