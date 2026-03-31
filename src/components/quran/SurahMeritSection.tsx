import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Sparkles, Quote } from "lucide-react";
import { QURAN_MERITS, type MeritEntry } from "@/data/quran-merits";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useState } from "react";

interface Props {
  onSelectSurah: (surahNumber: number) => void;
}

const MeritCard = ({ entry, onSelectSurah }: { entry: MeritEntry; onSelectSurah: (n: number) => void }) => {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border bg-card overflow-hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="w-full p-4 text-left hover:bg-muted/50 transition-colors">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/10 flex items-center justify-center shrink-0">
              <Sparkles className="h-5 w-5 text-amber-500" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">{entry.title}</h3>
              <p className="text-xs text-muted-foreground line-clamp-1">{entry.description}</p>
            </div>
            <span className="font-arabic text-base text-foreground shrink-0">{entry.titleArabic}</span>
            <ChevronRight className={`h-4 w-4 text-muted-foreground shrink-0 transition-transform ${open ? "rotate-90" : ""}`} />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-4 pb-4 space-y-4">
            <p className="text-sm text-muted-foreground">{entry.description}</p>

            {/* Hadiths */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Quote className="h-3.5 w-3.5" /> Preuves authentiques
              </h4>
              {entry.hadiths.map((hadith, i) => (
                <div key={i} className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/10">
                  <p className="text-sm text-foreground leading-relaxed mb-2">{hadith.text}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs text-muted-foreground italic">{hadith.source}</span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      hadith.grade === "Sahih" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"
                    }`}>
                      {hadith.grade}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">Mérites</h4>
              {entry.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">✦</span>
                  <span className="text-sm text-foreground">{benefit}</span>
                </div>
              ))}
            </div>

            {/* Go to surah */}
            <button
              onClick={() => onSelectSurah(entry.surahNumber)}
              className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <BookOpen className="h-4 w-4" />
              {entry.ayahStart
                ? `Lire le verset ${entry.ayahStart} — Sourate ${entry.surahNumber}`
                : `Lire Sourate ${entry.title}`}
            </button>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default function SurahMeritSection({ onSelectSurah }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Sourates et versets à mérite particulier
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Appuyés par des hadiths authentiques</p>
      </div>
      {QURAN_MERITS.map((entry) => (
        <MeritCard key={entry.id} entry={entry} onSelectSurah={onSelectSurah} />
      ))}
    </div>
  );
}
