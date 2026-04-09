import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, BookOpen, CheckCircle, XCircle, ArrowRight, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Word of the Day pools ──

interface WordEntry {
  arabic: string;
  transliteration: string;
  meaning: string;
  lessonRef: number; // lesson that teaches this word
}

const n1Words: WordEntry[] = [
  { arabic: "كِتَاب", transliteration: "kitâb", meaning: "livre", lessonRef: 6 },
  { arabic: "بَيْت", transliteration: "bayt", meaning: "maison", lessonRef: 6 },
  { arabic: "قَلَم", transliteration: "qalam", meaning: "stylo", lessonRef: 6 },
  { arabic: "بَاب", transliteration: "bâb", meaning: "porte", lessonRef: 5 },
  { arabic: "وَلَد", transliteration: "walad", meaning: "garçon", lessonRef: 6 },
  { arabic: "بِنْت", transliteration: "bint", meaning: "fille", lessonRef: 6 },
  { arabic: "مَاء", transliteration: "mâ'", meaning: "eau", lessonRef: 5 },
  { arabic: "شَمْس", transliteration: "shams", meaning: "soleil", lessonRef: 6 },
  { arabic: "قَمَر", transliteration: "qamar", meaning: "lune", lessonRef: 6 },
  { arabic: "سَمَك", transliteration: "samak", meaning: "poisson", lessonRef: 6 },
  { arabic: "أَب", transliteration: "'ab", meaning: "père", lessonRef: 4 },
  { arabic: "أُمّ", transliteration: "'umm", meaning: "mère", lessonRef: 4 },
  { arabic: "يَد", transliteration: "yad", meaning: "main", lessonRef: 4 },
  { arabic: "عَيْن", transliteration: "'ayn", meaning: "œil", lessonRef: 4 },
  { arabic: "أَرْض", transliteration: "'arḍ", meaning: "terre", lessonRef: 6 },
  // Beginner letters-focused
  { arabic: "بَ", transliteration: "ba", meaning: "syllabe ba (ب + فتحة)", lessonRef: 3 },
  { arabic: "تُ", transliteration: "tu", meaning: "syllabe tu (ت + ضمّة)", lessonRef: 3 },
  { arabic: "سِ", transliteration: "si", meaning: "syllabe si (س + كسرة)", lessonRef: 3 },
  { arabic: "نَ", transliteration: "na", meaning: "syllabe na (ن + فتحة)", lessonRef: 3 },
  { arabic: "كَ", transliteration: "ka", meaning: "syllabe ka (ك + فتحة)", lessonRef: 3 },
];

const n2Words: WordEntry[] = [
  { arabic: "مَدْرَسَة", transliteration: "madrasa", meaning: "école", lessonRef: 2 },
  { arabic: "مُعَلِّم", transliteration: "mu'allim", meaning: "enseignant", lessonRef: 2 },
  { arabic: "طَالِب", transliteration: "ṭâlib", meaning: "étudiant", lessonRef: 2 },
  { arabic: "كَبِير", transliteration: "kabîr", meaning: "grand", lessonRef: 3 },
  { arabic: "صَغِير", transliteration: "ṣaghîr", meaning: "petit", lessonRef: 3 },
  { arabic: "جَمِيل", transliteration: "jamîl", meaning: "beau", lessonRef: 3 },
  { arabic: "يَكْتُبُ", transliteration: "yaktub", meaning: "il écrit", lessonRef: 4 },
  { arabic: "يَقْرَأُ", transliteration: "yaqra'", meaning: "il lit", lessonRef: 4 },
  { arabic: "ذَهَبَ", transliteration: "dhahaba", meaning: "il est allé", lessonRef: 5 },
  { arabic: "أَكَلَ", transliteration: "'akala", meaning: "il a mangé", lessonRef: 5 },
  { arabic: "فِي", transliteration: "fî", meaning: "dans", lessonRef: 6 },
  { arabic: "عَلَى", transliteration: "'alâ", meaning: "sur", lessonRef: 6 },
  { arabic: "هَذَا", transliteration: "hâdhâ", meaning: "ceci (masc.)", lessonRef: 2 },
  { arabic: "هَذِهِ", transliteration: "hâdhihi", meaning: "ceci (fém.)", lessonRef: 2 },
  { arabic: "أَنَا", transliteration: "'anâ", meaning: "je / moi", lessonRef: 7 },
  { arabic: "أَنْتَ", transliteration: "'anta", meaning: "tu (masc.)", lessonRef: 7 },
  { arabic: "هُوَ", transliteration: "huwa", meaning: "il / lui", lessonRef: 7 },
  { arabic: "هِيَ", transliteration: "hiya", meaning: "elle", lessonRef: 7 },
  { arabic: "نَحْنُ", transliteration: "naḥnu", meaning: "nous", lessonRef: 7 },
  { arabic: "كَيْفَ", transliteration: "kayfa", meaning: "comment", lessonRef: 8 },
];

