// Admin: création et gestion complète des cours présentiel (Niveau 1 & 2)
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  MapPin, Trash2, Loader2, Users, Save, Plus, X, BookOpen, Languages, Headphones,
  HelpCircle, ListOrdered, Pencil, Sparkles, Wand2, Image as ImageIcon, Upload,
  MessageCircle, ExternalLink, ChevronDown, ChevronUp, Copy, CheckCircle2, Mic,
} from "lucide-react";
import { toast } from "sonner";

type Level = "niveau_1" | "niveau_2";

interface VocabItem { arabic: string; french: string }
interface ComprehensionQ { question: string; answer: string }
interface ReorderEx { words: string[]; correct_order: string[] }

interface CourseDraft {
  id?: string;
  title: string;
  level: Level;
  course_date: string;
  lesson_text: string;
  vocabulary: VocabItem[];
  comprehension_questions: ComprehensionQ[];
  reorder_exercises: ReorderEx[];
  dictation_words: string[];
  assigned_user_ids: string[];
  photo_url: string | null;
  lesson_photos: string[];
  audio_url: string | null;
}

const emptyDraft = (): CourseDraft => ({
  title: "",
  level: "niveau_1",
  course_date: new Date().toISOString().slice(0, 10),
  lesson_text: "",
  vocabulary: [{ arabic: "", french: "" }],
  comprehension_questions: [{ question: "", answer: "" }],
  reorder_exercises: [{ words: [], correct_order: [] }],
  dictation_words: [],
  assigned_user_ids: [],
  photo_url: null,
  lesson_photos: [],
  audio_url: null,
});


