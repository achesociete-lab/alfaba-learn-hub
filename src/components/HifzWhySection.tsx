import { motion } from "framer-motion";
import { Calendar, ClipboardCheck, LayoutDashboard, UserCheck } from "lucide-react";

const reasons = [
  {
    icon: UserCheck,
    title: "Un vrai professeur, pas un algorithme",
    desc: "Chaque séance se passe avec votre professeur en visio. Il entend votre récitation, corrige vos erreurs de tajwid et adapte le rythme à votre niveau.",
    highlight: "2 séances/semaine",
  },
  {
    icon: ClipboardCheck,
    title: "Évaluation après chaque séance",
    desc: "À chaque séance, vos hizb sont évalués et notés. Vous recevez un compte-rendu détaillé pour savoir exactement où vous en êtes.",
    highlight: "Compte-rendu inclus",
  },
  {
    icon: LayoutDashboard,
    title: "Application dédiée",
    desc: "Votre progression est visible en temps réel : hizb mémorisés, évaluations, historique des séances, cadence recommandée. Tout au même endroit.",
    highlight: "60 hizb tracés",
  },
  {
    icon: Calendar,
    title: "Vous réservez quand vous voulez",
    desc: "Le calendrier de réservation est intégré dans l'application. Vous choisissez vos créneaux directement, sans email ni intermédiaire.",
    highlight: "Réservation en ligne",
  },
];

const HifzWhySection = () => (
  <section className="py-24 bg-muted/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">Pourquoi ALFASL</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ce qui rend notre programme <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">différent</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          La plupart des plateformes proposent 1 séance/semaine en groupe. Nous faisons 2 séances individuelles, avec un vrai suivi.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {reasons.map(({ icon: Icon, title, desc, highlight }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="bg-background rounded-2xl p-7 border border-border hover:border-emerald-200 hover:shadow-lg transition-all duration-300 flex gap-5"
          >
            <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 flex items-center justify-center shadow-md">
              <Icon className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2 py-0.5 rounded-full mb-2">
                {highlight}
              </span>
              <h3 className="font-bold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HifzWhySection;
