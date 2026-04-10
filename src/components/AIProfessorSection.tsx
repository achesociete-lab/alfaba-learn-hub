import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const points = [
  { emoji: "💬", text: "Conversations en arabe adaptées à votre niveau" },
  { emoji: "📊", text: "Suit votre progression en temps réel" },
  { emoji: "🕌", text: "Spécialisé en arabe littéraire et coranique" },
];

const AIProfessorSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="max-w-3xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Votre <span className="text-gradient-gold">Professeur IA</span> personnel
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto mb-10">
            Disponible 24h/24, il s'adapte à votre niveau et votre progression dans les leçons
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-6 mb-10">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-xl border border-border bg-card text-center"
            >
              <span className="text-3xl mb-3 block">{p.emoji}</span>
              <p className="text-sm font-medium text-foreground">{p.text}</p>
            </motion.div>
          ))}
        </div>

        <Button asChild size="lg" className="gradient-emerald border-0 text-primary-foreground text-base px-8">
          <Link to="/conversation">
            Découvrir le Professeur IA <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default AIProfessorSection;
