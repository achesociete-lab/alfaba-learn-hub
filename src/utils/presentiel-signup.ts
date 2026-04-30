import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const PRESENTIEL_SIGNUP_FLAG = "pending_presentiel_signup";

export const markPresentielSignupIntent = () => {
  localStorage.setItem(PRESENTIEL_SIGNUP_FLAG, "1");
};

export const clearPresentielSignupIntent = () => {
  localStorage.removeItem(PRESENTIEL_SIGNUP_FLAG);
  sessionStorage.removeItem(PRESENTIEL_SIGNUP_FLAG);
};

export const hasPresentielSignupIntent = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  return (
    localStorage.getItem(PRESENTIEL_SIGNUP_FLAG) === "1" ||
    sessionStorage.getItem(PRESENTIEL_SIGNUP_FLAG) === "1" ||
    params.get("presentiel") === "1"
  );
};

const getNameParts = (user: User) => {
  const meta = user.user_metadata ?? {};
  const fullName = String(meta.full_name ?? meta.name ?? "").trim();
  const parts = fullName.split(/\s+/).filter(Boolean);

  return {
    firstName: String(meta.first_name ?? meta.given_name ?? parts[0] ?? user.email?.split("@")[0] ?? "").trim(),
    lastName: String(meta.last_name ?? meta.family_name ?? parts.slice(1).join(" ") ?? "").trim(),
    avatarUrl: String(meta.avatar_url ?? meta.picture ?? "").trim() || null,
  };
};

export const userHasPresentielMetadata = (user: User) => {
  const meta = user.user_metadata ?? {};
  return meta.pending_presentiel === true || meta.type_eleve === "presentiel" || meta.signup_source === "presentiel";
};

export const ensurePresentielProfile = async (user: User) => {
  const { firstName, lastName, avatarUrl } = getNameParts(user);

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, type_eleve")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) throw readError;

  if (profile) {
    if (profile.type_eleve !== "presentiel") {
      const { error } = await supabase
        .from("profiles")
        .update({ type_eleve: "presentiel" } as any)
        .eq("user_id", user.id);
      if (error) throw error;
    }
    return { ...profile, type_eleve: "presentiel" as const };
  }

  const { data, error } = await supabase
    .from("profiles")
    .insert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      level: "niveau_1" as any,
      avatar_url: avatarUrl,
      type_eleve: "presentiel" as any,
    } as any)
    .select("id, first_name, last_name, type_eleve")
    .single();

  if (error) throw error;
  return data;
};