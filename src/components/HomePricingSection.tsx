import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Découverte",
    price: "Gratuit",
    period: "",
    desc: "Pour commencer sans engagement",
    features: ["3 premières leçons", "QCM de démonstration", "Tuteur IA (aperçu)"],
    cta: "Commencer gratuitement",
    to: "/auth",
    highlight: false,
    dark: false,
  },
  {
    name: "Essentiel",
    price: "7€",
    period: "/mois",
    desc: "L'arabe du Coran, de A à Z",
    features: ["Niveaux 1 & 2 complets", "Tuteur IA inclus", "Exercices illimités"],
    cta: "Choisir Essentiel",
    to: "/auth",
    highlight: false,
    dark: false,
  },
  {
    name: "Premium",
    price: "15€",
    period: "/mois",
    desc: "Avec correction par l'enseignant",
    features: ["Tout Essentiel +", "Correction récitation", "Module Coran inclus"],
    cta: "Choisir Premium",
    to: "/auth",
    highlight: true,
    dark: false,
  },
  {
    name: "Hifd al-Qur'ān",
    price: "79€",
    period: "/mois",
    desc: "Programme de mémorisation intensif",
    features: [
      "2 séances individuelles / semaine",
      "Professeur dédié en visio",
      "60 hizb suivis",
      "Sans engagement",
    ],
    cta: "S'inscrire au Hifd",
    to: "/hifz",
    highlight: false,
    dark: true,
  },
];

const HomePricingSection = () => (
  <section id="tarifs" className="py-24 bg-muted/30">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
          Tarifs
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Des formules pour{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            tous les profils
          </span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Commencez gratuitement, évoluez à votre rythme. Résiliable à tout moment.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
            className={`relative rounded-2xl p-6 flex flex-col border transition-all duration-300 ${
              plan.dark
                ? "bg-gradient-to-br from-emerald-950 to-emerald-900 border-emerald-700/50 text-white"
                : plan.highlight
                ? "bg-background border-emerald-400 shadow-lg shadow-emerald-100 dark:shadow-emerald-900/30"
                : "bg-background border-border hover:border-emerald-200 hover:shadow-md"
            }`}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full whitespace-nowrap">
                Populaire
              </div>
            )}
            {plan.dark && (
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400 rounded-t-2xl" />
            )}

            <div className="mb-5">
              <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${plan.dark ? "text-amber-400" : "text-emerald-600"}`}>
                {plan.name}
              </p>
              <div className="flex items-end gap-1">
                <span className={`text-4xl font-extrabold ${plan.dark ? "text-white" : "text-foreground"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm mb-1.5 ${plan.dark ? "text-emerald-400" : "text-muted-foreground"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <p className={`text-sm mt-1 ${plan.dark ? "text-emerald-300/70" : "text-muted-foreground"}`}>
                {plan.desc}
              </p>
            </div>

            <ul className="space-y-2.5 mb-6 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm">
                  <Check className={`h-4 w-4 shrink-0 mt-0.5 ${plan.dark ? "text-amber-400" : "text-emerald-600"}`} />
                  <span className={plan.dark ? "text-emerald-100/90" : "text-muted-foreground"}>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              asChild
              className={
                plan.dark
                  ? "w-full bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 font-bold border-0"
                  : plan.highlight
                  ? "w-full bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 font-semibold"
                  : "w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              }
              variant={plan.dark || plan.highlight ? "default" : "outline"}
            >
              <Link to={plan.to}>
                {plan.cta} <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="text-center mt-8">
        <Link
          to="/tarifs"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          Voir tous les détails <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  </section>
);

export default HomePricingSection;
