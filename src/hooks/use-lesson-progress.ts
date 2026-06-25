import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useFamilyProfile } from "@/contexts/FamilyProfileContext";

const N2_OFFSET = 1000;

export function useLessonProgress() {
  const { user } = useAuth();
  const { activeUserId } = useFamilyProfile();
  const userId = activeUserId ?? user?.id;

  const [allCompleted, setAllCompleted] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAllCompleted([]);
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      const { data } = await supabase
        .from("lesson_progress")
        .select("lesson_id")
        .eq("user_id", userId);

      if (data) setAllCompleted(data.map((r) => r.lesson_id));
      setLoading(false);
    };

    fetchProgress();
  }, [userId]);

  const completeLesson = useCallback(
    async (lessonId: number) => {
      if (!userId || allCompleted.includes(lessonId)) return;
      const { error } = await supabase
        .from("lesson_progress")
        .insert({ user_id: userId, lesson_id: lessonId });
      if (!error) setAllCompleted((prev) => [...new Set([...prev, lessonId])]);
    },
    [userId, allCompleted]
  );

  const completedLessons = allCompleted.filter((id) => id <= 100);
  const completedN2Lessons = allCompleted
    .filter((id) => id > N2_OFFSET)
    .map((id) => id - N2_OFFSET);

  const completeN2Lesson = useCallback(
    async (lessonId: number) => { await completeLesson(lessonId + N2_OFFSET); },
    [completeLesson]
  );

  return { completedLessons, completedN2Lessons, loading, completeLesson, completeN2Lesson };
}
