import { useState, useRef, useMemo, useEffect } from "react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, ArrowRight, BookOpen, Brain, PenTool,
  CheckCircle, XCircle, Trophy, RotateCcw, Volume2, MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { Lesson, TheorySection } from "@/data/niveau1-lessons";
import { useArabicSpeech } from "@/hooks/use-arabic-speech";
import { getIllustration } from "@/utils/vocabulary-illustrations";
import { useIsAdmin } from "@/hooks/use-admin";
import { playCorrectSound, playWrongSound } from "@/utils/sound-feedback";
import { usePersistentState, userScopedKey } from "@/hooks/use-persistent-state";
import { useAuth } from "@/contexts/AuthContext";
import { getOrCreateShuffledOrder, clearShuffledOrder } from "@/utils/shuffle";
import LessonAudioPlayer from "./LessonAudioPlayer";
import Lesson1Screens from "./Lesson1Screens";
import LessonScreens from "./LessonScreens";
import { dedupeNiveau1 } from "@/utils/lesson-dedupe";
import AudioClipRecorder from "@/components/admin/AudioClipRecorder";
import { useTeacherAudioClips } from "@/hooks/use-teacher-audio-clips";

interface LessonDetailProps {
  lesson: Lesson;
  onBack: () => void;
  onComplete: (lessonId: number) => void;
  nextLessonId?: number | null;
  onNextLesson?: (lessonId: number) => void;
  maxLessons?: number;
}

