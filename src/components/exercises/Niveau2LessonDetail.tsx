import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, PenTool, FileText,
  CheckCircle, XCircle, Trophy, RotateCcw, Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Niveau2Lesson } from "@/data/niveau2-lessons";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { getIllustration } from "@/utils/vocabulary-illustrations";
import { useIsAdmin } from "@/hooks/use-admin";
import LessonAudioPlayer from "./LessonAudioPlayer";

interface Niveau2LessonDetailProps {
  lesson: Niveau2Lesson;
  onBack: () => void;
  onComplete: (lessonId: number) => void;
}

// ─── Grammar Tab ───
function GrammarTab({ lesson }: { lesson: Niveau2Lesson }) {
  const { speak, stop } = useArabicSpeech();
  const { isAdmin } = useIsAdmin();
  const [isReading, setIsReading] = useState(false);

  const readLesson = async () => {
    if (isReading) { stop(); setIsReading(false); return; }
    setIsReading(true);
    try {
      // Read all grammar examples
      for (const rule of (lesson.grammar || [])) {
        for (const ex of rule.examples) {
          await speak(ex.arabic, 0.75);
          await new Promise(r => setTimeout(r, 800));
        }
      }
      // Read comprehension text
      if (lesson.comprehension?.arabic) {
        await speak(lesson.comprehension.arabic, 0.7);
        await new Promise(r => setTimeout(r, 1000));
      }
      // Read dictation words
      for (const d of (lesson.dictation || [])) {
        const word = d.options[d.correctIndex];
        await speak(word, 0.75);
        await new Promise(r => setTimeout(r, 600));
      }
    } catch { /* stopped */ }
    setIsReading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Teacher recording */}
      <LessonAudioPlayer level="niveau_2" lessonNumber={lesson.id} isTeacher={isAdmin} />

      {/* TTS Listen to lesson */}
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={readLesson}
          className={`gap-2 rounded-full px-6 ${isReading ? "border-primary bg-primary/10" : ""}`}
        >
          <Volume2 className={`h-4 w-4 ${isReading ? "animate-pulse text-primary" : ""}`} />
          {isReading ? "⏹ Arrêter la lecture" : "🔊 Écouter via synthèse vocale"}
        </Button>
      </div>

      {/* Video */}
      {lesson.videoUrl && (
        <div className="rounded-xl overflow-hidden border border-border bg-card">
          <div className="aspect-video">
            {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be") ? (
              <iframe
                src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <video src={lesson.videoUrl} controls className="w-full h-full object-cover" />
            )}
          </div>
        </div>
      )}

      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-2">📖 Description</h4>
        <p className="text-sm text-muted-foreground">{lesson.description}</p>
      </div>

      {lesson.grammar.map((rule, idx) => (
        <div key={idx} className="p-4 rounded-xl border border-border bg-card">
          <h4 className="font-semibold text-foreground mb-2">📝 {rule.title}</h4>
          <p className="text-sm text-muted-foreground mb-3">{rule.explanation}</p>
          <div className="space-y-2">
            {rule.examples.map((ex, i) => {
              const emoji = getIllustration(ex.meaning);
              return (
                <div
                  key={i}
                  className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => speak(ex.arabic)}
                >
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
      ))}

      {/* Comprehension text */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <h4 className="font-semibold text-foreground mb-2">📚 {lesson.comprehension.title}</h4>
        <div
          className="p-4 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors mb-2"
          onClick={() => speak(lesson.comprehension.arabic)}
        >
          <div className="flex items-center gap-2 mb-2">
            <Volume2 className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Cliquez pour écouter</span>
          </div>
          <p className="font-arabic text-lg leading-loose text-foreground">{lesson.comprehension.arabic}</p>
        </div>
        <p className="text-sm text-muted-foreground italic">{lesson.comprehension.translation}</p>
      </div>
    </motion.div>
  );
}

// ─── QCM + Comprehension Tab ───
function ExercisesTab({ lesson, onAllCorrect }: { lesson: Niveau2Lesson; onAllCorrect: () => void }) {
  // Merge comprehension questions and QCM into one exercise flow
  const allQuestions = [
    ...lesson.comprehension.questions.map((q) => ({ ...q, type: "comprehension" as const })),
    ...lesson.qcm.map((q) => ({ ...q, type: "qcm" as const })),
  ];

  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  const q = allQuestions[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newScore = idx === q.correctIndex ? score + 1 : score;
    if (idx === q.correctIndex) setScore(newScore);
    if (current + 1 >= allQuestions.length) {
      setTimeout(() => {
        if (newScore === allQuestions.length) onAllCorrect();
      }, 500);
    }
  };

  const next = () => {
    if (current + 1 >= allQuestions.length) {
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
        <h3 className="text-2xl font-bold text-foreground mb-2">Exercices terminés !</h3>
        <p className="text-lg text-muted-foreground mb-1">
          Score : <span className="font-bold text-primary">{score}</span> / {allQuestions.length}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {score === allQuestions.length ? "Parfait ! 🎉" : score >= allQuestions.length * 0.7 ? "Très bien ! 👏" : "Continue à t'entraîner 💪"}
        </p>
        <Button onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} / {allQuestions.length}</span>
        <span>Score : {score}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          {q.type === "comprehension" && (
            <p className="text-[10px] uppercase tracking-wider text-gold mb-2 font-semibold">Compréhension</p>
          )}
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
            {current + 1 >= allQuestions.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Dictation Tab ───
function DictationTab({ lesson, onAllCorrect }: { lesson: Niveau2Lesson; onAllCorrect: () => void }) {
  const { speak } = useArabicSpeech();
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"qcm" | "keyboard">("qcm");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);

  const d = lesson.dictation[current];
  const correctArabic = d.options[d.correctIndex];

  const playDictation = async () => {
    setIsPlaying(true);
    try {
      await speak(correctArabic, 0.75);
    } finally {
      setTimeout(() => setIsPlaying(false), 1500);
    }
  };

  const currentRef = useRef(current);
  if (currentRef.current !== current) {
    currentRef.current = current;
    setTimeout(() => playDictation(), 400);
  }

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

  const handleCheckTyped = () => {
    if (answerChecked) return;
    const isCorrect = typedAnswer.trim() === correctArabic.trim();
    setAnswerChecked(true);
    setAnswerCorrect(isCorrect);
    const newScore = isCorrect ? score + 1 : score;
    if (isCorrect) setScore(newScore);
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
      setCurrent((c) => c + 1);
      setSelected(null);
      setTypedAnswer("");
      setAnswerChecked(false);
      setAnswerCorrect(false);
    }
  };

  const reset = () => {
    setCurrent(0); setSelected(null); setScore(0); setFinished(false);
    setTypedAnswer(""); setAnswerChecked(false); setAnswerCorrect(false);
  };

  const canAdvance = mode === "qcm" ? selected !== null : answerChecked;

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
        <span>Phrase {current + 1} / {lesson.dictation.length}</span>
        <span>Score : {score}</span>
      </div>

      {/* Mode toggle */}
      <div className="flex justify-center gap-2">
        <Button variant={mode === "qcm" ? "default" : "outline"} size="sm" onClick={() => setMode("qcm")} className="gap-1.5 text-xs">
          <Brain className="h-3.5 w-3.5" /> QCM
        </Button>
        <Button variant={mode === "keyboard" ? "default" : "outline"} size="sm" onClick={() => setMode("keyboard")} className="gap-1.5 text-xs">
          <PenTool className="h-3.5 w-3.5" /> Écriture
        </Button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={`${current}-${mode}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          <p className="text-center text-muted-foreground mb-2 text-sm">Écoutez et {mode === "qcm" ? "choisissez" : "écrivez"} le bon texte :</p>
          <div className="flex justify-center mb-6">
            <Button
              variant="outline"
              size="lg"
              onClick={playDictation}
              disabled={isPlaying}
              className="gap-3 rounded-full px-8 py-6 text-lg border-primary/30 hover:bg-primary/10"
            >
              <Volume2 className={`h-6 w-6 ${isPlaying ? "animate-pulse text-primary" : "text-muted-foreground"}`} />
              {isPlaying ? "Lecture..." : "🔊 Écouter"}
            </Button>
          </div>

          {mode === "qcm" ? (
            <div className="grid grid-cols-2 gap-3">
              {d.options.map((opt, idx) => {
                let cls = "border border-border bg-background hover:bg-muted";
                if (selected !== null) {
                  if (idx === d.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                  else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
                }
                return (
                  <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                    className={`p-4 rounded-lg font-arabic text-lg transition-all cursor-pointer hover:bg-primary/5 ${cls}`}>
                    {opt}
                    {selected !== null && idx === d.correctIndex && <CheckCircle className="h-4 w-4 inline ml-2" />}
                    {selected !== null && idx === selected && idx !== d.correctIndex && <XCircle className="h-4 w-4 inline ml-2" />}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-3">
              <input
                type="text"
                dir="rtl"
                value={typedAnswer}
                onChange={(e) => setTypedAnswer(e.target.value)}
                disabled={answerChecked}
                placeholder="اكتب الإجابة هنا..."
                className="w-full p-4 rounded-lg border border-border bg-background font-arabic text-2xl text-center focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === "Enter" && typedAnswer.trim()) handleCheckTyped(); }}
              />
              {!answerChecked && (
                <Button onClick={handleCheckTyped} disabled={!typedAnswer.trim()} className="w-full gap-2">
                  <CheckCircle className="h-4 w-4" /> Vérifier
                </Button>
              )}
              {answerChecked && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm text-center ${answerCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {answerCorrect ? (
                    <span className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4" /> Correct ! 🎉</span>
                  ) : (
                    <span className="flex flex-col items-center gap-1">
                      <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> Incorrect</span>
                      <span className="font-arabic text-lg">Réponse : {correctArabic}</span>
                    </span>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {canAdvance && (
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
const Niveau2LessonDetail = ({ lesson, onBack, onComplete }: Niveau2LessonDetailProps) => {
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
            Leçon {lesson.id} : {lesson.title}
          </h2>
          <p className="text-xs text-muted-foreground">{lesson.subtitle}</p>
        </div>
      </div>

      <Tabs defaultValue="grammar" className="space-y-4">
        <TabsList className="bg-muted w-full grid grid-cols-3">
          <TabsTrigger value="grammar" className="gap-1.5 text-xs sm:text-sm">
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

        <TabsContent value="grammar">
          <GrammarTab lesson={lesson} />
        </TabsContent>

        <TabsContent value="exercises">
          <ExercisesTab lesson={lesson} onAllCorrect={() => setExercisesCompleted(true)} />
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

export default Niveau2LessonDetail;
