import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
});

export const useAuth = () => useContext(AuthContext);

// BUG 6 FIX: sync automatique du profil Google OAuth → table profiles Supabase.
async function syncGoogleProfile(user: User) {
  const meta = user.user_metadata || {};
  if (user.app_metadata?.provider !== "google") return;

  const given = meta.given_name || meta.name?.split(" ")[0] || "";
  const family = meta.family_name || meta.name?.split(" ").slice(1).join(" ") || "";
  const avatar = meta.avatar_url || meta.picture || "";
  if (!given && !family) return;

  const { data: existing } = await supabase
    .from("profiles")
    .select("first_name, last_name")
    .eq("user_id", user.id)
    .maybeSingle();

  if (existing?.first_name?.trim() && existing?.last_name?.trim()) return;

  await supabase.from("profiles").upsert(
    {
      user_id: user.id,
      first_name: given || existing?.first_name || "",
      last_name: family || existing?.last_name || "",
      ...(avatar ? { avatar_url: avatar } : {}),
    },
    { onConflict: "user_id" }
  );
}

// Send one-time welcome email for new users.
// Fires on:
//   - EMAIL_CONFIRMED: user clicked the confirmation link (email/password signup)
//   - SIGNED_IN with a very recent created_at: OAuth signup (Google, etc.)
// The Edge Function is idempotent (checks welcome_email_sent flag in profiles).
async function maybeSendWelcomeEmail(user: User, accessToken: string, event: string) {
  try {
    // For SIGNED_IN events, only send to brand-new accounts (created < 3 min ago)
    if (event === "SIGNED_IN") {
      const createdAt = new Date(user.created_at).getTime();
      const ageMs = Date.now() - createdAt;
      if (ageMs > 3 * 60 * 1000) return; // not a new signup
    }

    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
    if (!supabaseUrl) return;

    await fetch(`${supabaseUrl}/functions/v1/on-user-signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify({}),
    });
  } catch (err) {
    // Non-blocking — email failure must never break the auth flow
    console.warn("maybySendWelcomeEmail: non-fatal error", err);
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setLoading(false);

        if (session?.user) {
          // Sync Google profile (non-blocking)
          setTimeout(() => syncGoogleProfile(session.user), 0);

          // Send one-time welcome email on first sign-in or email confirmation
          if (event === "EMAIL_CONFIRMED" || event === "SIGNED_IN") {
            setTimeout(() => maybySendWelcomeEmail(session.user, session.access_token, event), 0);
          }
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) setTimeout(() => syncGoogleProfile(session.user), 0);
      // Do NOT call maybySendWelcomeEmail here — getSession restores existing sessions
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => { await supabase.auth.signOut(); };

  return (
    <AuthContext.Provider value={{ session, user: session?.user ?? null, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
