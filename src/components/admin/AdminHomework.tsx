import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { FileText, CheckCircle, PenTool, Download, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface HomeworkWithStudent {
  id: string;
  title: string;
  status: string;
  grade: number | null;
  feedback: string | null;
  file_url: string | null;
  submitted_at: string;
  level: "niveau_1" | "niveau_2";
  user_id: string;
  profiles: { first_name: string; last_name: string } | null;
}

const AdminHomework = () => {
  const [homework, setHomework] = useState<HomeworkWithStudent[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [grading, setGrading] = useState<HomeworkWithStudent | null>(null);
  const [grade, setGrade] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchHomework = async () => {
    const { data } = await supabase
      .from("homework_submissions")
      .select("id, title, status, grade, feedback, file_url, submitted_at, level, user_id, profiles!homework_submissions_user_id_fkey(first_name, last_name)")
      .order("submitted_at", { ascending: false });

    if (data) {
      setHomework(data.map((h: any) => ({
        ...h,
        profiles: Array.isArray(h.profiles) ? h.profiles[0] || null : h.profiles,
      })));
    }
  };

  useEffect(() => { fetchHomework(); }, []);

  const filtered = homework.filter(
    (h) => filterStatus === "all" || h.status === filterStatus
  );

  const openGrading = (hw: HomeworkWithStudent) => {
    setGrading(hw);
    setGrade(hw.grade?.toString() || "");
    setFeedback(hw.feedback || "");
  };

  const submitGrade = async () => {
    if (!grading) return;
    const numGrade = parseFloat(grade);
    if (isNaN(numGrade) || numGrade < 0 || numGrade > 20) {
      toast.error("La note doit être entre 0 et 20");
      return;
    }

    setSaving(true);
    const { error } = await supabase
      .from("homework_submissions")
      .update({
        grade: numGrade,
        feedback,
        status: "corrigé",
        graded_at: new Date().toISOString(),
      })
      .eq("id", grading.id);

    if (error) {
      toast.error("Erreur lors de la correction");
    } else {
      toast.success("Devoir corrigé !");
      setGrading(null);
      fetchHomework();
    }
    setSaving(false);
  };

  const downloadFile = async (fileUrl: string) => {
    const { data } = await supabase.storage.from("homework").createSignedUrl(fileUrl, 3600);
    if (data?.signedUrl) window.open(data.signedUrl, "_blank");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <FileText className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Devoirs ({filtered.length})</h2>
      </div>

      <div className="flex gap-2 mb-6">
        {[
          { key: "all", label: "Tous" },
          { key: "en attente", label: "En attente" },
          { key: "corrigé", label: "Corrigés" },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              filterStatus === f.key
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/30"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((hw, i) => (
          <motion.div
            key={hw.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
          >
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
              hw.status === "corrigé" ? "bg-primary/10" : "bg-gold/10"
            }`}>
              {hw.status === "corrigé" ? (
                <CheckCircle className="h-5 w-5 text-primary" />
              ) : (
                <PenTool className="h-5 w-5 text-gold" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-foreground truncate">{hw.title}</h3>
              <p className="text-xs text-muted-foreground">
                {hw.profiles ? `${hw.profiles.first_name} ${hw.profiles.last_name}` : "Élève"} — {new Date(hw.submitted_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <Badge className={
              hw.level === "niveau_1" ? "bg-primary/10 text-primary border-0" : "bg-gold/10 text-gold border-0"
            }>
              {hw.level === "niveau_1" ? "N1" : "N2"}
            </Badge>
            <div className="text-right shrink-0">
              {hw.grade !== null ? (
                <span className="text-sm font-bold text-primary">{hw.grade}/20</span>
              ) : (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
            <div className="flex gap-1 shrink-0">
              {hw.file_url && (
                <Button size="icon" variant="ghost" onClick={() => downloadFile(hw.file_url!)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={() => openGrading(hw)}>
                <PenTool className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun devoir.</p>
        )}
      </div>

      {/* Grading dialog */}
      <Dialog open={!!grading} onOpenChange={() => setGrading(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Corriger : {grading?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">
              Élève : {grading?.profiles ? `${grading.profiles.first_name} ${grading.profiles.last_name}` : "—"}
            </p>
            <div>
              <label className="text-sm font-medium text-foreground">Note /20</label>
              <Input
                type="number"
                min="0"
                max="20"
                step="0.5"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                placeholder="Ex: 16.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground">Commentaire</label>
              <Textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Feedback pour l'élève..."
                rows={3}
              />
            </div>
            <Button
              onClick={submitGrade}
              disabled={saving || !grade}
              className="w-full gradient-emerald border-0 text-primary-foreground gap-2"
            >
              <Send className="h-4 w-4" />
              {saving ? "Enregistrement..." : "Valider la correction"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminHomework;
