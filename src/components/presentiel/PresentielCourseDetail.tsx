// Composant Niveau 1 — 4 étapes séquentielles : Lecture, Écriture, Traduction, Dictée
// Présentiel — refonte from scratch

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, Volume2, Camera, CheckCircle2, XCircle,
  ArrowRight, Loader2, RotateCcw, Award, BookOpen, PenLine, Languages, Headphones,
  HelpCircle, ListOrdered, Send,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { compareVerseWords, type WordMatch } from "@/utils/quran-api";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { playCorrectSound, playWrongSound } from "@/utils/sound-feedback";

// ─── Types ───
export interface PresentielCourseV2 {
  id: string;
  title: string;
  course_date: string;
  level: "niveau_1" | "niveau_2";
  lesson_text: string | null;
  vocabulary: { arabic: string; french: string }[];
  dictation_words: string[];
  comprehension_questions?: { question: string; answer: string }[];
  reorder_exercises?: { words: string[]; correct_order: string[] }[];
  photo_url?: string | null;
  lesson_photos?: string[];
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

type Step = "lecture" | "ecriture" | "traduction" | "comprehension" | "reorder" | "dictee" | "done";

const STEP_LABEL: Record<Exclude<Step, "done">, { label: string; icon: typeof BookOpen }> = {
  lecture: { label: "Lecture", icon: BookOpen },
  ecriture: { label: "Écriture", icon: PenLine },
  traduction: { label: "Traduction", icon: Languages },
  comprehension: { label: "Compréhension", icon: HelpCircle },
  reorder: { label: "Remise en ordre", icon: ListOrdered },
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

        {(() => {
          const pages = (course.lesson_photos && course.lesson_photos.length > 0)
            ? course.lesson_photos
            : (course.photo_url ? [course.photo_url] : []);
          if (pages.length === 0) return null;
          return (
            <div className="space-y-3">
              {pages.length > 1 && (
                <p className="text-xs text-muted-foreground">
                  📖 {pages.length} pages — faites défiler dans l'ordre
                </p>
              )}
              {pages.map((url, i) => (
                <div key={i} className="rounded-xl overflow-hidden border border-border bg-muted/20 relative">
                  {pages.length > 1 && (
                    <Badge variant="secondary" className="absolute top-2 left-2 z-10">
                      Page {i + 1}/{pages.length}
                    </Badge>
                  )}
                  <img src={url} alt={`Page ${i + 1} de la leçon`} className="w-full max-h-[480px] object-contain bg-white" />
                </div>
              ))}
            </div>
          );
        })()}

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
  maxPhotos = 1,
}: {
  course: PresentielCourseV2;
  stepType: "ecriture" | "dictee";
  title: string;
  instruction: React.ReactNode;
  onDone: () => void;
  maxPhotos?: number;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previousSubmission, setPreviousSubmission] = useState<any>(null);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("presentiel_submissions")
      .select("*")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .eq("step_type", stepType)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setPreviousSubmission(data);
      setSubmitted(true);
      // Marquer comme vue si correction effectuée
      if ((data as any).status !== "en_attente" && !(data as any).seen_by_student) {
        await supabase
          .from("presentiel_submissions")
          .update({ seen_by_student: true } as any)
          .eq("id", (data as any).id);
      }
    }
  };

  useEffect(() => {
    refresh();
  }, [user, course.id, stepType]);

  const handleFiles = async (files: FileList) => {
    if (!user) return;
    const list = Array.from(files).slice(0, maxPhotos);
    if (list.length === 0) return;
    if (files.length > maxPhotos) {
      toast.warning(`Maximum ${maxPhotos} photo(s) — seules les ${maxPhotos} premières seront envoyées.`);
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const ext = file.name.split(".").pop() || "jpg";
        const path = `${user.id}/${course.id}/${stepType}-${Date.now()}-${urls.length}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("presentiel-submissions")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        const { data: { publicUrl } } = supabase.storage
          .from("presentiel-submissions")
          .getPublicUrl(path);
        urls.push(publicUrl);
      }

      const { data, error } = await supabase
        .from("presentiel_submissions")
        .insert({
          course_id: course.id,
          user_id: user.id,
          step_type: stepType,
          photo_url: urls[0],
          photo_urls: urls as any,
          status: "en_attente",
        })
        .select()
        .single();
      if (error) throw error;

      setPreviousSubmission(data);
      setSubmitted(true);
      toast.success(urls.length > 1 ? `${urls.length} photos envoyées pour correction !` : "Photo envoyée pour correction !");
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const photos: string[] = (previousSubmission?.photo_urls && Array.isArray(previousSubmission.photo_urls) && previousSubmission.photo_urls.length > 0)
    ? previousSubmission.photo_urls
    : (previousSubmission?.photo_url ? [previousSubmission.photo_url] : []);

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
            {/* Notification de correction du prof */}
            {previousSubmission.status !== "en_attente" && (
              <div className={`p-4 rounded-lg border-2 ${
                previousSubmission.status === "validee"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-destructive bg-destructive/10"
              }`}>
                <p className={`font-bold text-lg ${
                  previousSubmission.status === "validee" ? "text-emerald-700" : "text-destructive"
                }`}>
                  {previousSubmission.status === "validee" ? "✅ Validée par votre professeur" : "❌ À corriger"}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Votre professeur a corrigé votre travail.
                </p>
                {previousSubmission.feedback && (
                  <div className="mt-3 p-3 rounded bg-background/60 border border-border">
                    <p className="text-xs font-semibold mb-1">Commentaire du professeur :</p>
                    <p className="text-foreground italic">« {previousSubmission.feedback} »</p>
                  </div>
                )}
              </div>
            )}
            {previousSubmission.status === "en_attente" && (
              <Badge variant="outline">⏳ En attente de correction</Badge>
            )}

            <div className="grid grid-cols-3 gap-2">
              {photos.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noreferrer">
                  <img
                    src={u}
                    alt={`Photo ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-md border border-border"
                  />
                </a>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="gap-2"
              >
                <Camera className="h-4 w-4" />
                {maxPhotos > 1 ? `Renvoyer (jusqu'à ${maxPhotos} photos)` : "Renvoyer une photo"}
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
            {uploading
              ? "Envoi…"
              : maxPhotos > 1
                ? `Choisir jusqu'à ${maxPhotos} photos`
                : "Choisir une photo"}
          </Button>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple={maxPhotos > 1}
          className="hidden"
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) handleFiles(files);
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

// ─── Step 4 (N2): Compréhension — questions/réponses arabes ───
function ComprehensionStep({ course, onDone }: { course: PresentielCourseV2; onDone: () => void }) {
  const { speak } = useArabicSpeech();
  const items = course.comprehension_questions || [];
  const [idx, setIdx] = useState(0);
  const [answer, setAnswer] = useState("");
  const [validated, setValidated] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground space-y-3">
          Aucune question de compréhension configurée.
          <div><Button onClick={onDone} variant="outline">Étape suivante</Button></div>
        </CardContent>
      </Card>
    );
  }

  const current = items[idx];

  const normalize = (s: string) =>
    s.replace(/[\u064B-\u0652\u0670]/g, "").replace(/[إأآا]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").trim();

  const validate = () => {
    const ok = normalize(answer) === normalize(current.answer);
    setValidated(ok);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= items.length) setFinished(true);
    else { setIdx(idx + 1); setAnswer(""); setValidated(null); }
  };

  if (finished) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Award className="h-12 w-12 text-gold mx-auto" />
          <h3 className="text-xl font-bold">Compréhension terminée !</h3>
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

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">Étape — Compréhension</h3>
          <Badge variant="outline" className="ml-auto">{idx + 1} / {items.length}</Badge>
        </div>

        <div dir="rtl" className="p-5 rounded-xl bg-muted/40 border border-border text-2xl font-amiri text-right leading-loose">
          {current.question}
        </div>

        <Button variant="ghost" size="sm" onClick={() => speak(current.question)} className="gap-2">
          <Volume2 className="h-4 w-4" /> Écouter la question
        </Button>

        <Input
          dir="rtl"
          className="font-amiri text-xl text-right"
          placeholder="اكتب جوابك هنا…"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          disabled={validated !== null}
        />

        {validated === null ? (
          <Button onClick={validate} disabled={!answer.trim()} className="gap-2">
            <Send className="h-4 w-4" /> Valider
          </Button>
        ) : (
          <div className={`p-4 rounded-lg border ${validated ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10"}`}>
            <p className={`font-semibold ${validated ? "text-emerald-700" : "text-destructive"}`}>
              {validated ? "✅ Bonne réponse !" : "❌ Réponse incorrecte"}
            </p>
            {!validated && (
              <p dir="rtl" className="text-right font-amiri text-lg mt-2">
                Réponse attendue : <strong>{current.answer}</strong>
              </p>
            )}
            <Button onClick={next} className="gap-2 mt-3">
              {idx + 1 >= items.length ? "Terminer" : "Suivant"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Step 5 (N2): Remise en ordre des mots ───
function ReorderStep({ course, onDone }: { course: PresentielCourseV2; onDone: () => void }) {
  const items = course.reorder_exercises || [];
  const [idx, setIdx] = useState(0);
  const [shuffled, setShuffled] = useState<string[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [validated, setValidated] = useState<null | boolean>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = items[idx];

  useEffect(() => {
    if (current) {
      const arr = [...current.correct_order].sort(() => Math.random() - 0.5);
      setShuffled(arr);
      setPicked([]);
      setValidated(null);
    }
  }, [idx, current]);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground space-y-3">
          Aucun exercice de remise en ordre configuré.
          <div><Button onClick={onDone} variant="outline">Étape suivante</Button></div>
        </CardContent>
      </Card>
    );
  }

  const togglePick = (i: number) => {
    if (validated !== null) return;
    setPicked((p) => p.includes(i) ? p.filter(x => x !== i) : [...p, i]);
  };

  const validate = () => {
    const built = picked.map((i) => shuffled[i]);
    const ok = built.length === current.correct_order.length &&
      built.every((w, i) => w === current.correct_order[i]);
    setValidated(ok);
    if (ok) setScore((s) => s + 1);
  };

  const next = () => {
    if (idx + 1 >= items.length) setFinished(true);
    else setIdx(idx + 1);
  };

  if (finished) {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <Award className="h-12 w-12 text-gold mx-auto" />
          <h3 className="text-xl font-bold">Remise en ordre terminée !</h3>
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

  const isFull = picked.length === shuffled.length;

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <ListOrdered className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">Étape — Remise en ordre</h3>
          <Badge variant="outline" className="ml-auto">{idx + 1} / {items.length}</Badge>
        </div>

        <p className="text-sm text-muted-foreground">
          Cliquez sur les mots dans l'ordre correct pour reconstituer la phrase.
        </p>

        {/* Phrase en construction */}
        <div dir="rtl" className="min-h-[64px] p-4 rounded-xl bg-muted/40 border border-dashed border-border font-amiri text-2xl text-right space-x-2">
          {picked.length === 0 ? (
            <span className="text-muted-foreground text-base">…</span>
          ) : (
            picked.map((i, k) => (
              <span key={k} className="inline-block px-2 py-1 mx-1 bg-primary/10 rounded">
                {shuffled[i]}
              </span>
            ))
          )}
        </div>

        {/* Mots disponibles */}
        <div dir="rtl" className="flex flex-wrap gap-2 justify-end">
          {shuffled.map((w, i) => (
            <Button
              key={i}
              variant={picked.includes(i) ? "secondary" : "outline"}
              onClick={() => togglePick(i)}
              disabled={validated !== null}
              className="font-amiri text-xl"
            >
              {w}
            </Button>
          ))}
        </div>

        {validated === null ? (
          <div className="flex gap-2">
            <Button onClick={validate} disabled={!isFull} className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Valider
            </Button>
            <Button onClick={() => setPicked([])} variant="ghost" disabled={picked.length === 0}>
              <RotateCcw className="h-4 w-4 mr-1" /> Recommencer
            </Button>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border ${validated ? "border-emerald-500 bg-emerald-500/10" : "border-destructive bg-destructive/10"}`}>
            <p className={`font-semibold ${validated ? "text-emerald-700" : "text-destructive"}`}>
              {validated ? "✅ Phrase correcte !" : "❌ Ordre incorrect"}
            </p>
            {!validated && (
              <p dir="rtl" className="text-right font-amiri text-lg mt-2">
                Solution : <strong>{current.correct_order.join(" ")}</strong>
              </p>
            )}
            <Button onClick={next} className="gap-2 mt-3">
              {idx + 1 >= items.length ? "Terminer" : "Suivant"} <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Main ───
const PresentielCourseDetail = ({ course, userProgress, onProgressUpdate }: Props) => {
  const isN2 = course.level === "niveau_2";
  const stepsOrder: Exclude<Step, "done">[] = isN2
    ? ["lecture", "ecriture", "traduction", "comprehension", "reorder", "dictee"]
    : ["lecture", "ecriture", "traduction", "dictee"];

  const [step, setStep] = useState<Step>(stepsOrder[0]);
  const currentIndex = step === "done" ? stepsOrder.length : stepsOrder.indexOf(step);

  const goNext = () => {
    const i = stepsOrder.indexOf(step as Exclude<Step, "done">);
    if (i < 0 || i >= stepsOrder.length - 1) setStep("done");
    else setStep(stepsOrder[i + 1]);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-1">{course.title}</h2>
        <p className="text-sm text-muted-foreground">
          {new Date(course.course_date).toLocaleDateString("fr-FR", {
            day: "numeric", month: "long", year: "numeric",
          })}
          {" · "}
          <Badge variant="outline" className="ml-1">
            {isN2 ? "Niveau 2" : "Niveau 1"}
          </Badge>
        </p>
      </div>

      {/* Stepper */}
      <div className={`grid gap-2 ${isN2 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-4"}`}>
        {stepsOrder.map((s, i) => {
          const Icon = STEP_LABEL[s].icon;
          const isCurrent = s === step;
          const isDone = i < currentIndex;
          return (
            <div
              key={s}
              className={`p-2 rounded-lg border text-center text-xs ${
                isCurrent
                  ? "border-primary bg-primary/10 text-primary"
                  : isDone
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                  : "border-border bg-muted/30 text-muted-foreground"
              }`}
            >
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <p className="font-medium leading-tight">{STEP_LABEL[s].label}</p>
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
            <LectureStep course={course} onDone={goNext} />
          )}
          {step === "ecriture" && (
            <PhotoUploadStep
              course={course}
              stepType="ecriture"
              title="Étape — Écriture"
              instruction={
                <>
                  Recopiez la leçon <strong>3 fois</strong> à la main sur une feuille,
                  puis prenez une photo lisible et envoyez-la pour correction par votre professeur.
                </>
              }
              onDone={goNext}
            />
          )}
          {step === "traduction" && (
            <TraductionStep course={course} onDone={goNext} />
          )}
          {step === "comprehension" && (
            <ComprehensionStep course={course} onDone={goNext} />
          )}
          {step === "reorder" && (
            <ReorderStep course={course} onDone={goNext} />
          )}
          {step === "dictee" && (
            <PhotoUploadStep
              course={course}
              stepType="dictee"
              title="Étape — Dictée"
              instruction={
                <DicteeInstruction words={course.dictation_words || []} />
              }
              onDone={goNext}
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
