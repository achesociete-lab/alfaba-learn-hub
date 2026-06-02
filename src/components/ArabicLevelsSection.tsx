import { motion } from "framer-motion";
import { ArrowRight, Bot, PenTool, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const levels = [
  {
    img: "/alfasl_mustawa_alawal.png",
    level: "Niveau 1",
    title: "Les Fondations",
    desc: "Alphabet arabe, lecture, écriture et dictées progressives. Accessible à tous, même sans aucune base.",
    to: "/niveau-1",
    free: true,
  },
  {
    img: "/alfasl_mustawa_athani_correct.png",
    level: "Niveau 2",
    title: "Approfondissement",
    desc: "Textes avancés, grammaire arabe, compréhension de texte et dictées pour perfectionner votre maîtrise.",
    to: "/niveau-2",
    free: false,
  },
];

const ArabicLevelsSection = () => (
  <section className="py-24 bg-card">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">Apprendre l'arabe</span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          La langue du Coran,{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            à portée de tous
          </span>
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          ALFASL est né pour enseigner l'arabe aux francophones. Deux niveaux structurés, une progression claire — du débutant absolu au lecteur confirmé.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-14">
        {levels.map(({ img, level, title, desc, to, free }, i) => (
          <motion.div
            key={level}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="group bg-background rounded-3xl p-8 border border-border hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center"
          >
            <img
              src={img}
              alt={title}
              className="w-40 h-40 object-contain mb-6 group-hover:scale-105 transition-transform duration-300"
            />
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full">
                {level}
              </span>
              {free && (
                <span className="text-xs font-bold uppercase tracking-widest text-amber-600 bg-amber-50 dark:bg-amber-950/50 px-2.5 py-1 rounded-full">
                  Gratuit
                </span>
              )}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-3">{title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-6">{desc}</p>
            <Button asChild variant="outline" className="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl">
              <Link to={to}>
                Explorer <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </motion.div>
        ))}
      </div>

      {/* AI Tutor teaser */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-4xl mx-auto rounded-2xl border border-border bg-background p-7 flex flex-col sm:flex-row items-center gap-6"
      >
        <div className="shrink-0">
          <img
            src="/alfasl_musaid_almoalim_final.png"
            alt="Musa'id Al-Moalim"
            className="w-24 h-24 object-contain"
          />
        </div>
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 mb-1 justify-center sm:justify-start">
            <Bot className="h-4 w-4 text-emerald-600" />
            <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Tuteur IA inclus</span>
          </div>
          <h3 className="font-bold text-foreground text-lg mb-1">Musa'id Al-Moalim — مساعد المعلم</h3>
          <p className="text-sm text-muted-foreground">
            Votre assistant pédagogique disponible 24h/24. Il répond à vos questions, corrige vos exercices et s'adapte à votre niveau en temps réel.
          </p>
        </div>
        <Button asChild variant="outline" className="shrink-0 rounded-xl border-emerald-200 text-emerald-700 hover:bg-emerald-50">
          <Link to="/auth">Essayer gratuitement</Link>
        </Button>
      </motion.div>
    </div>
  </section>
);

export default ArabicLevelsSection;
