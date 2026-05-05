// Tarteel-style real-time Quran recitation correction.
//
// While the student recites, we capture audio in chunks, send each cumulative
// audio blob to ElevenLabs STT (Arabic), then align the transcribed words
// against the expected verses and color each word in real time:
//   - green  = correctly recited
//   - red    = incorrect / mispronounced
//   - amber  = skipped
//   - blue   = next word to recite (pulses)
//   - muted  = pending (not yet reached)
//
// At the end the student sees a final score + per-verse breakdown and can
// optionally request a deep tajwid feedback from the existing
// `quran-evaluate` edge function.

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, RotateCcw, CheckCircle2, AlertCircle,
  Loader2, Sparkles, Volume2, BookOpen, Award,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  normalizeArabic, tokenizeArabic, alignWords, flattenVerses,
  type WordStatus, type FlatWord,
} from "@/utils/quran-word-matching";
import type { QuranVerse, SurahInfo } from "@/utils/quran-api";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface Props {
  surah: SurahInfo;
  verses: QuranVerse[]; // pre-loaded verses to recite (range chosen by parent)
  onClose?: () => void;
}

// Cadence (ms) at which we re-transcribe the cumulative audio.
const STT_INTERVAL_MS = 2500;
// Minimum bytes before sending to STT (avoids transcribing pure silence chunks).
const MIN_AUDIO_BYTES = 4000;
// Hard cap on a single live session. Beyond this the audio blob sent to STT
// becomes too large/slow and ElevenLabs latency degrades. The user can simply
// stop, score, and start a new session.
const MAX_SESSION_SECONDS = 180; // 3 minutes
// When the elapsed time crosses this many seconds we display a soft warning.
const WARN_SESSION_SECONDS = 150;

