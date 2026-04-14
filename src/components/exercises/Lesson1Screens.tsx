import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Volume2, BookOpen, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";

const TOTAL_SCREENS = 4;
const MIN_CLICKS = 5;

const letters = [
  { letter: "ا", name: "Alif" }, { letter: "ب", name: "Bâ'" }, { letter: "ت", name: "Tâ'" },
  { letter: "ث", name: "Thâ'" }, { letter: "ج", name: "Jîm" }, { letter: "ح", name: "Hâ'" },
  { letter: "خ", name: "Khâ'" }, { letter: "د", name: "Dâl" }, { letter: "ذ", name: "Dhâl" },
  { letter: "ر", name: "Râ'" }, { letter: "ز", name: "Zây" }, { letter: "س", name: "Sîn" },
  { letter: "ش", name: "Shîn" }, { letter: "ص", name: "Sâd" }, { letter: "ض", name: "Dâd" },
  { letter: "ط", name: "Tâ'" }, { letter: "ظ", name: "Dhâ'" }, { letter: "ع", name: "'Ayn" },
  { letter: "غ", name: "Ghayn" }, { letter: "ف", name: "Fâ'" }, { letter: "ق", name: "Qâf" },
  { letter: "ك", name: "Kâf" }, { letter: "ل", name: "Lâm" }, { letter: "م", name: "Mîm" },
  { letter: "ن", name: "Nûn" }, { letter: "ه", name: "Hâ'" }, { letter: "و", name: "Wâw" },
  { letter: "ي", name: "Yâ'" },
];

const families = [
  { color: "from-blue-500/20 to-blue-600/20 border-blue-500/30", label: "Groupe 1", letters: "ب ت ث", desc: "Même corps, différenciées par les points" },
  { color: "from-emerald-500/20 to-emerald-600/20 border-emerald-500/30", label: "Groupe 2", letters: "ج ح خ", desc: "Même forme arrondie" },
  { color: "from-amber-500/20 to-amber-600/20 border-amber-500/30", label: "Groupe 3", letters: "د ذ", desc: "Même forme, avec ou sans point" },
  { color: "from-purple-500/20 to-purple-600/20 border-purple-500/30", label: "Groupe 4", letters: "ر ز", desc: "Même forme, avec ou sans point" },
  { color: "from-rose-500/20 to-rose-600/20 border-rose-500/30", label: "Groupe 5", letters: "س ش", desc: "Même forme, 3 points ou rien" },
  { color: "from-cyan-500/20 to-cyan-600/20 border-cyan-500/30", label: "Groupe 6", letters: "ص ض", desc: "Même forme, avec ou sans point" },
  { color: "from-orange-500/20 to-orange-600/20 border-orange-500/30", label: "Groupe 7", letters: "ط ظ", desc: "Même forme, avec ou sans point" },
  { color: "from-indigo-500/20 to-indigo-600/20 border-indigo-500/30", label: "Groupe 8", letters: "ع غ", desc: "Même forme, avec ou sans point" },
  { color: "from-teal-500/20 to-teal-600/20 border-teal-500/30", label: "Groupe 9", letters: "ف ق", desc: "Forme similaire, 1 ou 2 points" },
];

const nonLinking = ["ا", "د", "ذ", "ر", "ز", "و"];

interface Lesson1ScreensProps {
  onComplete: () => void;
}

// ─── Screen 1: Introduction ───
function IntroScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-6 px-4"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="h-24 w-24 rounded-full gradient-emerald flex items-center justify-center"
      >
        <BookOpen className="h-12 w-12 text-primary-foreground" />
      </motion.div>
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="text-2xl sm:text-3xl font-bold text-foreground"
      >
        Bienvenue dans la Leçon 1
      </motion.h2>
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="text-muted-foreground max-w-md text-base"
      >
        L'alphabet arabe compte <strong className="text-foreground">28 lettres</strong>. 
        Contrairement au français, l'arabe s'écrit <strong className="text-foreground">de droite à gauche</strong>. 
        Découvrons ensemble chaque lettre !
      </motion.p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <Button size="lg" onClick={onNext} className="gap-2 gradient-emerald border-0 text-primary-foreground mt-4">
          Commencer <ArrowRight className="h-5 w-5" />
        </Button>
      </motion.div>
    </motion.div>
  );
}

