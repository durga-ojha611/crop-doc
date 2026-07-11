import { useState, useEffect, useCallback, useRef } from 'react';
import { Language } from '@/contexts/LanguageContext';

// Map app language codes to BCP 47 speech synthesis language codes
const LANGUAGE_VOICE_MAP: Record<Language, string[]> = {
  en: ['en-IN', 'en-US', 'en-GB', 'en'],
  hi: ['hi-IN', 'hi'],
  ta: ['ta-IN', 'ta'],
  te: ['te-IN', 'te'],
  kn: ['kn-IN', 'kn'],
  mr: ['mr-IN', 'mr'],
};

const PREMIUM_FEMALE_VOICES = [
  'Google UK English Female',
  'Google US English', // frequently female by default
  'Samantha', // macOS / iOS
  'Victoria', // macOS
  'Karen', // macOS
  'Tessa', // macOS
  'Microsoft Zira', // Windows
  'Microsoft Hazel', // Windows
  'Microsoft Zira Desktop', // Windows
  'Microsoft Hazel Desktop' // Windows
];

interface UseTextToSpeechOptions {
  language?: Language;
  rate?: number;
  pitch?: number;
}

export const useTextToSpeech = (options: UseTextToSpeechOptions = {}) => {
  const { language = 'en', rate = 0.95, pitch = 1.1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Check if TTS is supported
  useEffect(() => {
    setIsSupported('speechSynthesis' in window);
  }, []);

  // Load available voices
  useEffect(() => {
    if (!isSupported) return;

    const loadVoices = () => {
      const voices = speechSynthesis.getVoices();
      setAvailableVoices(voices);
      
      // Find best voice for current language
      const langCodes = LANGUAGE_VOICE_MAP[language] || ['en'];
      let bestVoice: SpeechSynthesisVoice | null = null;
      
      // 1. Try premium female voices first
      for (const langCode of langCodes) {
        bestVoice = voices.find(v => 
          v.lang.toLowerCase().startsWith(langCode.toLowerCase()) && 
          PREMIUM_FEMALE_VOICES.some(name => v.name.includes(name))
        ) || null;
        if (bestVoice) break;
      }

      // 2. Fallback to any voice with "female" in the name
      if (!bestVoice) {
        for (const langCode of langCodes) {
          bestVoice = voices.find(v => 
            v.lang.toLowerCase().startsWith(langCode.toLowerCase()) && 
            v.name.toLowerCase().includes('female')
          ) || null;
          if (bestVoice) break;
        }
      }

      // 3. Fallback to any available voice for the language
      if (!bestVoice) {
        for (const langCode of langCodes) {
          bestVoice = voices.find(v => 
            v.lang.toLowerCase().startsWith(langCode.toLowerCase())
          ) || null;
          if (bestVoice) break;
        }
      }
      
      setSelectedVoice(bestVoice || voices[0] || null);
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
    };
  }, [isSupported, language]);

  // Speak text
  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!isSupported) return;

    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = rate;
    utterance.pitch = pitch;
    
    if (selectedVoice) {
      utterance.voice = selectedVoice;
      utterance.lang = selectedVoice.lang;
    } else {
      // Fallback to language code if no voice found
      const langCodes = LANGUAGE_VOICE_MAP[language];
      utterance.lang = langCodes[0] || 'en-US';
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setIsPaused(false);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
      onEnd?.();
    };

    utterance.onerror = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };

    utteranceRef.current = utterance;
    speechSynthesis.speak(utterance);
  }, [isSupported, selectedVoice, language, rate, pitch]);

  // Speak multiple texts in sequence
  const speakSequence = useCallback((texts: string[], onComplete?: () => void) => {
    if (!isSupported || texts.length === 0) {
      onComplete?.();
      return;
    }

    let currentIndex = 0;

    const speakNext = () => {
      if (currentIndex >= texts.length) {
        onComplete?.();
        return;
      }

      speak(texts[currentIndex], () => {
        currentIndex++;
        // Small delay between sections
        setTimeout(speakNext, 300);
      });
    };

    speakNext();
  }, [isSupported, speak]);

  // Pause speech
  const pause = useCallback(() => {
    if (isSupported && isSpeaking) {
      speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [isSupported, isSpeaking]);

  // Resume speech
  const resume = useCallback(() => {
    if (isSupported && isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
    }
  }, [isSupported, isPaused]);

  // Stop/cancel speech
  const stop = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
      setIsPaused(false);
    }
  }, [isSupported]);

  // Toggle pause/resume
  const togglePause = useCallback(() => {
    if (isPaused) {
      resume();
    } else {
      pause();
    }
  }, [isPaused, pause, resume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isSupported) {
        speechSynthesis.cancel();
      }
    };
  }, [isSupported]);

  return {
    speak,
    speakSequence,
    pause,
    resume,
    stop,
    togglePause,
    isSpeaking,
    isPaused,
    isSupported,
    availableVoices,
    selectedVoice,
    setSelectedVoice,
  };
};
