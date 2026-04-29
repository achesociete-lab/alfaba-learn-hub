import { useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const FLAG_KEY = "pending_presentiel_signup";

/**
 * Watches for a freshly authenticated user that started signup via the
 * /inscription-presentiel page (Google OAuth flow). Marks their profile
 * as 'en_attente' and notifies the admin.
 */
const PendingPresentielHandler = () => {
  const { user } = useAuth();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!user || handledRef.current) return;
    const flag = sessionStorage.getItem(FLAG_KEY);
    if (!flag) return;

    handledRef.current = true;
    sessionStorage.removeItem(FLAG_KEY);

    (async () => {
      try {
        // Fetch profile to read first/last name (set by handle_new_user trigger)
        const { data: profile } = await supabase
          .from("profiles")
          .select("first_name, last_name, type_eleve")
          .eq("user_id", user.id)
          .maybeSingle();

        if (profile?.type_eleve === "en_attente") return; // already pending

        await supabase
          .from("profiles")
          .update({ type_eleve: "en_attente" as any })
          .eq("user_id", user.id);

        const fullName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim();
        supabase.functions
          .invoke("notify-pending-signup", {
            body: {
              studentName: fullName || user.email,
              studentEmail: user.email,
              userId: user.id,
            },
          })
          .catch((err) => console.warn("notify-pending-signup fail", err));
      } catch (err) {
        console.error("PendingPresentielHandler error", err);
      }
    })();
  }, [user]);

  return null;
};

export default PendingPresentielHandler;
export const PRESENTIEL_SIGNUP_FLAG = FLAG_KEY;
