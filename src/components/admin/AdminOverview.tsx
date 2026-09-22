import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, Headphones, GraduationCap, ClipboardList } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({
    students: 0, n1: 0, n2: 0,
    presentiel: 0,
    recitationsPending: 0,
    nouraniyaSessions: 0,
    nouraniyaStudents: 0,
  });

  useEffect(() => {
    const fetch = async () => {
      const [profilesRes, recitRes, sessRes, enrollRes] = await Promise.all([
        supabase.from("profiles").select("level, type_eleve"),
        supabase.from("quran_recitations").select("status").eq("status", "en attente"),
        supabase.from("nouraniya_sessions").select("id", { count: "exact", head: true }),
        supabase.from("nouraniya_enrollments").select("student_id"),
      ]);

      const profiles = profilesRes.data || [];
      const uniqueNouraniyaStudents = new Set((enrollRes.data || []).map((e: any) => e.student_id)).size;

      setStats({
        students: profiles.length,
        n1: profiles.filter((p) => p.level === "niveau_1").length,
        n2: profiles.filter((p) => p.level === "niveau_2").length,
        presentiel: profiles.filter((p) => p.type_eleve === "presentiel").length,
        recitationsPending: (recitRes.data || []).length,
        nouraniyaSessions: sessRes.count || 0,
        nouraniyaStudents: uniqueNouraniyaStudents,
      });
    };
    fetch();
  }, []);

  const cards = [
    {
      icon: Users,
      label: "Élèves inscrits",
      value: stats.students,
      sub: `N1: ${stats.n1} | N2: ${stats.n2} | Présentiel: ${stats.presentiel}`,
      color: "gradient-emerald",
    },
    {
      icon: GraduationCap,
      label: "Élèves Nouraniya",
      value: stats.nouraniyaStudents,
      sub: `${stats.nouraniyaSessions} séance${stats.nouraniyaSessions > 1 ? "s" : ""} enregistrée${stats.nouraniyaSessions > 1 ? "s" : ""}`,
      color: "gradient-gold",
    },
    {
      icon: Headphones,
      label: "Récitations en attente",
      value: stats.recitationsPending,
      sub: "Module Coran — à corriger",
      color: stats.recitationsPending > 0 ? "gradient-gold" : "gradient-emerald",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <BarChart3 className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-bold text-foreground">Vue d'ensemble</h2>
      </div>

      <div className="grid sm:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="p-6 rounded-xl border border-border bg-card">
            <div className="flex items-center gap-3 mb-3">
              <div className={`h-10 w-10 rounded-lg ${card.color} flex items-center justify-center`}>
                <card.icon className="h-5 w-5 text-primary-foreground" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
            </div>
            <p className="text-3xl font-bold text-foreground">{card.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminOverview;
