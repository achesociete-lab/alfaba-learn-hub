import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, PenTool,
  CheckCircle, XCircle, Trophy, RotateCcw, Volume2, Play,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lesson, TheorySection } from "@/data/niveau1-lessons";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { getIllustration } from "@/utils/vocabulary-illustrations";
import { useIsAdmin } from "@/hooks/use-admin";
import LessonAudioPlayer from "./LessonAudioPlayer";

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: number) => void;
}

// ─── Theory Section Renderer ───
function TheorySectionView({ section }: { section: TheorySection }) {
  const { speak } = useArabicSpeech();

  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-4">
      <h4 className="font-semibold text-foreground text-lg">{section.title}</h4>
      
      {/* Content with basic markdown-like rendering */}
      <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
        {section.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
          if (part.startsWith("**") && part.endsWith("**")) {
            return <strong key={i} className="text-foreground font-arabic">{part.slice(2, -2)}</strong>;
          }
          return <span key={i}>{part}</span>;
        })}
      </div>

      {/* Tip */}
      {section.tip && (
        <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-primary">💡 {section.tip}</p>
        </div>
      )}

      {/* Letter Grid */}
      {section.letterGrid && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" dir="rtl">
          {section.letterGrid.map((l, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.02 }}
              onClick={() => speak(l.letter)}
              className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-muted hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
            >
              <span className="font-arabic text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors">
                {l.letter}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1">{l.name}</span>
              <Volume2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </motion.div>
          ))}
        </div>
      )}

      {/* Forms Table */}
      {section.formsTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-border">
                <th className="py-2 text-xs text-muted-foreground">Lettre</th>
                <th className="py-2 text-xs text-muted-foreground">Isolée</th>
                <th className="py-2 text-xs text-muted-foreground">Début</th>
                <th className="py-2 text-xs text-muted-foreground">Milieu</th>
                <th className="py-2 text-xs text-muted-foreground">Fin</th>
              </tr>
            </thead>
            <tbody>
              {section.formsTable.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2 text-xs text-muted-foreground">{row.name}</td>
                  <td className="py-2 font-arabic text-xl text-foreground">{row.isolated}</td>
                  <td className="py-2 font-arabic text-xl text-foreground">{row.initial}</td>
                  <td className="py-2 font-arabic text-xl text-foreground">{row.medial}</td>
                  <td className="py-2 font-arabic text-xl text-foreground">{row.final}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Arabic Examples */}
      {section.arabicExamples && (
        <div className="space-y-2">
          {section.arabicExamples.map((ex, i) => {
            const emoji = getIllustration(ex.meaning);
            return (
              <div
                key={i}
                onClick={() => speak(ex.arabic)}
                className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <div>
                    <p className="font-arabic text-2xl text-foreground">{ex.arabic}</p>
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
      )}
    </div>
  );
}

// ─── Lesson Tab ───
function LessonTab({ lesson }: { lesson: Lesson }) {
  const { speak, stop } = useArabicSpeech();
  const { isAdmin } = useIsAdmin();
  const [isReading, setIsReading] = useState(false);

  const readLesson = async () => {
    if (isReading) { stop(); setIsReading(false); return; }
    setIsReading(true);
    try {
      for (const section of (lesson.theory || [])) {
        // Read letter grid
        if (section.letterGrid) {
          for (const l of section.letterGrid) {
            await speak(l.letter, 0.8);
            await new Promise(r => setTimeout(r, 500));
          }
        }
        // Read forms table (isolated forms)
        if (section.formsTable) {
          for (const row of section.formsTable) {
            await speak(row.isolated, 0.8);
            await new Promise(r => setTimeout(r, 600));
          }
        }
        // Read arabic examples
        if (section.arabicExamples) {
          for (const ex of section.arabicExamples) {
            await speak(ex.arabic, 0.75);
            await new Promise(r => setTimeout(r, 800));
          }
        }
      }
    } catch { /* stopped */ }
    setIsReading(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      {/* Teacher recording */}
      <LessonAudioPlayer level="niveau_1" lessonNumber={lesson.id} isTeacher={isAdmin} />

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

      {/* Theory sections */}
      {(lesson.theory || []).map((section, i) => (
        <TheorySectionView key={i} section={section} />
      ))}
    </motion.div>
  );
}

// ─── QCM Tab ───
function QCMTab({ lesson, onAllCorrect }: { lesson: Lesson; onAllCorrect: () => void }) {
  const qcmList = lesson.qcm || [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  if (qcmList.length === 0) return <p className="text-center text-muted-foreground p-4">Aucun exercice disponible.</p>;
  const q = qcmList[current];

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newScore = idx === q.correctIndex ? score + 1 : score;
    if (idx === q.correctIndex) setScore(newScore);
    if (current + 1 >= qcmList.length) {
      setTimeout(() => {
        if (newScore === qcmList.length) onAllCorrect();
      }, 500);
    }
  };

  const next = () => {
    if (current + 1 >= qcmList.length) {
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
          Score : <span className="font-bold text-primary">{score}</span> / {qcmList.length}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {score === qcmList.length ? "Parfait ! 🎉" : score >= qcmList.length * 0.7 ? "Très bien ! 👏" : "Continue à t'entraîner 💪"}
        </p>
        <Button onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} / {qcmList.length}</span>
        <span>Score : {score}</span>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          <p className="text-lg font-medium text-foreground mb-4">{q.question}</p>
          <div className="grid grid-cols-2 gap-3">
            {q.options.map((opt, idx) => {
              let cls = "border border-border bg-background hover:bg-muted";
              if (selected !== null) {
                if (idx === q.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
              }
              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null}
                  className={`p-4 rounded-lg text-base font-medium transition-all ${cls}`}>
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
            {current + 1 >= qcmList.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Dictation Tab ───
function DictationTab({ lesson, onAllCorrect }: { lesson: Lesson; onAllCorrect: () => void }) {
  const { speak } = useArabicSpeech();
  const dictList = lesson.dictation || [];
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<"qcm" | "keyboard">("qcm");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const currentRef = useRef(current);

  if (dictList.length === 0) return <p className="text-center text-muted-foreground p-4">Aucune dictée disponible.</p>;
  const d = dictList[current];
  const correctArabic = d.options[d.correctIndex];

  const playDictation = async () => {
    setIsPlaying(true);
    try {
      await speak(correctArabic, 0.75);
    } finally {
      setTimeout(() => setIsPlaying(false), 1500);
    }
  };

  if (currentRef.current !== current) {
    currentRef.current = current;
    setTimeout(() => playDictation(), 400);
  }

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const newScore = idx === d.correctIndex ? score + 1 : score;
    if (idx === d.correctIndex) setScore(newScore);
    if (current + 1 >= dictList.length) {
      setTimeout(() => {
        if (newScore === dictList.length) onAllCorrect();
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
    if (current + 1 >= dictList.length) {
      setTimeout(() => {
        if (newScore === dictList.length) onAllCorrect();
      }, 500);
    }
  };

  const next = () => {
    if (current + 1 >= dictList.length) {
      setFinished(true);
    } else {
      setCurrent(c => c + 1);
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
          Score : <span className="font-bold text-primary">{score}</span> / {dictList.length}
        </p>
        <p className="text-sm text-muted-foreground mb-6">
          {score === dictList.length ? "Excellent ! 🎉" : "Continue à t'entraîner 💪"}
        </p>
        <Button onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Mot {current + 1} / {dictList.length}</span>
        <span>Score : {score}</span>
      </div>

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
          <p className="text-center text-muted-foreground mb-2 text-sm">Écoutez et {mode === "qcm" ? "choisissez" : "écrivez"} le bon mot :</p>
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
                    className={`p-4 rounded-lg font-arabic text-2xl transition-all ${cls}`}>
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
                className="w-full p-4 rounded-lg border border-border bg-background font-arabic text-3xl text-center focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
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
                      <span className="font-arabic text-xl">Réponse : {correctArabic}</span>
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
            {current + 1 >= dictList.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" />
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
            {lesson.icon} Leçon {lesson.id} : {lesson.title}
          </h2>
          <p className="text-xs text-muted-foreground">{lesson.subtitle}</p>
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
