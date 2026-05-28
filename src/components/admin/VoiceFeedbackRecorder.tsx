// Voice feedback recorder for admin reviewing presentiel submissions.
// Records mic audio, uploads to `presentiel-submissions/feedback/` and
// persists URL into presentiel_submissions.feedback_audio_url.
import { useRef, useState } from "react";
import { Mic, Square, Loader2, Trash2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  submissionId: string;
  userId: string;
  existingUrl?: string | null;
  onSaved: () => void;
}

export default function VoiceFeedbackRecorder({ submissionId, userId, existingUrl, onSaved }: Props) {
  const [recording, setRecording] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [localUrl, setLocalUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const start = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => chunksRef.current.push(e.data);
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const b = new Blob(chunksRef.current, { type: "audio/webm" });
        setBlob(b);
        setLocalUrl(URL.createObjectURL(b));
      };
      mr.start();
      mediaRef.current = mr;
      setRecording(true);
    } catch {
      toast.error("Microphone non accessible");
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setRecording(false);
  };

  const save = async () => {
    if (!blob) return;
    setUploading(true);
    try {
      const path = `feedback/${userId}/${submissionId}-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-submissions")
        .upload(path, blob, { contentType: "audio/webm", upsert: true });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from("presentiel-submissions")
        .getPublicUrl(path);
      const { error } = await supabase
        .from("presentiel_submissions")
        .update({ feedback_audio_url: publicUrl } as any)
        .eq("id", submissionId);
      if (error) throw error;
      toast.success("Correction vocale envoyée 🎙️");
      setBlob(null);
      setLocalUrl(null);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const removeExisting = async () => {
    const { error } = await supabase
      .from("presentiel_submissions")
      .update({ feedback_audio_url: null } as any)
      .eq("id", submissionId);
    if (error) { toast.error(error.message); return; }
    toast.success("Correction vocale supprimée");
    onSaved();
  };

  return (
    <div className="space-y-2 p-2 rounded border border-dashed border-border bg-muted/30">
      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
        <Mic className="h-3 w-3" /> Correction vocale
      </p>

      {existingUrl && !localUrl && (
        <div className="flex items-center gap-2">
          <audio controls src={existingUrl} className="flex-1" style={{ height: 36 }} />
          <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" onClick={removeExisting} title="Supprimer">
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      )}

      {localUrl && (
        <audio controls src={localUrl} className="w-full" style={{ height: 36 }} />
      )}

      <div className="flex flex-wrap gap-2">
        {!recording && !localUrl && (
          <Button size="sm" variant="outline" onClick={start} className="gap-1">
            <Mic className="h-3 w-3" /> {existingUrl ? "Réenregistrer" : "Enregistrer"}
          </Button>
        )}
        {recording && (
          <Button size="sm" variant="destructive" onClick={stop} className="gap-1 animate-pulse">
            <Square className="h-3 w-3" /> Arrêter
          </Button>
        )}
        {localUrl && !uploading && (
          <>
            <Button size="sm" onClick={save} className="gap-1 gradient-emerald border-0 text-primary-foreground">
              <Play className="h-3 w-3" /> Envoyer à l'élève
            </Button>
            <Button size="sm" variant="ghost" onClick={() => { setBlob(null); setLocalUrl(null); }}>
              Annuler
            </Button>
          </>
        )}
        {uploading && (
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" /> Envoi…
          </span>
        )}
      </div>
    </div>
  );
}
