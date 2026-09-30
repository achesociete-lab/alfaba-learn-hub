import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, UserCheck, CheckCircle2, XCircle, Clock, Star, MessageSquare, BookOpen } from "lucide-react";

interface ChildProfile { user_id: string; first_name: string; last_name: string; level: string; }
interface AttendanceRecord { id: string; session_id: string; student_id: string; status: "present" | "absent" | "retard"; delay_minutes: number | null; note: string | null; }
interface Session { id: string; group_id: string; session_date: string; title: string | null; }
interface Group { id: string; name: string; level: string; day_of_week: string | null; time_slot: string | null; }
interface Grade { id: string; evaluation_date: string; category: string; score: number; max_score: number; comment: string | null; }
interface Message { id: string; content: string; read_at: string | null; created_at: string | null; }

const CATEGORY_LABELS: Record<string, string> = {
  recitation: "Récitation", ecriture: "Écriture", lecture: "Lecture",
  comportement: "Comportement", global: "Global",
};

const EspaceParents = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [children, setChildren] = useState<ChildProfile[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [group, setGroup] = useState<Group | null>(null);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [childLoading, setChildLoading] = useState(false);
  const [notLinked, setNotLinked] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  // Load all linked children on mount
  useEffect(() => {
    if (!user) return;
    const loadChildren = async () => {
      let { data: links } = await supabase.from("parent_links")
        .select("child_profile_id").eq("parent_user_id", user.id);

      // If no links yet, check for pending invites matching this email and activate them
      if (!links?.length && user.email) {
        const { data: invites } = await supabase
          .from("parent_invites" as any)
          .select("id, child_profile_id, child_name")
          .eq("parent_email", user.email.toLowerCase())
          .is("used_at", null);

        if (invites?.length) {
          for (const invite of invites as any[]) {
            await supabase.from("parent_links")
              .insert({ parent_user_id: user.id, child_profile_id: invite.child_profile_id })
              .select();
            await supabase.from("parent_invites" as any)
              .update({ used_at: new Date().toISOString() }).eq("id", invite.id);
          }
          // Reload links after activation
          const { data: newLinks } = await supabase.from("parent_links")
            .select("child_profile_id").eq("parent_user_id", user.id);
          links = newLinks;
        }
      }

      if (!links?.length) { setNotLinked(true); setLoading(false); return; }

      const profiles = await Promise.all(links.map(async (link) => {
        const childId = link.child_profile_id;
        // Try platform profiles first
        const { data: profile } = await supabase.from("profiles")
          .select("user_id, first_name, last_name, level").eq("user_id", childId).maybeSingle();
        if (profile) return profile as ChildProfile;
        // Fall back to direct Nouraniya students
        const { data: direct } = await supabase.from("nouraniya_students" as any)
          .select("id, first_name, last_name, level").eq("id", childId).maybeSingle();
        if (direct) return { user_id: (direct as any).id, first_name: (direct as any).first_name, last_name: (direct as any).last_name, level: (direct as any).level } as ChildProfile;
        return null;
      }));

      const validChildren = profiles.filter(Boolean) as ChildProfile[];
      setChildren(validChildren);
      if (validChildren.length > 0) setSelectedChildId(validChildren[0].user_id);
      setLoading(false);
    };
    loadChildren();
  }, [user]);

  // Load data for the selected child
  useEffect(() => {
    if (!selectedChildId) return;
    const loadChildData = async () => {
      setChildLoading(true);
      setGroup(null);
      const [attRes, gradesRes, messagesRes] = await Promise.all([
        supabase.from("nouraniya_attendance").select("*").eq("student_id", selectedChildId),
        supabase.from("nouraniya_grades").select("*").eq("student_id", selectedChildId).order("evaluation_date", { ascending: false }),
        supabase.from("nouraniya_messages").select("*").eq("student_id", selectedChildId).order("created_at", { ascending: false }),
      ]);

      const attData = (attRes.data ?? []) as unknown as AttendanceRecord[];
      setAttendance(attData);
      setGrades(gradesRes.data ?? []);
      setMessages(messagesRes.data ?? []);

      if (attData.length > 0) {
        const sessionIds = [...new Set(attData.map(a => a.session_id))];
        const { data: sessData } = await supabase.from("nouraniya_sessions")
          .select("*").in("id", sessionIds).order("session_date", { ascending: false });
        setSessions(sessData ?? []);
        const groupIds = [...new Set((sessData ?? []).map((s: any) => s.group_id))];
        if (groupIds.length > 0) {
          const { data: grpData } = await supabase.from("nouraniya_groups").select("*").in("id", groupIds);
          if (grpData?.length) setGroup(grpData[0]);
        }
      } else {
        setSessions([]);
      }

      // Mark messages as read
      const unread = (messagesRes.data ?? []).filter((m: any) => !m.read_at).map((m: any) => m.id);
      if (unread.length > 0) {
        await supabase.from("nouraniya_messages").update({ read_at: new Date().toISOString() }).in("id", unread);
      }

      setChildLoading(false);
    };
    loadChildData();
  }, [selectedChildId]);

  if (authLoading || loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notLinked) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <UserCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Espace Parents</h1>
          <p className="text-muted-foreground">
            Votre compte n'est pas encore lié à un élève. Contactez le professeur pour qu'il effectue la liaison.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );

  const child = children.find(c => c.user_id === selectedChildId) ?? null;
  const totalSessions = sessions.length;
  const presentCount = attendance.filter(a => a.status === "present").length;
  const absentCount = attendance.filter(a => a.status === "absent").length;
  const retardCount = attendance.filter(a => a.status === "retard").length;
  const avgScore = grades.length > 0
    ? Math.round(grades.reduce((sum, g) => sum + (g.score / g.max_score) * 100, 0) / grades.length)
    : null;
  const unreadCount = messages.filter(m => !m.read_at).length;
  const sessionMap = Object.fromEntries(sessions.map(s => [s.id, s]));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <UserCheck className="h-6 w-6 text-primary" />
              <h1 className="text-3xl font-bold">Espace Parents</h1>
            </div>

            {/* Child selector */}
            <div className="flex items-center gap-3 flex-wrap">
              {children.length > 1 ? (
                <Select value={selectedChildId} onValueChange={setSelectedChildId}>
                  <SelectTrigger className="w-56">
                    <SelectValue placeholder="Choisir un enfant…" />
                  </SelectTrigger>
                  <SelectContent>
                    {children.map(c => (
                      <SelectItem key={c.user_id} value={c.user_id}>
                        {c.first_name} {c.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : child && (
                <span className="font-semibold text-foreground">{child.first_name} {child.last_name}</span>
              )}
              {group && (
                <Badge variant="secondary">{group.name}{group.day_of_week ? ` · ${group.day_of_week}${group.time_slot ? ` ${group.time_slot}` : ""}` : ""}</Badge>
              )}
            </div>
          </motion.div>

          {childLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                {[
                  { label: "Présences", value: presentCount, icon: <CheckCircle2 className="h-5 w-5 text-green-500" />, color: "text-green-600" },
                  { label: "Absences", value: absentCount, icon: <XCircle className="h-5 w-5 text-red-500" />, color: "text-red-500" },
                  { label: "Retards", value: retardCount, icon: <Clock className="h-5 w-5 text-amber-500" />, color: "text-amber-600" },
                  { label: "Note moy.", value: avgScore !== null ? `${avgScore}%` : "–", icon: <Star className="h-5 w-5 text-blue-500" />, color: "text-blue-600" },
                ].map(kpi => (
                  <Card key={kpi.label}>
                    <CardContent className="p-4 flex flex-col items-center text-center">
                      {kpi.icon}
                      <span className={`text-2xl font-bold mt-1 ${kpi.color}`}>{kpi.value}</span>
                      <span className="text-xs text-muted-foreground">{kpi.label}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                {/* Historique présences */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Séances ({totalSessions})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {attendance.length === 0 && <p className="text-sm text-muted-foreground">Aucune séance enregistrée.</p>}
                    <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                      {[...attendance].sort((a, b) => {
                        const dA = sessionMap[a.session_id]?.session_date ?? "";
                        const dB = sessionMap[b.session_id]?.session_date ?? "";
                        return dB.localeCompare(dA);
                      }).map(att => {
                        const s = sessionMap[att.session_id];
                        return (
                          <div key={att.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                            <div>
                              <p className="text-sm font-medium">{s?.title || "Séance"}</p>
                              <p className="text-xs text-muted-foreground">
                                {s ? new Date(s.session_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "–"}
                              </p>
                              {att.note && <p className="text-xs text-muted-foreground italic mt-0.5">{att.note}</p>}
                            </div>
                            <div className="flex flex-col items-end gap-0.5">
                              {att.status === "present" && <Badge className="bg-green-500/15 text-green-700 border-green-500/30 text-xs">Présent</Badge>}
                              {att.status === "retard" && (
                                <Badge className="bg-amber-500/15 text-amber-700 border-amber-500/30 text-xs">
                                  Retard{att.delay_minutes ? ` (${att.delay_minutes}min)` : ""}
                                </Badge>
                              )}
                              {att.status === "absent" && <Badge variant="outline" className="text-red-500 border-red-300 text-xs">Absent</Badge>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  {/* Notes */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Star className="h-4 w-4" /> Notes ({grades.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {grades.length === 0 && <p className="text-sm text-muted-foreground">Aucune note enregistrée.</p>}
                      <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                        {grades.map(g => (
                          <div key={g.id} className="flex items-center justify-between py-1.5 border-b last:border-0">
                            <div>
                              <p className="text-sm font-medium">{CATEGORY_LABELS[g.category] ?? g.category}</p>
                              <p className="text-xs text-muted-foreground">{new Date(g.evaluation_date).toLocaleDateString("fr-FR")}</p>
                              {g.comment && <p className="text-xs text-muted-foreground italic mt-0.5">{g.comment}</p>}
                            </div>
                            <span className={`text-lg font-bold ${(g.score / g.max_score) >= 0.7 ? "text-green-600" : (g.score / g.max_score) >= 0.5 ? "text-amber-600" : "text-red-500"}`}>
                              {g.score}/{g.max_score}
                            </span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Messages du prof */}
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" /> Messages du professeur
                        {unreadCount > 0 && <Badge variant="destructive" className="text-xs">{unreadCount}</Badge>}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {messages.length === 0 && <p className="text-sm text-muted-foreground">Aucun message.</p>}
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {messages.map(m => (
                          <div key={m.id} className={`p-2.5 rounded-lg text-sm ${!m.read_at ? "bg-primary/8 border border-primary/20" : "bg-muted/40"}`}>
                            <p>{m.content}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {m.created_at ? new Date(m.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }) : "—"}
                              {!m.read_at && <span className="ml-2 text-primary font-medium">Nouveau</span>}
                            </p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </>
          )}

          <p className="text-xs text-muted-foreground mt-8 border-t pt-4">
            Les données affichées (présences, notes, messages) sont traitées par ALFASL dans le cadre du suivi pédagogique de votre enfant.
            Conformément au RGPD, vous pouvez demander l'accès, la rectification ou la suppression de ces données à{" "}
            <a href="mailto:contact@alfasl.fr" className="text-primary hover:underline">contact@alfasl.fr</a>.{" "}
            <a href="/politique-de-confidentialite" className="text-primary hover:underline">Politique de confidentialité</a>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default EspaceParents;
