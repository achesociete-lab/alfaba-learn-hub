import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const paths = [
  {
    icon: BookOpen,
    gradient: "from-emerald-600 to-teal-700",
    glow: "shadow-emerald-500/20",
    border: "border-emerald-500/20 hover:border-emerald-400/40",
    badge: "Arabe",
    badgeBg: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
    title: "Apprendre l'arabe",
    arabic: "تعلُّم اللغة العربية",
    benefits: [
      "De l'alphabet aux textes du Coran",
      "Exercices interactifs + dictées corrigées",
      "Tuteur IA Musa'id disponible 24h/24",
      "2 niveaux progressifs (N1 + N2)",
    ],
    price: "Dès 7€/mois",
    cta: "Commencer gratuitement",
    to: "/auth",
    note: "3 leçons offertes · Sans carte bancaire",
  },
  {
    icon: Moon,
    gradient: "from-amber-500 to-orange-600",
    glow: "shadow-amber-500/20",
    border: "border-amber-500/20 hover:border-amber-400/40",
    badge: "Hifd",
    badgeBg: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
    title: "Mémoriser le Coran",
    arabic: "حِفْظُ الْقُرْآن",
    benefits: [
      "Professeur dédié — 2 séances / semaine",
      "Programme individuel sur mesure",
      "60 hizb tracés en temps réel",
      "Mémorisation durable — 3 piliers",
    ],
    price: "Tarif sur devis",
    cta: "Découvrir le programme",
    to: "/hifz",
    note: "Candidature · Places limitées",
  },
];

const TwoPathsSection = () => (
  <section className="py-24 bg-slate-950">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-amber-400 bg-amber-400/10 border border-amber-400/20 px-3 py-1 rounded-full mb-4">
          Deux parcours — un seul objectif
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
          Choisissez votre{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">chemin</span>
        </h2>
        <p className="text-slate-400 max-w-lg mx-auto text-lg">
          Débutant ou déjà lecteur du Coran — ALFASL a un programme fait pour vous.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {paths.map(({ icon: Icon, gradient, glow, border, badge, badgeBg, title, arabic, benefits, price, cta, to, note }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className={`group relative bg-slate-900 rounded-3xl p-8 border ${border} shadow-2xl ${glow} transition-all duration-300 flex flex-col`}
          >
            <div className={`absolute top-0 left-8 right-8 h-px bg-gradient-to-r ${gradient} opacity-60 rounded-full`} />

            <div className="flex items-center gap-3 mb-6">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
                <Icon className="h-6 w-6 text-white" />
              </div>
              <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full ${badgeBg}`}>
                {badge}
              </span>
            </div>

            <h3 className="text-2xl font-black text-white mb-1">{title}</h3>
            <p className="font-arabic text-lg text-slate-400 mb-6">{arabic}</p>

            <ul className="space-y-3 mb-8 flex-1">
              {benefits.map((b) => (
                <li key={b} className="flex items-start gap-2.5 text-sm text-slate-300">
                  <Check className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                  {b}
                </li>
              ))}
            </ul>

            <div className="pt-6 border-t border-white/5">
              <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Accès</p>
              <p className="text-xl font-black text-white mb-4">{price}</p>
              <Button
                asChild
                className={`w-full bg-gradient-to-r ${gradient} border-0 text-white font-bold h-12 rounded-xl text-base shadow-lg hover:opacity-90 transition-all hover:scale-[1.02]`}
              >
                <Link to={to}>
                  {cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <p className="text-center text-xs text-slate-600 mt-3">{note}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TwoPathsSection;
