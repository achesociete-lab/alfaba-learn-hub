import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const testimonials = [
  { name: "Fatima R.", text: "Placeholder — témoignage à compléter." },
  { name: "Youssef B.", text: "Placeholder — témoignage à compléter." },
  { name: "Amina K.", text: "Placeholder — témoignage à compléter." },
];

const Stars = () => (
  <div className="flex gap-0.5 mb-3">
    {Array.from({ length: 5 }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-[hsl(var(--gold))] text-[hsl(var(--gold))]" />
    ))}
  </div>
);

const TestimonialsSection = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <div className="text-center mb-14">
        <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
          Ce que disent <span className="text-gradient-gold">nos élèves</span>
        </h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
        {testimonials.map((t, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
          >
            <Card className="h-full">
              <CardContent className="p-6">
                <Stars />
                <p className="text-sm text-muted-foreground mb-4">"{t.text}"</p>
                <p className="font-semibold text-foreground text-sm">{t.name}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  </section>
);

export default TestimonialsSection;
