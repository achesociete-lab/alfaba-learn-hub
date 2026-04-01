import { motion } from "framer-motion";
import { BookOpen, PenTool, FileText, GraduationCap, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const levels = [
  {
    level: 1,
    title: "Niveau 1 — Les Fondations",
    subtitle: "ALFASL — Niveau 1",
    description: "Découvrez l'alphabet arabe, apprenez à lire et à écrire. Chaque leçon se termine par une dictée pour consolider vos acquis.",
    features: [
      { icon: BookOpen, label: "Alphabet arabe complet" },
      { icon: FileText, label: "Exercices de lecture" },
      { icon: PenTool, label: "Dictées progressives" },
    ],
    to: "/niveau-1",
    accent: "primary",
  },
  {
    level: 2,
    title: "Niveau 2 — Approfondissement",
    subtitle: "ALFASL — Niveau 2",
    description: "Textes avancés, règles de grammaire, compréhension de texte et dictées pour perfectionner votre maîtrise de la langue.",
    features: [
      { icon: FileText, label: "Textes avancés" },
      { icon: GraduationCap, label: "Grammaire arabe" },
      { icon: PenTool, label: "Compréhension & dictée" },
    ],
    to: "/niveau-2",
    accent: "gold",
  },
];

const LevelsOverview = () => (
  <section className="py-20 geometric-pattern">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Deux niveaux, une <span className="text-gradient-gold">progression complète</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Notre programme couvre du débutant absolu au niveau intermédiaire.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {levels.map((lvl, i) => (
          <motion.div
            key={lvl.level}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.2 }}
            className="rounded-xl border border-border bg-card p-8 hover:shadow-lg transition-shadow"
          >
            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
              lvl.accent === "primary"
                ? "bg-primary/10 text-primary"
                : "bg-gold/20 text-gold"
            }`}>
              Niveau {lvl.level}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-1">{lvl.title}</h3>
            <p className="text-sm text-muted-foreground mb-4 italic">{lvl.subtitle}</p>
            <p className="text-muted-foreground text-sm mb-6">{lvl.description}</p>
            <ul className="space-y-3 mb-6">
              {lvl.features.map((f) => (
                <li key={f.label} className="flex items-center gap-3 text-sm text-foreground">
                  <f.icon className="h-4 w-4 text-primary" />
                  {f.label}
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" className="w-full border-primary/30 hover:bg-primary/5">
              <Link to={lvl.to}>
                Explorer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default LevelsOverview;
