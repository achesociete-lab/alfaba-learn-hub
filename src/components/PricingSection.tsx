import { motion } from "framer-motion";
import { Check, Zap, Crown, BookOpen, Headphones, Clock, Loader2, Tag, X, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { toast } from "sonner";
import { usePromoCode } from "@/hooks/usePromoCode";

export const STRIPE_PLANS = {
  essentiel: {
    price_id: "price_1TLAA8KXotpKdlTPXckHIYZl",
    product_id: "prod_UJnlNTP9hF3J5Q",
    price: 7,
  },
  premium: {
    price_id: "price_1TLAAUKXotpKdlTP01ELN0ky",
    product_id: "prod_UJnmdJC4o0hInW",
    price: 15,
  },
  hifz: {
    price_id: "price_1TdpPgKXotpKdlTPO74jJFBb",
    product_id: "prod_Uc1RFQIChfKUTr",
    price: 79,
  },
} as const;

const plans = [
  {
    name: "Découverte",
    price: "Gratuit",
    priceNum: 0,
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
    priceNum: 7,
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
    priceNum: 15,
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
  { icon: BookOpen, value: "2", label: "séances Hifd / semaine" },
  { icon: Headphones, value: "60", label: "hizb suivis" },
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
  const [promoInput, setPromoInput] = useState("");
  const [validatingPromo, setValidatingPromo] = useState(false);
  const { validate, clear, result: promoResult } = usePromoCode();

  const handleValidatePromo = async () => {
    if (!promoInput.trim()) return;
    setValidatingPromo(true);
    const r = await validate(promoInput);
    if (r.valid) {
      toast.success(r.message);
    } else if (r.message) {
      toast.error(r.message);
    }
    setValidatingPromo(false);
  };

  const clearPromo = () => {
    setPromoInput("");
    clear();
  };

  const getDiscountedPrice = (basePrice: number) => {
    if (!promoResult?.valid || !promoResult.discount || basePrice === 0) return null;
    const discounted = basePrice * (1 - promoResult.discount / 100);
    return discounted.toFixed(2);
  };

  const handleCheckout = async (planKey: "essentiel" | "premium" | "hifz") => {
    if (!user) {
      navigate("/auth");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const body: Record<string, any> = { priceId: STRIPE_PLANS[planKey].price_id };
      if (promoResult?.valid && promoResult.codeId) {
        body.promoCodeId = promoResult.codeId;
      }

      const { data, error } = await supabase.functions.invoke("create-checkout", { body });

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
            Cours d'arabe & Hifd al-Qur'ān
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Apprenez l'arabe.<br />Mémorisez le <span className="text-gradient-gold">Coran.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg"
          >
            ALFASL propose des cours d'arabe en ligne pour francophones et un programme de mémorisation du Coran avec professeur dédié. Commencez gratuitement.
          </motion.p>
        </div>

        {/* Promo code banner */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-md mx-auto mb-10"
        >
          <div className="flex items-center gap-2 p-3 rounded-xl border border-border bg-card">
            <Tag className="h-4 w-4 text-primary shrink-0" />
            <Input
              placeholder="Code promo (ex: ALFASL30)"
              value={promoInput}
              onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === "Enter" && handleValidatePromo()}
              className="border-0 bg-transparent p-0 h-auto font-mono text-sm focus-visible:ring-0 placeholder:font-sans uppercase"
            />
            {promoResult?.valid ? (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-xs font-bold text-green-600 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                  -{promoResult.discount}%
                </span>
                <button onClick={clearPromo} className="text-muted-foreground hover:text-foreground">
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <Button
                size="sm"
                variant="outline"
                onClick={handleValidatePromo}
                disabled={validatingPromo || !promoInput.trim()}
                className="shrink-0 h-8 text-xs"
              >
                {validatingPromo ? <Loader2 className="h-3 w-3 animate-spin" /> : "Appliquer"}
              </Button>
            )}
          </div>
          {promoResult?.valid && (
            <p className="text-center text-xs text-green-600 mt-1.5 font-medium">
              ✓ {promoResult.message} — appliqué à la prochaine étape
            </p>
          )}
        </motion.div>

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
            const discountedPrice = plan.priceNum > 0 ? getDiscountedPrice(plan.priceNum) : null;
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
                  {discountedPrice ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-primary">€{discountedPrice}</span>
                      <span className="text-sm text-muted-foreground line-through">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </>
                  )}
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
                  <Button asChild className="w-full h-11 text-sm font-semibold" variant="outline">
                    <Link to="/auth">{plan.cta}</Link>
                  </Button>
                )}
              </motion.div>
            );
          })}
        </div>

        {/* Hifz — programme spécialisé */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="max-w-5xl mx-auto mb-20"
        >
          <div className="relative rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-amber-50/60 p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start shadow-sm">
            <div className="absolute -top-3.5 left-6">
              <span className="text-xs font-bold text-white bg-gradient-to-r from-emerald-700 to-amber-700 px-4 py-1 rounded-full shadow">
                Programme spécialisé
              </span>
            </div>

            {/* Left: identité & prix */}
            <div className="md:w-72 shrink-0">
              <div className="flex items-center gap-3 mb-3 mt-1">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-emerald-900">Hifd al-Qur'ān</h3>
              </div>
              <div className="mb-1">
                <span className="text-3xl font-extrabold text-emerald-800">79€</span>
                <span className="text-sm text-amber-800/70">/mois</span>
              </div>
              <p className="text-sm text-amber-800/80 mb-5">
                2 séances individuelles par semaine avec votre professeur. Programme complet de mémorisation avec suivi personnalisé.
              </p>
              <Button
                onClick={() => handleCheckout("hifz")}
                disabled={loadingPlan === "hifz" || !STRIPE_PLANS.hifz.price_id}
                className="w-full h-11 text-sm font-semibold bg-gradient-to-r from-emerald-700 to-amber-700 hover:opacity-90 border-0 text-white"
              >
                {loadingPlan === "hifz" ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirection...</>
                ) : !STRIPE_PLANS.hifz.price_id ? (
                  "Bientôt disponible"
                ) : (
                  "S'inscrire au programme"
                )}
              </Button>
            </div>

            {/* Right: features */}
            <ul className="flex-1 grid sm:grid-cols-2 gap-x-6 gap-y-2.5">
              {[
                "Programme de mémorisation personnalisé",
                "Suivi des 60 hizb (Nouvel apprentissage · Révision récente · Révision ancienne)",
                "Séances individuelles avec le professeur",
                "Calendrier de réservation en ligne",
                "Évaluations par séance avec compte-rendu",
                "Tableau de bord de progression détaillé",
                "Programme de mémorisation structuré en 3 piliers",
                "Accès complet au module Hifz",
              ].map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-emerald-900">
                  <Check className="h-4 w-4 text-emerald-600 mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

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
