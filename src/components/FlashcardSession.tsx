import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, RotateCcw, Zap, Trophy } from "lucide-react";
import { playCorrectSound, playWrongSound, playVictorySound } from "@/utils/sound-feedback";

interface Flashcard {
  letter: string;
  name: string;
  translit: string;
  tip: string;
}

const ALL_CARDS: Flashcard[] = [
  { letter: "ا", name: "Alif", translit: "ā", tip: "Voyelle longue ou support de hamza" },
  { letter: "ب", name: "Bâ", translit: "b", tip: "Comme le B français" },
  { letter: "ت", name: "Tâ", translit: "t", tip: "Comme le T français" },
  { letter: "ث", name: "Thâ", translit: "th", tip: "Comme « th » dans think (anglais)" },
  { letter: "ج", name: "Jîm", translit: "j", tip: "Comme le J français" },
  { letter: "ح", name: "Hâ", translit: "ḥ", tip: "H soufflé fort du fond de la gorge" },
  { letter: "خ", name: "Khâ", translit: "kh", tip: "Comme la jota espagnole ou le R grasseyé" },
  { letter: "د", name: "Dâl", translit: "d", tip: "Comme le D français" },
  { letter: "ذ", name: "Dhâl", translit: "dh", tip: "Comme « th » dans the (anglais)" },
  { letter: "ر", name: "Râ", translit: "r", tip: "R roulé, comme en espagnol" },
  { letter: "ز", name: "Zây", translit: "z", tip: "Comme le Z français" },
  { letter: "س", name: "Sîn", translit: "s", tip: "Comme le S français" },
  { letter: "ش", name: "Chîn", translit: "sh", tip: "Comme CH en français (chat)" },
  { letter: "ص", name: "Sâd", translit: "ṣ", tip: "S emphatique — langue vers le palais" },
  { letter: "ض", name: "Dâd", translit: "ḍ", tip: "D emphatique — la lettre du Coran" },
  { letter: "ط", name: "Tâ'", translit: "ṭ", tip: "T emphatique — langue vers le palais" },
  { letter: "ظ", name: "Dhâ'", translit: "ẓ", tip: "DH emphatique — rare en arabe moderne" },
  { letter: "ع", name: "'Aïn", translit: "ʿ", tip: "Gorge contractée, son unique à l'arabe" },
  { letter: "غ", name: "Ghaïn", translit: "gh", tip: "R grasseyé parisien ou G du fond de gorge" },
  { letter: "ف", name: "Fâ", translit: "f", tip: "Comme le F français" },
  { letter: "ق", name: "Qâf", translit: "q", tip: "K du fond de la gorge (luette)" },
  { letter: "ك", name: "Kâf", translit: "k", tip: "Comme le K français" },
  { letter: "ل", name: "Lâm", translit: "l", tip: "Comme le L français" },
  { letter: "م", name: "Mîm", translit: "m", tip: "Comme le M français" },
  { letter: "ن", name: "Nûn", translit: "n", tip: "Comme le N français" },
  { letter: "ه", name: "Hâ", translit: "h", tip: "H doux aspiré, comme en anglais" },
  { letter: "و", name: "Wâw", translit: "w", tip: "Comme W en anglais ou OU en français" },
  { letter: "ي", name: "Yâ", translit: "y", tip: "Comme Y en français (yeux)" },
];

const SESSION_SIZE = 10;

interface Props {
  weakLetters?: string[];
}

type CardResult = "easy" | "retry";

