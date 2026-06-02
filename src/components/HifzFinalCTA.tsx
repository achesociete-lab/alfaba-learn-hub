import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HifzFinalCTA = () => (
  <section className="py-24 bg-gradient-to-br from-emerald-950 via-emerald-900 to-amber-950 relative overflow-hidden">
    <div className="absolute inset-0 opacity-5 pointer-events-none select-none">
      <div className="absolute bottom-0 right-0 text-[250px] font-arabic text-white leading-none">ن</div>
    </div>
    <div className="container mx-auto px-4 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <p className="font-arabic text-5xl text-amber-300/80 mb-6 leading-relaxed">
          وَلَقَدْ يَسَّرْنَا الْقُرْآنَ لِلذِّكْرِ
        </p>
        <p className="text-emerald-300/60 text-sm italic mb-10">
          « Nous avons certes facilité le Coran pour la méditation » — Sourate Al-Qamar (54:17)
        </p>
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Commencez votre hifd aujourd'hui
        </h2>
        <p className="text-emerald-200/70 mb-10 max-w-md mx-auto">
          Rejoignez le programme, réservez votre première séance et commencez votre mémorisation avec un professeur dédié.
        </p>
        <Button asChild size="lg" className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-emerald-950 font-bold text-base px-12 h-14 rounded-2xl shadow-2xl shadow-amber-500/30 border-0">
          <Link to="/hifz">
            Démarrer le programme — 79€/mois <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
        <p className="text-emerald-500/50 text-xs mt-4">Sans engagement · Résiliable à tout moment</p>
      </motion.div>
    </div>
  </section>
);

export default HifzFinalCTA;
