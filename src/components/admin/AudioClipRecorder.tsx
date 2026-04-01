import { useState } from "react";
import { Mic, Square, Trash2, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { toast } from "sonner";

interface AudioClipRecorderProps {
  audioKey: string;
  existingUrl?: string;
  onSave: (audioKey: string, blob: Blob) => Promise<void>;
  onDelete: (audioKey: string) => Promise<void>;
}

export default function AudioClipRecorder({ audioKey, existingUrl, onSave, onDelete }: AudioClipRecorderProps) {
  const { isRecording, audioBlob, audioUrl, startRecording, stopRecording, reset } = useAudioRecorder();
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleSave = async () => {
    if (!audioBlob) return;
    setSaving(true);
    try {
      await onSave(audioKey, audioBlob);
      reset();
      toast.success("Audio enregistré ✓");
    } catch (e: any) {
      toast.error("Erreur : " + e.message);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await onDelete(audioKey);
      toast.success("Audio supprimé");
    } catch (e: any) {
      toast.error("Erreur : " + e.message);
    }
    setDeleting(false);
  };

  // Compact inline recorder
  return (
    <span className="inline-flex items-center gap-1 ml-1">
      {existingUrl && !audioUrl && (
        <>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-primary" onClick={() => new Audio(existingUrl).play()}>
            <Mic className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
      {!existingUrl && !audioUrl && !isRecording && (
        <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground hover:text-primary" onClick={startRecording} title="Enregistrer votre voix">
          <Mic className="h-3 w-3" />
        </Button>
      )}
      {isRecording && (
        <Button size="icon" variant="ghost" className="h-6 w-6 text-destructive animate-pulse" onClick={stopRecording}>
          <Square className="h-3 w-3" />
        </Button>
      )}
      {audioUrl && (
        <>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-primary" onClick={() => new Audio(audioUrl).play()}>
            <Mic className="h-3 w-3" />
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-primary" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />}
          </Button>
          <Button size="icon" variant="ghost" className="h-6 w-6 text-muted-foreground" onClick={reset}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </>
      )}
    </span>
  );
}
