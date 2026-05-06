import React, { useState, useRef, useEffect } from 'react';
import { X, Mic, CreditCard, Lock, Music, Briefcase, Globe, ChevronRight, Loader2, Play, Pause, CheckCircle2, Sparkles, Palette, Type as TypeIcon, Layout, ArrowRight, Plus, Minus, Shopping Bag } from 'lucide-react';
import { GoogleGenAI, Type as GenAIType } from "@google/genai";
import { Button } from './Button';
import { EXECUTION_SERVICES } from '../constants';
import type { ExecutionService } from '../types';

interface VisionRoadmapBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'intro' | 'dream_input' | 'processing' | 'vision_recap' | 'services_selection' | 'checkout';
type TabType = 'brand-planning' | 'site-vision';

interface SelectedService extends ExecutionService {
  quantity: number;
}

interface GeneratedSite {
  themeName: string;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  fontStyle: 'sans' | 'serif' | 'mono';
  layoutStyle: 'minimal' | 'bold' | 'grid';
  heroHeadline: string;
  heroSubheadline: string;
  vibeDescription: string;
}

export const VisionRoadmapBuilder: React.FC<VisionRoadmapBuilderProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<TabType>('brand-planning');
  const [step, setStep] = useState<WizardStep>('intro');
  const [dreamText, setDreamText] = useState('');
  const [visionText, setVisionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [brandPlan, setBrandPlan] = useState<any>(null);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);
  const [recommendedServices, setRecommendedServices] = useState<ExecutionService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setDreamText('');
      setVisionText('');
      setBrandPlan(null);
      setGeneratedSite(null);
      setRecommendedServices([]);
      setSelectedServices([]);
    }
  }, [isOpen]);

  const toggleServiceSelection = (service: ExecutionService) => {
    const existing = selectedServices.find(s => s.id === service.id);
    if (existing) {
      if (existing.quantity > 1) {
        setSelectedServices(selectedServices.map(s => 
          s.id === service.id ? { ...s, quantity: s.quantity - 1 } : s
        ));
      } else {
        setSelectedServices(selectedServices.filter(s => s.id !== service.id));
      }
    } else {
      setSelectedServices([...selectedServices, { ...service, quantity: 1 }]);
    }
  };

  const getTotalPrice = () => {
    return selectedServices.reduce((sum, s) => sum + (s.price * s.quantity), 0);
  };
    setIsAnalyzing(true);
    setStep('processing');
    
    try {
      // Initialize Gemini
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Step 1: Generate the brand plan/coordinates
      const systemInstruction = `
        You are the "SWRV Virtual Executive Producer." You represent the 20-year music industry legacy of Zion "Swrv" Birdsong.
        Your goal is to convert the user's "Happily Ever After" vision into a professional SWRV Brand Plan.
        
        TONE & PHILOSOPHY:
        - You are a senior producer, not a chatbot. Calm, focused, authoritative.
        - Use GPS/Navigation lingo: "Coordinates Locked," "Route Calculated," "Recalculating," "Destination Set."
        - Be a Truth-Teller.
        - Do NOT mention "Villa Rica".
        
        INPUT:
        The user will describe their "Happily Ever After" life at age 50.
        
        OUTPUT:
        Return a JSON object with these exact keys:
        - "coordinates_summary": A concise, professional summary of their vision (e.g., "Destination: Global Philanthropist & Soul Artist").
        - "roadblocks": A list of 3 major industry or logistical hurdles they likely face to get there.
        - "strategic_insight": A deep, "truth-teller" insight about what they need to change *now* to reach that future.
      `;

      const coordinatesResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: dreamText || "I want to be a global superstar touring the world.",
        config: {
          responseMimeType: 'application/json',
          systemInstruction: systemInstruction,
        }
      });

      const coordinatesText = coordinatesResponse.text;
      const plan = coordinatesText ? JSON.parse(coordinatesText) : null;
      
      if (plan) {
        setBrandPlan(plan);
      }

      // Step 2: Recommend services based on their vision
      const recommendationPrompt = `
        Based on this artist's vision, recommend specific services from this list that would help them execute:
        
        Vision: "${dreamText}"
        
        Available services:
        ${EXECUTION_SERVICES.map(s => `- ${s.name} ($${s.price}): ${s.description}`).join('\n')}
        
        Return a JSON object with:
        - "recommended_service_ids": array of service IDs that match their vision
        - "reasoning": object mapping each service ID to why it's recommended based on their specific goals
        
        Be thoughtful and only recommend services that directly support their stated vision.
      `;

      const recommendationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: recommendationPrompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a business consultant helping artists execute their vision. Recommend SWRV services that align with their specific goals.'
        }
      });

      const recommendationText = recommendationResponse.text;
      if (recommendationText) {
        const recommendation = JSON.parse(recommendationText);
        const recommended = EXECUTION_SERVICES.filter(s => 
          recommendation.recommended_service_ids.includes(s.id)
        ).map(s => ({
          ...s,
          recommended: true,
          reasoning: recommendation.reasoning[s.id]
        }));
        setRecommendedServices(recommended);
      }

      setStep('vision_recap');
    } catch (error) {
      console.error("Error processing vision:", error);
      // Fallback if API fails
      setBrandPlan({
        coordinates_summary: "Global Legacy & Artistic Freedom",
        roadblocks: ["Undefined Brand Identity", "Lack of Infrastructure", "Inconsistent Output"],
        strategic_insight: "You have the vision, but you lack the vehicle. Without a map, speed is just a faster way to get lost."
      });
      // Show sample recommended services
      setRecommendedServices(EXECUTION_SERVICES.slice(0, 5));
      setStep('vision_recap');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProcessVision = async () => {
    setIsAnalyzing(true);
    setStep('processing');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
      
      const systemInstruction = `
        You are an expert AI Web Designer for SWRV Artist Services.
        Your job is to take a user's raw vision/vibe and translate it into a concrete website design system.
        
        Return a JSON object with these exact keys:
        - themeName: A cool, catchy name for this design aesthetic.
        - primaryColor: A valid CSS hex code for the main accent color.
        - secondaryColor: A valid CSS hex code for secondary elements.
        - backgroundColor: A valid CSS hex code for the main background (usually very dark or very light).
        - textColor: A valid CSS hex code that contrasts well with the background.
        - fontStyle: Must be exactly one of: "sans", "serif", or "mono".
        - layoutStyle: Must be exactly one of: "minimal", "bold", or "grid".
        - heroHeadline: A punchy, 3-5 word headline for their hero section based on their vision.
        - heroSubheadline: A 1-2 sentence subheadline expanding on the headline.
        - vibeDescription: A 2-sentence explanation of why you chose these colors and fonts for their vision.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: visionText || "I want a dark, moody site for my drill rap album. Lots of red and black.",
        config: {
          responseMimeType: 'application/json',
          systemInstruction: systemInstruction,
          responseSchema: {
            type: GenAIType.OBJECT,
            properties: {
              themeName: { type: GenAIType.STRING },
              primaryColor: { type: GenAIType.STRING },
              secondaryColor: { type: GenAIType.STRING },
              backgroundColor: { type: GenAIType.STRING },
              textColor: { type: GenAIType.STRING },
              fontStyle: { type: GenAIType.STRING },
              layoutStyle: { type: GenAIType.STRING },
              heroHeadline: { type: GenAIType.STRING },
              heroSubheadline: { type: GenAIType.STRING },
              vibeDescription: { type: GenAIType.STRING },
            },
            required: ["themeName", "primaryColor", "secondaryColor", "backgroundColor", "textColor", "fontStyle", "layoutStyle", "heroHeadline", "heroSubheadline", "vibeDescription"]
          }
        }
      });

      const text = response.text;
      if (text) {
          setGeneratedSite(JSON.parse(text));
          setStep('blueprint');
      }
    } catch (error) {
      console.error("Error processing vision:", error);
      // Fallback if API fails
      setGeneratedSite({
        themeName: "Midnight Echo",
        primaryColor: "#FF4D00",
        secondaryColor: "#333333",
        backgroundColor: "#050505",
        textColor: "#FFFFFF",
        fontStyle: "sans",
        layoutStyle: "bold",
        heroHeadline: "Unleash Your Sound.",
        heroSubheadline: "The digital home for your next masterpiece. Dark, moody, and undeniably yours.",
        vibeDescription: "We selected a deep obsidian background with striking orange accents to match your intense, energetic vibe. The bold sans-serif typography ensures your message hits hard."
      });
      setStep('blueprint');
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (!isOpen) return null;

  const fontClass = generatedSite?.fontStyle === 'serif' ? 'font-serif' : generatedSite?.fontStyle === 'mono' ? 'font-mono' : 'font-sans';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      {/* Cinematic Backdrop */}
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      {/* Main Console */}
      <div className="relative w-full max-w-5xl bg-[#0a0a0a] rounded-xl shadow-[0_0_50px_rgba(255,77,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
        
        {/* Header: Vision Roadmap Console */}
        <div className="bg-black p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 bg-lion-orange rounded-full animate-pulse shadow-[0_0_10px_#FF4D00]"></div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-widest uppercase">SWRV Vision Roadmap</h2>
               <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">AI Maps • You Execute • Your Vision</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-black/50">
          <button
            onClick={() => {
              setActiveTab('brand-planning');
              setStep('intro');
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === 'brand-planning'
                ? 'text-lion-orange border-b-2 border-lion-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Vision Roadmap
          </button>
          <button
            onClick={() => {
              setActiveTab('site-vision');
              setStep('intro');
            }}
            className={`flex-1 px-6 py-4 text-sm font-bold uppercase tracking-widest transition-all ${
              activeTab === 'site-vision'
                ? 'text-lion-orange border-b-2 border-lion-orange'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Generate Site Vision
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative min-h-[500px]">
          
          {/* ========== BRAND PLANNING TAB ========== */}
          {activeTab === 'brand-planning' && (
            <>
              {/* STEP 1: THE VISION QUESTION */}
              {step === 'intro' && (
                <div className="h-full flex flex-col items-center justify-center p-8 md:p-16 text-center space-y-8 animate-in fade-in duration-500">
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4">
                     <Globe className="text-lion-orange w-8 h-8" />
                   </div>
                   
                   <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                     Let's Map Your <br/>
                     <span className="text-lion-orange">Happily Ever After.</span>
                   </h3>
                   
               <p className="text-gray-400 text-lg max-w-2xl leading-relaxed mb-6">
                 "Imagine you're a young adult with no kids or spouse and you have unlimited resources. 
                 What does your life look like at age 50? Design your life, and talk about a day in your 
                 happily-ever-after in the present tense."
               </p>

               <div className="bg-black/40 border border-lion-orange/30 rounded-lg p-6 mb-6 space-y-3">
                 <p className="text-white text-sm leading-relaxed">
                   <span className="font-bold text-lion-orange">How this works:</span> AI helps you externalize and map the ideas you already have. But here's the truth—AI maps out the ideas. <span className="font-semibold">You bring the passion, energy, and real human work that makes it happen.</span>
                 </p>
                 <p className="text-gray-400 text-xs">
                   What you're about to create is YOUR VISION—free, completely yours, and the blueprint for real execution.
                 </p>
               </div>

               <p className="text-lion-orange text-sm font-semibold tracking-wide">
                 ✓ FREE Vision Roadmap (Below)
               </p>
               <p className="text-gray-500 text-xs max-w-2xl leading-relaxed mb-6">
                 AI is the tool. You're the artist. Let's get your vision clear so you can execute it with power.
               </p>

               <Button 
                 variant="primary" 
                 size="lg"
                 onClick={() => setStep('dream_input')}
                 className="mt-8 !text-lg !px-12 !py-4 shadow-[0_0_30px_rgba(255,77,0,0.3)]"
               >
                 MAP YOUR VISION <ChevronRight className="ml-2" />
               </Button>
                </div>
              )}

              {/* STEP 2: THE DREAM INPUT */}
              {step === 'dream_input' && (
                <div className="h-full flex flex-col p-8 md:p-12 animate-in slide-in-from-right duration-500">
                   <div className="mb-6">
                     <h4 className="text-lion-orange font-bold uppercase tracking-widest text-sm mb-2">Capturing Your Passion...</h4>
                     <h3 className="text-3xl font-bold text-white">Speak Your Truth.</h3>
                     <p className="text-gray-500 text-sm mt-2">Be real. What do you smell? Who is with you? What are you walking on? This is about YOUR energy and passion—not the AI's interpretation.</p>
                   </div>
                   
                   <textarea
                     className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 text-white text-lg focus:outline-none focus:border-lion-orange/50 focus:bg-white/10 transition-all resize-none placeholder-gray-600 leading-relaxed"
                     placeholder="At 50, I wake up in my villa overlooking the ocean. The air smells like salt and citrus. I check my phone and see my label is running itself..."
                     value={dreamText}
                     onChange={(e) => setDreamText(e.target.value)}
                     autoFocus
                   />
                   
                   <div className="mt-8 flex justify-between items-center">
                     <div className="flex items-center gap-3 text-gray-500 text-sm">
                       <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                       Capturing Your Vision
                     </div>
                     <Button 
                       variant="primary" 
                       size="lg"
                       onClick={handleProcessDream}
                       disabled={dreamText.length < 10}
                       className={dreamText.length < 10 ? 'opacity-50 grayscale' : ''}
                     >
                       LOCK YOUR VISION
                     </Button>
                   </div>
                </div>
              )}

              {/* STEP 3: PROCESSING (LOADING) */}
              {isAnalyzing && activeTab === 'brand-planning' && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 text-lion-orange animate-spin mb-6" />
                  <h3 className="text-2xl font-bold text-white tracking-widest animate-pulse">MAPPING YOUR VISION...</h3>
                  <p className="text-gray-500 mt-2 font-mono text-sm">AI is processing • You stay in control • Ready for human execution</p>
                </div>
              )}

              {/* STEP 4: THE BLUEPRINT & UPSELL */}
              {step === 'blueprint' && brandPlan && activeTab === 'brand-planning' && (
                 <div className="h-full overflow-y-auto animate-in fade-in duration-700">
                   
                   {/* Analysis Section */}
                   <div className="bg-gradient-to-b from-lion-orange/20 to-black p-8 md:p-12 border-b border-white/10">
                     <div className="flex items-center gap-2 text-lion-orange font-bold uppercase tracking-widest text-xs mb-4">
                       <CheckCircle2 size={14} /> Vision Mapped
                     </div>
                     <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                       {brandPlan.coordinates_summary}
                     </h2>
                     
                     <div className="grid md:grid-cols-2 gap-8 mt-8">
                        <div className="bg-black/40 p-6 rounded border border-white/10">
                          <h4 className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-4">Identified Roadblocks</h4>
                          <ul className="space-y-3">
                            {brandPlan.roadblocks.map((block: string, i: number) => (
                              <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                                <span className="text-red-500 mt-1">✕</span> {block}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="bg-black/40 p-6 rounded border border-white/10">
                           <h4 className="text-lion-orange text-xs font-bold uppercase tracking-wider mb-4">Executive Producer Insight</h4>
                           <p className="text-white text-sm leading-relaxed italic border-l-2 border-lion-orange pl-4">
                             "{brandPlan.strategic_insight}"
                           </p>
                        </div>
                     </div>
                   </div>

{/* Roadmap Complete Message */}
               <div className="p-8 md:p-12 bg-[#050505] text-center">
                 <h3 className="text-2xl font-bold text-white mb-4">Your Vision Roadmap Is Complete</h3>
                 <p className="text-gray-400 text-sm mb-8 leading-relaxed max-w-3xl mx-auto">
                   The AI has mapped everything out. Now comes the real work—<span className="font-semibold text-white">yours.</span> With this roadmap and your passion, you have everything you need to execute on your own timeline.
                 </p>
                 
                 <div className="bg-black/50 border border-lion-orange/30 rounded-lg p-8 mb-8">
                   <p className="text-white text-sm font-semibold mb-3">
                     Ready to bring this to life? We don't just consult—we execute WITH you.
                   </p>
                   <p className="text-gray-300 text-sm mb-4">
                     From branding & design to business infrastructure to ongoing partnership, we offer complete execution services.
                   </p>
                   <Button variant="primary" className="w-full md:w-80 mx-auto">Explore Execution Services</Button>
                 </div>

                 <div className="text-left max-w-4xl mx-auto">
                   <h4 className="text-sm font-bold text-lion-orange uppercase tracking-widest mb-4">What We Offer When You're Ready:</h4>
                   <ul className="text-gray-400 text-sm space-y-2">
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Brand Foundation:</strong> Logo design, mission/vision statements, slogans, visual identity</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Digital Ecosystem:</strong> Professional website, online store, social media strategy</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Business Infrastructure:</strong> LLC formation, banking setup, accounting systems</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Rights Organization:</strong> BMI/ASCAP/SESAC registration, performance rights education</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Monetization:</strong> Sync licensing connections & project referrals</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Merchandise & Products:</strong> Design, manufacturing, fulfillment strategy</span>
                     </li>
                     <li className="flex items-start gap-3">
                       <span className="text-lion-orange mt-1">✓</span>
                       <span><strong>Ongoing Education:</strong> Business coaching, compliance, growth strategy</span>
                     </li>
                   </ul>
                 </div>

                 <div className="mt-8 pt-8 border-t border-white/10">
                   <p className="text-gray-500 text-xs mb-4">
                     📧 Your complete roadmap has been emailed to you. <span className="text-white font-semibold">This is YOUR map. Share it, use it, revisit it.</span>
                   </p>
                   <p className="text-gray-600 text-xs">
                     When you're ready to execute—not just plan—reach out. That's where real growth happens. 🚀
                   </p>
                     </div>
                   </div>

                 </div>
              )}
            </>
          )}

          {/* ========== SITE VISION TAB ========== */}
          {activeTab === 'site-vision' && (
            <>
              {/* STEP 1: INTRO */}
              {step === 'intro' && (
                <div className="h-full flex flex-col items-center justify-center p-8 md:p-16 text-center space-y-8 animate-in fade-in duration-500">
                   <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4">
                     <Sparkles className="text-lion-orange w-8 h-8" />
                   </div>
                   
                   <h3 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                     Don't just build a website.<br/>
                     <span className="text-lion-orange">Generate a World.</span>
                   </h3>
                   
                   <p className="text-gray-400 text-lg max-w-2xl leading-relaxed">
                     Tell our AI about your aesthetic, your vibe, your vision. 
                     In seconds, we'll generate a custom design system tailored to who you are—then <span className="font-semibold text-white">you decide if it works.</span>
                   </p>

                   <Button 
                     variant="primary" 
                     size="lg" 
                     onClick={() => setStep('dream_input')}
                     className="mt-8 !text-lg !px-12 !py-4 shadow-[0_0_30px_rgba(255,77,0,0.3)]"
                   >
                     GENERATE ROADMAP <ChevronRight className="ml-2" />
                   </Button>
                </div>
              )}

              {/* STEP 2: INPUT */}
              {step === 'dream_input' && activeTab === 'site-vision' && (
                <div className="h-full flex flex-col p-8 md:p-12 animate-in slide-in-from-right duration-500">
                   <div className="mb-6">
                     <h4 className="text-lion-orange font-bold uppercase tracking-widest text-sm mb-2">Design Input</h4>
                     <h3 className="text-3xl font-bold text-white">Describe Your Aesthetic.</h3>
                     <p className="text-gray-500 text-sm mt-2">Are you moody R&B? Vibrant pop-art? Minimalist producer? Tell us so the AI can help you visualize it. You're in control.</p>
                   </div>
                   
                   <textarea
                     className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 text-white text-lg focus:outline-none focus:border-lion-orange/50 focus:bg-white/10 transition-all resize-none placeholder-gray-600 leading-relaxed"
                     placeholder="I'm an underground techno DJ. I want my site to feel like a dark warehouse at 3 AM. Lots of deep blacks, neon green accents, and harsh, brutalist fonts..."
                     value={visionText}
                     onChange={(e) => setVisionText(e.target.value)}
                     autoFocus
                   />
                   
                   <div className="mt-8 flex justify-between items-center">
                     <div className="flex items-center gap-3 text-gray-500 text-sm">
                       <div className="w-2 h-2 bg-lion-orange rounded-full animate-pulse"></div>
                       AI is ready
                     </div>
                     <Button 
                       variant="primary" 
                       size="lg"
                       onClick={handleProcessVision}
                       disabled={visionText.length < 10}
                       className={visionText.length < 10 ? 'opacity-50 grayscale' : ''}
                     >
                       GENERATE DRAFT
                     </Button>
                   </div>
                </div>
              )}

              {/* STEP 3: PROCESSING */}
              {isAnalyzing && activeTab === 'site-vision' && (
                <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
                  <Loader2 className="w-16 h-16 text-lion-orange animate-spin mb-6" />
                  <h3 className="text-2xl font-bold text-white tracking-widest animate-pulse">GENERATING DESIGN ROADMAP...</h3>
                  <div className="text-gray-500 mt-4 font-mono text-sm space-y-2 text-center">
                    <p className="animate-pulse">Reading your aesthetic...</p>
                    <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Building color story...</p>
                    <p className="animate-pulse" style={{ animationDelay: '1s' }}>Creating layout vision...</p>
                  </div>
                </div>
              )}

              {/* STEP 4: THE DRAFT & UPSELL */}
              {step === 'blueprint' && generatedSite && activeTab === 'site-vision' && (
                 <div className="h-full flex flex-col lg:flex-row animate-in fade-in duration-700">
                   
                   {/* Left: The Generated Preview */}
                   <div className="flex-1 p-8 border-r border-white/10 bg-[#050505] overflow-y-auto">
                     <div className="flex items-center justify-between mb-6">
                       <h4 className="text-white font-bold uppercase tracking-widest text-sm">Live Preview</h4>
                       <span className="text-xs font-mono text-lion-orange bg-lion-orange/10 px-2 py-1 rounded">v1.0 Draft</span>
                     </div>

                     {/* The Mini-Site Preview */}
                     <div 
                       className={`w-full rounded-lg overflow-hidden border border-white/20 shadow-2xl ${fontClass}`}
                       style={{ backgroundColor: generatedSite.backgroundColor, color: generatedSite.textColor }}
                     >
                       {/* Mock Header */}
                       <div className="p-4 flex justify-between items-center border-b border-white/10" style={{ borderColor: `${generatedSite.textColor}20` }}>
                         <div className="font-bold tracking-widest uppercase" style={{ color: generatedSite.primaryColor }}>{generatedSite.themeName}</div>
                         <div className="flex gap-4 text-xs opacity-70">
                           <span>Work</span>
                           <span>About</span>
                           <span>Contact</span>
                         </div>
                       </div>

                       {/* Mock Hero */}
                       <div className={`p-12 ${generatedSite.layoutStyle === 'bold' ? 'text-center' : 'text-left'} min-h-[300px] flex flex-col justify-center relative overflow-hidden`}>
                         <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(circle at center, ${generatedSite.primaryColor} 0%, transparent 70%)` }}></div>
                         <div className="relative z-10">
                           <h1 className="text-4xl md:text-5xl font-extrabold mb-4 leading-tight" style={{ color: generatedSite.textColor }}>
                             {generatedSite.heroHeadline}
                           </h1>
                           <p className="text-lg opacity-80 max-w-xl mx-auto" style={{ color: generatedSite.textColor }}>
                             {generatedSite.heroSubheadline}
                           </p>
                           <button 
                             className="mt-8 px-8 py-3 font-bold uppercase tracking-wider text-sm transition-transform hover:scale-105"
                             style={{ backgroundColor: generatedSite.primaryColor, color: generatedSite.backgroundColor }}
                           >
                             Explore
                           </button>
                         </div>
                       </div>

                       {/* Mock Grid/Content */}
                       <div className="p-8 grid grid-cols-2 gap-4" style={{ backgroundColor: `${generatedSite.textColor}05` }}>
                         <div className="h-24 rounded" style={{ backgroundColor: `${generatedSite.secondaryColor}40` }}></div>
                         <div className="h-24 rounded" style={{ backgroundColor: `${generatedSite.primaryColor}40` }}></div>
                       </div>
                     </div>
                   </div>

                   {/* Right: The Pitch */}
                   <div className="w-full lg:w-[400px] bg-[#0a0a0a] p-8 flex flex-col overflow-y-auto">
                     <h3 className="text-2xl font-bold text-white mb-2">The Blueprint</h3>
                     <p className="text-gray-400 text-sm mb-8">{generatedSite.vibeDescription}</p>

                     <div className="space-y-6 mb-8">
                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                           <Palette className="text-lion-orange w-5 h-5" />
                         </div>
                         <div>
                           <div className="text-xs text-gray-500 uppercase tracking-widest">Palette</div>
                           <div className="flex gap-2 mt-1">
                             <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: generatedSite.primaryColor }} title={generatedSite.primaryColor}></div>
                             <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: generatedSite.secondaryColor }} title={generatedSite.secondaryColor}></div>
                             <div className="w-6 h-6 rounded-full border border-white/20" style={{ backgroundColor: generatedSite.backgroundColor }} title={generatedSite.backgroundColor}></div>
                           </div>
                         </div>
                       </div>

                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                           <TypeIcon className="text-lion-orange w-5 h-5" />
                         </div>
                         <div>
                           <div className="text-xs text-gray-500 uppercase tracking-widest">Typography</div>
                           <div className="text-sm text-white font-semibold capitalize">{generatedSite.fontStyle}</div>
                         </div>
                       </div>

                       <div className="flex items-center gap-4">
                         <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                           <Layout className="text-lion-orange w-5 h-5" />
                         </div>
                         <div>
                           <div className="text-xs text-gray-500 uppercase tracking-widest">Layout</div>
                           <div className="text-sm text-white font-semibold capitalize">{generatedSite.layoutStyle}</div>
                         </div>
                       </div>
                     </div>

                     <Button variant="primary" className="w-full mt-auto">
                       Export Blueprint <ArrowRight size={16} className="ml-2" />
                     </Button>
                   </div>
                 </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};