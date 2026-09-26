import { useEffect, useState, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import {
  Users, Plus, Trash2, ClipboardList, Star, MessageSquare,
  Check, X, Clock, Save, ChevronDown, ChevronUp, UserPlus, Send, BookOpenCheck, Loader2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Group {
  id: string; name: string; level: string;
  day_of_week: string | null; time_slot: string | null; location: string | null; active: boolean;
}
interface StudentProfile { user_id: string; first_name: string; last_name: string; level: string; }
interface Enrollment { id: string; student_id: string; group_id: string; }
interface McqQuestion { question: string; display: string; choices: string[]; correct_index: number; explanation: string; }
interface SessionExercises { letters: string; instructions: string; mcq: McqQuestion[]; dictation_words: string; audio_url: string; }
interface Session { id: string; group_id: string; session_date: string; title: string | null; notes: string | null; exercises?: SessionExercises | null; }
interface Attendance { id: string; session_id: string; student_id: string; status: "present" | "absent" | "retard"; delay_minutes: number | null; note: string | null; }
interface Grade { id: string; student_id: string; group_id: string; evaluation_date: string; category: string; score: number; max_score: number; comment: string | null; }
interface ParentLink { id: string; parent_user_id: string; child_profile_id: string; }

const LEVELS = ["debutant", "intermediaire", "avance"];
const DAYS = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];
const CATEGORIES = ["recitation", "ecriture", "lecture", "comportement", "global"];
const CATEGORY_LABELS: Record<string, string> = {
  recitation: "Récitation", ecriture: "Écriture", lecture: "Lecture",
  comportement: "Comportement", global: "Global",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const statusBadge = (s: string) => {
  if (s === "present") return <Badge className="bg-green-500/15 text-green-700 border-green-500/30">Présent</Badge>;
  if (s === "retard") return <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30">Retard</Badge>;
  return <Badge variant="outline" className="text-muted-foreground">Absent</Badge>;
};

// ─── Composant principal ───────────────────────────────────────────────────────

const AdminNouraniya = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [parentLinks, setParentLinks] = useState<ParentLink[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    const [g, s, e, se, a, gr, pl] = await Promise.all([
      supabase.from("nouraniya_groups").select("*").order("name"),
      supabase.from("profiles").select("user_id, first_name, last_name, level").order("last_name"),
      supabase.from("nouraniya_enrollments").select("*"),
      supabase.from("nouraniya_sessions").select("*").order("session_date", { ascending: false }),
      supabase.from("nouraniya_attendance").select("*"),
      supabase.from("nouraniya_grades").select("*").order("evaluation_date", { ascending: false }),
      supabase.from("parent_links").select("*"),
    ]);
    if (g.data) setGroups(g.data);
    if (s.data) setStudents(s.data);
    if (e.data) setEnrollments(e.data);
    if (se.data) setSessions(se.data as unknown as Session[]);
    if (a.data) setAttendance(a.data as unknown as Attendance[]);
    if (gr.data) setGrades(gr.data);
    if (pl.data) setParentLinks(pl.data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="flex justify-center py-12 text-muted-foreground">Chargement…</div>;

  return (
    <Tabs defaultValue="groupes" className="space-y-4">
      <TabsList className="flex-wrap h-auto gap-1 p-1">
        <TabsTrigger value="groupes" className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Users className="h-4 w-4" /> Groupes
        </TabsTrigger>
        <TabsTrigger value="seances" className="flex items-center gap-1.5 text-xs sm:text-sm">
          <ClipboardList className="h-4 w-4" /> Séances & Présences
        </TabsTrigger>
        <TabsTrigger value="notes" className="flex items-center gap-1.5 text-xs sm:text-sm">
          <Star className="h-4 w-4" /> Notes
        </TabsTrigger>
        <TabsTrigger value="parents" className="flex items-center gap-1.5 text-xs sm:text-sm">
          <MessageSquare className="h-4 w-4" /> Parents
        </TabsTrigger>
      </TabsList>

      <TabsContent value="groupes">
        <GroupesTab groups={groups} students={students} enrollments={enrollments} onRefresh={load} />
      </TabsContent>
      <TabsContent value="seances">
        <SeancesTab groups={groups} students={students} enrollments={enrollments} sessions={sessions} attendance={attendance} onRefresh={load} />
      </TabsContent>
      <TabsContent value="notes">
        <NotesTab groups={groups} students={students} enrollments={enrollments} grades={grades} onRefresh={load} />
      </TabsContent>
      <TabsContent value="parents">
        <ParentsTab students={students} parentLinks={parentLinks} onRefresh={load} />
      </TabsContent>
    </Tabs>
  );
};

// ─── Onglet Groupes ────────────────────────────────────────────────────────────

const GroupesTab = ({ groups, students, enrollments, onRefresh }: {
  groups: Group[]; students: StudentProfile[]; enrollments: Enrollment[]; onRefresh: () => void;
}) => {
  const [showForm, setShowForm] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", level: "debutant", day_of_week: "", time_slot: "", location: "" });
  const [saving, setSaving] = useState(false);

  const createGroup = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    const { error } = await supabase.from("nouraniya_groups").insert({
      name: form.name.trim(), level: form.level,
      day_of_week: form.day_of_week || null,
      time_slot: form.time_slot || null,
      location: form.location || null,
    });
    if (error) toast.error("Erreur création groupe");
    else { toast.success("Groupe créé"); setShowForm(false); setForm({ name: "", level: "debutant", day_of_week: "", time_slot: "", location: "" }); onRefresh(); }
    setSaving(false);
  };

  const deleteGroup = async (id: string) => {
    if (!confirm("Supprimer ce groupe ? Toutes les séances et présences seront supprimées.")) return;
    await supabase.from("nouraniya_groups").delete().eq("id", id);
    toast.success("Groupe supprimé"); onRefresh();
  };

  const enrollStudent = async (groupId: string, studentId: string) => {
    const { error } = await supabase.from("nouraniya_enrollments").insert({ group_id: groupId, student_id: studentId });
    if (error) toast.error("Déjà inscrit ou erreur");
    else { toast.success("Élève inscrit"); onRefresh(); }
  };

  const removeEnrollment = async (enrollmentId: string) => {
    await supabase.from("nouraniya_enrollments").delete().eq("id", enrollmentId);
    toast.success("Inscription retirée"); onRefresh();
  };

  const groupStudents = (groupId: string) =>
    enrollments.filter(e => e.group_id === groupId).map(e => students.find(s => s.user_id === e.student_id)).filter(Boolean) as StudentProfile[];

  const unenrolledStudents = (groupId: string) => {
    const enrolled = enrollments.filter(e => e.group_id === groupId).map(e => e.student_id);
    return students.filter(s => !enrolled.includes(s.user_id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Groupes ({groups.length})</h3>
        <Button size="sm" onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-1" /> Nouveau groupe
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Nom du groupe *</Label>
                <Input placeholder="ex: Groupe A – Débutants" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Niveau</Label>
                <Select value={form.level} onValueChange={v => setForm(f => ({ ...f, level: v }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Jour</Label>
                <Select value={form.day_of_week} onValueChange={v => setForm(f => ({ ...f, day_of_week: v }))}>
                  <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                  <SelectContent>{DAYS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Horaire</Label>
                <Input placeholder="ex: 14h00–15h30" value={form.time_slot} onChange={e => setForm(f => ({ ...f, time_slot: e.target.value }))} />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <Label>Lieu</Label>
                <Input placeholder="ex: Salle 3, mosquée Al-Nour" value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createGroup} disabled={saving}><Save className="h-4 w-4 mr-1" /> Enregistrer</Button>
              <Button size="sm" variant="outline" onClick={() => setShowForm(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {groups.length === 0 && !showForm && (
        <Card className="border-dashed"><CardContent className="py-10 text-center text-muted-foreground">Aucun groupe. Créez-en un pour commencer.</CardContent></Card>
      )}

      {groups.map(g => {
        const gStudents = groupStudents(g.id);
        const open = expanded === g.id;
        return (
          <Card key={g.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <CardTitle className="text-base">{g.name}</CardTitle>
                  <Badge variant="outline">{g.level}</Badge>
                  {g.day_of_week && <Badge variant="secondary">{g.day_of_week} {g.time_slot}</Badge>}
                  {g.location && <span className="text-xs text-muted-foreground">{g.location}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Badge>{gStudents.length} élève{gStudents.length > 1 ? "s" : ""}</Badge>
                  <Button size="icon" variant="ghost" onClick={() => setExpanded(open ? null : g.id)}>
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="text-destructive" onClick={() => deleteGroup(g.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            {open && (
              <CardContent className="space-y-3">
                <div className="space-y-1">
                  {gStudents.map(s => {
                    const enr = enrollments.find(e => e.group_id === g.id && e.student_id === s.user_id)!;
                    return (
                      <div key={s.user_id} className="flex items-center justify-between py-1 px-2 rounded hover:bg-muted/50">
                        <span className="text-sm">{s.first_name} {s.last_name}</span>
                        <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeEnrollment(enr.id)}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  {gStudents.length === 0 && <p className="text-sm text-muted-foreground">Aucun élève inscrit.</p>}
                </div>
                {unenrolledStudents(g.id).length > 0 && (
                  <div className="pt-2 border-t">
                    <p className="text-xs text-muted-foreground mb-2 font-medium">Ajouter un élève :</p>
                    <div className="flex flex-wrap gap-1.5">
                      {unenrolledStudents(g.id).map(s => (
                        <Button key={s.user_id} size="sm" variant="outline" className="h-7 text-xs"
                          onClick={() => enrollStudent(g.id, s.user_id)}>
                          <UserPlus className="h-3 w-3 mr-1" />
                          {s.first_name} {s.last_name}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );
};

// ─── Onglet Séances & Présences ────────────────────────────────────────────────

const SeancesTab = ({ groups, students, enrollments, sessions, attendance, onRefresh }: {
  groups: Group[]; students: StudentProfile[]; enrollments: Enrollment[];
  sessions: Session[]; attendance: Attendance[]; onRefresh: () => void;
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("all");
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showNewSession, setShowNewSession] = useState(false);
  const [newSession, setNewSession] = useState({ group_id: "", session_date: new Date().toISOString().slice(0, 10), title: "", notes: "" });
  const [saving, setSaving] = useState(false);
  const [localAttendance, setLocalAttendance] = useState<Record<string, { status: "present" | "absent" | "retard"; delay_minutes: number | null; note: string }>>({});
  const [showExercises, setShowExercises] = useState(false);
  const [exerciseResults, setExerciseResults] = useState<Record<string, number>>({}); // session_id -> nb completions
  const [exercises, setExercises] = useState<SessionExercises>({ letters: "", instructions: "", mcq: [], dictation_words: "", audio_url: "" });

  const emptyMcq = (): McqQuestion => ({ question: "", display: "", choices: ["", "", "", ""], correct_index: 0, explanation: "" });

  const filteredSessions = sessions.filter(s => selectedGroup === "all" || s.group_id === selectedGroup);

  const createSession = async () => {
    if (!newSession.group_id || !newSession.session_date) { toast.error("Groupe et date requis"); return; }
    setSaving(true);
    const { data, error } = await supabase.from("nouraniya_sessions").insert({
      group_id: newSession.group_id, session_date: newSession.session_date,
      title: newSession.title || null, notes: newSession.notes || null,
    }).select().single();
    if (error) { toast.error("Erreur"); setSaving(false); return; }
    toast.success("Séance créée");
    setShowNewSession(false);
    onRefresh();
    setSelectedSession(data.id);
    setSaving(false);
  };

  const deleteSession = async (id: string) => {
    if (!confirm("Supprimer cette séance et toutes ses présences ?")) return;
    await supabase.from("nouraniya_sessions").delete().eq("id", id);
    toast.success("Séance supprimée");
    if (selectedSession === id) setSelectedSession(null);
    onRefresh();
  };

  const session = sessions.find(s => s.id === selectedSession);
  const sessionGroup = session ? groups.find(g => g.id === session.group_id) : null;
  const sessionStudents = session
    ? enrollments.filter(e => e.group_id === session.group_id).map(e => students.find(s => s.user_id === e.student_id)).filter(Boolean) as StudentProfile[]
    : [];

  const getAtt = (studentId: string) => attendance.find(a => a.session_id === selectedSession && a.student_id === studentId);

  const upsertAttendance = async (studentId: string, status: "present" | "absent" | "retard", delayMin?: number, note?: string) => {
    if (!selectedSession) return;
    const existing = getAtt(studentId);
    const payload = { session_id: selectedSession, student_id: studentId, status, delay_minutes: delayMin ?? null, note: note ?? null };
    if (existing) {
      await supabase.from("nouraniya_attendance").update({ status, delay_minutes: delayMin ?? null, note: note ?? null }).eq("id", existing.id);
    } else {
      await supabase.from("nouraniya_attendance").insert(payload);
    }
    onRefresh();
  };

  const markAllPresent = async () => {
    if (!selectedSession) return;
    setSaving(true);
    for (const s of sessionStudents) {
      const existing = getAtt(s.user_id);
      if (existing) { await supabase.from("nouraniya_attendance").update({ status: "present", delay_minutes: null }).eq("id", existing.id); }
      else { await supabase.from("nouraniya_sessions").select("id").eq("id", selectedSession); await supabase.from("nouraniya_attendance").insert({ session_id: selectedSession, student_id: s.user_id, status: "present" }); }
    }
    toast.success("Tous marqués présents");
    onRefresh();
    setSaving(false);
  };

  const stats = (sid: string) => {
    const att = attendance.filter(a => a.session_id === sid);
    const present = att.filter(a => a.status === "present").length;
    const retard = att.filter(a => a.status === "retard").length;
    return { present, retard, absent: att.length - present - retard };
  };

  const groupName = (gid: string) => groups.find(g => g.id === gid)?.name ?? gid;

  // Quand la séance sélectionnée change, charger ses exercices et résultats
  const loadSessionExtras = useCallback(async (sid: string) => {
    const s = sessions.find(s => s.id === sid);
    if (s?.exercises && Object.keys(s.exercises).length > 0) {
      setExercises({ letters: s.exercises.letters ?? "", instructions: s.exercises.instructions ?? "", mcq: s.exercises.mcq ?? [], dictation_words: s.exercises.dictation_words ?? "", audio_url: s.exercises.audio_url ?? "" });
    } else {
      setExercises({ letters: "", instructions: "", mcq: [], dictation_words: "", audio_url: "" });
    }
    const { data } = await supabase.from("nouraniya_exercise_results").select("student_id").eq("session_id", sid);
    setExerciseResults(prev => ({ ...prev, [sid]: data?.length ?? 0 }));
  }, [sessions]);

  const saveExercises = async () => {
    if (!selectedSession) return;
    setSaving(true);
    const { error } = await supabase.from("nouraniya_sessions").update({ exercises: exercises as any }).eq("id", selectedSession);
    if (error) toast.error("Erreur sauvegarde exercices");
    else { toast.success("Exercices sauvegardés ✓"); onRefresh(); }
    setSaving(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 justify-between">
        <h3 className="font-semibold text-lg">Séances</h3>
        <div className="flex gap-2">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Tous les groupes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les groupes</SelectItem>
              {groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={() => setShowNewSession(!showNewSession)}>
            <Plus className="h-4 w-4 mr-1" /> Nouvelle séance
          </Button>
        </div>
      </div>

      {showNewSession && (
        <Card>
          <CardContent className="pt-4 space-y-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Groupe *</Label>
                <Select value={newSession.group_id} onValueChange={v => setNewSession(f => ({ ...f, group_id: v }))}>
                  <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                  <SelectContent>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Date *</Label>
                <Input type="date" value={newSession.session_date} onChange={e => setNewSession(f => ({ ...f, session_date: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Titre</Label>
                <Input placeholder="ex: Lettres ب ت ث" value={newSession.title} onChange={e => setNewSession(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <Label>Notes internes</Label>
                <Input placeholder="Notes du prof…" value={newSession.notes} onChange={e => setNewSession(f => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={createSession} disabled={saving}><Save className="h-4 w-4 mr-1" /> Créer</Button>
              <Button size="sm" variant="outline" onClick={() => setShowNewSession(false)}>Annuler</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          {filteredSessions.length === 0 && <p className="text-sm text-muted-foreground">Aucune séance.</p>}
          {filteredSessions.map(s => {
            const st = stats(s.id);
            const active = selectedSession === s.id;
            return (
              <Card key={s.id} className={`cursor-pointer transition-all ${active ? "border-primary" : "hover:border-primary/40"}`}
                onClick={() => { const next = active ? null : s.id; setSelectedSession(next); setShowExercises(false); if (next) loadSessionExtras(next); }}>
                <CardContent className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-sm">{s.title || "Séance"}</p>
                      <p className="text-xs text-muted-foreground">{groupName(s.group_id)} · {new Date(s.session_date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-green-600 font-medium">{st.present}✓</span>
                      {st.retard > 0 && <span className="text-xs text-amber-600 font-medium">{st.retard}⏱</span>}
                      {st.absent > 0 && <span className="text-xs text-red-500 font-medium">{st.absent}✗</span>}
                      {(s.exercises?.mcq?.length ?? 0) > 0 && <span className="text-xs text-blue-500 font-medium" title="Exercices définis">{exerciseResults[s.id] ?? 0}📝</span>}
                      <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={e => { e.stopPropagation(); deleteSession(s.id); }}>
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {session && (
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">{session.title || "Émargement"} — {sessionGroup?.name}</CardTitle>
                <Button size="sm" variant="outline" onClick={markAllPresent} disabled={saving}>
                  <Check className="h-3 w-3 mr-1" /> Tous présents
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {sessionStudents.length === 0 && <p className="text-sm text-muted-foreground">Aucun élève inscrit dans ce groupe.</p>}
              {sessionStudents.map(s => {
                const att = getAtt(s.user_id);
                const status = att?.status ?? "absent";
                return (
                  <div key={s.user_id} className="border rounded-lg p-2 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{s.first_name} {s.last_name}</span>
                      <div className="flex gap-1">
                        {(["present", "retard", "absent"] as const).map(st => (
                          <Button key={st} size="sm" variant={status === st ? "default" : "outline"} className={`h-7 px-2 text-xs ${status === st && st === "present" ? "bg-green-600" : status === st && st === "retard" ? "bg-amber-500" : status === st ? "bg-red-500" : ""}`}
                            onClick={() => upsertAttendance(s.user_id, st)}>
                            {st === "present" ? <Check className="h-3 w-3" /> : st === "retard" ? <Clock className="h-3 w-3" /> : <X className="h-3 w-3" />}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {status === "retard" && (
                      <Input type="number" placeholder="Minutes de retard" className="h-7 text-xs"
                        defaultValue={att?.delay_minutes ?? ""} min={1} max={120}
                        onBlur={e => upsertAttendance(s.user_id, "retard", e.target.value ? parseInt(e.target.value) : undefined, att?.note ?? undefined)} />
                    )}
                    <Input placeholder="Note (optionnelle)" className="h-7 text-xs"
                      defaultValue={att?.note ?? ""}
                      onBlur={e => upsertAttendance(s.user_id, status, att?.delay_minutes ?? undefined, e.target.value || undefined)} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Panneau exercices e-learning */}
      {selectedSession && (
        <Card className="border-blue-500/30">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2 text-blue-600">
                <BookOpenCheck className="h-4 w-4" /> Exercices à la maison
                {(exercises.mcq.length > 0 || exercises.dictation_words) && (
                  <Badge className="bg-blue-500/15 text-blue-700 border-blue-400/30 text-xs">
                    {exercises.mcq.length} QCM · {exercises.dictation_words ? exercises.dictation_words.split(",").filter(w => w.trim()).length : 0} dictée
                  </Badge>
                )}
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={() => setShowExercises(!showExercises)}>
                {showExercises ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </div>
          </CardHeader>
          {showExercises && (
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label>Lettres cibles <span className="text-muted-foreground text-xs">(ex: ب ت ث)</span></Label>
                  <Input dir="rtl" placeholder="ب ت ث ج" value={exercises.letters} onChange={e => setExercises(ex => ({ ...ex, letters: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Consigne générale</Label>
                  <Input placeholder="ex: Révisez les lettres vues en classe" value={exercises.instructions} onChange={e => setExercises(ex => ({ ...ex, instructions: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Mots de dictée <span className="text-muted-foreground text-xs">(séparés par des virgules)</span></Label>
                  <Input dir="rtl" placeholder="بَاب, كِتَاب, نُور" value={exercises.dictation_words} onChange={e => setExercises(ex => ({ ...ex, dictation_words: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>URL audio (optionnel)</Label>
                  <Input placeholder="https://…/audio.mp3" value={exercises.audio_url} onChange={e => setExercises(ex => ({ ...ex, audio_url: e.target.value }))} />
                </div>
              </div>

              {/* QCM */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Questions QCM ({exercises.mcq.length})</Label>
                  <Button size="sm" variant="outline" onClick={() => setExercises(ex => ({ ...ex, mcq: [...ex.mcq, emptyMcq()] }))}>
                    <Plus className="h-3 w-3 mr-1" /> Ajouter une question
                  </Button>
                </div>
                {exercises.mcq.map((q, qi) => (
                  <Card key={qi} className="bg-muted/30">
                    <CardContent className="pt-3 pb-3 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-xs font-medium text-muted-foreground">Q{qi + 1}</p>
                        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive shrink-0"
                          onClick={() => setExercises(ex => ({ ...ex, mcq: ex.mcq.filter((_, i) => i !== qi) }))}>
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="grid sm:grid-cols-2 gap-2">
                        <Input placeholder="Question (ex: Quelle lettre vois-tu ?)" value={q.question}
                          onChange={e => setExercises(ex => { const m = [...ex.mcq]; m[qi] = { ...m[qi], question: e.target.value }; return { ...ex, mcq: m }; })} />
                        <Input dir="rtl" placeholder="Affichage arabe (ex: بَ)" value={q.display}
                          onChange={e => setExercises(ex => { const m = [...ex.mcq]; m[qi] = { ...m[qi], display: e.target.value }; return { ...ex, mcq: m }; })} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {q.choices.map((c, ci) => (
                          <div key={ci} className="flex items-center gap-1.5">
                            <button type="button"
                              className={`w-5 h-5 rounded-full border-2 shrink-0 ${q.correct_index === ci ? "bg-green-500 border-green-500" : "border-muted-foreground"}`}
                              onClick={() => setExercises(ex => { const m = [...ex.mcq]; m[qi] = { ...m[qi], correct_index: ci }; return { ...ex, mcq: m }; })} />
                            <Input className="h-7 text-xs" dir="rtl" placeholder={`Choix ${ci + 1}`} value={c}
                              onChange={e => setExercises(ex => { const m = [...ex.mcq]; const ch = [...m[qi].choices]; ch[ci] = e.target.value; m[qi] = { ...m[qi], choices: ch }; return { ...ex, mcq: m }; })} />
                          </div>
                        ))}
                      </div>
                      <Input className="text-xs" placeholder="Explication (optionnel)" value={q.explanation}
                        onChange={e => setExercises(ex => { const m = [...ex.mcq]; m[qi] = { ...m[qi], explanation: e.target.value }; return { ...ex, mcq: m }; })} />
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Button size="sm" onClick={saveExercises} disabled={saving}>
                <Save className="h-4 w-4 mr-1" /> Sauvegarder les exercices
              </Button>

              {exerciseResults[selectedSession] !== undefined && (
                <p className="text-xs text-muted-foreground">
                  {exerciseResults[selectedSession]} élève{exerciseResults[selectedSession] > 1 ? "s" : ""} {exerciseResults[selectedSession] > 1 ? "ont" : "a"} complété ces exercices.
                </p>
              )}
            </CardContent>
          )}
        </Card>
      )}
    </div>
  );
};

// ─── Onglet Notes ──────────────────────────────────────────────────────────────

const NotesTab = ({ groups, students, enrollments, grades, onRefresh }: {
  groups: Group[]; students: StudentProfile[]; enrollments: Enrollment[]; grades: Grade[]; onRefresh: () => void;
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [form, setForm] = useState({ student_id: "", category: "global", score: "", max_score: "20", evaluation_date: new Date().toISOString().slice(0, 10), comment: "" });
  const [saving, setSaving] = useState(false);
  const [filterStudent, setFilterStudent] = useState<string>("all");

  const groupStudents = (gid: string) =>
    enrollments.filter(e => e.group_id === gid).map(e => students.find(s => s.user_id === e.student_id)).filter(Boolean) as StudentProfile[];

  const addGrade = async () => {
    if (!form.student_id || !form.score || !selectedGroup) { toast.error("Remplissez tous les champs obligatoires"); return; }
    setSaving(true);
    const { error } = await supabase.from("nouraniya_grades").insert({
      student_id: form.student_id, group_id: selectedGroup,
      evaluation_date: form.evaluation_date, category: form.category,
      score: parseFloat(form.score), max_score: parseFloat(form.max_score) || 20,
      comment: form.comment || null,
    });
    if (error) toast.error("Erreur");
    else { toast.success("Note enregistrée"); setForm(f => ({ ...f, score: "", comment: "" })); onRefresh(); }
    setSaving(false);
  };

  const deleteGrade = async (id: string) => {
    await supabase.from("nouraniya_grades").delete().eq("id", id);
    toast.success("Note supprimée"); onRefresh();
  };

  const gStudents = selectedGroup ? groupStudents(selectedGroup) : [];
  const filteredGrades = grades.filter(g =>
    (!selectedGroup || g.group_id === selectedGroup) &&
    (filterStudent === "all" || g.student_id === filterStudent)
  );
  const studentName = (id: string) => { const s = students.find(st => st.user_id === id); return s ? `${s.first_name} ${s.last_name}` : id; };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Notes & Évaluations</h3>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Saisir une note</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Groupe *</Label>
              <Select value={selectedGroup} onValueChange={v => { setSelectedGroup(v); setForm(f => ({ ...f, student_id: "" })); }}>
                <SelectTrigger><SelectValue placeholder="Choisir un groupe…" /></SelectTrigger>
                <SelectContent>{groups.map(g => <SelectItem key={g.id} value={g.id}>{g.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Élève *</Label>
              <Select value={form.student_id} onValueChange={v => setForm(f => ({ ...f, student_id: v }))} disabled={!selectedGroup}>
                <SelectTrigger><SelectValue placeholder="Choisir un élève…" /></SelectTrigger>
                <SelectContent>{gStudents.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Catégorie</Label>
              <Select value={form.category} onValueChange={v => setForm(f => ({ ...f, category: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Date</Label>
              <Input type="date" value={form.evaluation_date} onChange={e => setForm(f => ({ ...f, evaluation_date: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label>Note *</Label>
              <div className="flex items-center gap-2">
                <Input type="number" placeholder="0" min="0" step="0.5" value={form.score} onChange={e => setForm(f => ({ ...f, score: e.target.value }))} />
                <span className="text-muted-foreground text-sm">/</span>
                <Input type="number" placeholder="20" min="1" value={form.max_score} onChange={e => setForm(f => ({ ...f, max_score: e.target.value }))} className="w-20" />
              </div>
            </div>
            <div className="space-y-1">
              <Label>Commentaire</Label>
              <Input placeholder="Appréciation…" value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} />
            </div>
          </div>
          <Button size="sm" onClick={addGrade} disabled={saving}><Save className="h-4 w-4 mr-1" /> Enregistrer la note</Button>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium">Historique des notes</p>
          <Select value={filterStudent} onValueChange={setFilterStudent}>
            <SelectTrigger className="w-44 h-8 text-xs"><SelectValue placeholder="Tous les élèves" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les élèves</SelectItem>
              {(selectedGroup ? gStudents : students).map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {filteredGrades.length === 0 && <p className="text-sm text-muted-foreground">Aucune note enregistrée.</p>}

        <div className="grid sm:grid-cols-2 gap-2">
          {filteredGrades.map(g => (
            <Card key={g.id}>
              <CardContent className="p-3 flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                    <span className="font-medium text-sm">{studentName(g.student_id)}</span>
                    <Badge variant="outline" className="text-xs">{CATEGORY_LABELS[g.category] ?? g.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(g.evaluation_date).toLocaleDateString("fr-FR")}</p>
                  {g.comment && <p className="text-xs mt-1 text-muted-foreground italic">{g.comment}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-lg font-bold ${(g.score / g.max_score) >= 0.7 ? "text-green-600" : (g.score / g.max_score) >= 0.5 ? "text-amber-600" : "text-red-500"}`}>
                    {g.score}/{g.max_score}
                  </span>
                  <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => deleteGrade(g.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Onglet Parents ────────────────────────────────────────────────────────────

const ParentsTab = ({ students, parentLinks, onRefresh }: {
  students: StudentProfile[]; parentLinks: ParentLink[]; onRefresh: () => void;
}) => {
  const [parentEmail, setParentEmail] = useState("");
  const [childId, setChildId] = useState("");
  const [message, setMessage] = useState("");
  const [messageChildId, setMessageChildId] = useState("");
  const [saving, setSaving] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteChildId, setInviteChildId] = useState("");
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [generatingInvite, setGeneratingInvite] = useState(false);
  const [deleteStudentId, setDeleteStudentId] = useState("");

  const deleteStudentData = async () => {
    if (!deleteStudentId) { toast.error("Choisissez un élève"); return; }
    const s = students.find(st => st.user_id === deleteStudentId);
    if (!confirm(`Supprimer TOUTES les données Nouraniya de ${s?.first_name} ${s?.last_name} ? (présences, notes, messages, liens parents)\nCette action est irréversible.`)) return;
    setSaving(true);
    await Promise.all([
      supabase.from("nouraniya_attendance").delete().eq("student_id", deleteStudentId),
      supabase.from("nouraniya_grades").delete().eq("student_id", deleteStudentId),
      supabase.from("nouraniya_messages").delete().eq("student_id", deleteStudentId),
      supabase.from("nouraniya_enrollments").delete().eq("student_id", deleteStudentId),
      supabase.from("parent_links").delete().eq("child_profile_id", deleteStudentId),
    ]);
    toast.success("Données supprimées ✓");
    setDeleteStudentId("");
    onRefresh();
    setSaving(false);
  };

  const generateInvite = async () => {
    if (!inviteEmail.trim() || !inviteChildId) { toast.error("Email et élève requis"); return; }
    setGeneratingInvite(true);
    const child = students.find(s => s.user_id === inviteChildId);
    const childName = child ? `${child.first_name} ${child.last_name}` : "";
    const { data, error } = await supabase
      .from("parent_invites" as any)
      .insert({ parent_email: inviteEmail.trim().toLowerCase(), child_profile_id: inviteChildId, child_name: childName })
      .select("token")
      .single();
    if (error || !data) { toast.error("Erreur lors de la génération"); setGeneratingInvite(false); return; }
    const link = `${window.location.origin}/parents/rejoindre?token=${(data as any).token}`;
    setGeneratedLink(link);
    setGeneratingInvite(false);
  };

  const linkParent = async () => {
    if (!parentEmail.trim() || !childId) { toast.error("Email parent et élève requis"); return; }
    setSaving(true);
    const { data: parentUserId, error: rpcErr } = await supabase
      .rpc("get_user_id_by_email" as any, { email: parentEmail.trim().toLowerCase() });
    if (rpcErr || !parentUserId) {
      toast.error("Aucun compte trouvé avec cet email. Le parent doit d'abord créer un compte sur alfasl.fr");
      setSaving(false); return;
    }
    const { error } = await supabase.from("parent_links").insert({ parent_user_id: parentUserId, child_profile_id: childId });
    if (error) toast.error(error.message.includes("unique") ? "Lien déjà existant" : "Erreur");
    else { toast.success("Parent lié à l'élève ✓"); setParentEmail(""); setChildId(""); onRefresh(); }
    setSaving(false);
  };

  const sendMessage = async () => {
    if (!message.trim() || !messageChildId) { toast.error("Message et élève requis"); return; }
    setSaving(true);
    const { error } = await supabase.from("nouraniya_messages").insert({ student_id: messageChildId, content: message.trim() });
    if (error) toast.error("Erreur");
    else { toast.success("Message envoyé aux parents ✓"); setMessage(""); }
    setSaving(false);
  };

  const removeLink = async (id: string) => {
    await supabase.from("parent_links").delete().eq("id", id);
    toast.success("Lien supprimé"); onRefresh();
  };

  const studentName = (id: string) => { const s = students.find(st => st.user_id === id); return s ? `${s.first_name} ${s.last_name}` : id; };

  return (
    <div className="space-y-6">
      {/* ── Inviter un parent par lien ── */}
      <Card className="border-primary/30 bg-primary/3">
        <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><UserPlus className="h-4 w-4 text-primary" /> Inviter un parent (nouveau compte)</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Entrez l'email du parent et l'élève concerné. Un lien unique sera généré — envoyez-le par WhatsApp ou email.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Email du parent</Label>
              <Input type="email" placeholder="parent@email.com" value={inviteEmail} onChange={e => { setInviteEmail(e.target.value); setGeneratedLink(null); }} />
            </div>
            <div className="space-y-1">
              <Label>Élève</Label>
              <Select value={inviteChildId} onValueChange={v => { setInviteChildId(v); setGeneratedLink(null); }}>
                <SelectTrigger><SelectValue placeholder="Choisir l'élève…" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <Button size="sm" onClick={generateInvite} disabled={generatingInvite} className="gradient-emerald border-0 text-primary-foreground gap-2">
            {generatingInvite ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération…</> : "🔗 Générer le lien d'invitation"}
          </Button>
          {generatedLink && (
            <div className="space-y-2">
              <p className="text-xs font-medium text-primary">✅ Lien généré — copiez-le et envoyez-le au parent :</p>
              <div className="flex gap-2">
                <Input value={generatedLink} readOnly className="text-xs font-mono" />
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(generatedLink); toast.success("Lien copié !"); }}>
                  Copier
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Valable 30 jours · usage unique</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><UserPlus className="h-4 w-4" /> Lier un parent (déjà inscrit)</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">Si le parent a déjà un compte sur alfasl.fr.</p>
            <div className="space-y-1">
              <Label>Email du parent</Label>
              <Input type="email" placeholder="parent@email.com" value={parentEmail} onChange={e => setParentEmail(e.target.value)} />
            </div>
            <div className="space-y-1">
              <Label>Élève</Label>
              <Select value={childId} onValueChange={setChildId}>
                <SelectTrigger><SelectValue placeholder="Choisir l'élève…" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button size="sm" onClick={linkParent} disabled={saving}><Save className="h-4 w-4 mr-1" /> Lier</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Send className="h-4 w-4" /> Envoyer un message</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <Label>Élève concerné</Label>
              <Select value={messageChildId} onValueChange={setMessageChildId}>
                <SelectTrigger><SelectValue placeholder="Choisir l'élève…" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label>Message aux parents</Label>
              <Textarea placeholder="ex: Votre enfant a très bien progressé cette semaine…" rows={3} value={message} onChange={e => setMessage(e.target.value)} />
            </div>
            <Button size="sm" onClick={sendMessage} disabled={saving}><Send className="h-4 w-4 mr-1" /> Envoyer</Button>
          </CardContent>
        </Card>
      </div>

      {/* Suppression données RGPD */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2 text-destructive">
            <Trash2 className="h-4 w-4" /> Suppression des données (RGPD)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">Supprime toutes les données Nouraniya d'un élève : présences, notes, messages et liens parents. Irréversible.</p>
          <div className="flex items-end gap-2">
            <div className="flex-1 space-y-1">
              <Label>Élève</Label>
              <Select value={deleteStudentId} onValueChange={setDeleteStudentId}>
                <SelectTrigger><SelectValue placeholder="Choisir l'élève…" /></SelectTrigger>
                <SelectContent>{students.map(s => <SelectItem key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <Button size="sm" variant="destructive" onClick={deleteStudentData} disabled={saving || !deleteStudentId}>
              <Trash2 className="h-4 w-4 mr-1" /> Supprimer
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-2">
        <p className="text-sm font-medium">Liens parents actifs ({parentLinks.length})</p>
        {parentLinks.length === 0 && <p className="text-sm text-muted-foreground">Aucun lien parent configuré.</p>}
        <div className="grid sm:grid-cols-2 gap-2">
          {parentLinks.map(pl => (
            <Card key={pl.id}>
              <CardContent className="p-3 flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{studentName(pl.child_profile_id)}</p>
                  <p className="text-xs text-muted-foreground">ID parent : {pl.parent_user_id.slice(0, 8)}…</p>
                </div>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={() => removeLink(pl.id)}>
                  <Trash2 className="h-3 w-3" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminNouraniya;
