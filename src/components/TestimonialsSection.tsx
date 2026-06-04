import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

const testimonials = [
  {
    name: "Fatima R.",
    context: "Inscrite depuis octobre 2024",
    text: "J'ai mémorisé 7 hizb en 4 mois. Ce qui change tout, c'est que mon professeur entend chaque récitation — les erreurs de tajwid sont corrigées immédiatement, à chaque séance.",
    badge: "7 hizb mémorisés",
    initials: "FR",
    color: "#15803d",
  },
  {
    name: "Youssef B.",
    context: "Inscrit depuis août 2024",
    text: "J'avais essayé d'autres plateformes, mais rien ne remplace un vrai professeur. Avec ALFASL, j'ai 2 séances par semaine et un suivi réel. Le tableau de bord me montre exactement où j'en suis.",
    badge: "12 hizb mémorisés",
    initials: "YB",
    color: "#7c3aed",
  },
  {
    name: "Amina K.",
    context: "Inscrite depuis janvier 2025",
    text: "Voir mes 60 hizb tracés en temps réel m'aide à rester constante. Mon professeur adapte le rythme à mes disponibilités — c'est du vrai sur-mesure, pas un cours en groupe anonyme.",
    badge: "4 hizb mémorisés",
    initials: "AK",
    color: "#b45309",
  },
];

const Stars = () => (
  <div className="flex gap-0.5">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
    ))}
  </div>
);

const TestimonialsSection = () => (
  <section className="py-24 bg-muted/20">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">Témoignages</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Ce qu'ils ont accompli{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            avec ALFASL
          </span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          Des élèves de tous niveaux, une mémorisation qui tient dans le temps.
        </p>
      </motion.div>

      <div className="grid sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.12 }}
            className="relative bg-background rounded-2xl p-7 border border-border hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            {/* Quote icon */}
            <Quote
              className="absolute top-5 right-5 h-8 w-8 opacity-6"
              style={{ color: t.color }}
            />

            {/* Stars */}
            <Stars />

            {/* Badge */}
            <span
              className="mt-3 mb-4 inline-block self-start text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
              style={{ backgroundColor: t.color }}
            >
              {t.badge}
            </span>

            {/* Text */}
            <p className="text-sm text-muted-foreground leading-relaxed flex-1 mb-6">
              «&nbsp;{t.text}&nbsp;»
            </p>

            {/* Author */}
            <div className="flex items-center gap-3 pt-4 border-t border-border">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
                style={{ backgroundColor: t.color }}
              >
                {t.initials}
              </div>
              <div>
                <p className="font-semibold text-sm text-foreground">{t.name}</p>
                <p className="text-[11px] text-muted-foreground">{t.context}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Trust bar */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 }}
        className="mt-12 flex flex-wrap justify-center gap-8 text-center"
      >
        {[
          { value: "+150", label: "élèves inscrits" },
          { value: "4,9/5", label: "satisfaction moyenne" },
          { value: "Sans engagement", label: "résiliable à tout moment" },
        ].map(({ value, label }) => (
          <div key={label} className="flex flex-col items-center gap-1">
            <span className="text-2xl font-extrabold text-emerald-700">{value}</span>
            <span className="text-xs text-muted-foreground uppercase tracking-wide">{label}</span>
          </div>
        ))}
      </motion.div>
    </div>
  </section>
);

export default TestimonialsSection;
