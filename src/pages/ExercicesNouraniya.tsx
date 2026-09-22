import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Loader2, BookOpenCheck, Check, X, Volume2, ChevronRight, Trophy, RotateCcw } from "lucide-react";

interface McqQuestion { question: string; display: string; choices: string[]; correct_index: number; explanation: string; }
interface SessionExercises { letters: string; instructions: string; mcq: McqQuestion[]; dictation_words: string; audio_url: string; }
interface Session { id: string; group_id: string; session_date: string; title: string | null; exercises: SessionExercises | null; }
interface Group { id: string; name: string; }
interface ExerciseResult { session_id: string; mcq_score: number; dictation_score: number; completed_at: string; }

const speak = (text: string) => {
  if (!window.speechSynthesis) return;
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = "ar-SA";
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
};

const ExercicesNouraniya = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [results, setResults] = useState<ExerciseResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [notEnrolled, setNotEnrolled] = useState(false);
  const [activeSession, setActiveSession] = useState<Session | null>(null);

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: enrollments } = await supabase
        .from("nouraniya_enrollments").select("group_id").eq("student_id", user.id);
      if (!enrollments?.length) { setNotEnrolled(true); setLoading(false); return; }

      const groupIds = enrollments.map((e: any) => e.group_id);
      const [sessRes, grpRes, resRes] = await Promise.all([
        supabase.from("nouraniya_sessions").select("id, group_id, session_date, title, exercises")
          .in("group_id", groupIds).not("exercises", "is", null).order("session_date", { ascending: false }),
        supabase.from("nouraniya_groups").select("id, name").in("id", groupIds),
        supabase.from("nouraniya_exercise_results").select("session_id, mcq_score, dictation_score, completed_at").eq("student_id", user.id),
      ]);

      const sessionsWithEx = (sessRes.data ?? []).filter((s: any) => s.exercises && (s.exercises.mcq?.length > 0 || s.exercises.dictation_words));
      setSessions(sessionsWithEx as Session[]);
      setGroups(grpRes.data ?? []);
      setResults(resRes.data ?? []);
      setLoading(false);
    };
    load();
  }, [user]);

  const getResult = (sid: string) => results.find(r => r.session_id === sid);
  const groupName = (gid: string) => groups.find(g => g.id === gid)?.name ?? "";

  if (authLoading || loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (notEnrolled) return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-lg text-center">
          <BookOpenCheck className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Exercices Nouraniya</h1>
          <p className="text-muted-foreground">Vous n'êtes pas encore inscrit dans un groupe Nouraniya. Contactez votre professeur.</p>
        </div>
      </main>
      <Footer />
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          {activeSession ? (
            <ExercisePlayer
              session={activeSession}
              userId={user!.id}
              existingResult={getResult(activeSession.id)}
              onBack={() => { setActiveSession(null); supabase.from("nouraniya_exercise_results").select("session_id, mcq_score, dictation_score, completed_at").eq("student_id", user!.id).then(({ data }) => setResults(data ?? [])); }}
            />
          ) : (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <BookOpenCheck className="h-6 w-6 text-primary" />
                  <h1 className="text-3xl font-bold">Exercices Nouraniya</h1>
                </div>
                <p className="text-muted-foreground">Exercices à faire après chaque séance en classe.</p>
              </motion.div>

              {sessions.length === 0 && (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center text-muted-foreground">
                    Aucun exercice disponible pour le moment. Votre professeur en ajoutera après chaque séance.
                  </CardContent>
                </Card>
              )}

              <div className="space-y-3">
                {sessions.map((s, i) => {
                  const result = getResult(s.id);
                  const ex = s.exercises!;
                  const mcqCount = ex.mcq?.length ?? 0;
                  const dictCount = ex.dictation_words ? ex.dictation_words.split(",").filter(w => w.trim()).length : 0;
                  return (
                    <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                      <Card className={`transition-all ${result ? "opacity-80" : "hover:border-primary/50 hover:shadow-md"}`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-3 flex-wrap">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <p className="font-semibold text-foreground">{s.title || "Séance"}</p>
                                {result && <Badge className="bg-green-500/15 text-green-700 border-green-400/30 text-xs">Complété ✓</Badge>}
                              </div>
                              <p className="text-xs text-muted-foreground mb-1">{groupName(s.group_id)} · {new Date(s.session_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}</p>
                              <div className="flex items-center gap-2 flex-wrap">
                                {ex.letters && <span className="text-sm font-arabic text-primary dir-rtl">{ex.letters}</span>}
                                {mcqCount > 0 && <Badge variant="outline" className="text-xs">{mcqCount} QCM</Badge>}
                                {dictCount > 0 && <Badge variant="outline" className="text-xs">{dictCount} mots dictée</Badge>}
                              </div>
                              {result && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  QCM : {result.mcq_score}%{dictCount > 0 ? ` · Dictée : ${result.dictation_score}%` : ""}
                                </p>
                              )}
                            </div>
                            <Button size="sm" variant={result ? "outline" : "default"} onClick={() => setActiveSession(s)}>
                              {result ? <><RotateCcw className="h-3 w-3 mr-1" /> Refaire</> : <>Commencer <ChevronRight className="h-4 w-4 ml-1" /></>}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

// ─── Lecteur d'exercices ───────────────────────────────────────────────────────

const ExercisePlayer = ({ session, userId, existingResult, onBack }: {
  session: Session; userId: string; existingResult: ExerciseResult | undefined; onBack: () => void;
}) => {
  const ex = session.exercises!;
  const mcq = ex.mcq ?? [];
  const dictWords = ex.dictation_words ? ex.dictation_words.split(",").map(w => w.trim()).filter(Boolean) : [];

  const [phase, setPhase] = useState<"intro" | "mcq" | "dictation" | "result">("intro");
  const [mcqIdx, setMcqIdx] = useState(0);
  const [mcqAnswers, setMcqAnswers] = useState<{ selected: number; correct: boolean }[]>([]);
  const [selectedChoice, setSelectedChoice] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [dictAnswers, setDictAnswers] = useState<string[]>(dictWords.map(() => ""));
  const [saving, setSaving] = useState(false);

  const mcqScore = mcqAnswers.length > 0 ? Math.round((mcqAnswers.filter(a => a.correct).length / mcq.length) * 100) : 0;
  const dictScore = dictWords.length > 0 ? Math.round((dictAnswers.filter((a, i) => a.trim() === dictWords[i]).length / dictWords.length) * 100) : 0;

  const handleChoice = (ci: number) => {
    if (revealed) return;
    setSelectedChoice(ci);
    setRevealed(true);
    setMcqAnswers(prev => [...prev, { selected: ci, correct: ci === mcq[mcqIdx].correct_index }]);
  };

  const nextQuestion = () => {
    setSelectedChoice(null);
    setRevealed(false);
    if (mcqIdx + 1 < mcq.length) { setMcqIdx(mcqIdx + 1); }
    else if (dictWords.length > 0) { setPhase("dictation"); }
    else { saveAndFinish(); }
  };

  const saveAndFinish = async () => {
    setSaving(true);
    const finalMcqScore = mcq.length > 0 ? Math.round((mcqAnswers.filter(a => a.correct).length / mcq.length) * 100) : 0;
    const finalDictScore = dictWords.length > 0 ? Math.round((dictAnswers.filter((a, i) => a.trim() === dictWords[i]).length / dictWords.length) * 100) : 0;
    const payload = {
      session_id: session.id, student_id: userId,
      mcq_answers: mcqAnswers, mcq_score: finalMcqScore,
      dictation_answers: dictWords.map((w, i) => ({ word: w, answer: dictAnswers[i], correct: dictAnswers[i].trim() === w })),
      dictation_score: finalDictScore, completed_at: new Date().toISOString(),
    };
    await supabase.from("nouraniya_exercise_results").upsert(payload, { onConflict: "session_id,student_id" });
    setSaving(false);
    setPhase("result");
  };

  const q = mcq[mcqIdx];

  return (
    <div className="space-y-4">
      <Button variant="ghost" onClick={onBack} className="mb-2">← Retour aux exercices</Button>
      <h2 className="text-xl font-bold">{session.title || "Séance"}</h2>
      {ex.instructions && <p className="text-muted-foreground text-sm">{ex.instructions}</p>}
      {ex.letters && <p className="text-2xl text-center font-arabic text-primary py-2" dir="rtl">{ex.letters}</p>}
      {ex.audio_url && (
        <div className="flex justify-center">
          <audio controls src={ex.audio_url} className="w-full max-w-sm" />
        </div>
      )}

      <AnimatePresence mode="wait">
        {phase === "intro" && (
          <motion.div key="intro" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <div className="flex gap-2 flex-wrap">
              {mcq.length > 0 && <Badge variant="outline">{mcq.length} questions QCM</Badge>}
              {dictWords.length > 0 && <Badge variant="outline">{dictWords.length} mots de dictée</Badge>}
            </div>
            <Button onClick={() => { if (mcq.length > 0) setPhase("mcq"); else if (dictWords.length > 0) setPhase("dictation"); }}>
              Commencer les exercices <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </motion.div>
        )}

        {phase === "mcq" && q && (
          <motion.div key={`mcq-${mcqIdx}`} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">Question {mcqIdx + 1} / {mcq.length}</p>
              <div className="flex gap-1">
                {mcq.map((_, i) => <div key={i} className={`h-1.5 w-6 rounded-full ${i < mcqAnswers.length ? (mcqAnswers[i].correct ? "bg-green-500" : "bg-red-400") : i === mcqIdx ? "bg-primary" : "bg-muted"}`} />)}
              </div>
            </div>

            <Card>
              <CardContent className="pt-6 pb-4 text-center space-y-3">
                {q.display && (
                  <div className="flex items-center justify-center gap-2">
                    <p className="text-5xl font-arabic" dir="rtl">{q.display}</p>
                    <Button size="icon" variant="ghost" onClick={() => speak(q.display)}>
                      <Volume2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
                <p className="text-base font-medium">{q.question}</p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-2">
              {q.choices.map((c, ci) => {
                const isCorrect = ci === q.correct_index;
                const isSelected = selectedChoice === ci;
                let cls = "border-2 rounded-lg p-3 text-center font-arabic text-lg transition-all cursor-pointer ";
                if (revealed) {
                  if (isCorrect) cls += "border-green-500 bg-green-500/10 text-green-700";
                  else if (isSelected) cls += "border-red-400 bg-red-400/10 text-red-600";
                  else cls += "border-muted opacity-40";
                } else {
                  cls += "border-muted hover:border-primary hover:bg-primary/5";
                }
                return (
                  <button key={ci} type="button" className={cls} dir="rtl" onClick={() => handleChoice(ci)}>
                    {c}
                    {revealed && isCorrect && <Check className="inline h-4 w-4 ml-1" />}
                    {revealed && isSelected && !isCorrect && <X className="inline h-4 w-4 ml-1" />}
                  </button>
                );
              })}
            </div>

            {revealed && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
                <p className={`text-sm font-medium text-center ${selectedChoice === q.correct_index ? "text-green-600" : "text-red-500"}`}>
                  {selectedChoice === q.correct_index ? "✅ Bravo !" : `❌ La bonne réponse était : ${q.choices[q.correct_index]}`}
                </p>
                {q.explanation && <p className="text-xs text-muted-foreground text-center">{q.explanation}</p>}
                <div className="flex justify-center">
                  <Button onClick={nextQuestion}>
                    {mcqIdx + 1 < mcq.length ? "Question suivante" : dictWords.length > 0 ? "Passer à la dictée" : "Voir mes résultats"} <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === "dictation" && (
          <motion.div key="dictation" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
            <h3 className="font-semibold">Dictée — écrivez en arabe</h3>
            <div className="space-y-3">
              {dictWords.map((w, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-muted-foreground text-sm w-6 shrink-0">{i + 1}.</span>
                  <Button size="icon" variant="ghost" onClick={() => speak(w)}><Volume2 className="h-4 w-4" /></Button>
                  <Input dir="rtl" placeholder="Écrivez ici…" value={dictAnswers[i]}
                    onChange={e => setDictAnswers(prev => prev.map((a, j) => j === i ? e.target.value : a))}
                    className="text-lg font-arabic" />
                </div>
              ))}
            </div>
            <Button onClick={saveAndFinish} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <Check className="h-4 w-4 mr-1" />}
              Valider la dictée
            </Button>
          </motion.div>
        )}

        {phase === "result" && (
          <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
            <div className="text-center py-4">
              <Trophy className="h-16 w-16 text-primary mx-auto mb-3" />
              <h3 className="text-xl font-bold mb-4">Exercices terminés !</h3>
              <div className="flex justify-center gap-6 flex-wrap">
                {mcq.length > 0 && (
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${mcqScore >= 70 ? "text-green-600" : mcqScore >= 50 ? "text-amber-600" : "text-red-500"}`}>{mcqScore}%</p>
                    <p className="text-sm text-muted-foreground">QCM</p>
                  </div>
                )}
                {dictWords.length > 0 && (
                  <div className="text-center">
                    <p className={`text-4xl font-bold ${dictScore >= 70 ? "text-green-600" : dictScore >= 50 ? "text-amber-600" : "text-red-500"}`}>{dictScore}%</p>
                    <p className="text-sm text-muted-foreground">Dictée</p>
                  </div>
                )}
              </div>
            </div>

            {dictWords.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-sm">Correction dictée :</h4>
                {dictWords.map((w, i) => {
                  const correct = dictAnswers[i].trim() === w;
                  return (
                    <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${correct ? "bg-green-500/10" : "bg-red-400/10"}`}>
                      <span className="font-arabic text-lg" dir="rtl">{w}</span>
                      <div className="flex items-center gap-2">
                        {!correct && <span className="font-arabic text-muted-foreground line-through text-sm" dir="rtl">{dictAnswers[i] || "—"}</span>}
                        {correct ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-red-500" />}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={onBack}>← Retour aux exercices</Button>
              <Button onClick={() => { setPhase("intro"); setMcqIdx(0); setMcqAnswers([]); setSelectedChoice(null); setRevealed(false); setDictAnswers(dictWords.map(() => "")); }}>
                <RotateCcw className="h-4 w-4 mr-1" /> Recommencer
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ExercicesNouraniya;
