import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { ArrowRight, Lock, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

const alphabet = [
  { letter: "أ", name: "Alif", nameAr: "أَلِف", prononciation: "a / â", isolated: "أ", initial: "أ", medial: "ـأ", final: "ـأ" },
  { letter: "ب", name: "Ba", nameAr: "بَاء", prononciation: "b", isolated: "ب", initial: "بـ", medial: "ـبـ", final: "ـب" },
  { letter: "ت", name: "Ta", nameAr: "تَاء", prononciation: "t", isolated: "ت", initial: "تـ", medial: "ـتـ", final: "ـت" },
  { letter: "ث", name: "Tha", nameAr: "ثَاء", prononciation: "th (anglais « think »)", isolated: "ث", initial: "ثـ", medial: "ـثـ", final: "ـث" },
  { letter: "ج", name: "Jim", nameAr: "جِيم", prononciation: "j / dj", isolated: "ج", initial: "جـ", medial: "ـجـ", final: "ـج" },
  { letter: "ح", name: "Ha", nameAr: "حَاء", prononciation: "h aspiré profond", isolated: "ح", initial: "حـ", medial: "ـحـ", final: "ـح" },
  { letter: "خ", name: "Kha", nameAr: "خَاء", prononciation: "kh (jota espagnol)", isolated: "خ", initial: "خـ", medial: "ـخـ", final: "ـخ" },
  { letter: "د", name: "Dal", nameAr: "دَال", prononciation: "d", isolated: "د", initial: "د", medial: "ـد", final: "ـد" },
  { letter: "ذ", name: "Dhal", nameAr: "ذَال", prononciation: "dh (anglais « the »)", isolated: "ذ", initial: "ذ", medial: "ـذ", final: "ـذ" },
  { letter: "ر", name: "Ra", nameAr: "رَاء", prononciation: "r roulé", isolated: "ر", initial: "ر", medial: "ـر", final: "ـر" },
  { letter: "ز", name: "Zay", nameAr: "زَاي", prononciation: "z", isolated: "ز", initial: "ز", medial: "ـز", final: "ـز" },
  { letter: "س", name: "Sin", nameAr: "سِين", prononciation: "s", isolated: "س", initial: "سـ", medial: "ـسـ", final: "ـس" },
  { letter: "ش", name: "Shin", nameAr: "شِين", prononciation: "ch", isolated: "ش", initial: "شـ", medial: "ـشـ", final: "ـش" },
  { letter: "ص", name: "Sad", nameAr: "صَاد", prononciation: "s emphatique", isolated: "ص", initial: "صـ", medial: "ـصـ", final: "ـص" },
  { letter: "ض", name: "Dad", nameAr: "ضَاد", prononciation: "d emphatique", isolated: "ض", initial: "ضـ", medial: "ـضـ", final: "ـض" },
  { letter: "ط", name: "Ta", nameAr: "طَاء", prononciation: "t emphatique", isolated: "ط", initial: "طـ", medial: "ـطـ", final: "ـط" },
  { letter: "ظ", name: "Dha", nameAr: "ظَاء", prononciation: "dh emphatique", isolated: "ظ", initial: "ظـ", medial: "ـظـ", final: "ـظ" },
  { letter: "ع", name: "Ayn", nameAr: "عَيْن", prononciation: "contraction gutturale", isolated: "ع", initial: "عـ", medial: "ـعـ", final: "ـع" },
  { letter: "غ", name: "Ghayn", nameAr: "غَيْن", prononciation: "r grasseyé", isolated: "غ", initial: "غـ", medial: "ـغـ", final: "ـغ" },
  { letter: "ف", name: "Fa", nameAr: "فَاء", prononciation: "f", isolated: "ف", initial: "فـ", medial: "ـفـ", final: "ـف" },
  { letter: "ق", name: "Qaf", nameAr: "قَاف", prononciation: "q (fond de gorge)", isolated: "ق", initial: "قـ", medial: "ـقـ", final: "ـق" },
  { letter: "ك", name: "Kaf", nameAr: "كَاف", prononciation: "k", isolated: "ك", initial: "كـ", medial: "ـكـ", final: "ـك" },
  { letter: "ل", name: "Lam", nameAr: "لَام", prononciation: "l", isolated: "ل", initial: "لـ", medial: "ـلـ", final: "ـل" },
  { letter: "م", name: "Mim", nameAr: "مِيم", prononciation: "m", isolated: "م", initial: "مـ", medial: "ـمـ", final: "ـم" },
  { letter: "ن", name: "Nun", nameAr: "نُون", prononciation: "n", isolated: "ن", initial: "نـ", medial: "ـنـ", final: "ـن" },
  { letter: "ه", name: "Ha", nameAr: "هَاء", prononciation: "h léger expiré", isolated: "ه", initial: "هـ", medial: "ـهـ", final: "ـه" },
  { letter: "و", name: "Waw", nameAr: "وَاو", prononciation: "w / ou", isolated: "و", initial: "و", medial: "ـو", final: "ـو" },
  { letter: "ي", name: "Ya", nameAr: "يَاء", prononciation: "y / i", isolated: "ي", initial: "يـ", medial: "ـيـ", final: "ـي" },
];

const lessons = [
  { num: 1, title: "Les lettres isolées", desc: "Découverte des 28 lettres de l'alphabet arabe", icon: "📖" },
  { num: 2, title: "Les formes des lettres", desc: "Début, milieu et fin de mot", icon: "✍️" },
  { num: 3, title: "Les voyelles courtes", desc: "Fatha, Damma, Kasra et Soukoun", icon: "🎵" },
  { num: 4, title: "Lecture de syllabes", desc: "Combinaison lettres + voyelles", icon: "🔤" },
  { num: 5, title: "Les voyelles longues", desc: "Alif, Waw et Ya comme prolongation", icon: "🔊" },
  { num: 6, title: "Lecture de mots simples", desc: "Premiers mots arabes", icon: "📝" },
  { num: 7, title: "Le Tanwîn", desc: "Les doubles voyelles", icon: "✨" },
  { num: 8, title: "La Shadda", desc: "Le redoublement des lettres", icon: "💪" },
  { num: 9, title: "Lecture de phrases", desc: "Construire et lire des phrases complètes", icon: "💬" },
  { num: 10, title: "Dictée finale", desc: "Évaluation écrite du niveau 1", icon: "🏆" },
];

const FREE_LESSON_LIMIT = 3;

const Niveau1 = () => {
  const { user } = useAuth();
  const { isFreePlan } = useSubscription();
  const { completedLessons } = useLessonProgress();
  const [selectedLetter, setSelectedLetter] = useState<typeof alphabet[0] | null>(null);

  const shouldLock = !user || isFreePlan;
  const completed = completedLessons.length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-4">
              <span className="text-sm font-semibold text-primary">Niveau 1</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
              Les Fondations — <span className="text-gradient-gold">L'Alphabet Arabe</span>
            </h1>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Apprenez l'alphabet, lisez vos premiers mots et validez par la dictée.
            </p>
          </motion.div>

          {/* Alphabet grid */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">L'Alphabet Arabe</h2>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 max-w-3xl mx-auto" dir="rtl">
              {alphabet.map((a, i) => (
                <motion.button
                  key={a.name + i}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.02 }}
                  onClick={() => setSelectedLetter(a)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
                >
                  <span className="font-arabic text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors">
                    {a.letter}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">{a.name}</span>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Lessons */}
          <section>
            <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Programme des leçons</h2>

            {/* Progress bar */}
            <div className="max-w-2xl mx-auto mb-6">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                <span>{completed}/10 leçons complétées</span>
                <span>{Math.round((completed / 10) * 100)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full transition-all duration-500"
                  style={{ width: `${(completed / 10) * 100}%` }}
                />
              </div>
            </div>

            <div className="max-w-2xl mx-auto space-y-3">
              {lessons.map((lesson, i) => {
                const isLocked = shouldLock && lesson.num > FREE_LESSON_LIMIT;

                return (
                  <div key={lesson.num}>
                    {/* CTA after lesson 3 */}
                    {lesson.num === 4 && shouldLock && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mb-3 p-5 rounded-xl bg-primary/10 border border-primary/30 text-center"
                      >
                        <p className="text-lg font-bold text-foreground mb-1">🔓 Débloquer toutes les leçons</p>
                        <p className="text-sm text-muted-foreground mb-3">Commencez votre apprentissage complet</p>
                        <Button asChild className="gradient-emerald border-0 text-primary-foreground">
                          <Link to={user ? "/tarifs" : "/auth"}>
                            {user ? "Voir les offres →" : "S'inscrire gratuitement →"}
                          </Link>
                        </Button>
                      </motion.div>
                    )}

                    <Link to={isLocked ? "#" : "/exercices"} onClick={(e) => isLocked && e.preventDefault()}>
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-colors ${
                          isLocked
                            ? "border-border/50 bg-muted/30 opacity-50 cursor-not-allowed"
                            : "border-border bg-card hover:border-primary/30"
                        }`}
                      >
                        <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center shrink-0 text-lg">
                          {isLocked ? <Lock className="h-4 w-4 text-muted-foreground" /> : lesson.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold text-foreground">
                            Leçon {lesson.num} — {lesson.title}
                          </h3>
                          <p className="text-xs text-muted-foreground">{lesson.desc}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">⏱️ 15 min</p>
                        </div>
                        {isLocked ? (
                          <Lock className="h-4 w-4 text-muted-foreground shrink-0" />
                        ) : (
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        )}
                      </motion.div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          <div className="text-center mt-12">
            <Button asChild size="lg" className="gradient-emerald border-0 text-primary-foreground">
              <Link to="/dashboard">Accéder à mon espace élève</Link>
            </Button>
          </div>
        </div>
      </main>
      <Footer />

      {/* Letter detail dialog */}
      <Dialog open={!!selectedLetter} onOpenChange={(open) => !open && setSelectedLetter(null)}>
        <DialogContent className="max-w-sm">
          {selectedLetter && (
            <>
              <DialogHeader>
                <DialogTitle className="text-center">
                  <span className="font-arabic text-5xl text-primary">{selectedLetter.letter}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 text-center">
                <div>
                  <p className="font-arabic text-xl text-foreground">{selectedLetter.nameAr}</p>
                  <p className="text-sm text-muted-foreground">{selectedLetter.name}</p>
                </div>
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Prononciation</p>
                  <p className="text-sm font-medium text-foreground">{selectedLetter.prononciation}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2">Les 4 formes</p>
                  <div className="grid grid-cols-4 gap-2" dir="rtl">
                    {[
                      { label: "Isolée", form: selectedLetter.isolated },
                      { label: "Début", form: selectedLetter.initial },
                      { label: "Milieu", form: selectedLetter.medial },
                      { label: "Fin", form: selectedLetter.final },
                    ].map((f) => (
                      <div key={f.label} className="flex flex-col items-center p-2 rounded-lg border border-border bg-card">
                        <span className="font-arabic text-2xl text-foreground">{f.form}</span>
                        <span className="text-[10px] text-muted-foreground mt-1">{f.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Niveau1;
