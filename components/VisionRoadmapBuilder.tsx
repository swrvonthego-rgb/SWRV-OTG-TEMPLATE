import React, { useState, useEffect } from 'react';
import { X, Globe, ChevronRight, Loader2, CheckCircle2, Sparkles, Plus, Minus, Edit2 } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Button } from './Button';
import { EXECUTION_SERVICES } from '../constants';
import type { ExecutionService } from '../types';

interface VisionRoadmapBuilderProps {
  isOpen: boolean;
  onClose: () => void;
}

type WizardStep = 'dream_intro' | 'dream_input' | 'processing_dream' | 'vision_refinement' | 'assessment_1' | 'assessment_2' | 'assessment_3' | 'assessment_4' | 'processing_assessment' | 'final_vision_display' | 'services_menu';

interface VisionAssessment {
  dreamBigVision: string;
  // Assessment 1
  currentSituation: string;
  painPoints: string;
  // Assessment 2
  idealOutcome: string;
  uniqueStrengths: string;
  // Assessment 3
  roadblocks: string;
  supportSystem: string;
  // Assessment 4
  firstSteps: string;
  commitmentLevel: string;
}

interface SelectedService extends ExecutionService {
  quantity: number;
}

interface GeneratedVision {
  title: string;
  affirmation: string;
  mainVision: string;
  people: string;
  places: string;
  things: string;
  roadblocks: string[];
  nextSteps: string;
  motivationStatement: string;
  roadmapAlignment: string;
}

