import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw, Trophy, AlertTriangle } from "lucide-react";
import { playCorrectSound, playWrongSound, playVictorySound } from "@/utils/sound-feedback";

interface Question {
  prompt: string;
  display?: string;
  highlight?: string;
  choices: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    prompt: "Comment s'appelle la voyelle courte « a » placée au-dessus d'une lettre ?",
    choices: ["Kasra", "Damma", "Fatha", "Sukun"],
    correct: 2,
    explanation: "La Fatha (فَتْحَة) est la voyelle courte « a », notée ـَ au-dessus de la lettre.",
  },
  {
    prompt: "Quelle est la prononciation de cette lettre vocalisée ?",
    display: "بِ",
    choices: ["ba", "bu", "bi", "b"],
    correct: 2,
    explanation: "La kasra (ـِ) sous la lettre donne le son « i ». Donc بِ = bi.",
  },
  {
    prompt: "Quelle lettre est mise en valeur dans ce mot ?",
    display: "كَتَبَ",
    highlight: "ت",
    choices: ["Kâf (ك)", "Tâ (ت)", "Bâ (ب)", "Alif (ا)"],
    correct: 1,
    explanation: "La lettre centrale de كَتَبَ est Tâ (ت), qui donne le son « t ».",
  },
  {
    prompt: "Que signifie la Shadda ( ّ ) sur une lettre ?",
    choices: [
      "La lettre est silencieuse",
      "La lettre est doublée (prononcée deux fois)",
      "C'est une voyelle longue",
      "La lettre se prononce « a »",
    ],
    correct: 1,
    explanation: "La Shadda (شَدَّة) indique que la consonne est doublée — on la prononce deux fois.",
  },
  {
    prompt: "Comment se prononce le Tanwîn ـً à la fin d'un mot ?",
    choices: ["-in", "-un", "-an", "-a"],
    correct: 2,
    explanation: "Le Tanwîn Fath (ـً) se prononce « an » à la fin du mot.",
  },
  {
    prompt: "Quel est le mot arabe pour « Livre » ?",
    choices: ["قَلَم", "بَيْت", "كِتَاب", "بَاب"],
    correct: 2,
    explanation: "كِتَاب (kitâb) signifie « livre ». قَلَم = stylo, بَيْت = maison, بَاب = porte.",
  },
  {
    prompt: "L'article ال devant « شَمْس » (soleil) se prononce :",
    choices: ["al-shams", "ash-shams", "al-chamss", "a-shams"],
    correct: 1,
    explanation: "ش est une lettre solaire (شمسية). Le Lam s'assimile → ash-shams.",
  },
  {
    prompt: "L'article ال devant « قَمَر » (lune) se prononce :",
    choices: ["aq-qamar", "ash-qamar", "al-qamar", "am-qamar"],
    correct: 2,
    explanation: "ق est une lettre lunaire (قمرية). Le Lam se prononce normalement → al-qamar.",
  },
  {
    prompt: "Combien y a-t-il de lettres dans l'alphabet arabe ?",
    choices: ["22", "26", "28", "30"],
    correct: 2,
    explanation: "L'alphabet arabe comporte 28 lettres.",
  },
  {
    prompt: "Que signifie ce mot ?",
    display: "بَيْت",
    choices: ["École", "Maison", "Livre", "Jardin"],
    correct: 1,
    explanation: "بَيْت (bayt) signifie « maison ».",
  },
];

const PASS_THRESHOLD = 0.7;
const STORAGE_KEY = "placement_n2_result";

export interface PlacementResult {
  score: number;
  total: number;
  passed: boolean;
  date: string;
}

