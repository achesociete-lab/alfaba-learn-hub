import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, ChevronRight, Sparkles, Quote, Mic } from "lucide-react";
import { QURAN_MERITS, MERIT_THEMES, type MeritEntry, type MeritTheme } from "@/data/quran-merits";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";

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

            {/* Theme badges */}
            <div className="flex flex-wrap gap-1.5">
              {entry.themes.map((theme) => {
                const t = MERIT_THEMES.find((m) => m.value === theme);
                return t ? (
                  <span key={theme} className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                    {t.emoji} {t.label}
                  </span>
                ) : null;
              })}
            </div>

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

            {/* Action buttons */}
            <div className="flex flex-wrap gap-2 pt-1">
              <button
                onClick={() => onSelectSurah(entry.surahNumber)}
                className="flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
              >
                <BookOpen className="h-4 w-4" />
                {entry.ayahStart
                  ? `Lire le verset ${entry.ayahStart} — Sourate ${entry.surahNumber}`
                  : `Lire Sourate ${entry.title}`}
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelectSurah(entry.surahNumber)}
                className="gap-1.5 text-xs ml-auto"
              >
                <Mic className="h-3.5 w-3.5" /> Réciter cette sourate →
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </motion.div>
  );
};

export default function SurahMeritSection({ onSelectSurah }: Props) {
  const [activeThemes, setActiveThemes] = useState<MeritTheme[]>([]);

  const toggleTheme = (theme: MeritTheme) => {
    setActiveThemes((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme]
    );
  };

  const filteredMerits = activeThemes.length === 0
    ? QURAN_MERITS
    : QURAN_MERITS.filter((entry) => entry.themes.some((t) => activeThemes.includes(t)));

  return (
    <div className="space-y-3">
      <div className="text-center mb-4">
        <h2 className="text-base font-bold text-foreground flex items-center justify-center gap-2">
          <Sparkles className="h-4 w-4 text-amber-500" />
          Sourates et versets à mérite particulier
        </h2>
        <p className="text-xs text-muted-foreground mt-1">Appuyés par des hadiths authentiques</p>
      </div>

      {/* Theme filters */}
      <div className="flex flex-wrap justify-center gap-2 mb-4">
        {MERIT_THEMES.map((theme) => (
          <button
            key={theme.value}
            onClick={() => toggleTheme(theme.value)}
            className={`text-xs font-medium px-3 py-1.5 rounded-full transition-all ${
              activeThemes.includes(theme.value)
                ? "bg-primary text-primary-foreground shadow-sm"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {theme.emoji} {theme.label}
          </button>
        ))}
      </div>

      {filteredMerits.map((entry) => (
        <MeritCard key={entry.id} entry={entry} onSelectSurah={onSelectSurah} />
      ))}

      {filteredMerits.length === 0 && (
        <p className="text-sm text-muted-foreground text-center py-8">Aucune sourate ne correspond à ce filtre.</p>
      )}
    </div>
  );
}
