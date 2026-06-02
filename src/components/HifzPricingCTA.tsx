import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const included = [
  "2 séances individuelles par semaine (8/mois)",
  "Évaluation et compte-rendu après chaque séance",
  "Suivi des 60 hizb avec tableau de bord dédié",
  "Calendrier de réservation en ligne",
  "Rappels quotidiens de révision",
  "Programme structuré sur 3 piliers",
];

const otherPlans = [
  { name: "Découverte", price: "Gratuit", desc: "3 premières leçons d'arabe", to: "/niveau-1" },
  { name: "Essentiel", price: "7€/mois", desc: "Niveaux 1 & 2 + Tuteur IA", to: "/auth" },
  { name: "Premium", price: "15€/mois", desc: "Essentiel + module Coran", to: "/auth" },
];

const HifzPricingCTA = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">Tarifs</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Un investissement clair,<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">pour un hifd à vie</span>
        </h2>
      </motion.div>

      {/* Hifd card — hero */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto mb-10"
      >
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-950 to-emerald-900 p-8 sm:p-10 shadow-2xl border border-emerald-700/50">
          {/* Gold top bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-amber-400 block mb-2">Programme spécialisé</span>
              <h3 className="text-2xl font-bold text-white mb-1">Hifd al-Qur'ān</h3>
              <p className="text-emerald-300/70 text-sm">2 séances individuelles / semaine</p>
            </div>
            <div className="text-right shrink-0">
              <div className="text-5xl font-extrabold text-white">79€</div>
              <div className="text-emerald-400 text-sm mt-1">/ mois · sans engagement</div>
              <div className="text-emerald-500/60 text-xs mt-0.5">soit 9,87€ la séance</div>
            </div>
          </div>

          <ul className="grid sm:grid-cols-2 gap-3 mb-8">
            {included.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-emerald-100/90">
                <Check className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>

          <Button asChild size="lg" className="w-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 font-bold text-base h-14 rounded-xl border-0 shadow-lg shadow-amber-500/20">
            <Link to="/hifz">
              S'inscrire au programme Hifd <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>

          <p className="text-center text-xs text-emerald-500/60 mt-4">Sans engagement · Résiliable à tout moment</p>
        </div>
      </motion.div>

      {/* Other plans */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto"
      >
        <p className="text-center text-sm text-muted-foreground mb-5">Vous souhaitez d'abord apprendre l'arabe ?</p>
        <div className="grid grid-cols-3 gap-4">
          {otherPlans.map(({ name, price, desc, to }) => (
            <Link
              key={name}
              to={to}
              className="group flex flex-col items-center text-center p-5 rounded-2xl border border-border hover:border-emerald-300 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-all duration-200"
            >
              <span className="font-bold text-foreground text-base mb-1">{name}</span>
              <span className="text-emerald-600 font-bold text-base mb-1.5">{price}</span>
              <span className="text-sm text-muted-foreground">{desc}</span>
            </Link>
          ))}
        </div>
        <p className="text-center mt-5">
          <Link to="/tarifs" className="text-sm font-medium text-primary hover:underline inline-flex items-center gap-1">
            Voir tous les détails <ArrowRight className="h-4 w-4" />
          </Link>
        </p>
      </motion.div>
    </div>
  </section>
);

export default HifzPricingCTA;