export default function FlashcardSession({ weakLetters = [] }: Props) {
  const [phase, setPhase] = useState<"idle" | "session" | "done">("idle");
  const [deck, setDeck] = useState<Flashcard[]>([]);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [easyCount, setEasyCount] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const [seen, setSeen] = useState(0);

  const buildDeck = useCallback(() => {
    const weakSet = new Set(weakLetters);
    const weak = ALL_CARDS.filter(c => weakSet.has(c.letter));
    const rest = ALL_CARDS.filter(c => !weakSet.has(c.letter));
    const shuffled = [...weak, ...rest].slice(0, SESSION_SIZE);
    return shuffled;
  }, [weakLetters]);

  const start = () => {
    setDeck(buildDeck());
    setIndex(0);
    setFlipped(false);
    setEasyCount(0);
    setRetryCount(0);
    setSeen(0);
    setPhase("session");
  };

  const current = deck[index];

  const handleEasy = () => {
    playCorrectSound();
    setEasyCount(c => c + 1);
    setSeen(s => s + 1);
    advance();
  };

  const handleRetry = () => {
    playWrongSound();
    setRetryCount(c => c + 1);
    setSeen(s => s + 1);
    setDeck(d => {
      const next = [...d];
      const card = next.splice(index, 1)[0];
      const insertAt = Math.min(index + 2, next.length);
      next.splice(insertAt, 0, card);
      return next;
    });
    setFlipped(false);
  };

  const advance = () => {
    if (index + 1 >= deck.length || seen + 1 >= SESSION_SIZE * 1.5) {
      playVictorySound();
      setPhase("done");
    } else {
      setIndex(i => i + 1);
      setFlipped(false);
    }
  };

  const progress = Math.min(Math.round((seen / SESSION_SIZE) * 100), 100);
  const isWeak = current && new Set(weakLetters).has(current.letter);

  if (phase === "idle") {
    return (
      <div className="flex flex-col items-center gap-6 py-6 text-center">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <span className="text-4xl font-bold text-primary" style={{ fontFamily: "Amiri, serif" }}>ب</span>
        </div>
        <div>
          <h3 className="font-bold text-lg text-foreground mb-1">Flashcards — Alphabet arabe</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {weakLetters.length > 0
              ? `${weakLetters.length} lettre${weakLetters.length > 1 ? "s" : ""} à renforcer — elles passent en premier.`
              : "10 cartes par session, les lettres difficiles repassent automatiquement."}
          </p>
        </div>
        <Button onClick={start} className="gradient-emerald border-0 text-primary-foreground px-8">
          <Zap className="h-4 w-4 mr-2" /> Commencer
        </Button>
      </div>
    );
  }

  if (phase === "done") {
    const pct = Math.round((easyCount / (easyCount + retryCount)) * 100) || 0;
    return (
      <div className="flex flex-col items-center gap-5 py-6 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-500/10 flex items-center justify-center">
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <div>
          <h3 className="font-bold text-xl text-foreground mb-1">Session terminée !</h3>
          <p className="text-sm text-muted-foreground">
            {pct >= 80 ? "Excellent travail, continuez comme ça !" : "Continuez à réviser, vous progressez !"}
          </p>
        </div>
        <div className="flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold text-green-600">{easyCount}</p>
            <p className="text-xs text-muted-foreground">Facile</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-600">{retryCount}</p>
            <p className="text-xs text-muted-foreground">À revoir</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-primary">{pct}%</p>
            <p className="text-xs text-muted-foreground">Score</p>
          </div>
        </div>
        <Button onClick={start} variant="outline" className="gap-2">
          <RotateCcw className="h-4 w-4" /> Nouvelle session
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>Carte {Math.min(seen + 1, SESSION_SIZE)} / {SESSION_SIZE}</span>
        <span className="flex items-center gap-2">
          <span className="text-green-600 font-medium">✓ {easyCount}</span>
          <span className="text-amber-600 font-medium">↺ {retryCount}</span>
        </span>
      </div>
      <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${index}-${flipped}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className="cursor-pointer"
          onClick={() => !flipped && setFlipped(true)}
        >
          <div className={`rounded-2xl border-2 p-8 text-center min-h-[200px] flex flex-col items-center justify-center gap-3 transition-colors ${
            flipped
              ? "bg-primary/5 border-primary/30"
              : "bg-card border-border hover:border-primary/40 hover:bg-primary/3"
          }`}>
            {isWeak && !flipped && (
              <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px] mb-1">
                ⚠ lettre difficile
              </Badge>
            )}
            <p
              className="text-7xl font-bold text-primary"
              dir="rtl"
              style={{ fontFamily: "Amiri, serif", lineHeight: 1.2 }}
            >
              {current?.letter}
            </p>

            {!flipped && (
              <p className="text-xs text-muted-foreground mt-2">Appuyez pour révéler</p>
            )}

            {flipped && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-1 text-center"
              >
                <p className="text-2xl font-bold text-foreground">{current?.name}</p>
                <p className="text-base text-primary font-mono">/{current?.translit}/</p>
                <p className="text-sm text-muted-foreground max-w-xs mt-1">{current?.tip}</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Actions */}
      {flipped ? (
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="border-amber-300 text-amber-700 hover:bg-amber-50 gap-2"
            onClick={handleRetry}
          >
            <RotateCcw className="h-4 w-4" /> À revoir
          </Button>
          <Button
            className="bg-green-600 hover:bg-green-700 text-white gap-2"
            onClick={handleEasy}
          >
            <CheckCircle2 className="h-4 w-4" /> Facile
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setFlipped(true)}
        >
          Révéler la réponse
        </Button>
      )}
    </div>
  );
}