const QuranLiveRecitation = ({ surah, verses, onClose }: Props) => {
  const { user } = useAuth();
  const { speak, stop: stopSpeak } = useArabicSpeech();

  // Build flat word list across all selected verses
  const flatWords: FlatWord[] = useMemo(() => flattenVerses(verses), [verses]);
  const expectedWords = useMemo(() => flatWords.map((w) => w.text), [flatWords]);
  const totalWords = expectedWords.length;

  // Per-word status (drives the colored highlights)
  const [statuses, setStatuses] = useState<WordStatus[]>(() => expectedWords.map(() => "pending"));
  const [cursorIndex, setCursorIndex] = useState(0);
  const [transcription, setTranscription] = useState<string>("");

  // Recording / streaming state
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finalScore, setFinalScore] = useState<{ correct: number; errors: number; skipped: number; pct: number } | null>(null);
  const [savingResult, setSavingResult] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const intervalRef = useRef<number | null>(null);
  const elapsedTimerRef = useRef<number | null>(null);
  const sttInFlightRef = useRef<boolean>(false);
  const cursorElRef = useRef<HTMLSpanElement | null>(null);
  // Mount tracking + abort: prevents setState after unmount and cancels
  // in-flight STT requests when the user closes the panel mid-recitation.
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);
  // Mirror of `statuses` so we can compute the final score in `stop` without
  // having to put side-effects inside a setStatuses updater (anti-pattern).
  const statusesRef = useRef<WordStatus[]>(statuses);
  useEffect(() => { statusesRef.current = statuses; }, [statuses]);

  // Reset when verses change
  useEffect(() => {
    setStatuses(expectedWords.map(() => "pending"));
    setCursorIndex(0);
    setTranscription("");
    setElapsed(0);
    setFinalScore(null);
  }, [expectedWords]);

  // Auto-scroll to current word
  useEffect(() => {
    if (isRecording && cursorElRef.current) {
      cursorElRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [cursorIndex, isRecording]);

  // ── STT chunk processing ────────────────────────────────────────────────
  const processChunk = useCallback(async () => {
    if (sttInFlightRef.current) return;
    if (chunksRef.current.length === 0) return;
    if (!mountedRef.current) return;

    // Build cumulative blob (entire audio so far)
    const blob = new Blob(chunksRef.current, { type: chunksRef.current[0].type || "audio/webm" });
    if (blob.size < MIN_AUDIO_BYTES) return;

    sttInFlightRef.current = true;
    setIsProcessing(true);

    // Cancel any older in-flight request and arm a fresh AbortController
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const fd = new FormData();
      fd.append("file", blob, "live-recitation.webm");
      fd.append("language_code", "ara");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: fd,
          signal: controller.signal,
        },
      );

      if (!mountedRef.current) return;
      if (!res.ok) throw new Error("STT failed");
      const data = await res.json();
      if (!mountedRef.current) return;
      const txt: string = data.text || "";

      const transcribedWords = tokenizeArabic(txt);
      const aligned = alignWords(expectedWords, transcribedWords);

      setStatuses(aligned.statuses);
      setCursorIndex(aligned.cursorIndex);
      setTranscription(txt);
    } catch (err: any) {
      if (err?.name === "AbortError") return; // expected on cleanup
      // Silent: chunks fail occasionally, next one will succeed
      console.warn("STT chunk error", err);
    } finally {
      sttInFlightRef.current = false;
      if (mountedRef.current) setIsProcessing(false);
    }
  }, [expectedWords]);

  // ── Start recording ─────────────────────────────────────────────────────
  const start = useCallback(async () => {
    try {
      stopSpeak();
      setStatuses(expectedWords.map(() => "pending"));
      setCursorIndex(0);
      setFinalScore(null);
      setElapsed(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const candidates = [
        "audio/webm;codecs=opus",
        "audio/webm",
        "audio/mp4;codecs=mp4a.40.2",
        "audio/mp4",
      ];
      let mimeType: string | undefined;
      for (const c of candidates) {
        if (typeof MediaRecorder !== "undefined" && (MediaRecorder as any).isTypeSupported?.(c)) {
          mimeType = c;
          break;
        }
      }

      const mr = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Request a chunk every STT_INTERVAL_MS
      mr.start(STT_INTERVAL_MS);
      setIsRecording(true);

      // Periodic STT
      intervalRef.current = window.setInterval(() => {
        void processChunk();
      }, STT_INTERVAL_MS);

      // Elapsed counter — also enforces hard cap to keep audio blob bounded
      const startedAt = Date.now();
      let warnedAtSoftLimit = false;
      elapsedTimerRef.current = window.setInterval(() => {
        const e = Math.floor((Date.now() - startedAt) / 1000);
        setElapsed(e);
        if (!warnedAtSoftLimit && e >= WARN_SESSION_SECONDS) {
          warnedAtSoftLimit = true;
          toast("La session live se terminera automatiquement à 3 minutes.", { duration: 4000 });
        }
        if (e >= MAX_SESSION_SECONDS) {
          toast.success("Limite de 3 min atteinte — calcul du score…");
          void stopRef.current?.();
        }
      }, 500);
    } catch (err: any) {
      toast.error("Impossible d'accéder au micro: " + (err?.message ?? "permission refusée"));
    }
  }, [expectedWords, processChunk, stopSpeak]);

  // Forward-ref so the elapsed-timer auto-stop can call stop() without a
  // circular useCallback dependency.
  const stopRef = useRef<(() => Promise<void>) | null>(null);

  // ── Stop recording + final scoring ──────────────────────────────────────
  const stop = useCallback(async () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (elapsedTimerRef.current) { clearInterval(elapsedTimerRef.current); elapsedTimerRef.current = null; }

    try { mediaRecorderRef.current?.stop(); } catch { /* noop */ }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setIsRecording(false);

    // One last STT pass to catch the final bit
    await new Promise((r) => setTimeout(r, 600));
    await processChunk();

    if (!mountedRef.current) return;

    // Compute final score from the up-to-date ref (avoids putting side
    // effects inside a setState updater)
    const current = statusesRef.current;
    const correct = current.filter((s) => s === "correct").length;
    const errors = current.filter((s) => s === "incorrect").length;
    const skipped = current.filter((s) => s === "skipped").length;
    const pct = totalWords > 0 ? Math.round((correct / totalWords) * 100) : 0;

    setFinalScore({ correct, errors, skipped, pct });

    // Persist to DB (best-effort, fire-and-forget)
    if (user && totalWords > 0) {
      setSavingResult(true);
      try {
        await supabase.from("quran_recitations").insert({
          user_id: user.id,
          surah_number: surah.number,
          ayah_start: verses[0]?.number ?? 1,
          ayah_end: verses[verses.length - 1]?.number ?? 1,
          score: pct,
          notes: `Live: ${correct}/${totalWords} mots corrects, ${errors} erreurs, ${skipped} sautés`,
          mode: "live",
        });
      } catch { /* swallow — non-critical */ }
      if (mountedRef.current) setSavingResult(false);
    }
  }, [processChunk, surah.number, totalWords, user, verses]);

  // Keep the ref in sync so elapsed-timer auto-stop can call stop() safely
  useEffect(() => { stopRef.current = stop; }, [stop]);

  const reset = useCallback(() => {
    setStatuses(expectedWords.map(() => "pending"));
    setCursorIndex(0);
    setTranscription("");
    setElapsed(0);
    setFinalScore(null);
  }, [expectedWords]);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (elapsedTimerRef.current) clearInterval(elapsedTimerRef.current);
      abortControllerRef.current?.abort();
      streamRef.current?.getTracks().forEach((t) => t.stop());
      try { mediaRecorderRef.current?.stop(); } catch { /* noop */ }
    };
  }, []);

  // ── Live counters (re-derived from statuses) ────────────────────────────
  const liveCorrect = statuses.filter((s) => s === "correct").length;
  const liveErrors = statuses.filter((s) => s === "incorrect").length;
  const liveSkipped = statuses.filter((s) => s === "skipped").length;
  const livePct = totalWords > 0 ? Math.round((liveCorrect / totalWords) * 100) : 0;

  // ── Verse rendering: one verse per row, words highlighted ───────────────
  const wordsByVerse = useMemo(() => {
    const map = new Map<number, FlatWord[]>();
    flatWords.forEach((w) => {
      if (!map.has(w.verseNumber)) map.set(w.verseNumber, []);
      map.get(w.verseNumber)!.push(w);
    });
    return map;
  }, [flatWords]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-gold" />
            Lecture interactive — temps réel
          </h3>
          <p className="text-xs text-muted-foreground">
            Sourate <span className="font-arabic">{surah.nameArabic}</span> · versets {verses[0]?.number}–{verses[verses.length - 1]?.number} · {totalWords} mots
          </p>
        </div>
        {onClose && (
          <Button variant="ghost" size="sm" onClick={onClose}>Fermer</Button>
        )}
      </div>

      {/* Live counters */}
      <div className="grid grid-cols-4 gap-2">
        <div className="p-3 rounded-xl border border-border bg-card text-center">
          <div className="text-2xl font-bold text-emerald-600">{liveCorrect}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Corrects</div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card text-center">
          <div className="text-2xl font-bold text-red-600">{liveErrors}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Erreurs</div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card text-center">
          <div className="text-2xl font-bold text-amber-500">{liveSkipped}</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Sautés</div>
        </div>
        <div className="p-3 rounded-xl border border-border bg-card text-center">
          <div className="text-2xl font-bold text-foreground">{livePct}%</div>
          <div className="text-[10px] text-muted-foreground uppercase tracking-wide">Score</div>
        </div>
      </div>

      <Progress value={(cursorIndex / Math.max(1, totalWords)) * 100} className="h-1.5" />

      {/* Verses with word-level highlighting */}
      <div
        className="p-5 sm:p-6 rounded-2xl border border-border bg-card max-h-[55vh] overflow-y-auto"
        dir="rtl"
        lang="ar"
      >
        {verses.map((v) => {
          const verseWords = wordsByVerse.get(v.number) ?? [];
          return (
            <div key={v.number} className="mb-5 leading-loose">
              <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-primary/10 text-primary text-xs font-bold ms-2 align-middle">
                {v.number}
              </span>
              {verseWords.map((w) => {
                const status = statuses[w.globalIndex];
                const isCurrent = isRecording && w.globalIndex === cursorIndex;

                let bg = "transparent";
                let color = "inherit";
                if (status === "correct") { bg = "rgba(16,185,129,0.15)"; color = "rgb(5,150,105)"; }
                else if (status === "incorrect") { bg = "rgba(239,68,68,0.18)"; color = "rgb(220,38,38)"; }
                else if (status === "skipped") { bg = "rgba(245,158,11,0.18)"; color = "rgb(217,119,6)"; }
                else if (isCurrent) { bg = "rgba(59,130,246,0.18)"; color = "rgb(37,99,235)"; }

                return (
                  <motion.span
                    key={w.globalIndex}
                    ref={isCurrent ? cursorElRef : undefined}
                    initial={false}
                    animate={{ backgroundColor: bg, color }}
                    transition={{ duration: 0.25 }}
                    className={`font-arabic text-2xl sm:text-3xl px-1.5 py-0.5 rounded-md mx-0.5 inline-block ${
                      isCurrent ? "ring-2 ring-blue-400/60 animate-pulse" : ""
                    } ${status === "incorrect" ? "underline decoration-wavy decoration-red-500" : ""}`}
                  >
                    {w.text}
                  </motion.span>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Transcription preview (debug help — kept subtle) */}
      {transcription && isRecording && (
        <div className="text-xs text-muted-foreground p-2 rounded-lg bg-muted/50 truncate" dir="rtl">
          <span className="me-2 text-[10px] uppercase">Vous dites :</span>
          {transcription}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col items-center gap-3">
        {!isRecording && !finalScore && (
          <Button
            onClick={start}
            size="lg"
            className="h-20 w-20 rounded-full gradient-emerald border-0 text-primary-foreground shadow-xl"
          >
            <Mic className="h-9 w-9" />
          </Button>
        )}

        {isRecording && (
          <div className="flex flex-col items-center gap-2">
            <Button
              onClick={stop}
              size="lg"
              className="h-20 w-20 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-xl"
            >
              <Square className="h-8 w-8" />
            </Button>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="inline-block h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              <span className={elapsed >= WARN_SESSION_SECONDS ? "text-amber-600 font-semibold" : ""}>
                {Math.floor(elapsed / 60).toString().padStart(2, "0")}:{(elapsed % 60).toString().padStart(2, "0")}
                <span className="text-[10px] opacity-60"> / 03:00</span>
              </span>
              {isProcessing && <Loader2 className="h-3 w-3 animate-spin ms-1" />}
              <span className="text-xs">Mot {Math.min(cursorIndex + 1, totalWords)}/{totalWords}</span>
            </div>
          </div>
        )}

        {!isRecording && (
          <p className="text-sm text-muted-foreground text-center max-w-md">
            {finalScore
              ? "Récitation terminée. Cliquez ci-dessous pour réessayer ou changer de passage."
              : "Appuyez sur le micro et commencez à réciter. Les mots seront corrigés en temps réel."}
          </p>
        )}
      </div>

      {/* Final score modal */}
      <AnimatePresence>
        {finalScore && !isRecording && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-5 rounded-2xl border-2 border-primary/30 bg-primary/5 space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h4 className="font-bold text-foreground">
                  Score final : {finalScore.pct}%
                </h4>
                <p className="text-xs text-muted-foreground">
                  {finalScore.correct} corrects · {finalScore.errors} erreurs · {finalScore.skipped} sautés sur {totalWords} mots
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={reset} variant="outline" size="sm" className="gap-2">
                <RotateCcw className="h-4 w-4" /> Réessayer
              </Button>
              <Button
                onClick={start}
                size="sm"
                className="gap-2 gradient-emerald border-0 text-primary-foreground"
              >
                <Mic className="h-4 w-4" /> Reprendre
              </Button>
              {savingResult && <span className="text-xs text-muted-foreground self-center">Enregistrement…</span>}
            </div>

            {/* Per-verse breakdown */}
            <div className="border-t border-border pt-3 space-y-1.5">
              {verses.map((v) => {
                const verseWords = wordsByVerse.get(v.number) ?? [];
                const ok = verseWords.filter((w) => statuses[w.globalIndex] === "correct").length;
                const total = verseWords.length;
                const pct = total > 0 ? Math.round((ok / total) * 100) : 0;
                return (
                  <div key={v.number} className="flex items-center gap-2 text-xs">
                    <span className="text-muted-foreground w-12">Verset {v.number}</span>
                    <Progress value={pct} className="h-1.5 flex-1" />
                    <span className="text-muted-foreground w-12 text-right">{ok}/{total}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground justify-center pt-1">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-emerald-500/30" />Correct
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-red-500/30" />Erreur
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-amber-500/30" />Sauté
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-blue-500/30" />En cours
        </span>
      </div>
    </div>
  );
};

export default QuranLiveRecitation;
