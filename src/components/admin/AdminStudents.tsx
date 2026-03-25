import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Users, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface StudentProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  level: "niveau_1" | "niveau_2";
  created_at: string;
}

const AdminStudents = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [search, setSearch] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("user_id, first_name, last_name, level, created_at")
        .order("created_at", { ascending: false });
      if (data) setStudents(data);
    };
    fetch();
  }, []);

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
            <div className="h-10 w-10 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground font-bold text-sm">
              {s.first_name[0]}{s.last_name[0]}
            </div>
            <div className="flex-1">
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
