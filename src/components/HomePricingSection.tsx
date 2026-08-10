import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import HifzApplicationDialog from "@/components/HifzApplicationDialog";
import { STRIPE_PLANS } from "@/components/PricingSection";

// À remplacer après création dans Stripe dashboard
const ANNUAL_PRICE_IDS = {
  essentiel: "ANNUAL_ESSENTIEL_PRICE_ID", // 70€/an
  premium: "ANNUAL_PREMIUM_PRICE_ID",     // 115€/an
  famille: "ANNUAL_FAMILLE_PRICE_ID",     // 185€/an
};

type PlanKey = "essentiel" | "premium" | "famille";

const ANNUAL_PRICES: Record<PlanKey, number> = {
  essentiel: 70,
  premium: 115,
  famille: 185,
};

const plans: Array<{
  name: string; annualName?: string; price: string; annualPrice: string; lines: string[];
  buttonLabel: string; annualButtonLabel?: string; planKey: PlanKey | null; filled: boolean; popular: boolean;
}> = [
  { name: "Découverte", price: "Gratuit", annualPrice: "Gratuit", lines: ["3 premières leçons N1", "Aperçu مساري (lecture seule)"], buttonLabel: "Commencer gratuitement", planKey: null, filled: false, popular: false },
  { name: "Essentiel", annualName: "Essentiel Annuel", price: "7€/mois", annualPrice: "70€/an", lines: ["Niveau 1 & 2 complets", "Tuteur IA Musa'id illimité"], buttonLabel: "Choisir Essentiel", annualButtonLabel: "Choisir Essentiel Annuel", planKey: "essentiel", filled: false, popular: false },
  { name: "Premium", annualName: "Premium Annuel", price: "12€/mois", annualPrice: "115€/an", lines: ["Tout Essentiel +", "مساري complet (parcours, devoirs, suivi)"], buttonLabel: "Choisir Premium", annualButtonLabel: "Choisir Premium Annuel", planKey: "premium", filled: true, popular: true },
  { name: "Famille", annualName: "Famille Annuel", price: "19€/mois", annualPrice: "185€/an", lines: ["Premium complet", "Jusqu'à 5 profils"], buttonLabel: "Choisir Famille", annualButtonLabel: "Choisir Famille Annuel", planKey: "famille", filled: false, popular: false },
];

const HomePricingSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);
  const [billingCycle, setBillingCycle] = useState<"monthly" | "annual">("monthly");

  const getPriceId = (planKey: PlanKey) => {
    if (billingCycle === "annual") return ANNUAL_PRICE_IDS[planKey];
    return STRIPE_PLANS[planKey].price_id;
  };

  const handleCheckout = async (planKey: PlanKey) => {
    if (!user) { navigate("/auth"); return; }
    const priceId = getPriceId(planKey);
    if (!priceId || priceId.startsWith("ANNUAL_")) {
      toast.error("Ce plan annuel n'est pas encore disponible.");
      return;
    }
    setLoadingPlan(planKey);
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", { body: { priceId } });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      toast.error("Erreur lors de la création du paiement.");
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section className="py-20 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Des formules pour <span className="text-gradient-gold">tous les profils</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">Commencez gratuitement, évoluez à votre rythme</p>
        </div>

        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
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
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-8">
          {plans.map((plan, i) => {
            const isAnnual = billingCycle === "annual" && plan.planKey !== null;
            const displayPrice = isAnnual ? plan.annualPrice : plan.price;

            return (
              <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
                <Card className={`h-full relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
                  {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Populaire</Badge>}
                  {isAnnual && plan.planKey && (
                    <Badge className="absolute -top-3 right-3 bg-emerald-600 text-white text-xs">2 mois offerts</Badge>
                  )}
                  <CardHeader className="text-center pb-2">
                    <CardTitle className="text-lg">{isAnnual && plan.annualName ? plan.annualName : plan.name}</CardTitle>
                    <p className="text-2xl font-bold text-foreground mt-2">{displayPrice}</p>
                    {isAnnual && plan.planKey && (
                      <p className="text-xs text-muted-foreground line-through">
                        {STRIPE_PLANS[plan.planKey].price * 12}€/an
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="text-center space-y-4">
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      {plan.lines.map((l, j) => <li key={j}>{l}</li>)}
                    </ul>
                    {plan.planKey ? (
                      <Button
                        onClick={() => handleCheckout(plan.planKey!)}
                        disabled={loadingPlan === plan.planKey}
                        className={plan.filled ? "w-full gradient-emerald border-0 text-primary-foreground" : "w-full border-primary text-primary hover:bg-primary/5"}
                        variant={plan.filled ? "default" : "outline"}
                      >
                        {loadingPlan === plan.planKey
                          ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Redirection...</>
                          : (isAnnual && plan.annualButtonLabel ? plan.annualButtonLabel : plan.buttonLabel)}
                      </Button>
                    ) : (
                      <Button asChild className="w-full border-primary text-primary hover:bg-primary/5" variant="outline">
                        <Link to="/auth">{plan.buttonLabel}</Link>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Hifd */}
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="max-w-md mx-auto mt-6 p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-amber-50/60 text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Programme spécialisé</p>
          <p className="font-bold text-lg text-emerald-900 mb-1">Hifd al-Qur'ān</p>
          <p className="text-sm text-amber-800/70 mb-3">Tarif fixé avec le professeur · Inscription par candidature</p>
          <HifzApplicationDialog
            triggerClassName="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-amber-700 text-white text-sm font-semibold hover:opacity-90 transition"
            triggerLabel="Demander à rejoindre →"
          />
        </motion.div>

        <div className="text-center mt-8">
          <Link to="/tarifs" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Voir tous les détails <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default HomePricingSection;
