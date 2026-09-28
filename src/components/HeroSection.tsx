import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

// Animated counter
function Counter({ to, duration = 1.6, suffix = "" }: { to: number; duration?: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = (Date.now() - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out
      const ease = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(ease * to));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, to, duration]);

  return <span ref={ref}>{count}{suffix}</span>;
}

const TESTIMONIALS = [
  { name: "Amina B.", age: "34 ans", avatar: "أ", stars: 5, text: "En 6 semaines j'arrive à lire des versets du Coran. Le tuteur IA corrigue mes erreurs instantanément." },
  { name: "Youssef M.", age: "28 ans", avatar: "ي", stars: 5, text: "La méthode progressive est parfaite. Je n'avais aucune base en arabe, maintenant je lis couramment l'alphabet." },
  { name: "Nadia K.", age: "41 ans", avatar: "ن", stars: 5, text: "J'ai essayé plusieurs apps avant ALFASL. Aucune ne cible aussi précisément l'arabe coranique pour francophones." },
];

const HeroSection = () => (
  <>
  <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-950">
    {/* Glows */}
    <motion.div animate={{ scale: [1, 1.15, 1], opacity: [0.1, 0.18, 0.1] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
    <motion.div animate={{ scale: [1, 1.2, 1], opacity: [0.08, 0.14, 0.08] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
      className="absolute bottom-0 right-0 w-[600px] h-[400px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />

    {/* Gold top line */}
    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />

    {/* Floating Arabic letters */}
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
      {["ق","ر","آن","ب","س","م"].map((letter, i) => (
        <motion.div key={i}
          animate={{ y: [0, -(10 + i * 3), 0], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 6 + i * 1.5, repeat: Infinity, ease: "easeInOut", delay: i * 0.8 }}
          style={{
            position: "absolute",
            fontSize: i === 2 ? "320px" : `${80 + i * 20}px`,
            top: `${[10, 60, 40, 20, 70, 50][i]}%`,
            left: `${[5, 80, 40, 60, 20, 90][i]}%`,
          }}
          className="font-arabic text-white leading-none"
        >{letter}</motion.div>
      ))}
    </div>

    <div className="container mx-auto px-4 relative z-10 pt-28 pb-16 flex flex-col items-center text-center">

      {/* Social proof badge */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="inline-flex items-center gap-2 bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
        <div className="flex -space-x-1">
          {["أ","ي","ن"].map((l, i) => (
            <div key={i} className="h-5 w-5 rounded-full bg-emerald-600 flex items-center justify-center text-[9px] text-white font-bold border border-slate-950">{l}</div>
          ))}
        </div>
        <div className="flex">
          {[...Array(5)].map((_, i) => <Star key={i} className="h-3 w-3 text-amber-400 fill-amber-400" />)}
        </div>
        <span className="text-sm text-slate-300 font-medium">+1 200 musulmans apprennent déjà</span>
      </motion.div>

      {/* Logo */}
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.08 }} className="mb-8">
        <div className="bg-white rounded-3xl px-6 py-4 shadow-2xl shadow-black/50 inline-block">
          <img src="/logo.png" alt="Alfasl" className="h-28 sm:h-36 w-auto" />
        </div>
      </motion.div>

      {/* Headline */}
      <motion.h1 initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.15 }}
        className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-[1.05] tracking-tight mb-5">
        Maîtrisez l'arabe<br />
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400">du Coran</span>
      </motion.h1>

      {/* Sub-headline */}
      <motion.p initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.25 }}
        className="text-lg sm:text-xl text-slate-400 max-w-2xl mb-4 leading-relaxed">
        De l'alphabet aux textes coraniques — des leçons progressives, un tuteur IA disponible 24h/24 et un professeur dédié pour le Hifd.
      </motion.p>

      {/* Hadith */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }} className="mb-10">
        <p className="font-arabic text-2xl sm:text-3xl text-amber-300/70 leading-relaxed">
          «&nbsp;خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ&nbsp;»
        </p>
        <p className="text-xs text-slate-500 italic mt-1">« Le meilleur d'entre vous est celui qui apprend le Coran et l'enseigne. » — Bukhari</p>
      </motion.div>

      {/* CTAs */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}
        className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-base px-10 h-14 rounded-2xl shadow-xl shadow-amber-500/25 border-0">
            <Link to="/auth">Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" /></Link>
          </Button>
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.97 }}>
          <Button asChild size="lg" variant="outline" className="border-white/15 text-white hover:bg-white/8 text-base px-10 h-14 rounded-2xl bg-white/5 backdrop-blur-sm">
            <Link to="/hifz">Découvrir le programme Hifd →</Link>
          </Button>
        </motion.div>
      </motion.div>

      {/* Trust */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.55 }}
        className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-500 mb-16">
        {["3 leçons gratuites", "Sans carte bancaire", "Résultats dès la 1ère semaine"].map((item, i) => (
          <motion.span key={item} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 + i * 0.1 }}
            className="flex items-center gap-1.5">
            <CheckCircle className="h-3.5 w-3.5 text-emerald-500" />{item}
          </motion.span>
        ))}
      </motion.div>

      {/* Animated stats bar */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}
        className="w-full max-w-2xl grid grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden border border-white/8">
        {[
          { to: 1200, suffix: "+", label: "élèves actifs" },
          { to: 28, suffix: "", label: "leçons progressives" },
          { to: 4.9, suffix: "/5", label: "note moyenne" },
        ].map(({ to, suffix, label }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
            className="bg-slate-900/60 backdrop-blur-sm py-5 text-center">
            <p className="text-2xl sm:text-3xl font-black text-amber-400">
              <Counter to={to} suffix={suffix} />
            </p>
            <p className="text-xs text-slate-500 mt-0.5 uppercase tracking-wide">{label}</p>
          </motion.div>
        ))}
      </motion.div>
    </div>

    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />
  </section>

  {/* Testimonials */}
  <section className="py-16 bg-slate-950 border-t border-white/5">
    <div className="container mx-auto px-4 max-w-4xl">
      <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-10">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Témoignages</span>
        <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">Ils ont commencé comme vous</h2>
      </motion.div>
      <div className="grid sm:grid-cols-3 gap-5">
        {TESTIMONIALS.map((t, i) => (
          <motion.div key={t.name}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            className="bg-slate-900/60 border border-white/8 rounded-2xl p-5 backdrop-blur-sm"
          >
            <div className="flex mb-3">
              {[...Array(t.stars)].map((_, j) => <Star key={j} className="h-4 w-4 text-amber-400 fill-amber-400" />)}
            </div>
            <p className="text-slate-300 text-sm leading-relaxed mb-4">"{t.text}"</p>
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-emerald-800 flex items-center justify-center text-emerald-200 font-bold font-arabic text-sm">{t.avatar}</div>
              <div>
                <p className="text-white text-sm font-semibold">{t.name}</p>
                <p className="text-slate-500 text-xs">{t.age}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
  </>
);

export default HeroSection;