function TheorySectionView({ section }: { section: TheorySection }) {
  const { speak } = useArabicSpeech();
  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-4">
      <h4 className="font-semibold text-foreground text-lg">{section.title}</h4>
      <div className="text-sm text-muted-foreground whitespace-pre-line leading-relaxed">
        {section.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
          part.startsWith("**") && part.endsWith("**")
            ? <strong key={i} className="text-foreground font-arabic">{part.slice(2, -2)}</strong>
            : <span key={i}>{part}</span>
        )}
      </div>
      {section.tip && <div className="p-3 rounded-lg bg-primary/5 border border-primary/20"><p className="text-sm text-primary">💡 {section.tip}</p></div>}
      {section.letterGrid && (
        <div className="grid grid-cols-4 sm:grid-cols-7 gap-2" dir="rtl">
          {section.letterGrid.map((l, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.02 }}
              onClick={() => speak(l.letter)} className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-muted hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group">
              <span className="font-arabic text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors">{l.letter}</span>
              <span className="text-[10px] text-muted-foreground mt-1">{l.name}</span>
              <Volume2 className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity mt-0.5" />
            </motion.div>
          ))}
        </div>
      )}
      {section.formsTable && (
        <div className="overflow-x-auto">
          <table className="w-full text-center">
            <thead><tr className="border-b border-border">{["Lettre","Seule","Début","Milieu","Fin"].map(h => <th key={h} className="py-2 text-xs text-muted-foreground">{h}</th>)}</tr></thead>
            <tbody>
              {section.formsTable.map((row, i) => (
                <tr key={i} className="border-b border-border/50 hover:bg-muted/50">
                  <td className="py-2 text-xs text-muted-foreground">{row.name}</td>
                  {[row.isolated, row.initial, row.medial, row.final].map((v, j) => <td key={j} className="py-2 font-arabic text-xl text-foreground">{v}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {section.arabicExamples && (
        <div className="space-y-2">
          {section.arabicExamples.map((ex, i) => {
            const illustration = getIllustration(ex.meaning);
            return (
              <div key={i} onClick={() => speak(ex.arabic)} className="flex items-center justify-between p-3 rounded-lg bg-muted cursor-pointer hover:bg-primary/10 transition-colors">
                <div className="flex items-center gap-2"><Volume2 className="h-4 w-4 text-muted-foreground shrink-0" /><p className="font-arabic text-2xl text-foreground">{ex.arabic}</p></div>
                <div className="flex items-center gap-2"><p className="text-sm text-foreground font-medium">{ex.meaning}</p>{illustration && (illustration.startsWith('/') ? <img src={illustration} alt={ex.meaning} className="w-10 h-10 object-contain rounded" loading="lazy" /> : <span className="text-2xl" role="img">{illustration}</span>)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function LessonTab({ lesson }: { lesson: Lesson }) {
  const { isAdmin } = useIsAdmin();
  const fallbackText = (lesson.theory || [])
    .flatMap((s) => (s.arabicExamples || []).map((e) => e.arabic))
    .filter(Boolean)
    .join(" - ");
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <LessonAudioPlayer level="niveau_1" lessonNumber={lesson.id} isTeacher={false} fallbackText={fallbackText} />
      {lesson.videoUrl && (
        <div className="rounded-xl overflow-hidden border border-border bg-card"><div className="aspect-video">
          {lesson.videoUrl.includes("youtube.com") || lesson.videoUrl.includes("youtu.be")
            ? <iframe src={lesson.videoUrl.replace("watch?v=", "embed/").replace("youtu.be/", "youtube.com/embed/")} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
            : <video src={lesson.videoUrl} controls className="w-full h-full object-cover" />}
        </div></div>
      )}
      {(lesson.theory || []).map((section, i) => <TheorySectionView key={i} section={section} />)}
    </motion.div>
  );
}

interface WrongAnswer { question: string; userAnswer: string; correctAnswer: string; originalIdx?: number; }

function QCMTab({ lesson, onAllCorrect, onSwitchToDictation }: { lesson: Lesson; onAllCorrect: () => void; onSwitchToDictation?: () => void }) {
  const { user } = useAuth();
  const qcmList = lesson.qcm || [];
  const baseKey = userScopedKey(user?.id, `n1:lesson:${lesson.id}:qcm`);
  const shuffleKey = `${baseKey}:order`;
  const [resetKey, setResetKey] = useState(0);
  const shuffledOrder = useMemo(() => getOrCreateShuffledOrder(shuffleKey, qcmList.length), [shuffleKey, qcmList.length, resetKey]);
  const shuffledList = useMemo(() => shuffledOrder.map(i => qcmList[i]), [shuffledOrder, qcmList]);

  const [retryIndices, setRetryIndices] = useState<number[] | null>(null);
  const activeList = retryIndices !== null ? retryIndices.map(i => qcmList[i]) : shuffledList;

  const [current, setCurrent] = usePersistentState<number>(`${baseKey}:current`, 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = usePersistentState<number>(`${baseKey}:score`, 0);
  const [finished, setFinished] = usePersistentState<boolean>(`${baseKey}:finished`, false);
  const [wrongAnswers, setWrongAnswers] = usePersistentState<WrongAnswer[]>(`${baseKey}:wrong`, []);
  const [shaking, setShaking] = useState(false);
  const [praiseVisible, setPraiseVisible] = useState(false);
  const [praiseWord, setPraiseWord] = useState("");

  const PRAISES = ["أحسنت !", "ممتاز !", "ماشاء الله !", "رائع !"];
  const triggerPraise = () => {
    setPraiseWord(PRAISES[Math.floor(Math.random() * PRAISES.length)]);
    setPraiseVisible(true);
    setTimeout(() => setPraiseVisible(false), 1100);
  };
  const triggerShake = () => { setShaking(true); setTimeout(() => setShaking(false), 500); };

  const onAllCorrectRef = useRef(onAllCorrect);
  onAllCorrectRef.current = onAllCorrect;

  useEffect(() => {
    if (!finished || activeList.length === 0) return;
    const pct = Math.round((score / activeList.length) * 100);
    if (pct >= 80) {
      onAllCorrectRef.current();
      setTimeout(() => confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 }, colors: ["#059669","#10b981","#fbbf24","#f59e0b"] }), 250);
    }
  }, [finished, score, activeList.length]);

  if (activeList.length === 0) return <p className="text-center text-muted-foreground p-4">Aucun exercice disponible.</p>;
  const q = activeList[Math.min(current, activeList.length - 1)];

  // Support réponses multiples
  const [multiSelected, setMultiSelected] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const correctIndexes = q.correctIndexes && q.correctIndexes.length > 1 ? q.correctIndexes : null;
  const isMulti = correctIndexes !== null;
  const isAnswered = isMulti ? submitted : selected !== null;

  const handleSelect = (idx: number) => {
    if (isAnswered) return;
    if (isMulti) {
      setMultiSelected(prev => prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]);
    } else {
      setSelected(idx);
      if (idx === q.correctIndex) { setScore(s => s + 1); playCorrectSound(); triggerPraise(); }
      else {
        playWrongSound(); triggerShake();
        const origIdx = retryIndices !== null ? retryIndices[current] : shuffledOrder[current];
        setWrongAnswers(prev => [...prev, { question: q.question, userAnswer: q.options[idx], correctAnswer: q.options[q.correctIndex], originalIdx: origIdx }]);
      }
    }
  };

  const handleSubmitMulti = () => {
    if (!isMulti || submitted) return;
    setSubmitted(true);
    const correct = correctIndexes!;
    const isCorrect = correct.length === multiSelected.length && correct.every(i => multiSelected.includes(i));
    if (isCorrect) { setScore(s => s + 1); playCorrectSound(); triggerPraise(); }
    else {
      playWrongSound(); triggerShake();
      const origIdx = retryIndices !== null ? retryIndices[current] : shuffledOrder[current];
      setWrongAnswers(prev => [...prev, {
        question: q.question,
        userAnswer: multiSelected.map(i => q.options[i]).join(', '),
        correctAnswer: correct.map(i => q.options[i]).join(', '),
        originalIdx: origIdx,
      }]);
    }
  };

  const next = () => {
    if (current + 1 >= activeList.length) setFinished(true);
    else { setCurrent(c => c + 1); setSelected(null); setMultiSelected([]); setSubmitted(false); }
  };

  const reset = () => {
    clearShuffledOrder(shuffleKey);
    setResetKey(k => k + 1);
    setRetryIndices(null);
    setCurrent(0); setSelected(null); setMultiSelected([]); setSubmitted(false); setScore(0); setFinished(false); setWrongAnswers([]);
  };

  const retryWrong = () => {
    const indices = wrongAnswers.map(wa => wa.originalIdx).filter((i): i is number => i !== undefined);
    if (indices.length === 0) { reset(); return; }
    setRetryIndices(indices);
    setCurrent(0); setSelected(null); setMultiSelected([]); setSubmitted(false); setScore(0); setFinished(false); setWrongAnswers([]);
  };

  if (finished) {
    const pct = Math.round((score / activeList.length) * 100);
    const passed = pct >= 80;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl border border-border bg-card text-center space-y-4">
        <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 15 }}>
          <Trophy className="h-16 w-16 mx-auto text-secondary" />
        </motion.div>
        <motion.h3 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-2xl font-bold text-foreground">Exercices terminés !</motion.h3>
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="text-lg text-muted-foreground">Score : <span className="font-bold text-primary">{score}</span> / {activeList.length} ({pct}%)</motion.p>
        <Progress value={pct} className="h-3 max-w-xs mx-auto" />
        <p className="text-sm text-muted-foreground">{passed ? (score === activeList.length ? "Parfait ! 🎉" : "Très bien ! 👏") : "Encore un petit effort ! Il faut 80% pour passer à la suite. 💪"}</p>
        {wrongAnswers.length > 0 && (
          <div className="text-left mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">❌ Questions ratées :</h4>
            {wrongAnswers.map((wa, i) => (
              <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm">
                <p className="font-medium text-foreground">{wa.question}</p>
                <p className="text-destructive">Ta réponse : {wa.userAnswer}</p>
                <p className="text-primary">Bonne réponse : {wa.correctAnswer}</p>
              </div>
            ))}
          </div>
        )}
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Button onClick={reset} variant="outline" className="gap-2"><RotateCcw className="h-4 w-4" /> Tout recommencer</Button>
          {!passed && wrongAnswers.length > 0 && (
            <Button onClick={retryWrong} className="gap-2"><RotateCcw className="h-4 w-4" /> Rejouer les erreurs ({wrongAnswers.length})</Button>
          )}
          {passed && onSwitchToDictation && <Button onClick={onSwitchToDictation} className="gap-2"><PenTool className="h-4 w-4" /> Passer à la Dictée</Button>}
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Question {current + 1} / {activeList.length}{retryIndices !== null && <span className="text-xs ml-1 text-primary">(révision)</span>}</span>
          <span>Score : {score}</span>
        </div>
        <Progress value={Math.round((current / activeList.length) * 100)} className="h-2" />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={current} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card relative overflow-hidden">
          <p className="text-lg font-medium text-foreground mb-1">{q.question}</p>
          {isMulti && <p className="text-xs text-primary mb-3">Sélectionnez toutes les bonnes réponses</p>}
          <AnimatePresence>
            {praiseVisible && (
              <motion.div
                initial={{ opacity: 1, y: 8, scale: 0.7 }}
                animate={{ opacity: 0, y: -45, scale: 1.2 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute inset-x-0 top-2 flex justify-center pointer-events-none z-20"
              >
                <span className="font-arabic text-3xl font-bold text-primary drop-shadow-md" dir="rtl">{praiseWord}</span>
              </motion.div>
            )}
          </AnimatePresence>
          <motion.div
            animate={shaking ? { x: [-8, 8, -6, 6, -3, 3, 0] } : { x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="grid grid-cols-2 gap-3">
              {q.options.map((opt, idx) => {
                let cls = "border border-border bg-background hover:bg-muted";
                if (isMulti) {
                  const isCorrect = correctIndexes!.includes(idx);
                  const isChosen = multiSelected.includes(idx);
                  if (submitted) {
                    if (isCorrect) cls = "border-primary bg-primary/10 text-primary";
                    else if (isChosen) cls = "border-destructive bg-destructive/10 text-destructive";
                  } else if (isChosen) cls = "border-primary bg-primary/10 text-primary";
                } else {
                  if (selected !== null) { if (idx === q.correctIndex) cls = "border-primary bg-primary/10 text-primary"; else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive"; }
                }
                return (
                  <motion.button
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    disabled={isAnswered}
                    whileTap={!isAnswered ? { scale: 0.96 } : {}}
                    animate={selected === idx && idx === q.correctIndex ? { scale: [1, 1.07, 1] } : {}}
                    transition={{ duration: 0.3 }}
                    className={`p-4 rounded-lg text-base font-medium transition-all ${cls}`}
                  >
                    {opt}
                    {isMulti && submitted && correctIndexes!.includes(idx) && <CheckCircle className="h-4 w-4 inline ml-2" />}
                    {isMulti && submitted && !correctIndexes!.includes(idx) && multiSelected.includes(idx) && <XCircle className="h-4 w-4 inline ml-2" />}
                    {!isMulti && selected !== null && idx === q.correctIndex && <CheckCircle className="h-4 w-4 inline ml-2" />}
                    {!isMulti && selected !== null && idx === selected && idx !== q.correctIndex && <XCircle className="h-4 w-4 inline ml-2" />}
                  </motion.button>
                );
              })}
            </div>
            {isMulti && !submitted && (
              <Button onClick={handleSubmitMulti} disabled={multiSelected.length === 0} className="w-full mt-3 gap-2">
                <CheckCircle className="h-4 w-4" /> Valider mes réponses
              </Button>
            )}
          </motion.div>
          {isAnswered && <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-lg bg-muted text-sm text-muted-foreground">{q.explanation}</motion.div>}
        </motion.div>
      </AnimatePresence>
      {isAnswered && <div className="flex justify-end"><Button onClick={next} className="gap-2">{current + 1 >= activeList.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" /></Button></div>}
    </div>
  );
}

function DictationTab({ lesson, onAllCorrect }: { lesson: Lesson; onAllCorrect: () => void }) {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { clips, uploadClip, deleteClip } = useTeacherAudioClips("niveau_1", lesson.id);
  const clipMap = new Map(clips.map(c => [c.audio_key, c.audio_url]));
  const dictList = lesson.dictation || [];
  const baseKey = userScopedKey(user?.id, `n1:lesson:${lesson.id}:dict`);
  const shuffleKey = `${baseKey}:order`;
  const [resetKey, setResetKey] = useState(0);
  const shuffledOrder = useMemo(() => getOrCreateShuffledOrder(shuffleKey, dictList.length), [shuffleKey, dictList.length, resetKey]);
  const shuffledList = useMemo(() => shuffledOrder.map(i => dictList[i]), [shuffledOrder, dictList]);

  const [current, setCurrent] = usePersistentState<number>(`${baseKey}:current`, 0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = usePersistentState<number>(`${baseKey}:score`, 0);
  const [finished, setFinished] = usePersistentState<boolean>(`${baseKey}:finished`, false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = usePersistentState<"qcm" | "keyboard">(`${baseKey}:mode`, "qcm");
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerChecked, setAnswerChecked] = useState(false);
  const [answerCorrect, setAnswerCorrect] = useState(false);
  const [wrongAnswers, setWrongAnswers] = usePersistentState<WrongAnswer[]>(`${baseKey}:wrong`, []);
  const [shakingD, setShakingD] = useState(false);
  const [praiseVisibleD, setPraiseVisibleD] = useState(false);
  const [praiseWordD, setPraiseWordD] = useState("");
  const { speak, stop: stopSpeech } = useArabicSpeech();

  const PRAISES_D = ["أحسنت !", "ممتاز !", "ماشاء الله !", "رائع !"];
  const triggerPraiseD = () => {
    setPraiseWordD(PRAISES_D[Math.floor(Math.random() * PRAISES_D.length)]);
    setPraiseVisibleD(true);
    setTimeout(() => setPraiseVisibleD(false), 1100);
  };
  const triggerShakeD = () => { setShakingD(true); setTimeout(() => setShakingD(false), 500); };

  const onAllCorrectRef = useRef(onAllCorrect);
  onAllCorrectRef.current = onAllCorrect;

  const isEmpty = shuffledList.length === 0;
  const d = isEmpty ? null : shuffledList[Math.min(current, shuffledList.length - 1)];
  const correctArabic = d ? d.options[d.correctIndex] : "";

  useEffect(() => {
    if (isEmpty || !correctArabic) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      if (cancelled) return;
      setIsPlaying(true);
      try { stopSpeech(); await speak(correctArabic, 0.75); }
      catch (e) { console.warn("Dictation playback failed:", e); }
      finally { if (!cancelled) setIsPlaying(false); }
    }, 400);
    return () => { cancelled = true; clearTimeout(timer); };
  }, [current, correctArabic]);

  useEffect(() => {
    if (!finished || shuffledList.length === 0) return;
    const pct = Math.round((score / shuffledList.length) * 100);
    if (pct >= 80) {
      onAllCorrectRef.current();
      setTimeout(() => confetti({ particleCount: 90, spread: 90, origin: { y: 0.6 }, colors: ["#059669","#10b981","#fbbf24","#f59e0b"] }), 250);
    }
  }, [finished, score, shuffledList.length]);

  if (isEmpty || !d) return <p className="text-center text-muted-foreground p-4">Aucune dictée disponible.</p>;

  const playDictation = async () => {
    if (!correctArabic) return;
    setIsPlaying(true);
    try { stopSpeech(); await speak(correctArabic, 0.75); } catch (e) { console.warn("Dictation playback failed:", e); } finally { setIsPlaying(false); }
  };

  const handleSelect = (idx: number) => {
    if (selected !== null) return; setSelected(idx);
    if (idx === d.correctIndex) { setScore(s => s + 1); playCorrectSound(); triggerPraiseD(); }
    else { playWrongSound(); triggerShakeD(); setWrongAnswers(prev => [...prev, { question: `Mot ${current + 1}`, userAnswer: d.options[idx], correctAnswer: correctArabic }]); }
  };
  const handleCheckTyped = () => {
    if (answerChecked || !correctArabic) return;
    const isCorrect = typedAnswer.trim() === correctArabic.trim();
    setAnswerChecked(true); setAnswerCorrect(isCorrect);
    if (isCorrect) { setScore(s => s + 1); playCorrectSound(); triggerPraiseD(); }
    else { playWrongSound(); triggerShakeD(); setWrongAnswers(prev => [...prev, { question: `Mot ${current + 1}`, userAnswer: typedAnswer.trim(), correctAnswer: correctArabic }]); }
  };
  const next = () => {
    if (current + 1 >= shuffledList.length) setFinished(true);
    else { setCurrent(c => c + 1); setSelected(null); setTypedAnswer(""); setAnswerChecked(false); setAnswerCorrect(false); }
  };
  const reset = () => {
    clearShuffledOrder(shuffleKey);
    setResetKey(k => k + 1);
    setCurrent(0); setSelected(null); setScore(0); setFinished(false);
    setTypedAnswer(""); setAnswerChecked(false); setAnswerCorrect(false); setWrongAnswers([]);
  };
  const canAdvance = mode === "qcm" ? selected !== null : answerChecked;

  if (finished) {
    const pct = Math.round((score / shuffledList.length) * 100);
    const passed = pct >= 80;
    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-8 rounded-xl border border-border bg-card text-center space-y-4">
        <Trophy className="h-16 w-16 mx-auto text-secondary" />
        <h3 className="text-2xl font-bold text-foreground">Dictée terminée !</h3>
        <p className="text-lg text-muted-foreground">Score : <span className="font-bold text-primary">{score}</span> / {shuffledList.length} ({pct}%)</p>
        <Progress value={pct} className="h-3 max-w-xs mx-auto" />
        <p className="text-sm text-muted-foreground">{passed ? (score === shuffledList.length ? "Excellent ! 🎉" : "Très bien ! 👏") : "Encore un petit effort ! Il faut 80% pour passer à la suite. 💪"}</p>
        {wrongAnswers.length > 0 && (
          <div className="text-left mt-4 space-y-2">
            <h4 className="text-sm font-semibold text-foreground">❌ Mots ratés :</h4>
            {wrongAnswers.map((wa, i) => (
              <div key={i} className="p-3 rounded-lg bg-destructive/5 border border-destructive/10 text-sm">
                <p className="text-destructive">Ta réponse : <span className="font-arabic text-lg">{wa.userAnswer || "—"}</span></p>
                <p className="text-primary">Bonne réponse : <span className="font-arabic text-lg">{wa.correctAnswer}</span></p>
              </div>
            ))}
          </div>
        )}
        <Button onClick={reset} className="gap-2"><RotateCcw className="h-4 w-4" /> Recommencer</Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm text-muted-foreground"><span>Mot {current + 1} / {shuffledList.length}</span><span>Score : {score}</span></div>
        <Progress value={Math.round((current / shuffledList.length) * 100)} className="h-2" />
      </div>
      <div className="flex justify-center gap-2">
        <Button variant={mode === "qcm" ? "default" : "outline"} size="sm" onClick={() => setMode("qcm")} className="gap-1.5 text-xs"><Brain className="h-3.5 w-3.5" /> QCM</Button>
        <Button variant={mode === "keyboard" ? "default" : "outline"} size="sm" onClick={() => setMode("keyboard")} className="gap-1.5 text-xs"><PenTool className="h-3.5 w-3.5" /> Écriture</Button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={`${current}-${mode}`} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} className="p-6 rounded-xl border border-border bg-card">
          <p className="text-center text-muted-foreground mb-2 text-sm">Écoutez et {mode === "qcm" ? "choisissez" : "écrivez"} le bon mot :</p>
          <div className="flex justify-center mb-6">
            <Button variant="outline" size="lg" onClick={playDictation} disabled={isPlaying} className="gap-3 rounded-full px-8 py-6 text-lg border-primary/30 hover:bg-primary/10">
              <Volume2 className={`h-6 w-6 ${isPlaying ? "animate-pulse text-primary" : "text-muted-foreground"}`} />{isPlaying ? "Lecture..." : "🔊 Écouter"}
            </Button>
          </div>
          {mode === "qcm" ? (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                {d.options.map((opt, idx) => {
                  let cls = "border border-border bg-background hover:bg-muted";
                  if (selected !== null) { if (idx === d.correctIndex) cls = "border-primary bg-primary/10 text-primary"; else if (idx === selected) cls = "border-destructive bg-destructive/10 text-destructive"; }
                  return (
                    <button key={idx} onClick={() => handleSelect(idx)} disabled={selected !== null} className={`p-4 rounded-lg font-arabic text-2xl transition-all ${cls}`}>
                      {opt}
                      {selected !== null && idx === d.correctIndex && <CheckCircle className="h-4 w-4 inline ml-2" />}
                      {selected !== null && idx === selected && idx !== d.correctIndex && <XCircle className="h-4 w-4 inline ml-2" />}
                    </button>
                  );
                })}
              </div>
              {selected !== null && selected !== d.correctIndex && (
                <p className="text-xs text-center text-muted-foreground">Translitération : <span className="font-medium text-foreground">{d.transliteration}</span></p>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <input type="text" dir="rtl" value={typedAnswer} onChange={(e) => setTypedAnswer(e.target.value)} disabled={answerChecked}
                placeholder="اكتب الإجابة هنا..."
                className="w-full p-4 rounded-lg border border-border bg-background font-arabic text-3xl text-center focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
                onKeyDown={(e) => { if (e.key === "Enter" && typedAnswer.trim()) handleCheckTyped(); }} />
              {!answerChecked && <Button onClick={handleCheckTyped} disabled={!typedAnswer.trim()} className="w-full gap-2"><CheckCircle className="h-4 w-4" /> Vérifier</Button>}
              {answerChecked && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  className={`p-3 rounded-lg text-sm text-center ${answerCorrect ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                  {answerCorrect
                    ? <span className="flex items-center justify-center gap-2"><CheckCircle className="h-4 w-4" /> Correct ! 🎉</span>
                    : <span className="flex flex-col items-center gap-1">
                        <span className="flex items-center gap-2"><XCircle className="h-4 w-4" /> Incorrect</span>
                        <span className="font-arabic text-xl">Réponse : {correctArabic}</span>
                        <span className="text-xs text-muted-foreground">({d.transliteration})</span>
                      </span>}
                </motion.div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      {canAdvance && <div className="flex justify-end"><Button onClick={next} className="gap-2">{current + 1 >= shuffledList.length ? "Voir le résultat" : "Suivant"} <ArrowRight className="h-4 w-4" /></Button></div>}
      {isAdmin && d?.word && (
        <div className="p-3 rounded-lg border border-dashed border-primary/30 bg-primary/5 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">🎙 Admin — audio :</span>
          <span className="font-arabic text-base text-foreground">{d.word}</span>
          <AudioClipRecorder
            audioKey={d.word}
            existingUrl={clipMap.get(d.word)}
            onSave={async (key, blob) => { if (user) await uploadClip(key, blob, user.id); }}
            onDelete={deleteClip}
          />
        </div>
      )}
    </div>
  );
}

const LessonDetail = ({ lesson: rawLesson, onBack, onComplete, nextLessonId, onNextLesson, maxLessons = Infinity }: LessonDetailProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  // Dédup inter-modules : une même question / mot ne doit apparaître qu'une seule fois
  const lesson = useMemo(() => {
    const { qcm, dictation } = dedupeNiveau1(rawLesson.qcm || [], rawLesson.dictation || []);
    return { ...rawLesson, qcm, dictation } as Lesson;
  }, [rawLesson]);
  const baseKey = userScopedKey(user?.id, `n1:lesson:${lesson.id}`);
  const [exercisesCompleted, setExercisesCompleted] = usePersistentState<boolean>(`${baseKey}:exDone`, false);
  const [dictationCompleted, setDictationCompleted] = usePersistentState<boolean>(`${baseKey}:dictDone`, false);
  const [activeTab, setActiveTab] = usePersistentState<string>(`${baseKey}:tab`, "lesson");
  const [theoryCompleted, setTheoryCompleted] = usePersistentState<boolean>(`${baseKey}:theoryDone`, false);
  const { isAdmin } = useIsAdmin();

  const handleComplete = () => { onComplete(lesson.id); if (!nextLessonId || !onNextLesson) onBack(); };
  const adminSkip = () => { setTheoryCompleted(true); setExercisesCompleted(true); setDictationCompleted(true); };
  const allDone = exercisesCompleted && dictationCompleted;
  const completedSteps = [theoryCompleted, exercisesCompleted, dictationCompleted].filter(Boolean).length;

  const handleTabChange = (tab: string) => {
    if (!isAdmin) {
      if ((tab === "exercises" || tab === "dictation") && !theoryCompleted) return;
      if (tab === "dictation" && !exercisesCompleted) return;
    }
    setActiveTab(tab);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2"><ArrowLeft className="h-4 w-4" /> Retour</Button>
        <div className="text-right">
          <h2 className="text-lg font-bold text-foreground">{lesson.icon} Leçon {lesson.id} : {lesson.title}</h2>
          <p className="text-xs text-muted-foreground">{lesson.subtitle}</p>
        </div>
      </div>
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs text-muted-foreground"><span>Progression de la leçon</span><span>{completedSteps}/3 étapes</span></div>
        <Progress value={Math.round((completedSteps / 3) * 100)} className="h-2" />
      </div>
      {isAdmin && !allDone && <Button variant="outline" size="sm" onClick={adminSkip} className="text-xs text-muted-foreground border-dashed">⚡ Passer [admin]</Button>}

      <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="bg-muted w-full grid grid-cols-3">
          <TabsTrigger value="lesson" className="gap-1.5 text-xs sm:text-sm"><BookOpen className="h-4 w-4" /> Leçon {theoryCompleted && <CheckCircle className="h-3 w-3 text-primary" />}</TabsTrigger>
          <TabsTrigger value="exercises" className="gap-1.5 text-xs sm:text-sm" disabled={!isAdmin && !theoryCompleted}><Brain className="h-4 w-4" /> Exercices {exercisesCompleted && <CheckCircle className="h-3 w-3 text-primary" />}</TabsTrigger>
          <TabsTrigger value="dictation" className="gap-1.5 text-xs sm:text-sm" disabled={!isAdmin && (!theoryCompleted || !exercisesCompleted)}><PenTool className="h-4 w-4" /> Dictée {dictationCompleted && <CheckCircle className="h-3 w-3 text-primary" />}</TabsTrigger>
        </TabsList>

        <TabsContent value="lesson">
          {!theoryCompleted
            ? lesson.id === 1
              ? <Lesson1Screens onComplete={() => { setTheoryCompleted(true); setActiveTab("exercises"); }} />
              : <LessonScreens lesson={lesson} onComplete={() => { setTheoryCompleted(true); setActiveTab("exercises"); }} />
            : <div className="p-6 rounded-xl border border-primary/30 bg-primary/5 text-center space-y-3">
                <CheckCircle className="h-10 w-10 mx-auto text-primary" />
                <p className="text-foreground font-semibold">Leçon terminée ! ✅</p>
                <p className="text-sm text-muted-foreground">Passe aux exercices pour continuer.</p>
                <Button onClick={() => setActiveTab("exercises")} className="gap-2"><Brain className="h-4 w-4" /> Aller aux exercices</Button>
              </div>}
        </TabsContent>
        <TabsContent value="exercises">
          {!theoryCompleted
            ? <div className="p-6 rounded-xl border border-border bg-card text-center space-y-3">
                <p className="text-foreground font-medium">🔒 Terminez la leçon pour débloquer les exercices</p>
                <Button variant="outline" onClick={() => setActiveTab("lesson")} className="gap-2"><BookOpen className="h-4 w-4" /> Retour à la leçon</Button>
              </div>
            : <QCMTab lesson={lesson} onAllCorrect={() => setExercisesCompleted(true)} onSwitchToDictation={() => setActiveTab("dictation")} />}
        </TabsContent>
        <TabsContent value="dictation">
          {!theoryCompleted || !exercisesCompleted
            ? <div className="p-6 rounded-xl border border-border bg-card text-center space-y-3">
                <p className="text-foreground font-medium">{!theoryCompleted ? "🔒 Terminez la leçon pour débloquer la dictée" : "🔒 Obtenez au moins 80% aux exercices pour débloquer la dictée"}</p>
                <Button variant="outline" onClick={() => setActiveTab(!theoryCompleted ? "lesson" : "exercises")} className="gap-2">
                  {!theoryCompleted ? <><BookOpen className="h-4 w-4" /> Retour à la leçon</> : <><Brain className="h-4 w-4" /> Retour aux exercices</>}
                </Button>
              </div>
            : <DictationTab lesson={lesson} onAllCorrect={() => setDictationCompleted(true)} />}
        </TabsContent>
      </Tabs>

      {allDone && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-primary bg-primary/10 space-y-3">
          <p className="text-foreground font-semibold text-center">🎉 Leçon complète !</p>
          <div className="flex flex-wrap justify-center gap-2">
            {nextLessonId && onNextLesson
              ? nextLessonId <= maxLessons
                ? <Button onClick={() => { handleComplete(); onNextLesson(nextLessonId); }} className="gap-2">Leçon suivante <ArrowRight className="h-4 w-4" /></Button>
                : <a href="/tarifs"><Button variant="secondary" className="gap-2">🔒 Passez au plan Essentiel pour continuer <ArrowRight className="h-4 w-4" /></Button></a>
              : <Button onClick={handleComplete} className="gap-2"><CheckCircle className="h-4 w-4" /> Terminer</Button>}
            <Button variant="outline" className="gap-2 border-primary/40 text-primary hover:bg-primary/5"
              onClick={() => navigate(`/conversation?ref=n1-${lesson.id}`)}>
              <MessageSquare className="h-4 w-4" /> Pratiquer avec l'assistant
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default LessonDetail;
