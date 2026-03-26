import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lesson } from "@/data/niveau1-lessons";
import type { Niveau2Lesson } from "@/data/niveau2-lessons";

// Fallback to static data if DB is unavailable
import { niveau1Lessons as staticN1 } from "@/data/niveau1-lessons";
import { niveau2Lessons as staticN2 } from "@/data/niveau2-lessons";

export function useNiveau1Lessons() {
  const [lessons, setLessons] = useState<Lesson[]>(staticN1);
  const [loading, setLoading] = useState(true);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lessons")
      .select("content, lesson_number")
      .eq("level", "niveau_1")
      .order("lesson_number");

    if (!error && data && data.length > 0) {
      setLessons(data.map((row: any) => row.content as unknown as Lesson));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  return { lessons, loading, refetch: fetchLessons };
}

export function useNiveau2Lessons() {
  const [lessons, setLessons] = useState<Niveau2Lesson[]>(staticN2);
  const [loading, setLoading] = useState(true);

  const fetchLessons = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("lessons")
      .select("content, lesson_number")
      .eq("level", "niveau_2")
      .order("lesson_number");

    if (!error && data && data.length > 0) {
      setLessons(data.map((row: any) => row.content as unknown as Niveau2Lesson));
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchLessons(); }, [fetchLessons]);

  return { lessons, loading, refetch: fetchLessons };
}

export async function updateLessonContent(
  level: "niveau_1" | "niveau_2",
  lessonNumber: number,
  content: Lesson | Niveau2Lesson
) {
  const { error } = await supabase
    .from("lessons")
    .update({ content: content as any })
    .eq("level", level)
    .eq("lesson_number", lessonNumber);

  if (error) throw error;
}
