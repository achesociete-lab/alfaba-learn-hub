import { useCallback, useRef, useEffect } from "react";
import { getTeacherClipUrl, preloadTeacherClips } from "./use-teacher-audio-clips";
// Simple in-memory cache for audio blobs to avoid re-fetching
const audioCache = new Map<string, string>();

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
  // Supprimer parenthèses/crochets/accolades et leur contenu
  t = t.replace(/\([^)]*\)/g, " ");
  t = t.replace(/\[[^\]]*\]/g, " ");
  t = t.replace(/\{[^}]*\}/g, " ");
  // Supprimer marqueurs markdown
  t = t.replace(/[*_`#>~]/g, " ");
  // Supprimer tirets isolés
  t = t.replace(/(^|\s)[-–—•](\s|$)/g, " ");
  // Remplacer guillemets par rien (pas de lecture)
  t = t.replace(/["'«»“”‘’]/g, " ");
  // Remplacer virgules / points-virgules par une pause naturelle
  t = t.replace(/[,،؛;]/g, " , ");
  // Conserver lettres, chiffres, ponctuation utile et arabe (avec tashkeel/harakat)
  t = t.replace(/[^\p{L}\p{N}\s.,!?؟،؛:\u0600-\u06FF\u0750-\u077F]/gu, " ");
  // ⚠️ Pas de translittération : l'arabe est envoyé tel quel à ElevenLabs
  // (avec ses harakat) pour la voix clonée du professeur.
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

    // Fetch from ElevenLabs edge function with retry (3 attempts, exp backoff)
    const controller = new AbortController();
    abortRef.current = controller;

    let lastError: unknown = null;
    for (let attempt = 0; attempt < 3; attempt++) {
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
          lastError = new Error(`TTS HTTP ${response.status}`);
          if (response.status >= 400 && response.status < 500 && response.status !== 429) {
            // Client error non-retriable
            break;
          }
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);
        audioCache.set(cacheKey, audioUrl);

        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        await audio.play();
        await new Promise<void>((resolve) => {
          audio.addEventListener("ended", () => resolve(), { once: true });
          audio.addEventListener("error", () => resolve(), { once: true });
        });
        return;
      } catch (e: unknown) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        lastError = e;
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
      }
    }

    // After all retries: silent failure (no Web Speech fallback)
    console.error("ElevenLabs TTS failed after 3 retries:", lastError);
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (abortRef.current) {
      abortRef.current.abort();
    }
  }, []);

  const isSupported = true;

  return { speak, stop, isSupported };
}
