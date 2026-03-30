import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle, Headphones, MessageSquare, Star } from "lucide-react";

interface Recitation {
  id: string;
  user_id: string;
  surah_number: number;
  ayah_start: number;
  ayah_end: number;
  audio_url: string | null;
  score: number | null;
  teacher_feedback: string | null;
  teacher_reviewed: boolean;
  created_at: string;
}

interface Profile {
  user_id: string;
  first_name: string;
  last_name: string;
}

const AdminRecitations = () => {
  const [recitations, setRecitations] = useState<Recitation[]>([]);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"pending" | "reviewed">("pending");
  const [feedbackMap, setFeedbackMap] = useState<Map<string, string>>(new Map());
  const [scoreMap, setScoreMap] = useState<Map<string, string>>(new Map());
  const [savingId, setSavingId] = useState<string | null>(null);

  const loadRecitations = async () => {
    setLoading(true);
    const query = supabase.from("quran_recitations").select("*")
      .eq("teacher_reviewed", filter === "reviewed")
      .order("created_at", { ascending: false });

    const { data, error } = await query;
    if (error) { toast.error("Erreur de chargement"); setLoading(false); return; }

    setRecitations(data || []);

    // Load profiles for all user_ids
    const userIds = [...new Set((data || []).map(r => r.user_id))];
    if (userIds.length > 0) {
      const { data: profs } = await supabase.from("profiles").select("user_id, first_name, last_name").in("user_id", userIds);
      const map = new Map<string, Profile>();
      profs?.forEach(p => map.set(p.user_id, p));
      setProfiles(map);
    }

    setLoading(false);
  };

  useEffect(() => { loadRecitations(); }, [filter]);

  const saveReview = async (recId: string) => {
    const feedback = feedbackMap.get(recId) || "";
    const scoreStr = scoreMap.get(recId) || "";
    const score = scoreStr ? parseInt(scoreStr) : null;

    if (score !== null && (isNaN(score) || score < 0 || score > 100)) {
      toast.error("La note doit être entre 0 et 100");
      return;
    }

    setSavingId(recId);
    const { error } = await supabase.from("quran_recitations").update({
      teacher_feedback: feedback || null,
      score,
      teacher_reviewed: true,
    }).eq("id", recId);

    if (error) { toast.error("Erreur lors de la sauvegarde"); }
    else {
      toast.success("Correction enregistrée !");
      loadRecitations();
    }
    setSavingId(null);
  };

  const getSurahName = (num: number) => {
    const names: Record<number, string> = { 1: "Al-Fatiha", 2: "Al-Baqara", 3: "Al-Imran", 36: "Ya-Sin", 67: "Al-Mulk", 112: "Al-Ikhlas", 113: "Al-Falaq", 114: "An-Nas" };
    return names[num] || `Sourate ${num}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant={filter === "pending" ? "default" : "outline"} size="sm" onClick={() => setFilter("pending")} className="gap-1.5">
          <Headphones className="h-4 w-4" /> En attente
        </Button>
        <Button variant={filter === "reviewed" ? "default" : "outline"} size="sm" onClick={() => setFilter("reviewed")} className="gap-1.5">
          <CheckCircle className="h-4 w-4" /> Corrigées
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-10">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : recitations.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-10">
          {filter === "pending" ? "Aucune récitation en attente de correction." : "Aucune récitation corrigée."}
        </p>
      ) : (
        <div className="space-y-4">
          {recitations.map((rec) => {
            const profile = profiles.get(rec.user_id);
            const studentName = profile ? `${profile.first_name} ${profile.last_name}`.trim() : "Élève inconnu";

            return (
              <div key={rec.id} className="p-4 rounded-xl border border-border bg-card space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">{studentName}</h3>
                    <p className="text-xs text-muted-foreground">
                      {getSurahName(rec.surah_number)} • Versets {rec.ayah_start}-{rec.ayah_end} • {new Date(rec.created_at).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  {rec.teacher_reviewed && rec.score != null && (
                    <span className={`text-lg font-bold ${rec.score >= 80 ? "text-primary" : rec.score >= 50 ? "text-secondary-foreground" : "text-destructive"}`}>
                      {rec.score}/100
                    </span>
                  )}
                </div>

                {rec.audio_url && (
                  <audio src={rec.audio_url} controls className="w-full h-10" />
                )}

                {rec.teacher_reviewed ? (
                  <div className="space-y-2">
                    {rec.teacher_feedback && (
                      <div className="p-2 rounded-lg bg-muted">
                        <p className="text-xs text-foreground"><span className="font-semibold">Votre commentaire :</span> {rec.teacher_feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3 pt-2 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number" min={0} max={100} placeholder="Note /100" className="w-28 h-8 text-sm"
                          value={scoreMap.get(rec.id) || ""}
                          onChange={(e) => setScoreMap(new Map(scoreMap).set(rec.id, e.target.value))}
                        />
                      </div>
                    </div>
                    <div className="flex items-start gap-1.5">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-2" />
                      <Textarea
                        placeholder="Commentaire pour l'élève (optionnel)..."
                        className="text-sm min-h-[60px]"
                        value={feedbackMap.get(rec.id) || ""}
                        onChange={(e) => setFeedbackMap(new Map(feedbackMap).set(rec.id, e.target.value))}
                      />
                    </div>
                    <Button onClick={() => saveReview(rec.id)} disabled={savingId === rec.id} size="sm" className="gap-2">
                      <CheckCircle className="h-4 w-4" /> {savingId === rec.id ? "Enregistrement..." : "Valider la correction"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminRecitations;
