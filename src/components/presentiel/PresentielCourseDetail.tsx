// Composant Niveau 1 — 4 étapes séquentielles : Lecture, Écriture, Traduction, Dictée
// Présentiel — refonte from scratch

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, Volume2, Camera, CheckCircle2, XCircle,
  ArrowRight, Loader2, RotateCcw, Award, BookOpen, PenLine, Languages, Headphones,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { compareVerseWords, type WordMatch } from "@/utils/quran-api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// ─── Types ───
export interface PresentielCourseV2 {
  id: string;
  title: string;
  course_date: string;
  level: "niveau_1" | "niveau_2";
  lesson_text: string | null;
  vocabulary: { arabic: string; french: string }[];
  dictation_words: string[];
  // legacy fields kept for compat
  qcm?: any[];
  translation?: any;
  dictation?: any;
}

interface Props {
  course: PresentielCourseV2;
  userProgress: any;
  onProgressUpdate?: (p: any) => void;
}

type Step = "lecture" | "ecriture" | "traduction" | "dictee" | "done";

const STEP_LABEL: Record<Exclude<Step, "done">, { label: string; icon: typeof BookOpen }> = {
  lecture: { label: "Lecture", icon: BookOpen },
  ecriture: { label: "Écriture", icon: PenLine },
  traduction: { label: "Traduction", icon: Languages },
  dictee: { label: "Dictée", icon: Headphones },
};

