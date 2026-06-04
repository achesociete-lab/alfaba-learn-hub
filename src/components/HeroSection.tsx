import { motion } from "framer-motion";
import { ArrowRight, Star, ChevronDown, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950">
    {/* Background Arabic letters */}
    <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
      <div className="absolute top-20 left-10 text-[200px] font-arabic text-white leading-none">ق</div>
      <div className="absolute bottom-20 right-10 text-[200px] font-arabic text-white leading-none">ر</div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[300px] font-arabic text-white leading-none opacity-30">آن</div>
    </div>

    {/* Gold top bar */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

    <div className="container mx-auto px-4 relative z-10 pt-28 pb-10 flex-1 flex flex-col justify-center">
      <div className="max-w-4xl mx-auto text-center">

        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.05 }}
          className="inline-flex items-center gap-2 bg-amber-400/20 border border-amber-400/30 px-4 py-1.5 rounded-full mb-8"
        >
          <Star className="h-3.5 w-3.5 text-amber-400 fill-amber-400" />
          <span className="text-sm font-semibold text-amber-300 tracking-wide uppercase">Programme Hifd al-Qur'ān</span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight mb-6 text-white"
        >
          Mémorisez le Coran
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">
            avec un professeur dédié
          </span>
        </motion.h1>

        {/* Hadith */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="font-arabic text-3xl sm:text-4xl text-amber-200/80 mb-3 leading-relaxed"
        >
          «&nbsp;خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ&nbsp;»
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-sm text-amber-300/60 italic mb-10"
        >
          « Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. » — Bukhari
        </motion.p>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-lg sm:text-xl text-emerald-100/80 mb-10 max-w-2xl mx-auto leading-relaxed"
        >
          <strong className="text-white">2 séances individuelles par semaine</strong> avec votre professeur.
          Suivi personnalisé, évaluations après chaque séance, progression tracée hizb par hizb.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
        >
          <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 font-bold text-base px-10 h-14 rounded-2xl shadow-2xl shadow-amber-500/30 border-0">
            <Link to="/hifz">
              Démarrer le programme <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/10 text-base px-10 h-14 rounded-2xl bg-white/5 backdrop-blur-sm">
            <Link to="/tarifs">Voir les tarifs</Link>
          </Button>
        </motion.div>

        {/* Trust micro-line */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.65 }}
          className="flex items-center justify-center gap-2 mb-12 text-xs text-emerald-400/70"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Sans engagement · Résiliable à tout moment · 79€/mois</span>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="grid grid-cols-3 gap-6 max-w-lg mx-auto"
        >
          {[
            { value: "8", label: "séances / mois" },
            { value: "60", label: "hizb suivis" },
            { value: "100%", label: "individuel" },
          ].map(({ value, label }) => (
            <div key={label} className="text-center">
              <p className="text-3xl font-bold text-amber-300">{value}</p>
              <p className="text-xs text-emerald-300/70 mt-1 uppercase tracking-wide">{label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>

    {/* Scroll cue */}
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 1.2 }}
      className="relative z-10 pb-8 flex flex-col items-center gap-1"
    >
      <span className="text-[10px] uppercase tracking-widest text-emerald-400/50">Découvrir</span>
      <motion.div
        animate={{ y: [0, 6, 0] }}
        transition={{ repeat: Infinity, duration: 1.6, ease: "easeInOut" }}
      >
        <ChevronDown className="h-5 w-5 text-emerald-400/50" />
      </motion.div>
    </motion.div>

    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
  </section>
);

export default HeroSection;
