import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
function Niveau1Lessons({ maxLessons }: { maxLessons: number }) {
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const { completedLessons, completeLesson } = useLessonProgress();
  const { lessons } = useNiveau1Lessons();

  if (selectedLesson) {
    return (
      <LessonDetail
        lesson={selectedLesson}
        onBack={() => setSelectedLesson(null)}
        onComplete={completeLesson}
      />
    );
  }

  return (
    <LessonSelector
      lessons={lessons}
      completedLessons={completedLessons}
      currentLesson={null}
      onSelectLesson={setSelectedLesson}
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

  useEffect(() => {
    if (!authLoading && !user) navigate("/auth");
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("level").eq("user_id", user.id).single()
      .then(({ data }) => { if (data) setLevel(data.level as Level); });
  }, [user]);

  if (authLoading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Chargement...</p></div>;
  }
  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-foreground mb-2">Exercices interactifs</h1>
            <p className="text-muted-foreground">
              {level === "niveau_1"
                ? "Niveau 1 — L'alphabet arabe lettre par lettre"
                : "Niveau 2 — Grammaire, compréhension & dictée avancée"}
            </p>
          </motion.div>

          {level === "niveau_1" ? <Niveau1Lessons /> : <Niveau2Lessons />}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Exercises;
