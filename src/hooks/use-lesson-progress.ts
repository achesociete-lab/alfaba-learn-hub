import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

// Niveau 2 lesson IDs are stored with a 1000 offset to avoid collision with Niveau 1
const N2_OFFSET = 1000;

export function useLessonProgress() {
  const { user } = useAuth();
  const [allCompleted, setAllCompleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setAllCompleted([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id);

      if (data) {
        setAllCompleted(data.map((r) => r.lesson_id));
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const completeLesson = useCallback(
    async (lessonId: number) => {
      if (!user || allCompleted.includes(lessonId)) return;

      const { error } = await supabase
        .from("lesson_progress")
        .insert({ user_id: user.id, lesson_id: lessonId });

      if (!error) {
        setAllCompleted((prev) => [...new Set([...prev, lessonId])]);
      }
    },
    [user, allCompleted]
  );

  // Niveau 1: lesson IDs 1-28
  const completedLessons = allCompleted.filter((id) => id <= 100);

  // Niveau 2: stored as 1001-1012, exposed as 1-12
  const completedN2Lessons = allCompleted
    .filter((id) => id > N2_OFFSET)
    .map((id) => id - N2_OFFSET);

  const completeN2Lesson = useCallback(
    async (lessonId: number) => {
      await completeLesson(lessonId + N2_OFFSET);
    },
    [completeLesson]
  );

  return {
    completedLessons,
    completedN2Lessons,
    loading,
    completeLesson,
    completeN2Lesson,
  };
}

