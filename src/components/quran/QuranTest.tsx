import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, RotateCcw, ChevronRight, Volume2, BookOpen,
  GraduationCap, Loader2, AlertCircle, CheckCircle2, XCircle, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  fetchSurahList, fetchSurahVerses,
  type QuranVerse, type SurahInfo,
} from "@/utils/quran-api";
import { evaluateRecitationLocally, type AiFeedback } from "@/utils/quran-recitation-evaluator";

type TestStep = "select" | "recite" | "evaluating" | "result";

interface Props {
  allSurahs: SurahInfo[];
}

const QuranTest = ({ allSurahs }: Props) => {
  const [step, setStep] = useState<TestStep>("select");

  // Selection
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const [ayahStart, setAyahStart] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(7);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loadingVerses, setLoadingVerses] = useState(false);
  const [showVerses, setShowVerses] = useState(true);

  // Recording & evaluation
  const recorder = useAudioRecorder();
  const { speak, stop } = useArabicSpeech();
  const [feedback, setFeedback] = useState<AiFeedback | null>(null);
  const [evaluating, setEvaluating] = useState(false);
  const [speakingFeedback, setSpeakingFeedback] = useState(false);

  // Load verses when surah changes
  useEffect(() => {
    if (!selectedSurah) return;
    setLoadingVerses(true);
    fetchSurahVerses(selectedSurah.number)
      .then((v) => {
        setVerses(v);
        setAyahStart(1);
        setAyahEnd(Math.min(7, v.length));
      })
      .catch(() => toast.error("Erreur lors du chargement des versets"))
      .finally(() => setLoadingVerses(false));
  }, [selectedSurah]);

  const selectedVerses = verses.filter(
    (v) => v.number >= ayahStart && v.number <= ayahEnd
  );

  const expectedText = selectedVerses.map((v) => v.arabic).join(" ");

  const startTest = () => {
    if (!selectedSurah || selectedVerses.length === 0) {
      toast.error("Sélectionnez une sourate et les versets");
      return;
    }
    setFeedback(null);
    recorder.reset();
    setStep("recite");
  };

  const submitRecording = useCallback(async () => {
    if (!recorder.audioBlob || !selectedSurah) return;
    setStep("evaluating");
    setEvaluating(true);

    try {
      // 1. Transcribe via ElevenLabs STT
      const formData = new FormData();
      formData.append("file", recorder.audioBlob, "recitation.webm");
      formData.append("language_code", "ara");

      const sttResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
        {
          method: "POST",
          headers: {
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: formData,
        }
      );

      if (!sttResponse.ok) throw new Error("Erreur de transcription");
      const sttData = await sttResponse.json();
      const transcription = sttData.text || "";

      if (!transcription.trim()) {
        toast.error("Aucun texte détecté. Parlez plus fort et réessayez.");
        setStep("recite");
        setEvaluating(false);
        return;
      }

      // 2. Evaluate via AI edge function, fallback to local
      let evaluation: AiFeedback;
      try {
        const evalResponse = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/quran-evaluate`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
            body: JSON.stringify({
              transcription,
              expectedText,
              surahNumber: selectedSurah.number,
              ayahStart,
              ayahEnd,
            }),
          }
        );

        if (!evalResponse.ok) throw new Error("AI eval failed");
        evaluation = await evalResponse.json();
        if ((evaluation as any).error) throw new Error("AI returned error");
      } catch {
        // Fallback to local evaluation
        evaluation = evaluateRecitationLocally(expectedText, transcription);
      }

      setFeedback(evaluation);
      setStep("result");
    } catch (e: any) {
      console.error("Test evaluation error:", e);
      toast.error(e.message || "Erreur lors de l'évaluation");
      setStep("recite");
    } finally {
      setEvaluating(false);
    }
  }, [recorder.audioBlob, selectedSurah, expectedText, ayahStart, ayahEnd]);

  const resetTest = () => {
    stop();
    setStep("select");
    setFeedback(null);
    recorder.reset();
    setSpeakingFeedback(false);
  };

  // Build oral feedback text and speak it
  const speakFeedback = useCallback(async (fb: AiFeedback) => {
    if (speakingFeedback) {
      stop();
      setSpeakingFeedback(false);
      return;
    }
    setSpeakingFeedback(true);
    const parts: string[] = [];
    parts.push(fb.overallFeedback);
    if (fb.errors.length > 0) {
      parts.push(`Il y a ${fb.errors.length} point${fb.errors.length > 1 ? "s" : ""} à corriger.`);
      fb.errors.slice(0, 5).forEach((err) => {
        parts.push(err.correction);
      });
    }
    if (fb.tajwidNotes.length > 0) {
      fb.tajwidNotes.forEach((n) => parts.push(n));
    }
    if (fb.encouragement) parts.push(fb.encouragement);
    const fullText = parts.join(". ");

    try {
      await speak(fullText, 0.9);
    } catch {
      // ignore
    }
    setSpeakingFeedback(false);
  }, [speak, stop, speakingFeedback]);

  // Auto-play oral feedback when results appear
  useEffect(() => {
    if (step === "result" && feedback && !speakingFeedback) {
      const timer = setTimeout(() => speakFeedback(feedback), 600);
      return () => clearTimeout(timer);
    }
  }, [step, feedback]); // eslint-disable-line react-hooks/exhaustive-deps

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getErrorIcon = (type: string) => {
    switch (type) {
      case "missing": return <XCircle className="h-3.5 w-3.5 text-red-500" />;
      case "added": return <Info className="h-3.5 w-3.5 text-yellow-500" />;
      case "mispronounced": return <AlertCircle className="h-3.5 w-3.5 text-orange-500" />;
      default: return <Info className="h-3.5 w-3.5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* ===== STEP 1: Selection ===== */}
      {step === "select" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-2 mb-4">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h3 className="text-base font-bold text-foreground">Test de récitation</h3>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              Choisissez la sourate et les versets sur lesquels vous souhaitez être testé.
              Le professeur virtuel écoutera votre récitation et vous donnera une correction détaillée.
            </p>

            <div className="space-y-4">
              {/* Surah selection */}
              <div>
                <label className="text-xs font-medium text-muted-foreground mb-1 block">Sourate</label>
                <Select
                  value={selectedSurah ? String(selectedSurah.number) : ""}
                  onValueChange={(v) => {
                    const s = allSurahs.find((s) => s.number === Number(v));
                    if (s) setSelectedSurah(s);
                  }}
                >
                  <SelectTrigger><SelectValue placeholder="Choisir une sourate" /></SelectTrigger>
                  <SelectContent className="max-h-60">
                    {allSurahs.map((s) => (
                      <SelectItem key={s.number} value={String(s.number)}>
                        <span className="mr-2">{s.number}.</span>
                        <span>{s.name}</span>
                        <span className="font-arabic ml-2 text-muted-foreground">{s.nameArabic}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Verse range */}
              {selectedSurah && !loadingVerses && verses.length > 0 && (
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Du verset</label>
                    <Select value={String(ayahStart)} onValueChange={(v) => setAyahStart(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {verses.map((v) => (
                          <SelectItem key={v.number} value={String(v.number)}>{v.number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs font-medium text-muted-foreground mb-1 block">Au verset</label>
                    <Select value={String(ayahEnd)} onValueChange={(v) => setAyahEnd(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent className="max-h-48">
                        {verses.filter((v) => v.number >= ayahStart).map((v) => (
                          <SelectItem key={v.number} value={String(v.number)}>{v.number}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {loadingVerses && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              )}

              {/* Preview verses */}
              {selectedVerses.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">
                      {selectedVerses.length} verset{selectedVerses.length > 1 ? "s" : ""} sélectionné{selectedVerses.length > 1 ? "s" : ""}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowVerses(!showVerses)}
                      className="text-xs gap-1"
                    >
                      {showVerses ? "Masquer" : "Afficher"}
                    </Button>
                  </div>
                  {showVerses && (
                    <div className="p-3 rounded-lg bg-muted space-y-1 max-h-48 overflow-y-auto">
                      {selectedVerses.map((v) => (
                        <div key={v.number} className="flex items-start gap-2">
                          <span className="text-xs text-muted-foreground mt-1 shrink-0">{v.number}</span>
                          <button
                            onClick={() => speak(v.arabic)}
                            className="font-arabic text-base text-right leading-loose text-foreground hover:text-primary transition-colors w-full"
                            dir="rtl"
                          >
                            {v.arabic}
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              <Button
                onClick={startTest}
                disabled={!selectedSurah || selectedVerses.length === 0}
                size="lg"
                className="w-full gap-2"
              >
                <GraduationCap className="h-5 w-5" /> Commencer le test
              </Button>
            </div>
          </div>
        </motion.div>
      )}

      {/* ===== STEP 2: Recording ===== */}
      {step === "recite" && selectedSurah && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          <div className="p-5 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-foreground">
                {selectedSurah.name} <span className="font-arabic">{selectedSurah.nameArabic}</span>
              </h3>
              <span className="text-xs text-muted-foreground">
                Versets {ayahStart} - {ayahEnd}
              </span>
            </div>

            <p className="text-sm text-muted-foreground mb-4">
              Récitez les versets sélectionnés. Le professeur virtuel écoutera et évaluera votre récitation.
            </p>

            {/* Show verses for reference */}
            <div className="p-3 rounded-lg bg-muted mb-4 max-h-40 overflow-y-auto">
              {selectedVerses.map((v) => (
                <div key={v.number} className="flex items-start gap-2 py-0.5">
                  <span className="text-xs text-muted-foreground mt-1 shrink-0">{v.number}</span>
                  <p className="font-arabic text-base text-right leading-loose text-foreground w-full" dir="rtl">
                    {v.arabic}
                  </p>
                </div>
              ))}
            </div>

            {/* Recording controls */}
            <div className="text-center space-y-4">
              {!recorder.isRecording && !recorder.audioUrl && (
                <Button onClick={recorder.startRecording} size="lg" className="gap-2 px-8">
                  <Mic className="h-5 w-5" /> Commencer la récitation
                </Button>
              )}

              {recorder.isRecording && (
                <div className="space-y-3">
                  <div className="flex items-center justify-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full bg-destructive animate-pulse" />
                      <span className="text-lg font-mono text-foreground">
                        {Math.floor(recorder.duration / 60)}:{String(recorder.duration % 60).padStart(2, "0")}
                      </span>
                    </div>
                    <Button onClick={recorder.stopRecording} variant="destructive" size="lg" className="gap-2">
                      <Square className="h-5 w-5" /> Arrêter
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground animate-pulse">Récitez les versets...</p>
                </div>
              )}

              {recorder.audioUrl && !recorder.isRecording && (
                <div className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Réécouter votre récitation :</p>
                    <audio src={recorder.audioUrl} controls className="w-full max-w-md mx-auto h-10" />
                  </div>
                  <div className="flex items-center justify-center gap-3">
                    <Button onClick={() => recorder.reset()} variant="outline" className="gap-2">
                      <RotateCcw className="h-4 w-4" /> Recommencer
                    </Button>
                    <Button onClick={submitRecording} className="gap-2">
                      <GraduationCap className="h-4 w-4" /> Soumettre au professeur
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Button variant="ghost" onClick={resetTest} className="text-muted-foreground">
            ← Retour à la sélection
          </Button>
        </motion.div>
      )}

      {/* ===== STEP 3: Evaluating ===== */}
      {step === "evaluating" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-8 rounded-xl border border-border bg-card text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <h3 className="text-base font-bold text-foreground mb-2">Le professeur écoute...</h3>
          <p className="text-sm text-muted-foreground">Transcription et évaluation en cours, veuillez patienter.</p>
        </motion.div>
      )}

      {/* ===== STEP 4: Results ===== */}
      {step === "result" && feedback && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
          {/* Score card */}
          <div className="p-5 rounded-xl border border-border bg-card text-center">
            <h3 className="text-base font-bold text-foreground mb-4">Résultat du test</h3>
            <div className={`text-5xl font-bold mb-2 ${getScoreColor(feedback.score)}`}>
              {feedback.score}<span className="text-lg text-muted-foreground">/100</span>
            </div>
            <Progress value={feedback.score} className="h-3 max-w-xs mx-auto mb-4" />
            <p className="text-sm text-foreground">{feedback.overallFeedback}</p>
          </div>

          {/* Errors */}
          {feedback.errors.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" /> Points à corriger ({feedback.errors.length})
              </h4>
              <div className="space-y-2">
                {feedback.errors.map((err, i) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted">
                    {getErrorIcon(err.type)}
                    <div className="flex-1">
                      <span className="font-arabic text-base text-foreground" dir="rtl">{err.word}</span>
                      <p className="text-xs text-muted-foreground mt-0.5">{err.correction}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tajwid notes */}
          {feedback.tajwidNotes.length > 0 && (
            <div className="p-5 rounded-xl border border-border bg-card">
              <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> Conseils de tajwid
              </h4>
              <ul className="space-y-1.5">
                {feedback.tajwidNotes.map((note, i) => (
                  <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Encouragement */}
          {feedback.encouragement && (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 text-center">
              <p className="text-sm font-medium text-primary">{feedback.encouragement}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-center gap-3">
            <Button onClick={resetTest} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Nouveau test
            </Button>
            <Button onClick={() => { recorder.reset(); setStep("recite"); }} className="gap-2">
              <Mic className="h-4 w-4" /> Réessayer ce passage
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default QuranTest;
