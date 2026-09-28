import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { LogOut, Brain, Trophy, GraduationCap, BookMarked, ArrowRight, Flame, Star, Tv, MessageSquare, Zap, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useProfile } from "@/hooks/use-profile";
import { useSubscription } from "@/hooks/use-subscription";
import LevelUpTest from "@/components/LevelUpTest";
import DailyExercise from "@/components/DailyExercise";
import { BadgesSection } from "@/components/BadgesSection";

const N1_TOTAL = 12;
const N2_TOTAL = 12;

const N1_TITLES = [
  "Les lettres isolées","Les formes des lettres","Les voyelles courtes",
  "Lecture de syllabes","Les voyelles longues","Lecture de mots simples",
  "Le Tanwîn","La Shadda","Lecture de phrases","Récapitulatif & dictée finale",
  "Les mots essentiels","Tâ Marbûta et la Hamza",
];
const N2_TITLES = [
  "Révision & Lecture fluide","Les articles définis (ال)","Lecture de textes courts",
  "Le nom et ses catégories","La phrase nominale","La phrase verbale",
  "Compréhension de texte I","Les pronoms personnels","Compréhension de texte II",
  "Les prépositions","Rédaction guidée","Dictée finale",
];

const XP_PER_LESSON = 100;

const LEVELS = [
  { min: 0,   max: 299,  label: "Débutant",  color: "text-amber-600",  bg: "bg-amber-100",  icon: "🥉" },
  { min: 300, max: 599,  label: "Apprenti",  color: "text-slate-500",  bg: "bg-slate-100",  icon: "🥈" },
  { min: 600, max: 999,  label: "Avancé",    color: "text-yellow-600", bg: "bg-yellow-100", icon: "🥇" },
  { min: 1000,max: 9999, label: "Expert",    color: "text-cyan-600",   bg: "bg-cyan-100",   icon: "💎" },
];

function getLevelInfo(xp: number) {
  return LEVELS.find(l => xp >= l.min && xp <= l.max) ?? LEVELS[0];
}

// Circular XP ring
function XPRing({ pct, xp, completed, total }: { pct: number; xp: number; completed: number; total: number }) {
  const r = 80;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - pct / 100);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const level = getLevelInfo(xp);

  return (
    <div ref={ref} className="relative flex items-center justify-center">
      <svg width="200" height="200" className="rotate-[-90deg]">
        <circle cx="100" cy="100" r={r} fill="none" stroke="currentColor" strokeWidth="12" className="text-muted/20" />
        <motion.circle
          cx="100" cy="100" r={r} fill="none"
          stroke="url(#xpGrad)" strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: offset } : { strokeDashoffset: circ }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
        />
        <defs>
          <linearGradient id="xpGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#059669" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <motion.span
          initial={{ scale: 0.5, opacity: 0 }}
          animate={inView ? { scale: 1, opacity: 1 } : {}}
          transition={{ delay: 0.6, type: "spring" }}
          className="text-4xl font-black text-foreground"
        >
          {completed}/{total}
        </motion.span>
        <span className="text-xs text-muted-foreground font-medium">leçons</span>
        <motion.div
          initial={{ opacity: 0, y: 4 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.8 }}
          className={`mt-1 px-2 py-0.5 rounded-full text-xs font-bold ${level.bg} ${level.color}`}
        >
          {level.icon} {level.label}
        </motion.div>
        <motion.span
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ delay: 1.0 }}
          className="text-xs text-primary font-bold mt-1"
        >
          {xp} XP
        </motion.span>
      </div>
    </div>
  );
}

