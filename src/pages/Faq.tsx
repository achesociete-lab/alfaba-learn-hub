import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const faqs = [
  {
    category: "Programme Hifd",
    items: [
      {
        q: "Faut-il déjà savoir lire l'arabe pour rejoindre le programme Hifd ?",
        a: "Oui, une lecture courante du Coran est nécessaire. Si vous débutez, nous vous recommandons de commencer par nos niveaux 1 et 2 pour maîtriser la lecture avant d'intégrer le programme Hifd.",
      },
      {
        q: "Comment se déroulent les séances ?",
        a: "Les séances se passent en visioconférence (Google Meet). Vous récitez devant votre professeur, il corrige votre tajwid, évalue vos hizb et planifie la prochaine portion à mémoriser. Chaque séance dure environ 30 à 45 minutes.",
      },
      {
        q: "Combien de temps faut-il pour mémoriser tout le Coran ?",
        a: "Cela dépend de votre rythme et du temps consacré chaque jour à la révision. Avec 2 séances/semaine et un travail quotidien régulier, comptez en moyenne entre 3 et 5 ans. Le programme s'adapte à votre cadence personnelle.",
      },
    ],
  },
  {
    category: "Abonnement & Tarifs",
    items: [
      {
        q: "Puis-je annuler mon abonnement à tout moment ?",
        a: "Oui, sans engagement et sans frais. Vous pouvez résilier depuis votre espace personnel ou en nous contactant directement. La résiliation prend effet à la fin de la période en cours.",
      },
      {
        q: "Puis-je changer de formule à tout moment ?",
        a: "Oui, vous pouvez upgrader ou changer de formule à tout moment. Le changement prend effet immédiatement.",
      },
      {
        q: "Comment fonctionne l'essai gratuit ?",
        a: "Le plan Découverte est gratuit et illimité dans le temps. Vous accédez aux 3 premières leçons pour tester la méthode, sans carte bancaire requise.",
      },
      {
        q: "Comment gérer mon abonnement ?",
        a: "Depuis votre tableau de bord, vous pouvez gérer, modifier ou annuler votre abonnement à tout moment via le portail sécurisé.",
      },
    ],
  },
  {
    category: "Cours d'arabe",
    items: [
      {
        q: "Faut-il des prérequis pour commencer le Niveau 1 ?",
        a: "Aucun prérequis. Le Niveau 1 part de zéro : vous apprenez l'alphabet arabe, la lecture et l'écriture des lettres, progressivement.",
      },
      {
        q: "Combien de leçons y a-t-il par niveau ?",
        a: "Chaque niveau contient 10 leçons structurées. Le Niveau 1 couvre les fondations (alphabet, lecture, écriture). Le Niveau 2 approfondit la grammaire et la compréhension de texte.",
      },
      {
        q: "Le tuteur IA est-il vraiment utile ?",
        a: "Oui — Musa'id Al-Moalim répond à vos questions en temps réel, corrige vos exercices et s'adapte à votre niveau. Il est inclus dans tous les plans payants.",
      },
    ],
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
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="px-5 pb-5">
          <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
};

const Faq = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="container mx-auto px-4 pt-32 pb-20 max-w-3xl">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
          Aide
        </span>
        <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Questions{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            fréquentes
          </span>
        </h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Tout ce que vous devez savoir sur ALFASL, les cours d'arabe et le programme Hifd.
        </p>
      </motion.div>

      <div className="space-y-12">
        {faqs.map((section, si) => (
          <motion.div
            key={section.category}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: si * 0.1 }}
          >
            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-600 mb-4">
              {section.category}
            </h2>
            <div className="space-y-3">
              {section.items.map((faq, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06 }}
                >
                  <FaqItem q={faq.q} a={faq.a} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
    <Footer />
  </div>
);

export default Faq;
