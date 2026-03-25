import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Présentiel",
    price: "Inclus",
    subtitle: "Pour les élèves inscrits en classe",
    features: [
      "Accès aux cours de votre niveau",
      "Dépôt de devoirs en ligne",
      "Consultation des notes",
      "Émargement numérique",
      "Ressources complémentaires",
    ],
    cta: "Accéder",
    featured: false,
  },
  {
    name: "E-learning",
    price: "29€",
    subtitle: "par mois — Accès complet en ligne",
    features: [
      "Tous les cours en vidéo",
      "Exercices interactifs illimités",
      "Dictées audio progressives",
      "Suivi de progression personnalisé",
      "Accès communauté d'apprenants",
      "Certificat de fin de niveau",
    ],
    cta: "S'inscrire",
    featured: true,
  },
  {
    name: "E-learning Premium",
    price: "49€",
    subtitle: "par mois — Avec accompagnement",
    features: [
      "Tout le plan E-learning",
      "Corrections personnalisées",
      "Sessions de questions/réponses live",
      "Accès aux 2 niveaux simultanément",
      "Support prioritaire",
    ],
    cta: "S'inscrire",
    featured: false,
  },
];

const PricingSection = () => (
  <section className="py-20 geometric-pattern" id="tarifs">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Des formules pour <span className="text-gradient-gold">chaque besoin</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Que vous soyez en classe ou à distance, trouvez la formule qui vous convient.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`rounded-xl p-8 border flex flex-col ${
              plan.featured
                ? "border-primary bg-primary/5 shadow-xl scale-[1.02]"
                : "border-border bg-card"
            }`}
          >
            {plan.featured && (
              <div className="text-xs font-semibold text-primary-foreground bg-primary px-3 py-1 rounded-full self-start mb-4">
                Populaire
              </div>
            )}
            <h3 className="font-display text-xl font-bold text-foreground">{plan.name}</h3>
            <div className="mt-2 mb-1">
              <span className="text-3xl font-bold text-foreground">{plan.price}</span>
            </div>
            <p className="text-sm text-muted-foreground mb-6">{plan.subtitle}</p>

            <ul className="space-y-3 flex-1 mb-8">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Button
              className={
                plan.featured
                  ? "gradient-emerald border-0 text-primary-foreground w-full"
                  : "w-full"
              }
              variant={plan.featured ? "default" : "outline"}
            >
              {plan.cta}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default PricingSection;
