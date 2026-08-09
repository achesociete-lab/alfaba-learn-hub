// Composant Niveau 1 — 4 étapes séquentielles : Lecture, Écriture, Traduction, Dictée
// Présentiel — refonte from scratch

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Volume2, Camera, CheckCircle2, XCircle,
  ArrowRight, Loader2, RotateCcw, Award, BookOpen, PenLine, Languages, Headphones,
  HelpCircle, ListOrdered, ChevronDown, ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { playCorrectSound, playWrongSound } from "@/utils/sound-feedback";
import { usePersistentState, userScopedKey } from "@/hooks/use-persistent-state";

// ─── Types ───
export interface PresentielCourseV2 {
  id: string;
  title: string;
  course_date: string;
  level: "niveau_1" | "niveau_2";
  lesson_text: string | null;
  vocabulary: { arabic: string; french: string }[];
  dictation_words: string[];
  dictation_word_audios?: string[];
  dictation_text?: string | null;
  dictation_sentence_audios?: string[];
  comprehension_questions?: { question: string; answer: string }[];
  reorder_exercises?: { words: string[]; correct_order: string[] }[];
  photo_url?: string | null;
  lesson_photos?: string[];
  audio_url?: string | null;
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

type Step = "ecriture" | "traduction" | "comprehension" | "reorder" | "dictee" | "done";

const STEP_LABEL: Record<Exclude<Step, "done">, { label: string; icon: typeof BookOpen }> = {
  ecriture: { label: "Écriture", icon: PenLine },
  traduction: { label: "Traduction", icon: Languages },
  comprehension: { label: "Compréhension", icon: HelpCircle },
  reorder: { label: "Remise en ordre", icon: ListOrdered },
  dictee: { label: "Dictée", icon: Headphones },
};

// ─── Helper : Référence leçon dépliable (utilisée dans Écriture) ───
function LessonReference({ course }: { course: PresentielCourseV2 }) {
  const [open, setOpen] = useState(false);
  const photos = Array.from(
    new Set([
      ...(course.photo_url ? [course.photo_url] : []),
      ...(Array.isArray(course.lesson_photos) ? course.lesson_photos : []),
    ])
  );
  if (photos.length === 0 && !course.audio_url) return null;
  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-2.5 bg-muted/40 hover:bg-muted text-sm font-medium transition-colors"
      >
        <span className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          📖 Voir la leçon à recopier
        </span>
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
      </button>
      {open && (
        <div className="p-4 space-y-3 bg-background/60">
          {course.audio_url && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Volume2 className="h-3 w-3" /> Lecture du professeur
              </p>
              <audio controls src={course.audio_url} className="w-full rounded" style={{ height: "40px" }} />
            </div>
          )}
          {photos.map((url, i) => (
            <img
              key={i}
              src={url}
              alt={`Leçon page ${i + 1}`}
              className="w-full rounded border border-border bg-white"
            />
          ))}
        </div>
      )}
    </div>
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

  // Auto-refresh tant que la correction n'est pas arrivée
  useEffect(() => {
    if (!previousSubmission || previousSubmission.status !== "en_attente") return;
    const id = setInterval(refresh, 20_000);
    return () => clearInterval(id);
  }, [previousSubmission?.id, previousSubmission?.status]);

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
  const annotatedPhotos: string[] = Array.isArray((previousSubmission as any)?.annotated_photo_urls)
    ? (previousSubmission as any).annotated_photo_urls
    : [];
  const hasAnyAnnotation = annotatedPhotos.some(Boolean);

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

