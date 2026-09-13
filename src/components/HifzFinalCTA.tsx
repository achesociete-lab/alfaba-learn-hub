import { motion } from "framer-motion";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import HifzApplicationDialog from "@/components/HifzApplicationDialog";

const HifzFinalCTA = () => (
  <section className="relative py-28 bg-slate-950 overflow-hidden">
    {/* Glow effects */}
    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
    <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-500/8 rounded-full blur-3xl pointer-events-none" />

    {/* Gold lines */}
    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />
    <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent" />

    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto text-center"
      >
        {/* Ayah */}
        <p className="font-arabic text-4xl sm:text-5xl text-amber-300/70 mb-3 leading-relaxed">
          وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
        </p>
        <p className="text-slate-500 text-sm italic mb-12">
          « Nous avons certes facilité le Coran pour la méditation » — Sourate Al-Qamar (54:17)
        </p>

        <h2 className="text-4xl sm:text-6xl font-black text-white mb-5 leading-tight">
          Votre premier pas
          <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-yellow-200">commence maintenant</span>
        </h2>

        <p className="text-slate-400 text-lg mb-10 max-w-xl mx-auto">
          Choisissez votre parcours — apprendre l'arabe gratuitement ou rejoindre le programme Hifd avec un professeur dédié.
        </p>

        {/* Trust points */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mb-10">
          {["3 leçons gratuites", "Sans engagement", "Résultats dès la 1ère semaine", "Annulable à tout moment"].map(item => (
            <span key={item} className="flex items-center gap-2 text-sm text-slate-400">
              <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" />
              {item}
            </span>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-slate-950 font-black text-base px-12 h-14 rounded-2xl shadow-xl shadow-amber-500/25 border-0 hover:scale-105 transition-all">
            <Link to="/auth">
              Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <HifzApplicationDialog
            triggerClassName="inline-flex items-center justify-center gap-2 border border-white/15 text-white hover:bg-white/8 bg-white/5 backdrop-blur-sm text-base px-10 h-14 rounded-2xl font-bold transition-all hover:scale-105"
            triggerLabel="Rejoindre le programme Hifd →"
          />
        </div>
      </motion.div>
    </div>
  </section>
);

export default HifzFinalCTA;
