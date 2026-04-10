import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const QuranBanner = () => (
  <section className="py-16 bg-[hsl(var(--emerald-dark))]">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-2xl mx-auto text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold mb-4" style={{ color: "hsl(var(--cream))" }}>
          🕌 Module Coran — <span className="text-gradient-gold">Récitez avec confiance</span>
        </h2>
        <p className="text-lg mb-8" style={{ color: "hsl(var(--cream-dark))" }}>
          Correction IA de votre récitation + retour personnalisé de l'enseignant
        </p>
        <Button asChild size="lg" className="gradient-gold border-0 text-foreground text-base px-8 font-semibold">
          <Link to="/coran">
            Découvrir le module Coran <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default QuranBanner;
