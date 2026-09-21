import { useCallback, useRef, useEffect } from "react";
import { getTeacherClipUrl, preloadTeacherClips } from "./use-teacher-audio-clips";

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
    async (text: string, rate: number, _voiceId: string | undefined, controller: AbortController) => {
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

      // Web Speech API directement (gratuit, voix arabe système)
      try {
        await speakWithBrowser(text, rate, controller.signal);
      } catch (e) {
        console.error("Web Speech API failed:", e);
      }
    },
    []
  );

  // Fallback : Web Speech API avec voix arabe
  function speakWithBrowser(text: string, rate: number, signal: AbortSignal): Promise<void> {
    return new Promise((resolve) => {
      if (!window.speechSynthesis) { resolve(); return; }
      window.speechSynthesis.cancel();
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "ar-SA";
      utt.rate = Math.min(rate * 1.1, 1.0);
      // Préférer une voix arabe si disponible
      const voices = window.speechSynthesis.getVoices();
      const arVoice = voices.find(v => v.lang.startsWith("ar")) ?? null;
      if (arVoice) utt.voice = arVoice;
      utt.onend = () => resolve();
      utt.onerror = () => resolve();
      const onAbort = () => { window.speechSynthesis.cancel(); resolve(); };
      signal.addEventListener("abort", onAbort, { once: true });
      window.speechSynthesis.speak(utt);
    });
  }

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
