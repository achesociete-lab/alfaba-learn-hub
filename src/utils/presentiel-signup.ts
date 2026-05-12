import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const PRESENTIEL_SIGNUP_FLAG = "pending_presentiel_signup";
export const PRESENTIEL_SIGNUP_LEVEL_KEY = "pending_presentiel_level";

export type PresentielLevel = "niveau_1" | "niveau_2";

const normalizeLevel = (raw: string | null | undefined): PresentielLevel | null => {
  if (!raw) return null;
  const s = String(raw).toLowerCase();
  if (s === "1" || s === "niveau_1" || s === "n1") return "niveau_1";
  if (s === "2" || s === "niveau_2" || s === "n2") return "niveau_2";
  return null;
};

export const markPresentielSignupIntent = (level?: PresentielLevel | null) => {
  localStorage.setItem(PRESENTIEL_SIGNUP_FLAG, "1");
  if (level) localStorage.setItem(PRESENTIEL_SIGNUP_LEVEL_KEY, level);
};

export const clearPresentielSignupIntent = () => {
  localStorage.removeItem(PRESENTIEL_SIGNUP_FLAG);
  sessionStorage.removeItem(PRESENTIEL_SIGNUP_FLAG);
  localStorage.removeItem(PRESENTIEL_SIGNUP_LEVEL_KEY);
};

export const hasPresentielSignupIntent = (search = window.location.search) => {
  const params = new URLSearchParams(search);
  return (
    localStorage.getItem(PRESENTIEL_SIGNUP_FLAG) === "1" ||
    sessionStorage.getItem(PRESENTIEL_SIGNUP_FLAG) === "1" ||
    params.get("presentiel") === "1"
  );
};

export const getPresentielSignupLevel = (search = window.location.search): PresentielLevel | null => {
  const params = new URLSearchParams(search);
  return (
    normalizeLevel(params.get("niveau")) ||
    normalizeLevel(params.get("level")) ||
    normalizeLevel(localStorage.getItem(PRESENTIEL_SIGNUP_LEVEL_KEY))
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

export const ensurePresentielProfile = async (user: User, level?: PresentielLevel | null) => {
  const { firstName, lastName, avatarUrl } = getNameParts(user);
  const targetLevel: PresentielLevel = level ?? "niveau_1";

  const { data: profile, error: readError } = await supabase
    .from("profiles")
    .select("id, first_name, last_name, type_eleve, level")
    .eq("user_id", user.id)
    .maybeSingle();

  if (readError) throw readError;

  if (profile) {
    const updates: Record<string, any> = {};
    if (profile.type_eleve !== "presentiel") updates.type_eleve = "presentiel";
    if (level && profile.level !== targetLevel) updates.level = targetLevel;
    if (Object.keys(updates).length > 0) {
      const { error } = await supabase
        .from("profiles")
        .update(updates as any)
        .eq("user_id", user.id);
      if (error) throw error;
    }
    return { ...profile, type_eleve: "presentiel" as const, level: updates.level ?? profile.level };
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      user_id: user.id,
      first_name: firstName,
      last_name: lastName,
      level: targetLevel as any,
      avatar_url: avatarUrl,
      type_eleve: "presentiel" as any,
    } as any, { onConflict: "user_id" })
    .select("id, first_name, last_name, type_eleve, level")
    .single();

  if (error) throw error;
  return data;
};