export const VisionRoadmapBuilder: React.FC<VisionRoadmapBuilderProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<WizardStep>('dream_intro');
  const [assessment, setAssessment] = useState<VisionAssessment>({
    dreamBigVision: '',
    currentSituation: '',
    painPoints: '',
    idealOutcome: '',
    uniqueStrengths: '',
    roadblocks: '',
    supportSystem: '',
    firstSteps: '',
    commitmentLevel: ''
  });
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [recommendedServices, setRecommendedServices] = useState<ExecutionService[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [generatedVision, setGeneratedVision] = useState<GeneratedVision | null>(null);
  const [isEditingDream, setIsEditingDream] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setStep('dream_intro');
      setAssessment({
        dreamBigVision: '',
        currentSituation: '',
        painPoints: '',
        idealOutcome: '',
        uniqueStrengths: '',
        roadblocks: '',
        supportSystem: '',
        firstSteps: '',
        commitmentLevel: ''
      });
      setGeneratedVision(null);
      setRecommendedServices([]);
      setSelectedServices([]);
      setIsAnalyzing(false);
      setIsEditingDream(false);
    }
  }, [isOpen]);

  const handleGenerateDreamVision = async () => {
    setIsAnalyzing(true);
    setStep('processing_dream');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
You are the "SWRV Vision Architect" - a visionary coach grounded in "The Roadmap" philosophy where "Your Gift = the car, Vision = the roadmap."

Your role is to take the user's raw 50-year dream and transform it into a refined, inspiring vision statement that will set the stage for deeper assessment.

IMPORTANT: Be affirming, excited, and help them see they're already on the right track. Reference how their dream aligns with The Roadmap principles.

OUTPUT FORMAT - Return ONLY a valid JSON object with these exact keys:
{
  "title": "A powerful one-line vision statement (5-7 words)",
  "affirmation": "A deeply affirming statement (2-3 sentences) that celebrates their dream and tells them they're on the right track",
  "mainVision": "Transform their dream into vivid present-tense narrative (3-4 paragraphs) with sensory detail",
  "roadmapAlignment": "How their vision aligns with The Roadmap principles - purpose, direction, discipline, and their GIFT. (2-3 sentences)"
}

Make them feel AMAZED and EXCITED about their vision. Use language that affirms their journey.
      `;

      const visionResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: `Based on this 50-year vision: "${assessment.dreamBigVision}"`,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: systemInstruction,
        }
      });

      const visionText = visionResponse.text;
      const visionData = visionText ? JSON.parse(visionText) : null;
      
      if (visionData) {
        setGeneratedVision({
          ...visionData,
          people: '',
          places: '',
          things: '',
          roadblocks: [],
          nextSteps: '',
          motivationStatement: ''
        });
        setStep('vision_refinement');
      }
    } catch (error) {
      console.error("Error generating vision:", error);
      setGeneratedVision({
        title: "Your Dream Life Awaits",
        affirmation: "You have clarity about what matters. Your vision is real, specific, and exciting. That's exactly where every great journey begins.",
        mainVision: "Your vision is vivid and real. You know exactly what you want at 50. Your dream reveals your true priorities and values. This is the foundation of everything that follows.",
        roadmapAlignment: "The Roadmap teaches us that vision is the map that gives your Gift direction and purpose. You're already aligned with this principle by having such a clear, detailed vision of your ideal life.",
        people: '',
        places: '',
        things: '',
        roadblocks: [],
        nextSteps: '',
        motivationStatement: ''
      });
      setStep('vision_refinement');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleProceedToAssessment = () => {
    setStep('assessment_1');
  };

  const handleGenerateFinalVision = async () => {
    setIsAnalyzing(true);
    setStep('processing_assessment');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const systemInstruction = `
You are the "SWRV Vision Architect" - a visionary coach grounded in "The Roadmap" philosophy.

Transform the dream + assessment answers into a comprehensive, actionable vision statement.

The Roadmap teaches:
- Your Gift = who you are naturally good at
- Vision = the roadmap that gives direction to your Gift
- Vision provides discipline and direction (from Proverbs 29:18: "Without vision, the people perish")
- Use People/Places/Things framework to make vision concrete

OUTPUT FORMAT - Return ONLY a valid JSON object:
{
  "title": "Powerful vision title (5-7 words)",
  "affirmation": "Affirm their answers - show how their assessment reveals their true path",
  "mainVision": "Transform dream + assessment into vivid present-tense narrative (4-5 paragraphs)",
  "people": "Who is in their life? Who supports them? What relationships matter?",
  "places": "Where do they live and work? What environments define them?",
  "things": "What do they own, experience, accomplish? Concrete manifestations.",
  "roadblocks": ["Major obstacle 1", "Major obstacle 2", "Major obstacle 3"],
  "nextSteps": "The 3-5 immediate actions to begin (ordered by priority)",
  "motivationStatement": "Their personal WHY statement (1-2 sentences based on their answers)",
  "roadmapAlignment": "How their specific answers show they're aligned with The Roadmap - their Gift becoming clear, their direction becoming focused"
}
      `;

      const visionResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: `Dream: "${assessment.dreamBigVision}"
        
Assessment Answers:
- Current Situation: ${assessment.currentSituation}
- Pain Points: ${assessment.painPoints}
- Ideal Outcome: ${assessment.idealOutcome}
- Unique Strengths: ${assessment.uniqueStrengths}
- Roadblocks: ${assessment.roadblocks}
- Support System: ${assessment.supportSystem}
- First Steps: ${assessment.firstSteps}
- Commitment Level: ${assessment.commitmentLevel}`,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: systemInstruction,
        }
      });

      const visionText = visionResponse.text;
      const finalVision = visionText ? JSON.parse(visionText) : null;
      
      if (finalVision) {
        setGeneratedVision(finalVision);
      }

      // Generate service recommendations
      const servicesList = EXECUTION_SERVICES
        .filter(s => s.category !== 'Package Deals')
        .map(s => `- ${s.name} ($${s.price}): ${s.description}`)
        .join('\n');

      const recommendationPrompt = `
Dream: "${assessment.dreamBigVision}"
Assessment Summary: ${assessment.currentSituation} | Strengths: ${assessment.uniqueStrengths}

Available Services:
${servicesList}

Return ONLY valid JSON:
{
  "recommended_service_ids": ["id1", "id2", ...],
  "reasoning": {
    "id": "How this service helps execute this specific vision"
  }
}

Recommend 6-8 services that directly help execute their vision and overcome their roadblocks.
      `;

      const recommendationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash-preview',
        contents: recommendationPrompt,
        config: {
          responseMimeType: 'application/json',
          systemInstruction: 'You are a business execution specialist. Recommend services that directly help someone achieve their stated vision and overcome their identified roadblocks.'
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

      setStep('final_vision_display');
    } catch (error) {
      console.error("Error generating final vision:", error);
      setGeneratedVision({
        title: "Your Vision is Real",
        affirmation: "Your answers reveal your true path. You're more aligned than you know.",
        mainVision: "Your vision combines your authentic 50-year dream with practical clarity from your own answers. This is YOUR unique roadmap.",
        people: "",
        places: "",
        things: "",
        roadblocks: ["Define clarity", "Build infrastructure", "Stay committed"],
        nextSteps: "Start with the service that most excites you. Take one action this week.",
        motivationStatement: "You know what you want. Now execute.",
        roadmapAlignment: "Your Gift is becoming clearer. Your vision is providing direction."
      });
      setRecommendedServices(EXECUTION_SERVICES.filter(s => s.category !== 'Package Deals').slice(0, 6));
      setStep('final_vision_display');
    } finally {
      setIsAnalyzing(false);
    }
  };

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 font-sans">
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-xl transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-4xl bg-[#0a0a0a] rounded-xl shadow-[0_0_50px_rgba(255,77,0,0.15)] overflow-hidden flex flex-col max-h-[90vh] border border-white/10">
        
        {/* Header */}
        <div className="bg-black p-6 flex justify-between items-center border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="w-3 h-3 bg-lion-orange rounded-full animate-pulse shadow-[0_0_10px_#FF4D00]"></div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-widest uppercase">SWRV Vision Roadmap</h2>
              <p className="text-gray-500 text-[10px] tracking-[0.2em] uppercase">Dream • Map • Execute</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto relative">
          
          {/* DREAM INTRO */}
          {step === 'dream_intro' && (
            <div className="h-full flex flex-col items-center justify-center p-8 md:p-16 text-center space-y-8 animate-in fade-in duration-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 mb-4">
                <Sparkles className="text-lion-orange w-8 h-8" />
              </div>
              
              <div className="space-y-6">
                <h3 className="text-4xl md:text-5xl font-black text-lion-orange leading-tight">
                  DON'T FORGET TO<br/>DREAM BIG.
                </h3>
                
                <div className="space-y-4 max-w-2xl mx-auto">
                  <p className="text-gray-300 text-lg leading-relaxed">
                    Imagine you're 20 years old. You have no one to answer to, no one to take care of but yourself, all the money in the world, and absolutely zero worries or concerns.
                  </p>
                  
                  <p className="text-gray-400 text-base leading-relaxed italic border-l-4 border-lion-orange pl-4">
                    "What does your life look like at 50?"
                  </p>

                  <div className="bg-lion-orange/10 border border-lion-orange/30 rounded-lg p-6 space-y-3">
                    <p className="text-white text-sm leading-relaxed">
                      Example: "I'm waking up to the sound of the ocean, covered in linen sheets smelling fresh coffee. I go over to check my investments on my laptop, saying good morning to my chef who's cooking fresh breakfast..."
                    </p>
                    <p className="text-gray-300 text-xs">
                      The more detail, the better. Don't hold back. This can be 5-10 minutes of talking or typing.
                    </p>
                  </div>
                </div>
              </div>

              <Button 
                variant="primary" 
                size="lg"
                onClick={() => setStep('dream_input')}
                className="mt-8 !text-lg !px-12 !py-4 shadow-[0_0_30px_rgba(255,77,0,0.3)]"
              >
                BEGIN <ChevronRight className="ml-2" />
              </Button>
            </div>
          )}

          {/* DREAM INPUT */}
          {step === 'dream_input' && (
            <div className="h-full flex flex-col p-8 md:p-12 animate-in slide-in-from-right duration-500">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-white mb-2">Paint Your Picture</h3>
                <p className="text-gray-400 text-sm">
                  Describe your life at 50 in vivid detail. What do you see, smell, hear, feel? Who's with you? What do you own? What have you accomplished? Be specific and abundant.
                </p>
              </div>
              
              <textarea
                className="flex-1 bg-white/5 border border-white/10 rounded-lg p-6 text-white text-lg focus:outline-none focus:border-lion-orange/50 focus:bg-white/10 transition-all resize-none placeholder-gray-600 leading-relaxed font-light"
                placeholder="I'm waking up to the sound of the ocean, covered in linen sheets, smelling fresh coffee as I go over to check my investments on my laptop, saying good morning to my Chef who's cooking me fresh breakfast..."
                value={assessment.dreamBigVision}
                onChange={(e) => setAssessment({...assessment, dreamBigVision: e.target.value})}
                autoFocus
              />
              
              <div className="mt-8 flex justify-between items-center">
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span>{assessment.dreamBigVision.length} characters</span>
                </div>
                <Button 
                  variant="primary" 
                  size="lg"
                  onClick={handleGenerateDreamVision}
                  disabled={assessment.dreamBigVision.length < 50}
                  className={assessment.dreamBigVision.length < 50 ? 'opacity-50 grayscale' : ''}
                >
                  GENERATE MY VISION <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* PROCESSING DREAM */}
          {isAnalyzing && step === 'processing_dream' && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-lion-orange animate-spin mb-6" />
              <h3 className="text-2xl font-bold text-white tracking-widest animate-pulse">MAPPING YOUR VISION...</h3>
              <p className="text-gray-500 mt-4 font-mono text-sm text-center max-w-md">Analyzing your dream • Generating your vision • Preparing deeper questions</p>
            </div>
          )}

          {/* VISION REFINEMENT */}
          {step === 'vision_refinement' && generatedVision && (
            <div className="p-8 md:p-12 space-y-8 animate-in fade-in duration-700">
              
              {/* Vision Header with Affirmation */}
              <div className="bg-gradient-to-b from-lion-orange/20 to-black p-8 rounded-lg border border-lion-orange/30">
                <div className="flex items-center gap-2 text-lion-orange font-bold uppercase tracking-widest text-xs mb-4">
                  <CheckCircle2 size={16} /> Step 1: Your Dream Vision
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  {generatedVision.title}
                </h2>
                <p className="text-gray-100 text-base leading-relaxed mb-6">
                  {generatedVision.affirmation}
                </p>
                <div className="bg-black/50 border border-lion-orange/20 rounded p-4">
                  <p className="text-gray-200 text-sm italic">
                    "{generatedVision.roadmapAlignment}"
                  </p>
                </div>
              </div>

              {/* Main Vision Narrative */}
              <div className="bg-black/50 border border-white/10 p-8 rounded-lg">
                <h3 className="text-lg font-bold text-lion-orange uppercase tracking-widest mb-4">Your Vision at 50</h3>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{generatedVision.mainVision}</p>
              </div>

              {/* Edit Dream Option */}
              {isEditingDream ? (
                <div className="bg-black/50 border border-white/10 p-6 rounded-lg space-y-4">
                  <h4 className="text-white font-bold">Refine Your Dream</h4>
                  <textarea
                    className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32"
                    value={assessment.dreamBigVision}
                    onChange={(e) => setAssessment({...assessment, dreamBigVision: e.target.value})}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button variant="secondary" onClick={() => setIsEditingDream(false)}>Cancel</Button>
                    <Button variant="primary" onClick={handleGenerateDreamVision}>Regenerate Vision</Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => setIsEditingDream(true)}
                  className="flex items-center gap-2 text-lion-orange hover:text-orange-400 transition-colors text-sm font-semibold"
                >
                  <Edit2 size={16} /> Want to refine this? Edit your dream
                </button>
              )}

              {/* Proceed to Assessment */}
              <div className="bg-lion-orange/10 border border-lion-orange/30 rounded-lg p-6 space-y-4">
                <h4 className="text-white font-bold text-lg">Ready for Deeper Clarity?</h4>
                <p className="text-gray-300 text-sm">
                  Your dream is powerful and clear. Now let's go deeper with 8 focused questions (2 per screen, 4 screens total) to help you identify blind spots, clarify obstacles, and create a rock-solid action plan.
                </p>
                <Button variant="primary" onClick={handleProceedToAssessment} className="w-full">
                  PROCEED TO ASSESSMENT <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* ASSESSMENT SCREENS */}
          {['assessment_1', 'assessment_2', 'assessment_3', 'assessment_4'].includes(step) && (
            <div className="p-8 md:p-12 space-y-8 animate-in slide-in-from-right duration-500">
              <div className="mb-4">
                <div className="flex items-center gap-2 text-lion-orange font-bold uppercase tracking-widest text-xs mb-4">
                  <span className="text-lg font-black">{step === 'assessment_1' ? '1' : step === 'assessment_2' ? '2' : step === 'assessment_3' ? '3' : '4'}</span> / 4
                </div>
                <h3 className="text-2xl font-bold text-white">Go Deeper</h3>
                <p className="text-gray-400 text-sm mt-2">Take your time with these questions. There are no wrong answers. If you don't know, write what comes to mind. Unlimited space and time.</p>
              </div>

              {step === 'assessment_1' && (
                <div className="space-y-8">
                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">1. Where are you RIGHT NOW?</span>
                      <span className="text-gray-400 text-xs block mb-3">Describe your current situation, where you are in life today (relationships, health, finances, career, etc.)</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="I'm currently..."
                        value={assessment.currentSituation}
                        onChange={(e) => setAssessment({...assessment, currentSituation: e.target.value})}
                      />
                    </label>
                  </div>

                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">2. What's causing you the most pain RIGHT NOW?</span>
                      <span className="text-gray-400 text-xs block mb-3">What's the biggest challenge, frustration, or obstacle in your current life?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="The biggest pain point is..."
                        value={assessment.painPoints}
                        onChange={(e) => setAssessment({...assessment, painPoints: e.target.value})}
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 'assessment_2' && (
                <div className="space-y-8">
                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">3. What would IDEAL look like?</span>
                      <span className="text-gray-400 text-xs block mb-3">In your ideal life at 50, what does success look like? What would you have, feel, experience?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="My ideal would be..."
                        value={assessment.idealOutcome}
                        onChange={(e) => setAssessment({...assessment, idealOutcome: e.target.value})}
                      />
                    </label>
                  </div>

                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">4. What are your unique strengths and gifts?</span>
                      <span className="text-gray-400 text-xs block mb-3">What are you naturally good at? What do people come to you for? What lights you up?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="My unique strengths are..."
                        value={assessment.uniqueStrengths}
                        onChange={(e) => setAssessment({...assessment, uniqueStrengths: e.target.value})}
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 'assessment_3' && (
                <div className="space-y-8">
                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">5. What roadblocks will you face?</span>
                      <span className="text-gray-400 text-xs block mb-3">What obstacles, fears, or challenges might prevent you from achieving your 50-year vision?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="The roadblocks I foresee are..."
                        value={assessment.roadblocks}
                        onChange={(e) => setAssessment({...assessment, roadblocks: e.target.value})}
                      />
                    </label>
                  </div>

                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">6. Who's in your corner?</span>
                      <span className="text-gray-400 text-xs block mb-3">Who supports you? Who will help you execute this vision? What mentors, friends, or resources are available to you?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="My support system includes..."
                        value={assessment.supportSystem}
                        onChange={(e) => setAssessment({...assessment, supportSystem: e.target.value})}
                      />
                    </label>
                  </div>
                </div>
              )}

              {step === 'assessment_4' && (
                <div className="space-y-8">
                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">7. What's your first move?</span>
                      <span className="text-gray-400 text-xs block mb-3">What's the first action you need to take to start moving toward this vision?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="My first steps would be..."
                        value={assessment.firstSteps}
                        onChange={(e) => setAssessment({...assessment, firstSteps: e.target.value})}
                      />
                    </label>
                  </div>

                  <div className="bg-black/50 border border-white/10 rounded-lg p-6 space-y-4">
                    <label className="block">
                      <span className="text-white font-bold text-sm block mb-2">8. How committed are you?</span>
                      <span className="text-gray-400 text-xs block mb-3">On a scale of 1-10, how committed are you to making this vision a reality? What would it take to get to a 10?</span>
                      <textarea
                        className="w-full bg-white/5 border border-white/10 rounded p-4 text-white text-sm focus:outline-none focus:border-lion-orange/50 resize-none h-32 placeholder-gray-600"
                        placeholder="My commitment level is..."
                        value={assessment.commitmentLevel}
                        onChange={(e) => setAssessment({...assessment, commitmentLevel: e.target.value})}
                      />
                    </label>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between gap-4 mt-8 pt-6 border-t border-white/10">
                <Button 
                  variant="secondary"
                  onClick={() => {
                    if (step === 'assessment_1') setStep('vision_refinement');
                    else if (step === 'assessment_2') setStep('assessment_1');
                    else if (step === 'assessment_3') setStep('assessment_2');
                    else if (step === 'assessment_4') setStep('assessment_3');
                  }}
                >
                  ← PREVIOUS
                </Button>
                <Button 
                  variant="primary"
                  onClick={() => {
                    if (step === 'assessment_1') setStep('assessment_2');
                    else if (step === 'assessment_2') setStep('assessment_3');
                    else if (step === 'assessment_3') setStep('assessment_4');
                    else if (step === 'assessment_4') handleGenerateFinalVision();
                  }}
                >
                  {step === 'assessment_4' ? 'GENERATE FINAL VISION' : 'NEXT'} <ChevronRight className="ml-2" />
                </Button>
              </div>
            </div>
          )}

          {/* PROCESSING ASSESSMENT */}
          {isAnalyzing && step === 'processing_assessment' && (
            <div className="absolute inset-0 bg-black/90 z-50 flex flex-col items-center justify-center">
              <Loader2 className="w-16 h-16 text-lion-orange animate-spin mb-6" />
              <h3 className="text-2xl font-bold text-white tracking-widest animate-pulse">SYNTHESIZING YOUR VISION...</h3>
              <p className="text-gray-500 mt-4 font-mono text-sm text-center max-w-md">Integrating your answers • Creating your roadmap • Recommending services</p>
            </div>
          )}

          {/* FINAL VISION DISPLAY */}
          {step === 'final_vision_display' && generatedVision && (
            <div className="p-8 md:p-12 space-y-8 animate-in fade-in duration-700">
              
              {/* Vision Header */}
              <div className="bg-gradient-to-b from-lion-orange/20 to-black p-8 rounded-lg border border-lion-orange/30">
                <div className="flex items-center gap-2 text-lion-orange font-bold uppercase tracking-widest text-xs mb-4">
                  <CheckCircle2 size={16} /> Your Complete Vision
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-white mb-4">
                  {generatedVision.title}
                </h2>
                <p className="text-gray-100 text-base leading-relaxed mb-6">
                  {generatedVision.affirmation}
                </p>
                <div className="bg-black/50 border border-lion-orange/20 rounded p-4">
                  <p className="text-gray-200 text-sm italic">
                    "{generatedVision.roadmapAlignment}"
                  </p>
                </div>
              </div>

              {/* Main Vision */}
              <div className="bg-black/50 border border-white/10 p-8 rounded-lg">
                <h3 className="text-lg font-bold text-lion-orange uppercase tracking-widest mb-4">Your Vision at 50</h3>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{generatedVision.mainVision}</p>
              </div>

              {/* People, Places, Things */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-black/40 p-6 rounded border border-white/10">
                  <h4 className="text-lion-orange font-bold uppercase text-xs tracking-widest mb-3">Your People</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{generatedVision.people}</p>
                </div>
                <div className="bg-black/40 p-6 rounded border border-white/10">
                  <h4 className="text-lion-orange font-bold uppercase text-xs tracking-widest mb-3">Your Places</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{generatedVision.places}</p>
                </div>
                <div className="bg-black/40 p-6 rounded border border-white/10">
                  <h4 className="text-lion-orange font-bold uppercase text-xs tracking-widest mb-3">Your Things</h4>
                  <p className="text-gray-300 text-sm leading-relaxed">{generatedVision.things}</p>
                </div>
              </div>

              {/* Roadblocks */}
              <div className="bg-black/40 p-6 rounded border border-white/10">
                <h4 className="text-lion-orange font-bold uppercase text-xs tracking-widest mb-4">Obstacles to Overcome</h4>
                <ul className="space-y-2">
                  {generatedVision.roadblocks && generatedVision.roadblocks.map((block, i) => (
                    <li key={i} className="flex items-start gap-3 text-gray-300 text-sm">
                      <span className="text-red-500 font-bold">→</span>
                      <span>{block}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Next Steps */}
              <div className="bg-lion-orange/10 border border-lion-orange/30 p-6 rounded">
                <h4 className="text-lion-orange font-bold uppercase text-xs tracking-widest mb-4">Your Next Steps</h4>
                <p className="text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">{generatedVision.nextSteps}</p>
              </div>

              {/* Motivation Statement */}
              <div className="bg-black/50 border border-white/10 p-6 rounded">
                <h4 className="text-lion-orange font-bold uppercase text-xs tracking-widest mb-3">Your WHY</h4>
                <p className="text-white text-base italic leading-relaxed">"{generatedVision.motivationStatement}"</p>
              </div>

              {/* Services Section */}
              <div className="border-t border-white/10 pt-8">
                <h3 className="text-2xl font-bold text-white mb-4">Now, Let's Execute It</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Based on your complete vision and answers, we've recommended services that will help you execute with precision.
                </p>

                {recommendedServices.length > 0 && (
                  <div className="space-y-8">
                    {Array.from(new Set(recommendedServices.map(s => s.category))).map(category => (
                      <div key={category}>
                        <h4 className="text-lion-orange text-sm font-bold uppercase mb-4">{category}</h4>
                        <div className="grid md:grid-cols-2 gap-4">
                          {recommendedServices
                            .filter(s => s.category === category)
                            .map(service => {
                              const isSelected = selectedServices.some(s => s.id === service.id);
                              const quantity = selectedServices.find(s => s.id === service.id)?.quantity || 0;
                              return (
                                <div 
                                  key={service.id}
                                  className="bg-black/50 border border-white/10 hover:border-lion-orange/50 rounded-lg p-4 transition-all"
                                >
                                  <div className="flex justify-between items-start mb-3">
                                    <div className="flex-1">
                                      <h5 className="text-white font-semibold text-sm">{service.name}</h5>
                                      <p className="text-gray-500 text-xs mt-1">{service.description}</p>
                                      {(service as any).reasoning && (
                                        <p className="text-lion-orange text-xs mt-2 italic">{(service as any).reasoning}</p>
                                      )}
                                    </div>
                                    <button
                                      onClick={() => toggleServiceSelection(service)}
                                      className={`ml-2 p-2 rounded transition-colors flex-shrink-0 ${
                                        isSelected ? 'bg-lion-orange text-white' : 'bg-white/10 text-gray-400 hover:bg-lion-orange/50'
                                      }`}
                                    >
                                      {isSelected ? <Minus size={16} /> : <Plus size={16} />}
                                    </button>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-lion-orange font-bold">${service.price}</span>
                                    {isSelected && <span className="text-gray-400 text-xs">Qty: {quantity}</span>}
                                  </div>
                                </div>
                              );
                            })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Cart Summary */}
                {selectedServices.length > 0 && (
                  <div className="mt-8 bg-lion-orange/10 border border-lion-orange/30 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div>
                        <h4 className="text-white font-bold">Services Selected: {selectedServices.length}</h4>
                        <p className="text-gray-400 text-sm">{selectedServices.reduce((sum, s) => sum + s.quantity, 0)} total items</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 text-sm">Total Investment</p>
                        <p className="text-3xl font-bold text-lion-orange">${getTotalPrice().toLocaleString()}</p>
                      </div>
                    </div>
                    <Button variant="primary" className="w-full">Proceed to Checkout</Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
