import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Mail, MessageCircle, BookOpen, Moon, CreditCard, Monitor } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const categories = [
  {
    id: "hifz",
    icon: Moon,
    label: "Programme Hifd",
    color: "text-amber-600",
    bg: "bg-amber-50 dark:bg-amber-950/30",
    border: "border-amber-200 dark:border-amber-800",
    items: [
      {
        q: "Faut-il déjà savoir lire l'arabe pour rejoindre le programme Hifd ?",
        a: "Oui, une lecture courante du Coran est nécessaire. Si vous débutez, nous vous recommandons de commencer par nos niveaux 1 et 2 pour maîtriser la lecture avant d'intégrer le programme Hifd.",
      },
      {
        q: "Comment se déroulent les séances avec le professeur ?",
        a: "Les séances se passent en visioconférence (Google Meet). Vous récitez devant votre professeur, il corrige votre tajwid, évalue vos hizb et planifie la prochaine portion à mémoriser. Chaque séance dure environ 30 à 45 minutes.",
      },
      {
        q: "Combien de séances y a-t-il par semaine et par mois ?",
        a: "Le programme comprend 2 séances individuelles par semaine, soit 8 séances par mois. Les créneaux sont réservés directement via le calendrier intégré à l'application, sans intermédiaire.",
      },
      {
        q: "Que se passe-t-il si je dois annuler ou reporter une séance ?",
        a: "Vous pouvez reporter une séance depuis votre espace personnel, sous réserve d'un délai de prévenance de 24h. En cas d'absence non signalée, la séance est considérée comme utilisée.",
      },
      {
        q: "Combien de temps faut-il pour mémoriser tout le Coran ?",
        a: "Cela dépend de votre rythme et du temps consacré chaque jour à la révision. Avec 2 séances/semaine et un travail quotidien régulier, comptez en moyenne entre 3 et 5 ans. Le programme s'adapte à votre cadence personnelle.",
      },
      {
        q: "En quoi consistent les 3 piliers du programme Hifd ?",
        a: "Chaque séance repose sur trois types de travail : le nouvel apprentissage (nouvelle portion mémorisée avec le professeur), la révision récente (les hizb récemment mémorisés révisés hors mushaf) et la révision ancienne (les anciens hizb revisités en rotation). C'est cette structure qui garantit un hifd durable.",
      },
    ],
  },
  {
    id: "arabe",
    icon: BookOpen,
    label: "Cours d'arabe",
    color: "text-emerald-600",
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    border: "border-emerald-200 dark:border-emerald-800",
    items: [
      {
        q: "Faut-il des prérequis pour commencer le Niveau 1 ?",
        a: "Aucun prérequis. Le Niveau 1 part de zéro : vous apprenez l'alphabet arabe, la lecture et l'écriture des lettres progressivement. Tout débutant peut commencer.",
      },
      {
        q: "Combien de leçons y a-t-il par niveau et combien de temps durent-elles ?",
        a: "Chaque niveau contient 10 leçons structurées. Le Niveau 1 couvre les fondations (alphabet, lecture, écriture). Le Niveau 2 approfondit la grammaire et la compréhension de texte. Comptez entre 20 et 40 minutes par leçon selon votre rythme.",
      },
      {
        q: "Quels types d'exercices sont proposés ?",
        a: "Les leçons incluent des QCM corrigés instantanément, des dictées audio progressives, des exercices de reconnaissance des lettres et des enregistrements vocaux. Chaque exercice est accompagné d'une explication en cas d'erreur.",
      },
      {
        q: "Le tuteur IA Musa'id Al-Moalim est-il vraiment utile ?",
        a: "Oui — Musa'id Al-Moalim répond à vos questions sur la langue arabe en temps réel, corrige vos exercices et s'adapte à votre niveau. Il est inclus dans tous les plans payants (Essentiel, Premium et Hifd).",
      },
      {
        q: "Les cours sont-ils adaptés à l'arabe du Coran spécifiquement ?",
        a: "Oui, ALFASL enseigne l'arabe coranique — pas l'arabe dialectal ni l'arabe moderne standard. L'objectif est de vous permettre de comprendre et lire le Coran directement dans le texte.",
      },
    ],
  },
  {
    id: "tarifs",
    icon: CreditCard,
    label: "Abonnement & Tarifs",
    color: "text-violet-600",
    bg: "bg-violet-50 dark:bg-violet-950/30",
    border: "border-violet-200 dark:border-violet-800",
    items: [
      {
        q: "Comment fonctionne l'essai gratuit ?",
        a: "Le plan Découverte est gratuit et illimité dans le temps. Vous accédez aux 3 premières leçons pour tester la méthode, sans carte bancaire requise.",
      },
      {
        q: "Quelle est la différence entre Essentiel, Premium et Hifd ?",
        a: "Essentiel (7€/mois) donne accès aux niveaux 1 & 2 complets avec le tuteur IA. Premium (15€/mois) ajoute la correction de récitation par l'enseignant et le module Coran. Le programme Hifd (79€/mois) est un parcours de mémorisation à part entière avec un professeur dédié en visio 2 fois/semaine.",
      },
      {
        q: "Puis-je changer de formule à tout moment ?",
        a: "Oui, vous pouvez upgrader ou changer de formule à tout moment depuis votre espace personnel. Le changement prend effet immédiatement.",
      },
      {
        q: "Puis-je annuler mon abonnement à tout moment ?",
        a: "Oui, sans engagement et sans frais. Vous pouvez résilier depuis votre espace personnel ou en nous contactant directement. La résiliation prend effet à la fin de la période en cours.",
      },
      {
        q: "Quels modes de paiement sont acceptés ?",
        a: "Le paiement s'effectue par carte bancaire (Visa, Mastercard) via Stripe, notre prestataire de paiement sécurisé. Aucune donnée bancaire n'est stockée sur nos serveurs.",
      },
    ],
  },
  {
    id: "technique",
    icon: Monitor,
    label: "Technique & Compte",
    color: "text-sky-600",
    bg: "bg-sky-50 dark:bg-sky-950/30",
    border: "border-sky-200 dark:border-sky-800",
    items: [
      {
        q: "Sur quels appareils la plateforme fonctionne-t-elle ?",
        a: "ALFASL est accessible depuis n'importe quel navigateur moderne — sur ordinateur, tablette ou smartphone. Aucune installation requise.",
      },
      {
        q: "Faut-il créer un compte pour accéder aux leçons ?",
        a: "Oui, un compte gratuit est nécessaire pour accéder aux leçons et suivre votre progression. L'inscription prend moins d'une minute et les 3 premières leçons sont accessibles immédiatement.",
      },
      {
        q: "Comment récupérer mon mot de passe ?",
        a: "Depuis la page de connexion, cliquez sur « Mot de passe oublié ». Un email de réinitialisation vous sera envoyé dans les minutes qui suivent.",
      },
      {
        q: "Mes données sont-elles sécurisées ?",
        a: "Oui. Vos données sont hébergées sur des serveurs sécurisés (Supabase), vos paiements transitent via Stripe. Nous ne revendons aucune donnée personnelle. Consultez notre politique de confidentialité pour plus de détails.",
      },
    ],
  },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border border-border rounded-xl overflow-hidden transition-colors duration-200 ${open ? "bg-muted/30" : "bg-background"}`}>
      <button
        className="w-full flex items-center justify-between gap-4 p-5 text-left"
        onClick={() => setOpen(!open)}
      >
        <span className="font-semibold text-foreground text-sm sm:text-base leading-snug">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 pt-1">
              <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Faq = () => {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    document.getElementById(`cat-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 pt-28 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
          <div className="absolute top-4 right-8 text-[180px] font-arabic text-white leading-none">؟</div>
        </div>
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs font-bold uppercase tracking-widest text-amber-400 mb-3 block"
          >
            Aide
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl font-bold text-white mb-4"
          >
            Questions fréquentes
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-emerald-200/70 max-w-xl mx-auto"
          >
            Tout ce que vous devez savoir sur ALFASL, les cours d'arabe et le programme Hifd.
          </motion.p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="flex gap-10 items-start">

          {/* Sidebar navigation — desktop only */}
          <aside className="hidden lg:block w-52 shrink-0 sticky top-24">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">Catégories</p>
            <nav className="space-y-1">
              {categories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => scrollToCategory(cat.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 text-left ${
                      activeCategory === cat.id
                        ? `${cat.bg} ${cat.color} border ${cat.border}`
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    }`}
                  >
                    <Icon className={`h-4 w-4 shrink-0 ${activeCategory === cat.id ? cat.color : ""}`} />
                    {cat.label}
                  </button>
                );
              })}
            </nav>

            <div className="mt-8 p-4 rounded-xl border border-border bg-card">
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                Vous n'avez pas trouvé votre réponse ?
              </p>
              <a
                href="mailto:contact@alfasl.fr"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                contact@alfasl.fr
              </a>
            </div>
          </aside>

          {/* FAQ content */}
          <div className="flex-1 min-w-0 space-y-14">
            {categories.map((cat, ci) => {
              const Icon = cat.icon;
              return (
                <motion.section
                  key={cat.id}
                  id={`cat-${cat.id}`}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: ci * 0.05 }}
                  onViewportEnter={() => setActiveCategory(cat.id)}
                >
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${cat.bg} ${cat.border} mb-6`}>
                    <Icon className={`h-4 w-4 ${cat.color}`} />
                    <span className={`text-xs font-bold uppercase tracking-widest ${cat.color}`}>
                      {cat.label}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {cat.items.map((faq, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 8 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <FaqItem q={faq.q} a={faq.a} />
                      </motion.div>
                    ))}
                  </div>
                </motion.section>
              );
            })}

            {/* Contact CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="rounded-2xl border border-border bg-card p-8 text-center"
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                Vous n'avez pas trouvé votre réponse ?
              </h2>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Notre équipe répond sous 24h, généralement bien plus vite. Écrivez-nous ou commencez directement avec le plan gratuit.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white border-0 font-semibold rounded-xl">
                  <a href="mailto:contact@alfasl.fr">
                    <Mail className="mr-2 h-4 w-4" />
                    contact@alfasl.fr
                  </a>
                </Button>
                <Button asChild variant="outline" className="rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30">
                  <Link to="/auth">Commencer gratuitement</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Faq;