export function getPlacementResult(userId?: string): PlacementResult | null {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePlacementResult(result: PlacementResult, userId?: string) {
  try {
    const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
    localStorage.setItem(key, JSON.stringify(result));
  } catch {}
}

interface Props {
  userId?: string;
  onDismiss: () => void;
}

export default function PlacementTestN2({ userId, onDismiss }: Props) {
  const [phase, setPhase] = useState<"intro" | "quiz" | "result">("intro");
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState(0);

  const q = QUESTIONS[index];
  const pct = Math.round((score / QUESTIONS.length) * 100);
  const passed = score / QUESTIONS.length >= PASS_THRESHOLD;

  const handleChoice = (i: number) => {
    if (revealed) return;
    setSelected(i);
    setRevealed(true);
    if (i === q.correct) {
      playCorrectSound();
      setScore(s => s + 1);
    } else {
      playWrongSound();
    }
  };

  const next = () => {
    if (index + 1 >= QUESTIONS.length) {
      const result: PlacementResult = {
        score: selected === q.correct ? score + 1 : score,
        total: QUESTIONS.length,
        passed: (selected === q.correct ? score + 1 : score) / QUESTIONS.length >= PASS_THRESHOLD,
        date: new Date().toISOString(),
      };
      savePlacementResult(result, userId);
      if (result.passed) playVictorySound();
      setPhase("result");
    } else {
      setIndex(i => i + 1);
      setSelected(null);
      setRevealed(false);
    }
  };

  const reset = () => {
    setPhase("intro");
    setIndex(0);
    setSelected(null);
    setRevealed(false);
    setScore(0);
    try {
      const key = userId ? `${STORAGE_KEY}_${userId}` : STORAGE_KEY;
      localStorage.removeItem(key);
    } catch {}
  };

  if (phase === "intro") {
    return (
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6 rounded-2xl border-2 border-gold/40 bg-gold/5 overflow-hidden"
      >
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl gradient-gold flex items-center justify-center shrink-0">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">Test de placement N1 → N2</h3>
                <p className="text-sm text-muted-foreground">
                  10 questions · ~3 min · Évalue vos bases du Niveau 1
                </p>
              </div>
            </div>
            <button
              onClick={onDismiss}
              className="text-muted-foreground hover:text-foreground text-lg leading-none shrink-0 mt-0.5"
            >
              ✕
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-3 mb-4">
            Ce test vérifie que vous maîtrisez les bases nécessaires pour aborder sereinement le Niveau 2 :
            voyelles, alphabet, tanwîn, shadda, articles et vocabulaire fondamental.
          </p>
          <div className="flex gap-3 flex-wrap">
            <Button onClick={() => setPhase("quiz")} className="gradient-gold border-0 text-primary-foreground gap-2">
              Commencer le test <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-muted-foreground">
              Passer
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  if (phase === "result") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        className="mb-6 rounded-2xl border-2 overflow-hidden"
        style={{ borderColor: passed ? "#10b981" : "#f59e0b" }}
      >
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: passed ? "#10b98120" : "#f59e0b20" }}
            >
              {passed
                ? <Trophy className="h-6 w-6 text-green-600" />
                : <AlertTriangle className="h-6 w-6 text-amber-600" />}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">
                {passed ? "Bonne préparation !" : "Quelques bases à consolider"}
              </h3>
              <p className="text-sm text-muted-foreground">
                Score : <strong>{score}/{QUESTIONS.length}</strong> ({pct}%)
              </p>
            </div>
          </div>

          {passed ? (
            <p className="text-sm text-foreground/80">
              Vous avez les bases solides pour commencer le Niveau 2. Bonne continuation !
            </p>
          ) : (
            <p className="text-sm text-foreground/80">
              Nous recommandons de revoir certains points du Niveau 1 avant de commencer, mais
              vous pouvez tout de même accéder aux leçons dès maintenant.
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            <Button onClick={onDismiss} className="gradient-gold border-0 text-primary-foreground gap-1">
              {passed ? "Commencer le Niveau 2" : "Accéder quand même"} <ChevronRight className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={reset} className="gap-1">
              <RotateCcw className="h-3.5 w-3.5" /> Repasser le test
            </Button>
          </div>
        </div>
      </motion.div>
    );
  }

  // Quiz phase
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6 rounded-2xl border-2 border-gold/40 bg-card overflow-hidden"
    >
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Test de placement
          </span>
          <span className="text-xs text-muted-foreground">
            {index + 1} / {QUESTIONS.length}
          </span>
        </div>
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden mb-4">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{ width: `${((index) / QUESTIONS.length) * 100}%`, backgroundColor: "#d97706" }}
          />
        </div>
      </div>

      <div className="px-5 pb-5 space-y-4">
        <p className="text-sm font-medium text-foreground">{q.prompt}</p>

        {q.display && (
          <div className="text-center py-4 bg-muted/30 rounded-xl">
            <p
              className="text-5xl font-bold text-primary"
              dir="rtl"
              style={{ fontFamily: "Amiri, serif", lineHeight: 1.3 }}
            >
              {q.highlight
                ? (() => {
                    const chars = Array.from(q.display);
                    return chars.map((ch, i) => (
                      <span key={i} style={ch === q.highlight ? { color: "#dc2626" } : {}}>
                        {ch}
                      </span>
                    ));
                  })()
                : q.display}
            </p>
          </div>
        )}

        <AnimatePresence mode="wait">
          <div className="grid grid-cols-1 gap-2">
            {q.choices.map((choice, i) => {
              let cls =
                "w-full text-left px-4 py-3 rounded-xl border-2 text-sm font-medium transition-all ";
              if (!revealed) {
                cls += "border-border hover:border-gold/60 hover:bg-gold/5 cursor-pointer";
              } else if (i === q.correct) {
                cls += "border-green-500 bg-green-500/10 text-green-700";
              } else if (i === selected && i !== q.correct) {
                cls += "border-red-500 bg-red-500/10 text-red-700";
              } else {
                cls += "border-border opacity-50";
              }

              return (
                <button key={i} className={cls} onClick={() => handleChoice(i)} disabled={revealed}>
                  <span className="flex items-center justify-between gap-2">
                    <span>{choice}</span>
                    {revealed && i === q.correct && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                    {revealed && i === selected && i !== q.correct && <XCircle className="h-4 w-4 text-red-600 shrink-0" />}
                  </span>
                </button>
              );
            })}
          </div>
        </AnimatePresence>

        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className={`text-xs px-3 py-2 rounded-lg ${selected === q.correct ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
              {q.explanation}
            </div>
            <Button onClick={next} className="w-full gradient-gold border-0 text-primary-foreground gap-2">
              {index + 1 < QUESTIONS.length ? "Question suivante" : "Voir mon résultat"}
              <ChevronRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
