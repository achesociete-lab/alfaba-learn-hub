import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => (
  <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
    {/* Radial glow top-center */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

    {/* Gold top line */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

    {/* Floating Arabic letters */}
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      <div className="absolute top-24 left-8 text-[140px] font-arabic text-white/3 leading-none">ق</div>
      <div className="absolute bottom-24 right-8 text-[140px] font-arabic text-white/3 leading-none">ر</div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[320px] font-arabic text-white/[0.02] leading-none">آن</div>
    </div>

    <div className="container mx-auto px-4 relative z-10 pt-28 pb-16 flex flex-col items-center text-center">

      {/* Badge méthode */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8"
      >
        <span className="text-sm text-slate-300 font-medium">Méthode conçue pour les francophones</span>
      </motion.div>

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, delay: 0.08 }}
        className="mb-8"
      >
        <div className="bg-white rounded-3xl px-6 py-4 shadow-2xl shadow-black/50 inline-block">
          <img src="/logo.png" alt="Alfasl" className="h-28 sm:h-36 w-auto" />
        </div>
      </motion.div>

      {/* Main headline */}
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5"
      >
        Maîtrisez l'arabe
        <br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">
          du Coran
        </span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.25 }}
        className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-4 leading-relaxed"
      >
        De l'alphabet aux textes coraniques — des leçons progressives, un tuteur IA disponible 24h/24 et un professeur dédié pour le Hifd.
      </motion.p>

      {/* Hadith */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.35 }}
        className="mb-10"
      >
        <p className="font-arabic text-2xl sm:text-3xl text-amber-300/70 leading-relaxed">
          «&nbsp;خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ&nbsp;»
        </p>
        <p className="text-xs text-slate-500 italic mt-1">« Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. » — Bukhari</p>
      </motion.div>

      {/* CTAs */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-6"
      >
        <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-base px-10 h-14 rounded-2xl shadow-xl shadow-amber-500/25 border-0 transition-all hover:scale-105">
          <Link to="/auth">
            Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <Button asChild size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/8 text-base px-10 h-14 rounded-2xl bg-white/5 backdrop-blur-sm transition-all hover:scale-105">
          <Link to="/hifz">Découvrir le programme Hifd →</Link>
        </Button>
      </motion.div>

      {/* Trust micro-copy */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-16"
      >
        {["3 leçons gratuites", "Sans carte bancaire", "Résultats dès la 1ère semaine"].map(item => (
          <span key={item} className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />
            {item}
          </span>
        ))}
      </motion.div>

      {/* Stats bar — chiffres réels uniquement */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        className="w-full max-w-2xl grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8"
      >
        {[
          { value: "2", label: "niveaux d'arabe" },
          { value: "28", label: "leçons progressives" },
          { value: "60", label: "hizb à mémoriser" },
        ].map(({ value, label }) => (
          <div key={label} className="bg-slate-900/60 backdrop-blur-sm py-5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">{value}</p>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
          </div>
        ))}
      </motion.div>
    </div>

    {/* Bottom fade */}
    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
  </section>
);

export default HeroSection;
