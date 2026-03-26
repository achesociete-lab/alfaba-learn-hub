import { useCallback, useEffect, useRef, useState } from "react";

export function useArabicSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const arabicVoiceRef = useRef<SpeechSynthesisVoice | null>(null);

  // Load voices (they load async in most browsers)
  useEffect(() => {
    if (!window.speechSynthesis) return;

    const loadVoices = () => {
      const allVoices = window.speechSynthesis.getVoices();
      setVoices(allVoices);

      // Priority: exact ar-SA, then any ar-*, then fallback
      const arSA = allVoices.find((v) => v.lang === "ar-SA");
      const arAny = allVoices.find((v) => v.lang.startsWith("ar"));
      arabicVoiceRef.current = arSA || arAny || null;
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const speak = useCallback((text: string, rate = 0.7) => {
    if (!window.speechSynthesis || !text?.trim()) return;

    // Cancel any ongoing speech and wait a tick (fixes Chrome bug)
    window.speechSynthesis.cancel();

    // Small delay to let cancel take effect (Chrome needs this)
    setTimeout(() => {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "ar-SA";
      utterance.rate = rate;
      utterance.pitch = 1;
      utterance.volume = 1;

      if (arabicVoiceRef.current) {
        utterance.voice = arabicVoiceRef.current;
      }

      // Chrome pauses after 15s — resume workaround
      const resumeTimer = setInterval(() => {
        if (window.speechSynthesis.speaking) {
          window.speechSynthesis.pause();
          window.speechSynthesis.resume();
        } else {
          clearInterval(resumeTimer);
        }
      }, 10000);

      utterance.onend = () => clearInterval(resumeTimer);
      utterance.onerror = () => clearInterval(resumeTimer);

      window.speechSynthesis.speak(utterance);
    }, 50);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
  }, []);

  const isSupported = typeof window !== "undefined" && !!window.speechSynthesis;

  return { speak, stop, isSupported };
}
