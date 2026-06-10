import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const paths = [
  {
    icon: BookOpen,
    colorFrom: "from-emerald-600",
    colorTo: "to-emerald-800",
    badge: "Arabe",
    title: "Apprendre l'arabe",
    arabic: "تعلُّم اللغة العربية",
    desc: "De l'alphabet aux textes du Coran — 2 niveaux progressifs, exercices interactifs, audio intégré et tuteur IA disponible 24h/24.",
    cta: "Commencer gratuitement",
    to: "/auth",
    secondaryCta: "Voir le programme",
    secondaryTo: "/niveau-1",
    img: "/alfasl_mustawa_alawal.png",
  },
  {
    icon: Moon,
    colorFrom: "from-amber-500",
    colorTo: "to-amber-700",
    badge: "Hifd",
    title: "Mémoriser le Coran",
    arabic: "حِفْظُ الْقُرْآن",
    desc: "Programme intensif avec professeur dédié — 2 séances individuelles par semaine, 60 hizb suivis, mémorisation durable fondée sur 3 piliers.",
    cta: "Découvrir le programme",
    to: "/hifz",
    secondaryCta: "Voir les tarifs",
    secondaryTo: "#tarifs",
    img: "/alfasl_mustawa_athani_correct.png",
  },
];

const TwoPathsSection = () => (
  <section className="py-24 bg-card">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-16"
      >
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-3 block">
          Deux parcours
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4">
          Choisissez votre{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-amber-600">
            chemin
          </span>
        </h2>
        <p className="text-muted-foreground max-w-lg mx-auto">
          ALFASL propose deux programmes distincts — liés par le même objectif : vous rapprocher du Coran.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {paths.map(({ icon: Icon, colorFrom, colorTo, badge, title, arabic, desc, cta, to, secondaryCta, secondaryTo, img }, i) => (
          <motion.div
            key={title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.15 }}
            className="group bg-background rounded-3xl p-8 border border-border hover:border-emerald-200 hover:shadow-xl transition-all duration-300 flex flex-col"
          >
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo} flex items-center justify-center mb-6 shadow-md`}>
              <Icon className="h-6 w-6 text-white" />
            </div>

            <span className={`text-xs font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1 rounded-full self-start mb-3`}>
              {badge}
            </span>

            <h3 className="text-2xl font-bold text-foreground mb-1">{title}</h3>
            <p className="font-arabic text-lg text-muted-foreground mb-4">{arabic}</p>

            <img
              src={img}
              alt={title}
              className="w-32 h-32 object-contain self-center my-4 group-hover:scale-105 transition-transform duration-300"
            />

            <p className="text-sm text-muted-foreground leading-relaxed mb-6 flex-1">{desc}</p>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                asChild
                className={`flex-1 bg-gradient-to-r ${colorFrom} ${colorTo} border-0 text-white font-semibold rounded-xl`}
              >
                <Link to={to}>
                  {cta} <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="flex-1 border-border rounded-xl text-muted-foreground hover:text-foreground"
              >
                {secondaryTo.startsWith("#") ? (
                  <a href={secondaryTo}>{secondaryCta}</a>
                ) : (
                  <Link to={secondaryTo}>{secondaryCta}</Link>
                )}
              </Button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TwoPathsSection;
