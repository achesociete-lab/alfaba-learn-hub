import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Lock, ChevronLeft, Tv, Star, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Episode {
  id: string;
  episode_number: number;
  title_fr: string | null;
  title_ar: string | null;
  youtube_id: string;
  duration_minutes: number | null;
  is_free: boolean;
}

interface Series {
  id: string;
  title_fr: string;
  title_ar: string;
  description_fr: string | null;
  level: string;
  age_range: string;
  episodes?: Episode[];
}

const LEVEL_LABELS: Record<string, string> = {
  tous: "Tous niveaux",
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
};
const LEVEL_COLORS: Record<string, string> = {
  tous: "bg-emerald-100 text-emerald-800",
  debutant: "bg-blue-100 text-blue-800",
  intermediaire: "bg-orange-100 text-orange-800",
  avance: "bg-red-100 text-red-800",
};

function ytThumb(youtubeId: string) {
  return `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
}

export default function DessinAnimes() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { hasLessonAccess } = useSubscription();

  const [series, setSeries] = useState<Series[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("tous");
  const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);
  const [playingEpisode, setPlayingEpisode] = useState<Episode | null>(null);

  useEffect(() => {
    if (!user) { navigate("/auth"); return; }
    loadSeries();
  }, [user]);

  const loadSeries = async () => {
    setLoading(true);
    const { data: seriesData } = await supabase
      .from("cartoon_series")
      .select("*")
      .eq("is_active", true)
      .order("sort_order");

    if (!seriesData) { setLoading(false); return; }

    const withEpisodes = await Promise.all(
      (seriesData as unknown as Series[]).map(async (s) => {
        const { data: eps } = await supabase
          .from("cartoon_episodes")
          .select("*")
          .eq("series_id", s.id)
          .order("episode_number");
        return { ...s, episodes: (eps || []) as unknown as Episode[] };
      })
    );
    setSeries(withEpisodes);
    setLoading(false);
  };

  const canWatch = (ep: Episode) => ep.is_free || hasLessonAccess;

  const filtered = filter === "tous" ? series : series.filter(s => s.level === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <Tv className="h-7 w-7 text-primary" />
              <h1 className="text-3xl font-bold text-foreground font-arabic" dir="rtl">رُسُومٌ مُتَحَرِّكَة</h1>
            </div>
            <p className="text-muted-foreground font-arabic text-lg" dir="rtl">تَعَلَّمِ الْعَرَبِيَّةَ بِمُشَاهَدَةِ الرُّسُومِ الْمُتَحَرِّكَةِ</p>
          </motion.div>

          {/* Filters */}
          <div className="flex gap-2 mb-8 flex-wrap">
            {["tous", "debutant", "intermediaire", "avance"].map(l => (
              <button
                key={l}
                onClick={() => setFilter(l)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  filter === l ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {LEVEL_LABELS[l]}
              </button>
            ))}
          </div>

          {/* Loading */}
          {loading && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="rounded-2xl overflow-hidden border bg-card animate-pulse">
                  <div className="aspect-video bg-muted" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 bg-muted rounded w-3/4" />
                    <div className="h-3 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && filtered.length === 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
              <Tv className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-xl font-semibold text-foreground mb-2">Bientôt disponible</p>
              <p className="text-muted-foreground">Des séries sont en cours d'ajout. Revenez prochainement !</p>
            </motion.div>
          )}

          {/* Series grid */}
          {!loading && !selectedSeries && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              <AnimatePresence>
                {filtered.map((s, i) => {
                  const firstEp = s.episodes?.[0];
                  const thumb = firstEp ? ytThumb(firstEp.youtube_id) : null;
                  const freeCount = s.episodes?.filter(e => e.is_free).length ?? 0;
                  return (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => setSelectedSeries(s)}
                      className="rounded-2xl overflow-hidden border border-border bg-card hover:shadow-lg hover:border-primary/30 transition-all cursor-pointer group"
                    >
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        {thumb ? (
                          <img src={thumb} alt={s.title_fr} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Tv className="h-10 w-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center">
                            <Play className="h-5 w-5 text-foreground fill-current ml-0.5" />
                          </div>
                        </div>
                        {freeCount > 0 && (
                          <div className="absolute top-2 left-2">
                            <span className="text-[10px] font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">GRATUIT</span>
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <h3 className="font-semibold text-foreground text-sm leading-tight mb-1 line-clamp-1">{s.title_fr}</h3>
                        <p className="font-arabic text-base text-primary font-medium text-right mb-2" dir="rtl">{s.title_ar}</p>
                        <div className="flex items-center justify-between">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[s.level] || LEVEL_COLORS.tous}`}>
                            {LEVEL_LABELS[s.level] || "Tous niveaux"}
                          </span>
                          <span className="text-xs text-muted-foreground">{s.episodes?.length ?? 0} ép.</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}

          {/* Series detail — episode list */}
          {selectedSeries && !playingEpisode && (
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
              <button onClick={() => setSelectedSeries(null)} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
                <ChevronLeft className="h-4 w-4" /> Retour aux séries
              </button>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">{selectedSeries.title_fr}</h2>
                <p className="font-arabic text-xl text-primary font-bold mt-1" dir="rtl">{selectedSeries.title_ar}</p>
                {selectedSeries.description_fr && (
                  <p className="text-muted-foreground mt-2 text-sm max-w-2xl">{selectedSeries.description_fr}</p>
                )}
                <div className="flex items-center gap-3 mt-3">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_COLORS[selectedSeries.level] || LEVEL_COLORS.tous}`}>
                    {LEVEL_LABELS[selectedSeries.level]}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {selectedSeries.age_range}
                  </span>
                  <span className="text-xs text-muted-foreground">{selectedSeries.episodes?.length ?? 0} épisodes</span>
                </div>
              </div>

              {(!selectedSeries.episodes || selectedSeries.episodes.length === 0) && (
                <p className="text-center text-muted-foreground py-12">Aucun épisode disponible pour l'instant.</p>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedSeries.episodes?.map((ep, i) => {
                  const unlocked = canWatch(ep);
                  return (
                    <motion.div
                      key={ep.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => unlocked ? setPlayingEpisode(ep) : navigate("/tarifs")}
                      className={`rounded-xl overflow-hidden border bg-card transition-all cursor-pointer group ${
                        unlocked ? "hover:shadow-md hover:border-primary/30" : "opacity-70 hover:opacity-90"
                      }`}
                    >
                      <div className="relative aspect-video bg-muted overflow-hidden">
                        <img src={ytThumb(ep.youtube_id)} alt={ep.title_fr ?? `Épisode ${ep.episode_number}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          {unlocked ? (
                            <div className="h-10 w-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Play className="h-4 w-4 fill-current ml-0.5" />
                            </div>
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-black/60 flex items-center justify-center">
                              <Lock className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                          Ép. {ep.episode_number}
                        </div>
                        {ep.is_free && (
                          <div className="absolute top-2 right-2 bg-emerald-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            GRATUIT
                          </div>
                        )}
                      </div>
                      <div className="p-3">
                        <p className="text-sm font-medium text-foreground line-clamp-1">
                          {ep.title_fr || `Épisode ${ep.episode_number}`}
                        </p>
                        {ep.title_ar && (
                          <p className="font-arabic text-sm text-primary text-right mt-0.5" dir="rtl">{ep.title_ar}</p>
                        )}
                        <div className="flex items-center justify-between mt-1">
                          {ep.duration_minutes && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" /> {ep.duration_minutes} min
                            </span>
                          )}
                          {!unlocked && (
                            <span className="text-xs text-primary font-medium ml-auto">Débloquer →</span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* Video player modal */}
      <AnimatePresence>
        {playingEpisode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          >
            <div className="w-full max-w-4xl">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-white font-semibold">{selectedSeries?.title_fr} — Épisode {playingEpisode.episode_number}</p>
                  {playingEpisode.title_fr && <p className="text-white/70 text-sm">{playingEpisode.title_fr}</p>}
                </div>
                <button onClick={() => setPlayingEpisode(null)} className="text-white/70 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={`https://www.youtube.com/embed/${playingEpisode.youtube_id}?autoplay=1&rel=0`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                />
              </div>
              {/* Next episode */}
              {selectedSeries?.episodes && (() => {
                const currentIdx = selectedSeries.episodes!.findIndex(e => e.id === playingEpisode.id);
                const next = selectedSeries.episodes![currentIdx + 1];
                return next && canWatch(next) ? (
                  <button
                    onClick={() => setPlayingEpisode(next)}
                    className="mt-3 flex items-center gap-2 text-white/80 hover:text-white text-sm transition-colors"
                  >
                    <Play className="h-4 w-4" />
                    Épisode suivant : {next.title_fr || `Épisode ${next.episode_number}`}
                  </button>
                ) : null;
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
