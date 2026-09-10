import React, { useState, useEffect, useRef } from 'react';
import { X, ArrowRight, ChevronLeft, CheckCircle, FileText, Loader } from 'lucide-react';

// ── TYPES ─────────────────────────────────────────────────────────────
type AnswerValue = string | string[];
interface Question {
  id: string;
  question: string;
  sub?: string;
  type: 'single' | 'multi' | 'text' | 'textarea';
  options?: string[];
  optional?: boolean;
  placeholder?: string;
}

// ── UNIVERSAL BUDGET QUESTION ─────────────────────────────────────────
// Injected into every path so no brief ever reaches SWRV without a
// budget — the #1 thing customers leave out. Required (not optional).
const BUDGET_Q: Question = {
  id: 'budget',
  question: "What\'s your budget for this?",
  type: 'single',
  options: [
    'Under $300',
    '$300 – $750',
    '$750 – $2,000',
    '$2,000 – $5,000',
    '$5,000+',
    "Not sure — show me options",
  ],
};

// ── INTAKE PATHS BY SERVICE GROUP ─────────────────────────────────────
const PATHS: Record<string, Question[]> = {
  website: [
    { id: 'goal', question: "What does this website need to do?", sub: "Select everything that applies.", type: 'multi',
      options: ['Showcase my portfolio / work', 'Book clients / sell services', 'Sell physical or digital products', 'Tell my brand story', 'Raise money / crowdfund', 'Build a community or membership', 'Replace or upgrade an existing site'] },
    { id: 'branding', question: "Do you have existing branding?", type: 'single',
      options: ['Yes — logo, colors, fonts, the works', 'Partial — I have a logo but not much else', 'Starting completely from scratch', 'Not sure — let\'s figure it out together'] },
    { id: 'content', question: "What content do you have ready to go?", sub: "Be honest — we'll plan around where you are.", type: 'multi',
      options: ['Written copy / text for the pages', 'Professional photos', 'Videos', 'Product images', 'Nothing yet — I need help creating it', 'I have some things and need to fill gaps'] },
    { id: 'pages', question: "How many pages are we thinking?", type: 'single',
      options: ['1–3 pages (focused, tight, powerful)', '4–7 pages (standard professional site)', '8–15 pages (full content site)', '15+ pages (large scale / e-commerce)', 'Not sure yet — help me decide'] },
    { id: 'features', question: "Any special functionality needed?", sub: "Select all that apply.", type: 'multi',
      options: ['Online booking / scheduling', 'E-commerce / online store', 'Blog or content hub', 'Email list / lead capture', 'Client portal or members area', 'Donation or crowdfunding', 'Live chat or support', 'Video or audio player', 'Custom contact forms', 'Multi-language', 'Nothing beyond the basics'] },
    { id: 'domain', question: "What's your domain and hosting situation?", type: 'single',
      options: ['I have a domain and hosting already', 'I have a domain but no hosting', 'I need both — starting fresh', 'I have an existing site to replace', 'Not sure what I have'] },
    { id: 'timeline', question: "When do you need this live?", type: 'single',
      options: ['ASAP — within 2 weeks', 'About a month', '2–3 months', 'No hard deadline — get it right'] },
    { id: 'references', question: "Any websites you love that we should reference?", sub: "Paste URLs, describe vibes, or say what you like about them.", type: 'textarea', optional: true, placeholder: "e.g. apple.com — love the clean layout. Also like the dark feel of studio-era artists sites..." },
    { id: 'notes', question: "Anything else SWRV needs to know before we start?", type: 'textarea', optional: true, placeholder: "Special requirements, hard constraints, things that went wrong with past sites, budget range, goals you haven't mentioned yet..." },
  ],

  video: [
    { id: 'type', question: "What kind of video are we creating?", type: 'single',
      options: ['Music video (full song)', 'Promo / brand video (under 1 min)', 'Live event coverage', 'Short-form content (Reels / TikTok)', 'AI motion graphics', 'Podcast / interview visuals', 'Something else'] },
    { id: 'length', question: "How long is the video?", type: 'single',
      options: ['Under 60 seconds', '1–3 minutes', '3–5 minutes', '5+ minutes', 'Not sure yet'] },
    { id: 'audio', question: "Is the song or audio finalized?", type: 'single',
      options: ['Yes — mixed and mastered, ready to go', 'Mixed but not mastered yet', 'Still in production — need that too', 'No audio yet — need to start there', 'Instrumental / no vocals'] },
    { id: 'concept', question: "Do you have a creative concept or treatment?", type: 'single',
      options: ['Yes — detailed concept, mood board, references', 'General idea — need help developing it', 'Completely open — give me your creative direction', 'I know the vibe but not the story'] },
    { id: 'location', question: "Where are we filming?", type: 'multi',
      options: ['My location (I\'ll provide details)', 'Studio / controlled environment', 'Outdoor / natural settings', 'Multiple locations', 'Remote / digital / green screen', 'Not sure yet'] },
    { id: 'cast', question: "Who\'s in front of the camera?", type: 'multi',
      options: ['Just me', 'Me and my group / band', 'We need to cast additional talent', 'No people — product or concept-based', 'To be determined'] },
    { id: 'references', question: "Reference videos that capture what you\'re going for?", type: 'textarea', optional: true, placeholder: "YouTube links, artists, directors, or describe the visual aesthetic..." },
    { id: 'timeline', question: "When does this need to be done?", type: 'single',
      options: ['Within 2 weeks', 'About a month', '2–3 months', 'No hard deadline'] },
    { id: 'notes', question: "Anything else — hard constraints, budget range, specific requirements?", type: 'textarea', optional: true, placeholder: "Anything SWRV needs to know upfront..." },
  ],

  music: [
    { id: 'type', question: "What are we creating?", type: 'single',
      options: ['Original song (full production)', 'Beat / instrumental only', 'Jingle or brand audio', 'Voiceover or narration', 'Audiobook recording', 'Podcast production', 'Mixing / mastering only (I have recordings)', 'Live session recording'] },
    { id: 'genre', question: "What\'s the genre and vibe?", type: 'textarea', placeholder: "Hip-hop, R&B, gospel, pop, cinematic... and describe the feeling you\'re going for. Reference artists if helpful.", sub: "Be specific — this shapes everything." },
    { id: 'lyrics', question: "Where are the lyrics?", type: 'single',
      options: ['Complete and ready to record', 'Work in progress — mostly done', 'Just the hook / concept — need to develop it', 'Need help writing them too', 'No lyrics — instrumental project'] },
    { id: 'performers', question: "Who\'s performing?", type: 'multi',
      options: ['Me (solo artist)', 'Group / ensemble', 'Looking for features or collaborators', 'Instrumental — no performers', 'Still figuring out'] },
    { id: 'purpose', question: "What\'s this music for?", type: 'multi',
      options: ['Official release / distribution', 'Content / social media', 'Commercial or brand use', 'Film / TV / sync', 'Personal or private project', 'Showcase / demo'] },
    { id: 'references', question: "Reference tracks that capture the sound you\'re chasing?", type: 'textarea', optional: true, placeholder: "Song titles, artists, or Spotify links. Tell us what specifically you like about them." },
    { id: 'timeline', question: "Timeline?", type: 'single',
      options: ['Within 2 weeks', 'About a month', '1–3 months', 'No hard deadline'] },
    { id: 'notes', question: "Anything else SWRV should know?", type: 'textarea', optional: true, placeholder: "Budget range, session details, technical requirements, past recording experience..." },
  ],

  brand: [
    { id: 'stage', question: "Where are you in your brand journey?", type: 'single',
      options: ['Brand new — starting from zero', 'Have a name, need everything else', 'Existing brand that needs a refresh', 'Rebrand — changing direction entirely', 'Just need specific pieces (logo, etc.)'] },
    { id: 'business', question: "Describe your business or project in one sentence.", type: 'textarea', placeholder: "What do you do, who do you do it for, and what makes you different?" },
    { id: 'audience', question: "Who is your audience?", sub: "The more specific, the better.", type: 'textarea', placeholder: "e.g. Independent artists between 18-35 who are building their brand but don\'t have label support..." },
    { id: 'vibe', question: "What\'s the vibe?", sub: "Select everything that resonates.", type: 'multi',
      options: ['Premium / Luxury', 'Bold / Disruptive', 'Clean / Minimal', 'Creative / Expressive', 'Community / Approachable', 'Professional / Corporate', 'Gritty / Authentic', 'Spiritual / Purposeful'] },
    { id: 'deliverables', question: "What specifically do you need?", type: 'multi',
      options: ['Logo (primary mark)', 'Color palette', 'Typography selection', 'Brand guide / style document', 'Business cards / print materials', 'Social media templates', 'Brand photography', 'Content strategy', 'All of the above — full system'] },
    { id: 'feeling', question: "What do you want people to FEEL when they encounter your brand?", type: 'textarea', placeholder: "Describe the emotional response. Inspired? Trusted? Impressed? Like they found their people?" },
    { id: 'references', question: "Brands you love or want to reference?", type: 'textarea', optional: true, placeholder: "Could be direct competitors, brands in different industries, or just aesthetic references..." },
    { id: 'notes', question: "Anything else?", type: 'textarea', optional: true, placeholder: "Timeline, budget range, things to avoid, past branding attempts..." },
  ],

  business: [
    { id: 'type', question: "What are we building?", type: 'single',
      options: ['Pitch deck (investors / partners)', 'Business plan document', 'Keynote / speaking presentation', 'Book (format + launch)', 'LLC formation + banking setup', 'Multiple — full launch package'] },
    { id: 'purpose', question: "Who is this for and what do you need it to do?", type: 'textarea', placeholder: "e.g. Investor pitch for a Series A raise. Audience is VC firms in the music tech space. Goal is to get meetings." },
    { id: 'existing', question: "What do you have already?", type: 'multi',
      options: ['Detailed notes or an outline', 'A rough draft', 'Financial projections', 'Visual assets / branding', 'Market research', 'Previous version to update', 'Starting from scratch'] },
    { id: 'scope', question: "Do you need strategy + writing, or design only?", type: 'single',
      options: ['Strategy + writing + design (full service)', 'I have the content — just need design', 'I have a design — just need content/strategy', 'Not sure — let\'s assess together'] },
    { id: 'timeline', question: "When do you need this?", type: 'single',
      options: ['Within a week (urgent)', 'Within 2 weeks', 'About a month', 'No hard deadline'] },
    { id: 'notes', question: "Context SWRV needs to know — audience, stakes, any hard constraints?", type: 'textarea', optional: true, placeholder: "The more context, the better the output..." },
  ],

  podcast: [
    { id: 'concept', question: "What\'s the show about?", type: 'textarea', placeholder: "Name, concept, and who it\'s for. What gap does it fill? What do listeners walk away with?" },
    { id: 'format', question: "What\'s the format?", type: 'multi',
      options: ['Solo (just you)', 'Co-hosted', 'Interview / guests', 'Panel discussions', 'Narrative / storytelling', 'Educational / how-to', 'Mix of formats'] },
    { id: 'frequency', question: "How often will you publish?", type: 'single',
      options: ['Daily', 'Multiple times a week', 'Weekly', 'Bi-weekly', 'Monthly', 'Seasonal / limited series', 'Not sure yet'] },
    { id: 'equipment', question: "What recording setup do you have?", type: 'single',
      options: ['Professional setup — good to go', 'Basic mic — decent quality', 'Just my phone / laptop mic', 'Nothing yet — need guidance on setup', 'Remote guests on different equipment'] },
    { id: 'distribution', question: "Where do you want the show?", type: 'multi',
      options: ['Spotify', 'Apple Podcasts', 'YouTube', 'Google Podcasts', 'Amazon Music', 'Website / RSS', 'All major platforms'] },
    { id: 'existing', question: "Have you recorded any episodes yet?", type: 'single',
      options: ['Yes — ready to edit and publish', 'Recorded a pilot episode', 'Not yet — planning stage', 'I want to record the first episode with SWRV'] },
    { id: 'timeline', question: "When do you want to launch?", type: 'single',
      options: ['ASAP', 'Within a month', '2–3 months', 'No rush — let\'s build it right'] },
    { id: 'notes', question: "Anything else about the show or what you need from SWRV?", type: 'textarea', optional: true, placeholder: "Budget, sponsors, video component, social media strategy..." },
  ],

  other: [
    { id: 'describe', question: "Tell us what you\'re working on.", type: 'textarea', placeholder: "Describe your project, what you need, and what success looks like. The more detail the better — SWRV has seen a lot, nothing surprises us." },
    { id: 'urgency', question: "How urgent is this?", type: 'single',
      options: ['Urgent — need to move now', 'Moderate — within a month', 'Planning ahead — no rush', 'Exploring options — not decided yet'] },
    { id: 'budget', question: "What\'s the budget range?", type: 'single',
      options: ['Under $500', '$500 – $1,500', '$1,500 – $5,000', '$5,000 – $10,000', '$10,000+', 'Not established yet'] },
    { id: 'notes', question: "Anything else — constraints, past experiences, goals?", type: 'textarea', optional: true, placeholder: "Context that helps SWRV understand the full picture..." },
  ],
};

