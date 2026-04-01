import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type ClassLevel = Database["public"]["Enums"]["class_level"];

export interface TeacherAudioClip {
  id: string;
  level: string;
  lesson_number: number;
  audio_key: string;
  audio_url: string;
}

// Global cache for teacher audio clips (keyed by audio_key)
const clipCache = new Map<string, string>();
let clipCacheLoaded = false;

export function useTeacherAudioClips(level?: ClassLevel, lessonNumber?: number) {
  const [clips, setClips] = useState<TeacherAudioClip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClips = useCallback(async () => {
    if (!level || !lessonNumber) return;
    setLoading(true);
    const { data } = await supabase
      .from("teacher_audio_clips")
      .select("id, level, lesson_number, audio_key, audio_url")
      .eq("level", level as ClassLevel)
      .eq("lesson_number", lessonNumber);
    if (data) {
      setClips(data as TeacherAudioClip[]);
      data.forEach((c: any) => clipCache.set(c.audio_key, c.audio_url));
    }
    setLoading(false);
  }, [level, lessonNumber]);

  useEffect(() => { fetchClips(); }, [fetchClips]);

  const uploadClip = async (audioKey: string, blob: Blob, recordedBy: string) => {
    const path = `clips/${level}/${lessonNumber}/${Date.now()}.webm`;
    const { error: uploadError } = await supabase.storage
      .from("lesson-recordings")
      .upload(path, blob, { contentType: "audio/webm", upsert: true });
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from("lesson-recordings").getPublicUrl(path);

    const { error } = await supabase
      .from("teacher_audio_clips")
      .upsert({
        level: level! as ClassLevel,
        lesson_number: lessonNumber!,
        audio_key: audioKey,
        audio_url: urlData.publicUrl,
        recorded_by: recordedBy,
      } as any, { onConflict: "level,lesson_number,audio_key" });
    if (error) throw error;

    clipCache.set(audioKey, urlData.publicUrl);
    await fetchClips();
  };

  const deleteClip = async (audioKey: string) => {
    await supabase
      .from("teacher_audio_clips")
      .delete()
      .eq("level", level! as ClassLevel)
      .eq("lesson_number", lessonNumber!)
      .eq("audio_key", audioKey);
    clipCache.delete(audioKey);
    await fetchClips();
  };

  return { clips, loading, uploadClip, deleteClip, refetch: fetchClips };
}

// Load all clips into cache (called once at app level)
export async function preloadTeacherClips() {
  if (clipCacheLoaded) return;
  const { data } = await supabase
    .from("teacher_audio_clips")
    .select("audio_key, audio_url");
  if (data) {
    data.forEach((c: any) => clipCache.set(c.audio_key, c.audio_url));
  }
  clipCacheLoaded = true;
}

export function getTeacherClipUrl(audioKey: string): string | undefined {
  return clipCache.get(audioKey);
}
