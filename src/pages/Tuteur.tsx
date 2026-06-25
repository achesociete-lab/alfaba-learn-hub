import { useEffect, useRef, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Crown, Flame, Trophy, BookOpen, Send, Loader2, Sparkles, Calendar,
  CheckCircle2, Clock, Star, Target, Lock, TrendingUp, Brain, Zap,
  Award, BarChart2, ChevronRight, Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import Navbar from "@/components/Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { supabase } from "@/integrations/supabase/client";
import confetti from "canvas-confetti";
import { playCorrectSound, playWrongSound, playVictorySound, playArrivalSound } from "@/utils/sound-feedback";
import type { TutorQuestion, TutorPayload } from "@/types/tutor";
import { getRandomFallbackQuestion } from "@/utils/tutor-fallback-questions";
import { usePersistentState, userScopedKey } from "@/hooks/use-persistent-state";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Session {
  id: string; started_at: string; ended_at: string | null;
  summary: string | null; score: number | null;
}
interface Homework {
  id: string; title: string; content: any; due_date: string | null;
  status: string; score: number | null; feedback: string | null; created_at: string;
}
interface TutorProgress {
  total_sessions: number; average_score: number; streak_days: number;
  weekly_plan: any; weak_letters: any[]; strong_letters: any[];
}

// ─── Static data ──────────────────────────────────────────────────────────────
const SESSION_START_TIMEOUT_MS = 5000;
const NEXT_QUESTION_TIMEOUT_MS = 5000;

const ARABIC_ALPHABET = [
  "ا","ب","ت","ث","ج","ح","خ","د","ذ","ر","ز","س","ش","ص",
  "ض","ط","ظ","ع","غ","ف","ق","ك","ل","م","ن","ه","و","ي",
];
const ARABIC_NAMES: Record<string, string> = {
  "ا":"Alif","ب":"Bâ","ت":"Tâ","ث":"Thâ","ج":"Jîm","ح":"Hâ","خ":"Khâ",
  "د":"Dâl","ذ":"Dhâl","ر":"Râ","ز":"Zây","س":"Sîn","ش":"Chîn","ص":"Sâd",
  "ض":"Dâd","ط":"Tâ'","ظ":"Dhâ'","ع":"'Ayn","غ":"Ghayn","ف":"Fâ",
  "ق":"Qâf","ك":"Kâf","ل":"Lâm","م":"Mîm","ن":"Nûn","ه":"Hâ'","و":"Wâw","ي":"Yâ",
};

const DEMO_QUESTIONS = [
  { display:"كِتَابٌ", prompt:"Identifiez la lettre : كاف (Kâf)", choices:["ج","ك","ف","ق"], correct:1, meaning:"Livre", translit:"kitāb" },
  { display:"بَيْتٌ",  prompt:"Identifiez la lettre : باء (Bâ)",  choices:["ب","ت","ن","ي"], correct:0, meaning:"Maison", translit:"bayt" },
  { display:"نَهَرٌ",  prompt:"Identifiez la lettre : نون (Nûn)", choices:["ي","ر","ن","و"], correct:2, meaning:"Rivière", translit:"nahar" },
  { display:"قَمَرٌ",  prompt:"Identifiez la lettre : قاف (Qâf)", choices:["ف","ك","ق","غ"], correct:2, meaning:"Lune",   translit:"qamar" },
];

const FEATURES = [
  { icon: Brain,     colorBg:"bg-purple-500/10", colorIcon:"text-purple-500",
    title:"IA qui apprend vos erreurs",
    desc:"L'algorithme analyse chaque réponse et cible en temps réel vos lacunes spécifiques." },
  { icon: Target,    colorBg:"bg-blue-500/10",   colorIcon:"text-blue-500",
    title:"Questions illimitées ciblées",
    desc:"Des centaines de QCM générés spécialement pour vous, toujours adaptés à votre niveau." },
  { icon: Calendar,  colorBg:"bg-green-500/10",  colorIcon:"text-green-600",
    title:"Plan hebdomadaire sur mesure",
    desc:"Un programme structuré sur 7 jours, généré chaque semaine selon vos résultats." },
  { icon: BookOpen,  colorBg:"bg-orange-500/10", colorIcon:"text-orange-500",
    title:"Devoirs corrigés par l'IA",
    desc:"Exercices personnalisés avec correction automatique et feedback détaillé en français." },
  { icon: TrendingUp,colorBg:"bg-primary/10",    colorIcon:"text-primary",
    title:"Suivi de progression complet",
    desc:"Streak quotidien, score moyen, alphabet mastery, historique de toutes vos sessions." },
  { icon: Zap,       colorBg:"bg-yellow-500/10", colorIcon:"text-yellow-600",
    title:"Rapport hebdomadaire email",
    desc:"Récapitulatif de vos progrès de la semaine envoyé automatiquement chaque dimanche." },
];

const TESTIMONIALS = [
  { name:"Marie L.", age:"32 ans", avatar:"م", stars:5,
    text:"En 3 semaines avec مساري, je lis déjà des versets du Coran. Les questions s'adaptent exactement à mes lacunes — c'est vraiment bluffant." },
  { name:"Thomas B.", age:"28 ans", avatar:"ت", stars:5,
    text:"C'est comme avoir un professeur particulier 24h/24. Le plan hebdomadaire me structure et mon streak est à 21 jours consécutifs !" },
  { name:"Nour A.", age:"45 ans", avatar:"ن", stars:5,
    text:"Après des années d'essais infructueux, j'ai enfin une méthode qui fonctionne. 20 lettres maîtrisées en 2 mois seulement." },
];

// ─── Component ────────────────────────────────────────────────────────────────
const Tuteur = () => {
  const { user } = useAuth();
  const { plan, loading: subLoading } = useSubscription();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [progress, setProgress] = useState<TutorProgress | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [homework, setHomework] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeSessionId, setActiveSessionId] = usePersistentState<string | null>(
    userScopedKey(user?.id, "tutor:activeSessionId"), null);
  const [currentPayload, setCurrentPayload] = usePersistentState<TutorPayload | null>(
    userScopedKey(user?.id, "tutor:currentPayload"), null);
  const [selectedIdx, setSelectedIdx] = usePersistentState<number | null>(
    userScopedKey(user?.id, "tutor:selectedIdx"), null);
  const [revealed, setRevealed] = usePersistentState<boolean>(
    userScopedKey(user?.id, "tutor:revealed"), false);
  const [textAnswer, setTextAnswer] = usePersistentState<string>(
    userScopedKey(user?.id, "tutor:textAnswer"), "");

  const [sending, setSending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [activeHw, setActiveHw] = useState<Homework | null>(null);
  const [submission, setSubmission] = useState<Record<number, string>>({});

  const prefetchedRef = useRef<TutorPayload | null>(null);
  const prefetchInFlightRef = useRef<boolean>(false);
  const seenDisplaysRef = useRef<Set<string>>(new Set());

  // Demo teaser state
  const [demoIdx, setDemoIdx] = useState(0);
  const [demoRevealed, setDemoRevealed] = useState(false);
  const [demoSelected, setDemoSelected] = useState<number | null>(null);

  const isPremium = plan === "premium" || plan === "famille";

  // Auto-rotate demo questions
  useEffect(() => {
    if (isPremium) return;
    const t = setInterval(() => {
      setDemoIdx((i) => (i + 1) % DEMO_QUESTIONS.length);
      setDemoRevealed(false);
      setDemoSelected(null);
    }, 5000);
    return () => clearInterval(t);
  }, [isPremium]);

  // ── Data ────────────────────────────────────────────────────────────────────
  const loadAll = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: prog }, { data: sess }, { data: hw }] = await Promise.all([
      supabase.from("tutor_progress").select("*").eq("user_id", user.id).maybeSingle(),
      supabase.from("tutor_sessions").select("*").eq("user_id", user.id).order("started_at", { ascending: false }).limit(30),
      supabase.from("tutor_homework").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
    ]);
    setProgress(prog as any);
    setSessions((sess || []) as any);
    setHomework((hw || []) as any);
    setLoading(false);
  };

  useEffect(() => { if (user && isPremium) loadAll(); }, [user, isPremium]);

  // ── AI calls ────────────────────────────────────────────────────────────────
  const callTutor = async (action: string, payload: any = {}) => {
    const { data, error } = await supabase.functions.invoke("ai-tutor", { body: { action, ...payload } });
    if (error) throw error;
    if (data?.error) throw new Error(data.error);
    return data;
  };

  const callTutorWithTimeout = async (action: string, payload: any, timeoutMs: number) =>
    Promise.race([
      callTutor(action, payload),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), timeoutMs)),
    ]);

  const buildFallbackPayload = (): TutorPayload => {
    const q = getRandomFallbackQuestion(seenDisplaysRef.current);
    seenDisplaysRef.current.add(q.display);
    return { feedback_fr: "", feedback_ar: "", question: q };
  };

  const resetQuestionState = () => { setSelectedIdx(null); setRevealed(false); setTextAnswer(""); };

  const prefetchNext = async (sessionId: string, lastAnswer: string) => {
    if (prefetchInFlightRef.current || prefetchedRef.current) return;
    prefetchInFlightRef.current = true;
    try {
      const data = await callTutor("message", { session_id: sessionId, user_message: lastAnswer });
      if (data?.payload) prefetchedRef.current = data.payload;
    } catch { } finally { prefetchInFlightRef.current = false; }
  };

  const startSession = async () => {
    setActiveSessionId("__loading__");
    setCurrentPayload(null);
    resetQuestionState();
    seenDisplaysRef.current = new Set();
    prefetchedRef.current = null;
    try {
      const data = await callTutorWithTimeout("start_session", {}, SESSION_START_TIMEOUT_MS);
      if (data && data.session_id && data.payload?.question) {
        setActiveSessionId(data.session_id);
        setCurrentPayload(data.payload);
        if (data.payload.question?.display) seenDisplaysRef.current.add(data.payload.question.display);
        resetQuestionState();
        return;
      }
      const fallback = buildFallbackPayload();
      setCurrentPayload(fallback);
      resetQuestionState();
      callTutor("start_session").then((d) => {
        if (d?.session_id) setActiveSessionId(d.session_id);
      }).catch(() => {
        toast({ title: "Mode hors-ligne", description: "Questions de base — réessayez plus tard pour le contenu personnalisé." });
      });
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
      setActiveSessionId(null);
    }
  };

  const submitAnswer = async (userAnswer: string) => {
    if (!activeSessionId) return;
    setSending(true);
    if (prefetchedRef.current && activeSessionId !== "__loading__") {
      const next = prefetchedRef.current;
      prefetchedRef.current = null;
      setCurrentPayload(next);
      if (next.question?.display) seenDisplaysRef.current.add(next.question.display);
      resetQuestionState();
      setSending(false);
      prefetchNext(activeSessionId, "Question suivante.");
      return;
    }
    try {
      if (activeSessionId === "__loading__") {
        setCurrentPayload(buildFallbackPayload());
        resetQuestionState();
        setSending(false);
        return;
      }
      const data = await callTutorWithTimeout("message", { session_id: activeSessionId, user_message: userAnswer }, NEXT_QUESTION_TIMEOUT_MS);
      if (data?.payload) {
        setCurrentPayload(data.payload);
        if (data.payload.question?.display) seenDisplaysRef.current.add(data.payload.question.display);
        resetQuestionState();
        prefetchNext(activeSessionId, "Question suivante.");
      } else {
        setCurrentPayload(buildFallbackPayload());
        resetQuestionState();
      }
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setSending(false); }
  };

  const handleMcqChoice = (idx: number) => {
    if (revealed || sending) return;
    setSelectedIdx(idx);
    setRevealed(true);
    const q = currentPayload?.question;
    if (!q?.choices) return;
    const isCorrect = idx === q.correct_index;
    if (isCorrect) playCorrectSound(); else playWrongSound();
    const answer = `${isCorrect ? "Bonne réponse" : "Mauvaise réponse"}: j'ai choisi "${q.choices[idx]}" (correcte: "${q.choices[q.correct_index ?? 0]}"). Question suivante.`;
    setTimeout(() => submitAnswer(answer), isCorrect ? 350 : 700);
  };

  const handleTextSubmit = () => {
    if (!textAnswer.trim() || sending) return;
    submitAnswer(`Ma réponse: ${textAnswer.trim()}`);
  };

  const fireFireworks = () => {
    const duration = 2500;
    const end = Date.now() + duration;
    const colors = ["#10b981","#fbbf24","#fef3c7","#34d399"];
    (function frame() {
      confetti({ particleCount: 4, angle: 60, spread: 70, origin: { x: 0 }, colors });
      confetti({ particleCount: 4, angle: 120, spread: 70, origin: { x: 1 }, colors });
      if (Date.now() < end) requestAnimationFrame(frame);
    })();
    confetti({ particleCount: 120, spread: 100, origin: { y: 0.6 }, colors });
  };

  const endSession = async () => {
    if (!activeSessionId) return;
    setBusy(true);
    playArrivalSound();
    try {
      const data = await callTutor("end_session", { session_id: activeSessionId });
      const score = data.summary?.score ?? 0;
      if (score >= 80) {
        playVictorySound();
        fireFireworks();
        toast({ title: `🎉 Excellent ! ${score}/100`, description: data.summary?.summary || "Bravo !" });
      } else {
        toast({ title: "Session terminée ✅", description: data.summary?.summary || "Bilan enregistré" });
      }
      setActiveSessionId(null);
      setCurrentPayload(null);
      resetQuestionState();
      await loadAll();
    } catch (e: any) {
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally { setBusy(false); }
  };

  const generateWeeklyPlan = async () => {
    setBusy(true);
    try { await callTutor("weekly_plan"); toast({ title: "Plan généré ✅" }); await loadAll(); }
    catch (e: any) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const generateHomework = async () => {
    setBusy(true);
    try { await callTutor("generate_homework"); toast({ title: "Devoir créé ✅" }); await loadAll(); }
    catch (e: any) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  const submitHomework = async () => {
    if (!activeHw) return;
    setBusy(true);
    try {
      const data = await callTutor("correct_homework", { homework_id: activeHw.id, submission: { answers: submission } });
      toast({ title: `Note: ${data.score}/100`, description: data.feedback?.slice(0, 120) });
      setActiveHw(null); setSubmission({});
      await loadAll();
    } catch (e: any) { toast({ title: "Erreur", description: e.message, variant: "destructive" }); }
    finally { setBusy(false); }
  };

  // ── Derived dashboard data ──────────────────────────────────────────────────
  const strongSet = useMemo(() => new Set<string>((progress?.strong_letters || []).map(String)), [progress]);
  const weakSet   = useMemo(() => new Set<string>((progress?.weak_letters   || []).map(String)), [progress]);
  const masteredCount = strongSet.size;
  const masteredPct   = Math.round((masteredCount / 28) * 100);

  const streakCalendar = useMemo(() => {
    const datesWithSession = new Set(
      sessions.filter((s) => s.ended_at).map((s) => new Date(s.started_at).toISOString().slice(0, 10))
    );
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().slice(0, 10);
      return { key, day: d.getDate(), has: datesWithSession.has(key) };
    });
  }, [sessions]);

  const skills = useMemo(() => [
    { label:"Lettres maîtrisées", value: masteredPct,                                                                    color:"bg-green-500" },
    { label:"Score moyen",        value: Math.round(progress?.average_score || 0),                                       color:"bg-blue-500"  },
    { label:"Régularité",         value: Math.min(Math.round(((progress?.streak_days || 0) / 30) * 100), 100),           color:"bg-orange-500"},
    { label:"Volume de sessions", value: Math.min(Math.round(((progress?.total_sessions || 0) / 30) * 100), 100),        color:"bg-purple-500"},
  ], [progress, masteredPct]);

  // ══════════════════════════════════════════════════════════════════════════════
  // UPSELL SCREEN
  // ══════════════════════════════════════════════════════════════════════════════
  if (!subLoading && !isPremium) {
    const dq = DEMO_QUESTIONS[demoIdx];
    return (
      <div className="min-h-screen bg-background overflow-x-hidden">
        <Navbar />

        {/* Hero */}
        <div className="relative overflow-hidden" style={{ background:"linear-gradient(135deg,#064e3b 0%,#065f46 55%,#047857 100%)" }}>
          {/* Floating letters */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none select-none" aria-hidden>
            {ARABIC_ALPHABET.slice(0, 14).map((l, i) => (
              <motion.span key={l}
                className="absolute font-bold text-white/8 select-none"
                style={{ fontSize:`${2.5+(i%3)*1.5}rem`, left:`${(i*7+3)%100}%`, top:`${(i*11+5)%90}%`, fontFamily:"Amiri, serif" }}
                animate={{ y:[0,-18,0], rotate:[0,4,-4,0] }}
                transition={{ duration:5+i*0.4, repeat:Infinity, delay:i*0.25 }}
              >{l}</motion.span>
            ))}
          </div>

          <div className="container mx-auto px-4 pt-28 pb-16 text-center relative z-10">
            <motion.div initial={{ opacity:0, y:24 }} animate={{ opacity:1, y:0 }}>
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/20 rounded-full px-4 py-1.5 mb-6 text-white/90 text-sm font-medium">
                <Crown className="h-4 w-4 text-yellow-300" /> Module exclusif Premium
              </div>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-1 font-arabic" dir="rtl"
                  style={{ fontFamily:"Amiri, serif", textShadow:"0 2px 24px rgba(0,0,0,0.35)" }}>
                مساري
              </h1>
              <p className="text-2xl text-white/90 font-semibold mb-2">Mon Parcours Personnalisé</p>
              <p className="text-white/70 text-base max-w-xl mx-auto mb-10 leading-relaxed">
                Arrêtez les méthodes génériques. Votre IA analyse chaque erreur, cible vos lacunes et vous guide vers la maîtrise de l'arabe — à votre rythme.
              </p>

              <div className="flex justify-center gap-10 md:gap-16 flex-wrap">
                {[{ v:"500+", l:"élèves actifs" },{ v:"4.8 ★", l:"note moyenne" },{ v:"87%", l:"atteignent leurs objectifs" }].map((s) => (
                  <motion.div key={s.l} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="text-center">
                    <p className="text-3xl font-bold text-white">{s.v}</p>
                    <p className="text-white/60 text-xs mt-0.5">{s.l}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12 max-w-5xl">

          {/* Demo + Pricing */}
          <div className="grid md:grid-cols-2 gap-8 mb-16">

            {/* Interactive demo */}
            <motion.div initial={{ opacity:0, x:-24 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.15 }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" /> Essayez une vraie question مساري
              </h2>
              <Card className="border-2 border-primary/25 shadow-lg overflow-hidden">
                <div className="bg-primary/8 px-4 py-2.5 border-b border-primary/15 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-muted-foreground font-medium">Session en cours · Niveau 1</span>
                  </div>
                  <Badge variant="outline" className="text-xs border-primary/30 text-primary">Aperçu gratuit</Badge>
                </div>
                <CardContent className="p-6">
                  <AnimatePresence mode="wait">
                    <motion.div key={demoIdx}
                      initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-10 }}
                      transition={{ duration:0.3 }}>
                      <p className="text-sm text-muted-foreground text-center mb-4 font-medium">{dq.prompt}</p>

                      <div className="text-center py-5 bg-primary/4 rounded-2xl mb-4">
                        <span className="text-7xl font-bold text-primary" dir="rtl" style={{ fontFamily:"Amiri, serif", lineHeight:1.3 }}>
                          {dq.display}
                        </span>
                        {demoRevealed && (
                          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} className="mt-2 space-y-0.5">
                            <p className="text-sm text-muted-foreground italic">{dq.translit}</p>
                            <p className="text-sm font-medium text-foreground/70">"{dq.meaning}"</p>
                          </motion.div>
                        )}
                      </div>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        {dq.choices.map((c, i) => {
                          let cls = "rounded-xl p-3.5 text-2xl font-bold transition-all flex items-center justify-center border-2 ";
                          if (demoRevealed) {
                            if (i === dq.correct) cls += "border-green-500 bg-green-500/10 text-green-700";
                            else if (i === demoSelected) cls += "border-red-500 bg-red-500/10 text-red-700";
                            else cls += "border-border opacity-35";
                          } else {
                            cls += "border-border hover:border-primary/60 hover:bg-primary/5 cursor-pointer active:scale-95";
                          }
                          return (
                            <button key={i} className={cls} dir="rtl" style={{ fontFamily:"Amiri, serif" }}
                              onClick={() => { if (demoRevealed) return; setDemoSelected(i); setDemoRevealed(true); }}>
                              {c}
                            </button>
                          );
                        })}
                      </div>

                      {demoRevealed && (
                        <motion.div initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
                          className={`rounded-xl p-3 text-center text-sm font-semibold mb-4 ${demoSelected === dq.correct ? "bg-green-500/12 text-green-700" : "bg-red-500/12 text-red-700"}`}>
                          {demoSelected === dq.correct
                            ? "✅ Bravo ! L'IA cible déjà votre prochaine question…"
                            : `❌ Réponse : ${dq.choices[dq.correct]} — مساري renforce cette lettre pour vous !`}
                        </motion.div>
                      )}

                      {/* Locked CTA */}
                      <div className="relative">
                        <div className="blur-[2px] pointer-events-none">
                          <Button className="w-full gradient-emerald border-0 opacity-50">
                            Question suivante <ChevronRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <button onClick={() => navigate("/tarifs")}
                            className="bg-background/95 backdrop-blur-sm rounded-full px-5 py-2 flex items-center gap-2 text-sm font-semibold border border-primary/40 shadow-md text-primary hover:bg-primary/5 transition">
                            <Lock className="h-3.5 w-3.5" /> Débloquer avec Premium
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </CardContent>
              </Card>

              {/* Mini progress preview (locked) */}
              <Card className="mt-4 border-border bg-muted/30">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3 flex items-center gap-1.5">
                    <BarChart2 className="h-3.5 w-3.5" /> Votre tableau de bord مساري
                  </p>
                  <div className="space-y-2.5">
                    {[
                      { label:"Lettres maîtrisées", preview:"0/28 — commencez !" },
                      { label:"Streak quotidien",   preview:"0 jour" },
                      { label:"Score moyen",        preview:"Pas encore de session" },
                    ].map((r) => (
                      <div key={r.label}>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-muted-foreground">{r.label}</span>
                          <span className="text-muted-foreground/60 italic">{r.preview}</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className="h-full bg-primary/20 rounded-full w-0" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-center text-primary font-medium mt-3">
                    → Débloquez votre tableau complet avec Premium
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pricing card */}
            <motion.div initial={{ opacity:0, x:24 }} animate={{ opacity:1, x:0 }} transition={{ delay:0.2 }}>
              <h2 className="text-lg font-bold mb-3 flex items-center gap-2">
                <Crown className="h-5 w-5 text-primary" /> Abonnement Premium
              </h2>

              <Card className="border-2 border-primary shadow-xl shadow-primary/10">
                <div className="gradient-emerald px-6 py-5 text-center">
                  <p className="text-primary-foreground/80 text-sm font-medium mb-1">Accès complet · Sans engagement</p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-primary-foreground">15€</span>
                    <span className="text-primary-foreground/70 text-lg">/mois</span>
                  </div>
                  <p className="text-primary-foreground/60 text-xs mt-1">Résiliable à tout moment · Accès immédiat</p>
                </div>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2.5">
                    {[
                      "مساري — Parcours personnalisé par IA",
                      "الأستاذ — Professeur Virtuel illimité",
                      "Plan d'apprentissage hebdomadaire",
                      "Devoirs avec correction automatique",
                      "Rapport de progression hebdomadaire",
                      "Suivi streak & badges de réussite",
                      "Accès immédiat à tous les niveaux",
                    ].map((f) => (
                      <div key={f} className="flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
                        <span className="text-sm font-medium">{f}</span>
                      </div>
                    ))}
                  </div>

                  <Button size="lg"
                    className="gradient-emerald border-0 w-full text-base font-bold shadow-lg shadow-primary/20"
                    onClick={() => navigate("/tarifs")}>
                    <Crown className="mr-2 h-5 w-5 text-yellow-300" /> Passer Premium maintenant
                  </Button>

                  <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Shield className="h-3 w-3" /> Paiement sécurisé</span>
                    <span className="flex items-center gap-1"><CheckCircle2 className="h-3 w-3" /> Annulation en 1 clic</span>
                    <span className="flex items-center gap-1"><Zap className="h-3 w-3" /> Accès immédiat</span>
                  </div>
                </CardContent>
              </Card>

              {/* Comparison */}
              <Card className="mt-4 border-border">
                <CardContent className="p-4">
                  <p className="text-xs font-semibold text-muted-foreground mb-3">Gratuit vs Premium</p>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-muted-foreground border-b border-border">
                        <th className="text-left pb-2 font-medium">Fonctionnalité</th>
                        <th className="text-center pb-2 font-medium">Gratuit</th>
                        <th className="text-center pb-2 font-medium text-primary">Premium</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {[
                        ["Professeur Virtuel","Limité","Illimité"],
                        ["Parcours مساري","—","✅"],
                        ["Plan hebdomadaire","—","✅"],
                        ["Devoirs corrigés","—","✅"],
                        ["Rapport email","—","✅"],
                        ["Statistiques complètes","—","✅"],
                      ].map(([feat, free, prem]) => (
                        <tr key={feat}>
                          <td className="py-2 text-foreground/80">{feat}</td>
                          <td className="text-center py-2 text-muted-foreground">{free}</td>
                          <td className="text-center py-2 text-primary font-semibold">{prem}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Features grid */}
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.3 }} className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-2">Tout ce qui est inclus dans مساري</h2>
            <p className="text-muted-foreground text-center mb-8 text-sm">Un système complet pour progresser rapidement et durablement</p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {FEATURES.map((f, i) => (
                <motion.div key={f.title} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.35+i*0.06 }}>
                  <Card className="h-full border-border hover:border-primary/40 hover:shadow-md transition-all group">
                    <CardContent className="p-5 space-y-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${f.colorBg} group-hover:scale-110 transition-transform`}>
                        <f.icon className={`h-5 w-5 ${f.colorIcon}`} />
                      </div>
                      <h3 className="font-bold">{f.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Testimonials */}
          <motion.section initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.4 }} className="mb-16">
            <h2 className="text-2xl font-bold text-center mb-2">Ce qu'ils disent de مساري</h2>
            <div className="flex justify-center items-center gap-1 mb-6">
              {Array.from({ length:5 }).map((_,i) => <Star key={i} className="h-5 w-5 fill-yellow-400 text-yellow-400" />)}
              <span className="ml-2 text-sm text-muted-foreground font-medium">4.8/5 · 500+ avis</span>
            </div>
            <div className="grid sm:grid-cols-3 gap-5">
              {TESTIMONIALS.map((t, i) => (
                <motion.div key={t.name} initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.45+i*0.08 }}>
                  <Card className="h-full border-border hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex flex-col h-full space-y-3">
                      <div className="flex gap-0.5">
                        {Array.from({ length:t.stars }).map((_,j) => <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />)}
                      </div>
                      <p className="text-sm text-foreground/85 italic leading-relaxed flex-1">"{t.text}"</p>
                      <div className="flex items-center gap-3 pt-2 border-t border-border">
                        <div className="w-10 h-10 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground font-bold text-lg shrink-0"
                          dir="rtl" style={{ fontFamily:"Amiri, serif" }}>{t.avatar}</div>
                        <div>
                          <p className="font-semibold text-sm">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.age}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Final CTA */}
          <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} transition={{ delay:0.5 }}>
            <Card className="border-2 border-primary/30 overflow-hidden">
              <div className="gradient-emerald p-8 md:p-10 text-center">
                <Crown className="h-12 w-12 mx-auto mb-3 text-yellow-300" />
                <h2 className="text-2xl md:text-3xl font-bold text-primary-foreground mb-2">
                  Commencez votre parcours مساري aujourd'hui
                </h2>
                <p className="text-primary-foreground/75 mb-6 max-w-md mx-auto">
                  Rejoignez 500+ élèves qui progressent chaque jour. Sans engagement, résiliable à tout moment.
                </p>
                <Button size="lg"
                  className="bg-white text-primary hover:bg-white/90 border-0 px-10 text-base font-bold shadow-xl"
                  onClick={() => navigate("/tarifs")}>
                  <Crown className="mr-2 h-5 w-5 text-yellow-500" /> Passer Premium — 15€/mois
                </Button>
                <p className="text-primary-foreground/50 text-xs mt-4">
                  🔒 Paiement sécurisé Stripe · Accès immédiat · Annulation en 1 clic
                </p>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    );
  }

  // ══════════════════════════════════════════════════════════════════════════════
  // ACTIVE SESSION VIEW
  // ══════════════════════════════════════════════════════════════════════════════
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
              <Sparkles className="h-5 w-5 text-primary" />
              <span dir="rtl" style={{ fontFamily:"Amiri, serif" }}>مساري</span>
            </h2>
            <Button size="sm" variant="outline" onClick={endSession} disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Terminer"}
            </Button>
          </div>

          {!currentPayload && (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 animate-pulse">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-40 w-full max-w-sm bg-muted/50 rounded-2xl" />
              <div className="grid grid-cols-2 gap-3 w-full max-w-sm">
                {[0,1,2,3].map((i) => <div key={i} className="h-16 bg-muted/40 rounded-xl" />)}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                <Loader2 className="h-3 w-3 animate-spin inline mr-1" /> Préparation de votre session...
              </p>
            </div>
          )}

          {currentPayload && (
            <motion.div key={JSON.stringify(q)} initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }} className="space-y-4">
              {fb && fb.trim() && (
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">{fb}</p>
                  {fbAr && <p className="text-base mt-1" dir="rtl" style={{ fontFamily:"Amiri, serif" }}>{fbAr}</p>}
                </div>
              )}
              {q ? (
                <>
                  <p className="text-center text-sm font-medium text-muted-foreground">{q.prompt_fr}</p>
                  <Card className="border-2 border-primary/20">
                    <CardContent className="p-8 text-center space-y-2">
                      <div className="text-6xl md:text-7xl font-bold text-primary" dir="rtl" style={{ fontFamily:"Amiri, serif", lineHeight:1.2 }}>
                        {(() => {
                          if (!q.highlight) return q.display;
                          const STRIP = /[\u064B-\u0652\u0670\u0640]/g;
                          const target = q.highlight.replace(STRIP, "");
                          if (!target) return q.display;
                          const chars = Array.from(q.display);
                          const groups: string[] = [];
                          for (const ch of chars) {
                            if (/[\u064B-\u0652\u0670\u0640]/.test(ch) && groups.length > 0) groups[groups.length-1] += ch;
                            else groups.push(ch);
                          }
                          return groups.map((g, i) => {
                            const base = g.replace(STRIP, "");
                            return <span key={i} style={base === target ? { color:"#DC2626" } : undefined}>{g}</span>;
                          });
                        })()}
                      </div>
                      {revealed && q.translit   && <p className="text-base text-muted-foreground">{q.translit}</p>}
                      {revealed && q.meaning_fr && <p className="text-sm italic text-foreground/70">{q.meaning_fr}</p>}
                    </CardContent>
                  </Card>

                  {q.type === "mcq" && q.choices && (
                    <div className="grid grid-cols-2 gap-3">
                      {q.choices.map((choice, idx) => {
                        const isSel = selectedIdx === idx;
                        const isRight = idx === q.correct_index;
                        let cls = "border-2 border-border hover:border-primary/50 hover:bg-primary/5";
                        if (revealed) {
                          if (isRight) cls = "border-2 border-green-500 bg-green-500/10";
                          else if (isSel) cls = "border-2 border-red-500 bg-red-500/10";
                          else cls = "border-2 border-border opacity-50";
                        }
                        return (
                          <button key={idx} onClick={() => handleMcqChoice(idx)} disabled={revealed || sending}
                            className={`${cls} rounded-xl p-4 transition-all min-h-[64px] flex items-center justify-center text-2xl font-bold`}
                            dir="rtl" style={{ fontFamily:"Amiri, serif" }}>
                            {choice}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {q.type === "text" && (
                    <div className="flex gap-2">
                      <Textarea value={textAnswer} onChange={(e) => setTextAnswer(e.target.value)}
                        placeholder="Votre réponse..." className="resize-none" dir="rtl" rows={2}
                        onKeyDown={(e) => { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); } }} />
                      <Button onClick={handleTextSubmit} disabled={sending || !textAnswer.trim()}>
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  )}

                  {showFeedbackBanner && (
                    <motion.div initial={{ opacity:0, y:10 }} animate={{ opacity:1, y:0 }}
                      className={`rounded-xl p-3 text-center font-semibold ${isCorrect ? "bg-green-500/15 text-green-700 dark:text-green-400" : "bg-red-500/15 text-red-700 dark:text-red-400"}`}>
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

  // ══════════════════════════════════════════════════════════════════════════════
  // ACTIVE HOMEWORK VIEW
  // ══════════════════════════════════════════════════════════════════════════════
  if (activeHw) {
    const exercises = activeHw.content?.exercises || [];
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto pt-24 px-4 max-w-2xl pb-8">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => { setActiveHw(null); setSubmission({}); }}>
            ← Retour
          </Button>
          <Card>
            <CardHeader>
              <CardTitle>{activeHw.title}</CardTitle>
              {activeHw.content?.instructions && <p className="text-sm text-muted-foreground">{activeHw.content.instructions}</p>}
            </CardHeader>
            <CardContent className="space-y-4">
              {exercises.map((ex: any, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="font-medium" dir="rtl" style={{ fontFamily:"Amiri, serif", fontSize:"18px" }}>
                    {i+1}. {ex.question}
                  </p>
                  <Textarea value={submission[i] || ""} onChange={(e) => setSubmission({ ...submission, [i]: e.target.value })}
                    placeholder="Votre réponse..." dir="rtl" />
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

  // ══════════════════════════════════════════════════════════════════════════════
  // PREMIUM DASHBOARD
  // ══════════════════════════════════════════════════════════════════════════════
  const weeklyPlan = progress?.weekly_plan?.daily_plan || [];
  const pendingHw = homework.filter((h) => h.status === "pending").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto pt-24 px-4 max-w-5xl pb-12">

        {/* Header */}
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-3xl font-display font-bold flex items-center gap-2">
              <span className="text-4xl" dir="rtl" style={{ fontFamily:"Amiri, serif" }}>مساري</span>
              <Crown className="h-6 w-6 text-yellow-500" />
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">Mon Parcours Personnalisé · Premium</p>
          </div>
          <Button size="lg" className="gradient-emerald border-0 shadow-md shadow-primary/20"
            onClick={startSession} disabled={busy || loading}>
            {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Démarrer une session
          </Button>
        </div>

        {/* Stats cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {[
            { icon:Flame,   bg:"bg-orange-500/10", ic:"text-orange-500", border:"border-orange-200 dark:border-orange-900/40",
              value:progress?.streak_days || 0, label:"Jours consécutifs" },
            { icon:Trophy,  bg:"bg-yellow-500/10", ic:"text-yellow-500", border:"border-yellow-200 dark:border-yellow-900/40",
              value:`${Math.round(progress?.average_score || 0)}/100`, label:"Score moyen" },
            { icon:BookOpen,bg:"bg-primary/10",    ic:"text-primary",    border:"border-primary/20",
              value:progress?.total_sessions || 0, label:"Sessions totales" },
            { icon:Award,   bg:"bg-green-500/10",  ic:"text-green-600",  border:"border-green-200 dark:border-green-900/40",
              value:`${masteredCount}/28`, label:"Lettres maîtrisées" },
          ].map((s) => (
            <Card key={s.label} className={`${s.border}`}>
              <CardContent className="p-4 flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
                  <s.icon className={`h-5 w-5 ${s.ic}`} />
                </div>
                <div>
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground leading-tight">{s.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Streak calendar */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-orange-500" /> Activité — 30 derniers jours
              </p>
              <span className="text-xs text-muted-foreground">
                {sessions.filter((s) => s.ended_at).length} sessions terminées
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {streakCalendar.map((d) => (
                <div key={d.key} title={`${d.key}${d.has ? " · Session ✓" : ""}`}
                  className={`w-7 h-7 rounded-md flex items-center justify-center text-xs font-semibold transition-all ${
                    d.has ? "bg-primary text-primary-foreground shadow-sm" : "bg-muted text-muted-foreground/40"
                  }`}>
                  {d.day}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-4 mt-2.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-primary inline-block" /> Session effectuée</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-muted inline-block" /> Pas de session</span>
            </div>
          </CardContent>
        </Card>

        {/* Alphabet mastery + skills */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">

          {/* Alphabet mastery */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-1 flex items-center gap-2">
                <Brain className="h-4 w-4 text-purple-500" /> Maîtrise de l'alphabet
              </p>
              <p className="text-xs text-muted-foreground mb-2">{masteredCount}/28 lettres · {masteredPct}% maîtrisé</p>
              <Progress value={masteredPct} className="h-1.5 mb-4" />
              <div className="grid grid-cols-7 gap-1.5">
                {ARABIC_ALPHABET.map((l) => {
                  const isStrong = strongSet.has(l);
                  const isWeak   = weakSet.has(l);
                  return (
                    <div key={l}
                      title={`${ARABIC_NAMES[l] || l}${isStrong ? " · Maîtrisé ✅" : isWeak ? " · À renforcer ⚠️" : " · Non évalué"}`}
                      className={`aspect-square rounded-lg flex items-center justify-center text-lg font-bold cursor-default select-none transition-all ${
                        isStrong ? "bg-green-500/15 text-green-700 dark:text-green-400 ring-1 ring-green-500/30"
                        : isWeak ? "bg-red-500/15 text-red-700 dark:text-red-400 ring-1 ring-red-500/30"
                        : "bg-muted text-muted-foreground/50"
                      }`}
                      style={{ fontFamily:"Amiri, serif" }}>
                      {l}
                    </div>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-3 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-500/20 ring-1 ring-green-500/40 inline-block" /> Maîtrisé</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-red-500/20 ring-1 ring-red-500/40 inline-block" /> À renforcer</span>
                <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-muted inline-block" /> Non évalué</span>
              </div>
            </CardContent>
          </Card>

          {/* Skills + quote */}
          <Card>
            <CardContent className="p-4">
              <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Progression globale
              </p>
              <div className="space-y-4">
                {skills.map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{s.label}</span>
                      <span className="text-muted-foreground font-mono text-xs">{s.value}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div className={`h-full rounded-full ${s.color}`}
                        initial={{ width:0 }} animate={{ width:`${s.value}%` }}
                        transition={{ duration:0.8, ease:"easeOut", delay:0.2 }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-5 p-3.5 rounded-xl bg-primary/5 border border-primary/12 text-center">
                <p className="text-xl text-primary font-bold" dir="rtl" style={{ fontFamily:"Amiri, serif" }}>
                  طَلَبُ الْعِلْمِ فَرِيضَةٌ
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  "La recherche du savoir est un devoir" — Hadith
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="plan" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="plan" className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5" /> Plan semaine
            </TabsTrigger>
            <TabsTrigger value="homework" className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" /> Devoirs
              {pendingHw > 0 && (
                <Badge className="ml-1 text-xs h-4 min-w-[1rem] px-1 gradient-emerald border-0 text-primary-foreground">
                  {pendingHw}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-1.5">
              <BarChart2 className="h-3.5 w-3.5" /> Historique
            </TabsTrigger>
          </TabsList>

          {/* Plan semaine */}
          <TabsContent value="plan" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold flex items-center gap-2"><Calendar className="h-4 w-4" /> Mon programme</h3>
              <Button size="sm" variant="outline" onClick={generateWeeklyPlan} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Générer un plan"}
              </Button>
            </div>
            {weeklyPlan.length === 0 ? (
              <Card className="border-dashed border-primary/30">
                <CardContent className="p-8 text-center">
                  <Calendar className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                  <p className="font-medium text-foreground/70 mb-1">Aucun plan cette semaine</p>
                  <p className="text-sm text-muted-foreground mb-4">Générez un programme personnalisé adapté à vos lacunes</p>
                  <Button size="sm" onClick={generateWeeklyPlan} disabled={busy} className="gradient-emerald border-0">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                    Générer mon plan
                  </Button>
                </CardContent>
              </Card>
            ) : (
              weeklyPlan.map((d: any, i: number) => (
                <Card key={i} className="hover:border-primary/30 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <p className="font-semibold capitalize">{d.day} — {d.topic}</p>
                        <p className="text-sm text-muted-foreground mt-1">{d.exercise}</p>
                      </div>
                      <Badge variant="secondary" className="shrink-0">{d.duration_minutes} min</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Devoirs */}
          <TabsContent value="homework" className="space-y-3 mt-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Mes devoirs</h3>
              <Button size="sm" variant="outline" onClick={generateHomework} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Nouveau devoir"}
              </Button>
            </div>
            {homework.length === 0 ? (
              <Card className="border-dashed border-primary/30">
                <CardContent className="p-8 text-center">
                  <BookOpen className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                  <p className="font-medium text-foreground/70 mb-1">Aucun devoir pour le moment</p>
                  <p className="text-sm text-muted-foreground mb-4">L'IA génère des exercices adaptés à vos lacunes spécifiques</p>
                  <Button size="sm" onClick={generateHomework} disabled={busy} className="gradient-emerald border-0">
                    {busy ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Zap className="h-4 w-4 mr-2" />}
                    Générer un devoir
                  </Button>
                </CardContent>
              </Card>
            ) : (
              homework.map((hw) => (
                <Card key={hw.id}
                  className={`transition-all ${hw.status !== "corrected" ? "cursor-pointer hover:border-primary/50 hover:shadow-sm" : "opacity-70"}`}
                  onClick={() => hw.status !== "corrected" && setActiveHw(hw)}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="font-medium">{hw.title}</p>
                        {hw.due_date && (
                          <p className="text-xs text-muted-foreground mt-1">
                            <Clock className="h-3 w-3 inline mr-1" /> Pour le {hw.due_date}
                          </p>
                        )}
                        {hw.feedback && <p className="text-sm mt-2 text-muted-foreground line-clamp-2">{hw.feedback}</p>}
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant={hw.status === "corrected" ? "default" : hw.status === "submitted" ? "secondary" : "outline"}>
                          {hw.status === "pending" ? "À faire" : hw.status === "submitted" ? "Soumis" : "Corrigé"}
                        </Badge>
                        {hw.score !== null && <p className="text-lg font-bold mt-1 text-primary">{hw.score}/100</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          {/* Historique */}
          <TabsContent value="history" className="space-y-3 mt-4">
            <h3 className="font-semibold flex items-center gap-2"><BarChart2 className="h-4 w-4" /> Sessions passées</h3>
            {sessions.filter((s) => s.ended_at).length === 0 ? (
              <Card className="border-dashed border-primary/30">
                <CardContent className="p-8 text-center">
                  <Trophy className="h-10 w-10 text-primary/40 mx-auto mb-3" />
                  <p className="font-medium text-foreground/70 mb-1">Pas encore de session terminée</p>
                  <p className="text-sm text-muted-foreground">Démarrez votre première session pour voir vos résultats ici</p>
                </CardContent>
              </Card>
            ) : (
              sessions.filter((s) => s.ended_at).map((s) => (
                <Card key={s.id} className="hover:border-primary/20 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex-1">
                        <p className="text-xs text-muted-foreground">
                          {new Date(s.started_at).toLocaleDateString("fr-FR", { dateStyle:"long" })}
                        </p>
                        {s.summary && <p className="text-sm mt-1 text-foreground/80">{s.summary}</p>}
                      </div>
                      {s.score !== null && (
                        <Badge variant="secondary"
                          className={`shrink-0 font-bold ${Number(s.score) >= 80 ? "bg-green-500/15 text-green-700" : Number(s.score) >= 60 ? "bg-yellow-500/15 text-yellow-700" : "bg-red-500/15 text-red-700"}`}>
                          {Math.round(Number(s.score))}/100
                        </Badge>
                      )}
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
