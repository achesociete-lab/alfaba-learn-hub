import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useLessonProgress() {
  const { user } = useAuth();
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setCompletedLessons([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", user.id);

      if (data) {
        setCompletedLessons(data.map((r) => r.lesson_id));
      }
      setLoading(false);
    };

    fetchProgress();
  }, [user]);

  const completeLesson = useCallback(
    async (lessonId: number) => {
      if (!user || completedLessons.includes(lessonId)) return;

      const { error } = await supabase
        .from("lesson_progress")
        .insert({ user_id: user.id, lesson_id: lessonId });

      if (!error) {
        setCompletedLessons((prev) => [...new Set([...prev, lessonId])]);
      }
    },
    [user, completedLessons]
  );

  return { completedLessons, loading, completeLesson };
}
