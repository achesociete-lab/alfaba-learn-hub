import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  clearPresentielSignupIntent,
  ensurePresentielProfile,
  hasPresentielSignupIntent,
  PRESENTIEL_SIGNUP_FLAG,
  userHasPresentielMetadata,
} from "@/utils/presentiel-signup";

/**
 * Watches for a freshly authenticated user that started signup via the
 * /inscription-presentiel page (Google OAuth flow). Marks their profile
 * directly as 'presentiel' (no manual validation needed for link signups)
 * and notifies the admin for information.
 */
const PendingPresentielHandler = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const handledRef = useRef(false);

  useEffect(() => {
    if (!user || handledRef.current) return;
    if (!hasPresentielSignupIntent() && !userHasPresentielMetadata(user)) return;

    handledRef.current = true;
    (async () => {
      try {
        const profile = await ensurePresentielProfile(user);

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

        clearPresentielSignupIntent();
        toast.success("Bienvenue ! Accès aux cours en présentiel activé.");
        navigate("/cours-presentiel", { replace: true });
      } catch (err) {
        console.error("PendingPresentielHandler error", err);
        toast.error("Compte créé, mais l'accès présentiel n'a pas pu être activé automatiquement.");
      }
    })();
  }, [navigate, user]);

  return null;
};

export default PendingPresentielHandler;
export { PRESENTIEL_SIGNUP_FLAG };
