import React, { useState, useEffect, useRef } from 'react';
import { X, MessageCircle, Send, ChevronRight } from 'lucide-react';
import { SERVICES } from '../site.config';

// ── TYPES ─────────────────────────────────────────────────────────────
type Role = 'bot' | 'user';
interface Message { role: Role; text: string; quickReplies?: string[]; cta?: { label: string; action: string }; }

// ── INTAKE FLOW ───────────────────────────────────────────────────────
const STEPS = [
  {
    key: 'category',
    bot: "Hey! Welcome to SWRV On The Go 👋\nI'm here to help you find the right creative services — no pressure, just clarity.\n\nWhat are you looking to create or build?",
    quickReplies: ['🎤 Book SWRV Birdsong', '🎵 Music / Audio', '🎬 Music Video', '✨ Brand Identity', '🌐 Website', '🎙️ Podcast', '📋 Something Else'],
  },
  {
    key: 'stage',
    bot: "Got it. What stage are you at right now?",
    quickReplies: ['Just getting the idea together', 'I have a clear vision, ready to move', 'I have pieces — need someone to pull it together'],
  },
  {
    key: 'budget',
    bot: "What investment range are you thinking?",
    quickReplies: ['Under $500', '$500 – $2,000', '$2,000 – $5,000', '$5,000+', 'Not sure yet'],
  },
  {
    key: 'timeline',
    bot: "How soon do you need this done?",
    quickReplies: ['Within 2 weeks', 'Within a month', '1-3 months', 'No rush — get it right'],
  },
];

// Service category → relevant service IDs
const CATEGORY_SERVICES: Record<string, string[]> = {
  '🎵 Music / Audio':   ['music-production', 'mixing', 'mastering', 'live-recording', 'jingle', 'audio-edit-alacarte'],
  '🎬 Music Video':     ['music-video', 'video-promo', 'on-site-video', 'short-form-content', 'ai-motion-30'],
  '✨ Brand Identity':  ['brand-planning', 'logo-design', 'photography', 'content-system'],
  '🌐 Website':         ['website-presence', 'website-platform', 'website-ecosystem', 'enterprise-ecosystem'],
  '🎙️ Podcast':         ['podcast-launch', 'podcast-editing', 'voiceover'],
  '📋 Something Else':  ['brand-planning', 'consulting-call', 'artist-development'],
};

const SERVICE_MAP = new Map(SERVICES.map(s => [s.id, s]));

