import { motion } from "framer-motion";
import {
  BookOpen,
  Mic,
  Bot,
  Landmark,
  BarChart3,
  Lock,
} from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Leçons structurées",
    desc: "De l'alphabet aux textes avancés, progressez à votre rythme.",
  },
  {
    icon: Mic,
    title: "Dictées audio",
    desc: "Entraînez votre oreille et votre prononciation arabe.",
  },
  {
    icon: Bot,
    title: "Professeur IA",
    desc: "Un assistant disponible 24h/24 qui s'adapte à votre niveau.",
  },
  {
    icon: Landmark,
    title: "Module Coran",
    desc: "Apprenez à réciter avec tajwid.",
  },
  {
    icon: BarChart3,
    title: "Suivi de progression",
    desc: "Visualisez vos progrès leçon par leçon.",
  },
  {
    icon: Lock,
    title: "Accès sécurisé",
    desc: "Votre espace personnel et privé.",
  },
];

const FeaturesSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Tout ce qu'il faut pour <span className="text-gradient-gold">apprendre l'arabe</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Une méthode complète, progressive et adaptée à chaque élève.
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
