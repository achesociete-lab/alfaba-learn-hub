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
  <section className="py-20 bg-background overflow-hidden">
    <div className="container mx-auto px-4">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12"
        >
          <div className="relative inline-block mb-8">
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl scale-150 opacity-50" />
            <img 
              src="/alfasl_musaid_almoalim_final.png" 
              alt="Musa'id Al-Moalim" 
              className="relative w-64 h-64 mx-auto object-contain drop-shadow-2xl"
            />
          </div>
          
          <h2 className="text-3xl sm:text-5xl font-bold text-foreground mb-4">
            Rencontrez <span className="text-gradient-gold">Musa'id Al-Moalim</span> (مساعد المعلم)
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Votre assistant pédagogique personnel disponible 24h/24. Il s'adapte à votre rythme pour vous guider dans chaque leçon.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-3 gap-8 mb-12">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-8 rounded-2xl border border-border bg-card/50 backdrop-blur-sm text-center hover:shadow-lg transition-all duration-300"
            >
              <span className="text-4xl mb-4 block">{p.emoji}</span>
              <p className="text-base font-semibold text-foreground leading-tight">{p.text}</p>
            </motion.div>
          ))}
        </div>

        <Button asChild size="lg" className="gradient-emerald border-0 text-primary-foreground text-lg px-10 py-7 rounded-2xl shadow-xl hover:scale-105 transition-transform">
          <Link to="/conversation">
            Commencer à discuter <ArrowRight className="ml-2 h-6 w-6" />
          </Link>
        </Button>
      </div>
    </div>
  </section>
);

export default AIProfessorSection;
