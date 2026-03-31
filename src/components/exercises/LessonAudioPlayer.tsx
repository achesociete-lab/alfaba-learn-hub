import { useState, useEffect, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2, Upload, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { toast } from "@/hooks/use-toast";

interface LessonAudioPlayerProps {
  level: "niveau_1" | "niveau_2";
  lessonNumber: number;
  isTeacher: boolean;
}

export default function LessonAudioPlayer({ level, lessonNumber, isTeacher }: LessonAudioPlayerProps) {
  const { user } = useAuth();
  const { isRecording, audioBlob, audioUrl: recorderUrl, duration, startRecording, stopRecording, reset } = useAudioRecorder();
  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch existing recording
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("lesson_recordings")
        .select("audio_url")
        .eq("level", level)
        .eq("lesson_number", lessonNumber)
        .maybeSingle();
      if (data?.audio_url) setSavedUrl(data.audio_url);
      setLoading(false);
    })();
  }, [level, lessonNumber]);

  const playAudio = (url: string) => {
    if (audioRef.current) { audioRef.current.pause(); }
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.onended = () => setIsPlaying(false);
    audio.onerror = () => setIsPlaying(false);
    audio.play();
    setIsPlaying(true);
  };

  const stopAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setIsPlaying(false);
  };

  const uploadRecording = async () => {
    if (!audioBlob || !user) return;
    setUploading(true);
    try {
      const path = `${level}/lesson-${lessonNumber}.webm`;
      const { error: storageError } = await supabase.storage
        .from("lesson-recordings")
        .upload(path, audioBlob, { upsert: true, contentType: "audio/webm" });
      if (storageError) throw storageError;

      const { data: urlData } = supabase.storage.from("lesson-recordings").getPublicUrl(path);
      const publicUrl = urlData.publicUrl;

      // Upsert into lesson_recordings table
      const { error: dbError } = await supabase
        .from("lesson_recordings")
        .upsert(
          { level, lesson_number: lessonNumber, audio_url: publicUrl, recorded_by: user.id },
          { onConflict: "level,lesson_number" }
        );
      if (dbError) throw dbError;

      setSavedUrl(publicUrl);
      reset();
      toast({ title: "Enregistrement sauvegardé ✅" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Erreur", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  };

  const deleteRecording = async () => {
    const path = `${level}/lesson-${lessonNumber}.webm`;
    await supabase.storage.from("lesson-recordings").remove([path]);
    await supabase.from("lesson_recordings").delete().eq("level", level).eq("lesson_number", lessonNumber);
    setSavedUrl(null);
    toast({ title: "Enregistrement supprimé" });
  };

  if (loading) return null;

  // Student view: just play if recording exists
  if (!isTeacher) {
    if (!savedUrl) return null;
    return (
      <div className="flex justify-center">
        <Button
          variant="outline"
          onClick={() => isPlaying ? stopAudio() : playAudio(savedUrl)}
          className={`gap-2 rounded-full px-6 ${isPlaying ? "border-primary bg-primary/10" : ""}`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? "⏸ Pause" : "🎧 Écouter l'enregistrement du professeur"}
        </Button>
      </div>
    );
  }

  // Teacher view: record, preview, upload, delete
  return (
    <div className="p-4 rounded-xl border border-border bg-card space-y-3">
      <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <Mic className="h-4 w-4" /> Enregistrement audio de la leçon
      </h4>

      {savedUrl && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-muted">
          <Button
            variant="ghost" size="sm"
            onClick={() => isPlaying ? stopAudio() : playAudio(savedUrl)}
            className="gap-1.5"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? "Pause" : "Écouter"}
          </Button>
          <span className="text-xs text-muted-foreground flex-1">Enregistrement actuel</span>
          <Button variant="ghost" size="sm" onClick={deleteRecording} className="text-destructive hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        {!isRecording && !recorderUrl && (
          <Button variant="outline" size="sm" onClick={startRecording} className="gap-1.5">
            <Mic className="h-4 w-4 text-destructive" /> Enregistrer
          </Button>
        )}
        {isRecording && (
          <>
            <Button variant="destructive" size="sm" onClick={stopRecording} className="gap-1.5">
              <Square className="h-3 w-3" /> Arrêter
            </Button>
            <span className="text-sm text-muted-foreground animate-pulse">
              🔴 {duration}s
            </span>
          </>
        )}
        {recorderUrl && !isRecording && (
          <>
            <Button variant="outline" size="sm" onClick={() => playAudio(recorderUrl)} className="gap-1.5">
              <Play className="h-4 w-4" /> Réécouter
            </Button>
            <Button variant="default" size="sm" onClick={uploadRecording} disabled={uploading} className="gap-1.5">
              <Upload className="h-4 w-4" /> {uploading ? "Envoi..." : "Sauvegarder"}
            </Button>
            <Button variant="ghost" size="sm" onClick={reset}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
