import React, { useState, useEffect } from 'react';
import { X, Globe, ChevronRight, Loader2, Sparkles, Palette, Layout, Type, ArrowRight } from 'lucide-react';
import { GoogleGenAI, Type as GenAIType } from "@google/genai";
import { Button } from './Button';

interface WebsiteVisionGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'intro' | 'dream_input' | 'processing' | 'draft';

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

export const WebsiteVisionGenerator: React.FC<WebsiteVisionGeneratorProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<WizardStep>('intro');
  const [visionText, setVisionText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [generatedSite, setGeneratedSite] = useState<GeneratedSite | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep('intro');
      setVisionText('');
      setGeneratedSite(null);
    }
  }, [isOpen]);

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
          setStep('draft');
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
      setStep('draft');
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
        
        {/* Header */}
        <div className="bg-black p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
             <div className="w-3 h-3 bg-lion-orange rounded-full animate-pulse shadow-[0_0_10px_#FF4D00]"></div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-widest uppercase">SWRV AI Site Architect</h2>
               <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">Vision-to-Draft Engine</p>
             </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative min-h-[500px]">
          
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
                 Tell our AI Architect about your art, your vibe, and your vision. 
                 In seconds, we'll generate a custom design system and wireframe tailored to your unique aesthetic.
               </p>

               <Button 
                 variant="primary" 
                 size="lg" 
                 onClick={() => setStep('dream_input')}
                 className="mt-8 !text-lg !px-12 !py-4 shadow-[0_0_30px_rgba(255,77,0,0.3)]"
               >
                 START GENERATOR <ChevronRight className="ml-2" />
               </Button>
            </div>
          )}

          {/* STEP 2: INPUT */}
          {step === 'dream_input' && (
            <div className="h-full flex flex-col p-8 md:p-12 animate-in slide-in-from-right duration-500">
               <div className="mb-6">
                 <h4 className="text-lion-orange font-bold uppercase tracking-widest text-sm mb-2">Aesthetic Input</h4>
                 <h3 className="text-3xl font-bold text-white">Describe your vibe.</h3>
                 <p className="text-gray-500 text-sm mt-2">Are you a moody R&B singer? A vibrant pop-art painter? A minimalist producer? Tell us everything.</p>
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
                   Awaiting Input
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
          {step === 'processing' && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-lion-orange animate-spin mb-6" />
              <h3 className="text-2xl font-bold text-white tracking-widest animate-pulse">ARCHITECTING VISION...</h3>
              <div className="text-gray-500 mt-4 font-mono text-sm space-y-2 text-center">
                <p className="animate-pulse">Extracting aesthetic markers...</p>
                <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Curating color palette...</p>
                <p className="animate-pulse" style={{ animationDelay: '1s' }}>Generating layout structure...</p>
              </div>
            </div>
          )}

          {/* STEP 4: THE DRAFT & UPSELL */}
          {step === 'draft' && generatedSite && (
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
                       <Type className="text-lion-orange w-5 h-5" />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500 uppercase tracking-widest">Typography</div>
                       <div className="text-white capitalize">{generatedSite.fontStyle}</div>
                     </div>
                   </div>

                   <div className="flex items-center gap-4">
                     <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center">
                       <Layout className="text-lion-orange w-5 h-5" />
                     </div>
                     <div>
                       <div className="text-xs text-gray-500 uppercase tracking-widest">Structure</div>
                       <div className="text-white capitalize">{generatedSite.layoutStyle}</div>
                     </div>
                   </div>
                 </div>

                 <div className="mt-auto bg-lion-orange/10 border border-lion-orange/30 p-6 rounded-lg">
                   <h4 className="text-lion-orange font-bold mb-2">This is just the skeleton.</h4>
                   <p className="text-gray-300 text-sm mb-6">
                     Our AI has mapped the coordinates. Now, let our expert human designers bring it to life, add custom interactions, and make it production-ready.
                   </p>
                   <Button variant="primary" className="w-full flex items-center justify-center gap-2">
                     BOOK POLISH SESSION <ArrowRight size={16} />
                   </Button>
                 </div>
               </div>

             </div>
          )}

        </div>
      </div>
    </div>
  );
};
