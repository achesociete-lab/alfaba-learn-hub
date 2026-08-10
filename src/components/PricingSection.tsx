import { motion, AnimatePresence } from "framer-motion";
import { Check, Zap, Crown, BookOpen, Headphones, Clock, Loader2, Tag, X, GraduationCap, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { usePromoCode } from "@/hooks/usePromoCode";
import HifzApplicationDialog from "@/components/HifzApplicationDialog";

// À remplacer après création dans Stripe dashboard
const ANNUAL_PRICE_IDS = {
  essentiel: "ANNUAL_ESSENTIEL_PRICE_ID", // 70€/an
  premium: "ANNUAL_PREMIUM_PRICE_ID",     // 115€/an
  famille: "ANNUAL_FAMILLE_PRICE_ID",     // 185€/an
};

export const STRIPE_PLANS = {
  essentiel: {
    price_id: "price_1TLAA8KXotpKdlTPXckHIYZl",
    product_id: "prod_UJnlNTP9hF3J5Q",
    price: 7,
  },
  premium: {
    price_id: "price_1TL9cdKXotpKdlTPxDQaUrF0",
    product_id: "prod_UJnD6AmnqnlxTh",
    price: 12,
  },
  famille: {
    price_id: "price_1TkJIOKXotpKdlTPNgtsDI4a",
    product_id: "",
    price: 19,
  },
} as const;

const ANNUAL_PRICES: Record<"essentiel" | "premium" | "famille", number> = {
  essentiel: 70,
  premium: 115,
  famille: 185,
};

const plans = [
  {
    name: "Découverte",
    price: "Gratuit",
    priceNum: 0,
    period: "",
    subtitle: "Explorez la plateforme librement",
    icon: BookOpen,
    features: [
      "3 premières leçons Niveau 1",
      "QCM de démonstration",
      "1 dictée audio d'essai",
      "Aperçu مساري (lecture seule)",
    ],
    limitations: [
      "Pas de suivi de progression",
      "Pas d'accès Niveau 2",
    ],
    cta: "Commencer gratuitement",
    planKey: null,
    featured: false,
    badge: null,
  },
  {
    name: "Essentiel",
    annualName: "Essentiel Annuel",
    price: "7€",
    priceNum: 7,
    period: "/mois",
    subtitle: "Niveau 1 & 2 complets",
    annualSubtitle: "Engagement annuel · 2 mois offerts",
    icon: Zap,
    features: [
      "Niveau 1 complet (10 leçons)",
      "Niveau 2 complet",
      "Exercices interactifs illimités",
      "Dictées audio progressives",
      "Tuteur IA Musa'id illimité",
      "Suivi de progression complet",
    ],
    limitations: [],
    cta: "Choisir Essentiel",
    annualCta: "Choisir Essentiel Annuel",
    planKey: "essentiel" as const,
    featured: false,
    badge: null,
  },
  {
    name: "Premium",
    annualName: "Premium Annuel",
    price: "12€",
    priceNum: 12,
    period: "/mois",
    subtitle: "Essentiel + مساري (mon chemin)",
    annualSubtitle: "Engagement annuel · 2 mois offerts",
    icon: Crown,
    features: [
      "Tout le plan Essentiel inclus",
      "مساري — Parcours personnalisé par IA",
      "Flashcards & exercices ciblés",
      "Devoirs avec correction automatique",
      "Plan hebdomadaire sur mesure",
      "Rapport de progression par email",
    ],
    limitations: [],
    cta: "Choisir Premium",
    annualCta: "Choisir Premium Annuel",
    planKey: "premium" as const,
    featured: true,
    badge: "Le plus populaire",
  },
  {
    name: "Famille",
    annualName: "Famille Annuel",
    price: "19€",
    priceNum: 19,
    period: "/mois",
    subtitle: "Premium pour toute la famille",
    annualSubtitle: "Engagement annuel · 2 mois offerts",
    icon: Users,
    features: [
      "Tout le plan Premium inclus",
      "Jusqu'à 5 profils",
      "Tableau de bord famille",
      "Suivi individuel par profil",
    ],
    limitations: [],
    cta: "Choisir Famille",
    annualCta: "Choisir Famille Annuel",
    planKey: "famille" as const,
    featured: false,
    badge: null,
  },
];

const stats = [
  { icon: BookOpen, value: "2", label: "séances Hifd / semaine" },
  { icon: Headphones, value: "60", label: "hizb suivis" },
];

const TICKER_ITEMS = [
  "📗 Cours d'arabe dès le niveau débutant",
  "🌙 Programme Hifd — 2 séances individuelles / semaine",
  "✅ Sans engagement · Résiliable à tout moment",
  "🤖 Tuteur IA disponible 24h/24",
  "📖 60 hizb suivis hizb par hizb",
  "🎓 Professeur dédié pour votre mémorisation",
  "🇫🇷 Entièrement en français",
];

const ROTATING_WORDS = ["l'arabe.", "le Coran.", "avec ALFASL."];

function RotatingWord() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % ROTATING_WORDS.length), 2800);
    return () => clearInterval(t);
  }, []);
  return (
    <span className="relative inline-block min-w-[200px] text-left">
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
          className="text-gradient-gold inline-block"
        >
          {ROTATING_WORDS[index]}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

function Ticker() {
  const items = [...TICKER_ITEMS, ...TICKER_ITEMS];
  return (
    <div className="overflow-hidden bg-emerald-950 py-3 mb-10 -mx-4 sm:-mx-0 sm:rounded-xl">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
      >
        {items.map((item, i) => (
          <span key={i} className="text-emerald-200 text-sm font-medium shrink-0">
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}

function CountUp({ target }: { target: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      let start = 0;
      const step = Math.ceil(target / 40);
      const t = setInterval(() => {
        start = Math.min(start + step, target);
        setCount(start);
        if (start >= target) clearInterval(t);
      }, 30);
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count}</span>;
}

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
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");
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

  const getPriceId = (planKey: "essentiel" | "premium" | "famille") => {
    if (billingCycle === "annual") return ANNUAL_PRICE_IDS[planKey];
    return STRIPE_PLANS[planKey].price_id;
  };

  const handleCheckout = async (planKey: "essentiel" | "premium" | "famille") => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const priceId = getPriceId(planKey);
    if (!priceId || priceId.startsWith("ANNUAL_")) {
      toast.error("Ce plan annuel n'est pas encore disponible. Revenez bientôt !");
      return;
    }

    setLoadingPlan(planKey);
    try {
      const body: Record<string, any> = { priceId };
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
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-xs font-semibold tracking-widest uppercase text-primary mb-3"
          >
            Cours d'arabe & Hifd al-Qur'ān
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold text-foreground mb-4"
          >
            Apprenez{" "}
            <RotatingWord />
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted-foreground max-w-2xl mx-auto text-lg mb-8"
          >
            ALFASL propose des cours d'arabe en ligne pour francophones et un programme de mémorisation du Coran avec professeur dédié. Commencez gratuitement.
          </motion.p>
          <Ticker />
        </div>

        {/* Billing toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="flex items-center justify-center gap-3 mb-10"
        >
          <button
            onClick={() => setBillingCycle("monthly")}
            className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billingCycle === "monthly"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Mensuel
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold transition-all ${
              billingCycle === "annual"
                ? "bg-primary text-primary-foreground shadow"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Annuel
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
              billingCycle === "annual"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-emerald-100 text-emerald-700"
            }`}>
              2 mois offerts
            </span>
          </button>
        </motion.div>

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
              <div className="text-2xl font-bold text-foreground">
                <CountUp target={Number(s.value)} />
              </div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </motion.div>

        {/* Pricing cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-20">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isLoading = loadingPlan === plan.planKey;
            const isAnnual = billingCycle === "annual" && plan.planKey !== null;
            const annualPrice = plan.planKey ? ANNUAL_PRICES[plan.planKey] : null;
            const displayedBasePrice = isAnnual && annualPrice ? annualPrice : plan.priceNum;
            const discountedPrice = displayedBasePrice > 0 ? getDiscountedPrice(displayedBasePrice) : null;

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

                {isAnnual && (
                  <div className="absolute -top-3 right-4">
                    <span className="text-xs font-bold text-white bg-emerald-600 px-3 py-1 rounded-full shadow-md whitespace-nowrap">
                      2 mois offerts
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-3 mb-4 mt-1">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    plan.featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
                  }`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-foreground">{isAnnual && plan.annualName ? plan.annualName : plan.name}</h3>
                </div>

                <div className="mb-1">
                  {discountedPrice ? (
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-3xl font-extrabold text-primary">€{discountedPrice}</span>
                      <span className="text-sm text-muted-foreground line-through">
                        {isAnnual ? `${annualPrice}€` : plan.price}
                      </span>
                      {!isAnnual && plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                      {isAnnual && <span className="text-sm text-muted-foreground">/an</span>}
                    </div>
                  ) : isAnnual && annualPrice ? (
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-3xl font-extrabold text-foreground">{annualPrice}€</span>
                      <span className="text-sm text-muted-foreground">/an</span>
                      <span className="text-xs text-muted-foreground/70 line-through ml-1">
                        {plan.priceNum * 12}€
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-3xl font-extrabold text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-sm text-muted-foreground">{plan.period}</span>}
                    </>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mb-5">{isAnnual && plan.annualSubtitle ? plan.annualSubtitle : plan.subtitle}</p>

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
                    onClick={() => handleCheckout(plan.planKey as "essentiel" | "premium" | "famille")}
                    disabled={isLoading}
                    className={
                      plan.featured
                        ? "gradient-emerald border-0 text-primary-foreground w-full h-11 text-sm font-semibold"
                        : "w-full h-11 text-sm font-semibold"
                    }
                    variant={plan.featured ? "default" : "outline"}
                  >
                    {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                    {isLoading ? "Redirection..." : (isAnnual && plan.annualCta ? plan.annualCta : plan.cta)}
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
                <span className="text-sm font-semibold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
                  Paiement direct — contact d'abord
                </span>
              </div>
              <p className="text-sm text-amber-800/80 mb-5 mt-3">
                2 séances individuelles par semaine avec votre professeur. Le paiement se fait directement (PayPal / virement) après votre premier échange.
              </p>
              <HifzApplicationDialog
                triggerClassName="w-full h-11 text-sm font-semibold bg-gradient-to-r from-emerald-700 to-amber-700 hover:opacity-90 border-0 text-white rounded-md inline-flex items-center justify-center"
                triggerLabel="Demander à rejoindre le programme"
              />
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
