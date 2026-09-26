import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, CheckCircle, AlertCircle, Users } from "lucide-react";
import { toast } from "sonner";

interface Invite {
  token: string;
  parent_email: string;
  child_name: string;
  used_at: string | null;
  expires_at: string | null;
}

export default function ParentInvite() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");

  const [invite, setInvite] = useState<Invite | null>(null);
  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "used" | "done">("loading");

  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    if (!token) { setStatus("invalid"); return; }
    loadInvite();
  }, [token]);

  // After email confirmation redirect, auto-complete the linking
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if ((event === "SIGNED_IN" || event === "TOKEN_REFRESHED") && session && invite && !invite.used_at) {
        await completeLink(session.user.id);
      }
    });
    return () => subscription.unsubscribe();
  }, [invite]);

  const loadInvite = async () => {
    const { data, error } = await supabase
      .from("parent_invites" as any)
      .select("token, parent_email, child_name, used_at, expires_at")
      .eq("token", token!)
      .maybeSingle();

    if (error || !data) { setStatus("invalid"); return; }

    const inv = data as Invite;
    if (inv.used_at) { setStatus("used"); return; }
    if (inv.expires_at && new Date(inv.expires_at) < new Date()) { setStatus("invalid"); return; }

    setInvite(inv);
    setEmail(inv.parent_email);
    setStatus("valid");
  };

  const completeLink = async (userId: string) => {
    // Get child_profile_id from invite
    const { data } = await supabase
      .from("parent_invites" as any)
      .select("child_profile_id, id")
      .eq("token", token!)
      .maybeSingle();

    if (!data) return;

    // Create parent_link
    const { error: linkErr } = await supabase
      .from("parent_links" as any)
      .upsert({ parent_user_id: userId, child_profile_id: (data as any).child_profile_id }, { onConflict: "parent_user_id" });

    if (linkErr) { toast.error("Erreur lors de la liaison du compte"); return; }

    // Mark invite as used
    await supabase
      .from("parent_invites" as any)
      .update({ used_at: new Date().toISOString() } as any)
      .eq("token", token!);

    setStatus("done");
    setTimeout(() => navigate("/parents"), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !email.trim() || password.length < 6) {
      toast.error("Tous les champs sont requis (mot de passe : 6 caractères min.)");
      return;
    }

    setSubmitting(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: { first_name: firstName.trim(), role: "parent" },
          emailRedirectTo: `${window.location.origin}/parents/rejoindre?token=${token}`,
        },
      });

      if (error) { toast.error(error.message); setSubmitting(false); return; }

      if (data.session) {
        // Email confirmation disabled — user is immediately signed in
        await completeLink(data.session.user.id);
      } else {
        // Email confirmation required
        setConfirmSent(true);
      }
    } catch (err: any) {
      toast.error(err.message);
    }
    setSubmitting(false);
  };

  // ── UI ──────────────────────────────────────────────────────────────────────

  if (status === "loading") return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );

  if (status === "invalid") return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-sm text-center space-y-4 p-8 rounded-2xl border border-border bg-card">
        <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
        <h1 className="text-xl font-bold">Lien invalide ou expiré</h1>
        <p className="text-muted-foreground text-sm">Ce lien d'invitation n'est plus valide. Contactez votre professeur pour en obtenir un nouveau.</p>
      </motion.div>
    </div>
  );

  if (status === "used") return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-sm text-center space-y-4 p-8 rounded-2xl border border-border bg-card">
        <CheckCircle className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-xl font-bold">Compte déjà activé</h1>
        <p className="text-muted-foreground text-sm">Ce lien a déjà été utilisé. Connectez-vous directement.</p>
        <Button onClick={() => navigate("/auth")} className="w-full gradient-emerald border-0 text-primary-foreground">
          Se connecter
        </Button>
      </motion.div>
    </div>
  );

  if (status === "done") return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
        className="max-w-sm text-center space-y-4 p-8 rounded-2xl border border-primary/30 bg-primary/5">
        <CheckCircle className="h-16 w-16 text-primary mx-auto" />
        <h1 className="text-2xl font-bold">Bienvenue !</h1>
        <p className="text-muted-foreground">Votre espace parent est prêt. Redirection en cours…</p>
        <Loader2 className="h-5 w-5 animate-spin text-primary mx-auto" />
      </motion.div>
    </div>
  );

  if (confirmSent) return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-sm text-center space-y-4 p-8 rounded-2xl border border-border bg-card">
        <CheckCircle className="h-12 w-12 text-primary mx-auto" />
        <h1 className="text-xl font-bold">Vérifiez votre email</h1>
        <p className="text-muted-foreground text-sm">
          Un email de confirmation a été envoyé à <strong>{email}</strong>.
          Cliquez sur le lien dans l'email pour activer votre espace parent.
        </p>
        <p className="text-xs text-muted-foreground">Le lien dans l'email vous ramènera automatiquement ici.</p>
      </motion.div>
    </div>
  );

  // Main form
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-6">

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-16 w-16 rounded-2xl gradient-emerald flex items-center justify-center mx-auto">
            <Users className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Espace Parent — alfasl.fr</h1>
          <p className="text-muted-foreground">
            Vous êtes invité(e) à suivre la progression de <strong>{invite?.child_name}</strong>.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 p-6 rounded-2xl border border-border bg-card">
          <h2 className="font-semibold text-foreground">Créez votre compte</h2>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Votre prénom</label>
            <Input
              placeholder="Prénom"
              value={firstName}
              onChange={e => setFirstName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Email</label>
            <Input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="text-sm text-muted-foreground mb-1 block">Mot de passe (6 caractères min.)</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <Button type="submit" disabled={submitting} className="w-full gradient-emerald border-0 text-primary-foreground">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Créer mon espace parent
          </Button>

          <p className="text-xs text-center text-muted-foreground">
            Vous avez déjà un compte ?{" "}
            <button type="button" onClick={() => navigate(`/auth?redirect=/parents/rejoindre?token=${token}`)}
              className="text-primary hover:underline">
              Connectez-vous
            </button>
          </p>
        </form>
      </motion.div>
    </div>
  );
}
