// Interface admin : correction des photos manuscrites des élèves présentiel
// + visualisation des scores de lecture
// + Correction IA automatique via Gemini (presentiel-auto-correct)

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Loader2, MessageSquare, Image as ImageIcon, Mic, Search,
  Sparkles, Star,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface Submission {
  id: string;
  course_id: string;
  user_id: string;
  step_type: "ecriture" | "dictee";
  photo_url: string;
  photo_urls?: string[] | null;
  status: "en_attente" | "validee" | "a_corriger";
  feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
}

interface ReadingScore {
  id: string;
  course_id: string;
  user_id: string;
  attempt_number: number;
  correct_words: number;
  total_words: number;
  score_percent: number;
  created_at: string;
}

interface CourseLite {
  id: string;
  title: string;
  lesson_text?: string;
  dictation_words?: string[];
}
interface StudentLite { user_id: string; first_name: string; last_name: string }

const STATUS_LABEL: Record<Submission["status"], { label: string; variant: "default" | "outline" | "destructive" }> = {
  en_attente: { label: "⏳ En attente", variant: "outline" },
  validee: { label: "✅ Validée", variant: "default" },
  a_corriger: { label: "❌ À corriger", variant: "destructive" },
};

interface AiResult {
  score_label?: string;
  score_num?: number;
  total_num?: number;
  feedback?: string;
  suggestions?: string[];
  quality?: string;
}

