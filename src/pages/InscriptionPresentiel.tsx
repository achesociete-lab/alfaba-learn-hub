import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ArrowLeft, MapPin, ArrowRight, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { PRESENTIEL_SIGNUP_FLAG } from "@/components/PendingPresentielHandler";

const InscriptionPresentiel = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);

  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user && !sessionStorage.getItem(PRESENTIEL_SIGNUP_FLAG)) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleGoogleSignup = async () => {
    setGoogleLoading(true);
    try {
      // Flag the session so PendingPresentielHandler marks the profile en_attente
      // and notifies the admin once the OAuth round-trip lands the user back here.
      sessionStorage.setItem(PRESENTIEL_SIGNUP_FLAG, "1");
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: { prompt: "select_account" },
      });
      if (result.error) {
        sessionStorage.removeItem(PRESENTIEL_SIGNUP_FLAG);
        toast.error("Erreur lors de la connexion avec Google");
        return;
      }
      if (result.redirected) return;
      navigate("/cours-presentiel", { replace: true });
    } catch (err: any) {
      sessionStorage.removeItem(PRESENTIEL_SIGNUP_FLAG);
      toast.error(err.message || "Erreur Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6) {
      toast.error("Remplissez tous les champs (mot de passe 6 car. min)");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, level: "niveau_1", pending_presentiel: true },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error("Un compte existe déjà avec cet email.");
        return;
      }

      // Mark directly as 'presentiel' — no validation needed for link-based signups.
      if (data.user) {
        await supabase.from("profiles").update({ type_eleve: "presentiel" as any }).eq("user_id", data.user.id);
        // Notifier admin (information seulement)
        supabase.functions.invoke("notify-pending-signup", {
          body: { studentName: `${firstName} ${lastName}`, studentEmail: email, userId: data.user.id },
        }).catch((err) => console.warn("notify-pending-signup fail", err));
      }

      setShowVerification(true);
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Inscription enregistrée</h1>
            <p className="text-muted-foreground mb-2">Un email de confirmation a été envoyé à :</p>
            <p className="font-semibold text-foreground mb-6">{email}</p>
            <div className="bg-gold/10 border border-gold/30 rounded-lg p-4 text-left mb-6">
              <p className="text-sm text-foreground">
                Une fois votre email confirmé, vous pourrez vous connecter et accéder directement à vos <strong>cours en présentiel</strong>.
              </p>
            </div>
            <Link to="/auth">
              <Button className="w-full gradient-emerald border-0 text-primary-foreground">
                <CheckCircle className="h-4 w-4 mr-2" /> Retour à la connexion
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
        </Link>

        <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
          <div className="flex items-center gap-2 mb-2 justify-center">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">
              ALFASL <span className="text-gradient-gold font-arabic">الفصل</span>
            </span>
          </div>
          <div className="flex items-center justify-center gap-2 mb-6">
            <MapPin className="h-4 w-4 text-gold" />
            <span className="text-sm font-semibold text-gold">Inscription Présentiel</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">Créez votre compte</h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            Réservé aux élèves suivant les cours sur place. Validation par un professeur requise.
          </p>

          <Button
            type="button"
            variant="outline"
            className="w-full mb-4"
            onClick={handleGoogleSignup}
            disabled={googleLoading}
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? "Connexion…" : "S'inscrire avec Google"}
          </Button>

          <div className="relative mb-4">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              Ou avec un email
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="firstName">Prénom</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="lastName">Nom</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
              </div>
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
            </div>
            <div>
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} />
            </div>

            <Button type="submit" disabled={loading} className="w-full gradient-emerald border-0 text-primary-foreground">
              {loading ? "Envoi…" : (<>Créer mon compte présentiel <ArrowRight className="ml-2 h-4 w-4" /></>)}
            </Button>
          </form>

          <p className="text-sm text-muted-foreground text-center mt-6">
            Élève en ligne ?{" "}
            <Link to="/auth" className="text-primary font-medium hover:underline">S'inscrire en ligne</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default InscriptionPresentiel;
