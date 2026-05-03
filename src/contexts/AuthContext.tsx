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

// Send a one-time welcome email via the existing send-transactional-email function
// (already deployed and managed by Lovable — no new Edge Function needed).
//
// Idempotency strategy (two layers):
//   1. localStorage key `alfasl_welcome_sent_<userId>` — fast client-side guard
//   2. idempotencyKey passed to the function — server-side dedup via email_send_log
async function maybeSendWelcomeEmail(user: User, event: string) {
  try {
    if (event !== "SIGNED_IN" && event !== "EMAIL_CONFIRMED") return;

    // Layer 1: localStorage guard (avoids network calls on repeated logins)
    const lsKey = `alfasl_welcome_sent_${user.id}`;
    if (localStorage.getItem(lsKey)) return;

    const firstName =
      user.user_metadata?.given_name ||
      user.user_metadata?.full_name?.split(" ")[0] ||
      user.user_metadata?.name?.split(" ")[0] ||
      user.email?.split("@")[0] ||
      "";

    // Call the existing send-transactional-email function (already live in Lovable).
    // supabase.functions.invoke automatically attaches the user's session JWT.
    const { error } = await supabase.functions.invoke("send-transactional-email", {
      body: {
        templateName: "welcome-new-user",
        recipientEmail: user.email,
        templateData: {
          userName: firstName,
          userEmail: user.email ?? "",
        },
        // Layer 2: server-side dedup via email_send_log
        idempotencyKey: `welcome-${user.id}`,
      },
    });

    if (error) {
      console.warn("maybySendWelcomeEmail: function error", error);
      return;
    }

    // Mark sent so we skip the call on all future logins
    localStorage.setItem(lsKey, "1");
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

          // Send one-time welcome email — localStorage + server idempotency key
          setTimeout(() => maybeSendWelcomeEmail(session.user, event), 0);
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
