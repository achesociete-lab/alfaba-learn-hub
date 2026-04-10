import { motion } from "framer-motion";
import { ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImg from "@/assets/hero-pattern.jpg";

const HeroSection = () => (
  <section className="relative min-h-[90vh] flex items-center overflow-hidden">
    {/* Background */}
    <div className="absolute inset-0">
      <img src={heroImg} alt="" className="w-full h-full object-cover opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
    </div>

    <div className="container mx-auto px-4 relative z-10 pt-20">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-6">
            <Star className="h-4 w-4 text-gold" />
            <span className="text-sm font-medium text-primary">Méthode ALFASL</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
            Apprenez l'arabe{" "}
            <span className="text-gradient-gold">avec passion</span>
          </h1>

          <p className="font-arabic text-3xl sm:text-4xl text-primary/70 mb-4">
            بِسْمِ اللَّهِ الرَّحْمَنِ الرَّحِيمِ
          </p>

          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Une plateforme complète pour francophones : cours en présentiel, 
            e-learning, devoirs, notes et suivi de progression. Niveaux 1 & 2.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <Button asChild size="lg" className="gradient-emerald border-0 text-primary-foreground text-base px-8">
            <Link to="/niveau-1">
              Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="border-primary/30 text-foreground hover:bg-primary/5 text-base px-8">
            <Link to="/tarifs">Voir les tarifs</Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-12 flex justify-center gap-8 text-sm text-muted-foreground"
        >
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">2</p>
            <p>Niveaux</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">50+</p>
            <p>Leçons</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-foreground">100%</p>
            <p>Francophone</p>
          </div>
        </motion.div>
      </div>
    </div>
  </section>
);

export default HeroSection;
