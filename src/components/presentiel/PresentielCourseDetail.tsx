// Composant Niveau 1 — 4 étapes séquentielles : Lecture, Écriture, Traduction, Dictée
// Présentiel — refonte from scratch

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mic, Square, Volume2, Camera, CheckCircle2, XCircle,
  ArrowRight, Loader2, RotateCcw, Award, BookOpen, PenLine, Languages, Headphones,
  HelpCircle, ListOrdered, ChevronDown, ChevronUp,
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

type Step = "lecture" | "ecriture" | "traduction" | "comprehension" | "reorder" | "dictee" | "done";

const STEP_LABEL: Record<Exclude<Step, "done">, { label: string; icon: typeof BookOpen }> = {
  lecture: { label: "Lecture", icon: BookOpen },
  ecriture: { label: "Écriture", icon: PenLine },
  traduction: { label: "Traduction", icon: Languages },
  comprehension: { label: "Compréhension", icon: HelpCircle },
  reorder: { label: "Remise en ordre", icon: ListOrdered },
  dictee: { label: "Dictée", icon: Headphones },
};

// ─── Step 1: Lecture (enregistrement soumis au professeur humain) ───
function LectureStep({ course, onDone }: { course: PresentielCourseV2; onDone: () => void }) {
  const { user } = useAuth();
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submission, setSubmission] = useState<any>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const hasTeacherAudio = !!(course.audio_url);

  const refresh = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("presentiel_submissions")
      .select("*")
      .eq("course_id", course.id)
      .eq("user_id", user.id)
      .eq("step_type", "lecture" as any)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (data) {
      setSubmission(data);
      if ((data as any).status !== "en_attente" && !(data as any).seen_by_student) {
        await supabase
          .from("presentiel_submissions")
          .update({ seen_by_student: true } as any)
          .eq("id", (data as any).id);
      }
    }
  };

  useEffect(() => { refresh(); }, [user, course.id]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await uploadRecording(blob);
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

  const uploadRecording = async (blob: Blob) => {
    if (!user) return;
    setUploading(true);
    try {
      const path = `${user.id}/${course.id}/lecture-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-submissions")
        .upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from("presentiel-submissions")
        .getPublicUrl(path);

      const { data, error } = await supabase
        .from("presentiel_submissions")
        .insert({
          course_id: course.id,
          user_id: user.id,
          step_type: "lecture" as any,
          audio_url: publicUrl,
          photo_url: null as any,
          photo_urls: [] as any,
          status: "en_attente",
        } as any)
        .select()
        .single();
      if (error) throw error;
      setSubmission(data);
      toast.success("Lecture envoyée à votre professeur ✅");
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const pages = Array.from(
    new Set([
      ...(course.photo_url ? [course.photo_url] : []),
      ...(Array.isArray(course.lesson_photos) ? course.lesson_photos : []),
    ])
  );

  return (
    <Card>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-foreground text-lg">Étape 1 — Lecture</h3>
        </div>

        {pages.length > 0 && (
          <div className="space-y-3">
            {pages.length > 1 && (
              <p className="text-xs text-muted-foreground">
                📖 {pages.length} pages — lisez la leçon directement depuis la photo
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
        )}

        {hasTeacherAudio && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Volume2 className="h-3 w-3" /> Voix de votre professeur — écoutez, puis lisez à voix haute
            </p>
            <audio controls src={course.audio_url!} className="w-full rounded-lg" style={{ height: "44px" }} />
          </div>
        )}

        <div className="p-4 rounded-lg border border-dashed border-border bg-muted/20 text-sm text-muted-foreground">
          🎙️ Lisez la leçon à voix haute, puis envoyez votre enregistrement à votre professeur pour validation.
        </div>

        <div className="flex flex-wrap gap-2">
          {!recording ? (
            <Button
              onClick={startRecording}
              disabled={uploading}
              className="gap-2 gradient-emerald border-0 text-primary-foreground"
            >
              <Mic className="h-4 w-4" />
              {uploading ? "Envoi…" : submission ? "Réenregistrer" : "Enregistrer ma lecture"}
            </Button>
          ) : (
            <Button onClick={stopRecording} variant="destructive" className="gap-2 animate-pulse">
              <Square className="h-4 w-4" /> Arrêter
            </Button>
          )}
        </div>

        {uploading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Envoi de votre enregistrement…
          </div>
        )}

        {submission && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            {submission.audio_url && (
              <audio controls src={submission.audio_url} className="w-full rounded-lg" style={{ height: "44px" }} />
            )}

            {submission.status === "en_attente" && (
              <div className="p-3 rounded-lg border border-border bg-muted/40">
                <Badge variant="outline">⏳ En attente de validation par votre professeur</Badge>
                <p className="text-xs text-muted-foreground mt-2">
                  Vous pouvez continuer la leçon en attendant la correction.
                </p>
              </div>
            )}
            {submission.status !== "en_attente" && (
              <div className={`p-4 rounded-lg border-2 ${
                submission.status === "validee"
                  ? "border-emerald-500 bg-emerald-500/10"
                  : "border-destructive bg-destructive/10"
              }`}>
                <p className={`font-bold text-lg ${
                  submission.status === "validee" ? "text-emerald-700" : "text-destructive"
                }`}>
                  {submission.status === "validee" ? "✅ Validée par votre professeur" : "❌ À refaire"}
                </p>
                {submission.feedback && (
                  <div className="mt-3 p-3 rounded bg-background/60 border border-border">
                    <p className="text-xs font-semibold mb-1">Commentaire du professeur :</p>
                    <p className="text-foreground italic">« {submission.feedback} »</p>
                  </div>
                )}
              </div>
            )}

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

// ─── Helper : Référence leçon dépliable (utilisée dans Écriture) ───
function LessonReference({ course }: { course: PresentielCourseV2 }) {
  const [open, setOpen] = useState(false);
  const { speak } = useArabicSpeech();
  const photos = Array.from(
    new Set([
      ...(course.photo_url ? [course.photo_url] : []),
      ...(Array.isArray(course.lesson_photos) ? course.lesson_photos : []),
    ])
  );
  if (photos.length === 0) return null;
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

// ─── Main ───
const PresentielCourseDetail = ({ course, userProgress, onProgressUpdate }: Props) => {
  const { user } = useAuth();
  const isN2 = course.level === "niveau_2";
  const stepsOrder: Exclude<Step, "done">[] = isN2
    ? ["lecture", "ecriture", "traduction", "comprehension", "reorder", "dictee"]
    : ["lecture", "ecriture", "traduction", "dictee"];

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
      <div className={`grid gap-2 ${isN2 ? "grid-cols-3 sm:grid-cols-6" : "grid-cols-5"}`}>
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
          {step === "lecture" && (
            <LectureStep course={course} onDone={goNext} />
          )}
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
                <DicteeInstruction words={course.dictation_words || []} />
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

// Helper: dictée — mode mot par mot (clic par clic)
function DicteeInstruction({ words }: { words: string[] }) {
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
    await speak(words[idx]);
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
          {words.map((w, i) => (
            <Button key={i} size="sm" variant="outline" onClick={() => speak(w)} className="gap-1 font-amiri text-lg">
              <Volume2 className="h-3 w-3" /> {i + 1}
            </Button>
          ))}
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
