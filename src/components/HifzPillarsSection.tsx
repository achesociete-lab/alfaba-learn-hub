import { motion } from "framer-motion";

const pillars = [
  {
    icon: "📗",
    colorHex: "#15803d",
    title: "Nouvel apprentissage",
    desc: "Chaque séance, vous mémorisez une nouvelle portion avec votre professeur, qui corrige votre prononciation et valide votre récitation avant d'avancer.",
    badge: "Chaque séance",
  },
  {
    icon: "📙",
    colorHex: "#b45309",
    title: "Révision récente",
    desc: "Les hizb mémorisés récemment sont révisés sans mushaf pour ancrer la mémorisation. C'est le filet de sécurité contre l'oubli rapide.",
    badge: "Chaque semaine",
  },
  {
    icon: "📘",
    colorHex: "#7c3aed",
    title: "Révision ancienne",
    desc: "Les anciens hizb sont révisés en rotation régulière. C'est ce pilier qui garantit un hifd solide à vie — pas juste une mémorisation temporaire.",
    badge: "En rotation",
  },
];

const HifzPillarsSection = () => (
  <section className="py-24 bg-background">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">La méthode</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          3 piliers pour un hifd <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">solide à vie</span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          Notre programme repose sur une méthode éprouvée, structurée autour de trois types de travail quotidien.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {pillars.map(({ icon, colorHex, title, desc, badge }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="relative bg-card rounded-2xl p-7 border border-border hover:shadow-xl transition-all duration-300"
            style={{ borderTop: `3px solid ${colorHex}` }}
          >
            <span className="text-4xl mb-4 block">{icon}</span>
            <div className="inline-block text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full mb-3 text-white" style={{ backgroundColor: colorHex }}>
              {badge}
            </div>
            <h3 className="text-lg font-bold text-foreground mb-3">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default HifzPillarsSection;
