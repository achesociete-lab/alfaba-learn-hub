import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { ClipboardList, Check, X, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface StudentProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  level: "niveau_1" | "niveau_2";
}

interface AttendanceRecord {
  id: string;
  user_id: string;
  date: string;
  present: boolean;
  level: "niveau_1" | "niveau_2";
}

const AdminAttendance = () => {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const [studRes, attRes] = await Promise.all([
        supabase.from("profiles").select("user_id, first_name, last_name, level").order("last_name"),
        supabase.from("attendance").select("*").eq("date", selectedDate),
      ]);
      if (studRes.data) setStudents(studRes.data);
      if (attRes.data) setAttendance(attRes.data);
    };
    fetch();
  }, [selectedDate]);

  const filtered = students.filter(
    (s) => filterLevel === "all" || s.level === filterLevel
  );

  const getAttendance = (userId: string) =>
    attendance.find((a) => a.user_id === userId);

  const togglePresence = async (student: StudentProfile, present: boolean) => {
    setSaving(true);
    const existing = getAttendance(student.user_id);

    if (existing) {
      const { error } = await supabase
        .from("attendance")
        .update({ present })
        .eq("id", existing.id);
      if (error) {
        toast.error("Erreur");
      } else {
        setAttendance((prev) =>
          prev.map((a) => (a.id === existing.id ? { ...a, present } : a))
        );
      }
    } else {
      const { data, error } = await supabase
        .from("attendance")
        .insert({
          user_id: student.user_id,
          date: selectedDate,
          present,
          level: student.level,
        })
        .select()
        .single();
      if (error) {
        toast.error("Erreur");
      } else if (data) {
        setAttendance((prev) => [...prev, data]);
      }
    }
    setSaving(false);
  };

  const markAllPresent = async () => {
    setSaving(true);
    for (const s of filtered) {
      if (!getAttendance(s.user_id)) {
        await supabase.from("attendance").insert({
          user_id: s.user_id,
          date: selectedDate,
          present: true,
          level: s.level,
        });
      }
    }
    // Refresh
    const { data } = await supabase.from("attendance").select("*").eq("date", selectedDate);
    if (data) setAttendance(data);
    toast.success("Tous marqués présents !");
    setSaving(false);
  };

  const presentCount = filtered.filter((s) => getAttendance(s.user_id)?.present).length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <ClipboardList className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Émargement</h2>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-sm"
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
          size="sm"
          variant="outline"
          onClick={markAllPresent}
          disabled={saving}
          className="ml-auto"
        >
          <Check className="h-4 w-4 mr-1" /> Tous présents
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {presentCount}/{filtered.length} présents le {new Date(selectedDate).toLocaleDateString("fr-FR")}
      </p>

      <div className="space-y-2">
        {filtered.map((s, i) => {
          const att = getAttendance(s.user_id);
          return (
            <motion.div
              key={s.user_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="flex items-center gap-4 p-3 rounded-xl border border-border bg-card"
            >
              <div className="h-9 w-9 rounded-full gradient-emerald flex items-center justify-center text-primary-foreground font-bold text-xs">
                {s.first_name[0]}{s.last_name[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{s.first_name} {s.last_name}</p>
                <p className="text-xs text-muted-foreground">
                  {s.level === "niveau_1" ? "Niveau 1" : "Niveau 2"}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => togglePresence(s, true)}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors ${
                    att?.present === true
                      ? "bg-primary/20 text-primary"
                      : "text-muted-foreground hover:bg-primary/10"
                  }`}
                >
                  <Check className="h-4 w-4" />
                </button>
                <button
                  onClick={() => togglePresence(s, false)}
                  disabled={saving}
                  className={`p-2 rounded-lg transition-colors ${
                    att?.present === false
                      ? "bg-destructive/20 text-destructive"
                      : "text-muted-foreground hover:bg-destructive/10"
                  }`}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminAttendance;
