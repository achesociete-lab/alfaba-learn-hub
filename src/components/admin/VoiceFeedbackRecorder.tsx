// Correction vocale multi-enregistrements pour les soumissions élèves.
// Chaque enregistrement est uploadé immédiatement et ajouté au tableau feedback_audio_urls.
import { useRef, useState } from "react";
import { Mic, Square, Loader2, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  submissionId: string;
  userId: string;
  existingUrls: string[];
  onSaved: () => void;
}

export default function VoiceFeedbackRecorder({ submissionId, userId, existingUrls, onSaved }: Props) {
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
      const path = `${userId}/feedback/${submissionId}-${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("presentiel-submissions")
        .upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage
        .from("presentiel-submissions")
        .getPublicUrl(path);
      const nextUrls = [...existingUrls, publicUrl];
      const { error } = await supabase
        .from("presentiel_submissions")
        .update({ feedback_audio_urls: nextUrls } as any)
        .eq("id", submissionId);
      if (error) throw error;
      toast.success("Correction vocale ajoutée 🎙️");
      setBlob(null);
      setLocalUrl(null);
      onSaved();
    } catch (e: any) {
      toast.error(e.message || "Échec de l'envoi");
    } finally {
      setUploading(false);
    }
  };

  const remove = async (urlToRemove: string) => {
    const nextUrls = existingUrls.filter((u) => u !== urlToRemove);
    const { error } = await supabase
      .from("presentiel_submissions")
      .update({ feedback_audio_urls: nextUrls } as any)
      .eq("id", submissionId);
    if (error) { toast.error(error.message); return; }
    toast.success("Enregistrement supprimé");
    onSaved();
  };

  const cancel = () => {
    setBlob(null);
    setLocalUrl(null);
  };

  return (
    <div className="space-y-2 p-3 rounded-lg border border-dashed border-border bg-muted/30">
      <p className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
        <Mic className="h-3 w-3" /> Corrections vocales
        {existingUrls.length > 0 && (
          <span className="ml-1 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
            {existingUrls.length}
          </span>
        )}
      </p>

      {/* Enregistrements existants */}
      {existingUrls.length > 0 && (
        <div className="space-y-1.5">
          {existingUrls.map((url, i) => (
            <div key={url} className="flex items-center gap-2">
              <span className="text-[10px] text-muted-foreground w-4 shrink-0">#{i + 1}</span>
              <audio controls src={url} className="flex-1 min-w-0" style={{ height: 32 }} />
              <Button
                size="icon"
                variant="ghost"
                className="h-7 w-7 text-destructive shrink-0"
                onClick={() => remove(url)}
                title="Supprimer"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Aperçu du nouvel enregistrement */}
      {localUrl && (
        <audio controls src={localUrl} className="w-full" style={{ height: 32 }} />
      )}

      {/* Contrôles */}
      <div className="flex flex-wrap gap-2">
        {!recording && !localUrl && (
          <Button size="sm" variant="outline" onClick={start} className="gap-1.5">
            <Plus className="h-3 w-3" />
            <Mic className="h-3 w-3" />
            {existingUrls.length > 0 ? "Ajouter un enregistrement" : "Enregistrer"}
          </Button>
        )}
        {recording && (
          <Button size="sm" variant="destructive" onClick={stop} className="gap-1.5 animate-pulse">
            <Square className="h-3 w-3" /> Arrêter
          </Button>
        )}
        {localUrl && !uploading && (
          <>
            <Button size="sm" onClick={save} className="gap-1.5 gradient-emerald border-0 text-primary-foreground">
              <Mic className="h-3 w-3" /> Envoyer à l'élève
            </Button>
            <Button size="sm" variant="ghost" onClick={cancel}>
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
