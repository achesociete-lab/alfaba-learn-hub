import { motion } from "framer-motion";
import { BookOpen, Headphones, BarChart3, Moon, Volume2, Smartphone } from "lucide-react";

const features = [
  {
    icon: BookOpen,
    title: "Leçons progressives",
    desc: "De l'alphabet arabe aux textes du Coran — 10 leçons par niveau, débloquées au fur et à mesure de votre avancement.",
  },
  {
    icon: Headphones,
    title: "Dictées et QCM interactifs",
    desc: "Exercices de reconnaissance des lettres, dictées vocales et quiz corrigés instantanément avec explication.",
  },
  {
    icon: Volume2,
    title: "Audio intégré",
    desc: "Chaque lettre, mot et exemple s'écoute d'un clic. Entraînez votre oreille à la prononciation authentique.",
  },
  {
    icon: Moon,
    title: "Module Hifd",
    desc: "Suivi personnalisé de la mémorisation du Coran : 60 hizb tracés, 3 types de révision, séances avec professeur.",
  },
  {
    icon: BarChart3,
    title: "Suivi de progression",
    desc: "Tableau de bord clair : leçons complétées, score aux exercices, badges et objectif quotidien.",
  },
  {
    icon: Smartphone,
    title: "Accessible partout",
    desc: "Sur mobile, tablette ou ordinateur — progressez à votre rythme, où que vous soyez.",
  },
];

const FeaturesSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block"
        >
          La méthode
        </motion.span>
        <motion.h2
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.05 }}
          className="text-3xl sm:text-4xl font-bold text-foreground mb-3"
        >
          Tout pour apprendre{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            vraiment l'arabe
          </span>
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-muted-foreground max-w-lg mx-auto"
        >
          Une méthode structurée, des exercices interactifs et un suivi réel — pas juste des vidéos à regarder passivement.
        </motion.p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            whileHover={{ y: -6, transition: { duration: 0.2 } }}
            className="p-6 rounded-2xl border border-border bg-background hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5 transition-colors group cursor-default"
          >
            <motion.div
              whileHover={{ scale: 1.15, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
              className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors"
            >
              <f.icon className="h-5 w-5 text-primary" />
            </motion.div>
            <h3 className="font-semibold text-foreground mb-2">{f.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturesSection;
