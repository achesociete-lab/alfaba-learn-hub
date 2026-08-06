import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Search, Trash2, Check, Clock, BookOpen, Mail, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

interface StudentProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  level: "niveau_1" | "niveau_2";
  type_eleve: "en_ligne" | "presentiel" | "en_attente";
  created_at: string;
  email?: string;
  is_test?: boolean;
}

type ManualPlan = "essentiel" | "premium" | "famille" | "hifz";

const PLAN_LABELS: Record<ManualPlan, string> = {
  essentiel: "Essentiel",
  premium: "Premium",
  famille: "Famille",
  hifz: "Hifd",
};
const PLAN_COLORS: Record<ManualPlan, string> = {
  essentiel: "bg-blue-100 text-blue-800 border-blue-300",
  premium: "bg-emerald-100 text-emerald-800 border-emerald-300",
  famille: "bg-violet-100 text-violet-800 border-violet-300",
  hifz: "bg-amber-100 text-amber-800 border-amber-300",
};

const AdminStudents = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingType, setTogglingType] = useState<string | null>(null);
  const [togglingLevel, setTogglingLevel] = useState<string | null>(null);
  const [activatingPlan, setActivatingPlan] = useState<string | null>(null);
  const [studentPlans, setStudentPlans] = useState<Record<string, ManualPlan>>({});

  const [validating, setValidating] = useState<string | null>(null);
  const [studentEmails, setStudentEmails] = useState<Record<string, string>>({});
  const [togglingTest, setTogglingTest] = useState<string | null>(null);
  const [sendingRelance, setSendingRelance] = useState(false);

  const handleToggleLevel = async (s: StudentProfile) => {
    setTogglingLevel(s.user_id);
    const newLevel = s.level === "niveau_1" ? "niveau_2" : "niveau_1";
    const { error } = await supabase
      .from("profiles")
      .update({ level: newLevel } as any)
      .eq("user_id", s.user_id);
    if (error) {
      toast.error("Erreur lors du changement de niveau");
    } else {
      setStudents((prev) =>
        prev.map((st) => (st.user_id === s.user_id ? { ...st, level: newLevel as any } : st))
      );
      toast.success(`${s.first_name} est maintenant en ${newLevel === "niveau_1" ? "Niveau 1" : "Niveau 2"}`);
    }
    setTogglingLevel(null);
  };

  const handleToggleTest = async (s: StudentProfile) => {
    setTogglingTest(s.user_id);
    const newTestStatus = !s.is_test;
    const { error } = await supabase
      .from("profiles")
      .update({ is_test: newTestStatus } as any)
      .eq("user_id", s.user_id);
    if (error) {
      toast.error("Erreur lors de la mise à jour");
    } else {
      setStudents((prev) =>
        prev.map((st) => (st.user_id === s.user_id ? { ...st, is_test: newTestStatus } : st))
      );
      toast.success(`${s.first_name} marqué comme ${newTestStatus ? "compte test" : "compte réel"}`);
    }
    setTogglingTest(null);
  };

  const fetchStudents = async () => {
    const [{ data: profileData }, { data: subData }, emailRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("user_id, first_name, last_name, level, type_eleve, created_at, is_test")
        .order("created_at", { ascending: false }),
      supabase
        .from("subscriptions")
        .select("user_id, plan")
        .eq("status", "active")
        .order("created_at", { ascending: false }),
      supabase.functions.invoke("get-student-emails"),
    ]);
    if (profileData) {
      const sorted = [...profileData].map(p => ({ ...p, is_test: p.is_test ?? false })).sort((a, b) => {
        const aPending = a.type_eleve === "en_attente" ? 0 : 1;
        const bPending = b.type_eleve === "en_attente" ? 0 : 1;
        return aPending - bPending;
      });
      setStudents(sorted);
    }
    if (subData) {
      // Keep the most recent active plan per user
      const planMap: Record<string, ManualPlan> = {};
      for (const row of subData) {
        if (!planMap[row.user_id] && row.plan !== "découverte") {
          planMap[row.user_id] = row.plan as ManualPlan;
        }
      }
      setStudentPlans(planMap);
    }
    if (emailRes.data?.emails) {
      setStudentEmails(emailRes.data.emails);
    }
  };

  const handleGrantPlan = async (s: StudentProfile, plan: ManualPlan) => {
    setActivatingPlan(s.user_id);
    try {
      const { error } = await supabase.from("subscriptions").insert({
        user_id: s.user_id,
        plan,
        status: "active",
      } as any);
      if (error) throw error;
      setStudentPlans((prev) => ({ ...prev, [s.user_id]: plan }));
      toast.success(`Plan ${PLAN_LABELS[plan]} activé pour ${s.first_name}`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'activation");
    } finally {
      setActivatingPlan(null);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleDelete = async (userId: string, name: string) => {
    setDeleting(userId);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token;

      const res = await supabase.functions.invoke("delete-user", {
        body: { user_id: userId },
      });

      if (res.error) throw new Error(res.error.message);
      if (res.data?.error) throw new Error(res.data.error);

      toast.success(`${name} a été supprimé(e)`);
      setStudents((prev) => prev.filter((s) => s.user_id !== userId));
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la suppression");
    } finally {
      setDeleting(null);
    }
  };

  const handleValidate = async (s: StudentProfile) => {
    setValidating(s.user_id);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ type_eleve: "presentiel" } as any)
        .eq("user_id", s.user_id);
      if (error) throw error;

      // Notify the student by email (best-effort)
      supabase.functions
        .invoke("notify-presentiel-approved", {
          body: { studentName: s.first_name, userId: s.user_id },
        })
        .catch((err) => console.warn("notify-presentiel-approved fail", err));

      setStudents((prev) =>
        prev.map((st) =>
          st.user_id === s.user_id ? { ...st, type_eleve: "presentiel" as any } : st
        )
      );
      toast.success(`${s.first_name} a été validé(e) et notifié(e) par email`);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la validation");
    } finally {
      setValidating(null);
    }
  };

  const filtered = students.filter((s) => {
    const matchSearch =
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      studentEmails[s.user_id]?.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "all" || s.level === filterLevel;
    return matchSearch && matchLevel;
  });

  const handleSendRelance = async () => {
    setSendingRelance(true);
    // Get students without a paid plan
    const unpaidStudents = students.filter(
      (s) => !studentPlans[s.user_id] && s.type_eleve === "en_ligne"
    );
    let successCount = 0;
    let errorCount = 0;
    for (const s of unpaidStudents) {
      const email = studentEmails[s.user_id];
      if (!email) continue;
      try {
        const res = await supabase.functions.invoke("send-followup-emails", {
          body: {
            userId: s.user_id,
            email,
            firstName: s.first_name,
            level: s.level,
          },
        });
        if (res.error) throw res.error;
        successCount++;
      } catch (err) {
        console.error(`Erreur pour ${s.first_name}:`, err);
        errorCount++;
      }
    }
    setSendingRelance(false);
    if (successCount > 0) {
      toast.success(`${successCount} email(s) de relance envoyé(s) avec succès !`);
    }
    if (errorCount > 0) {
      toast.error(`${errorCount} email(s) n'ont pas pu être envoyés.`);
    }
    if (successCount === 0 && errorCount === 0) {
      toast.info("Aucun élève à relancer (tous ont déjà un plan ou pas d'email).");
    }
  };

  const handleExportCSV = () => {
    const headers = ["Nom", "Prénom", "Email", "Niveau", "Type", "Plan", "Date d'inscription"];
    const rows = filtered.map((s) => [
      s.last_name,
      s.first_name,
      studentEmails[s.user_id] || "N/A",
      s.level === "niveau_1" ? "Niveau 1" : "Niveau 2",
      s.type_eleve === "en_ligne" ? "En ligne" : s.type_eleve === "presentiel" ? "Présentiel" : "En attente",
      studentPlans[s.user_id] ? PLAN_LABELS[studentPlans[s.user_id]] : "Découverte",
      new Date(s.created_at).toLocaleDateString("fr-FR"),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `eleves_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Export CSV téléchargé");
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Users className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Élèves ({filtered.length})</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher un élève ou un email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          {["all", "niveau_1", "niveau_2"].map((l) => (
            <button
              key={l}
              onClick={() => setFilterLevel(l)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                filterLevel === l
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/30"
              }`}
            >
              {l === "all" ? "Tous" : l === "niveau_1" ? "Niveau 1" : "Niveau 2"}
            </button>
          ))}
        </div>
        <Button
          onClick={handleExportCSV}
          variant="outline"
          size="sm"
          className="gap-2"
        >
          <Download className="h-4 w-4" />
          Export CSV
        </Button>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="default"
              size="sm"
              className="gap-2 gradient-emerald border-0 text-primary-foreground"
              disabled={sendingRelance}
            >
              <Mail className="h-4 w-4" />
              {sendingRelance ? "Envoi en cours..." : "Envoyer la relance"}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Envoyer les emails de relance</AlertDialogTitle>
              <AlertDialogDescription>
                Cela va envoyer un email personnalisé (selon leur niveau) à tous les élèves qui n'ont pas encore de plan payant. Êtes-vous sûr(e) ?
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={handleSendRelance}>Oui, envoyer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="space-y-2">
        {filtered.map((s, i) => (
          <motion.div
            key={s.user_id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex items-center gap-4 p-4 rounded-xl border border-border bg-card"
          >
            <div className="h-10 w-10 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground font-bold text-sm shrink-0">
              {s.first_name[0]}{s.last_name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-foreground">{s.first_name} {s.last_name}</p>
              <p className="text-xs text-muted-foreground">
                {studentEmails[s.user_id] ? (
                  <a href={`mailto:${studentEmails[s.user_id]}`} className="hover:underline">
                    {studentEmails[s.user_id]}
                  </a>
                ) : (
                  "Email non disponible"
                )}
              </p>
              <p className="text-xs text-muted-foreground">
                Inscrit le {new Date(s.created_at).toLocaleDateString("fr-FR")}
              </p>
              {studentPlans[s.user_id] && (
                <p className="text-xs font-medium text-primary mt-1">
                  Plan: {PLAN_LABELS[studentPlans[s.user_id]]}
                </p>
              )}
              {s.is_test && (
                <p className="text-xs font-medium text-orange-500 mt-1">
                  ⚠️ Compte test
                </p>
              )}
            </div>
            <button
              disabled={togglingLevel === s.user_id}
              onClick={() => handleToggleLevel(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                s.level === "niveau_1"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-gold bg-gold/10 text-gold"
              }`}
              title="Cliquer pour changer de niveau"
            >
              {togglingLevel === s.user_id ? "…" : s.level === "niveau_1" ? "Niveau 1" : "Niveau 2"}
            </button>
            {/* Test account toggle */}
            <button
              disabled={togglingTest === s.user_id}
              onClick={() => handleToggleTest(s)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                s.is_test
                  ? "border-orange-300 bg-orange-50 text-orange-700"
                  : "border-border text-muted-foreground hover:border-orange-300"
              }`}
              title={s.is_test ? "Cliquer pour marquer comme réel" : "Cliquer pour marquer comme test"}
            >
              {togglingTest === s.user_id ? "…" : s.is_test ? "🧪 Test" : "👤 Réel"}
            </button>

            {s.type_eleve === "en_attente" ? (
              <>
                <Badge variant="destructive" className="gap-1">
                  <Clock className="h-3 w-3" /> En attente
                </Badge>
                <Button
                  size="sm"
                  disabled={validating === s.user_id}
                  onClick={() => handleValidate(s)}
                  className="gradient-emerald border-0 text-primary-foreground"
                >
                  <Check className="h-4 w-4 mr-1" />
                  {validating === s.user_id ? "Validation…" : "Valider"}
                </Button>
              </>
            ) : (
              <button
                disabled={togglingType === s.user_id}
                onClick={async () => {
                  setTogglingType(s.user_id);
                  const newType = s.type_eleve === "en_ligne" ? "presentiel" : "en_ligne";
                  const { error } = await supabase.from("profiles").update({ type_eleve: newType } as any).eq("user_id", s.user_id);
                  if (error) { toast.error("Erreur"); } else {
                    setStudents(prev => prev.map(st => st.user_id === s.user_id ? { ...st, type_eleve: newType as any } : st));
                    toast.success(`${s.first_name} est maintenant "${newType === "en_ligne" ? "En ligne" : "Présentiel"}"`);
                  }
                  setTogglingType(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                  s.type_eleve === "presentiel"
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:border-primary/30"
                }`}
              >
                {s.type_eleve === "presentiel" ? "📍 Présentiel" : "💻 En ligne"}
              </button>
            )}

            {/* Plan actuel + sélecteur d'accès manuel */}
            {studentPlans[s.user_id] ? (
              <Badge className={`border text-xs shrink-0 ${PLAN_COLORS[studentPlans[s.user_id]]}`}>
                {studentPlans[s.user_id] === "hifz" && <BookOpen className="h-3 w-3 mr-1" />}
                {PLAN_LABELS[studentPlans[s.user_id]]}
              </Badge>
            ) : (
              <div className="flex gap-1 shrink-0 flex-wrap">
                {(["essentiel", "premium", "famille", "hifz"] as ManualPlan[]).map((p) => (
                  <button
                    key={p}
                    disabled={activatingPlan === s.user_id}
                    onClick={() => handleGrantPlan(s, p)}
                    title={`Accorder accès ${PLAN_LABELS[p]}`}
                    className={`px-2 py-1 rounded-lg text-[10px] font-semibold border transition-colors hover:opacity-80 ${PLAN_COLORS[p]}`}
                  >
                    {activatingPlan === s.user_id ? "…" : PLAN_LABELS[p]}
                  </button>
                ))}
              </div>
            )}

            {studentEmails[s.user_id] && (
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0 text-muted-foreground hover:text-primary hover:bg-primary/10"
                title="Envoyer un email"
                onClick={() => window.location.href = `mailto:${studentEmails[s.user_id]}`}
              >
                <Mail className="h-4 w-4" />
              </Button>
            )}

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  disabled={deleting === s.user_id}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Supprimer cet élève ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Vous êtes sur le point de supprimer <strong>{s.first_name} {s.last_name}</strong> et toutes ses données (progression, devoirs, récitations…). Cette action est irréversible.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => handleDelete(s.user_id, `${s.first_name} ${s.last_name}`)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting === s.user_id ? "Suppression…" : "Supprimer définitivement"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-8">Aucun élève trouvé.</p>
        )}
      </div>
    </div>
  );
};

export default AdminStudents;
