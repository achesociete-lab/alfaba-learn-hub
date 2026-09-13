import { motion } from "framer-motion";
import { BarChart3, GraduationCap, Layers } from "lucide-react";

const reasons = [
  {
    icon: Layers,
    title: "Méthode progressive et structurée",
    desc: "De l'alphabet aux textes du Coran : chaque leçon s'appuie sur la précédente. Exercices interactifs, QCM et dictées corrigés instantanément — pas juste des vidéos à regarder.",
    highlight: "Deux niveaux",
  },
  {
    icon: GraduationCap,
    title: "Un vrai professeur, pas un algorithme",
    desc: "Pour le programme Hifd, chaque séance se passe en visio avec votre professeur. Il entend votre récitation, corrige votre tajwid et adapte le rythme à votre niveau personnel.",
    highlight: "2 séances / semaine",
  },
  {
    icon: BarChart3,
    title: "Suivi complet en temps réel",
    desc: "Tableau de bord clair : leçons complétées, hizb mémorisés, évaluations, historique des séances. Vous savez exactement où vous en êtes — à chaque instant.",
    highlight: "60 hizb tracés",
  },
];

const WhyAlfaslSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
          Pourquoi ALFASL
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ce qui rend notre approche{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            différente
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          La plupart des plateformes proposent des vidéos en groupe. Nous offrons une progression réelle, un suivi individuel et un vrai professeur.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {reasons.map(({ icon: Icon, title, desc, highlight }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="bg-card rounded-2xl p-7 border border-border hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex flex-col"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center mb-5 shadow-md shrink-0">
              <Icon className="h-6 w-6 text-white" />
            </div>
            <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full mb-3 self-start">
              {highlight}
            </span>
            <h3 className="font-bold text-foreground mb-3 text-lg">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed flex-1">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default WhyAlfaslSection;
