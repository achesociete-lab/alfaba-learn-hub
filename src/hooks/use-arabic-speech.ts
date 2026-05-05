import { useCallback, useRef, useEffect } from "react";
import { getTeacherClipUrl, preloadTeacherClips } from "./use-teacher-audio-clips";
// Simple in-memory cache for audio blobs to avoid re-fetching
const audioCache = new Map<string, string>();

/**
 * Clean text before sending to TTS for smoother voice output.
 * NOTE: dashes are split BEFORE this cleanup runs (see splitIntoSegments),
 * so they never reach this function. We still strip them for safety.
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
  // Supprimer tirets isolés (sécurité — ils sont déjà splittés en amont)
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

/**
 * Split a lesson text into natural reading segments on dashes.
 * The teacher uses "-" in lessons to mark distinct chunks (mot, phrase, explication).
 * Each segment is read separately with a small pause in between, imitating
 * how the teacher reads aloud in class.
 */
function splitIntoSegments(rawText: string): string[] {
  if (!rawText) return [];
  return rawText
    .split(/\s*[-–—]\s*/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

// Pause between dash-separated segments (ms) — feels natural for classroom reading
const SEGMENT_PAUSE_MS = 750;

export function useArabicSpeech() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Preload teacher clips once
  useEffect(() => { preloadTeacherClips(); }, []);

  // Joue UN segment déjà nettoyé. Respecte l'AbortController fourni.
  const speakOne = useCallback(
    async (text: string, rate: number, voiceId: string | undefined, controller: AbortController) => {
      if (controller.signal.aborted) return;
      if (!text?.trim()) return;

      // Check for teacher recording first
      const teacherUrl = getTeacherClipUrl(text);
      if (teacherUrl) {
        const audio = new Audio(teacherUrl);
        audioRef.current = audio;
        const onAbort = () => { audio.pause(); };
        controller.signal.addEventListener("abort", onAbort, { once: true });
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

      // Check cache
      if (audioCache.has(cacheKey)) {
        const audio = new Audio(audioCache.get(cacheKey)!);
        audioRef.current = audio;
        const onAbort = () => { audio.pause(); };
        controller.signal.addEventListener("abort", onAbort, { once: true });
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
      let lastError: unknown = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        if (controller.signal.aborted) return;
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
            if (response.status >= 400 && response.status < 500 && response.status !== 429) break;
            await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
            continue;
          }

          const audioBlob = await response.blob();
          const audioUrl = URL.createObjectURL(audioBlob);
          audioCache.set(cacheKey, audioUrl);

          if (controller.signal.aborted) return;
          const audio = new Audio(audioUrl);
          audioRef.current = audio;
          const onAbort = () => { audio.pause(); };
          controller.signal.addEventListener("abort", onAbort, { once: true });
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

      console.error("ElevenLabs TTS failed after 3 retries:", lastError);
    },
    []
  );

  const speak = useCallback(
    async (rawText: string, rate = 0.8, voiceId?: string) => {
      if (!rawText?.trim()) return;

      // Stop any current playback
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      // Split by dashes — chaque "-" devient une pause naturelle entre segments
      const segments = splitIntoSegments(rawText)
        .map((seg) => cleanTextForTTS(seg))
        .filter((seg) => seg.length > 0);

      if (segments.length === 0) return;

      for (let i = 0; i < segments.length; i++) {
        if (controller.signal.aborted) return;
        await speakOne(segments[i], rate, voiceId, controller);

        // Pause entre segments — comme un professeur qui marque un temps en lisant
        if (i < segments.length - 1 && !controller.signal.aborted) {
          await new Promise<void>((resolve) => {
            const t = setTimeout(resolve, SEGMENT_PAUSE_MS);
            controller.signal.addEventListener(
              "abort",
              () => { clearTimeout(t); resolve(); },
              { once: true }
            );
          });
        }
      }
    },
    [speakOne]
  );

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
