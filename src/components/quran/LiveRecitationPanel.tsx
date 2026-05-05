// Self-contained panel that drives the Tarteel-style live recitation.
//
// Manages its own state:
//  1. surah selection (dropdown across all 114 sourates)
//  2. ayah range selection (start / end with validation)
//  3. loads verses from the Quran API
//  4. renders <QuranLiveRecitation /> once ready
//
// Designed to be dropped inside a TabsContent block in Coran.tsx.

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Loader2, Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { fetchSurahVerses, type QuranVerse, type SurahInfo } from "@/utils/quran-api";
import QuranLiveRecitation from "@/components/quran/QuranLiveRecitation";
import { toast } from "sonner";

interface Props {
  allSurahs: SurahInfo[];
}

const LiveRecitationPanel = ({ allSurahs }: Props) => {
  const [selectedSurah, setSelectedSurah] = useState<SurahInfo | null>(null);
  const [verses, setVerses] = useState<QuranVerse[]>([]);
  const [loading, setLoading] = useState(false);
  const [ayahStart, setAyahStart] = useState(1);
  const [ayahEnd, setAyahEnd] = useState(7);
  const [started, setStarted] = useState(false);

  // Auto-load verses when surah changes
  useEffect(() => {
    if (!selectedSurah) {
      setVerses([]);
      return;
    }
    setLoading(true);
    setStarted(false);
    fetchSurahVerses(selectedSurah.number)
      .then((v) => {
        setVerses(v);
        setAyahStart(1);
        setAyahEnd(Math.min(7, v.length));
      })
      .catch(() => toast.error("Erreur lors du chargement des versets"))
      .finally(() => setLoading(false));
  }, [selectedSurah]);

  const selectedVerses = verses.filter((v) => v.number >= ayahStart && v.number <= ayahEnd);
  const canStart = selectedSurah && selectedVerses.length > 0 && !loading;

  const reset = () => {
    setStarted(false);
  };

  // Recitation view
  if (started && selectedSurah && selectedVerses.length > 0) {
    return (
      <QuranLiveRecitation
        surah={selectedSurah}
        verses={selectedVerses}
        onClose={reset}
      />
    );
  }

  // Picker view
  return (
    <div className="space-y-5">
      {/* Header explainer */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-gold/5"
      >
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
            <Sparkles className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Lecture interactive du Coran
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1">
              Récitez à voix haute. Chaque mot s'affichera en
              <span className="text-emerald-600 font-medium"> vert si correct</span>,
              <span className="text-red-600 font-medium"> rouge si erreur</span>,
              <span className="text-amber-600 font-medium"> orange si sauté</span>.
              La correction se fait en temps réel, mot par mot.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Surah picker */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-foreground uppercase tracking-wide flex items-center gap-2">
          <BookOpen className="h-3.5 w-3.5" /> Choisissez une sourate
        </label>
        <Select
          value={selectedSurah ? String(selectedSurah.number) : ""}
          onValueChange={(v) => {
            const s = allSurahs.find((x) => x.number === Number(v));
            if (s) setSelectedSurah(s);
          }}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="— Sélectionner une sourate —" />
          </SelectTrigger>
          <SelectContent className="max-h-[60vh]">
            {allSurahs.map((s) => (
              <SelectItem key={s.number} value={String(s.number)}>
                <span className="inline-flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-7 text-right">{s.number}.</span>
                  <span>{s.name}</span>
                  <span className="font-arabic text-base ms-1">{s.nameArabic}</span>
                  <span className="text-xs text-muted-foreground">({s.versesCount} v.)</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Ayah range */}
      {selectedSurah && (
        <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="space-y-2">
          <label className="text-xs font-semibold text-foreground uppercase tracking-wide">
            Plage de versets ({selectedSurah.versesCount} versets disponibles)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] text-muted-foreground">Du verset</label>
              <Input
                type="number"
                min={1}
                max={selectedSurah.versesCount}
                value={ayahStart}
                onChange={(e) => {
                  const v = Math.max(1, Math.min(selectedSurah.versesCount, Number(e.target.value) || 1));
                  setAyahStart(v);
                  if (v > ayahEnd) setAyahEnd(v);
                }}
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground">Au verset</label>
              <Input
                type="number"
                min={ayahStart}
                max={selectedSurah.versesCount}
                value={ayahEnd}
                onChange={(e) => {
                  const v = Math.max(ayahStart, Math.min(selectedSurah.versesCount, Number(e.target.value) || ayahStart));
                  setAyahEnd(v);
                }}
              />
            </div>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Conseil : commencez par 3-7 versets courts pour vous habituer.
          </p>
        </motion.div>
      )}

      {/* Preview of selected verses */}
      {selectedSurah && selectedVerses.length > 0 && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="p-4 rounded-xl border border-border bg-card max-h-[30vh] overflow-y-auto"
          dir="rtl"
          lang="ar"
        >
          {selectedVerses.map((v) => (
            <div key={v.number} className="mb-3 leading-loose">
              <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-primary/10 text-primary text-[10px] font-bold ms-2 align-middle">
                {v.number}
              </span>
              <span className="font-arabic text-xl sm:text-2xl text-foreground">{v.arabic}</span>
            </div>
          ))}
        </motion.div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
          <Loader2 className="h-4 w-4 animate-spin" /> Chargement des versets…
        </div>
      )}

      {/* Start button */}
      <div className="flex justify-center pt-2">
        <Button
          size="lg"
          disabled={!canStart}
          onClick={() => setStarted(true)}
          className="gradient-emerald border-0 text-primary-foreground gap-2 px-8"
        >
          Démarrer la lecture interactive <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LiveRecitationPanel;
