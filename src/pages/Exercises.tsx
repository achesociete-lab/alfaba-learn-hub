import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, CheckCircle, XCircle, ArrowRight, RotateCcw, Trophy, Brain, PenTool } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import {
  qcmNiveau2,
  comprehensionNiveau2,
  grammarNiveau2,
  type QCMQuestion, type ComprehensionExercise, type GrammarExercise,
} from "@/data/exercises";
import { niveau1Lessons, type Lesson } from "@/data/niveau1-lessons";
import LessonSelector from "@/components/exercises/LessonSelector";
import LessonDetail from "@/components/exercises/LessonDetail";

type Level = "niveau_1" | "niveau_2";

// ─── QCM Component (for Niveau 2) ───
function QCMExercise({ questions }: { questions: QCMQuestion[] }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = questions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setCurrent(0); setSelected(null); setScore(0); setFinished(false);
  };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl border border-border bg-card text-center">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-secondary" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Exercice terminé !</h3>
        <p className="text-lg text-muted-foreground mb-1">
          Score : <span className="font-bold text-primary">{score}</span> / {questions.length}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {score === questions.length ? "Parfait ! 🎉" : score >= questions.length * 0.7 ? "Très bien ! 👏" : "Continue à t'entraîner 💪"}
        </p>
        <Button onClick={reset} className="gradient-emerald border-0 text-primary-foreground gap-2">
          <RotateCcw className="h-4 w-4" /> Recommencer
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
        <span>Question {current + 1} / {questions.length}</span>
        <span>Score : {score}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={q.id} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          <p className="font-arabic text-6xl text-center text-foreground mb-6">{q.letter}</p>
          <p className="text-base font-medium text-foreground mb-4 text-center">{q.question}</p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              let cls = "border border-border bg-background hover:bg-muted";
              if (selected !== null) {
                if (idx === q.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`p-3 rounded-lg text-sm font-medium transition-all ${cls}`}>
                  {opt}
                  {selected !== null && idx === q.correctIndex && <CheckCircle className="h-4 w-4 inline ml-2" />}
                  {selected !== null && idx === selected && idx !== q.correctIndex && <XCircle className="h-4 w-4 inline ml-2" />}
                </button>
              );
            })}
          </div>
          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
              {q.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={next} className="gap-2">
            {current + 1 >= questions.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Comprehension Component (for Niveau 2) ───
function ComprehensionExerciseComp({ exercises }: { exercises: ComprehensionExercise[] }) {
  const [exIdx, setExIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const ex = exercises[exIdx];
  const q = ex.questions[qIdx];
  const totalQ = exercises.reduce((s, e) => s + e.questions.length, 0);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIdx + 1 < ex.questions.length) { setQIdx(i => i + 1); setSelected(null); }
    else if (exIdx + 1 < exercises.length) { setExIdx(i => i + 1); setQIdx(0); setSelected(null); }
    else { setFinished(true); }
  };

  const reset = () => { setExIdx(0); setQIdx(0); setSelected(null); setScore(0); setFinished(false); };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl border border-border bg-card text-center">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-secondary" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Compréhension terminée !</h3>
        <p className="text-lg text-muted-foreground mb-6">Score : <span className="font-bold text-primary">{score}</span> / {totalQ}</p>
        <Button onClick={reset} className="gradient-emerald border-0 text-primary-foreground gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-2">{ex.title}</h3>
        <p className="font-arabic text-xl leading-loose text-foreground whitespace-pre-line">{ex.text.split("\n\n")[0]}</p>
        <p className="text-sm text-muted-foreground mt-2 italic">{ex.text.split("\n\n")[1]}</p>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${exIdx}-${qIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-5 rounded-xl border border-border bg-card">
          <p className="text-sm font-medium text-foreground mb-3">{q.question}</p>
          <div className="space-y-2">
            {q.options.map((opt, idx) => {
              let cls = "border border-border bg-background hover:bg-muted";
              if (selected !== null) {
                if (idx === q.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`w-full p-3 rounded-lg text-sm font-medium text-left transition-all ${cls}`}>{opt}</button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={next} className="gap-2">Suivant <ArrowRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

// ─── Grammar Component (for Niveau 2) ───
function GrammarExerciseComp({ exercises }: { exercises: GrammarExercise[] }) {
  const [exIdx, setExIdx] = useState(0);
  const [qIdx, setQIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const ex = exercises[exIdx];
  const q = ex.questions[qIdx];
  const totalQ = exercises.reduce((s, e) => s + e.questions.length, 0);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) setScore((s) => s + 1);
  };

  const next = () => {
    if (qIdx + 1 < ex.questions.length) { setQIdx(i => i + 1); setSelected(null); }
    else if (exIdx + 1 < exercises.length) { setExIdx(i => i + 1); setQIdx(0); setSelected(null); }
    else { setFinished(true); }
  };

  const reset = () => { setExIdx(0); setQIdx(0); setSelected(null); setScore(0); setFinished(false); };

  if (finished) {
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl border border-border bg-card text-center">
        <Trophy className="h-16 w-16 mx-auto mb-4 text-secondary" />
        <h3 className="text-2xl font-bold text-foreground mb-2">Grammaire terminée !</h3>
        <p className="text-lg text-muted-foreground mb-6">Score : <span className="font-bold text-primary">{score}</span> / {totalQ}</p>
        <Button onClick={reset} className="gradient-emerald border-0 text-primary-foreground gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="p-4 rounded-xl border border-border bg-card">
        <h3 className="text-lg font-semibold text-foreground mb-2">{ex.title}</h3>
        <p className="text-sm text-muted-foreground mb-3">{ex.rule}</p>
        <div className="space-y-1">
          {ex.examples.map((e, i) => (
            <p key={i} className="font-arabic text-lg text-foreground">{e}</p>
          ))}
        </div>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${exIdx}-${qIdx}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-5 rounded-xl border border-border bg-card">
          <p className="text-sm font-medium text-foreground mb-3">{q.question}</p>
          <div className="grid grid-cols-2 gap-2">
            {q.options.map((opt, idx) => {
              let cls = "border border-border bg-background hover:bg-muted";
              if (selected !== null) {
                if (idx === q.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`p-3 rounded-lg text-sm font-medium font-arabic transition-all ${cls}`}>{opt}</button>
              );
            })}
          </div>
          {selected !== null && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">
              {q.explanation}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={next} className="gap-2">Suivant <ArrowRight className="h-4 w-4" /></Button>
        </div>
      )}
    </div>
  );
}

// ─── Niveau 1 Progressive Lessons ───
function Niveau1Lessons() {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>(() => {
    const saved = localStorage.getItem("n1-completed-lessons");
    return saved ? JSON.parse(saved) : [];
  });

  const handleComplete = (lessonId: number) => {
    const updated = [...new Set([...completedLessons, lessonId])];
    setCompletedLessons(updated);
    localStorage.setItem("n1-completed-lessons", JSON.stringify(updated));
  };

  if (selectedLesson) {
    return (
      <LessonDetail
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onComplete={handleComplete}
      />
    );
  }

  return (
    <LessonSelector
      completedLessons={completedLessons}
      currentLesson={null}
      onSelectLesson={setSelectedLesson}
    />
  );
}

// ─── Main Page ───
const Exercises = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level>("niveau_1");

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("level").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setLevel(data.level as Level); });
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Exercices interactifs</h1>
            <p className="text-muted-foreground">
              {level === "niveau_1" ? "Niveau 1 — L'alphabet arabe lettre par lettre" : "Niveau 2 — Approfondissement"}
            </p>
          </motion.div>

          {level === "niveau_1" ? (
            <Niveau1Lessons />
          ) : (
            <Tabs defaultValue="qcm" className="space-y-6">
              <TabsList className="bg-muted w-full grid grid-cols-3">
                <TabsTrigger value="qcm" className="gap-1.5 text-xs sm:text-sm">
                  <BookOpen className="h-4 w-4" /> Lettres
                </TabsTrigger>
                <TabsTrigger value="comprehension" className="gap-1.5 text-xs sm:text-sm">
                  <Brain className="h-4 w-4" /> Compréhension
                </TabsTrigger>
                <TabsTrigger value="grammaire" className="gap-1.5 text-xs sm:text-sm">
                  <PenTool className="h-4 w-4" /> Grammaire
                </TabsTrigger>
              </TabsList>

              <TabsContent value="qcm">
                <QCMExercise questions={qcmNiveau2} />
              </TabsContent>
              <TabsContent value="comprehension">
                <ComprehensionExerciseComp exercises={comprehensionNiveau2} />
              </TabsContent>
              <TabsContent value="grammaire">
                <GrammarExerciseComp exercises={grammarNiveau2} />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Exercises;
