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
  HelpCircle, ListOrdered, Pencil, Sparkles, Wand2,
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="md:col-span-2">
              <Label>Titre du cours</Label>
              <Input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="Ex: Leçon du 21 avril – Le verbe"
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

          {/* Niveau 2 only — Comprehension */}
          {draft.level === "niveau_2" && (
            <div className="space-y-2 p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5">
              <Label className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" /> Questions de compréhension (Niveau 2)
              </Label>
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
                <Plus className="h-4 w-4 mr-1" /> Ajouter une question
              </Button>
            </div>
          )}

          {/* Niveau 2 only — Reorder */}
          {draft.level === "niveau_2" && (
            <div className="space-y-2 p-4 rounded-lg border border-dashed border-primary/40 bg-primary/5">
              <Label className="flex items-center gap-2">
                <ListOrdered className="h-4 w-4" /> Exercices de remise en ordre (Niveau 2)
              </Label>
              <p className="text-xs text-muted-foreground">
                Saisissez la phrase correcte. Les mots seront mélangés automatiquement pour l'élève.
              </p>
              {draft.reorder_exercises.map((r, i) => (
                <div key={i} className="flex gap-2">
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

          {/* Dictation */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Headphones className="h-4 w-4" /> Mots de la dictée (séparés par virgule)
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
              placeholder="كلمة، كلمة، كلمة"
            />
            {draft.dictation_words.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {draft.dictation_words.map((w, i) => (
                  <Badge key={i} variant="secondary" className="font-amiri text-base">{w}</Badge>
                ))}
              </div>
            )}
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

      <div className="space-y-2">
        <h3 className="font-semibold text-foreground">Cours existants ({courses.length})</h3>
        {courses.map((c) => (
          <Card key={c.id}>
            <CardContent className="p-4 flex items-center gap-3">
              <Badge variant={c.level === "niveau_2" ? "default" : "outline"}>
                {c.level === "niveau_2" ? "N2" : "N1"}
              </Badge>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{c.title}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(c.course_date).toLocaleDateString("fr-FR")}
                  {" · "}
                  {(c.presentiel_course_assignments?.length || 0)} élève(s)
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => startEdit(c)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => handleDelete(c.id)} className="text-destructive">
                <Trash2 className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminPresentielCourses;
