import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, Link } from "react-router-dom";
import { useSubscription } from "@/hooks/use-subscription";
import { type Lesson } from "@/data/niveau1-lessons";
import { type Niveau2Lesson } from "@/data/niveau2-lessons";
import LessonSelector from "@/components/exercises/LessonSelector";
import LessonDetail from "@/components/exercises/LessonDetail";
import Niveau2LessonSelector from "@/components/exercises/Niveau2LessonSelector";
import Niveau2LessonDetail from "@/components/exercises/Niveau2LessonDetail";
import { useLessonProgress } from "@/hooks/use-lesson-progress";
import { useNiveau1Lessons, useNiveau2Lessons } from "@/hooks/use-lessons";

type Level = "niveau_1" | "niveau_2";

// ─── Niveau 1 Progressive Lessons ───
function Niveau1Lessons({ maxLessons, onLessonChange }: { maxLessons: number; onLessonChange: (lesson: Lesson | null) => void }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { completedLessons, completeLesson } = useLessonProgress();
  const { lessons } = useNiveau1Lessons();

  // Auto-select lesson from URL query param
  useEffect(() => {
    const lessonParam = searchParams.get("lesson");
    if (lessonParam && lessons.length > 0 && !selectedLesson) {
      const num = parseInt(lessonParam, 10);
      const found = lessons.find(l => l.id === num);
      if (found) {
        setSelectedLesson(found);
        onLessonChange(found);
        searchParams.delete("lesson");
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [lessons, searchParams]);

  const currentIdx = selectedLesson ? lessons.findIndex(l => l.id === selectedLesson.id) : -1;
  const nextLesson = currentIdx >= 0 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;

  const handleSelect = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    onLessonChange(lesson);
  };

  const handleBack = () => {
    setSelectedLesson(null);
    onLessonChange(null);
  };

  if (selectedLesson) {
    return (
      <LessonDetail
        lesson={selectedLesson}
        onBack={handleBack}
        onComplete={completeLesson}
        nextLessonId={nextLesson?.id || null}
        onNextLesson={(id) => {
          const lesson = lessons.find(l => l.id === id);
          if (lesson) handleSelect(lesson);
        }}
      />
    );
  }

  return (
    <LessonSelector
      lessons={lessons}
      completedLessons={completedLessons}
      currentLesson={null}
      onSelectLesson={handleSelect}
      maxLessons={maxLessons}
    />
  );
}

// ─── Niveau 2 Progressive Lessons ───
function Niveau2Lessons() {
  const [selectedLesson, setSelectedLesson] = useState<Niveau2Lesson | null>(null);
  const { completedN2Lessons, completeN2Lesson } = useLessonProgress();
  const { lessons } = useNiveau2Lessons();

  if (selectedLesson) {
    return (
      <Niveau2LessonDetail
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onComplete={completeN2Lesson}
      />
    );
  }

  return (
    <Niveau2LessonSelector
      lessons={lessons}
      completedLessons={completedN2Lessons}
      onSelectLesson={setSelectedLesson}
    />
  );
}

// ─── Main Page ───
const Exercises = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [level, setLevel] = useState<Level>("niveau_1");
  const { maxLessons, isFreePlan, loading: subLoading } = useSubscription();
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);

  // No redirect for unauthenticated users — lessons 1-3 are free

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("level").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setLevel(data.level as Level); });
  }, [user]);

  if (authLoading || subLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  }

  const pageTitle = currentLesson
    ? `Niveau 1 — ${currentLesson.title}`
    : level === "niveau_1"
    ? "Niveau 1 — L'alphabet arabe"
    : "Niveau 2 — Grammaire & dictée avancée";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">{pageTitle}</h1>
            <p className="text-muted-foreground">
              {level === "niveau_1"
                ? "L'alphabet arabe lettre par lettre"
                : "Grammaire, compréhension & dictée avancée"}
            </p>
            {isFreePlan && !user && (
              <p className="text-sm text-muted-foreground mt-2">
                🔒 Inscris-toi gratuitement pour continuer ton apprentissage →{" "}
                <Link to="/auth" className="underline font-medium text-primary">S'inscrire</Link>
              </p>
            )}
            {isFreePlan && user && (
              <p className="text-sm text-destructive mt-2">
                🔒 Plan Découverte — Accès aux {maxLessons} premières leçons.{" "}
                <Link to="/tarifs" className="underline font-medium">Passer au plan Essentiel</Link>
              </p>
            )}
          </motion.div>

          {level === "niveau_1" ? <Niveau1Lessons maxLessons={maxLessons} onLessonChange={setCurrentLesson} /> : <Niveau2Lessons />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Exercises;
