import { useCallback, useRef, useEffect } from "react";
import { getTeacherClipUrl, preloadTeacherClips } from "./use-teacher-audio-clips";
// Simple in-memory cache for audio blobs to avoid re-fetching
const audioCache = new Map<string, string>();
let isElevenLabsUnavailable = false;

type TtsErrorPayload = {
  error?: string;
  code?: string;
};

/**
 * Clean text before sending to TTS for smoother voice output.
 * - Remove parenthesized content
 * - Strip standalone dashes / brackets / special markers
 * - Replace commas/semicolons with natural pause
 * - Drop emoji & special symbols, keep Arabic + Latin + basic punctuation
 */
export function cleanTextForTTS(text: string): string {
  if (!text) return "";
  let t = text;
  t = t.replace(/\([^)]*\)/g, " ");
  t = t.replace(/\[[^\]]*\]/g, " ");
  t = t.replace(/\{[^}]*\}/g, " ");
  t = t.replace(/[*_`#>~]/g, " ");
  t = t.replace(/(^|\s)[-–—•](\s|$)/g, " ");
  t = t.replace(/[,،؛;]/g, " , ");
  t = t.replace(/[^\p{L}\p{N}\s.,!?؟،؛:'"\u0600-\u06FF\u0750-\u077F]/gu, " ");
  t = t.replace(/\s+/g, " ").trim();
  return t;
}

export function useArabicSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Preload teacher clips once
  useEffect(() => { preloadTeacherClips(); }, []);

  const speak = useCallback(async (rawText: string, rate = 0.8, voiceId?: string) => {
    const text = cleanTextForTTS(rawText);
    if (!text?.trim()) return;

    // Stop any current playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }

    // Check for teacher recording first
    const teacherUrl = getTeacherClipUrl(text);
    if (teacherUrl) {
      const audio = new Audio(teacherUrl);
      audioRef.current = audio;
      try {
        await audio.play();
        await new Promise<void>((resolve) => {
          audio.addEventListener("ended", () => resolve(), { once: true });
          audio.addEventListener("error", () => resolve(), { once: true });
        });
      } catch (e) {
        console.warn("Teacher clip playback failed:", e);
      }
      return;
    }

    const cacheKey = `${text}_${rate}_${voiceId || "default"}`;

    if (isElevenLabsUnavailable) {
      fallbackSpeak(text, rate);
      return;
    }

    // Check cache first
    if (audioCache.has(cacheKey)) {
      const audio = new Audio(audioCache.get(cacheKey)!);
      audioRef.current = audio;
      try {
        await audio.play();
        await new Promise<void>((resolve) => {
          audio.addEventListener("ended", () => resolve(), { once: true });
          audio.addEventListener("error", () => resolve(), { once: true });
        });
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
        let errorPayload: TtsErrorPayload | null = null;

        try {
          errorPayload = (await response.json()) as TtsErrorPayload;
        } catch {
          errorPayload = null;
        }

        if (
          response.status === 401 ||
          errorPayload?.code === "provider_auth_error" ||
          errorPayload?.code === "provider_unavailable"
        ) {
          isElevenLabsUnavailable = true;
        }

        // Fallback to Web Speech API
        console.warn("ElevenLabs TTS failed, falling back to Web Speech API", {
          status: response.status,
          error: errorPayload?.error,
          code: errorPayload?.code,
        });
        await fallbackSpeak(text, rate);
        return;
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      // Cache the URL
      audioCache.set(cacheKey, audioUrl);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;
      await audio.play();
      await new Promise<void>((resolve) => {
        audio.addEventListener("ended", () => resolve(), { once: true });
        audio.addEventListener("error", () => resolve(), { once: true });
      });
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return;
      isElevenLabsUnavailable = true;
      console.warn("ElevenLabs TTS error, falling back:", e);
      await fallbackSpeak(text, rate);
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
function fallbackSpeak(text: string, rate: number): Promise<void> {
  return new Promise((resolve) => {
    if (!window.speechSynthesis) { resolve(); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ar-SA";
    utterance.rate = rate;
    const voices = window.speechSynthesis.getVoices();
    const arVoice = voices.find((v) => v.lang === "ar-SA") || voices.find((v) => v.lang.startsWith("ar"));
    if (arVoice) utterance.voice = arVoice;
    utterance.onend = () => resolve();
    utterance.onerror = () => resolve();
    window.speechSynthesis.speak(utterance);
  });
}
