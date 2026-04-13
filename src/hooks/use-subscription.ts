import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useIsAdmin } from "@/hooks/use-admin";

export type Plan = "découverte" | "essentiel" | "premium";

const FREE_LESSON_LIMIT = 3;

export function useSubscription() {
  const { user } = useAuth();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [plan, setPlan] = useState<Plan>("découverte");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (adminLoading) return;

    console.log("[useSubscription] isAdmin:", isAdmin, "user:", !!user);

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

    const fetch = async () => {
      const { data } = await supabase
        .from("subscriptions")
        .select("plan, status")
        .eq("user_id", user.id)
        .eq("status", "active")
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (data) {
        setPlan(data.plan as Plan);
      } else {
        setPlan("découverte");
      }
      setLoading(false);
    };

    fetch();
  }, [user, isAdmin, adminLoading]);

  const isFreePlan = plan === "découverte";
  const maxLessons = isFreePlan ? FREE_LESSON_LIMIT : Infinity;

  return { plan, isFreePlan, maxLessons, loading: loading || adminLoading };
}
