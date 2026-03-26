import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { BookOpen, PenTool, FileText, Volume2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const alphabet = [
  { letter: "أ", name: "Alif" }, { letter: "ب", name: "Ba" }, { letter: "ت", name: "Ta" },
  { letter: "ث", name: "Tha" }, { letter: "ج", name: "Jim" }, { letter: "ح", name: "Ha" },
  { letter: "خ", name: "Kha" }, { letter: "د", name: "Dal" }, { letter: "ذ", name: "Dhal" },
  { letter: "ر", name: "Ra" }, { letter: "ز", name: "Zay" }, { letter: "س", name: "Sin" },
  { letter: "ش", name: "Shin" }, { letter: "ص", name: "Sad" }, { letter: "ض", name: "Dad" },
  { letter: "ط", name: "Ta" }, { letter: "ظ", name: "Dha" }, { letter: "ع", name: "Ayn" },
  { letter: "غ", name: "Ghayn" }, { letter: "ف", name: "Fa" }, { letter: "ق", name: "Qaf" },
  { letter: "ك", name: "Kaf" }, { letter: "ل", name: "Lam" }, { letter: "م", name: "Mim" },
  { letter: "ن", name: "Nun" }, { letter: "ه", name: "Ha" }, { letter: "و", name: "Waw" },
  { letter: "ي", name: "Ya" },
];

const lessons = [
  { num: 1, title: "Les lettres isolées", desc: "Découverte des 28 lettres de l'alphabet arabe", icon: BookOpen },
  { num: 2, title: "Les formes des lettres", desc: "Début, milieu et fin de mot", icon: PenTool },
  { num: 3, title: "Les voyelles courtes", desc: "Fatha, Damma, Kasra et Soukoun", icon: Volume2 },
  { num: 4, title: "Lecture de syllabes", desc: "Combinaison lettres + voyelles", icon: FileText },
  { num: 5, title: "Les voyelles longues", desc: "Alif, Waw et Ya comme prolongation", icon: Volume2 },
  { num: 6, title: "Lecture de mots simples", desc: "Premiers mots arabes", icon: BookOpen },
  { num: 7, title: "Le Tanwin", desc: "Les doubles voyelles", icon: PenTool },
  { num: 8, title: "La Shadda", desc: "Le redoublement des lettres", icon: Volume2 },
  { num: 9, title: "Lecture de phrases", desc: "Construire et lire des phrases complètes", icon: FileText },
  { num: 10, title: "Dictée finale", desc: "Évaluation écrite du niveau 1", icon: PenTool },
];

const Niveau1 = () => (
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
            Basé sur l'ouvrage Madrassa Niveau 1. Apprenez l'alphabet, lisez vos premiers mots et validez par la dictée.
          </p>
        </motion.div>

        {/* Alphabet grid */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold text-foreground mb-6 text-center">L'Alphabet Arabe</h2>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-3 max-w-3xl mx-auto" dir="rtl">
            {alphabet.map((a, i) => (
              <motion.div
                key={a.name + i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.02 }}
                className="flex flex-col items-center justify-center p-3 rounded-xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer group"
              >
                <span className="font-arabic text-2xl sm:text-3xl text-foreground group-hover:text-primary transition-colors">
                  {a.letter}
                </span>
                <span className="text-[10px] text-muted-foreground mt-1">{a.name}</span>
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
                className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card hover:border-primary/30 transition-colors"
              >
                <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center shrink-0">
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

export default Niveau1;
