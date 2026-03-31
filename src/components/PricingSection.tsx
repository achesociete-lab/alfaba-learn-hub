import { motion } from "framer-motion";
import { Check, Star, Zap, Crown, Users, BookOpen, Headphones, MessageSquare, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

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
    href: "/auth",
    featured: false,
    badge: null,
  },
  {
    name: "Essentiel",
    price: "19€",
    period: "/mois",
    subtitle: "L'apprentissage à votre rythme",
    icon: Zap,
    features: [
      "Tous les cours Niveau 1 ou 2",
      "Exercices interactifs illimités",
      "Dictées audio progressives",
      "Suivi de progression complet",
      "Enregistrement et réécoute",
      "Support par email",
    ],
    limitations: [],
    cta: "Choisir Essentiel",
    href: "/auth",
    featured: false,
    badge: null,
  },
  {
    name: "Premium",
    price: "39€",
    period: "/mois",
    subtitle: "L'expérience complète",
    icon: Crown,
    features: [
      "Accès aux 2 niveaux simultanément",
      "Module Coran avec IA de récitation",
      "Corrections personnalisées par l'enseignant",
      "Sessions live questions/réponses",
      "Classe virtuelle interactive",
      "Certificat de fin de niveau",
      "Support prioritaire 24/7",
    ],
    limitations: [],
    cta: "Choisir Premium",
    href: "/auth",
    featured: true,
    badge: "Le plus populaire",
  },
  {
    name: "Présentiel +",
    price: "59€",
    period: "/mois",
    subtitle: "Cours en classe + plateforme complète",
    icon: Users,
    features: [
      "Cours en présentiel hebdomadaires",
      "Tout le plan Premium inclus",
      "Émargement numérique",
      "Accès aux replays des cours",
      "Accompagnement individuel",
      "Accès prioritaire aux événements",
    ],
    limitations: [],
    cta: "Nous contacter",
    href: "/auth",
    featured: false,
    badge: null,
  },
];

const testimonials = [
  {
    name: "Fatima B.",
    text: "J'ai appris à lire l'arabe en 3 mois grâce aux exercices progressifs. La méthode est incroyable !",
    rating: 5,
  },
  {
    name: "Ahmed K.",
    text: "Le module Coran avec l'IA qui corrige ma récitation est un vrai game-changer.",
    rating: 5,
  },
  {
    name: "Sarah M.",
    text: "Les cours en présentiel combinés à la plateforme en ligne, c'est le combo parfait.",
    rating: 5,
  },
];

const stats = [
  { icon: Users, value: "500+", label: "Élèves actifs" },
  { icon: BookOpen, value: "24", label: "Leçons complètes" },
  { icon: Headphones, value: "100+", label: "Exercices audio" },
  { icon: Award, value: "95%", label: "Taux de satisfaction" },
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
    q: "Les cours en présentiel sont-ils disponibles partout ?",
    a: "Les cours en présentiel sont actuellement disponibles dans nos centres. Contactez-nous pour connaître les lieux et horaires.",
  },
];

const PricingSection = () => (
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
        className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-16"
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
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto mb-20">
        {plans.map((plan, i) => {
          const Icon = plan.icon;
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

              <Button
                asChild
                className={
                  plan.featured
                    ? "gradient-emerald border-0 text-primary-foreground w-full h-11 text-sm font-semibold"
                    : "w-full h-11 text-sm font-semibold"
                }
                variant={plan.featured ? "default" : "outline"}
              >
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </motion.div>
          );
        })}
      </div>

      {/* Social proof */}
      <div className="max-w-4xl mx-auto mb-20">
        <h3 className="text-center text-xl font-bold text-foreground mb-8">
          Ce que disent nos <span className="text-gradient-gold">élèves</span>
        </h3>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-xl p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-sm text-foreground mb-4 italic">"{t.text}"</p>
              <p className="text-sm font-semibold text-foreground">{t.name}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* FAQ */}
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
          Rejoignez des centaines d'apprenants. Commencez gratuitement, sans engagement.
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

export default PricingSection;
