import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Faut-il déjà savoir lire l'arabe pour rejoindre le programme Hifd ?",
    a: "Oui, une lecture courante du Coran est nécessaire. Si vous débutez, nous vous recommandons de commencer par nos niveaux 1 et 2 pour maîtriser la lecture avant d'intégrer le programme Hifd.",
  },
  {
    q: "Comment se déroulent les séances ?",
    a: "Les séances se passent en visioconférence (Google Meet). Vous récitez devant votre professeur, il corrige votre tajwid, évalue vos hizb et planifie la prochaine portion à mémoriser. Chaque séance dure environ 30 à 45 minutes.",
  },
  {
    q: "Puis-je annuler mon abonnement à tout moment ?",
    a: "Oui, sans engagement et sans frais. Vous pouvez résilier depuis votre espace personnel ou en nous contactant directement. La résiliation prend effet à la fin de la période en cours.",
  },
  {
    q: "Combien de temps faut-il pour mémoriser tout le Coran ?",
    a: "Cela dépend de votre rythme et du temps consacré chaque jour à la révision. Avec 2 séances/semaine et un travail quotidien régulier, comptez en moyenne entre 3 et 5 ans. Le programme s'adapte à votre cadence personnelle.",
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-muted/50 transition-colors"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-sm sm:text-base">{q}</span>
        <ChevronDown className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

const HifzFaqSection = () => (
  <section className="py-24 bg-muted/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">Questions fréquentes</h2>
      </motion.div>

      <div className="max-w-2xl mx-auto space-y-3">
        {faqs.map((faq, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <FaqItem q={faq.q} a={faq.a} />
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HifzFaqSection;
