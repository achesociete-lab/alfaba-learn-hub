import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BarChart3, Users, FileText, ClipboardList } from "lucide-react";

const AdminOverview = () => {
  const [stats, setStats] = useState({ students: 0, n1: 0, n2: 0, homework: 0, pending: 0, graded: 0 });

  useEffect(() => {
    const fetch = async () => {
      const [profilesRes, hwRes] = await Promise.all([
        supabase.from("profiles").select("level"),
        supabase.from("homework_submissions").select("status"),
      ]);

      const profiles = profilesRes.data || [];
      const hw = hwRes.data || [];

      setStats({
        students: profiles.length,
        n1: profiles.filter((p) => p.level === "niveau_1").length,
        n2: profiles.filter((p) => p.level === "niveau_2").length,
        homework: hw.length,
        pending: hw.filter((h) => h.status === "en attente").length,
        graded: hw.filter((h) => h.status === "corrigé").length,
      });
    };
    fetch();
  }, []);

  const cards = [
    { icon: Users, label: "Élèves inscrits", value: stats.students, sub: `N1: ${stats.n1} | N2: ${stats.n2}`, color: "gradient-emerald" },
    { icon: FileText, label: "Devoirs déposés", value: stats.homework, sub: `${stats.pending} en attente`, color: "gradient-gold" },
    { icon: ClipboardList, label: "Devoirs corrigés", value: stats.graded, sub: `${stats.homework > 0 ? Math.round((stats.graded / stats.homework) * 100) : 0}% du total`, color: "gradient-emerald" },
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
