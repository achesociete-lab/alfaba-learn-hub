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

  const isComplete =
    !!profile &&
    !!profile.first_name?.trim() &&
    !!profile.last_name?.trim() &&
    profile.age != null &&
    !!profile.gender?.trim();

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
    const fetch = async () => {
      await refetch();
      setLoading(false);
    };
    fetch();
  }, [user]);

  return { profile, loading, isComplete, refetch };
}