// ─── Step 1: Lecture (TTS + STT compare) ───
function LectureStep({ course, onDone }: { course: PresentielCourseV2; onDone: () => void }) {
  const { user } = useAuth();
  const { speak } = useArabicSpeech();
  const [recording, setRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [matches, setMatches] = useState<WordMatch[] | null>(null);
  const [score, setScore] = useState<{ correct: number; total: number; pct: number } | null>(null);
  const [attempts, setAttempts] = useState(0);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const lessonText = (course.lesson_text || "").trim();

  const handleListen = async () => {
    if (!lessonText) return;
    await speak(lessonText);
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await analyzeRecording(blob);
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch (e: any) {
      toast.error("Microphone non accessible");
    }
  };

  const stopRecording = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const analyzeRecording = async (blob: Blob) => {
    setAnalyzing(true);
    try {
      const fd = new FormData();
      fd.append("file", blob, "recording.webm");
      fd.append("language_code", "ara");

      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/elevenlabs-stt`,
        { method: "POST", body: fd }
      );
      if (!res.ok) throw new Error("Échec transcription");
      const data = await res.json();
      const transcription: string = data.text || "";

      const wordMatches = compareVerseWords(lessonText, transcription);
      const correct = wordMatches.filter((w) => w.status === "correct").length;
      const total = wordMatches.length;
      const pct = total ? Math.round((correct / total) * 100) : 0;

      setMatches(wordMatches);
      setScore({ correct, total, pct });
      const newAttempt = attempts + 1;
      setAttempts(newAttempt);

      // Persistence
      if (user) {
        await supabase.from("presentiel_reading_scores").insert({
          course_id: course.id,
          user_id: user.id,
          attempt_number: newAttempt,
          target_text: lessonText,
          transcription,
          correct_words: correct,
          total_words: total,
          score_percent: pct,
          word_results: wordMatches as any,
        });
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur d'analyse");
    } finally {
      setAnalyzing(false);
    }
  };

  const reset = () => {
    setMatches(null);
    setScore(null);
  };

  if (!lessonText) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun texte de leçon n'a été configuré pour ce cours.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">Étape 1 — Lecture</h3>
        </div>

        {/* Texte cible avec highlighting si match */}
        <div
          dir="rtl"
          className="p-5 rounded-xl bg-muted/40 border border-border text-2xl leading-loose font-amiri text-right"
        >
          {matches ? (
            <span className="space-x-2">
              {matches.map((m, i) => (
                <span
                  key={i}
                  className={
                    m.status === "correct"
                      ? "text-emerald-600 font-semibold"
                      : m.status === "wrong"
                      ? "text-destructive font-semibold underline decoration-wavy"
                      : "text-muted-foreground"
                  }
                >
                  {m.expected}
                </span>
              ))}
            </span>
          ) : (
            lessonText
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={handleListen} variant="outline" className="gap-2">
            <Volume2 className="h-4 w-4" /> Écouter le professeur
          </Button>

          {!recording ? (
            <Button
              onClick={startRecording}
              disabled={analyzing}
              className="gap-2 gradient-emerald border-0 text-primary-foreground"
            >
              <Mic className="h-4 w-4" />
              {analyzing ? "Analyse…" : "Lire à voix haute"}
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" className="gap-2 animate-pulse">
              <Square className="h-4 w-4" /> Arrêter
            </Button>
          )}

          {matches && (
            <Button onClick={reset} variant="ghost" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Réessayer
            </Button>
          )}
        </div>

        {analyzing && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Analyse de votre lecture…
          </div>
        )}

        {score && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg border border-border bg-card space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Score de lecture</p>
                <p className="text-2xl font-bold text-foreground">
                  {score.correct} / {score.total} mots ({score.pct}%)
                </p>
              </div>
              <Badge variant={score.pct >= 70 ? "default" : "outline"}>
                Tentative {attempts}
              </Badge>
            </div>
            <Progress value={score.pct} className="h-2" />
            <div className="flex justify-end">
              <Button onClick={onDone} className="gap-2">
                Étape suivante <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Step 2 (écriture) & 4 (dictée) : photo upload ───
function PhotoUploadStep({
  course,
  stepType,
  title,
  instruction,
  onDone,
}: {
  course: PresentielCourseV2;
  stepType: "ecriture" | "dictee";
  title: string;
  instruction: React.ReactNode;
  onDone: () => void;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("presentiel_submissions")
      .select("*")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .eq("step_type", stepType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setPreviousSubmission(data);
          setSubmitted(true);
        }
      });
  }, [user, course.id, stepType]);

  const handleFile = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/${course.id}/${stepType}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-submissions")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage
        .from("presentiel-submissions")
        .getPublicUrl(path);

      const { data, error } = await supabase
        .from("presentiel_submissions")
        .insert({
          course_id: course.id,
          user_id: user.id,
          step_type: stepType,
          photo_url: publicUrl,
          status: "en_attente",
        })
        .select()
        .single();
      if (error) throw error;

      setPreviousSubmission(data);
      setSubmitted(true);
      toast.success("Photo envoyée pour correction !");
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          {stepType === "ecriture" ? (
            <PenLine className="h-5 w-5 text-primary" />
          ) : (
            <Headphones className="h-5 w-5 text-primary" />
          )}
          <h3 className="font-semibold text-foreground text-lg">{title}</h3>
        </div>

        <div className="text-sm text-muted-foreground">{instruction}</div>

        {submitted && previousSubmission ? (
          <div className="space-y-3">
            <div className="p-4 rounded-lg border border-border bg-muted/30 flex items-start gap-3">
              <img
                src={previousSubmission.photo_url}
                alt="Soumission"
                className="w-24 h-24 object-cover rounded-md border border-border"
              />
              <div className="flex-1 text-sm">
                <Badge
                  variant={
                    previousSubmission.status === "validee"
                      ? "default"
                      : previousSubmission.status === "a_corriger"
                      ? "destructive"
                      : "outline"
                  }
                  className="mb-2"
                >
                  {previousSubmission.status === "validee" && "✅ Validée"}
                  {previousSubmission.status === "a_corriger" && "❌ À corriger"}
                  {previousSubmission.status === "en_attente" && "⏳ En attente de correction"}
                </Badge>
                {previousSubmission.feedback && (
                  <p className="text-foreground italic">« {previousSubmission.feedback} »</p>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Camera className="h-4 w-4" /> Renvoyer une nouvelle photo
              </Button>
              <Button onClick={onDone} className="gap-2">
                Étape suivante <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="gap-2 gradient-emerald border-0 text-primary-foreground"
          >
            <Camera className="h-4 w-4" />
            {uploading ? "Envoi…" : "Prendre / choisir une photo"}
          </Button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) handleFile(f);
            e.target.value = "";
          }}
        />
      </CardContent>
    </Card>
  );
}

// ─── Step 3: Traduction (QCM vocab) ───
function TraductionStep({ course, onDone }: { course: PresentielCourseV2; onDone: () => void }) {
  const { speak } = useArabicSpeech();
  const items = course.vocabulary || [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  // Build options for current word: correct + 3 random distractors
  const current = items[idx];
  const options = useMemo(() => {
    if (!current) return [];
    const others = items.filter((_, i) => i !== idx);
    const pool = others.sort(() => Math.random() - 0.5).slice(0, 3).map((w) => w.french);
    const all = [current.french, ...pool].sort(() => Math.random() - 0.5);
    return all;
  }, [idx, items, current]);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Aucun vocabulaire configuré pour ce cours.
          <div className="mt-4">
            <Button onClick={onDone} variant="outline">Étape suivante</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    if (options[i] === current.french) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= items.length) {
      setFinished(true);
    } else {
      setIdx(idx + 1);
      setSelected(null);
    }
  };

  if (finished) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Award className="h-12 w-12 text-gold mx-auto" />
          <h3 className="text-xl font-bold">Traduction terminée !</h3>
          <p className="text-muted-foreground">
            Score : <span className="font-bold text-foreground">{score}</span> / {items.length}
          </p>
          <Button onClick={onDone} className="gap-2">
            Étape suivante <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const isCorrect = selected !== null && options[selected] === current.french;

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <Languages className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">Étape 3 — Traduction</h3>
          <Badge variant="outline" className="ml-auto">
            {idx + 1} / {items.length}
          </Badge>
        </div>

        <div
          dir="rtl"
          className="p-6 rounded-xl bg-muted/40 border border-border text-3xl text-center font-amiri"
        >
          {current.arabic}
        </div>

        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => speak(current.arabic)} className="gap-2">
            <Volume2 className="h-4 w-4" /> Écouter
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {options.map((opt, i) => {
            let cls = "border-border bg-background hover:bg-muted";
            if (selected !== null) {
              if (opt === current.french) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-700";
              else if (i === selected) cls = "border-destructive bg-destructive/10 text-destructive";
            }
            return (
              <button
                key={i}
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`p-4 rounded-lg border text-base font-medium transition-all text-left ${cls}`}
              >
                {opt}
                {selected !== null && opt === current.french && (
                  <CheckCircle2 className="h-4 w-4 inline ml-2" />
                )}
                {selected === i && opt !== current.french && (
                  <XCircle className="h-4 w-4 inline ml-2" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <div className="flex justify-end">
            <Button onClick={next} className="gap-2">
              {idx + 1 >= items.length ? "Terminer" : "Suivant"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main ───
const PresentielCourseDetail = ({ course, userProgress, onProgressUpdate }: Props) => {
  const [step, setStep] = useState<Step>("lecture");

  const stepsOrder: Exclude<Step, "done">[] = ["lecture", "ecriture", "traduction", "dictee"];
  const currentIndex = step === "done" ? stepsOrder.length : stepsOrder.indexOf(step);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{course.title}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(course.course_date).toLocaleDateString("fr-FR", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      </div>

      {/* Stepper */}
      <div className="grid grid-cols-4 gap-2">
        {stepsOrder.map((s, i) => {
          const Icon = STEP_LABEL[s].icon;
          const isCurrent = s === step;
          const isDone = i < currentIndex;
          return (
            <div
              key={s}
              className={`p-3 rounded-lg border text-center text-xs ${
                isCurrent
                  ? "border-primary bg-primary/10 text-primary"
                  : isDone
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                  : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              <Icon className="h-5 w-5 mx-auto mb-1" />
              <p className="font-medium">{STEP_LABEL[s].label}</p>
            </div>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          {step === "lecture" && (
            <LectureStep course={course} onDone={() => setStep("ecriture")} />
          )}
          {step === "ecriture" && (
            <PhotoUploadStep
              course={course}
              stepType="ecriture"
              title="Étape 2 — Écriture"
              instruction={
                <>
                  Recopiez la leçon <strong>3 fois</strong> à la main sur une feuille,
                  puis prenez une photo lisible et envoyez-la pour correction par votre professeur.
                </>
              }
              onDone={() => setStep("traduction")}
            />
          )}
          {step === "traduction" && (
            <TraductionStep course={course} onDone={() => setStep("dictee")} />
          )}
          {step === "dictee" && (
            <PhotoUploadStep
              course={course}
              stepType="dictee"
              title="Étape 4 — Dictée"
              instruction={
                <DicteeInstruction words={course.dictation_words || []} />
              }
              onDone={() => setStep("done")}
            />
          )}
          {step === "done" && (
            <Card>
              <CardContent className="p-8 text-center space-y-4">
                <Award className="h-16 w-16 text-gold mx-auto" />
                <h3 className="text-2xl font-bold">Cours terminé 🎉</h3>
                <p className="text-muted-foreground">
                  Bravo ! Votre professeur reviendra vers vous après correction des photos.
                </p>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Helper: dictée — affiche les mots l'un après l'autre via TTS
function DicteeInstruction({ words }: { words: string[] }) {
  const { speak } = useArabicSpeech();
  const [idx, setIdx] = useState(0);

  if (words.length === 0) {
    return <span>Aucun mot configuré pour la dictée.</span>;
  }

  const playOne = (w: string) => speak(w);
  const playAll = async () => {
    for (const w of words) {
      await speak(w);
      await new Promise((r) => setTimeout(r, 800));
    }
  };

  return (
    <div className="space-y-3">
      <p>
        Écoutez chaque mot, écrivez-le à la main sans regarder, puis envoyez la photo de votre dictée
        pour correction.
      </p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={playAll} className="gap-2">
          <Volume2 className="h-4 w-4" /> Écouter tous les mots
        </Button>
        {words.map((w, i) => (
          <Button
            key={i}
            size="sm"
            variant="ghost"
            onClick={() => {
              setIdx(i);
              playOne(w);
            }}
            className={`gap-1 ${idx === i ? "ring-1 ring-primary" : ""}`}
          >
            <Volume2 className="h-3 w-3" /> Mot {i + 1}
          </Button>
        ))}
      </div>
    </div>
  );
}

export default PresentielCourseDetail;
