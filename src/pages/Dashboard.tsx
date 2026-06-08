import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import {
  LogOut, User, Brain, Trophy, GraduationCap, BookMarked,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useProfile } from "@/hooks/use-profile";
import LevelUpTest from "@/components/LevelUpTest";
import DailyExercise from "@/components/DailyExercise";
import { BadgesSection } from "@/components/BadgesSection";

const Dashboard = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { profile } = useProfile();
  const { completedLessons, completedN2Lessons } = useLessonProgress();
  const [showLevelTest, setShowLevelTest] = useState(false);

  const isPresentiel = profile?.type_eleve === "presentiel";
  const isN1 = profile?.level === "niveau_1";
  const totalLessons = isN1 ? 10 : 13;
  const completed = isN1 ? completedLessons : completedN2Lessons;
  const progressPct = Math.round((completed.length / totalLessons) * 100);
  const allN1Done = isN1 && completedLessons.length >= 10;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (isPresentiel) navigate("/cours-presentiel", { replace: true });
  }, [isPresentiel, navigate]);

  if (authLoading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <p className="text-muted-foreground">Chargement...</p>
    </div>
  );
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">

          {/* En-tête */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-1">
                {profile ? `Bienvenue, ${profile.first_name} !` : "Espace Élève"}
              </h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                {isN1 ? "Niveau 1" : "Niveau 2"}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={signOut} className="gap-2">
              <LogOut className="h-4 w-4" /> Déconnexion
            </Button>
          </motion.div>

          {/* Carte de progression */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-6 p-6 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center">
                <Trophy className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Progression des leçons</p>
                <p className="text-xs text-muted-foreground">{isN1 ? "Niveau 1" : "Niveau 2"}</p>
              </div>
              <span className="ml-auto text-2xl font-bold text-foreground">{progressPct}%</span>
            </div>
            <Progress value={progressPct} className="h-2 mb-3" />

            {/* Grille des leçons */}
            <div className="grid grid-cols-10 sm:grid-cols-13 gap-1.5 mt-4">
              {Array.from({ length: totalLessons }, (_, i) => {
                const num = i + 1;
                const done = completed.includes(num);
                return (
                  <div
                    key={num}
                    className={`h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                      done
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {num}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {completed.length}/{totalLessons} leçons terminées
            </p>

            {/* Bandeau passage niveau 2 */}
            {allN1Done && !showLevelTest && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 rounded-xl bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <GraduationCap className="h-8 w-8 text-primary shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-foreground">🎉 Toutes les leçons du Niveau 1 terminées !</p>
                    <p className="text-xs text-muted-foreground">Passez le test de validation pour accéder au Niveau 2.</p>
                  </div>
                </div>
                <Button
                  onClick={() => setShowLevelTest(true)}
                  className="gap-2 shrink-0 gradient-emerald border-0 text-primary-foreground"
                >
                  <GraduationCap className="h-4 w-4" /> Passer le test
                </Button>
              </motion.div>
            )}
          </motion.div>

          {/* Test passage de niveau */}
          {showLevelTest && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
              <LevelUpTest
                onPass={() => { setShowLevelTest(false); window.location.reload(); }}
                onDismiss={() => setShowLevelTest(false)}
              />
            </motion.div>
          )}

          {/* Badges */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-6 p-6 rounded-xl border border-border bg-card"
          >
            <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <Trophy className="h-4 w-4" /> Badges
            </h3>
            <BadgesSection />
          </motion.div>

          {/* Exercice quotidien */}
          <DailyExercise level={profile?.level || "niveau_1"} completedLessons={completed} />

          {/* Accès rapides */}
          <div className="grid sm:grid-cols-2 gap-4 mt-6">
            <Link to="/exercices">
              <div className="p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors flex items-center gap-3 cursor-pointer">
                <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
                  <Brain className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Exercices interactifs</p>
                  <p className="text-xs text-muted-foreground">QCM, dictées et compréhension</p>
                </div>
              </div>
            </Link>
            <Link to="/hifz">
              <div className="p-4 rounded-xl border border-border bg-card hover:border-amber-300/40 transition-colors flex items-center gap-3 cursor-pointer">
                <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                  <BookMarked className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Module Hifd</p>
                  <p className="text-xs text-muted-foreground">Mémorisation et suivi des hizb</p>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Dashboard;
