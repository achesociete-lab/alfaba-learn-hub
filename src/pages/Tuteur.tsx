import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Crown, Flame, Trophy, BookOpen, Send, Loader2, Sparkles, Calendar, CheckCircle2, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";

interface Session { id: string; started_at: string; ended_at: string | null; summary: string | null; score: number | null; }
interface Homework { id: string; title: string; content: any; due_date: string | null; status: string; score: number | null; feedback: string | null; created_at: string; }
interface Progress { total_sessions: number; average_score: number; streak_days: number; weekly_plan: any; weak_letters: any[]; strong_letters: any[]; }
interface TutorQuestion {
  type: "mcq" | "text";
  prompt_fr: string;
  display: string;
  translit?: string;
  meaning_fr?: string;
  choices?: string[];
  correct_index?: number;
}
interface TutorPayload {
  feedback_fr: string;
  feedback_ar: string;
  question: TutorQuestion | null;
}

const Tuteur = () => {
  const { user } = useAuth();
  const { plan, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<Progress | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);

  const [activeHw, setActiveHw] = useState<Homework | null>(null);
  const [submission, setSubmission] = useState<Record<number, string>>({});

  const isPremium = plan === "premium";

  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: prog }, { data: sess }, { data: hw }] = await Promise.all([
      supabase.from("tutor_progress").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("tutor_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(20),
      supabase.from("tutor_homework").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setProgress(prog as any);
    setSessions((sess || []) as any);
    setHomework((hw || []) as any);
    setLoading(false);
  };

  useEffect(() => { if (user && isPremium) loadAll(); }, [user, isPremium]);

  const callTutor = async (action: string, payload: any = {}) => {
    const { data, error } = await supabase.functions.invoke("ai-tutor", { body: { action, ...payload } });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const startSession = async () => {
    setBusy(true);
    try {
      const data = await callTutor("start_session");
      setActiveSessionId(data.session_id);
      setMessages([{ role: "assistant", content: data.message }]);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !activeSessionId) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", content: userMsg }]);
    setInput("");
    setSending(true);
    try {
      const data = await callTutor("message", { session_id: activeSessionId, user_message: userMsg });
      setMessages((m) => [...m, { role: "assistant", content: data.message }]);
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const endSession = async () => {
    if (!activeSessionId) return;
    setBusy(true);
    try {
      const data = await callTutor("end_session", { session_id: activeSessionId });
      toast({ title: "Session terminée ✅", description: data.summary?.summary || "Bilan enregistré" });
      setActiveSessionId(null);
      setMessages([]);
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const generateWeeklyPlan = async () => {
    setBusy(true);
    try {
      await callTutor("weekly_plan");
      toast({ title: "Plan généré ✅" });
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const generateHomework = async () => {
    setBusy(true);
    try {
      await callTutor("generate_homework");
      toast({ title: "Devoir créé ✅" });
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const submitHomework = async () => {
    if (!activeHw) return;
    setBusy(true);
    try {
      const data = await callTutor("correct_homework", {
        homework_id: activeHw.id,
        submission: { answers: submission },
      });
      toast({ title: `Note: ${data.score}/100`, description: data.feedback?.slice(0, 120) });
      setActiveHw(null);
      setSubmission({});
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  // ===== Upsell screen =====
  if (!subLoading && !isPremium) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-24 px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-2 border-primary/30 overflow-hidden">
              <div className="gradient-emerald p-8 text-center text-primary-foreground">
                <Crown className="h-16 w-16 mx-auto mb-4" />
                <h1 className="text-3xl font-display font-bold mb-2">Tuteur IA Personnel</h1>
                <p className="text-primary-foreground/90">Réservé aux abonnés Premium</p>
              </div>
              <CardContent className="p-8 space-y-4">
                <div className="space-y-3">
                  {[
                    "Sessions illimitées avec un tuteur IA expert",
                    "Plan d'apprentissage hebdomadaire personnalisé",
                    "Devoirs adaptés à vos points faibles",
                    "Correction automatique avec feedback détaillé",
                    "Rapport hebdomadaire envoyé par email",
                    "Suivi de progression et streak quotidien",
                  ].map((f) => (
                    <div key={f} className="flex gap-3 items-start">
                      <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                      <span className="text-foreground">{f}</span>
                    </div>
                  ))}
                </div>
                <div className="text-center pt-4">
                  <p className="text-3xl font-bold text-primary mb-1">15€<span className="text-base text-muted-foreground">/mois</span></p>
                  <Button size="lg" className="gradient-emerald border-0 mt-4 w-full md:w-auto" onClick={() => navigate("/tarifs")}>
                    <Crown className="mr-2 h-5 w-5" /> Passer Premium
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ===== Active session view =====
  if (activeSessionId) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container mx-auto pt-20 px-4 max-w-3xl flex-1 flex flex-col pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Session avec le Tuteur
            </h2>
            <Button size="sm" variant="outline" onClick={endSession} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminer"}
            </Button>
          </div>
          <Card className="flex-1 flex flex-col overflow-hidden">
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-3">
                {messages.map((m, i) => (
                  <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                        m.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                      dir={m.role === "assistant" ? "rtl" : "ltr"}
                      style={{ fontFamily: m.role === "assistant" ? "Amiri, serif" : undefined, fontSize: m.role === "assistant" ? "18px" : undefined }}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {sending && <div className="text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin inline mr-1" /> Le tuteur réfléchit...</div>}
              </div>
            </ScrollArea>
            <div className="border-t p-3 flex gap-2">
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Votre réponse..."
                className="resize-none min-h-[44px]"
                rows={1}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
              />
              <Button onClick={sendMessage} disabled={sending || !input.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  // ===== Active homework view =====
  if (activeHw) {
    const exercises = activeHw.content?.exercises || [];
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-24 px-4 max-w-2xl pb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => { setActiveHw(null); setSubmission({}); }}>← Retour</Button>
          <Card>
            <CardHeader>
              <CardTitle>{activeHw.title}</CardTitle>
              {activeHw.content?.instructions && <p className="text-sm text-muted-foreground">{activeHw.content.instructions}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              {exercises.map((ex: any, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="font-medium" dir="rtl" style={{ fontFamily: "Amiri, serif", fontSize: "18px" }}>
                    {i + 1}. {ex.question}
                  </p>
                  <Textarea
                    value={submission[i] || ""}
                    onChange={(e) => setSubmission({ ...submission, [i]: e.target.value })}
                    placeholder="Votre réponse..."
                    dir="rtl"
                  />
                </div>
              ))}
              <Button className="w-full gradient-emerald border-0" onClick={submitHomework} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Soumettre
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ===== Main dashboard =====
  const weeklyPlan = progress?.weekly_plan?.daily_plan || [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 max-w-5xl pb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <Crown className="h-7 w-7 text-primary" /> Mon Tuteur IA
            </h1>
            <p className="text-muted-foreground text-sm">Votre professeur personnel d'arabe</p>
          </div>
          <Button size="lg" className="gradient-emerald border-0" onClick={startSession} disabled={busy || loading}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Démarrer une session
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Flame className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{progress?.streak_days || 0}</p>
                <p className="text-xs text-muted-foreground">Jours consécutifs</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{Math.round(progress?.average_score || 0)}/100</p>
                <p className="text-xs text-muted-foreground">Score moyen</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 flex items-center gap-3">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{progress?.total_sessions || 0}</p>
                <p className="text-xs text-muted-foreground">Sessions totales</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan">Plan semaine</TabsTrigger>
            <TabsTrigger value="homework">Devoirs</TabsTrigger>
            <TabsTrigger value="history">Historique</TabsTrigger>
          </TabsList>

          <TabsContent value="plan" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Mon programme</h3>
              <Button size="sm" variant="outline" onClick={generateWeeklyPlan} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Générer un plan"}
              </Button>
            </div>
            {weeklyPlan.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun plan. Cliquez sur "Générer un plan".</p>
            ) : (
              weeklyPlan.map((d: any, i: number) => (
                <Card key={i}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-medium capitalize">{d.day} — {d.topic}</p>
                        <p className="text-sm text-muted-foreground mt-1">{d.exercise}</p>
                      </div>
                      <Badge variant="secondary">{d.duration_minutes} min</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="homework" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Mes devoirs</h3>
              <Button size="sm" variant="outline" onClick={generateHomework} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Nouveau devoir"}
              </Button>
            </div>
            {homework.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucun devoir.</p>
            ) : (
              homework.map((hw) => (
                <Card key={hw.id} className="cursor-pointer hover:border-primary/50 transition" onClick={() => hw.status !== "corrected" && setActiveHw(hw)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{hw.title}</p>
                        {hw.due_date && <p className="text-xs text-muted-foreground mt-1"><Clock className="h-3 w-3 inline mr-1" /> Pour le {hw.due_date}</p>}
                        {hw.feedback && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{hw.feedback}</p>}
                      </div>
                      <div className="text-right">
                        <Badge variant={hw.status === "corrected" ? "default" : hw.status === "submitted" ? "secondary" : "outline"}>
                          {hw.status === "pending" ? "À faire" : hw.status === "submitted" ? "Soumis" : "Corrigé"}
                        </Badge>
                        {hw.score !== null && <p className="text-lg font-bold mt-1">{hw.score}/100</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="history" className="space-y-3 mt-4">
            <h3 className="font-semibold">Sessions passées</h3>
            {sessions.filter((s) => s.ended_at).length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Aucune session terminée.</p>
            ) : (
              sessions.filter((s) => s.ended_at).map((s) => (
                <Card key={s.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">{new Date(s.started_at).toLocaleDateString("fr-FR", { dateStyle: "medium" })}</p>
                        {s.summary && <p className="text-sm mt-1">{s.summary}</p>}
                      </div>
                      {s.score !== null && <Badge variant="secondary">{Math.round(Number(s.score))}/100</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Tuteur;
