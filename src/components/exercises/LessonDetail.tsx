import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, PenTool,
  CheckCircle, XCircle, Trophy, RotateCcw, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lesson } from "@/data/niveau1-lessons";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { getIllustration } from "@/utils/vocabulary-illustrations";

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: number) => void;
}

// ─── Lesson Tab ───
function LessonTab({ lesson }: { lesson: Lesson }) {
  const { speak } = useArabicSpeech();

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Letter display */}
      <div className="text-center p-8 rounded-xl border border-border bg-card cursor-pointer group" onClick={() => speak(lesson.letter)}>
        <p className="font-arabic text-8xl text-foreground mb-4 group-hover:text-primary transition-colors">{lesson.letter}</p>
        <div className="flex items-center justify-center gap-2">
          <Volume2 className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
          <span className="text-xs text-muted-foreground">Cliquez pour écouter</span>
        </div>
        <h3 className="text-2xl font-bold text-foreground">{lesson.name}</h3>
        <p className="text-muted-foreground mt-1">{lesson.transliteration}</p>
      </div>

      {/* Pronunciation */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-2">🔊 Prononciation</h4>
        <p className="text-sm text-muted-foreground">{lesson.pronunciation}</p>
      </div>

      {/* Description */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-2">📖 Description</h4>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
      </div>

      {/* Forms */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">✍️ Les formes de la lettre</h4>
        <div className="grid grid-cols-4 gap-3">
          {(["isolated", "initial", "medial", "final"] as const).map((pos) => (
            <div key={pos} className="text-center p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(lesson.forms[pos])}>
              <p className="font-arabic text-3xl text-foreground">{lesson.forms[pos]}</p>
              <p className="text-[10px] text-muted-foreground mt-1">
                {pos === "isolated" ? "Isolée" : pos === "initial" ? "Début" : pos === "medial" ? "Milieu" : "Fin"}
              </p>
              <Volume2 className="h-3 w-3 text-muted-foreground mx-auto mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Vowels */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">🎵 Avec les voyelles courtes</h4>
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(lesson.vowelExamples.withFatha)}>
            <p className="font-arabic text-3xl text-foreground">{lesson.vowelExamples.withFatha}</p>
            <p className="text-xs text-muted-foreground mt-1">Fatha (a)</p>
            <Volume2 className="h-3 w-3 text-muted-foreground mx-auto mt-1" />
          </div>
          <div className="text-center p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(lesson.vowelExamples.withDamma)}>
            <p className="font-arabic text-3xl text-foreground">{lesson.vowelExamples.withDamma}</p>
            <p className="text-xs text-muted-foreground mt-1">Damma (ou)</p>
            <Volume2 className="h-3 w-3 text-muted-foreground mx-auto mt-1" />
          </div>
          <div className="text-center p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(lesson.vowelExamples.withKasra)}>
            <p className="font-arabic text-3xl text-foreground">{lesson.vowelExamples.withKasra}</p>
            <p className="text-xs text-muted-foreground mt-1">Kasra (i)</p>
            <Volume2 className="h-3 w-3 text-muted-foreground mx-auto mt-1" />
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-3">📝 Exemples de mots</h4>
        <div className="space-y-3">
          {lesson.examples.map((ex, i) => {
            const emoji = getIllustration(ex.meaning);
            return (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors" onClick={() => speak(ex.arabic)}>
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-arabic text-xl text-foreground">{ex.arabic}</p>
                    <p className="text-xs text-muted-foreground">{ex.transliteration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-foreground font-medium">{ex.meaning}</p>
                  {emoji && <span className="text-2xl" role="img">{emoji}</span>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── QCM Tab ───
function QCMTab({ lesson, onAllCorrect }: { lesson: Lesson; onAllCorrect: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = lesson.qcm[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newScore = idx === q.correctIndex ? score + 1 : score;
    if (idx === q.correctIndex) setScore(newScore);
    // Check completion
    if (current + 1 >= lesson.qcm.length) {
      setTimeout(() => {
        if (newScore === lesson.qcm.length) onAllCorrect();
      }, 500);
    }
  };

  const next = () => {
    if (current + 1 >= lesson.qcm.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
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
        <h3 className="text-2xl font-bold text-foreground mb-2">Exercices terminés !</h3>
        <p className="text-lg text-muted-foreground mb-1">
          Score : <span className="font-bold text-primary">{score}</span> / {lesson.qcm.length}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {score === lesson.qcm.length ? "Parfait ! 🎉" : score >= lesson.qcm.length * 0.7 ? "Très bien ! 👏" : "Continue à t'entraîner 💪"}
        </p>
        <Button onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} / {lesson.qcm.length}</span>
        <span>Score : {score}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          <p className="text-base font-medium text-foreground mb-4">{q.question}</p>
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
            {current + 1 >= lesson.qcm.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Dictation Tab ───
function DictationTab({ lesson, onAllCorrect }: { lesson: Lesson; onAllCorrect: () => void }) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const d = lesson.dictation[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newScore = idx === d.correctIndex ? score + 1 : score;
    if (idx === d.correctIndex) setScore(newScore);
    if (current + 1 >= lesson.dictation.length) {
      setTimeout(() => {
        if (newScore === lesson.dictation.length) onAllCorrect();
      }, 500);
    }
  };

  const next = () => {
    if (current + 1 >= lesson.dictation.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
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
        <h3 className="text-2xl font-bold text-foreground mb-2">Dictée terminée !</h3>
        <p className="text-lg text-muted-foreground mb-1">
          Score : <span className="font-bold text-primary">{score}</span> / {lesson.dictation.length}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {score === lesson.dictation.length ? "Excellent ! 🎉" : "Continue à t'entraîner 💪"}
        </p>
        <Button onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Mot {current + 1} / {lesson.dictation.length}</span>
        <span>Score : {score}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          <p className="text-center text-muted-foreground mb-2 text-sm">Quel est le mot correct pour :</p>
          <p className="text-center text-xl font-semibold text-foreground mb-6">{d.transliteration}</p>
          <div className="grid grid-cols-2 gap-3">
            {d.options.map((opt, idx) => {
              let cls = "border border-border bg-background hover:bg-muted";
              if (selected !== null) {
                if (idx === d.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`p-4 rounded-lg font-arabic text-xl transition-all ${cls}`}>
                  {opt}
                  {selected !== null && idx === d.correctIndex && <CheckCircle className="h-4 w-4 inline ml-2" />}
                  {selected !== null && idx === selected && idx !== d.correctIndex && <XCircle className="h-4 w-4 inline ml-2" />}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={next} className="gap-2">
            {current + 1 >= lesson.dictation.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───
const LessonDetail = ({ lesson, onBack, onComplete }: LessonDetailProps) => {
  const [exercisesCompleted, setExercisesCompleted] = useState(false);
  const [dictationCompleted, setDictationCompleted] = useState(false);

  const handleComplete = () => {
    onComplete(lesson.id);
    onBack();
  };

  const allDone = exercisesCompleted && dictationCompleted;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" /> Retour
        </Button>
        <div className="text-right">
          <h2 className="text-lg font-bold text-foreground">
            Leçon {lesson.id} : {lesson.name} ({lesson.letter})
          </h2>
        </div>
      </div>

      <Tabs defaultValue="lesson" className="space-y-4">
        <TabsList className="bg-muted w-full grid grid-cols-3">
          <TabsTrigger value="lesson" className="gap-1.5 text-xs sm:text-sm">
            <BookOpen className="h-4 w-4" /> Leçon
          </TabsTrigger>
          <TabsTrigger value="exercises" className="gap-1.5 text-xs sm:text-sm">
            <Brain className="h-4 w-4" /> Exercices
            {exercisesCompleted && <CheckCircle className="h-3 w-3 text-primary" />}
          </TabsTrigger>
          <TabsTrigger value="dictation" className="gap-1.5 text-xs sm:text-sm">
            <PenTool className="h-4 w-4" /> Dictée
            {dictationCompleted && <CheckCircle className="h-3 w-3 text-primary" />}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="lesson">
          <LessonTab lesson={lesson} />
        </TabsContent>

        <TabsContent value="exercises">
          <QCMTab lesson={lesson} onAllCorrect={() => setExercisesCompleted(true)} />
        </TabsContent>

        <TabsContent value="dictation">
          <DictationTab lesson={lesson} onAllCorrect={() => setDictationCompleted(true)} />
        </TabsContent>
      </Tabs>

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-primary bg-primary/10 text-center">
          <p className="text-foreground font-semibold mb-2">🎉 Leçon complète !</p>
          <Button onClick={handleComplete} className="gap-2">
            Valider et passer à la suite <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default LessonDetail;
