import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Lesson } from "@/data/niveau1-lessons";
import type { Niveau2Lesson } from "@/data/niveau2-lessons";

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
      const byNumber = new Map<number, any>();
      data.forEach((row: any) => byNumber.set(row.lesson_number, row.content));

      // Leçons 1-12 : statique = source de vérité (ordre, titres, théorie).
      // On ne prend du DB que qcm + dictation (éditables par l'admin).
      const staticLessons: Lesson[] = staticN1.map((staticLesson) => {
        const c = byNumber.get(staticLesson.id);
        if (!c || !Array.isArray(c.qcm) || !Array.isArray(c.dictation)) {
          return staticLesson;
        }
        return {
          ...staticLesson,
          qcm: c.qcm,
          dictation: c.dictation,
        };
      });

      // Leçons 13+ : uniquement en DB (lettres individuelles).
      const staticIds = new Set(staticN1.map((s) => s.id));
      const extraLessons: Lesson[] = [];
      data.forEach((row: any) => {
        if (staticIds.has(row.lesson_number)) return;
        const c = row.content as any;
        if (!c || !Array.isArray(c.qcm) || !Array.isArray(c.dictation)) return;
        if (!c.title) return;
        extraLessons.push({ ...c, id: row.lesson_number });
      });

      extraLessons.sort((a, b) => a.id - b.id);
      setLessons([...staticLessons, ...extraLessons]);
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
