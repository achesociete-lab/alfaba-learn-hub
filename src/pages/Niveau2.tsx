import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, PenTool, FileText, GraduationCap, ArrowRight, Lock, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useIsAdmin } from "@/hooks/use-admin";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
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
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const { hasLessonAccess } = useSubscription();
  const { completedN2Lessons } = useLessonProgress();

  const shouldLock = !isAdmin && (!user || !hasLessonAccess);

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
                  const isPaywalled = shouldLock;
                  const isCompleted = completedN2Lessons.includes(lesson.num);
                  const isPrevCompleted = i === 0 || completedN2Lessons.includes(lessons[i - 1].num);
                  const isProgressLocked = !isAdmin && !isPaywalled && !isPrevCompleted;
                  const isLocked = isPaywalled || isProgressLocked;
                  const linkTarget = isPaywalled
                    ? (user ? "/tarifs" : "/auth")
                    : isProgressLocked ? "#"
                    : `/exercices?lesson=${lesson.num}&level=niveau_2`;

                  const card = (
                    <div key={lesson.num}>
                      {i === 0 && shouldLock && (
                        <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                          className="mb-3 p-5 rounded-xl bg-gold/10 border border-gold/30 text-center">
                          <p className="text-lg font-bold text-foreground mb-1">🔓 Accéder au Niveau 2</p>
                          {user ? (
                            <>
                              <p className="text-sm text-muted-foreground mb-3">Passez au plan Essentiel pour accéder à toutes les leçons du Niveau 2</p>
                              <Button asChild className="gradient-gold border-0 text-primary-foreground"><Link to="/tarifs">Passer à l'Essentiel →</Link></Button>
                            </>
                          ) : (
                            <>
                              <p className="text-sm text-muted-foreground mb-3">Inscrivez-vous pour accéder au programme complet</p>
                              <Button asChild className="gradient-gold border-0 text-primary-foreground"><Link to="/auth">S'inscrire gratuitement →</Link></Button>
                            </>
                          )}
                        </motion.div>
                      )}
                      <Link to={linkTarget} onClick={(e) => isProgressLocked && e.preventDefault()}>
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.05 }}
                          className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                            isCompleted
                              ? "border-gold/30 bg-gold/5"
                              : isLocked
                              ? "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                              : "border-border bg-card hover:border-gold/30"
                          }`}
                        >
                          <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                            {isCompleted
                              ? <CheckCircle className="h-5 w-5 text-primary-foreground" />
                              : isLocked
                              ? <Lock className="h-4 w-4 text-primary-foreground/60" />
                              : <lesson.icon className="h-5 w-5 text-primary-foreground" />}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-sm font-semibold text-foreground">Leçon {lesson.num} — {lesson.title}</h3>
                            <p className="text-xs text-muted-foreground">{lesson.desc}</p>
                          </div>
                          {isCompleted
                            ? <CheckCircle className="h-4 w-4 text-gold shrink-0" />
                            : isLocked
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

          {user && (
            <div className="text-center mt-12">
              <Button asChild size="lg" className="gradient-emerald border-0 text-primary-foreground">
                <Link to="/dashboard">Accéder à mon espace élève</Link>
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Niveau2;
