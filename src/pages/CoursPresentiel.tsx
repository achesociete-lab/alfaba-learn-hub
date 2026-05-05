import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, BookOpen, FileText, Headphones, CheckCircle2, ChevronRight, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import PresentielCourseDetail from "@/components/presentiel/PresentielCourseDetail";
import { usePersistentState, userScopedKey } from "@/hooks/use-persistent-state";

interface PresentielCourse {
  id: string;
  title: string;
  course_date: string;
  photo_url: string | null;
  lesson_photos?: string[];
  level: "niveau_1" | "niveau_2";
  lesson_text: string | null;
  vocabulary: { arabic: string; french: string }[];
  dictation_words: string[];
  qcm: any[];
  translation: { arabic?: string; french?: string };
  dictation: { sentences?: { arabic: string; french: string }[] };
}

const CoursPresentiel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<PresentielCourse[]>([]);
  const [progress, setProgress] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = usePersistentState<string | null>(userScopedKey(user?.id, "presentiel:selectedCourseId"), null);
  const selected = selectedId ? courses.find((c) => c.id === selectedId) ?? null : null;

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data: assignments } = await supabase
        .from("presentiel_course_assignments")
        .select("course_id")
        .eq("user_id", user.id);

      const ids = (assignments || []).map((a: any) => a.course_id);
      if (ids.length === 0) {
        setCourses([]);
        setLoading(false);
        return;
      }

      // Ordre voulu = ordre d'ajout par le professeur (created_at croissant).
      // La date du cours peut être identique ou rétroactive — c'est l'ordre
      // de création qui reflète la séquence pédagogique.
      const { data: coursesData } = await supabase
        .from("presentiel_courses")
        .select("*")
        .in("id", ids)
        .order("created_at", { ascending: true });

      const { data: progressData } = await supabase
        .from("presentiel_course_progress")
        .select("*")
        .eq("user_id", user.id)
        .in("course_id", ids);

      const progressMap: Record<string, any> = {};
      (progressData || []).forEach((p: any) => { progressMap[p.course_id] = p; });

      setCourses((coursesData as any[]) || []);
      setProgress(progressMap);
      setLoading(false);
    };
    fetch();
  }, [user]);

  if (selected) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="pt-24 pb-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Button variant="ghost" onClick={() => setSelectedId(null)} className="mb-4">
              ← Retour aux cours
            </Button>
            <PresentielCourseDetail
              course={selected}
              userProgress={progress[selected.id]}
              onProgressUpdate={(p) => setProgress((prev) => ({ ...prev, [selected.id]: p }))}
            />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="flex items-center gap-3 mb-2">
              <MapPin className="h-6 w-6 text-gold" />
              <h1 className="text-3xl font-bold text-foreground">Mes cours en présentiel</h1>
            </div>
            <p className="text-muted-foreground">
              Retrouvez les cours suivis sur place : QCM, traduction et dictée pour chacun.
            </p>
          </motion.div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : courses.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Aucun cours ne vous a encore été assigné. Votre professeur vous en ajoutera après chaque séance.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {(() => {
                // Un cours est terminé quand QCM + traduction + dictée sont validés
                const isDone = (c: PresentielCourse) => {
                  const p = progress[c.id] || {};
                  return p.qcm_completed && p.translation_completed && p.dictation_completed;
                };
                // Verrou progressif : on déverrouille jusqu'au 1er cours non terminé inclus.
                // Tous les cours suivants restent verrouillés.
                const firstUnfinishedIdx = courses.findIndex((c) => !isDone(c));
                const isLocked = (idx: number) =>
                  firstUnfinishedIdx !== -1 && idx > firstUnfinishedIdx;

                return courses.map((c, i) => {
                  const p = progress[c.id] || {};
                  const done = isDone(c);
                  const locked = isLocked(i);
                  return (
                    <motion.div
                      key={c.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Card
                        className={`transition-all ${
                          locked
                            ? "opacity-60 cursor-not-allowed grayscale-[0.4]"
                            : "cursor-pointer hover:border-primary/50 hover:shadow-lg"
                        }`}
                        onClick={() => {
                          if (locked) {
                            toast.info("Termine d'abord la leçon précédente pour débloquer celle-ci.");
                            return;
                          }
                          setSelectedId(c.id);
                        }}
                      >
                        {c.photo_url && (
                          <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted relative">
                            <img src={c.photo_url} alt={c.title} className="w-full h-full object-cover" />
                            {locked && (
                              <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
                                <Lock className="h-10 w-10 text-muted-foreground" />
                              </div>
                            )}
                          </div>
                        )}
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between mb-2 gap-2">
                            <h3 className="font-semibold text-foreground line-clamp-2 flex-1">
                              <span className="text-muted-foreground mr-1">#{i + 1}</span>
                              {c.title}
                            </h3>
                            {done && <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />}
                            {locked && !done && <Lock className="h-4 w-4 text-muted-foreground shrink-0" />}
                          </div>
                          <p className="text-xs text-muted-foreground mb-3">
                            {new Date(c.course_date).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mb-3">
                            <Badge variant={p.qcm_completed ? "default" : "outline"} className="text-xs">
                              <FileText className="h-3 w-3 mr-1" /> QCM {p.qcm_completed && p.qcm_score != null ? `${p.qcm_score}/10` : ""}
                            </Badge>
                            <Badge variant={p.translation_completed ? "default" : "outline"} className="text-xs">
                              Traduction
                            </Badge>
                            <Badge variant={p.dictation_completed ? "default" : "outline"} className="text-xs">
                              <Headphones className="h-3 w-3 mr-1" /> Dictée
                            </Badge>
                          </div>
                          {locked ? (
                            <div className="flex items-center text-muted-foreground text-sm font-medium">
                              <Lock className="h-4 w-4 mr-1" /> Verrouillé — termine la leçon précédente
                            </div>
                          ) : (
                            <div className="flex items-center text-primary text-sm font-medium">
                              {done ? "Revoir le cours" : "Ouvrir le cours"} <ChevronRight className="h-4 w-4 ml-1" />
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CoursPresentiel;
