"use client";

import { useCallback, useRef, useState, useEffect } from "react";

interface UseArabicAudioReturn {
  speak: (text: string, slow?: boolean) => void;
  stop: () => void;
  isPlaying: boolean;
}

declare global {
  interface Window {
    responsiveVoice?: {
      speak: (text: string, voice: string, params?: Record<string, unknown>) => void;
      cancel: () => void;
      isPlaying: () => boolean;
      voiceSupport: () => boolean;
    };
  }
}

export default function useArabicAudio(): UseArabicAudioReturn {
  const [isPlaying, setIsPlaying] = useState(false);
  const [rvLoaded, setRvLoaded] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load ResponsiveVoice script
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.responsiveVoice) {
      setRvLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://code.responsivevoice.org/responsivevoice.js?key=pVGMbarG";
    script.async = true;
    script.onload = () => {
      setTimeout(() => setRvLoaded(true), 500);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
    };
  }, []);

  const stop = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (window.responsiveVoice) {
      window.responsiveVoice.cancel();
    }
    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, []);

  const speakWithResponsiveVoice = useCallback(
    (text: string, slow: boolean): boolean => {
      if (!window.responsiveVoice || !rvLoaded) return false;

      try {
        window.responsiveVoice.speak(text, "Arabic Male", {
          pitch: 1,
          rate: slow ? 0.4 : 0.7,
          volume: 1,
          onstart: () => setIsPlaying(true),
          onend: () => setIsPlaying(false),
          onerror: () => setIsPlaying(false),
        });
        return true;
      } catch {
        return false;
      }
    },
    [rvLoaded]
  );

  const speakWithSpeechSynthesis = useCallback(
    (text: string, slow: boolean) => {
      if (!("speechSynthesis" in window)) {
        setIsPlaying(false);
        return;
      }

      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = slow ? 0.35 : 0.6;
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      const voices = window.speechSynthesis.getVoices();
      const arabicVoices = voices.filter((v) => v.lang.startsWith("ar"));

      if (arabicVoices.length > 0) {
        const googleVoice = arabicVoices.find((v) =>
          v.name.toLowerCase().includes("google")
        );
        const remoteVoice = arabicVoices.find((v) => !v.localService);
        utterance.voice = googleVoice || remoteVoice || arabicVoices[0];
      }

      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);

      window.speechSynthesis.speak(utterance);
    },
    []
  );

  const speak = useCallback(
    (text: string, slow: boolean = true) => {
      stop();

      const cleanText = text.trim();
      if (!cleanText) return;

      setIsPlaying(true);

      // Try ResponsiveVoice first (Arabic Fusha)
      const rvWorked = speakWithResponsiveVoice(cleanText, slow);

      // Fallback to SpeechSynthesis
      if (!rvWorked) {
        speakWithSpeechSynthesis(cleanText, slow);
      }
    },
    [stop, speakWithResponsiveVoice, speakWithSpeechSynthesis]
  );

  return { speak, stop, isPlaying };
}
