import { motion } from "framer-motion";
import {
  Upload,
  CheckCircle,
  BarChart3,
  ClipboardList,
  Video,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: Upload,
    title: "Dépôt de devoirs",
    desc: "Les élèves déposent leurs devoirs en ligne, le professeur corrige et note directement.",
  },
  {
    icon: CheckCircle,
    title: "Correction & Notes",
    desc: "Système de notation transparent avec feedback détaillé sur chaque devoir.",
  },
  {
    icon: ClipboardList,
    title: "Émargement",
    desc: "Feuille de présence numérique pour chaque cours en présentiel.",
  },
  {
    icon: BarChart3,
    title: "Suivi de progression",
    desc: "Tableau de bord avec statistiques de progression et résultats.",
  },
  {
    icon: Video,
    title: "E-learning",
    desc: "Accédez aux cours en ligne : vidéos, exercices interactifs et ressources.",
  },
  {
    icon: Lock,
    title: "Accès sécurisé",
    desc: "Chaque élève accède uniquement à son niveau et ses contenus.",
  },
];

const FeaturesSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Tout ce qu'il faut pour <span className="text-gradient-gold">apprendre et enseigner</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Des outils pensés pour le présentiel et le distanciel.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="p-6 rounded-xl border border-border bg-background hover:border-primary/30 transition-colors"
          >
            <div className="h-10 w-10 rounded-lg gradient-emerald flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-primary-foreground" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