// Quick action card
function ActionCard({ to, icon, label, sub, color, locked = false, delay = 0 }: {
  to: string; icon: React.ReactNode; label: string; sub: string;
  color: string; locked?: boolean; delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, type: "spring", stiffness: 200, damping: 20 }}
      whileHover={locked ? {} : { y: -4, scale: 1.02 }}
      whileTap={locked ? {} : { scale: 0.97 }}
    >
      <Link to={locked ? "/tarifs" : to}>
        <div className={`relative p-4 rounded-2xl border bg-card transition-all cursor-pointer group overflow-hidden ${
          locked ? "opacity-60 border-border" : "border-border hover:border-primary/30 hover:shadow-md"
        }`}>
          {locked && <Lock className="absolute top-2 right-2 h-3.5 w-3.5 text-muted-foreground" />}
          <div className={`h-10 w-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
            {icon}
          </div>
          <p className="text-sm font-semibold text-foreground leading-tight">{label}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
          {!locked && (
            <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
              <ArrowRight className="h-4 w-4 text-primary" />
            </div>
          )}
        </div>
      </Link>
    </motion.div>
  );
}

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile, refetch: refetchProfile } = useProfile();
  const { completedLessons, completedN2Lessons } = useLessonProgress();
  const { isHifz, hasLessonAccess, isPremium } = useSubscription();
  const [showLevelTest, setShowLevelTest] = useState(false);

  const isPresentiel = profile?.type_eleve === "presentiel";
  const isN1 = profile?.level === "niveau_1";
  const totalLessons = isN1 ? N1_TOTAL : N2_TOTAL;
  const completed = isN1 ? completedLessons : completedN2Lessons;
  const progressPct = Math.round((completed.length / totalLessons) * 100);
  const xp = completed.length * XP_PER_LESSON;
  const allDone = completed.length >= totalLessons;
  const allN1Done = isN1 && allDone;

  const nextLessonNum = allDone ? null :
    Array.from({ length: totalLessons }, (_, i) => i + 1).find(n => !completed.includes(n)) ?? null;
  const nextLessonTitle = nextLessonNum
    ? (isN1 ? N1_TITLES[nextLessonNum - 1] : N2_TITLES[nextLessonNum - 1])
    : null;
  const nextLessonLink = nextLessonNum
    ? (isN1 ? `/exercices?lesson=${nextLessonNum}` : `/exercices?lesson=${nextLessonNum}&level=niveau_2`)
    : null;

  useEffect(() => { if (!authLoading && !user) navigate("/auth"); }, [user, authLoading, navigate]);
  useEffect(() => { if (isPresentiel) navigate("/cours-presentiel", { replace: true }); }, [isPresentiel, navigate]);

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="h-8 w-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-2xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between pt-6 pb-4">
            <div>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-xs text-muted-foreground font-medium mb-0.5"
              >
                {isN1 ? "Niveau 1 — Alphabet & bases" : "Niveau 2 — Grammaire & lecture"}
              </motion.p>
              <motion.h1
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="text-2xl font-black text-foreground"
              >
                {profile ? `Ahlan, ${profile.first_name} ! 👋` : "Espace Élève"}
              </motion.h1>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="text-muted-foreground gap-1.5">
              <LogOut className="h-4 w-4" />
            </Button>
          </motion.div>

          {/* XP Ring + Continue CTA */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, type: "spring" }}
            className="mb-5 p-6 rounded-2xl border border-border bg-card overflow-hidden relative"
          >
            {/* Decorative gradient */}
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />

            <div className="flex items-center gap-6">
              <XPRing pct={progressPct} xp={xp} completed={completed.length} total={totalLessons} />
              <div className="flex-1 space-y-3">
                <div>
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Progression</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-3xl font-black text-foreground">{progressPct}%</span>
                    {xp > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 1, type: "spring" }}
                        className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full"
                      >
                        <Zap className="h-3 w-3" /> {xp} XP
                      </motion.span>
                    )}
                  </div>
                </div>

                {nextLessonLink && nextLessonTitle && (
                  <Link to={nextLessonLink}>
                    <motion.div
                      whileHover={{ x: 4 }}
                      whileTap={{ scale: 0.97 }}
                      className="flex items-center justify-between p-3 rounded-xl bg-primary/10 border border-primary/20 hover:bg-primary/15 transition-colors cursor-pointer group"
                    >
                      <div className="min-w-0">
                        <p className="text-[10px] font-bold text-primary uppercase tracking-wide">Continuer →</p>
                        <p className="text-sm font-bold text-foreground mt-0.5 truncate">L{nextLessonNum} — {nextLessonTitle}</p>
                      </div>
                      <motion.div
                        animate={{ x: [0, 4, 0] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                      >
                        <ArrowRight className="h-5 w-5 text-primary shrink-0 ml-2" />
                      </motion.div>
                    </motion.div>
                  </Link>
                )}

                {allN1Done && !showLevelTest && (
                  <motion.button
                    onClick={() => setShowLevelTest(true)}
                    whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center gap-2 p-3 rounded-xl bg-gradient-to-r from-primary to-emerald-400 text-white text-sm font-bold shadow-lg shadow-primary/25"
                  >
                    <GraduationCap className="h-4 w-4 shrink-0" />
                    🎉 Niveau 1 terminé — Passer le test N2
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>

          {/* Level test */}
          <AnimatePresence>
            {showLevelTest && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-5">
                <LevelUpTest onPass={async () => { setShowLevelTest(false); await refetchProfile(); }} onDismiss={() => setShowLevelTest(false)} />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick actions */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-5">
            <ActionCard to="/exercices" icon={<Brain className="h-5 w-5 text-white" />} label="Exercices" sub="QCM & dictées" color="gradient-emerald" delay={0.2} />
            <ActionCard to="/tuteur" icon={<Star className="h-5 w-5 text-white" />} label="مساري" sub="Tuteur personnalisé" color="bg-purple-500" locked={!isPremium} delay={0.25} />
            <ActionCard to="/conversation" icon={<MessageSquare className="h-5 w-5 text-white" />} label="مساعد المعلم" sub="Conversation IA" color="bg-blue-500" locked={!hasLessonAccess} delay={0.3} />
            <ActionCard to="/dessins-animes" icon={<Tv className="h-5 w-5 text-white" />} label="رسوم متحركة" sub="Cartoons arabes" color="bg-orange-500" locked={!hasLessonAccess} delay={0.35} />
            {isHifz && <ActionCard to="/hifz" icon={<BookMarked className="h-5 w-5 text-white" />} label="Hifd al-Qur'ān" sub="Mémorisation" color="bg-amber-500" delay={0.4} />}
            <ActionCard to="/tarifs" icon={<Trophy className="h-5 w-5 text-white" />} label="Mon abonnement" sub="Voir les formules" color="bg-emerald-600" delay={0.45} />
          </div>

          {/* Daily challenge */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mb-5">
            <DailyExercise level={profile?.level || "niveau_1"} completedLessons={completed} />
          </motion.div>

          {/* Badges */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            className="p-5 rounded-2xl border border-border bg-card">
            <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4 text-primary" /> Mes badges
            </h3>
            <BadgesSection />
          </motion.div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
