import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";

export type Plan = "découverte" | "essentiel" | "premium" | "famille" | "hifz";

const FREE_LESSON_LIMIT = 3;

// Simple in-memory cache to avoid redundant Supabase calls across renders
const cache: Record<string, { plan: Plan; at: number }> = {};
const CACHE_TTL_MS = 60_000; // 1 minute

export function useSubscription() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [plan, setPlan] = useState<Plan>("découverte");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminLoading) return;

    if (isAdmin) {
      setPlan("premium");
      setLoading(false);
      return;
    }

    if (!user) {
      setPlan("découverte");
      setLoading(false);
      return;
    }

    // Use cache if still fresh
    const cached = cache[user.id];
    if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
      setPlan(cached.plan);
      setLoading(false);
      return;
    }

    const fetchPlan = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const resolvedPlan: Plan = data ? (data.plan as Plan) : "découverte";
      cache[user.id] = { plan: resolvedPlan, at: Date.now() };
      setPlan(resolvedPlan);
      setLoading(false);
    };

    fetchPlan();

    // Realtime subscription to catch instant upgrades/cancellations
    const channel = supabase
      .channel(`subscription:${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const row = payload.new as { plan?: string; status?: string } | null;
          if (row?.status === "active" && row.plan) {
            const newPlan = row.plan as Plan;
            cache[user.id] = { plan: newPlan, at: Date.now() };
            setPlan(newPlan);
          } else if (payload.eventType === "DELETE" || row?.status === "canceled") {
            cache[user.id] = { plan: "découverte", at: Date.now() };
            setPlan("découverte");
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, isAdmin, adminLoading]);

  const isFreePlan = plan === "découverte";
  const isPremium = plan === "premium";
  const isHifz = plan === "hifz";
  const isFamille = plan === "famille";
  const maxLessons = isFreePlan ? FREE_LESSON_LIMIT : Infinity;

  return { plan, isFreePlan, isPremium, isHifz, isFamille, maxLessons, loading: loading || adminLoading };
}