const AdminPresentielSubmissions = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [scores, setScores] = useState<ReadingScore[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseLite>>({});
  const [students, setStudents] = useState<Record<string, StudentLite>>({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<string | null>(null);
  const [feedbackDraft, setFeedbackDraft] = useState("");
  const [aiCorrecting, setAiCorrecting] = useState<string | null>(null);
  const [aiResults, setAiResults] = useState<Record<string, AiResult>>({});

  const load = async () => {
    setLoading(true);
    const [{ data: subs }, { data: scs }, { data: cs }, { data: ps }] = await Promise.all([
      supabase.from("presentiel_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("presentiel_reading_scores").select("*").order("created_at", { ascending: false }),
      supabase.from("presentiel_courses").select("id, title, lesson_text, dictation_words"),
      supabase.from("profiles").select("user_id, first_name, last_name"),
    ]);
    setSubmissions((subs as any[]) || []);
    setScores((scs as any[]) || []);
    setCourses(Object.fromEntries((cs || []).map((c: any) => [c.id, c])));
    setStudents(Object.fromEntries((ps || []).map((p: any) => [p.user_id, p])));
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (
    sub: Submission,
    status: "validee" | "a_corriger",
    feedback?: string
  ) => {
    if (!user) return;
    const { error } = await supabase
      .from("presentiel_submissions")
      .update({
        status,
        feedback: feedback ?? sub.feedback ?? null,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", sub.id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(status === "validee" ? "Soumission validée ✅" : "Élève notifié à corriger");
      setEditing(null);
      setFeedbackDraft("");
      load();
    }
  };

  const handleAiCorrect = async (sub: Submission) => {
    const course = courses[sub.course_id];
    if (!course) { toast.error("Cours introuvable"); return; }
    setAiCorrecting(sub.id);
    try {
      const { data, error } = await supabase.functions.invoke("presentiel-auto-correct", {
        body: {
          photo_url: sub.photo_url,
          step_type: sub.step_type,
          lesson_text: course.lesson_text,
          dictation_words: course.dictation_words,
        },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error || "Erreur IA");
      setAiResults((prev) => ({ ...prev, [sub.id]: data as AiResult }));
      const fb = [
        data.score_label ? `Score : ${data.score_label}` : "",
        data.feedback || "",
        data.suggestions?.length ? `Suggestions : ${data.suggestions.join(" · ")}` : "",
      ].filter(Boolean).join("\n");
      setFeedbackDraft(fb);
      setEditing(sub.id);
      toast.success("Correction IA terminée — vérifiez et validez !");
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la correction IA");
    } finally {
      setAiCorrecting(null);
    }
  };

  const filtered = submissions.filter((s) => {
    if (!search) return true;
    const stu = students[s.user_id];
    const course = courses[s.course_id];
    const term = search.toLowerCase();
    return (
      stu?.first_name?.toLowerCase().includes(term) ||
      stu?.last_name?.toLowerCase().includes(term) ||
      course?.title?.toLowerCase().includes(term)
    );
  });

  const pending = filtered.filter((s) => s.status === "en_attente");
  const reviewed = filtered.filter((s) => s.status !== "en_attente");

  const scoresByStudent = scores.reduce<Record<string, { course: string; best: ReadingScore; attempts: number }>>((acc, sc) => {
    const key = `${sc.user_id}::${sc.course_id}`;
    if (!acc[key] || sc.score_percent > acc[key].best.score_percent) {
      acc[key] = { course: sc.course_id, best: sc, attempts: (acc[key]?.attempts ?? 0) + 1 };
    } else {
      acc[key].attempts += 1;
    }
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xl font-bold text-foreground">Corrections présentiel</h2>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Élève ou cours…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="gap-2">
              <ImageIcon className="h-4 w-4" /> En attente
              {pending.length > 0 && (
                <Badge variant="destructive" className="ml-1 h-5 min-w-5 px-1.5 text-[10px]">
                  {pending.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="reviewed" className="gap-2">
              <CheckCircle2 className="h-4 w-4" /> Corrigées ({reviewed.length})
            </TabsTrigger>
            <TabsTrigger value="reading" className="gap-2">
              <Mic className="h-4 w-4" /> Lecture orale
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-3">
            {pending.length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Aucune soumission en attente 🎉</CardContent></Card>
            ) : (
              pending.map((s) => (
                <SubmissionCard
                  key={s.id}
                  sub={s}
                  course={courses[s.course_id]}
                  student={students[s.user_id]}
                  editing={editing === s.id}
                  feedbackDraft={feedbackDraft}
                  aiResult={aiResults[s.id]}
                  aiCorrecting={aiCorrecting === s.id}
                  onEdit={() => { setEditing(s.id); setFeedbackDraft(s.feedback || ""); }}
                  onChangeFeedback={setFeedbackDraft}
                  onValidate={() => updateStatus(s, "validee", feedbackDraft || undefined)}
                  onReject={() => updateStatus(s, "a_corriger", feedbackDraft || undefined)}
                  onAiCorrect={() => handleAiCorrect(s)}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="reviewed" className="space-y-3">
            {reviewed.map((s) => (
              <SubmissionCard
                key={s.id}
                sub={s}
                course={courses[s.course_id]}
                student={students[s.user_id]}
                aiResult={aiResults[s.id]}
                readonly
              />
            ))}
          </TabsContent>

          <TabsContent value="reading" className="space-y-3">
            {Object.values(scoresByStudent).length === 0 ? (
              <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun score de lecture enregistré.</CardContent></Card>
            ) : (
              Object.values(scoresByStudent).map((entry) => {
                const stu = students[entry.best.user_id];
                const course = courses[entry.best.course_id];
                return (
                  <Card key={entry.best.id}>
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="font-semibold text-foreground">
                            {stu ? `${stu.first_name} ${stu.last_name}` : "Élève inconnu"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {course?.title || "Cours"} · {entry.attempts} tentative(s)
                          </p>
                        </div>
                        <Badge variant={entry.best.score_percent >= 70 ? "default" : "outline"} className="text-base shrink-0">
                          {entry.best.correct_words}/{entry.best.total_words} ({entry.best.score_percent}%)
                        </Badge>
                      </div>
                      <Progress value={entry.best.score_percent} className="h-1.5" />
                    </CardContent>
                  </Card>
                );
              })
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

function SubmissionCard({
  sub, course, student, editing, feedbackDraft, aiResult, aiCorrecting,
  onEdit, onChangeFeedback, onValidate, onReject, onAiCorrect, readonly,
}: {
  sub: Submission;
  course?: CourseLite;
  student?: StudentLite;
  editing?: boolean;
  feedbackDraft?: string;
  aiResult?: AiResult;
  aiCorrecting?: boolean;
  onEdit?: () => void;
  onChangeFeedback?: (v: string) => void;
  onValidate?: () => void;
  onReject?: () => void;
  onAiCorrect?: () => void;
  readonly?: boolean;
}) {
  const photos: string[] = (sub.photo_urls && Array.isArray(sub.photo_urls) && sub.photo_urls.length > 0)
    ? sub.photo_urls
    : (sub.photo_url ? [sub.photo_url] : []);

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Photos */}
            <div className="shrink-0 flex flex-wrap gap-2 sm:w-48">
              {photos.map((u, i) => (
                <a key={i} href={u} target="_blank" rel="noreferrer" className="block">
                  <img
                    src={u}
                    alt={`Soumission ${i + 1}`}
                    className="w-24 h-24 object-cover rounded-lg border border-border hover:opacity-80 transition"
                  />
                </a>
              ))}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">
                    {student ? `${student.first_name} ${student.last_name}` : "Élève inconnu"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {course?.title || "Cours"} · {sub.step_type === "ecriture" ? "Écriture" : "Dictée"} ·{" "}
                    {new Date(sub.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <Badge variant={STATUS_LABEL[sub.status].variant}>
                  {STATUS_LABEL[sub.status].label}
                </Badge>
              </div>

              {/* AI result display */}
              {aiResult && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 rounded-lg border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 space-y-1.5"
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-amber-600" />
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Correction IA</span>
                    {aiResult.score_label && (
                      <Badge variant="outline" className="ml-auto text-base">
                        <Star className="h-3 w-3 mr-1 text-gold" />
                        {aiResult.score_label}
                      </Badge>
                    )}
                  </div>
                  {aiResult.score_num != null && aiResult.total_num != null && (
                    <Progress value={(aiResult.score_num / aiResult.total_num) * 100} className="h-1.5" />
                  )}
                  {aiResult.feedback && (
                    <p className="text-xs text-foreground">{aiResult.feedback}</p>
                  )}
                  {aiResult.suggestions && aiResult.suggestions.length > 0 && (
                    <ul className="text-xs text-muted-foreground space-y-0.5">
                      {aiResult.suggestions.map((s, i) => <li key={i}>• {s}</li>)}
                    </ul>
                  )}
                </motion.div>
              )}

              {/* Feedback field */}
              {!readonly && editing ? (
                <Textarea
                  value={feedbackDraft || ""}
                  onChange={(e) => onChangeFeedback?.(e.target.value)}
                  placeholder="Commentaire visible par l'élève (optionnel)…"
                  className="text-sm"
                  rows={3}
                />
              ) : sub.feedback ? (
                <div className="text-sm italic text-muted-foreground bg-muted/40 p-2 rounded">
                  <MessageSquare className="h-3 w-3 inline mr-1" /> {sub.feedback}
                </div>
              ) : null}

              {/* Action buttons */}
              {!readonly && (
                <div className="flex flex-wrap gap-2 pt-2">
                  {/* AI correction button — star of the show */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={onAiCorrect}
                    disabled={aiCorrecting}
                    className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
                  >
                    {aiCorrecting
                      ? <><Loader2 className="h-3 w-3 animate-spin" /> Analyse…</>
                      : <><Sparkles className="h-3 w-3" /> Correction IA</>}
                  </Button>

                  {!editing && (
                    <Button size="sm" variant="outline" onClick={onEdit} className="gap-1">
                      <MessageSquare className="h-3 w-3" /> Commentaire
                    </Button>
                  )}
                  <Button
                    size="sm"
                    onClick={onValidate}
                    className="gap-1 gradient-emerald border-0 text-primary-foreground"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Correct ✅
                  </Button>
                  <Button size="sm" variant="destructive" onClick={onReject} className="gap-1">
                    <XCircle className="h-4 w-4" /> À corriger ❌
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default AdminPresentielSubmissions;
