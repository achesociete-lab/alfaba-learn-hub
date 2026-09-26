import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

type Status = "loading" | "linking" | "done" | "already_linked" | "error";

export default function ParentActiver() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const inviteId = params.get("invite_id");
  const [status, setStatus] = useState<Status>("loading");
  const [childName, setChildName] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Wait for Supabase to restore session from the magic link
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session && inviteId) {
        await completeActivation(session.user.id);
      } else if (!inviteId) {
        setError("Lien invalide — aucun identifiant d'invitation.");
        setStatus("error");
      }
    });

    // Also check if already logged in (page refresh case)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session && inviteId) completeActivation(session.user.id);
    });

    return () => subscription.unsubscribe();
  }, [inviteId]);

  const completeActivation = async (userId: string) => {
    setStatus("linking");

    // Load invite
    const { data: invite, error: invErr } = await supabase
      .from("parent_invites" as any)
      .select("id, child_profile_id, child_name, used_at")
      .eq("id", inviteId!)
      .maybeSingle();

    if (invErr || !invite) {
      setError("Invitation introuvable ou expirée.");
      setStatus("error");
      return;
    }

    const inv = invite as any;
    setChildName(inv.child_name);

    if (inv.used_at) {
      setStatus("already_linked");
      setTimeout(() => navigate("/parents"), 2000);
      return;
    }

    // Check if already linked
    const { data: existing } = await supabase
      .from("parent_links" as any)
      .select("id")
      .eq("parent_user_id", userId)
      .maybeSingle();

    if (!existing) {
      const { error: linkErr } = await supabase
        .from("parent_links" as any)
        .insert({ parent_user_id: userId, child_profile_id: inv.child_profile_id });

      if (linkErr) {
        setError("Erreur lors de la liaison du compte.");
        setStatus("error");
        return;
      }
    }

    // Mark invite used
    await supabase
      .from("parent_invites" as any)
      .update({ used_at: new Date().toISOString() } as any)
      .eq("id", inviteId!);

    setStatus("done");
    setTimeout(() => navigate("/parents"), 2500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-sm w-full text-center space-y-4 p-8 rounded-2xl border border-border bg-card">

        {(status === "loading" || status === "linking") && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
            <p className="text-foreground font-medium">
              {status === "loading" ? "Vérification en cours…" : "Activation de votre espace parent…"}
            </p>
          </>
        )}

        {status === "done" && (
          <>
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200 }}>
              <CheckCircle className="h-16 w-16 text-primary mx-auto" />
            </motion.div>
            <h1 className="text-2xl font-bold text-foreground">Bienvenue !</h1>
            <p className="text-muted-foreground">
              Votre espace parent pour <strong>{childName}</strong> est activé.<br />
              Redirection en cours…
            </p>
            <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
          </>
        )}

        {status === "already_linked" && (
          <>
            <CheckCircle className="h-12 w-12 text-primary mx-auto" />
            <h1 className="text-xl font-bold">Espace déjà activé</h1>
            <p className="text-muted-foreground text-sm">Redirection vers votre espace…</p>
          </>
        )}

        {status === "error" && (
          <>
            <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
            <h1 className="text-xl font-bold">Problème d'activation</h1>
            <p className="text-muted-foreground text-sm">{error}</p>
            <p className="text-xs text-muted-foreground">Contactez votre professeur pour recevoir un nouveau lien.</p>
            <Button variant="outline" onClick={() => navigate("/")}>Retour à l'accueil</Button>
          </>
        )}
      </motion.div>
    </div>
  );
}
