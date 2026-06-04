import { motion } from "framer-motion";
import { BookOpen, ExternalLink, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

const LibrairieSection = () => (
  <section className="py-20 bg-card">
    <div className="container mx-auto px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="max-w-3xl mx-auto rounded-3xl overflow-hidden border border-amber-200/60 bg-gradient-to-br from-amber-50 to-white dark:from-amber-950/20 dark:to-background shadow-lg"
      >
        {/* Bande dorée */}
        <div className="h-1 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-400" />

        <div className="p-8 sm:p-10 flex flex-col sm:flex-row items-center gap-8">
          {/* Icône */}
          <div className="shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-300 flex items-center justify-center shadow-md shadow-amber-200">
            <ShoppingBag className="h-9 w-9 text-amber-950" />
          </div>

          {/* Texte */}
          <div className="flex-1 text-center sm:text-left">
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-600 block mb-2">
              Librairie partenaire
            </span>
            <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              Science Utile — <span className="font-arabic text-amber-700">علم نافع</span>
            </h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-5 max-w-md">
              Livres en arabe, ouvrages de tajwid, Mushaf, méthodes d'apprentissage et littérature islamique.
              Retrouvez tous les supports qui complètent votre progression sur ALFASL.
            </p>
            <Button
              asChild
              className="bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-500 hover:to-yellow-400 text-amber-950 font-bold border-0 gap-2 shadow-md shadow-amber-200/50"
            >
              <a href="https://www.science-utile.fr" target="_blank" rel="noopener noreferrer">
                <BookOpen className="h-4 w-4" />
                Visiter la librairie
                <ExternalLink className="h-3.5 w-3.5 opacity-70" />
              </a>
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default LibrairieSection;