const AdminPresentielCourses = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [draft, setDraft] = useState<CourseDraft>(emptyDraft());
  const [saving, setSaving] = useState(false);
  const [dictationInput, setDictationInput] = useState("");
  const [aiTheme, setAiTheme] = useState("");
  const [generating, setGenerating] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingAudio, setUploadingAudio] = useState(false);
  const [generatingComprehension, setGeneratingComprehension] = useState(false);
  const [dictationRefPhotos, setDictationRefPhotos] = useState<string[]>([]);
  const [uploadingDictationPhoto, setUploadingDictationPhoto] = useState(false);
  const [generatingDictation, setGeneratingDictation] = useState(false);
  const [expandedProgress, setExpandedProgress] = useState<string | null>(null);
  const [courseProgressMap, setCourseProgressMap] = useState<Record<string, any[]>>({});
  const [loadingProgress, setLoadingProgress] = useState<string | null>(null);
  const [listLevelFilter, setListLevelFilter] = useState<"all" | Level>("all");

  const generateFromPhoto = async (publicUrl: string, levelOverride?: Level, extraPhotos?: string[]) => {
    setGenerating(true);
    try {
      const lvl = levelOverride || draft.level;
      const additional = lvl === "niveau_2" ? (extraPhotos ?? draft.lesson_photos ?? []) : [];
      const { data, error } = await supabase.functions.invoke("presentiel-ai-generate", {
        body: { photo_url: publicUrl, level: lvl, additional_photo_urls: additional },
      });
      // Erreur 402 / 429 renvoyée par l'edge function : data peut être null + error présent
      if (error) {
        const msg = (error as any).message || "";
        if (msg.includes("402") || msg.toLowerCase().includes("credit")) {
          throw new Error("⚠️ Crédits IA épuisés. Ajoute des crédits dans Lovable (Settings → Workspace → Usage) pour relancer l'OCR + génération.");
        }
        if (msg.includes("429")) {
          throw new Error("Trop de requêtes — réessaie dans 30 secondes.");
        }
        throw error;
      }
      if (data?.error) throw new Error(data.error);
      if (!data?.course) throw new Error("Réponse IA vide — réessaie.");
      const c = data.course;
      setDraft((prev) => ({
        ...prev,
        photo_url: publicUrl,
        title: c.title || prev.title,
        lesson_text: c.lesson_text || "",
        vocabulary: Array.isArray(c.vocabulary) && c.vocabulary.length ? c.vocabulary : [{ arabic: "", french: "" }],
        dictation_words: Array.isArray(c.dictation_words) ? c.dictation_words : [],
        comprehension_questions: Array.isArray(c.comprehension_questions) && c.comprehension_questions.length
          ? c.comprehension_questions : [{ question: "", answer: "" }],
        reorder_exercises: Array.isArray(c.reorder_exercises) && c.reorder_exercises.length
          ? c.reorder_exercises.map((r: any) => ({ words: r.correct_order || [], correct_order: r.correct_order || [] }))
          : [{ words: [], correct_order: [] }],
      }));
      setDictationInput("");
      toast.success("Leçon extraite et cours généré ! Vérifie et enregistre.");
    } catch (e: any) {
      console.error("[generateFromPhoto]", e);
      toast.error(e.message || "Erreur génération IA", { duration: 8000 });
    } finally {
      setGenerating(false);
    }
  };

  const handlePhotoUpload = async (files: File[] | File) => {
    if (!user) return;
    const list = Array.isArray(files) ? files : [files];
    const valid = list.filter(f => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024);
    if (valid.length === 0) { toast.error("Image(s) requise(s), max 10 Mo chacune"); return; }
    setUploadingPhoto(true);
    try {
      const urls: string[] = [];
      for (const f of valid) {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${user.id}/${Date.now()}-${urls.length}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from("presentiel-courses")
          .upload(path, f, { upsert: true, contentType: f.type });
        if (upErr) { toast.error(upErr.message); continue; }
        const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
        urls.push(publicUrl);
      }
      if (urls.length === 0) return;
      const [main, ...rest] = urls;
      setDraft((d) => ({ ...d, photo_url: main, lesson_photos: [...d.lesson_photos, ...rest].slice(0, 10) }));
      toast.success(`${urls.length} photo(s) téléchargée(s) — extraction en cours…`);
      await generateFromPhoto(main, undefined, rest);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur upload");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDictationPhotoUpload = async (files: FileList) => {
    if (!user) return;
    const remaining = 5 - dictationRefPhotos.length;
    const toUpload = Array.from(files).filter(f => f.type.startsWith("image/")).slice(0, remaining);
    if (toUpload.length === 0) return;
    if (Array.from(files).length > remaining) toast.warning(`Maximum 5 photos — ${remaining} ajoutée(s).`);
    setUploadingDictationPhoto(true);
    try {
      const newUrls: string[] = [];
      for (const f of toUpload) {
        const ext = f.name.split(".").pop() || "jpg";
        const path = `${user.id}/dictref-${Date.now()}-${newUrls.length}.${ext}`;
        const { error } = await supabase.storage.from("presentiel-courses").upload(path, f, { contentType: f.type });
        if (error) { toast.error(error.message); continue; }
        const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
        newUrls.push(publicUrl);
      }
      if (newUrls.length > 0) {
        setDictationRefPhotos(prev => [...prev, ...newUrls]);
        toast.success(`${newUrls.length} photo(s) ajoutée(s) — clique "Générer les mots" pour lancer l'IA.`);
      }
    } finally {
      setUploadingDictationPhoto(false);
    }
  };

  const generateDictationFromPreviousLessons = async () => {
    if (dictationRefPhotos.length === 0) { toast.error("Ajoute au moins une photo de leçon précédente"); return; }
    setGeneratingDictation(true);
    try {
      const { data, error } = await supabase.functions.invoke("presentiel-ai-generate", {
        body: { mode: "dictation_only", photo_urls: dictationRefPhotos },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const words: string[] = data?.dictation_words || [];
      if (words.length === 0) { toast.error("L'IA n'a pas trouvé de mots dans ces photos."); return; }
      setDraft(d => ({ ...d, dictation_words: words }));
      setDictationInput(words.join("، "));
      toast.success(`${words.length} mots de dictée générés depuis ${dictationRefPhotos.length} leçon(s) précédente(s) !`);
    } catch (e: any) {
      console.error(e);
      const msg = e.message || "";
      if (msg.includes("402") || msg.toLowerCase().includes("credit")) {
        toast.error("Crédits IA épuisés — ajoute des crédits dans Lovable.", { duration: 8000 });
      } else {
        toast.error(msg || "Erreur génération dictée");
      }
    } finally {
      setGeneratingDictation(false);
    }
  };

  const generateComprehensionFromPhoto = async (file: File) => {
    if (!user) return;
    if (!file.type.startsWith("image/")) { toast.error("Image requise"); return; }
    setGeneratingComprehension(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/comp-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-courses")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
      toast.info("Photo envoyée — génération des questions…");
      const { data, error } = await supabase.functions.invoke("presentiel-ai-generate", {
        body: { photo_url: publicUrl, level: draft.level },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const qs = data?.course?.comprehension_questions;
      if (Array.isArray(qs) && qs.length > 0) {
        setDraft((d) => ({ ...d, comprehension_questions: qs }));
        toast.success(`${qs.length} question(s) générée(s) depuis la photo !`);
      } else {
        toast.error("L'IA n'a pas pu extraire de questions depuis cette photo.");
      }
    } catch (e: any) {
      console.error(e);
      const msg = (e.message || "");
      if (msg.includes("402") || msg.toLowerCase().includes("credit")) {
        toast.error("Crédits IA épuisés — ajoute des crédits dans Lovable.", { duration: 8000 });
      } else {
        toast.error(msg || "Erreur génération compréhension");
      }
    } finally {
      setGeneratingComprehension(false);
    }
  };

  const handleAudioUpload = async (file: File) => {
    if (!user) return;
    const allowed = ["audio/mpeg", "audio/mp4", "audio/ogg", "audio/wav", "audio/webm", "audio/x-m4a"];
    if (!allowed.includes(file.type) && !file.name.match(/\.(mp3|m4a|wav|ogg|webm)$/i)) {
      toast.error("Format audio non supporté (MP3, M4A, WAV, OGG)");
      return;
    }
    if (file.size > 50 * 1024 * 1024) { toast.error("Max 50 Mo"); return; }
    setUploadingAudio(true);
    try {
      const ext = file.name.split(".").pop() || "mp3";
      const path = `${user.id}/audio-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-courses")
        .upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
      setDraft((d) => ({ ...d, audio_url: publicUrl }));
      toast.success("Audio téléchargé ! Les élèves entendront votre voix.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur upload audio");
    } finally {
      setUploadingAudio(false);
    }
  };

  const handleRegenerateFromPhoto = async () => {
    if (!draft.photo_url) { toast.error("Pas de photo"); return; }
    await generateFromPhoto(draft.photo_url);
  };

  const handleGenerateAI = async () => {
    if (!aiTheme.trim()) { toast.error("Indique un thème"); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke("presentiel-ai-generate", {
        body: { theme: aiTheme.trim(), level: draft.level },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const c = data.course;
      setDraft({
        ...draft,
        title: c.title || draft.title,
        lesson_text: c.lesson_text || "",
        vocabulary: Array.isArray(c.vocabulary) && c.vocabulary.length ? c.vocabulary : [{ arabic: "", french: "" }],
        dictation_words: Array.isArray(c.dictation_words) ? c.dictation_words : [],
        comprehension_questions: Array.isArray(c.comprehension_questions) && c.comprehension_questions.length
          ? c.comprehension_questions : [{ question: "", answer: "" }],
        reorder_exercises: Array.isArray(c.reorder_exercises) && c.reorder_exercises.length
          ? c.reorder_exercises.map((r: any) => ({ words: r.correct_order || [], correct_order: r.correct_order || [] }))
          : [{ words: [], correct_order: [] }],
      });
      setDictationInput("");
      toast.success("Cours généré ! Vérifie et enregistre.");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Erreur génération IA");
    } finally {
      setGenerating(false);
    }
  };

  const fetchData = async () => {
    const { data: c } = await supabase
      .from("presentiel_courses")
      .select("*, presentiel_course_assignments(user_id)")
      .order("course_date", { ascending: false });
    const { data: s } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, type_eleve, level")
      .eq("type_eleve", "presentiel" as any);
    setCourses(c || []);
    setStudents(s || []);
  };

  useEffect(() => { fetchData(); }, []);

  const startEdit = (c: any) => {
    setDraft({
      id: c.id,
      title: c.title || "",
      level: (c.level as Level) || "niveau_1",
      course_date: c.course_date || new Date().toISOString().slice(0, 10),
      lesson_text: c.lesson_text || "",
      vocabulary: Array.isArray(c.vocabulary) && c.vocabulary.length
        ? c.vocabulary
        : [{ arabic: "", french: "" }],
      comprehension_questions: Array.isArray(c.comprehension_questions) && c.comprehension_questions.length
        ? c.comprehension_questions
        : [{ question: "", answer: "" }],
      reorder_exercises: Array.isArray(c.reorder_exercises) && c.reorder_exercises.length
        ? c.reorder_exercises
        : [{ words: [], correct_order: [] }],
      dictation_words: Array.isArray(c.dictation_words) ? c.dictation_words : [],
      assigned_user_ids: (c.presentiel_course_assignments || []).map((a: any) => a.user_id),
      photo_url: c.photo_url || null,
      lesson_photos: Array.isArray(c.lesson_photos) ? c.lesson_photos : [],
      audio_url: c.audio_url || null,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSave = async () => {
    if (!user) return;
    if (!draft.title.trim()) { toast.error("Titre requis"); return; }
    if (!draft.lesson_text.trim()) { toast.error("Texte de leçon requis"); return; }
    setSaving(true);
    try {
      const payload = {
        title: draft.title.trim(),
        level: draft.level,
        course_date: draft.course_date,
        lesson_text: draft.lesson_text.trim(),
        vocabulary: draft.vocabulary.filter(v => v.arabic.trim() && v.french.trim()) as any,
        comprehension_questions: draft.comprehension_questions.filter(q => q.question.trim() && q.answer.trim()) as any,
        reorder_exercises: draft.reorder_exercises.filter(r => r.correct_order.length > 0) as any,
        dictation_words: draft.dictation_words.filter(w => w.trim()) as any,
        photo_url: draft.photo_url,
        lesson_photos: draft.lesson_photos as any,
        audio_url: draft.audio_url,
      };

      let courseId = draft.id;
      if (draft.id) {
        const { error } = await supabase
          .from("presentiel_courses")
          .update(payload)
          .eq("id", draft.id);
        if (error) throw error;
        await supabase.from("presentiel_course_assignments").delete().eq("course_id", draft.id);
      } else {
        const { data, error } = await supabase
          .from("presentiel_courses")
          .insert({ ...payload, created_by: user.id })
          .select()
          .single();
        if (error) throw error;
        courseId = data.id;
      }

      if (draft.assigned_user_ids.length > 0 && courseId) {
        const rows = draft.assigned_user_ids.map((uid) => ({
          course_id: courseId!,
          user_id: uid,
          assigned_by: user.id,
        }));
        const { error: aErr } = await supabase.from("presentiel_course_assignments").insert(rows);
        if (aErr) throw aErr;
      }

      // Notifie les élèves concernés (uniquement à la création)
      if (!draft.id && courseId) {
        try {
          await supabase.functions.invoke("notify-new-lesson", {
            body: {
              module: "presentiel",
              courseId,
              lessonTitle: payload.title,
            },
          });
        } catch (notifyErr) {
          console.warn("Notification non envoyée", notifyErr);
        }
      }

      toast.success(draft.id ? "Cours mis à jour" : "Cours créé");
      setDraft(emptyDraft());
      setDictationInput("");
      fetchData();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erreur enregistrement");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce cours ?")) return;
    await supabase.from("presentiel_course_assignments").delete().eq("course_id", id);
    await supabase.from("presentiel_courses").delete().eq("id", id);
    toast.success("Cours supprimé");
    fetchData();
  };

  const loadProgress = async (courseId: string) => {
    setLoadingProgress(courseId);
    const course = courses.find((c) => c.id === courseId);
    const assigned: any[] = course?.presentiel_course_assignments || [];
    const userIds: string[] = assigned.map((a: any) => a.user_id);
    if (userIds.length === 0) {
      setCourseProgressMap((prev) => ({ ...prev, [courseId]: [] }));
      setLoadingProgress(null);
      return;
    }
    const [{ data: progressData }, { data: readingData }, { data: subsData }] = await Promise.all([
      supabase.from("presentiel_course_progress").select("*").eq("course_id", courseId).in("user_id", userIds),
      supabase.from("presentiel_reading_scores").select("user_id, score_percent").eq("course_id", courseId).in("user_id", userIds).order("score_percent", { ascending: false }),
      supabase.from("presentiel_submissions").select("user_id, step_type, status").eq("course_id", courseId).in("user_id", userIds),
    ]);
    const byUser = Object.fromEntries((progressData || []).map((p: any) => [p.user_id, p]));
    const readingBest: Record<string, number> = {};
    (readingData || []).forEach((r: any) => { if (!readingBest[r.user_id]) readingBest[r.user_id] = r.score_percent; });
    const subsByUser: Record<string, Record<string, string>> = {};
    (subsData || []).forEach((s: any) => {
      if (!subsByUser[s.user_id]) subsByUser[s.user_id] = {};
      subsByUser[s.user_id][s.step_type] = s.status;
    });
    const result = userIds.map((uid: string) => {
      const stu = students.find((s) => s.user_id === uid);
      const prog = byUser[uid] || {};
      const subs = subsByUser[uid] || {};
      return {
        userId: uid,
        name: stu ? `${stu.first_name} ${stu.last_name}` : "Élève inconnu",
        lectureScore: readingBest[uid] ?? null,
        ecritureStatus: subs["ecriture"] || null,
        dicteeStatus: subs["dictee"] || null,
        vocabDone: !!(prog.qcm_completed || prog.translation_completed),
      };
    });
    setCourseProgressMap((prev) => ({ ...prev, [courseId]: result }));
    setLoadingProgress(null);
  };

  const buildWhatsAppUrl = (course: any): string => {
    const dateStr = new Date(course.course_date).toLocaleDateString("fr-FR", {
      day: "numeric", month: "long",
    });
    const isN2 = course.level === "niveau_2";
    const steps = isN2
      ? "📖 Lecture orale\n✏️ Écriture (×3)\n📝 Vocabulaire\n💬 Compréhension\n🔤 Remise en ordre\n🎧 Dictée"
      : "📖 Lecture orale\n✏️ Écriture (×3)\n📝 Vocabulaire\n🎧 Dictée";
    const msg = `📚 *Devoir Alfasl*\n\n*${course.title}*\n📅 Cours du ${dateStr}\n\n*Exercices à compléter :*\n${steps}\n\n👉 Connectez-vous sur *alfasl.fr* → "Cours en présentiel"\n\nBonne étude ! 🌟`;
    return `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  const copyHomeworkText = async (course: any) => {
    const dateStr = new Date(course.course_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });
    const isN2 = course.level === "niveau_2";
    const steps = isN2
      ? "📖 Lecture · ✏️ Écriture · 📝 Vocabulaire · 💬 Compréhension · 🔤 Remise en ordre · 🎧 Dictée"
      : "📖 Lecture · ✏️ Écriture · 📝 Vocabulaire · 🎧 Dictée";
    const text = `Devoir Alfasl — ${course.title} (${dateStr})\n${steps}\n→ alfasl.fr`;
    await navigator.clipboard.writeText(text);
    toast.success("Texte copié ! Collez-le dans votre groupe WhatsApp.");
  };

  // Filter students by selected level
  const filteredStudents = students.filter(
    (s) => !s.level || s.level === draft.level
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <MapPin className="h-5 w-5 text-gold" />
        <h2 className="text-xl font-bold text-foreground">Cours en présentiel</h2>
      </div>

      <Card>
        <CardContent className="p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-foreground">
              {draft.id ? "Modifier le cours" : "Nouveau cours"}
            </h3>
            {draft.id && (
              <Button size="sm" variant="ghost" onClick={() => setDraft(emptyDraft())}>
                <X className="h-4 w-4 mr-1" /> Annuler l'édition
              </Button>
            )}
          </div>

          {/* Niveau (nécessaire avant la génération) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label>Titre du cours</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Sera rempli automatiquement après la génération"
              />
            </div>
            <div>
              <Label>Niveau</Label>
              <Select value={draft.level} onValueChange={(v) => setDraft({ ...draft, level: v as Level })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="niveau_1">Niveau 1</SelectItem>
                  <SelectItem value="niveau_2">Niveau 2</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Date du cours</Label>
            <Input
              type="date"
              value={draft.course_date}
              onChange={(e) => setDraft({ ...draft, course_date: e.target.value })}
            />
          </div>

          {/* Bloc PRINCIPAL : Photo → OCR → Génération automatique de tout */}
          <div className="p-4 rounded-lg border-2 border-dashed border-gold/60 bg-gradient-to-br from-gold/10 to-emerald/5 space-y-3">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-gold" />
              <h4 className="font-semibold text-foreground">
                Génération automatique depuis la photo de la leçon
              </h4>
            </div>
            <p className="text-xs text-muted-foreground">
              Téléverse la photo de la page du livre. L'IA va <strong>extraire le texte arabe</strong> avec les harakat,
              puis générer automatiquement le titre, le vocabulaire, la dictée
              {draft.level === "niveau_2" && ", les questions de compréhension et la remise en ordre"}.
              Tout sera basé sur le texte exact de ta leçon.
            </p>

            {draft.photo_url ? (
              <div className="space-y-2">
                <div className="relative rounded-lg border border-border overflow-hidden bg-white">
                  <img
                    src={draft.photo_url}
                    alt="Aperçu de la leçon"
                    className="w-full max-h-80 object-contain"
                  />
                  {generating && (
                    <div className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center gap-2">
                      <Loader2 className="h-8 w-8 animate-spin text-gold" />
                      <span className="text-sm font-medium">Extraction et génération en cours…</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleRegenerateFromPhoto}
                    disabled={generating}
                  >
                    {generating
                      ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Génération…</>)
                      : (<><Wand2 className="h-4 w-4 mr-2" />Régénérer depuis cette photo</>)}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDraft({ ...draft, photo_url: null })}
                    disabled={generating}
                  >
                    <X className="h-4 w-4 mr-1" /> Retirer la photo
                  </Button>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center gap-2 p-8 rounded-lg border-2 border-dashed border-gold/40 hover:border-gold hover:bg-gold/5 cursor-pointer transition bg-background/50">
                {uploadingPhoto || generating
                  ? <Loader2 className="h-8 w-8 animate-spin text-gold" />
                  : <Upload className="h-8 w-8 text-gold" />}
                <span className="text-sm font-medium text-foreground">
                  {uploadingPhoto ? "Téléchargement…" : generating ? "Extraction du texte…" : "Téléverser la photo de la leçon"}
                </span>
                <span className="text-xs text-muted-foreground">JPG, PNG · max 10 Mo · OCR + génération automatique</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  disabled={uploadingPhoto || generating}
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    if (files.length) handlePhotoUpload(files);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          {/* Pages additionnelles de la leçon (max 10) */}
          <div className="p-4 rounded-lg border border-border bg-muted/20 space-y-3">
            <Label className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" /> Pages additionnelles de la leçon
              <Badge variant="outline" className="ml-1">{draft.lesson_photos.length}/10</Badge>
            </Label>
            <p className="text-xs text-muted-foreground">
              Ajoutez d'autres pages du livre (affichées dans l'ordre à l'élève). Maximum 10 pages.
            </p>
            {draft.lesson_photos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {draft.lesson_photos.map((url, i) => (
                  <div key={i} className="relative group">
                    <img src={url} alt={`Page ${i + 1}`} className="w-full aspect-square object-cover rounded border border-border" />
                    <span className="absolute top-1 left-1 bg-background/80 text-xs px-1 rounded">{i + 1}</span>
                    <button
                      onClick={() => setDraft({ ...draft, lesson_photos: draft.lesson_photos.filter((_, j) => j !== i) })}
                      className="absolute top-1 right-1 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <label className="inline-flex items-center gap-2 px-3 py-2 rounded border border-dashed border-border hover:bg-muted cursor-pointer text-sm">
              <Upload className="h-4 w-4" />
              Ajouter des pages
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={draft.lesson_photos.length >= 10 || !user}
                onChange={async (e) => {
                  const files = Array.from(e.target.files || []);
                  e.target.value = "";
                  if (!user || files.length === 0) return;
                  const remaining = 10 - draft.lesson_photos.length;
                  const toUpload = files.slice(0, remaining);
                  if (files.length > remaining) toast.warning(`Limite 10 pages — ${remaining} ajoutée(s).`);
                  const newUrls: string[] = [];
                  for (const f of toUpload) {
                    if (!f.type.startsWith("image/")) continue;
                    const ext = f.name.split(".").pop() || "jpg";
                    const path = `${user.id}/lesson-${Date.now()}-${newUrls.length}.${ext}`;
                    const { error } = await supabase.storage.from("presentiel-courses").upload(path, f, { contentType: f.type });
                    if (error) { toast.error(error.message); continue; }
                    const { data: { publicUrl } } = supabase.storage.from("presentiel-courses").getPublicUrl(path);
                    newUrls.push(publicUrl);
                  }
                  if (newUrls.length > 0) {
                    setDraft((d) => ({ ...d, lesson_photos: [...d.lesson_photos, ...newUrls] }));
                    toast.success(`${newUrls.length} page(s) ajoutée(s)`);
                  }
                }}
              />
            </label>
          </div>

          {/* Audio du professeur pour la lecture */}
          <div className="p-4 rounded-lg border border-dashed border-emerald-500/40 bg-emerald-50/30 dark:bg-emerald-950/20 space-y-3">
            <Label className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
              <Mic className="h-4 w-4" /> Enregistrement audio de la leçon (votre voix)
            </Label>
            <p className="text-xs text-muted-foreground">
              Uploadez votre propre lecture de la leçon (MP3, M4A, WAV…). Les élèves entendront <strong>votre voix</strong> au lieu de la synthèse vocale — bien plus pédagogique !
            </p>
            {draft.audio_url ? (
              <div className="space-y-2">
                <audio controls src={draft.audio_url} className="w-full rounded" style={{ height: "44px" }} />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive"
                    onClick={() => setDraft((d) => ({ ...d, audio_url: null }))}
                  >
                    <X className="h-4 w-4 mr-1" /> Supprimer l'audio
                  </Button>
                </div>
              </div>
            ) : (
              <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer transition text-sm font-medium">
                {uploadingAudio
                  ? <><Loader2 className="h-4 w-4 animate-spin" /> Téléchargement…</>
                  : <><Upload className="h-4 w-4" /> Choisir un fichier audio</>}
                <input
                  type="file"
                  accept="audio/*"
                  className="hidden"
                  disabled={uploadingAudio}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleAudioUpload(f);
                    e.target.value = "";
                  }}
                />
              </label>
            )}
          </div>

          {/* Alternative : génération depuis un thème (sans photo) */}
          <details className="rounded-lg border border-border p-3">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Sparkles className="h-4 w-4" /> Pas de photo ? Générer depuis un thème
            </summary>
            <div className="flex gap-2 mt-3">
              <Input
                value={aiTheme}
                onChange={(e) => setAiTheme(e.target.value)}
                placeholder="Ex: La famille, Les couleurs, Le verbe au présent…"
                disabled={generating}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleGenerateAI(); } }}
              />
              <Button
                onClick={handleGenerateAI}
                disabled={generating || !aiTheme.trim()}
                variant="outline"
                className="shrink-0"
              >
                {generating
                  ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Génération…</>)
                  : (<><Wand2 className="h-4 w-4 mr-2" />Générer</>)}
              </Button>
            </div>
          </details>

          {/* Lesson text */}
          <div>
            <Label className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" /> Texte arabe à lire (avec harakat)
            </Label>
            <Textarea
              dir="rtl"
              value={draft.lesson_text}
              onChange={(e) => setDraft({ ...draft, lesson_text: e.target.value })}
              placeholder="اكتب هنا نصّ الدرس بالحركات…"
              className="min-h-[120px] font-amiri text-xl text-right"
            />
          </div>

          {/* Vocabulary */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Languages className="h-4 w-4" /> Vocabulaire (arabe / français)
            </Label>
            {draft.vocabulary.map((v, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  dir="rtl"
                  className="font-amiri text-lg text-right"
                  value={v.arabic}
                  onChange={(e) => {
                    const arr = [...draft.vocabulary];
                    arr[i] = { ...arr[i], arabic: e.target.value };
                    setDraft({ ...draft, vocabulary: arr });
                  }}
                  placeholder="كلمة"
                />
                <Input
                  value={v.french}
                  onChange={(e) => {
                    const arr = [...draft.vocabulary];
                    arr[i] = { ...arr[i], french: e.target.value };
                    setDraft({ ...draft, vocabulary: arr });
                  }}
                  placeholder="Traduction française"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDraft({ ...draft, vocabulary: draft.vocabulary.filter((_, j) => j !== i) })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDraft({ ...draft, vocabulary: [...draft.vocabulary, { arabic: "", french: "" }] })}
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter un mot
            </Button>
          </div>

          {/* Compréhension — Niveau 2 uniquement */}
          {draft.level === "niveau_2" && (
          <div className="space-y-2 p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <Label className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" /> Questions de compréhension (Niveau 2)
                <Badge variant="outline" className="text-xs">Niveau 2</Badge>
              </Label>
              {/* Génération depuis une photo d'exercice */}
              <label className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-primary/50 hover:bg-primary/10 cursor-pointer transition text-xs font-medium ${generatingComprehension ? "opacity-60 pointer-events-none" : ""}`}>
                {generatingComprehension
                  ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération…</>
                  : <><Wand2 className="h-3.5 w-3.5" /> Générer depuis une photo</>}
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={generatingComprehension}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) generateComprehensionFromPhoto(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-muted-foreground">
              Tu peux photographier un exercice du livre et l'IA génère les questions automatiquement, ou les saisir manuellement.
            </p>
            {draft.comprehension_questions.map((q, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  dir="rtl"
                  className="font-amiri text-right"
                  value={q.question}
                  onChange={(e) => {
                    const arr = [...draft.comprehension_questions];
                    arr[i] = { ...arr[i], question: e.target.value };
                    setDraft({ ...draft, comprehension_questions: arr });
                  }}
                  placeholder="السؤال…"
                />
                <Input
                  dir="rtl"
                  className="font-amiri text-right"
                  value={q.answer}
                  onChange={(e) => {
                    const arr = [...draft.comprehension_questions];
                    arr[i] = { ...arr[i], answer: e.target.value };
                    setDraft({ ...draft, comprehension_questions: arr });
                  }}
                  placeholder="الجواب الصحيح"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setDraft({
                    ...draft,
                    comprehension_questions: draft.comprehension_questions.filter((_, j) => j !== i),
                  })}
                >
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            ))}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setDraft({
                ...draft,
                comprehension_questions: [...draft.comprehension_questions, { question: "", answer: "" }],
              })}
            >
              <Plus className="h-4 w-4 mr-1" /> Ajouter une question manuellement
            </Button>
          </div>

          )}

          {/* Niveau 2 only — Reorder */}
          {draft.level === "niveau_2" && (
            <div className="space-y-3 p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5">
              <Label className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4" /> Exercices de remise en ordre (Niveau 2)
              </Label>
              <p className="text-xs text-muted-foreground">
                Saisissez la phrase correcte OU éditez chaque mot individuellement. Les mots seront mélangés pour l'élève.
              </p>
              {draft.reorder_exercises.map((r, i) => (
                <div key={i} className="space-y-2 p-3 rounded-md border bg-background">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Phrase {i + 1}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setDraft({
                        ...draft,
                        reorder_exercises: draft.reorder_exercises.filter((_, j) => j !== i),
                      })}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <Input
                    dir="rtl"
                    className="font-amiri text-lg text-right"
                    value={r.correct_order.join(" ")}
                    onChange={(e) => {
                      const words = e.target.value.split(/\s+/).filter(Boolean);
                      const arr = [...draft.reorder_exercises];
                      arr[i] = { words, correct_order: words };
                      setDraft({ ...draft, reorder_exercises: arr });
                    }}
                    placeholder="ذهبَ الطّالبُ إلى المدرسةِ"
                  />

                  {r.correct_order.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-[11px] text-muted-foreground">Édition mot par mot (ordre correct, droite → gauche) :</p>
                      <div className="flex flex-wrap gap-2" dir="rtl">
                        {r.correct_order.map((w, wi) => (
                          <div key={wi} className="flex items-center gap-1">
                            <Input
                              dir="rtl"
                              className="font-amiri text-base text-right h-9 w-28"
                              value={w}
                              onChange={(e) => {
                                const newWords = [...r.correct_order];
                                newWords[wi] = e.target.value.trim();
                                const cleaned = newWords.filter(Boolean);
                                const arr = [...draft.reorder_exercises];
                                arr[i] = { words: cleaned, correct_order: cleaned };
                                setDraft({ ...draft, reorder_exercises: arr });
                              }}
                            />
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-7 w-7"
                              onClick={() => {
                                const newWords = r.correct_order.filter((_, j) => j !== wi);
                                const arr = [...draft.reorder_exercises];
                                arr[i] = { words: newWords, correct_order: newWords };
                                setDraft({ ...draft, reorder_exercises: arr });
                              }}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-9"
                          onClick={() => {
                            const newWords = [...r.correct_order, ""];
                            const arr = [...draft.reorder_exercises];
                            arr[i] = { words: newWords, correct_order: newWords };
                            setDraft({ ...draft, reorder_exercises: arr });
                          }}
                        >
                          <Plus className="h-3 w-3 mr-1" /> Mot
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              <Button
                size="sm"
                variant="outline"
                onClick={() => setDraft({
                  ...draft,
                  reorder_exercises: [...draft.reorder_exercises, { words: [], correct_order: [] }],
                })}
              >
                <Plus className="h-4 w-4 mr-1" /> Ajouter une phrase
              </Button>
            </div>
          )}

          {/* Dictation — depuis leçons précédentes OU saisie manuelle */}
          <div className="space-y-3">
            {/* Bloc photo → IA → mots */}
            <div className="p-4 rounded-lg border border-dashed border-blue-400/50 bg-blue-50/30 dark:bg-blue-950/20 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <Label className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                  <Headphones className="h-4 w-4" /> Dictée depuis les leçons précédentes
                </Label>
                <Badge variant="outline" className="text-xs">{dictationRefPhotos.length}/5 photos</Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Photographie les pages des leçons précédentes — l'IA sélectionne 10 à 15 mots représentatifs pour la dictée de révision.
              </p>

              {/* Miniatures des photos uploadées */}
              {dictationRefPhotos.length > 0 && (
                <div className="grid grid-cols-5 gap-2">
                  {dictationRefPhotos.map((url, i) => (
                    <div key={i} className="relative group">
                      <img src={url} alt={`Leçon ${i + 1}`} className="w-full aspect-square object-cover rounded border border-border" />
                      <span className="absolute bottom-0.5 left-0.5 bg-background/80 text-[10px] px-1 rounded">{i + 1}</span>
                      <button
                        onClick={() => setDictationRefPhotos(prev => prev.filter((_, j) => j !== i))}
                        className="absolute top-0.5 right-0.5 bg-destructive text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2 flex-wrap items-center">
                {/* Upload multi-photos */}
                <label className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/30 cursor-pointer transition text-sm font-medium ${uploadingDictationPhoto || dictationRefPhotos.length >= 5 ? "opacity-50 pointer-events-none" : ""}`}>
                  {uploadingDictationPhoto
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Téléchargement…</>
                    : <><Upload className="h-4 w-4" /> Ajouter des photos</>}
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    disabled={uploadingDictationPhoto || dictationRefPhotos.length >= 5}
                    onChange={(e) => {
                      if (e.target.files?.length) handleDictationPhotoUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>

                {/* Bouton génération */}
                {dictationRefPhotos.length > 0 && (
                  <Button
                    size="sm"
                    onClick={generateDictationFromPreviousLessons}
                    disabled={generatingDictation}
                    className="gradient-emerald border-0 text-primary-foreground"
                  >
                    {generatingDictation
                      ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération en cours…</>
                      : <><Wand2 className="h-4 w-4 mr-1" /> Générer les mots de dictée</>}
                  </Button>
                )}

                {dictationRefPhotos.length > 0 && (
                  <Button size="sm" variant="ghost" className="text-muted-foreground text-xs"
                    onClick={() => setDictationRefPhotos([])}>
                    <X className="h-3 w-3 mr-1" /> Effacer les photos
                  </Button>
                )}
              </div>
            </div>

            {/* Textarea manuelle */}
            <div className="space-y-1">
              <Label className="flex items-center gap-2 text-sm text-muted-foreground">
                <Headphones className="h-4 w-4" /> Mots de la dictée (modifiables, séparés par virgule)
              </Label>
              <Textarea
                dir="rtl"
                className="font-amiri text-lg text-right min-h-[80px]"
                value={dictationInput || draft.dictation_words.join("، ")}
                onChange={(e) => {
                  setDictationInput(e.target.value);
                  const words = e.target.value.split(/[,،]/).map(w => w.trim()).filter(Boolean);
                  setDraft({ ...draft, dictation_words: words });
                }}
                placeholder="كلمة، كلمة، كلمة — ou génère depuis les photos ci-dessus"
              />
              {draft.dictation_words.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {draft.dictation_words.map((w, i) => (
                    <Badge key={i} variant="secondary" className="font-amiri text-base">{w}</Badge>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Assignations */}
          <div>
            <Label className="flex items-center gap-2">
              <Users className="h-4 w-4" /> Assigner aux élèves présentiel ({filteredStudents.length})
            </Label>
            <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-2 space-y-1">
              {filteredStudents.length === 0 && (
                <p className="text-xs text-muted-foreground p-2">
                  Aucun élève en présentiel pour ce niveau.
                </p>
              )}
              {filteredStudents.map((s) => (
                <label key={s.user_id} className="flex items-center gap-2 px-2 py-1 hover:bg-muted rounded cursor-pointer">
                  <Checkbox
                    checked={draft.assigned_user_ids.includes(s.user_id)}
                    onCheckedChange={(checked) => {
                      setDraft({
                        ...draft,
                        assigned_user_ids: checked
                          ? [...draft.assigned_user_ids, s.user_id]
                          : draft.assigned_user_ids.filter((id) => id !== s.user_id),
                      });
                    }}
                  />
                  <span className="text-sm">{s.first_name} {s.last_name}</span>
                </label>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving || !draft.title.trim() || !draft.lesson_text.trim()}
            className="w-full gradient-emerald border-0 text-primary-foreground"
          >
            {saving
              ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enregistrement…</>)
              : (<><Save className="h-4 w-4 mr-2" />{draft.id ? "Mettre à jour" : "Créer le cours"}</>)}
          </Button>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h3 className="font-semibold text-foreground">
            Cours existants ({courses.filter(c => listLevelFilter === "all" || c.level === listLevelFilter).length})
          </h3>
          <div className="flex gap-2">
            {(["all", "niveau_1", "niveau_2"] as const).map((l) => (
              <button
                key={l}
                onClick={() => setListLevelFilter(l)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  listLevelFilter === l
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {l === "all" ? "Tous" : l === "niveau_1" ? "Niveau 1" : "Niveau 2"}
              </button>
            ))}
          </div>
        </div>
        {courses.filter(c => listLevelFilter === "all" || c.level === listLevelFilter).map((c) => {
          const isExpanded = expandedProgress === c.id;
          const progress = courseProgressMap[c.id];
          const assignedCount = c.presentiel_course_assignments?.length || 0;

          return (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="p-4 space-y-0">
                {/* Course header row */}
                <div className="flex items-center gap-3">
                  <Badge variant={c.level === "niveau_2" ? "default" : "outline"}>
                    {c.level === "niveau_2" ? "N2" : "N1"}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground truncate">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(c.course_date).toLocaleDateString("fr-FR")} · {assignedCount} élève(s)
                    </p>
                  </div>
                  {/* Action buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* WhatsApp — envoyer les devoirs */}
                    <a
                      href={buildWhatsAppUrl(c)}
                      target="_blank"
                      rel="noreferrer"
                      title="Envoyer les devoirs via WhatsApp"
                    >
                      <Button size="icon" variant="ghost" className="text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700">
                        <MessageCircle className="h-4 w-4" />
                      </Button>
                    </a>
                    {/* Copy homework text */}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Copier le résumé des devoirs"
                      onClick={() => copyHomeworkText(c)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    {/* Progress toggle */}
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Voir les progrès des élèves"
                      onClick={() => {
                        if (isExpanded) {
                          setExpandedProgress(null);
                        } else {
                          setExpandedProgress(c.id);
                          if (!courseProgressMap[c.id]) loadProgress(c.id);
                        }
                      }}
                    >
                      {isExpanded
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4 text-primary" />}
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => startEdit(c)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress panel */}
                {isExpanded && (
                  <div className="mt-3 border-t border-border pt-3">
                    {loadingProgress === c.id ? (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
                        <Loader2 className="h-3 w-3 animate-spin" /> Chargement des progrès…
                      </div>
                    ) : !progress || progress.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-2">Aucun élève assigné ou aucune activité enregistrée.</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                          Progression des élèves
                        </p>
                        {/* Header row */}
                        <div className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center text-[10px] font-semibold text-muted-foreground px-1">
                          <span>Élève</span>
                          <span className="text-center">📖 Lecture</span>
                          <span className="text-center">✏️ Écriture</span>
                          <span className="text-center">📝 Vocab</span>
                          <span className="text-center">🎧 Dictée</span>
                        </div>
                        {progress.map((p) => (
                          <div
                            key={p.userId}
                            className="grid grid-cols-[1fr_auto_auto_auto_auto] gap-2 items-center p-2 rounded-lg bg-muted/30 hover:bg-muted/50 text-sm"
                          >
                            <span className="font-medium text-foreground truncate">{p.name}</span>
                            {/* Lecture */}
                            <span className="text-center">
                              {p.lectureScore !== null
                                ? <Badge variant={p.lectureScore >= 70 ? "default" : "outline"} className="text-[10px] h-5 px-1">{p.lectureScore}%</Badge>
                                : <span className="text-muted-foreground text-xs">—</span>}
                            </span>
                            {/* Écriture */}
                            <span className="text-center text-base">
                              {p.ecritureStatus === "validee" ? "✅" : p.ecritureStatus === "a_corriger" ? "❌" : p.ecritureStatus === "en_attente" ? "⏳" : "—"}
                            </span>
                            {/* Vocabulaire */}
                            <span className="text-center text-base">
                              {p.vocabDone ? "✅" : "—"}
                            </span>
                            {/* Dictée */}
                            <span className="text-center text-base">
                              {p.dicteeStatus === "validee" ? "✅" : p.dicteeStatus === "a_corriger" ? "❌" : p.dicteeStatus === "en_attente" ? "⏳" : "—"}
                            </span>
                          </div>
                        ))}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs text-primary gap-1 mt-1"
                          onClick={() => loadProgress(c.id)}
                        >
                          <CheckCircle2 className="h-3 w-3" /> Actualiser
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default AdminPresentielCourses;
