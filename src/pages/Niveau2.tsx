import { useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, PenTool, FileText, GraduationCap, ArrowRight, Lock, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useProfile } from "@/hooks/use-profile";
import { useIsAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/contexts/AuthContext";
import LessonProgressBar from "@/components/LessonProgressBar";

const lessons = [
  { num: 1, title: "Révision de l'alphabet et lecture fluide", desc: "Consolidation des acquis du niveau 1", icon: BookOpen },
  { num: 2, title: "Les articles définis (ال)", desc: "Le Lam Shamsi et le Lam Qamari", icon: GraduationCap },
  { num: 3, title: "Lecture de textes courts", desc: "Premiers textes avec vocabulaire simple", icon: FileText },
  { num: 4, title: "Le nom et ses catégories", desc: "Masculin, féminin, singulier, pluriel", icon: GraduationCap },
  { num: 5, title: "La phrase nominale", desc: "Structure Al-Moubtada et Al-Khabar", icon: GraduationCap },
  { num: 6, title: "La phrase verbale", desc: "Le verbe, le sujet et le complément", icon: GraduationCap },
  { num: 7, title: "Compréhension de texte I", desc: "Lecture et questions sur un texte narratif", icon: FileText },
  { num: 8, title: "Les pronoms personnels", desc: "Pronoms détachés et attachés", icon: PenTool },
  { num: 9, title: "Compréhension de texte II", desc: "Textes plus complexes avec analyse", icon: FileText },
  { num: 10, title: "Les prépositions", desc: "في، على، من، إلى et leur usage", icon: GraduationCap },
  { num: 11, title: "Rédaction guidée", desc: "Écrire des phrases et paragraphes simples", icon: PenTool },
  { num: 12, title: "Dictée finale", desc: "Évaluation écrite complète du niveau 2", icon: PenTool },
];

const grammarTopics = [
  "La phrase nominale (الجملة الاسمية)",
  "La phrase verbale (الجملة الفعلية)",
  "Le masculin et le féminin",
  "Le singulier, duel et pluriel",
  "Les pronoms personnels",
  "Les prépositions",
  "L'article défini (ال)",
];

const Niveau2 = () => {
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();
  const { profile, loading: profileLoading } = useProfile();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const { completedN2Lessons } = useLessonProgress();

  // Guard : les élèves niveau_1 sont renvoyés vers leur niveau
  useEffect(() => {
    if (authLoading || profileLoading || adminLoading) return;
    if (!isAdmin && profile && profile.level === "niveau_1") {
      navigate("/niveau-1", { replace: true });
    }
  }, [profile, profileLoading, authLoading, adminLoading, isAdmin, navigate]);

  if (authLoading || profileLoading || adminLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-7 w-7 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-gold/20 px-4 py-1.5 rounded-full mb-4">
              <span className="text-sm font-semibold text-gold">Niveau 2</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Approfondissement — <span className="text-gradient-gold">Grammaire & Compréhension</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Textes avancés, règles de grammaire et compréhension écrite.
            </p>
          </motion.div>

          {/* Points de grammaire */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Points de grammaire</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
              {grammarTopics.map((topic, i) => (
                <motion.div key={topic} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
                  <GraduationCap className="h-5 w-5 text-gold shrink-0" />
                  <span className="text-sm text-foreground">{topic}</span>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Leçons avec verrouillage séquentiel */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Programme des leçons</h2>

            <div className="max-w-2xl mx-auto mb-6 p-4 rounded-xl border border-border bg-card">
              <LessonProgressBar completedLessons={completedN2Lessons} totalLessons={lessons.length} label="Mes leçons" />
            </div>

            <TooltipProvider>
              <div className="max-w-2xl mx-auto space-y-3">
                {lessons.map((lesson, i) => {
                  const isCompleted = completedN2Lessons.includes(lesson.num);
                  const isPrevCompleted = i === 0 || completedN2Lessons.includes(lessons[i - 1].num);
                  const isProgressLocked = !isAdmin && !isPrevCompleted;
                  const linkTarget = isProgressLocked ? "#" : `/exercices?lesson=${lesson.num}&level=niveau_2`;

                  const card = (
                    <div key={lesson.num}>
                      <Link to={linkTarget} onClick={(e) => isProgressLocked && e.preventDefault()}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                            isCompleted
                              ? "border-gold/30 bg-gold/5"
                              : isProgressLocked
                              ? "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                              : "border-border bg-card hover:border-gold/30"
                          }`}
                        >
                          <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                            {isCompleted
                              ? <CheckCircle className="h-5 w-5 text-primary-foreground" />
                              : isProgressLocked
                              ? <Lock className="h-4 w-4 text-primary-foreground/60" />
                              : <lesson.icon className="h-5 w-5 text-primary-foreground" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground">Leçon {lesson.num} — {lesson.title}</h3>
                            <p className="text-xs text-muted-foreground">{lesson.desc}</p>
                          </div>
                          {isCompleted
                            ? <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                            : isProgressLocked
                            ? <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                            : <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />}
                        </motion.div>
                      </Link>
                    </div>
                  );

                  if (isProgressLocked) {
                    return (
                      <Tooltip key={lesson.num}>
                        <TooltipTrigger asChild>{card}</TooltipTrigger>
                        <TooltipContent><p>Termine la leçon précédente pour débloquer</p></TooltipContent>
                      </Tooltip>
                    );
                  }
                  return card;
                })}
              </div>
            </TooltipProvider>
          </section>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="gradient-emerald border-0 text-primary-foreground">
              <Link to="/dashboard">Accéder à mon espace élève</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Niveau2;