        {stepType === "ecriture" && <LessonReference course={course} />}

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
              <div className="flex items-center gap-3 flex-wrap">
                <Badge variant="outline">⏳ En attente de correction</Badge>
                <Button size="sm" variant="ghost" onClick={refresh} className="gap-1.5 text-xs h-7 px-2">
                  <RotateCcw className="h-3 w-3" /> Vérifier les corrections
                </Button>
              </div>
            )}

            {hasAnyAnnotation && (
              <div className="p-2 rounded-md bg-primary/10 border border-primary/30 text-sm text-foreground">
                ✏️ Votre professeur a annoté vos photos pour signaler vos erreurs.
              </div>
            )}
            <div className="grid grid-cols-3 gap-2">
              {photos.map((u, i) => {
                const ann = annotatedPhotos[i];
                const display = ann || u;
                return (
                  <div key={i} className="relative">
                    <a href={display} target="_blank" rel="noreferrer">
                      <img
                        src={display}
                        alt={`Photo ${i + 1}${ann ? " (annotée)" : ""}`}
                        className={`w-full aspect-square object-cover rounded-md border ${ann ? "border-primary" : "border-border"}`}
                      />
                    </a>
                    {ann && (
                      <>
                        <Badge className="absolute top-1 left-1 text-[10px] px-1.5 py-0.5 bg-primary text-primary-foreground">
                          Corrigée
                        </Badge>
                        <a
                          href={u}
                          target="_blank"
                          rel="noreferrer"
                          className="absolute bottom-1 right-1 text-[10px] bg-background/90 px-1.5 py-0.5 rounded border border-border hover:bg-background"
                        >
                          Original
                        </a>
                      </>
                    )}
                  </div>
                );
              })}
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
  const { user } = useAuth();
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
    const isOk = options[i] === current.french;
    if (isOk) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const next = async () => {
    if (idx + 1 >= items.length) {
      setFinished(true);
      if (user) {
        await supabase.from("presentiel_course_progress").upsert(
          { course_id: course.id, user_id: user.id, qcm_completed: true, translation_completed: true } as any,
          { onConflict: "course_id,user_id" }
        );
      }
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

// ─── Step 4: Compréhension — QCM (choix multiples, pas de saisie libre) ───
function ComprehensionStep({ course, onDone }: { course: PresentielCourseV2; onDone: () => void }) {
  const { speak } = useArabicSpeech();
  const { user } = useAuth();
  const items = course.comprehension_questions || [];
  const [idx, setIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const current = items[idx];

  // Build QCM: bonne réponse + 3 distracteurs tirés des autres réponses
  const options = useMemo(() => {
    if (!current) return [];
    const otherAnswers = items
      .filter((_, i) => i !== idx)
      .map((q) => q.answer)
      .filter((a) => a && a !== current.answer);
    const pool = [...otherAnswers].sort(() => Math.random() - 0.5).slice(0, 3);
    // Si pas assez, extraire des mots du texte de la leçon
    const lessonWords = (course.lesson_text || "")
      .split(/[\s،,\.\n]+/)
      .filter((w) => w.length > 2 && w !== current.answer && !pool.includes(w));
    while (pool.length < 3 && lessonWords.length > 0) {
      const w = lessonWords.splice(Math.floor(Math.random() * lessonWords.length), 1)[0];
      if (!pool.includes(w)) pool.push(w);
    }
    // Dernier recours : génériques
    const generics = ["لَمْ يُذْكَرْ", "لَيْسَ فِي النَّصِّ", "غَيْرُ صَحِيحٍ"];
    let gi = 0;
    while (pool.length < 3) pool.push(generics[gi++ % generics.length]);
    return [current.answer, ...pool].sort(() => Math.random() - 0.5);
  }, [idx, current, items, course.lesson_text]);

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground space-y-3">
          <p>Aucune question de compréhension pour ce cours.</p>
          <Button onClick={onDone} variant="outline">Étape suivante</Button>
        </CardContent>
      </Card>
    );
  }

  const handleSelect = (i: number) => {
    if (selected !== null) return;
    setSelected(i);
    const isOk = options[i] === current.answer;
    if (isOk) { setScore((s) => s + 1); playCorrectSound(); }
    else playWrongSound();
  };

  const next = async () => {
    if (idx + 1 >= items.length) {
      setFinished(true);
      if (user) {
        await supabase.from("presentiel_course_progress").upsert(
          { course_id: course.id, user_id: user.id, comprehension_completed: true } as any,
          { onConflict: "course_id,user_id" }
        );
      }
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

  const isCorrect = selected !== null && options[selected] === current.answer;

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">Étape — Compréhension</h3>
          <Badge variant="outline" className="ml-auto">{idx + 1} / {items.length}</Badge>
        </div>

        {/* Question */}
        <div dir="rtl" className="p-5 rounded-xl bg-muted/40 border border-border text-2xl font-amiri text-right leading-loose">
          {current.question}
        </div>

        <Button variant="ghost" size="sm" onClick={() => speak(current.question)} className="gap-2">
          <Volume2 className="h-4 w-4" /> Écouter la question
        </Button>

        {/* Choix multiples */}
        <div className="grid grid-cols-1 gap-3">
          {options.map((opt, i) => {
            let cls = "border-border bg-background hover:bg-muted";
            if (selected !== null) {
              if (opt === current.answer) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-700";
              else if (i === selected) cls = "border-destructive bg-destructive/10 text-destructive";
            }
            return (
              <button
                key={i}
                dir="rtl"
                onClick={() => handleSelect(i)}
                disabled={selected !== null}
                className={`p-4 rounded-lg border font-amiri text-xl font-medium transition-all text-right w-full ${cls}`}
              >
                {opt}
                {selected !== null && opt === current.answer && (
                  <CheckCircle2 className="h-4 w-4 inline mr-2" />
                )}
                {selected === i && opt !== current.answer && (
                  <XCircle className="h-4 w-4 inline mr-2" />
                )}
              </button>
            );
          })}
        </div>

        {selected !== null && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg border ${
              isCorrect
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-amber-400 bg-amber-50/60 dark:bg-amber-950/20"
            }`}
          >
            {isCorrect ? (
              <p className="font-semibold text-emerald-700">✅ Bonne réponse !</p>
            ) : (
              <>
                <p className="font-semibold text-amber-700 dark:text-amber-400">❌ Pas tout à fait</p>
                <div dir="rtl" className="mt-2 p-3 rounded bg-background/60 font-amiri text-lg text-right">
                  Réponse correcte : <strong>{current.answer}</strong>
                </div>
              </>
            )}
            <Button onClick={next} className="gap-2 mt-3">
              {idx + 1 >= items.length ? "Terminer" : "Suivant"} <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
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
    if (ok) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }
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

// ─── Déduplication inter-modules ───
// Une même question/mot ne doit apparaître qu'une seule fois dans tout le cours.
// Ordre de priorité (l'élément reste dans le 1er module où il apparaît) :
// vocabulaire → compréhension → remise en ordre → dictée.
function normKey(s: string): string {
  if (!s) return "";
  return s
    .normalize("NFD")
    .replace(/[\u064B-\u065F\u0670]/g, "") // tashkeel
    .replace(/[\u0610-\u061A]/g, "")
    .replace(/[إأآا]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^\p{L}\p{N}]/gu, "")
    .toLowerCase()
    .trim();
}

function dedupeCourse(course: PresentielCourseV2): PresentielCourseV2 {
  const seen = new Set<string>();

  // 1. Vocabulaire (traduction) — clé = mot arabe
  const vocabulary = (course.vocabulary || []).filter((v) => {
    const k = normKey(v?.arabic || "");
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // 2. Compréhension — clé = question
  const comprehension_questions = (course.comprehension_questions || []).filter((q) => {
    const k = normKey(q?.question || "");
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // 3. Remise en ordre — clé = phrase reconstituée
  const reorder_exercises = (course.reorder_exercises || []).filter((r) => {
    const phrase = Array.isArray(r?.correct_order) ? r.correct_order.join(" ") : "";
    const k = normKey(phrase);
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  // 4. Dictée — clé = mot
  const dictation_words = (course.dictation_words || []).filter((w) => {
    const k = normKey(w || "");
    if (!k || seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return {
    ...course,
    vocabulary,
    comprehension_questions,
    reorder_exercises,
    dictation_words,
  };
}

// ─── Main ───
const PresentielCourseDetail = ({ course: rawCourse, userProgress, onProgressUpdate }: Props) => {
  const { user } = useAuth();
  const course = useMemo(() => dedupeCourse(rawCourse), [rawCourse]);
  const isN2 = course.level === "niveau_2";
  const stepsOrder: Exclude<Step, "done">[] = isN2
    ? ["ecriture", "traduction", "comprehension", "reorder", "dictee"]
    : ["ecriture", "traduction", "dictee"];

  const [step, setStep] = usePersistentState<Step>(
    userScopedKey(user?.id, `presentiel:${course.id}:step`),
    stepsOrder[0],
  );
  const [maxReached, setMaxReached] = usePersistentState<number>(
    userScopedKey(user?.id, `presentiel:${course.id}:maxReached`),
    0,
  );
  const currentIndex = step === "done" ? stepsOrder.length : stepsOrder.indexOf(step);

  useEffect(() => {
    if (currentIndex > maxReached) setMaxReached(currentIndex);
  }, [currentIndex, maxReached, setMaxReached]);

  const goNext = () => {
    const i = stepsOrder.indexOf(step as Exclude<Step, "done">);
    if (i < 0 || i >= stepsOrder.length - 1) {
      setStep("done");
      setMaxReached(Math.max(maxReached, stepsOrder.length));
    } else {
      const nextIdx = i + 1;
      setStep(stepsOrder[nextIdx]);
      setMaxReached(Math.max(maxReached, nextIdx));
    }
  };

  const goToStep = (target: Exclude<Step, "done">, idx: number) => {
    if (idx <= maxReached) setStep(target);
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
      <div className={`grid gap-2 ${isN2 ? "grid-cols-3 sm:grid-cols-5" : "grid-cols-3"}`}>
        {stepsOrder.map((s, i) => {
          const Icon = STEP_LABEL[s].icon;
          const isCurrent = s === step;
          const isDone = i < currentIndex;
          const unlocked = i <= maxReached;
          return (
            <button
              key={s}
              type="button"
              disabled={!unlocked}
              onClick={() => goToStep(s, i)}
              className={`p-2 rounded-lg border text-center text-xs transition-colors ${
                isCurrent
                  ? "border-primary bg-primary/10 text-primary"
                  : isDone
                  ? "border-emerald-500 bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20"
                  : "border-border bg-muted/30 text-muted-foreground"
              } ${unlocked ? "cursor-pointer" : "cursor-not-allowed opacity-60"}`}
              title={unlocked ? `Aller à l'étape : ${STEP_LABEL[s].label}` : "Étape verrouillée"}
            >
              <Icon className="h-4 w-4 mx-auto mb-1" />
              <p className="font-medium leading-tight">{STEP_LABEL[s].label}</p>
            </button>
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
          {step === "ecriture" && (() => {
            const isN2 = course.level === "niveau_2";
            return (
              <PhotoUploadStep
                course={course}
                stepType="ecriture"
                title="Étape — Écriture"
                maxPhotos={3}
                instruction={
                  isN2 ? (
                    <>
                      Recopiez la leçon <strong>une fois</strong> à la main sur votre cahier.
                      Envoyez <strong>jusqu'à 3 photos</strong> (une par page) pour que votre
                      professeur puisse voir votre travail complet.
                    </>
                  ) : (
                    <>
                      Recopiez la leçon <strong>3 fois</strong> à la main sur votre cahier.
                      Envoyez <strong>jusqu'à 3 photos</strong> (une par page/série) pour que votre
                      professeur puisse voir votre travail complet.
                    </>
                  )
                }
                onDone={goNext}
              />
            );
          })()}
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
              maxPhotos={3}
              instruction={
                course.level === "niveau_2" && course.dictation_text ? (
                  <DicteeInstructionN2
                    text={course.dictation_text}
                    sentenceAudios={course.dictation_sentence_audios}
                  />
                ) : (
                  <DicteeInstruction
                    words={course.dictation_words || []}
                    wordAudios={course.dictation_word_audios}
                  />
                )
              }
              onDone={async () => {
                if (user) {
                  await supabase.from("presentiel_course_progress").upsert(
                    { course_id: course.id, user_id: user.id, dictation_completed: true } as any,
                    { onConflict: "course_id,user_id" }
                  );
                }
                goNext();
              }}
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


// ── Helper: pause async ──
function waitMs(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

const DICTEE_PAUSE_SEC = 6; // secondes d'écriture entre chaque mot

// Helper: dictée N2 — texte phrase par phrase
function DicteeInstructionN2({ text, sentenceAudios }: { text: string; sentenceAudios?: string[] }) {
  const { speak } = useArabicSpeech();

  const sentences = (text.match(/[^.؟!]+[.؟!]*/g) || [text]).map((s) => s.trim()).filter(Boolean);

  const [idx, setIdx] = useState(0);
  const [played, setPlayed] = useState<boolean[]>([]);
  const [done, setDone] = useState(false);

  const handleListen = async () => {
    const teacherAudio = sentenceAudios?.[idx];
    if (teacherAudio) {
      const audio = new Audio(teacherAudio);
      await audio.play().catch(() => speak(sentences[idx]));
    } else {
      await speak(sentences[idx]);
    }
    setPlayed((p) => { const n = [...p]; n[idx] = true; return n; });
  };

  const handleNext = () => {
    if (idx + 1 >= sentences.length) setDone(true);
    else setIdx((i) => i + 1);
  };

  if (sentences.length === 0) {
    return <span className="text-sm text-muted-foreground">Aucune phrase configurée.</span>;
  }

  if (done) {
    return (
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-center"
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-emerald-700 dark:text-emerald-400">
            Toutes les phrases dictées !
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Prenez une photo de votre feuille et envoyez-la pour correction.
          </p>
        </motion.div>
        <Button variant="outline" size="sm" onClick={() => { setIdx(0); setPlayed([]); setDone(false); }}>
          ↩ Recommencer
        </Button>
      </div>
    );
  }

  const currentPlayed = played[idx] ?? false;

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Écoutez chaque phrase et écrivez-la sur votre feuille. Envoyez ensuite une photo pour correction.
      </p>

      {/* Barre de progression */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Phrase {idx + 1} / {sentences.length}
        </span>
        <div className="flex gap-1 flex-1">
          {sentences.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i < idx ? "bg-emerald-500" : i === idx ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Zone phrase */}
      <div className="p-5 rounded-xl bg-muted/40 border border-border text-center min-h-[80px] flex items-center justify-center">
        {currentPlayed ? (
          <p className="text-xs text-muted-foreground">Phrase écoutée — écrivez-la sur votre feuille</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">Cliquez sur "Écouter" — ne regardez pas la phrase !</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleListen}
          variant={currentPlayed ? "outline" : "default"}
          className={`w-full gap-2 ${!currentPlayed ? "gradient-emerald border-0 text-primary-foreground" : ""}`}
        >
          <Volume2 className="h-5 w-5" />
          {currentPlayed ? "Réécouter" : `▶ Écouter la phrase n°${idx + 1}`}
          {sentenceAudios?.[idx] && <span className="text-xs opacity-70 ml-1">🎙️ voix du prof</span>}
        </Button>

        {currentPlayed && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              onClick={handleNext}
              className="w-full gap-2 gradient-emerald border-0 text-primary-foreground"
            >
              ✏️ J'ai écrit →{" "}
              {idx + 1 < sentences.length ? `Phrase ${idx + 2}/${sentences.length}` : "Terminé 🎉"}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Helper: dictée — mode mot par mot (clic par clic)
function DicteeInstruction({ words, wordAudios }: { words: string[]; wordAudios?: string[] }) {
  const { speak } = useArabicSpeech();
  const [mode, setMode] = useState<"intro" | "guided" | "list">("intro");

  // Guided state
  const [idx, setIdx] = useState(0);
  const [played, setPlayed] = useState<boolean[]>([]);
  const [guidedDone, setGuidedDone] = useState(false);

  if (words.length === 0) {
    return <span>Aucun mot configuré pour la dictée.</span>;
  }

  // ── Guided mode ──
  const startGuided = () => {
    setMode("guided");
    setIdx(0);
    setPlayed(new Array(words.length).fill(false));
    setGuidedDone(false);
  };

  const handleListen = async () => {
    const teacherAudio = wordAudios?.[idx];
    if (teacherAudio) {
      const audio = new Audio(teacherAudio);
      await audio.play().catch(() => speak(words[idx]));
    } else {
      await speak(words[idx]);
    }
    setPlayed((p) => { const n = [...p]; n[idx] = true; return n; });
  };

  const handleNext = () => {
    if (idx + 1 >= words.length) setGuidedDone(true);
    else setIdx((i) => i + 1);
  };

  // ════ RENDU ════

  // ── Mode intro ──
  if (mode === "intro") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Écoutez chaque mot et écrivez-le à la main sur votre feuille.
          Envoyez ensuite une photo de votre travail pour correction.
        </p>
        <div className="flex flex-col gap-2">
          <Button
            onClick={startGuided}
            className="gap-2 gradient-emerald border-0 text-primary-foreground w-full"
          >
            <Headphones className="h-4 w-4" /> Dictée mot par mot
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            Cliquez sur "Écouter" pour entendre chaque mot, puis sur "J'ai écrit" pour passer au suivant.
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setMode("list")} className="gap-1 flex-1">
              Voir la liste
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ── Mode liste (révision) ──
  if (mode === "list") {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          Liste des mots — cliquez sur un numéro pour écouter :
        </p>
        <div className="flex flex-wrap gap-2">
          {words.map((w, i) => {
            const teacherAudio = wordAudios?.[i];
            const playWord = () => {
              if (teacherAudio) {
                new Audio(teacherAudio).play().catch(() => speak(w));
              } else {
                speak(w);
              }
            };
            return (
              <Button key={i} size="sm" variant="outline" onClick={playWord} className="gap-1 font-amiri text-lg">
                <Volume2 className="h-3 w-3" /> {i + 1}
                {teacherAudio && <span className="text-[9px] text-emerald-600 ml-0.5">●</span>}
              </Button>
            );
          })}
        </div>
        <Button variant="ghost" size="sm" onClick={() => setMode("intro")} className="text-xs">
          ← Retour
        </Button>
      </div>
    );
  }

  // ── Mode guidé terminé ──
  if (guidedDone) {
    return (
      <div className="space-y-3">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 text-center"
        >
          <CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
          <p className="font-bold text-emerald-700 dark:text-emerald-400">
            Tous les {words.length} mots dictés !
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Prenez une photo de votre feuille et envoyez-la pour correction.
          </p>
        </motion.div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={startGuided}>↩ Recommencer</Button>
          <Button variant="outline" size="sm" onClick={() => setMode("intro")}>← Menu</Button>
        </div>
      </div>
    );
  }

  const currentPlayed = played[idx] ?? false;

  return (
    <div className="space-y-4">
      {/* Progress dots */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-muted-foreground">
          Mot {idx + 1} / {words.length}
        </span>
        <div className="flex gap-1 flex-1">
          {words.map((_, i) => (
            <div
              key={i}
              className={`flex-1 h-1.5 rounded-full transition-all ${
                i < idx ? "bg-emerald-500" : i === idx ? "bg-primary" : "bg-muted"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Zone mot */}
      <div className="p-6 rounded-xl bg-muted/40 border border-border text-center">
        {currentPlayed ? (
          <p className="text-xs text-muted-foreground">Mot écouté — écrivez-le sur votre feuille</p>
        ) : (
          <p className="text-sm text-muted-foreground italic">
            Cliquez sur "Écouter" — ne regardez pas la liste !
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button
          onClick={handleListen}
          variant={currentPlayed ? "outline" : "default"}
          className={`w-full gap-2 ${!currentPlayed ? "gradient-emerald border-0 text-primary-foreground" : ""}`}
        >
          <Volume2 className="h-5 w-5" />
          {currentPlayed ? "Réécouter" : `▶ Écouter le mot n°${idx + 1}`}
        </Button>

        {currentPlayed && (
          <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              onClick={handleNext}
              className="w-full gap-2 gradient-emerald border-0 text-primary-foreground"
            >
              ✏️ J'ai écrit →{" "}
              {idx + 1 < words.length ? `Mot ${idx + 2}/${words.length}` : "Terminé 🎉"}
            </Button>
          </motion.div>
        )}
      </div>

      <Button variant="ghost" size="sm" onClick={() => setMode("intro")} className="text-xs">
        ← Retour au menu
      </Button>
    </div>
  );
}

// Re-export CheckCircle2 used in DicteeInstruction (already imported above)

export default PresentielCourseDetail;
