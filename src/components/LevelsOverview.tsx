import { BookOpen, PenTool, FileText, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const levels = [
  {
    level: 1,
    title: "Niveau 1",
    description: "Les Fondations",
    longDescription: "Découvrez l'alphabet arabe, apprenez à lire et à écrire. Chaque leçon se termine par une dictée pour consolider vos acquis.",
    features: [
      { icon: BookOpen, label: "Alphabet arabe complet" },
      { icon: FileText, label: "Exercices de lecture" },
      { icon: PenTool, label: "Dictées progressives" },
    ],
    to: "/niveau-1",
    accent: "primary",
  },
  {
    level: 2,
    title: "Niveau 2",
    description: "Approfondissement",
    longDescription: "Textes avancés, règles de grammaire, compréhension de texte et dictées pour perfectionner votre maîtrise de la langue.",
    features: [
      { icon: GraduationCap, label: "Textes avancés" },
      { icon: BookOpen, label: "Grammaire arabe" },
      { icon: PenTool, label: "Compréhension & dictée" },
    ],
    to: "/niveau-2",
    accent: "secondary",
  },
];

const LevelsOverview = () => {
  return (
    <section className="py-24 bg-muted/30" id="levels">
      <div className="container px-4 mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold mb-6 text-primary">Deux niveaux, une progression complète</h2>
          <p className="text-lg text-muted-foreground">
            Notre programme couvre du débutant absolu au niveau intermédiaire, avec une méthode structurée et progressive.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {levels.map((lvl) => (
            <div
              key={lvl.level}
              className="group relative bg-background rounded-3xl p-8 shadow-sm hover:shadow-xl transition-all duration-500 border border-border/50 overflow-hidden"
            >
              <div className={`absolute top-0 right-0 w-32 h-32 bg-${lvl.accent}/5 rounded-bl-full -mr-16 -mt-16 transition-transform duration-500 group-hover:scale-150`} />
              
              <div className="relative z-10">
                <div className="mb-8 group-hover:scale-105 transition-transform duration-300 flex justify-center">
                  <img 
                    src={lvl.level === 1 ? "/alfasl_mustawa_alawal.png" : "/alfasl_mustawa_athani_correct.png"} 
                    alt={lvl.title} 
                    className="w-48 h-48 object-contain"
                  />
                </div>

                <div className="inline-flex items-center px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
                  Niveau {lvl.level}
                </div>
                
                <h3 className="text-2xl font-bold mb-3">{lvl.title} — {lvl.description}</h3>
                <p className="text-muted-foreground mb-8 leading-relaxed">
                  {lvl.longDescription}
                </p>

                <ul className="space-y-4 mb-8">
                  {lvl.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-muted-foreground">
                      <div className="mr-3 p-1.5 rounded-lg bg-muted">
                        <feature.icon className="w-4 h-4 text-primary" />
                      </div>
                      {feature.label}
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full group/btn rounded-xl py-6 text-lg">
                  <Link to={lvl.to}>
                    Explorer
                    <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover/btn:translate-x-1" />
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LevelsOverview;
