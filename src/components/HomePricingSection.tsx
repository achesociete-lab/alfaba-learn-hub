import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import HifzApplicationDialog from "@/components/HifzApplicationDialog";

const plans = [
  { name: "Découverte", price: "Gratuit", lines: ["3 premières leçons N1", "Aperçu مساري (lecture seule)"], buttonLabel: "Commencer gratuitement", to: "/auth", filled: false, popular: false },
  { name: "Essentiel", price: "7€/mois", lines: ["Niveau 1 & 2 complets", "Tuteur IA Musa'id illimité"], buttonLabel: "Choisir Essentiel", to: "/tarifs", filled: false, popular: false },
  { name: "Premium", price: "12€/mois", lines: ["Tout Essentiel +", "مساري complet (parcours, devoirs, suivi)"], buttonLabel: "Choisir Premium", to: "/tarifs", filled: true, popular: true },
  { name: "Famille", price: "19€/mois", lines: ["Premium complet", "Jusqu'à 5 profils"], buttonLabel: "Choisir Famille", to: "/tarifs", filled: false, popular: false },
];

const HomePricingSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Des formules pour <span className="text-gradient-gold">tous les profils</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">Commencez gratuitement, évoluez à votre rythme</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto mb-8">
        {plans.map((plan, i) => (
          <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }}>
            <Card className={`h-full relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">Populaire</Badge>}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-2xl font-bold text-foreground mt-2">{plan.price}</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">{plan.lines.map((l, j) => <li key={j}>{l}</li>)}</ul>
                <Button asChild className={plan.filled ? "w-full gradient-emerald border-0 text-primary-foreground" : "w-full border-primary text-primary hover:bg-primary/5"} variant={plan.filled ? "default" : "outline"}>
                  <Link to={plan.to}>{plan.buttonLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="max-w-md mx-auto mt-6 p-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/80 to-amber-50/60 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-700 mb-1">Programme spécialisé</p>
        <p className="font-bold text-lg text-emerald-900 mb-1">Hifd al-Qur'ān</p>
        <p className="text-sm text-amber-800/70 mb-3">2 séances individuelles/semaine · Paiement direct</p>
        <HifzApplicationDialog triggerClassName="inline-flex items-center justify-center w-full px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-700 to-amber-700 text-white text-sm font-semibold hover:opacity-90 transition" triggerLabel="Demander à rejoindre →" />
      </motion.div>
      <div className="text-center mt-8">
        <Link to="/tarifs" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">Voir tous les détails <ArrowRight className="h-4 w-4" /></Link>
      </div>
    </div>
  </section>
);

export default HomePricingSection;
