import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Search, Trash2 } from "lucide-react";
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
  type_eleve: "en_ligne" | "presentiel";
  created_at: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [deleting, setDeleting] = useState<string | null>(null);
  const [togglingType, setTogglingType] = useState<string | null>(null);

  const fetchStudents = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("user_id, first_name, last_name, level, type_eleve, created_at")
      .order("created_at", { ascending: false });
    if (data) setStudents(data);
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

  const filtered = students.filter((s) => {
    const matchSearch =
      `${s.first_name} ${s.last_name}`.toLowerCase().includes(search.toLowerCase());
    const matchLevel = filterLevel === "all" || s.level === filterLevel;
    return matchSearch && matchLevel;
  });

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
            placeholder="Rechercher un élève..."
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
                Inscrit le {new Date(s.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <Badge variant={s.level === "niveau_1" ? "default" : "secondary"} className={
              s.level === "niveau_1" ? "bg-primary/10 text-primary border-0" : "bg-gold/10 text-gold border-0"
            }>
              {s.level === "niveau_1" ? "Niveau 1" : "Niveau 2"}
            </Badge>
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
