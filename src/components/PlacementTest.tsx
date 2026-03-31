import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowRight, ArrowLeft, GraduationCap } from "lucide-react";

interface PlacementTestProps {
  onComplete: (level: "niveau_1" | "niveau_2") => void;
  onBack: () => void;
}

type Question = {
  question: string;
  arabic?: string;
  type: "mcq" | "reading" | "dictation";
  options: { label: string; score: number }[];
};

const questions: Question[] = [
  // --- Questions générales (MCQ) ---
  {
    type: "mcq",
    question: "Connaissez-vous les lettres de l'alphabet arabe ?",
    options: [
      { label: "Non, pas du tout", score: 0 },
      { label: "Quelques-unes seulement", score: 1 },
      { label: "Oui, la plupart ou toutes", score: 2 },
    ],
  },
  {
    type: "mcq",
    question: "Avez-vous déjà étudié des règles de grammaire arabe (نحو) ?",
    options: [
      { label: "Non, jamais", score: 0 },
      { label: "Un peu, les bases", score: 1 },
      { label: "Oui, je connais les bases (sujet, verbe, complément)", score: 2 },
    ],
  },
  // --- Tests de lecture ---
  {
    type: "reading",
    question: "Que signifie ce mot ?",
    arabic: "كِتَابٌ",
    options: [
      { label: "Stylo", score: 0 },
      { label: "Livre", score: 2 },
      { label: "Table", score: 0 },
    ],
  },
  {
    type: "reading",
    question: "Lisez ce mot et choisissez la bonne translittération :",
    arabic: "مَدْرَسَةٌ",
    options: [
      { label: "Masjid", score: 0 },
      { label: "Maktaba", score: 0 },
      { label: "Madrasa", score: 2 },
    ],
  },
  {
    type: "reading",
    question: "Que signifie cette phrase ?",
    arabic: "ذَهَبَ الوَلَدُ إِلَى المَدْرَسَةِ",
    options: [
      { label: "Le garçon est allé à l'école", score: 2 },
      { label: "La fille est allée au marché", score: 0 },
      { label: "Je ne sais pas lire cette phrase", score: 0 },
    ],
  },
  {
    type: "reading",
    question: "Quel est le son de cette lettre avec la voyelle ?",
    arabic: "بُ",
    options: [
      { label: "Ba", score: 0 },
      { label: "Bi", score: 0 },
      { label: "Bou", score: 2 },
    ],
  },
  // --- Tests de dictée (identification) ---
  {
    type: "dictation",
    question: "Le mot « Qalam » (stylo) s'écrit :",
    options: [
      { label: "كَلَمٌ", score: 0 },
      { label: "قَلَمٌ", score: 2 },
      { label: "قَلْبٌ", score: 0 },
    ],
  },
  {
    type: "dictation",
    question: "Le mot « Bayt » (maison) s'écrit :",
    options: [
      { label: "بَيْتٌ", score: 2 },
      { label: "بِنْتٌ", score: 0 },
      { label: "بَابٌ", score: 0 },
    ],
  },
  {
    type: "dictation",
    question: "Le mot « Shams » (soleil) s'écrit :",
    options: [
      { label: "سَمَاءٌ", score: 0 },
      { label: "شَمْسٌ", score: 2 },
      { label: "شَجَرَةٌ", score: 0 },
    ],
  },
];

const PlacementTest = ({ onComplete, onBack }: PlacementTestProps) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);

  const totalScore = answers.reduce((sum, s) => sum + s, 0);
  const maxScore = questions.reduce((sum, q) => sum + Math.max(...q.options.map(o => o.score)), 0);
  // Threshold: 50%+ → niveau 2
  const determinedLevel: "niveau_1" | "niveau_2" = totalScore >= maxScore * 0.5 ? "niveau_2" : "niveau_1";

  const handleNext = () => {
    if (selected === null) return;
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      setShowResult(true);
    }
  };

  const handlePrev = () => {
    if (currentQ > 0) {
      setSelected(answers[answers.length - 1]);
      setAnswers(answers.slice(0, -1));
      setCurrentQ(currentQ - 1);
    }
  };

  if (showResult) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-6"
      >
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <GraduationCap className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground mb-2">Résultat du test</h2>
          <p className="text-muted-foreground text-sm mb-4">
            D'après vos réponses, nous vous recommandons :
          </p>
          <div className={`inline-block px-6 py-3 rounded-xl text-lg font-bold ${
            determinedLevel === "niveau_1"
              ? "bg-primary/10 text-primary border border-primary/20"
              : "bg-accent/10 text-accent border border-accent/20"
          }`}>
            {determinedLevel === "niveau_1" ? "Niveau 1 — Fondamentaux" : "Niveau 2 — Grammaire & Compréhension"}
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            Score : {totalScore}/{questions.length * 2}
          </p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            onClick={() => onComplete(determinedLevel)}
            className="w-full gradient-emerald border-0 text-primary-foreground"
          >
            <CheckCircle className="h-4 w-4 mr-2" />
            Continuer avec ce niveau
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setShowResult(false);
              setCurrentQ(0);
              setAnswers([]);
              setSelected(null);
            }}
            className="text-muted-foreground"
          >
            Refaire le test
          </Button>
        </div>
      </motion.div>
    );
  }

  const q = questions[currentQ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between mb-1">
        <button
          onClick={currentQ === 0 ? onBack : handlePrev}
          className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {currentQ === 0 ? "Retour" : "Précédent"}
        </button>
        <span className="text-xs text-muted-foreground font-medium">
          {currentQ + 1} / {questions.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-primary rounded-full"
          initial={{ width: 0 }}
          animate={{ width: `${((currentQ + 1) / questions.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.2 }}
        >
          <h3 className="text-base font-semibold text-foreground mb-4">
            {q.question}
          </h3>

          <div className="space-y-2.5">
            {q.options.map((opt, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSelected(opt.score)}
                className={`w-full text-left p-3.5 rounded-xl border text-sm transition-all ${
                  selected === opt.score
                    ? "border-primary bg-primary/10 text-primary font-medium ring-1 ring-primary/30"
                    : "border-border text-foreground hover:border-primary/30 hover:bg-muted/50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      <Button
        onClick={handleNext}
        disabled={selected === null}
        className="w-full gradient-emerald border-0 text-primary-foreground"
      >
        {currentQ < questions.length - 1 ? (
          <>Suivant <ArrowRight className="h-4 w-4 ml-2" /></>
        ) : (
          "Voir mon résultat"
        )}
      </Button>
    </div>
  );
};

export default PlacementTest;
