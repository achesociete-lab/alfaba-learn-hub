// Interface admin : correction MANUELLE des photos manuscrites des élèves présentiel
// + visualisation des scores de lecture

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CheckCircle2, XCircle, Loader2, MessageSquare, Image as ImageIcon, Mic, Search, Pencil,
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
import PhotoAnnotator from "./PhotoAnnotator";

interface Submission {
  id: string;
  course_id: string;
  user_id: string;
  step_type: "ecriture" | "dictee" | "lecture";
  photo_url: string | null;
  photo_urls?: string[] | null;
  annotated_photo_urls?: string[] | null;
  audio_url?: string | null;
  status: "en_attente" | "validee" | "a_corriger";
  feedback: string | null;
  created_at: string;
  reviewed_at: string | null;
}

const STEP_LABEL: Record<Submission["step_type"], string> = {
  lecture: "Lecture",
  ecriture: "Écriture",
  dictee: "Dictée",
};

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
}
interface StudentLite { user_id: string; first_name: string; last_name: string }

const STATUS_LABEL: Record<Submission["status"], { label: string; variant: "default" | "outline" | "destructive" }> = {
  en_attente: { label: "⏳ En attente", variant: "outline" },
  validee: { label: "✅ Validée", variant: "default" },
  a_corriger: { label: "❌ À corriger", variant: "destructive" },
};

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
  const [annotating, setAnnotating] = useState<{ subId: string; photoIndex: number; url: string } | null>(null);

  // Upload annotated photo and persist URL at the same index in annotated_photo_urls
  const saveAnnotation = async (blob: Blob) => {
    if (!annotating) return;
    const sub = submissions.find((s) => s.id === annotating.subId);
    if (!sub) return;
    const path = `annotations/${sub.user_id}/${sub.id}-${annotating.photoIndex}-${Date.now()}.jpg`;
    const { error: upErr } = await supabase.storage
      .from("presentiel-submissions")
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (upErr) { toast.error(upErr.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("presentiel-submissions").getPublicUrl(path);

    const photos: string[] = (sub.photo_urls && sub.photo_urls.length > 0)
      ? sub.photo_urls
      : (sub.photo_url ? [sub.photo_url] : []);
    const next = [...(sub.annotated_photo_urls || [])];
    while (next.length < photos.length) next.push("");
    next[annotating.photoIndex] = publicUrl;

    const { error } = await supabase
      .from("presentiel_submissions")
      .update({ annotated_photo_urls: next as any })
      .eq("id", sub.id);
    if (error) { toast.error(error.message); return; }
    toast.success("Annotation enregistrée ✏️");
    setAnnotating(null);
    load();
  };

  const load = async () => {
    setLoading(true);
    const [{ data: subs }, { data: scs }, { data: cs }, { data: ps }] = await Promise.all([
      supabase.from("presentiel_submissions").select("*").order("created_at", { ascending: false }),
      supabase.from("presentiel_reading_scores").select("*").order("created_at", { ascending: false }),
      supabase.from("presentiel_courses").select("id, title"),
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
                  onEdit={() => { setEditing(s.id); setFeedbackDraft(s.feedback || ""); }}
                  onChangeFeedback={setFeedbackDraft}
                  onValidate={() => updateStatus(s, "validee", feedbackDraft || undefined)}
                  onReject={() => updateStatus(s, "a_corriger", feedbackDraft || undefined)}
                  onAnnotate={(idx, url) => setAnnotating({ subId: s.id, photoIndex: idx, url })}
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
                onAnnotate={(idx, url) => setAnnotating({ subId: s.id, photoIndex: idx, url })}
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
  sub, course, student, editing, feedbackDraft,
  onEdit, onChangeFeedback, onValidate, onReject, onAnnotate, readonly,
}: {
  sub: Submission;
  course?: CourseLite;
  student?: StudentLite;
  editing?: boolean;
  feedbackDraft?: string;
  onEdit?: () => void;
  onChangeFeedback?: (v: string) => void;
  onValidate?: () => void;
  onReject?: () => void;
  onAnnotate?: (photoIndex: number, url: string) => void;
  readonly?: boolean;
}) {
  const photos: string[] = (sub.photo_urls && Array.isArray(sub.photo_urls) && sub.photo_urls.length > 0)
    ? sub.photo_urls
    : (sub.photo_url ? [sub.photo_url] : []);
  const annotated: string[] = Array.isArray(sub.annotated_photo_urls) ? sub.annotated_photo_urls : [];

  return (
    <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Media */}
            <div className="shrink-0 flex flex-wrap gap-2 sm:w-56">
              {photos.map((u, i) => {
                const ann = annotated[i];
                const display = ann || u;
                return (
                  <div key={i} className="relative group">
                    <a href={display} target="_blank" rel="noreferrer" className="block">
                      <img
                        src={display}
                        alt={`Soumission ${i + 1}`}
                        className="w-24 h-24 object-cover rounded-lg border border-border hover:opacity-80 transition"
                      />
                    </a>
                    {ann && (
                      <Badge className="absolute -top-1 -left-1 text-[9px] px-1 py-0 h-4 bg-primary text-primary-foreground">✏️</Badge>
                    )}
                    {!readonly && onAnnotate && (
                      <Button
                        type="button"
                        size="icon"
                        variant="secondary"
                        onClick={() => onAnnotate(i, u)}
                        className="absolute bottom-1 right-1 h-6 w-6 shadow"
                        title={ann ? "Modifier l'annotation" : "Annoter cette photo"}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                );
              })}
              {sub.audio_url && (
                <div className="w-full">
                  <audio controls src={sub.audio_url} className="w-full" style={{ height: "40px" }} />
                </div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-foreground">
                    {student ? `${student.first_name} ${student.last_name}` : "Élève inconnu"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {course?.title || "Cours"} · {STEP_LABEL[sub.step_type] || sub.step_type} ·{" "}
                    {new Date(sub.created_at).toLocaleString("fr-FR")}
                  </p>
                </div>
                <Badge variant={STATUS_LABEL[sub.status].variant}>
                  {STATUS_LABEL[sub.status].label}
                </Badge>
              </div>

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