// ── QCM pools ──

interface QCMEntry {
  question: string;
  options: string[];
  correctIndex: number;
  lessonRef: number;
}

const n1QCMs: QCMEntry[] = [
  { question: "Quelle lettre correspond au son « b » ?", options: ["ت", "ب", "ن", "ث"], correctIndex: 1, lessonRef: 1 },
  { question: "L'arabe s'écrit de :", options: ["Gauche à droite", "Droite à gauche", "Haut en bas", "Bas en haut"], correctIndex: 1, lessonRef: 1 },
  { question: "Combien de lettres compte l'alphabet arabe ?", options: ["26", "28", "30", "24"], correctIndex: 1, lessonRef: 1 },
  { question: "Quelle voyelle courte se place AU-DESSUS de la lettre et donne le son « a » ?", options: ["ضمّة (ُ)", "كسرة (ِ)", "فتحة (َ)", "سكون (ْ)"], correctIndex: 2, lessonRef: 3 },
  { question: "La ضمّة (ُ) donne le son :", options: ["a", "i", "u / ou", "o"], correctIndex: 2, lessonRef: 3 },
  { question: "Comment lit-on بَ ?", options: ["bi", "bu", "ba", "ab"], correctIndex: 2, lessonRef: 4 },
  { question: "Le Alif long (ا) allonge la voyelle :", options: ["i", "u", "a", "o"], correctIndex: 2, lessonRef: 5 },
  { question: "Que signifie كِتَاب ?", options: ["maison", "livre", "stylo", "porte"], correctIndex: 1, lessonRef: 6 },
  { question: "Le tanwîn (ـًـٍـٌ) ajoute le son :", options: ["Voyelle longue", "n à la fin du mot", "sh au début", "Rien"], correctIndex: 1, lessonRef: 7 },
  { question: "La shadda (ّ) signifie que la lettre est :", options: ["Silencieuse", "Doublée / renforcée", "Allongée", "Inversée"], correctIndex: 1, lessonRef: 8 },
  { question: "Quelle est la forme isolée de la lettre « Jîm » ?", options: ["ح", "خ", "ج", "چ"], correctIndex: 2, lessonRef: 2 },
  { question: "La lettre « ش » s'appelle :", options: ["Sîn", "Shîn", "Ṣâd", "Sâd"], correctIndex: 1, lessonRef: 1 },
];

