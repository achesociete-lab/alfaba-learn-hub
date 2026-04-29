import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!user || handledRef.current) return;
    const flag = sessionStorage.getItem(FLAG_KEY);
    if (!flag) return;

    handledRef.current = true;
    (async () => {
      try {
        let profile: { first_name: string | null; last_name: string | null; type_eleve: string | null } | null = null;

        for (let attempt = 0; attempt < 6; attempt += 1) {
          const { data } = await supabase
            .from("profiles")
            .select("first_name, last_name, type_eleve")
            .eq("user_id", user.id)
            .maybeSingle();

          if (data) {
            profile = data as typeof profile;
            break;
          }

          await new Promise((resolve) => setTimeout(resolve, 300));
        }

        if (profile?.type_eleve !== "presentiel") {
          const { error } = await supabase
            .from("profiles")
            .update({ type_eleve: "presentiel" as any })
            .eq("user_id", user.id);

          if (error) throw error;
        }

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

        sessionStorage.removeItem(FLAG_KEY);
        navigate("/cours-presentiel", { replace: true });
      } catch (err) {
        console.error("PendingPresentielHandler error", err);
      }
    })();
  }, [navigate, user]);

  return null;
};

export default PendingPresentielHandler;
export const PRESENTIEL_SIGNUP_FLAG = FLAG_KEY;
