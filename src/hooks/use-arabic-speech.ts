import { useCallback, useRef } from "react";

// Simple in-memory cache for audio blobs to avoid re-fetching
const audioCache = new Map<string, string>();

export function useArabicSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const speak = useCallback(async (text: string, rate = 0.8, voiceId?: string) => {
    if (!text?.trim()) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const cacheKey = `${text}_${rate}_${voiceId || "default"}`;

    // Check cache first
    if (audioCache.has(cacheKey)) {
      const audio = new Audio(audioCache.get(cacheKey)!);
      audioRef.current = audio;
      try {
        await audio.play();
      } catch (e) {
        console.warn("Audio playback failed:", e);
      }
      return;
    }

    // Fetch from ElevenLabs edge function
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-tts`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({ text, rate, voiceId }),
          signal: controller.signal,
        }
      );

      if (!response.ok) {
        // Fallback to Web Speech API
        console.warn("ElevenLabs TTS failed, falling back to Web Speech API");
        fallbackSpeak(text, rate);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the URL
      audioCache.set(cacheKey, audioUrl);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      console.warn("ElevenLabs TTS error, falling back:", e);
      fallbackSpeak(text, rate);
    }
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
    window.speechSynthesis?.cancel();
  }, []);

  const isSupported = true; // Always supported via edge function

  return { speak, stop, isSupported };
}

// Fallback using browser Web Speech API
function fallbackSpeak(text: string, rate: number) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "ar-SA";
  utterance.rate = rate;
  const voices = window.speechSynthesis.getVoices();
  const arVoice = voices.find((v) => v.lang === "ar-SA") || voices.find((v) => v.lang.startsWith("ar"));
  if (arVoice) utterance.voice = arVoice;
  window.speechSynthesis.speak(utterance);
}
