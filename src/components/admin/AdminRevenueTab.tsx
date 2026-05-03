import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend
} from "recharts";
import { DollarSign, Users, TrendingUp, Activity, Crown, Zap, BookOpen } from "lucide-react";

const PLAN_PRICES: Record<string, number> = {
  essentiel: 7,
  premium: 15,
};

export default function AdminRevenueTab() {
  const [loading, setLoading] = useState(true);
  const [mrr, setMrr] = useState(0);
  const [activeCount, setActiveCount] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [planBreakdown, setPlanBreakdown] = useState<{ name: string; count: number; revenue: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const [{ data: subs }, { count: users }] = await Promise.all([
        supabase.from("subscriptions").select("plan, status").eq("status", "active"),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
      ]);

      const active = subs || [];
      const mrrTotal = active.reduce((sum, s) => sum + (PLAN_PRICES[s.plan] || 0), 0);

      const breakdown: Record<string, number> = {};
      active.forEach((s) => { breakdown[s.plan] = (breakdown[s.plan] || 0) + 1; });

      setPlanBreakdown(
        Object.entries(breakdown).map(([plan, count]) => ({
          name: plan.charAt(0).toUpperCase() + plan.slice(1),
          count,
          revenue: count * (PLAN_PRICES[plan] || 0),
        }))
      );
      setMrr(mrrTotal);
      setActiveCount(active.length);
      setTotalUsers(users || 0);
      setLoading(false);
    };
    load();
  }, []);

  const conversionRate = totalUsers > 0 ? ((activeCount / totalUsers) * 100).toFixed(1) : "0";
  const arr = mrr * 12;

  const metrics = [
    { title: "MRR", value: `€${mrr.toFixed(2)}`, sub: "Revenu mensuel récurrent", icon: DollarSign, color: "text-green-500" },
    { title: "ARR", value: `€${arr.toFixed(0)}`, sub: "Revenu annuel récurrent", icon: TrendingUp, color: "text-blue-500" },
    { title: "Abonnés actifs", value: activeCount, sub: `Sur ${totalUsers} inscrits`, icon: Users, color: "text-purple-500" },
    { title: "Taux de conv.", value: `${conversionRate}%`, sub: "Freemium → Payant", icon: Activity, color: "text-orange-500" },
  ];

  if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, i) => (
          <motion.div
            key={m.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="p-5 rounded-xl border border-border bg-card"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground font-medium">{m.title}</p>
              <m.icon className={`h-4 w-4 ${m.color}`} />
            </div>
            <p className="text-2xl font-bold">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.sub}</p>
          </motion.div>
        ))}
      </div>

      {planBreakdown.length > 0 && (
        <div className="p-6 rounded-xl border border-border bg-card">
          <h3 className="font-semibold mb-4">Répartition par plan</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={planBreakdown}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis yAxisId="left" orientation="left" />
              <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `€${v}`} />
              <Tooltip formatter={(val, name) => name === "revenue" ? `€${val}` : val} />
              <Legend />
              <Bar yAxisId="left" dataKey="count" name="Abonnés" fill="#3b82f6" radius={[4,4,0,0]} />
              <Bar yAxisId="right" dataKey="revenue" name="Revenue (€)" fill="#10b981" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-2">Prochaines actions recommandées</h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          {Number(conversionRate) < 5 && (
            <li className="flex gap-2 items-start">
              <span className="text-orange-500 font-bold">→</span>
              Taux de conversion {conversionRate}% — Lance une campagne promo ou email pour accélérer
            </li>
          )}
          {activeCount < 10 && (
            <li className="flex gap-2 items-start">
              <span className="text-blue-500 font-bold">→</span>
              Ajoute un code promo limité pour les 10 premiers abonnés (ex: ALFASL30)
            </li>
          )}
          <li className="flex gap-2 items-start">
            <span className="text-green-500 font-bold">→</span>
            MRR actuel: €{mrr.toFixed(2)} → Objectif €500 MRR en {Math.ceil((500 - mrr) / Math.max(mrr * 0.15, 1))} mois avec 15% de croissance
          </li>
        </ul>
      </div>
    </div>
  );
}