const SERVICE_GROUP_MAP: Record<string, keyof typeof PATHS> = {
  'website-presence': 'website', 'website-platform': 'website', 'website-ecosystem': 'website',
  'enterprise-ecosystem': 'website', 'fundraising-site': 'website', 'website-management': 'website',
  'website-maintenance': 'website',
  'music-production': 'music', 'mixing': 'music', 'mastering': 'music', 'jingle': 'music',
  'voiceover': 'music', 'audiobook': 'music', 'live-recording': 'music', 'audio-edit-alacarte': 'music',
  'music-video': 'video', 'video-promo': 'video', 'on-site-video': 'video', 'live-streaming': 'video',
  'short-form-content': 'video', 'ai-motion-30': 'video', 'ai-motion-60': 'video',
  'ai-motion-120': 'video', 'video-edit-alacarte': 'video',
  'brand-planning': 'brand', 'logo-design': 'brand', 'photography': 'brand', 'content-system': 'brand',
  'pitch-deck': 'business', 'keynote-slides': 'business', 'book-format': 'business', 'llc-formation': 'business',
  'podcast-launch': 'podcast', 'podcast-editing': 'podcast',
  'vocal-training': 'other', 'recording-booth': 'other', 'artist-development': 'other', 'consulting-call': 'other',
};

