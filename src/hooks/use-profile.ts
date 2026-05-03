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

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

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
    setProfile(data as Profile | null);
  };

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
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
        setProfile(data as Profile);
        setLoading(false);
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
          setProfile(retryData as Profile);
          setLoading(false);
          return;
        }
      }

      // All retries exhausted — profile genuinely doesn't exist
      setProfile(null);
      setLoading(false);
    };

    fetchWithRetry();
    return () => { cancelled = true; };
  }, [user]);

  return { profile, loading, isComplete, refetch };
}
