import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface Profile {
  first_name: string;
  last_name: string;
  level: "niveau_1" | "niveau_2";
  age: number | null;
  gender: string | null;
  type_eleve: "en_ligne" | "presentiel" | "en_attente";
}

// Tracks which userId we last fetched for and the result.
// Deriving `loading` from this avoids the render-gap race condition where
// user becomes non-null but profileLoading is still false from the null-user state.
type FetchState = { userId: string | null; profile: Profile | null };

export function useProfile() {
  const { user } = useAuth();
  const [fetchState, setFetchState] = useState<FetchState>({ userId: null, profile: null });

  // Derived synchronously — true the instant user.id changes, before any effect runs.
  const loading = !!user && fetchState.userId !== user.id;
  const profile = fetchState.userId === (user?.id ?? null) ? fetchState.profile : null;

  // BUG 5 FIX: age/gender ne sont pas requis pour les utilisateurs Google OAuth.
  const isComplete =
    !!profile &&
    !!profile.first_name?.trim() &&
    !!profile.last_name?.trim();

  const refetch = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("profiles")
      .select("first_name, last_name, level, age, gender, type_eleve")
      .eq("user_id", user.id)
      .maybeSingle();
    setFetchState({ userId: user.id, profile: data as Profile | null });
  };

  useEffect(() => {
    if (!user) {
      setFetchState({ userId: null, profile: null });
      return;
    }

    let cancelled = false;

    const fetchWithRetry = async () => {
      // First attempt
      const { data } = await supabase
        .from("profiles")
        .select("first_name, last_name, level, age, gender, type_eleve")
        .eq("user_id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (data) {
        setFetchState({ userId: user.id, profile: data as Profile });
        return;
      }

      // Profile not found yet — DB trigger (handle_new_user) may still be running.
      // Retry up to 4 times with exponential back-off: 300ms, 600ms, 1200ms, 2400ms.
      const delays = [300, 600, 1200, 2400];
      for (const delay of delays) {
        await new Promise((r) => setTimeout(r, delay));
        if (cancelled) return;

        const { data: retryData } = await supabase
          .from("profiles")
          .select("first_name, last_name, level, age, gender, type_eleve")
          .eq("user_id", user.id)
          .maybeSingle();

        if (cancelled) return;
        if (retryData) {
          setFetchState({ userId: user.id, profile: retryData as Profile });
          return;
        }
      }

      // All retries exhausted — profile genuinely doesn't exist
      setFetchState({ userId: user.id, profile: null });
    };

    fetchWithRetry();
    return () => { cancelled = true; };
  }, [user?.id]); // user.id — not the full user object — avoids spurious re-fetches

  return { profile, loading, isComplete, refetch };
}
