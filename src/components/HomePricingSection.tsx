import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";

const plans = [
  {
    name: "Découverte",
    price: "Gratuit",
    lines: ["3 premières leçons", "QCM de démonstration"],
    buttonLabel: "Commencer gratuitement",
    filled: false,
    popular: false,
  },
  {
    name: "Essentiel",
    price: "7€/mois",
    lines: ["Niveau 1 & 2 complets", "Professeur IA inclus"],
    buttonLabel: "Choisir Essentiel",
    filled: false,
    popular: false,
  },
  {
    name: "Premium",
    price: "15€/mois",
    lines: ["Tout Essentiel +", "Correction récitation par l'enseignant"],
    buttonLabel: "Choisir Premium",
    filled: true,
    popular: true,
  },
];

const HomePricingSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Des formules pour <span className="text-gradient-gold">tous les profils</span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Commencez gratuitement, évoluez à votre rythme
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto mb-8">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className={`h-full relative ${plan.popular ? "border-primary shadow-lg" : ""}`}>
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  Populaire
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg">{plan.name}</CardTitle>
                <p className="text-3xl font-bold text-foreground mt-2">{plan.price}</p>
              </CardHeader>
              <CardContent className="text-center space-y-4">
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {plan.lines.map((line, j) => (
                    <li key={j}>{line}</li>
                  ))}
                </ul>
                <Button
                  asChild
                  className={
                    plan.filled
                      ? "w-full gradient-emerald border-0 text-primary-foreground"
                      : "w-full border-primary text-primary hover:bg-primary/5"
                  }
                  variant={plan.filled ? "default" : "outline"}
                >
                  <Link to="/auth">{plan.buttonLabel}</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="text-center">
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
