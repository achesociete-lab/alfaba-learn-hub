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
      // Merge DB content with static fallback per-lesson.
      // A DB lesson is only used if it has at least qcm + dictation arrays;
      // missing fields (e.g. theory) fall back to the static lesson.
      const byNumber = new Map<number, any>();
      data.forEach((row: any) => byNumber.set(row.lesson_number, row.content));

      const merged: Lesson[] = [];
      const seen = new Set<number>();

      // First, all DB lessons that look usable.
      // A lesson is only kept if it has a real title (either from DB or from static fallback)
      // to avoid showing untitled "ghost" lessons.
      data.forEach((row: any) => {
        const c = row.content as any;
        if (!c || !Array.isArray(c.qcm) || !Array.isArray(c.dictation)) return;
        const staticMatch = staticN1.find((s) => s.id === row.lesson_number);
        const title = c.title || staticMatch?.title;
        if (!title) return; // skip lessons without any title
        const lesson: Lesson = {
          ...(staticMatch || ({} as Lesson)),
          ...c,
          id: row.lesson_number,
          title,
          subtitle: c.subtitle || staticMatch?.subtitle || "",
          icon: c.icon || staticMatch?.icon || "📘",
          theory: Array.isArray(c.theory) && c.theory.length > 0 ? c.theory : staticMatch?.theory || [],
        };
        merged.push(lesson);
        seen.add(row.lesson_number);
      });

      // Add any static lessons not in DB (safety net)
      staticN1.forEach((s) => {
        if (!seen.has(s.id)) merged.push(s);
      });

      merged.sort((a, b) => a.id - b.id);
      if (merged.length > 0) setLessons(merged);
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