const n2QCMs: QCMEntry[] = [
  { question: "Quel est le démonstratif masculin pour « ceci » ?", options: ["هَذِهِ", "هَذَا", "تِلْكَ", "ذَلِكَ"], correctIndex: 1, lessonRef: 2 },
  { question: "Comment dit-on « grand » en arabe ?", options: ["صَغِير", "جَمِيل", "كَبِير", "طَوِيل"], correctIndex: 2, lessonRef: 3 },
  { question: "« يَكْتُبُ » signifie :", options: ["il lit", "il écrit", "il mange", "il dort"], correctIndex: 1, lessonRef: 4 },
  { question: "Le passé de « aller » (ذَهَبَ) est à la forme :", options: ["Présent", "Impératif", "Passé (Mâḍî)", "Futur"], correctIndex: 2, lessonRef: 5 },
  { question: "La préposition « فِي » signifie :", options: ["sur", "dans", "avec", "vers"], correctIndex: 1, lessonRef: 6 },
  { question: "« أَنَا » est le pronom personnel pour :", options: ["tu", "il", "je / moi", "nous"], correctIndex: 2, lessonRef: 7 },
  { question: "Comment demander « comment ? » en arabe ?", options: ["مَاذَا", "أَيْنَ", "كَيْفَ", "مَتَى"], correctIndex: 2, lessonRef: 8 },
  { question: "« مُعَلِّم » signifie :", options: ["étudiant", "enseignant", "directeur", "médecin"], correctIndex: 1, lessonRef: 2 },
  { question: "L'article défini en arabe est :", options: ["إِنَّ", "الـ", "مِنْ", "لَا"], correctIndex: 1, lessonRef: 2 },
  { question: "« هِيَ » est le pronom pour :", options: ["il", "elle", "nous", "vous"], correctIndex: 1, lessonRef: 7 },
];

// ── Component ──

interface DailyExerciseProps {
  level: "niveau_1" | "niveau_2";
  completedLessons: number[];
}

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now.getTime() - start.getTime()) / 86400000);
}

