import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Web Speech API wrapper hook.
 *
 * Handles the browser's SpeechRecognition lifecycle: permission request,
 * auto-restart on silence, manual stop, error states, and the visualizer
 * bar animation.
 *
 * Browser support: Chrome, Edge, Safari (latest). Firefox does NOT support.
 */

// Minimal types for SpeechRecognition (not in TS lib by default)
interface ISpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  start: () => void;
  stop: () => void;
  abort: () => void;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onstart: (() => void) | null;
  onend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: { new (): ISpeechRecognition };
    webkitSpeechRecognition?: { new (): ISpeechRecognition };
  }
}

export type MicState = 'idle' | 'requesting' | 'listening' | 'unsupported' | 'blocked' | 'network-error';

export interface UseSpeechRecognitionOpts {
  /** Called when finalized transcript text becomes available (appends). */
  onTranscript: (appendText: string, interimText: string) => void;
}

export function useSpeechRecognition({ onTranscript }: UseSpeechRecognitionOpts) {
  const [state, setState] = useState<MicState>('idle');
  const [bars, setBars] = useState<number[]>([4, 4, 4, 4, 4, 4, 4]);

  const recognitionRef = useRef<ISpeechRecognition | null>(null);
  const stopRequestedRef = useRef(false);
  const isListeningRef = useRef(false);
  const vizIntervalRef = useRef<number | null>(null);

  // Check support on mount
  useEffect(() => {
    const supported =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
    if (!supported) setState('unsupported');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopRequestedRef.current = true;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          /* ignore */
        }
      }
      if (vizIntervalRef.current !== null) {
        window.clearInterval(vizIntervalRef.current);
      }
    };
  }, []);

  const startViz = useCallback(() => {
    if (vizIntervalRef.current !== null) return;
    vizIntervalRef.current = window.setInterval(() => {
      setBars(Array.from({ length: 7 }, () => Math.random() * 22 + 3));
    }, 100);
  }, []);

  const stopViz = useCallback(() => {
    if (vizIntervalRef.current !== null) {
      window.clearInterval(vizIntervalRef.current);
      vizIntervalRef.current = null;
    }
    setBars([4, 4, 4, 4, 4, 4, 4]);
  }, []);

  const start = useCallback(async () => {
    if (state === 'unsupported') return;
    if (isListeningRef.current) return;

    setState('requesting');

    // Explicitly request mic permission first — some browsers won't surface
    // a clear permission prompt for SpeechRecognition alone.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((t) => t.stop());
    } catch {
      setState('blocked');
      return;
    }

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setState('unsupported');
      return;
    }

    const recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    let runningFinal = '';

    recognition.onresult = (e: any) => {
      let interim = '';
      let newFinal = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          newFinal += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      if (newFinal) {
        runningFinal += newFinal;
        onTranscript(newFinal, interim);
      } else {
        // Just interim updates — pass empty append, current interim
        onTranscript('', interim);
      }
    };

    recognition.onerror = (e: any) => {
      if (e.error === 'not-allowed') {
        setState('blocked');
        stopRequestedRef.current = true;
      } else if (e.error === 'network') {
        setState('network-error');
        stopRequestedRef.current = true;
      }
      // 'no-speech' and 'aborted' are normal — let auto-restart handle them
    };

    recognition.onstart = () => {
      isListeningRef.current = true;
      setState('listening');
      startViz();
    };

    recognition.onend = () => {
      // Auto-restart through silence — only stop if user requested
      if (!stopRequestedRef.current && isListeningRef.current) {
        try {
          window.setTimeout(() => {
            if (!stopRequestedRef.current && isListeningRef.current && recognitionRef.current) {
              try {
                recognitionRef.current.start();
              } catch {
                isListeningRef.current = false;
                setState('idle');
                stopViz();
              }
            }
          }, 200);
        } catch {
          isListeningRef.current = false;
          setState('idle');
          stopViz();
        }
      } else {
        isListeningRef.current = false;
        setState('idle');
        stopViz();
      }
    };

    recognitionRef.current = recognition;
    stopRequestedRef.current = false;

    try {
      recognition.start();
    } catch {
      isListeningRef.current = false;
      setState('idle');
      stopViz();
    }
  }, [onTranscript, startViz, stopViz, state]);

  const stop = useCallback(() => {
    stopRequestedRef.current = true;
    isListeningRef.current = false;
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {
        /* ignore */
      }
    }
    setState('idle');
    stopViz();
  }, [stopViz]);

  const toggle = useCallback(() => {
    if (isListeningRef.current) stop();
    else start();
  }, [start, stop]);

  return { state, bars, start, stop, toggle, isListening: state === 'listening' };
}