// ─── Screen 2: The 28 Letters ───
function LettersScreen({ onNext }: { onNext: () => void }) {
  const { speak } = useArabicSpeech();
  const [clicked, setClicked] = useState<Set<number>>(new Set());

  const handleClick = useCallback((idx: number, letter: string) => {
    speak(letter);
    setClicked(prev => new Set(prev).add(idx));
  }, [speak]);

  const canProceed = clicked.size >= MIN_CLICKS;

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Les 28 lettres de l'alphabet</h2>
        <p className="text-sm text-muted-foreground">
          Clique sur chaque lettre pour entendre sa prononciation
          {!canProceed && <span className="block text-xs mt-1">({MIN_CLICKS - clicked.size} lettres restantes pour continuer)</span>}
        </p>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5 max-w-2xl mx-auto" dir="rtl">
        {letters.map((l, i) => {
          const isClicked = clicked.has(i);
          return (
            <motion.button
              key={i}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => handleClick(i, l.letter)}
              className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer group ${
                isClicked
                  ? "border-primary/50 bg-primary/10 ring-1 ring-primary/30"
                  : "border-border bg-card hover:border-primary/40 hover:bg-primary/5"
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

      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canProceed}
          className="gap-2 gradient-emerald border-0 text-primary-foreground"
        >
          J'ai compris <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Screen 3: Letter Families ───
function FamiliesScreen({ onNext }: { onNext: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Les familles de lettres</h2>
        <p className="text-sm text-muted-foreground">En connaissant les formes de base, tu maîtrises les 28 lettres !</p>
      </div>

      <div className="grid gap-3 max-w-2xl mx-auto">
        {families.map((f, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`p-4 rounded-xl border bg-gradient-to-r ${f.color}`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-muted-foreground">{f.label}</p>
                <p className="text-sm text-foreground mt-0.5">{f.desc}</p>
              </div>
              <div className="font-arabic text-3xl text-foreground tracking-wider" dir="rtl">
                {f.letters}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onNext} className="gap-2 gradient-emerald border-0 text-primary-foreground">
          Suivant <ArrowRight className="h-5 w-5" />
        </Button>
      </div>
    </motion.div>
  );
}

// ─── Screen 4: Non-linking Letters ───
function NonLinkingScreen({ onComplete }: { onComplete: () => void }) {
  const [illuminated, setIlluminated] = useState(0);

  // Animate letters one by one
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex flex-col items-center justify-center min-h-[50vh] space-y-8"
    >
      <div className="text-center">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Les lettres non-liantes</h2>
        <p className="text-sm text-muted-foreground max-w-md mx-auto">
          Ces 6 lettres ne se lient jamais à la lettre suivante. Elles ne s'attachent qu'à la lettre précédente.
        </p>
      </div>

      <div className="flex gap-4 justify-center" dir="rtl">
        {nonLinking.map((letter, i) => (
          <motion.div
            key={letter}
            initial={{ opacity: 0.3, scale: 0.8 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: illuminated > i
                ? "0 0 20px hsl(var(--primary) / 0.5)"
                : "none",
            }}
            transition={{ delay: i * 0.4 }}
            onAnimationComplete={() => {
              if (illuminated <= i) setIlluminated(i + 1);
            }}
            className={`flex flex-col items-center justify-center h-20 w-20 rounded-2xl border-2 transition-colors ${
              illuminated > i
                ? "border-primary bg-primary/10"
                : "border-border bg-card"
            }`}
          >
            <span className={`font-arabic text-4xl ${illuminated > i ? "text-primary" : "text-foreground"}`}>
              {letter}
            </span>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 max-w-md mx-auto">
        <p className="text-sm text-primary text-center flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4" />
          Astuce : ces lettres se terminent « dans le vide » vers la gauche
        </p>
      </div>

      <Button
        size="lg"
        onClick={onComplete}
        className="gap-2 gradient-emerald border-0 text-primary-foreground"
      >
        Passer aux exercices <ArrowRight className="h-5 w-5" />
      </Button>
    </motion.div>
  );
}

// ─── Main Component ───
export default function Lesson1Screens({ onComplete }: Lesson1ScreensProps) {
  const [screen, setScreen] = useState(0);

  const progressPct = ((screen + 1) / TOTAL_SCREENS) * 100;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Étape {screen + 1}/{TOTAL_SCREENS}</span>
          <span>{Math.round(progressPct)}%</span>
        </div>
        <Progress value={progressPct} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {screen === 0 && <IntroScreen key="intro" onNext={() => setScreen(1)} />}
        {screen === 1 && <LettersScreen key="letters" onNext={() => setScreen(2)} />}
        {screen === 2 && <FamiliesScreen key="families" onNext={() => setScreen(3)} />}
        {screen === 3 && <NonLinkingScreen key="nonlinking" onComplete={onComplete} />}
      </AnimatePresence>
    </div>
  );
}