const PATH_LABELS: Record<string, string> = {
  website: 'Website Project', video: 'Video Production', music: 'Music & Audio',
  brand: 'Brand Identity', business: 'Business Documents', podcast: 'Podcast', other: 'Project',
};

// ── COMPONENT ─────────────────────────────────────────────────────────
interface Props { isOpen: boolean; onClose: () => void; serviceId?: string; serviceName?: string; }

export const ProjectIntake: React.FC<Props> = ({ isOpen, onClose, serviceId, serviceName }) => {
  const [path, setPath] = useState<keyof typeof PATHS | null>(null);
  const [step, setStep] = useState<'select' | 'questions' | 'ai-followup' | 'contact' | 'brief' | 'done'>('select');
  const [qIdx, setQIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [currentInput, setCurrentInput] = useState<AnswerValue>('');
  const [followups, setFollowups] = useState<Question[]>([]);
  const [brief, setBrief] = useState('');
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-set path from serviceId
  useEffect(() => {
    if (isOpen && serviceId) {
      const p = SERVICE_GROUP_MAP[serviceId];
      if (p) { setPath(p); setStep('questions'); setQIdx(0); }
    }
  }, [isOpen, serviceId]);

  // Reset on close
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => {
        setPath(null); setStep('select'); setQIdx(0);
        setAnswers({}); setCurrentInput(''); setFollowups([]);
        setBrief(''); setLoading(false); setName(''); setEmail('');
        setPhone(''); setSubmitting(false); setError('');
      }, 300);
    }
  }, [isOpen]);

  // Inject the universal budget question (before the trailing free-form
  // "notes" question) into any path that doesn't already ask for budget,
  // so every completed brief carries a structured budget.
  const questions = React.useMemo(() => {
    if (!path) return [] as Question[];
    const base = PATHS[path];
    if (base.some(q => q.id === 'budget')) return base;
    const notesIdx = base.findIndex(q => q.id === 'notes');
    if (notesIdx === -1) return [...base, BUDGET_Q];
    return [...base.slice(0, notesIdx), BUDGET_Q, ...base.slice(notesIdx)];
  }, [path]);
  const allQs = [...questions, ...followups];
  const currentQ = allQs[qIdx];
  const progress = allQs.length ? Math.round(((qIdx) / allQs.length) * 100) : 0;

  const handleSelectOption = (opt: string) => {
    if (!currentQ) return;
    if (currentQ.type === 'single') {
      setCurrentInput(opt);
    } else {
      const arr = Array.isArray(currentInput) ? [...currentInput] : [];
      const idx = arr.indexOf(opt);
      if (idx > -1) arr.splice(idx, 1); else arr.push(opt);
      setCurrentInput(arr);
    }
  };

  const isSelected = (opt: string) => {
    if (Array.isArray(currentInput)) return currentInput.includes(opt);
    return currentInput === opt;
  };

  const canAdvance = () => {
    if (currentQ?.optional) return true;
    if (Array.isArray(currentInput)) return currentInput.length > 0;
    return String(currentInput).trim().length > 0;
  };

  const advance = async () => {
    if (!currentQ) return;
    const newAnswers = { ...answers, [currentQ.id]: currentInput };
    setAnswers(newAnswers);
    setCurrentInput('');

    const isLastHardcoded = qIdx === questions.length - 1;
    const isLast = qIdx === allQs.length - 1;

    if (isLastHardcoded && followups.length === 0) {
      // Get AI follow-ups
      setLoading(true);
      try {
        const res = await fetch('/api/intake-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ mode: 'followup', path, answers: newAnswers }),
        });
        const data = await res.json();
        if (data.questions?.length) {
          setFollowups(data.questions.map((q: string, i: number) => ({
            id: `ai_${i}`, question: q, type: 'textarea' as const, optional: true,
            placeholder: 'Share as much detail as helpful…',
          })));
          setQIdx(qIdx + 1);
        } else {
          setStep('contact');
        }
      } catch {
        setStep('contact');
      }
      setLoading(false);
    } else if (isLast) {
      setStep('contact');
    } else {
      setQIdx(qIdx + 1);
    }
  };

  const generateBrief = async () => {
    if (!name || !email) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/intake-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode: 'brief', path, answers, name, email, phone, serviceName }),
      });
      const data = await res.json();
      setBrief(data.brief || 'Your project brief has been received.');
      setStep('brief');
    } catch {
      setError('Connection error. Please email info@swrvonthego.pro');
    }
    setSubmitting(false);
  };

  const submitBrief = async () => {
    setSubmitting(true);
    try {
      await fetch('/api/intake-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path, pathLabel: path ? PATH_LABELS[path] : 'Project', answers, name, email, phone, brief, serviceName }),
      });
      setStep('done');
    } catch {
      setStep('done'); // still complete even if email fails
    }
    setSubmitting(false);
  };

  if (!isOpen) return null;

  const Gold = '#c8a84b';
  const BG  = 'rgba(10,8,4,0.98)';
  const BORDER = 'rgba(255,255,255,0.08)';

  return (
    <div className="fixed inset-0 z-[9995] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}>
      <div className="relative w-full max-w-2xl max-h-[90svh] flex flex-col rounded-3xl overflow-hidden"
        style={{ background: BG, border: '1px solid rgba(200,168,75,0.2)', boxShadow: '0 32px 80px rgba(0,0,0,0.8)' }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: BORDER }}>
          <div>
            <p className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: Gold }}>
              {path ? `${PATH_LABELS[path]} Intake` : 'Project Intake'}
            </p>
            {serviceName && <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{serviceName}</p>}
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition-colors">
            <X size={18} style={{ color: 'rgba(255,255,255,0.4)' }} />
          </button>
        </div>

        {/* Progress bar */}
        {step === 'questions' && (
          <div className="h-0.5 w-full" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <div className="h-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%`, background: `linear-gradient(90deg, ${Gold}, #e8c96a)` }} />
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-8">

          {/* ── SELECT PATH ── */}
          {step === 'select' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-2">What are we building?</h2>
              <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Select the category closest to what you need. We'll ask the right questions from there.
              </p>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(PATH_LABELS).map(([key, label]) => (
                  <button key={key}
                    onClick={() => { setPath(key as keyof typeof PATHS); setStep('questions'); setQIdx(0); }}
                    className="p-4 rounded-2xl text-left transition-all hover:scale-[1.02]"
                    style={{ background: 'rgba(255,255,255,0.03)', border: `1.5px solid ${BORDER}` }}>
                    <p className="font-bold text-sm text-white">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {key === 'website' ? 'Presence, Platform, Ecosystem, Fundraising' :
                       key === 'video'   ? 'Music video, Promo, Events, Reels, AI' :
                       key === 'music'   ? 'Production, Mixing, Mastering, Recording' :
                       key === 'brand'   ? 'Logo, Identity, Photography, Strategy' :
                       key === 'business'? 'Pitch decks, Plans, Books, LLC' :
                       key === 'podcast' ? 'Launch kit, Recording, Distribution' :
                       'Coaching, Artist Dev, Strategy'}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── QUESTIONS ── */}
          {step === 'questions' && currentQ && (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="text-xs font-bold" style={{ color: Gold }}>
                  {qIdx + 1} of {allQs.length}
                </span>
                {currentQ.optional && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>Optional</span>
                )}
              </div>
              <h2 className="text-xl font-black text-white mb-2 leading-tight">{currentQ.question}</h2>
              {currentQ.sub && <p className="text-sm mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>{currentQ.sub}</p>}

              {/* Options */}
              {currentQ.options && (
                <div className="flex flex-col gap-2 mb-6">
                  {currentQ.options.map(opt => (
                    <button key={opt} onClick={() => handleSelectOption(opt)}
                      className="w-full p-3.5 rounded-xl text-left transition-all text-sm"
                      style={{
                        background: isSelected(opt) ? 'rgba(200,168,75,0.12)' : 'rgba(255,255,255,0.03)',
                        border: `1.5px solid ${isSelected(opt) ? 'rgba(200,168,75,0.5)' : BORDER}`,
                        color: isSelected(opt) ? '#ede8dc' : 'rgba(255,255,255,0.7)',
                        fontWeight: isSelected(opt) ? 600 : 400,
                      }}>
                      <span className="mr-3" style={{ color: isSelected(opt) ? Gold : 'transparent' }}>✓</span>
                      {opt}
                    </button>
                  ))}
                </div>
              )}

              {/* Text input */}
              {(currentQ.type === 'text' || currentQ.type === 'textarea') && (
                <textarea
                  ref={inputRef}
                  rows={currentQ.type === 'textarea' ? 4 : 2}
                  value={String(currentInput)}
                  onChange={e => setCurrentInput(e.target.value)}
                  placeholder={currentQ.placeholder || 'Your answer…'}
                  className="w-full px-4 py-3 text-sm outline-none resize-none mb-4"
                  style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, color: '#fff', lineHeight: 1.7 }}
                />
              )}
            </div>
          )}

          {/* ── AI LOADING ── */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader size={32} style={{ color: Gold }} className="animate-spin mb-4" />
              <p className="text-sm font-semibold text-white">Generating follow-up questions…</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Based on everything you've told us so far</p>
            </div>
          )}

          {/* ── CONTACT ── */}
          {step === 'contact' && (
            <div>
              <h2 className="text-2xl font-black text-white mb-2">Almost there.</h2>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                We'll generate your project brief and send a copy to your email. SWRV will follow up within 24 hours.
              </p>
              {[
                { label: 'Your Name *', val: name, set: setName, type: 'text', ph: 'Full name' },
                { label: 'Email *', val: email, set: setEmail, type: 'email', ph: 'your@email.com' },
                { label: 'Phone (optional)', val: phone, set: setPhone, type: 'tel', ph: '(000) 000-0000' },
              ].map(f => (
                <div key={f.label} className="mb-4">
                  <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{f.label}</label>
                  <input type={f.type} value={f.val} onChange={e => f.set(e.target.value)} placeholder={f.ph}
                    className="w-full px-4 py-3 text-sm outline-none"
                    style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${BORDER}`, borderRadius: 12, color: '#fff' }} />
                </div>
              ))}
              {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
            </div>
          )}

          {/* ── BRIEF PREVIEW ── */}
          {step === 'brief' && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
                  <FileText size={18} color="#0a0804" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white">Your Project Brief</h2>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Review before we send it to SWRV</p>
                </div>
              </div>
              <div className="p-4 rounded-2xl mb-6 text-xs leading-relaxed whitespace-pre-wrap"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.65)', fontFamily: 'monospace', maxHeight: 300, overflowY: 'auto' }}>
                {brief}
              </div>
            </div>
          )}

          {/* ── DONE ── */}
          {step === 'done' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-5"
                style={{ background: 'linear-gradient(135deg,#c8a84b,#e8c96a)' }}>
                <CheckCircle size={32} color="#0a0804" />
              </div>
              <h2 className="text-2xl font-black text-white mb-2">Brief Submitted 🎉</h2>
              <p className="text-sm mb-1" style={{ color: 'rgba(255,255,255,0.5)' }}>
                SWRV has everything they need to get started.
              </p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.35)' }}>
                Check your email for a copy. Expect a response within 24 hours.
              </p>
            </div>
          )}
        </div>

        {/* Footer actions */}
        {!loading && step !== 'done' && (
          <div className="px-6 pb-6 pt-2 border-t flex gap-3 items-center" style={{ borderColor: BORDER }}>
            {step === 'questions' && qIdx > 0 && (
              <button onClick={() => { setQIdx(q => q - 1); setCurrentInput(answers[allQs[qIdx - 1]?.id] || ''); }}
                className="p-3 rounded-full" style={{ border: `1px solid ${BORDER}`, color: 'rgba(255,255,255,0.4)' }}>
                <ChevronLeft size={18} />
              </button>
            )}
            {step === 'select' ? null :
             step === 'questions' ? (
               <button onClick={advance} disabled={!canAdvance()}
                 className="flex-1 py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                 style={{ background: canAdvance() ? `linear-gradient(135deg,${Gold},#e8c96a)` : 'rgba(255,255,255,0.06)', color: canAdvance() ? '#0a0804' : 'rgba(255,255,255,0.25)' }}>
                 {qIdx === allQs.length - 1 ? 'Finish →' : 'Next'} <ArrowRight size={16} />
               </button>
             ) : step === 'contact' ? (
               <button onClick={generateBrief} disabled={!name || !email || submitting}
                 className="flex-1 py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02] disabled:opacity-40"
                 style={{ background: name && email ? `linear-gradient(135deg,${Gold},#e8c96a)` : 'rgba(255,255,255,0.06)', color: name && email ? '#0a0804' : 'rgba(255,255,255,0.25)' }}>
                 {submitting ? 'Generating…' : 'Generate My Brief →'}
               </button>
             ) : step === 'brief' ? (
               <button onClick={submitBrief} disabled={submitting}
                 className="flex-1 py-3.5 rounded-full font-black text-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                 style={{ background: `linear-gradient(135deg,${Gold},#e8c96a)`, color: '#0a0804', boxShadow: '0 8px 24px rgba(200,168,75,0.35)' }}>
                 {submitting ? 'Sending…' : 'Send to SWRV →'}
               </button>
             ) : null}
          </div>
        )}
        {step === 'done' && (
          <div className="px-6 pb-6">
            <button onClick={onClose}
              className="w-full py-3.5 rounded-full font-black text-sm"
              style={{ background: `linear-gradient(135deg,${Gold},#e8c96a)`, color: '#0a0804' }}>
              Back to SWRV On The Go
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
