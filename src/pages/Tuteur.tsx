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
  const [currentPayload, setCurrentPayload] = useState<TutorPayload | null>(null);
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [textAnswer, setTextAnswer] = useState("");
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

  const resetQuestionState = () => {
    setSelectedIdx(null);
    setRevealed(false);
    setTextAnswer("");
  };

  const startSession = async () => {
    setBusy(true);
    try {
      const data = await callTutor("start_session");
      setActiveSessionId(data.session_id);
      setCurrentPayload(data.payload);
      resetQuestionState();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const submitAnswer = async (userAnswer: string) => {
    if (!activeSessionId) return;
    setSending(true);
    try {
      const data = await callTutor("message", { session_id: activeSessionId, user_message: userAnswer });
      setCurrentPayload(data.payload);
      resetQuestionState();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleMcqChoice = (idx: number) => {
    if (revealed || sending) return;
    setSelectedIdx(idx);
    setRevealed(true);
    const q = currentPayload?.question;
    if (!q?.choices) return;
    const isCorrect = idx === q.correct_index;
    const answer = `${isCorrect ? "Bonne réponse" : "Mauvaise réponse"}: j'ai choisi "${q.choices[idx]}" (correcte: "${q.choices[q.correct_index ?? 0]}"). Question suivante.`;
    setTimeout(() => submitAnswer(answer), 1200);
  };

  const handleTextSubmit = () => {
    if (!textAnswer.trim() || sending) return;
    submitAnswer(`Ma réponse: ${textAnswer.trim()}`);
  };

  const endSession = async () => {
    if (!activeSessionId) return;
    setBusy(true);
    try {
      const data = await callTutor("end_session", { session_id: activeSessionId });
      toast({ title: "Session terminée ✅", description: data.summary?.summary || "Bilan enregistré" });
      setActiveSessionId(null);
      setCurrentPayload(null);
      resetQuestionState();
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

  // ===== Active session view (Duolingo style) =====
  if (activeSessionId) {
    const q = currentPayload?.question;
    const fb = currentPayload?.feedback_fr;
    const fbAr = currentPayload?.feedback_ar;
    const isCorrect = revealed && q?.type === "mcq" && selectedIdx === q.correct_index;
    const showFeedbackBanner = revealed && q?.type === "mcq";

    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="container mx-auto pt-20 px-4 max-w-xl flex-1 flex flex-col pb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" /> Tuteur IA
            </h2>
            <Button size="sm" variant="outline" onClick={endSession} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminer"}
            </Button>
          </div>

          {sending && !currentPayload && (
            <div className="flex-1 flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          )}

          {currentPayload && (
            <motion.div key={JSON.stringify(q)} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
              {fb && fb.trim() && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{fb}</p>
                  {fbAr && <p className="text-base mt-1" dir="rtl" style={{ fontFamily: "Amiri, serif" }}>{fbAr}</p>}
                </div>
              )}

              {q ? (
                <>
                  <p className="text-center text-sm font-medium text-muted-foreground">{q.prompt_fr}</p>

                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-8 text-center space-y-2">
                      <div className="text-6xl md:text-7xl font-bold text-primary" dir="rtl" style={{ fontFamily: "Amiri, serif", lineHeight: 1.2 }}>
                        {q.display}
                      </div>
                      {q.translit && <p className="text-base text-muted-foreground">{q.translit}</p>}
                      {q.meaning_fr && <p className="text-sm italic text-foreground/70">{q.meaning_fr}</p>}
                    </CardContent>
                  </Card>

                  {q.type === "mcq" && q.choices && (
                    <div className="grid grid-cols-2 gap-3">
                      {q.choices.map((choice, idx) => {
                        const isSelected = selectedIdx === idx;
                        const isRight = idx === q.correct_index;
                        let cls = "border-2 border-border hover:border-primary/50 hover:bg-primary/5";
                        if (revealed) {
                          if (isRight) cls = "border-2 border-green-500 bg-green-500/10";
                          else if (isSelected) cls = "border-2 border-red-500 bg-red-500/10";
                          else cls = "border-2 border-border opacity-50";
                        }
                        return (
                          <button
                            key={idx}
                            onClick={() => handleMcqChoice(idx)}
                            disabled={revealed || sending}
                            className={`${cls} rounded-xl p-4 transition-all min-h-[64px] flex items-center justify-center text-2xl font-bold`}
                            dir="rtl"
                            style={{ fontFamily: "Amiri, serif" }}
                          >
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "text" && (
                    <div className="flex gap-2">
                      <Textarea
                        value={textAnswer}
                        onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="Votre réponse..."
                        className="resize-none"
                        dir="rtl"
                        rows={2}
                        onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }}
                      />
                      <Button onClick={handleTextSubmit} disabled={sending || !textAnswer.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {showFeedbackBanner && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`rounded-xl p-3 text-center font-semibold ${isCorrect ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-red-500/15 text-red-700 dark:text-red-400"}`}
                    >
                      {isCorrect ? "✅ Bravo !" : "❌ Réessaie !"}
                    </motion.div>
                  )}
                </>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Session terminée. Cliquez sur "Terminer" pour le bilan.</p>
                </div>
              )}

              {sending && (
                <div className="text-center text-xs text-muted-foreground">
                  <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> Question suivante...
                </div>
              )}
            </motion.div>
          )}
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
