import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, PenTool, FileText, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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

const Niveau2 = () => (
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

        {/* Grammar topics */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Points de grammaire</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 max-w-3xl mx-auto">
            {grammarTopics.map((topic, i) => (
              <motion.div
                key={topic}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <GraduationCap className="h-5 w-5 text-gold shrink-0" />
                <span className="text-sm text-foreground">{topic}</span>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Lessons */}
        <section>
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">Programme des leçons</h2>
          <div className="max-w-2xl mx-auto space-y-3">
            {lessons.map((lesson, i) => (
              <motion.div
                key={lesson.num}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-gold/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg gradient-gold flex items-center justify-center shrink-0">
                  <lesson.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-foreground">
                    Leçon {lesson.num} — {lesson.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{lesson.desc}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </motion.div>
            ))}
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
  </div>
);

export default Niveau2;
