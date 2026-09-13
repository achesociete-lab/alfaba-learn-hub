import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const comparisons = [
  { feature: "Progression structurée niveau par niveau", us: true, others: false },
  { feature: "Exercices interactifs corrigés instantanément", us: true, others: false },
  { feature: "Tuteur IA disponible 24h/24", us: true, others: false },
  { feature: "Professeur dédié pour le Hifd", us: true, others: false },
  { feature: "Suivi des hizb mémorisés en temps réel", us: true, others: false },
  { feature: "Méthode islamique pour francophones", us: true, others: false },
];

const highlights = [
  { emoji: "🎯", title: "Progression réelle", desc: "Chaque leçon s'appuie sur la précédente. Vous avancez — vous ne tournez pas en rond." },
  { emoji: "🧠", title: "Tuteur IA Musa'id", desc: "Un assistant intelligent qui répond à vos questions à toute heure. Jamais seul." },
  { emoji: "👨‍🏫", title: "Vrai professeur", desc: "Pour le Hifd, séances individuelles en visio. Il vous entend, corrige et s'adapte." },
  { emoji: "📊", title: "Suivi complet", desc: "Tableau de bord clair : leçons, hizb, évaluations. Vous savez exactement où vous en êtes." },
  { emoji: "🌙", title: "Méthode islamique", desc: "Conçue pour les francophones qui veulent comprendre et mémoriser le Coran." },
  { emoji: "💸", title: "Commencez gratuit", desc: "3 leçons complètes offertes, sans carte bancaire. Voyez par vous-même." },
];

const WhyAlfaslSection = () => (
  <section className="py-24 bg-slate-900">
    <div className="container mx-auto px-4">

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-14"
      >
        <span className="inline-block text-xs font-bold uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full mb-4">
          Pourquoi ALFASL
        </span>
        <h2 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
          Ce qui nous rend{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-amber-400">différents</span>
        </h2>
        <p className="text-slate-400 max-w-xl mx-auto text-lg">
          La plupart des plateformes proposent des vidéos en groupe. Nous offrons un suivi individuel, une progression réelle et un vrai professeur.
        </p>
      </motion.div>

      {/* Comparison table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto mb-20 rounded-3xl overflow-hidden border border-white/8"
      >
        <div className="grid grid-cols-3 bg-slate-800 px-6 py-4">
          <div className="col-span-1 text-sm text-slate-400 font-medium"></div>
          <div className="text-center">
            <span className="text-sm font-black text-white">ALFASL</span>
          </div>
          <div className="text-center">
            <span className="text-sm font-medium text-slate-500">Autres</span>
          </div>
        </div>
        {comparisons.map(({ feature, us, others }, i) => (
          <div key={feature} className={`grid grid-cols-3 px-6 py-4 border-t border-white/5 ${i % 2 === 0 ? "bg-slate-900/50" : "bg-slate-900/20"}`}>
            <div className="col-span-1 text-sm text-slate-300 pr-4">{feature}</div>
            <div className="flex justify-center">
              {us
                ? <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-emerald-400" /></span>
                : <span className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center"><X className="h-3.5 w-3.5 text-red-400" /></span>
              }
            </div>
            <div className="flex justify-center">
              {others
                ? <span className="h-6 w-6 rounded-full bg-emerald-500/20 flex items-center justify-center"><Check className="h-3.5 w-3.5 text-emerald-400" /></span>
                : <span className="h-6 w-6 rounded-full bg-red-500/10 flex items-center justify-center"><X className="h-3.5 w-3.5 text-red-400" /></span>
              }
            </div>
          </div>
        ))}
      </motion.div>

      {/* Benefits grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {highlights.map(({ emoji, title, desc }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            className="bg-slate-800/50 border border-white/5 rounded-2xl p-6 hover:border-emerald-500/20 hover:bg-slate-800 transition-all duration-300"
          >
            <div className="text-3xl mb-3">{emoji}</div>
            <h3 className="font-bold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>

    </div>
  </section>
);

export default WhyAlfaslSection;
