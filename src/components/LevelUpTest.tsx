import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, ArrowRight, CheckCircle, XCircle, RotateCcw,
  GraduationCap, Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { playCorrectSound, playWrongSound } from "@/utils/sound-feedback";
import { LEVEL_UP_QUESTION_BANK, type BankQuestion } from "@/data/levelup-question-bank";

interface Props {
  onPass: () => void;
  onDismiss: () => void;
}

const TOTAL_QUESTIONS = 40;
const PASS_PERCENTAGE = 80; // 80%
const PASS_THRESHOLD = Math.ceil((TOTAL_QUESTIONS * PASS_PERCENTAGE) / 100); // 32/40

// Tirage aléatoire sans répétition, équilibré par catégorie
function pickQuestions(bank: BankQuestion[], count: number): BankQuestion[] {
  // Grouper par catégorie
  const byCat: Record<string, BankQuestion[]> = {};
  for (const q of bank) {
    (byCat[q.category] ||= []).push(q);
  }
  const categories = Object.keys(byCat);
  // Mélanger chaque catégorie
  for (const cat of categories) {
    byCat[cat] = [...byCat[cat]].sort(() => Math.random() - 0.5);
  }
  // Distribuer équitablement
  const result: BankQuestion[] = [];
  const seen = new Set<string>();
  let i = 0;
  while (result.length < count) {
    let added = false;
    for (const cat of categories) {
      if (result.length >= count) break;
      const q = byCat[cat][i];
      if (q && !seen.has(q.question)) {
        result.push(q);
        seen.add(q.question);
        added = true;
      }
    }
    if (!added) break;
    i++;
  }
  // Remélange final
  return result.sort(() => Math.random() - 0.5);
}

const LevelUpTest = ({ onPass, onDismiss }: Props) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<BankQuestion[]>(() =>
    pickQuestions(LEVEL_UP_QUESTION_BANK, TOTAL_QUESTIONS)
  );
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const q = questions[current];
  const total = questions.length;
  const progress = useMemo(() => ((current + (selected !== null ? 1 : 0)) / total) * 100, [current, selected, total]);

  const handleSelect = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    if (idx === q.correctIndex) {
      setScore((s) => s + 1);
      playCorrectSound();
    } else {
      playWrongSound();
    }
  };

  const next = () => {
    if (current + 1 >= total) {
      setFinished(true);
    } else {
      setCurrent((c) => c + 1);
      setSelected(null);
    }
  };

  const reset = () => {
    setQuestions(pickQuestions(LEVEL_UP_QUESTION_BANK, TOTAL_QUESTIONS));
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
  };

  const passed = score >= PASS_THRESHOLD;
  const percentage = Math.round((score / total) * 100);

  const handleUpgrade = useCallback(async () => {
    if (!user) return;
    setUpgrading(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ level: "niveau_2" as const })
        .eq("user_id", user.id);
      if (error) throw error;
      toast.success("Félicitations ! Vous passez au Niveau 2 🎉");
      onPass();
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du passage de niveau");
    } finally {
      setUpgrading(false);
    }
  }, [user, onPass]);

  if (finished) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-lg mx-auto p-8 rounded-2xl border border-border bg-card text-center"
      >
        {passed ? (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full gradient-gold flex items-center justify-center">
              <Trophy className="h-10 w-10 text-primary-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              🎉 Test réussi !
            </h2>
            <p className="text-lg text-muted-foreground mb-1">
              Score : <span className="font-bold text-primary">{score}</span> / {total} ({percentage}%)
            </p>
            <p className="text-muted-foreground mb-6">
              Tu as validé le Niveau 1 avec succès. Tu es prêt(e) pour le Niveau 2 !
            </p>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleUpgrade}
                disabled={upgrading}
                className="gap-2 gradient-emerald border-0 text-primary-foreground text-lg py-6"
              >
                <GraduationCap className="h-5 w-5" />
                {upgrading ? "Passage en cours..." : "Passer au Niveau 2"}
              </Button>
              <Button variant="ghost" size="sm" onClick={onDismiss}>
                Plus tard
              </Button>
            </div>
          </>
        ) : (
          <>
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Star className="h-10 w-10 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Continue à t'entraîner !
            </h2>
            <p className="text-lg text-muted-foreground mb-1">
              Score : <span className="font-bold text-destructive">{score}</span> / {total} ({percentage}%)
            </p>
            <p className="text-muted-foreground mb-6">
              Il faut au moins {PASS_THRESHOLD}/{total} ({PASS_PERCENTAGE}%) pour passer au Niveau 2.
              Revois tes leçons et réessaie avec de nouvelles questions.
            </p>
            <div className="flex gap-3 justify-center">
              <Button onClick={reset} className="gap-2">
                <RotateCcw className="h-4 w-4" /> Recommencer
              </Button>
              <Button variant="outline" onClick={onDismiss}>
                Retour
              </Button>
            </div>
          </>
        )}
      </motion.div>
    );
  }

  return (
    <div className="max-w-lg mx-auto space-y-4">
      <div className="text-center mb-4">
        <h2 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
          <GraduationCap className="h-6 w-6 text-primary" />
          Test de passage — Niveau 2
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Score requis : {PASS_THRESHOLD}/{total} ({PASS_PERCENTAGE}%)
        </p>
      </div>

      <Progress value={progress} className="h-2" />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Question {current + 1} / {total}</span>
        <span>Score : {score}</span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="p-6 rounded-xl border border-border bg-card"
        >
          <p className="text-lg font-medium text-foreground mb-4">{q.question}</p>
          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, idx) => {
              let cls = "border border-border bg-background hover:bg-muted";
              if (selected !== null) {
                if (idx === q.correctIndex) cls = "border-primary bg-primary/10 text-primary";
                else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive";
              }
              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={selected !== null}
                  className={`p-4 rounded-lg text-base font-medium text-left transition-all ${cls}`}
                >
                  {opt}
                  {selected !== null && idx === q.correctIndex && (
                    <CheckCircle className="h-4 w-4 inline ml-2" />
                  )}
                  {selected !== null && idx === selected && idx !== q.correctIndex && (
                    <XCircle className="h-4 w-4 inline ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>

      {selected !== null && (
        <div className="flex justify-end">
          <Button onClick={next} className="gap-2">
            {current + 1 >= total ? "Voir le résultat" : "Suivant"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default LevelUpTest;