const DailyExercise = ({ level, completedLessons }: DailyExerciseProps) => {
  const isN1 = level === "niveau_1";
  const dayIndex = getDayOfYear();

  // Filter content to only what the student has learned
  const availableWords = useMemo(() => {
    const pool = isN1 ? n1Words : n2Words;
    // If no lessons completed, show the first few basic items
    if (completedLessons.length === 0) return pool.filter(w => w.lessonRef <= 1);
    return pool.filter(w => completedLessons.includes(w.lessonRef));
  }, [isN1, completedLessons]);

  const availableQCMs = useMemo(() => {
    const pool = isN1 ? n1QCMs : n2QCMs;
    if (completedLessons.length === 0) return pool.filter(q => q.lessonRef <= 1);
    return pool.filter(q => completedLessons.includes(q.lessonRef));
  }, [isN1, completedLessons]);

  // Pick today's word and 3 QCMs based on day of year
  const todayWord = availableWords.length > 0
    ? availableWords[dayIndex % availableWords.length]
    : null;

  const todayQCMs = useMemo(() => {
    if (availableQCMs.length === 0) return [];
    const picked: QCMEntry[] = [];
    const used = new Set<number>();
    for (let i = 0; i < Math.min(3, availableQCMs.length); i++) {
      let idx = (dayIndex + i * 7) % availableQCMs.length;
      let attempts = 0;
      while (used.has(idx) && attempts < availableQCMs.length) {
        idx = (idx + 1) % availableQCMs.length;
        attempts++;
      }
      used.add(idx);
      picked.push(availableQCMs[idx]);
    }
    return picked;
  }, [availableQCMs, dayIndex]);

  const [currentStep, setCurrentStep] = useState<"word" | "qcm" | "done">("word");
  const [qcmIndex, setQcmIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);

  const handleAnswer = (optIndex: number) => {
    if (selectedAnswer !== null) return;
    setSelectedAnswer(optIndex);
    setShowExplanation(true);
    if (optIndex === todayQCMs[qcmIndex].correctIndex) {
      setScore(s => s + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    setShowExplanation(false);
    if (qcmIndex + 1 < todayQCMs.length) {
      setQcmIndex(i => i + 1);
    } else {
      setCurrentStep("done");
    }
  };

  if (!todayWord && todayQCMs.length === 0) {
    return (
      <div className="p-6 rounded-xl border border-border bg-card text-center">
        <Sparkles className="h-8 w-8 text-secondary mx-auto mb-2" />
        <p className="text-sm text-muted-foreground">Complète ta première leçon pour débloquer l'exercice du jour !</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-6 rounded-xl border border-secondary/30 bg-gradient-to-br from-secondary/5 to-primary/5"
    >
      <div className="flex items-center gap-2 mb-4">
        <div className="h-8 w-8 rounded-lg gradient-gold flex items-center justify-center">
          <Sparkles className="h-4 w-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-foreground">Exercice du jour</h3>
          <p className="text-xs text-muted-foreground">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {/* ── Word of the Day ── */}
        {currentStep === "word" && todayWord && (
          <motion.div
            key="word"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <p className="text-xs font-semibold text-secondary uppercase tracking-wider">📖 Mot du jour</p>
            <div className="text-center py-4">
              <p className="text-4xl font-arabic text-foreground mb-2" dir="rtl">{todayWord.arabic}</p>
              <p className="text-sm text-muted-foreground italic">{todayWord.transliteration}</p>
              <p className="text-lg font-semibold text-primary mt-1">{todayWord.meaning}</p>
            </div>
            <Button
              onClick={() => setCurrentStep(todayQCMs.length > 0 ? "qcm" : "done")}
              className="w-full gradient-emerald border-0 text-primary-foreground gap-2"
            >
              {todayQCMs.length > 0 ? "Passer au QCM" : "Terminé"} <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}

        {/* ── QCM ── */}
        {currentStep === "qcm" && todayQCMs.length > 0 && (
          <motion.div
            key={`qcm-${qcmIndex}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-secondary uppercase tracking-wider">🧠 Question {qcmIndex + 1}/{todayQCMs.length}</p>
              <p className="text-xs text-muted-foreground">{score} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}</p>
            </div>
            <p className="text-sm font-semibold text-foreground">{todayQCMs[qcmIndex].question}</p>
            <div className="space-y-2">
              {todayQCMs[qcmIndex].options.map((opt, i) => {
                const isCorrect = i === todayQCMs[qcmIndex].correctIndex;
                const isSelected = selectedAnswer === i;
                let optionClass = "p-3 rounded-lg border text-sm cursor-pointer transition-all ";
                if (selectedAnswer === null) {
                  optionClass += "border-border bg-card hover:border-primary/40 text-foreground";
                } else if (isSelected && isCorrect) {
                  optionClass += "border-primary bg-primary/10 text-primary font-semibold";
                } else if (isSelected && !isCorrect) {
                  optionClass += "border-destructive bg-destructive/10 text-destructive";
                } else if (isCorrect) {
                  optionClass += "border-primary/30 bg-primary/5 text-primary";
                } else {
                  optionClass += "border-border bg-card text-muted-foreground opacity-50";
                }
                return (
                  <div key={i} className={optionClass} onClick={() => handleAnswer(i)}>
                    <div className="flex items-center gap-2">
                      {selectedAnswer !== null && isCorrect && <CheckCircle className="h-4 w-4 text-primary shrink-0" />}
                      {selectedAnswer !== null && isSelected && !isCorrect && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                      <span>{opt}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {showExplanation && (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }}>
                <Button onClick={handleNext} className="w-full gradient-emerald border-0 text-primary-foreground gap-2 mt-2">
                  {qcmIndex + 1 < todayQCMs.length ? "Question suivante" : "Voir le résultat"} <ArrowRight className="h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ── Done ── */}
        {currentStep === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-4 space-y-3"
          >
            <div className="text-4xl">
              {score === todayQCMs.length ? "🎉" : score >= todayQCMs.length / 2 ? "👍" : "💪"}
            </div>
            <p className="text-lg font-bold text-foreground">
              {score}/{todayQCMs.length} bonne{score > 1 ? "s" : ""} réponse{score > 1 ? "s" : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {score === todayQCMs.length
                ? "Excellent ! Reviens demain pour un nouvel exercice."
                : "Continue à réviser tes leçons, tu progresseras vite !"}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default DailyExercise;
