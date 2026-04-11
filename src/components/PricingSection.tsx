import { motion } from "framer-motion";
import { Check, Zap, Crown, BookOpen, Headphones, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";

export const STRIPE_PLANS = {
  essentiel: {
    price_id: "price_1TLAA8KXotpKdlTPXckHIYZl",
    product_id: "prod_UJnlNTP9hF3J5Q",
  },
  premium: {
    price_id: "price_1TLAAUKXotpKdlTP01ELN0ky",
    product_id: "prod_UJnmdJC4o0hInW",
  },
} as const;

const plans = [
  {
    name: "Découverte",
    price: "Gratuit",
    period: "",
    subtitle: "Explorez la plateforme librement",
    icon: BookOpen,
    features: [
      "Accès aux 3 premières leçons",
      "QCM de démonstration",
      "1 dictée audio d'essai",
      "Aperçu du module Coran",
    ],
    limitations: [
      "Pas de suivi de progression",
      "Pas d'enregistrement vocal",
    ],
    cta: "Commencer gratuitement",
    planKey: null,
    featured: false,
    badge: null,
  },
  {
    name: "Essentiel",
    price: "7€",
    period: "/mois",
    subtitle: "L'apprentissage à votre rythme",
    icon: Zap,
    features: [
      "Tous les cours Niveau 1 & 2",
      "Exercices interactifs illimités",
      "Dictées audio progressives",
      "Suivi de progression complet",
      "Professeur Virtuel IA",
      "Support par email",
    ],
    limitations: [],
    cta: "Choisir Essentiel",
    planKey: "essentiel" as const,
    featured: false,
    badge: null,
  },
  {
    name: "Premium",
    price: "15€",
    period: "/mois",
    subtitle: "L'expérience complète",
    icon: Crown,
    features: [
      "Tout le plan Essentiel inclus",
      "Module Coran avec IA de récitation",
      "Corrections personnalisées par l'enseignant",
      "Classe virtuelle interactive",
      "Certificat de fin de niveau",
      "Support prioritaire",
    ],
    limitations: [],
    cta: "Choisir Premium",
    planKey: "premium" as const,
    featured: true,
    badge: "Le plus populaire",
  },
];

const stats = [
  { icon: BookOpen, value: "24", label: "Leçons complètes" },
  { icon: Headphones, value: "100+", label: "Exercices audio" },
];

const faqs = [
  {
    q: "Puis-je changer de formule à tout moment ?",
    a: "Oui, vous pouvez upgrader ou changer de formule à tout moment. Le changement prend effet immédiatement.",
  },
  {
    q: "Y a-t-il un engagement minimum ?",
    a: "Non, tous nos abonnements sont sans engagement. Vous pouvez annuler à tout moment.",
  },
  {
    q: "Comment fonctionne l'essai gratuit ?",
    a: "Le plan Découverte est gratuit et illimité dans le temps. Vous accédez aux 3 premières leçons pour tester la méthode.",
  },
  {
    q: "Comment gérer mon abonnement ?",
    a: "Depuis votre tableau de bord, vous pouvez gérer, modifier ou annuler votre abonnement à tout moment via le portail sécurisé.",
  },
];

const PricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);

  const handleCheckout = async (planKey: "essentiel" | "premium") => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { priceId: STRIPE_PLANS[planKey].price_id },
      });

      if (error) throw error;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      toast.error("Erreur lors de la création du paiement. Veuillez réessayer.");
      console.error(err);
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="py-20 geometric-pattern" id="tarifs">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-6">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3"
          >
            Tarifs transparents
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Investissez dans votre <span className="text-gradient-gold">savoir</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            Choisissez la formule adaptée à vos objectifs. Commencez gratuitement, évoluez à votre rythme.
          </motion.p>
        </div>

        {/* Stats bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 gap-4 max-w-md mx-auto mb-16"
        >
          {stats.map((s) => (
            <div key={s.label} className="text-center py-4">
              <s.icon className="h-5 w-5 text-primary mx-auto mb-1" />
              <div className="text-2xl font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-20">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.planKey;
            return (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-2xl p-6 border flex flex-col transition-shadow hover:shadow-xl ${
                  plan.featured
                    ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                    : "border-border bg-card hover:border-primary/30"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="text-xs font-bold text-primary-foreground bg-primary px-4 py-1 rounded-full shadow-md whitespace-nowrap">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4 mt-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{plan.name}</h3>
                </div>

                <div className="mb-1">
                  <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                  {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                </div>
                <p className="text-sm text-muted-foreground mb-5">{plan.subtitle}</p>

                <ul className="space-y-2.5 flex-1 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                      {f}
                    </li>
                  ))}
                  {plan.limitations.map((l) => (
                    <li key={l} className="flex items-start gap-2 text-sm text-muted-foreground/60 line-through">
                      <Check className="h-4 w-4 text-muted-foreground/30 mt-0.5 shrink-0" />
                      {l}
                    </li>
                  ))}
                </ul>

                {plan.planKey ? (
                  <Button
                    onClick={() => handleCheckout(plan.planKey!)}
                    disabled={isLoading}
                    className={
                      plan.featured
                        ? "gradient-emerald border-0 text-primary-foreground w-full h-11 text-sm font-semibold"
                        : "w-full h-11 text-sm font-semibold"
                    }
                    variant={plan.featured ? "default" : "outline"}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isLoading ? "Redirection..." : plan.cta}
                  </Button>
                ) : (
                  <Button
                    asChild
                    className="w-full h-11 text-sm font-semibold"
                    variant="outline"
                  >
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        <div className="max-w-2xl mx-auto mb-16">
          <h3 className="text-center text-xl font-bold text-foreground mb-8">
            Questions <span className="text-gradient-gold">fréquentes</span>
          </h3>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <motion.details
                key={i}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group bg-card border border-border rounded-xl overflow-hidden"
              >
                <summary className="px-6 py-4 cursor-pointer text-sm font-semibold text-foreground flex items-center justify-between list-none">
                  {faq.q}
                  <span className="text-primary transition-transform group-open:rotate-45 text-lg">+</span>
                </summary>
                <div className="px-6 pb-4 text-sm text-muted-foreground">{faq.a}</div>
              </motion.details>
            ))}
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center bg-primary/5 border border-primary/20 rounded-2xl p-10 max-w-2xl mx-auto"
        >
          <Clock className="h-8 w-8 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Prêt à commencer votre apprentissage ?
          </h3>
          <p className="text-muted-foreground mb-6">
            Commencez gratuitement, sans engagement.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild className="gradient-emerald border-0 text-primary-foreground h-12 px-8 text-base font-semibold">
              <Link to="/auth">Créer mon compte gratuit</Link>
            </Button>
            <Button asChild variant="outline" className="h-12 px-8 text-base">
              <Link to="/niveau-1">Voir les cours</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default PricingSection;
