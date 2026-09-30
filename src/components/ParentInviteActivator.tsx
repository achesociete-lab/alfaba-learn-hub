import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

// Checks for pending parent invites matching the logged-in user's email.
// Activates them automatically (creates parent_links, marks invite used)
// and redirects to /parents. Runs on every login — harmless if no pending invites.
const ParentInviteActivator = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user?.email) return;

    const activate = async () => {
      const { data: invites } = await supabase
        .from("parent_invites" as any)
        .select("id, child_profile_id, child_name")
        .eq("parent_email", user.email!.toLowerCase())
        .is("used_at", null);

      if (!invites?.length) return;

      let activated = 0;
      for (const invite of invites as any[]) {
        const { data: existing } = await supabase
          .from("parent_links")
          .select("id")
          .eq("parent_user_id", user.id)
          .eq("child_profile_id", invite.child_profile_id)
          .maybeSingle();

        if (!existing) {
          const { error } = await supabase
            .from("parent_links")
            .insert({ parent_user_id: user.id, child_profile_id: invite.child_profile_id });
          if (!error) activated++;
        }

        await supabase
          .from("parent_invites" as any)
          .update({ used_at: new Date().toISOString() })
          .eq("id", invite.id);
      }

      if (activated > 0) {
        toast.success(`Votre espace parent pour ${(invites[0] as any).child_name} est prêt ✓`);
        navigate("/parents");
      }
    };

    activate();
  }, [user?.id]);

  return null;
};

export default ParentInviteActivator;