export const LiveChat: React.FC<{ onOpenBooking?: () => void }> = ({ onOpenBooking }) => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [unread, setUnread] = useState(false);
  // Full conversation history for back-and-forth chat
  const [chatHistory, setChatHistory] = useState<{role:'user'|'assistant'; content:string}[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Show unread indicator after 8s if user hasn't opened
  useEffect(() => {
    const t = setTimeout(() => { if (!open) setUnread(true); }, 25000);
    return () => clearTimeout(t);
  }, [open]);

  // Start chat on open
  useEffect(() => {
    if (open && messages.length === 0) {
      const first = STEPS[0];
      setMessages([{ role: 'bot', text: first.bot, quickReplies: first.quickReplies }]);
    }
    // Reset to fresh state when panel closes so next open starts clean
    if (!open) {
      setTimeout(() => {
        setMessages([]);
        setStepIdx(0);
        setAnswers({});
        setDone(false);
        setChatHistory([]);
        setLoading(false);
      }, 300); // slight delay so close animation finishes first
    }
  }, [open]);

  // Scroll to bottom
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const addBot = (text: string, quickReplies?: string[], cta?: Message['cta']) => {
    setMessages(m => [...m, { role: 'bot', text, quickReplies, cta }]);
  };

  const addUser = (text: string) => {
    setMessages(m => [...m, { role: 'user', text }]);
  };

  const handleReply = async (text: string) => {
    addUser(text);
    const step = STEPS[stepIdx];
    const newAnswers = { ...answers, [step.key]: text };
    setAnswers(newAnswers);
    const next = stepIdx + 1;

    if (next < STEPS.length) {
      setStepIdx(next);
      setTimeout(() => addBot(STEPS[next].bot, STEPS[next].quickReplies), 600);
    } else {
      // All questions answered → get AI recommendation
      setLoading(true);
      setStepIdx(STEPS.length);
      setTimeout(() => generateRec(newAnswers), 400);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');

    // If still in intake flow, use structured reply handler
    if (!done && stepIdx < STEPS.length) {
      handleReply(text);
      return;
    }

    // Free-text back-and-forth chat — full conversation history
    addUser(text);
    setLoading(true);
    const newHistory: {role:'user'|'assistant'; content:string}[] = [
      ...chatHistory,
      { role: 'user', content: text },
    ];
    setChatHistory(newHistory);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newHistory }),
      });
      const data = await res.json();
      const reply = data.reply || "Let me connect you with Swerve at info@swrvonthego.pro";
      setLoading(false);
      addBot(reply, undefined,
        reply.toLowerCase().includes('book') || reply.toLowerCase().includes('session')
          ? { label: 'Book a Session →', action: 'book' }
          : undefined
      );
      setChatHistory([...newHistory, { role: 'assistant', content: reply }]);
    } catch {
      setLoading(false);
      addBot("Having trouble connecting. Email info@swrvonthego.pro and we'll get back to you.");
    }
  };

  const generateRec = async (a: Record<string, string>) => {
    // Get relevant services for category
    const cat = a.category || '📋 Something Else';
    const ids = CATEGORY_SERVICES[cat] || CATEGORY_SERVICES['📋 Something Else'];
    const relevant = ids.map(id => SERVICE_MAP.get(id)).filter(Boolean);

    const serviceList = relevant.map(s => `- ${s!.name} (${s!.price}): ${s!.blurb}`).join('\n');

    const prompt = `You are SWRV On The Go's customer service AI — direct, warm, knowledgeable. 25 years in the music business. Not a salesperson — a creative advisor.

A potential client answered:
- Looking to create: ${a.category}
- Current stage: ${a.stage}
- Budget: ${a.budget}
- Timeline: ${a.timeline}

Relevant services from SWRV On The Go:
${serviceList}

Write a 2-3 paragraph response that:
1. Acknowledges what they're building specifically
2. Recommends 2-3 specific services that fit their stage + budget + timeline (name them exactly)
3. Ends with a clear next step — either book a Strategy Call ($375) or go straight to booking a service

Be conversational. No bullet points. No fluff. Speak like someone who's actually been in the room.`;

    try {
      // Route through /api/chat worker endpoint (uses Groq, keeps API key server-side)
      const chatMessages = [{ role: 'user', content: prompt }];
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatMessages }),
      });
      const data = await res.json();
      const text = data.reply || "Let me connect you with Swerve directly to get you exactly what you need.";
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        addBot(text, undefined, { label: 'Book a Session →', action: 'book' });
        setTimeout(() => addBot("You can also browse all 40+ services, or I can answer more questions. What would be most helpful?",
          ['Show me all services', 'Book a Strategy Call', 'I have a question']), 800);
      }, 300);
    } catch {
      setLoading(false);
      setDone(true);
      addBot("Something went off — let me connect you with Swerve directly.", undefined, { label: 'Book a Session →', action: 'book' });
    }
  };

  const handleCta = (action: string) => {
    if (action === 'book-birdsong') {
      setOpen(false);
      window.dispatchEvent(new Event('swrv:open-zion-booking'));
      return;
    }
    if (action === 'book') {
      setOpen(false);
      if (onOpenBooking) onOpenBooking();
      else document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickReply = (qr: string) => {
    if (qr === '🎤 Book SWRV Birdsong') {
      addUser(qr);
      setTimeout(() => addBot(
        "🎤 Let's book Zion 'SWRV' Birdsong for your event — live performances, weddings, festivals, private parties, and more.\n\nA $50 deposit secures your date, and the rest is negotiated based on your event. Opening the booking page now — pick your date and tell him the vision.",
        undefined,
        { label: 'Open Booking Page →', action: 'book-birdsong' }
      ), 400);
      return;
    }
    if (qr === 'Show me all services') {
      window.dispatchEvent(new Event('swrv:open-services'));
      setOpen(false);
    } else if (qr === 'Book a Strategy Call') {
      window.dispatchEvent(new CustomEvent('swrv:preset-topic', { detail: 'Strategy Call' }));
      setOpen(false);
      document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
    } else if (qr === 'I have a question') {
      addUser(qr);
      setTimeout(() => addBot("Go ahead — ask anything about services, pricing, timelines, or how SWRV works. I'll give you a straight answer."), 400);
    } else {
      handleReply(qr);
    }
  };

  return (
    <>
      {/* ── FLOATING BUTTON ── */}
      <button
        onClick={() => { setOpen(true); setUnread(false); }}
        className="fixed bottom-6 left-6 z-[9990] w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, #c8a84b, #e8c96a)',
          boxShadow: open ? 'none' : '0 8px 32px rgba(200,168,75,0.5), 0 2px 8px rgba(200,168,75,0.3)',
          display: open ? 'none' : 'flex',
        }}
        aria-label="Open live chat"
      >
        <MessageCircle size={26} color="#0a0804" strokeWidth={2} />
        {unread && (
          <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 rounded-full border-2 border-black animate-pulse" />
        )}
      </button>

      {/* ── CHAT PANEL ── */}
      {open && (
        <div
          className="fixed bottom-6 left-6 z-[9991] flex flex-col"
          style={{
            width: 'min(400px, calc(100vw - 24px))',
            height: 'min(580px, calc(100svh - 80px))',
            background: 'rgba(10,8,4,0.97)',
            border: '1px solid rgba(200,168,75,0.25)',
            borderRadius: 20,
            boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 4px 16px rgba(200,168,75,0.1)',
            backdropFilter: 'blur(24px)',
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: 'rgba(200,168,75,0.15)' }}>
            <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0a0804', fontFamily: "'Bebas Neue',sans-serif", letterSpacing: '0.05em' }}>S</span>
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ fontSize: 13, fontWeight: 700, color: '#ede8dc', letterSpacing: '0.05em' }}>SWRV ON THE GO</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                <span style={{ fontSize: 11, color: 'rgba(237,232,220,0.5)' }}>Live Support</span>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/40 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3" style={{ scrollbarWidth: 'thin' }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} flex-col gap-2`}>
                <div
                  className="max-w-[85%] px-4 py-3"
                  style={{
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background: msg.role === 'user'
                      ? 'linear-gradient(135deg,#c8a84b,#e8c96a)'
                      : 'rgba(255,255,255,0.06)',
                    color: msg.role === 'user' ? '#0a0804' : '#ede8dc',
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontWeight: msg.role === 'user' ? 600 : 400,
                    border: msg.role === 'bot' ? '1px solid rgba(255,255,255,0.08)' : 'none',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {msg.text}
                </div>
                {msg.quickReplies && (
                  <div className="flex flex-wrap gap-2">
                    {msg.quickReplies.map((qr, j) => (
                      <button
                        key={j}
                        onClick={() => handleQuickReply(qr)}
                        className="px-3 py-1.5 text-xs font-semibold transition-all hover:scale-105"
                        style={{
                          borderRadius: 999,
                          border: '1px solid rgba(200,168,75,0.4)',
                          background: 'rgba(200,168,75,0.08)',
                          color: '#c8a84b',
                          letterSpacing: '0.03em',
                        }}
                      >
                        {qr}
                      </button>
                    ))}
                  </div>
                )}
                {msg.cta && (
                  <button
                    onClick={() => handleCta(msg.cta!.action)}
                    className="self-start px-5 py-2.5 font-bold text-sm transition-all hover:scale-105"
                    style={{
                      borderRadius: 999,
                      background: 'linear-gradient(135deg,#c8a84b,#e8c96a)',
                      color: '#0a0804',
                      boxShadow: '0 4px 16px rgba(200,168,75,0.35)',
                    }}
                  >
                    {msg.cta.label} <ChevronRight size={14} className="inline -mt-0.5" />
                  </button>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="px-4 py-3 flex gap-1 items-center" style={{ borderRadius: '18px 18px 18px 4px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  {[0,1,2].map(i => (
                    <span key={i} className="w-2 h-2 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="px-3 py-3 border-t flex gap-2 items-center" style={{ borderColor: 'rgba(200,168,75,0.15)' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder={done ? "Ask anything…" : "Type a message or tap an option above…"}
              className="flex-1 px-4 py-2.5 text-sm outline-none"
              style={{
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(200,168,75,0.2)',
                borderRadius: 999,
                color: '#ede8dc',
                fontSize: 13,
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || loading}
              className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all"
              style={{
                background: input.trim() ? 'linear-gradient(135deg,#c8a84b,#e8c96a)' : 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(200,168,75,0.2)',
              }}
            >
              <Send size={15} color={input.trim() ? '#0a0804' : '#666'} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};
