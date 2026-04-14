import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2, BookOpen, Sparkles, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import type { Lesson, TheorySection } from "@/data/niveau1-lessons";
import { getIllustration } from "@/utils/vocabulary-illustrations";

interface LessonScreensProps {
  lesson: Lesson;
  onComplete: () => void;
}

const slideIn = { initial: { opacity: 0, x: 100 }, animate: { opacity: 1, x: 0 }, exit: { opacity: 0, x: -100 } };

// ─── Intro Screen ───
function IntroScreen({ lesson, onNext }: { lesson: Lesson; onNext: () => void }) {
  return (
    <motion.div {...slideIn} className="flex flex-col items-center justify-center min-h-[55vh] text-center space-y-6 px-4">
      <motion.div
        initial={{ scale: 0 }} animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="h-24 w-24 rounded-full gradient-emerald flex items-center justify-center text-4xl"
      >
        {lesson.icon}
      </motion.div>
      <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="text-2xl sm:text-3xl font-bold text-foreground">
        Bienvenue dans la Leçon {lesson.id}
      </motion.h2>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
        className="space-y-1">
        <p className="text-xl font-semibold text-primary">{lesson.title}</p>
        <p className="text-muted-foreground max-w-md">{lesson.subtitle}</p>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}>
        <Button size="lg" onClick={onNext} className="gap-2 gradient-emerald border-0 text-primary-foreground mt-4">
          Commencer <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Generic Theory Screen ───
function TheoryScreen({ section, onNext, isLast }: { section: TheorySection; onNext: () => void; isLast: boolean }) {
  const { speak } = useArabicSpeech();
  const [clickedLetters, setClickedLetters] = useState<Set<number>>(new Set());
  const hasGrid = !!section.letterGrid;
  const minClicks = hasGrid ? Math.min(5, section.letterGrid!.length) : 0;
  const canProceed = !hasGrid || clickedLetters.size >= minClicks;

  const handleLetterClick = useCallback((idx: number, letter: string) => {
    speak(letter);
    setClickedLetters(prev => new Set(prev).add(idx));
  }, [speak]);

  return (
    <motion.div {...slideIn} className="space-y-6">
      {/* Title */}
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">{section.title}</h2>
      </div>

      {/* Content text */}
      <div className="p-4 rounded-xl border border-border bg-card">
        <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
          {section.content.split(/(\*\*[^*]+\*\*)/).map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return <strong key={i} className="text-foreground font-arabic">{part.slice(2, -2)}</strong>;
            }
            return <span key={i}>{part}</span>;
          })}
        </div>
      </div>

      {/* Tip */}
      {section.tip && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="p-3 rounded-lg bg-primary/5 border border-primary/20 flex items-start gap-2">
          <Sparkles className="h-4 w-4 text-primary mt-0.5 shrink-0" />
          <p className="text-sm text-primary">{section.tip}</p>
        </motion.div>
      )}

      {/* Letter Grid */}
      {section.letterGrid && (
        <div className="space-y-2">
          {!canProceed && (
            <p className="text-xs text-center text-muted-foreground">
              Clique sur au moins {minClicks - clickedLetters.size} lettre{minClicks - clickedLetters.size > 1 ? "s" : ""} pour continuer
            </p>
          )}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 max-w-2xl mx-auto" dir="rtl">
            {section.letterGrid.map((l, i) => {
              const isClicked = clickedLetters.has(i);
              return (
                <motion.button key={i}
                  initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => handleLetterClick(i, l.letter)}
                  className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer group ${
                    isClicked ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30" : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
                  }`}
                >
                  <span className={`font-arabic text-2xl sm:text-3xl transition-colors ${isClicked ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                    {l.letter}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">{l.name}</span>
                  <Volume2 className={`h-3 w-3 mt-0.5 transition-opacity ${isClicked ? "text-primary opacity-100" : "text-muted-foreground opacity-0 group-hover:opacity-100"}`} />
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {/* Forms Table */}
      {section.formsTable && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="overflow-x-auto rounded-xl border border-border bg-card">
          <table className="w-full text-center">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="py-2.5 px-2 text-xs text-muted-foreground font-medium">Lettre</th>
                <th className="py-2.5 px-2 text-xs text-muted-foreground font-medium">Isolée</th>
                <th className="py-2.5 px-2 text-xs text-muted-foreground font-medium">Début</th>
                <th className="py-2.5 px-2 text-xs text-muted-foreground font-medium">Milieu</th>
                <th className="py-2.5 px-2 text-xs text-muted-foreground font-medium">Fin</th>
              </tr>
            </thead>
            <tbody>
              {section.formsTable.map((row, i) => (
                <motion.tr key={i}
                  initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.08 }}
                  className="border-b border-border/50 hover:bg-muted/30 cursor-pointer"
                  onClick={() => speak(row.isolated)}
                >
                  <td className="py-2.5 text-xs text-muted-foreground">{row.name}</td>
                  <td className="py-2.5 font-arabic text-xl text-foreground">{row.isolated}</td>
                  <td className="py-2.5 font-arabic text-xl text-foreground">{row.initial}</td>
                  <td className="py-2.5 font-arabic text-xl text-foreground">{row.medial}</td>
                  <td className="py-2.5 font-arabic text-xl text-foreground">{row.final}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* Arabic Examples */}
      {section.arabicExamples && (
        <div className="space-y-2">
          {section.arabicExamples.map((ex, i) => {
            const emoji = getIllustration(ex.meaning);
            return (
              <motion.div key={i}
                initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.08 }}
                onClick={() => speak(ex.arabic)}
                className="flex items-center justify-between p-3 rounded-lg bg-card border border-border cursor-pointer hover:bg-primary/5 hover:border-primary/30 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="font-arabic text-2xl text-foreground">{ex.arabic}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-foreground font-medium">{ex.meaning}</span>
                  {emoji && <span className="text-2xl">{emoji}</span>}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Next button */}
      <div className="flex justify-center pt-2">
        <Button size="lg" onClick={onNext} disabled={!canProceed}
          className="gap-2 gradient-emerald border-0 text-primary-foreground">
          {isLast ? "Passer aux exercices" : "Suivant"} <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───
export default function LessonScreens({ lesson, onComplete }: LessonScreensProps) {
  const [screen, setScreen] = useState(0);
  const theorySections = lesson.theory || [];
  // Total: intro + theory sections
  const totalScreens = 1 + theorySections.length;
  const progressPct = ((screen + 1) / totalScreens) * 100;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Étape {screen + 1}/{totalScreens}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {screen === 0 ? (
          <IntroScreen key="intro" lesson={lesson} onNext={() => setScreen(1)} />
        ) : (
          <TheoryScreen
            key={`theory-${screen}`}
            section={theorySections[screen - 1]}
            onNext={() => {
              if (screen >= totalScreens - 1) {
                onComplete();
              } else {
                setScreen(s => s + 1);
              }
            }}
            isLast={screen >= totalScreens - 1}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
