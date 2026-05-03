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
//   - SIGNED_IN: any sign-in event (idempotency handled by welcome_email_sent flag in DB)
// Uses supabase.functions.invoke() which already knows the project URL — no env var needed.
async function maybeSendWelcomeEmail(event: string) {
  try {
    // For regular sign-ins of existing users, the DB flag prevents duplicate sends.
    // We only skip the call for non-signup events to avoid unnecessary network requests.
    if (event !== "SIGNED_IN" && event !== "EMAIL_CONFIRMED") return;

    const { error } = await supabase.functions.invoke("on-user-signup", {
      body: {},
    });

    if (error) {
      console.warn("maybeSendWelcomeEmail: edge function error", error);
    }
  } catch (err) {
    // Non-blocking — email failure must never break the auth flow
    console.warn("maybeSendWelcomeEmail: non-fatal error", err);
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

          // Send one-time welcome email — DB flag ensures it's sent only once
          setTimeout(() => maybeSendWelcomeEmail(event), 0);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
      if (session?.user) setTimeout(() => syncGoogleProfile(session.user), 0);
      // Do NOT call maybeSendWelcomeEmail here — getSession restores existing sessions
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
