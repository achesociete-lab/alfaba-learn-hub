import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { BookOpen, ArrowLeft, Mail, CheckCircle, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import PlacementTest from "@/components/PlacementTest";
import { useAuth } from "@/contexts/AuthContext";

type SignupStep = "info" | "test";

const Auth = () => {
  const { user, loading: authLoading } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [level, setLevel] = useState<"niveau_1" | "niveau_2">("niveau_1");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("info");
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [authLoading, user, navigate]);

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      const result = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
      });

      if (result.error) {
        console.error("Google OAuth error:", result.error);
        toast.error("Erreur lors de la connexion avec Google");
        return;
      }

      if (result.redirected) {
        return;
      }

      toast.success("Connexion réussie !");
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Erreur lors de la connexion avec Google");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSignup = async (signupLevel?: "niveau_1" | "niveau_2") => {
    const finalLevel = signupLevel || level;
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { first_name: firstName, last_name: lastName, level: finalLevel },
          emailRedirectTo: `${window.location.origin}/auth`,
        },
      });
      if (error) throw error;

      if (data.user && data.user.identities && data.user.identities.length === 0) {
        toast.error("Un compte existe déjà avec cet email. Connectez-vous.");
        setIsLogin(true);
        setSignupStep("info");
        return;
      }

      setShowVerification(true);
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        if (error.message.includes("Email not confirmed")) {
          setShowVerification(true);
          return;
        }
        throw error;
      }
      toast.success("Connexion réussie !");
      navigate("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  const handleInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6) {
      toast.error("Veuillez remplir tous les champs (mot de passe : 6 caractères minimum)");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    setSignupStep("test");
  };

  const handleTestComplete = (determinedLevel: "niveau_1" | "niveau_2") => {
    setLevel(determinedLevel);
    handleSignup(determinedLevel);
  };

  const handleResendEmail = async () => {
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      if (error) throw error;
      toast.success("Email de vérification renvoyé !");
    } catch (err: any) {
      toast.error(err.message || "Impossible de renvoyer l'email");
    } finally {
      setResending(false);
    }
  };

  if (showVerification) {
    return (
      <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary mb-8 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Retour à l'accueil
          </Link>

          <div className="bg-card border border-border rounded-xl p-8 shadow-lg text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Mail className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Vérifiez votre email</h1>
            <p className="text-muted-foreground mb-2">
              Un email de vérification a été envoyé à :
            </p>
            <p className="font-semibold text-foreground mb-6">{email}</p>
            <p className="text-sm text-muted-foreground mb-6">
              Cliquez sur le lien dans l'email pour activer votre compte. Vérifiez aussi vos spams.
            </p>

            <div className="space-y-3">
              <Button onClick={handleResendEmail} disabled={resending} variant="outline" className="w-full">
                {resending ? "Envoi en cours…" : "Renvoyer l'email"}
              </Button>
              <Button
                onClick={() => {
                  setShowVerification(false);
                  setIsLogin(true);
                  setSignupStep("info");
                }}
                className="w-full gradient-emerald border-0 text-primary-foreground"
              >
                <CheckCircle className="h-4 w-4 mr-2" /> J'ai confirmé, me connecter
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Signup step: placement test
  if (!isLogin && signupStep === "test") {
    return (
      <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-xl p-8 shadow-lg">
            <div className="flex items-center gap-2 mb-6 justify-center">
              <BookOpen className="h-7 w-7 text-primary" />
              <span className="font-display text-xl font-bold text-foreground">
                Test de <span className="text-gradient-gold">niveau</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground text-center mb-6">
              Répondez à ces quelques questions pour déterminer votre niveau.
            </p>
            <PlacementTest
              onComplete={handleTestComplete}
              onBack={() => setSignupStep("info")}
            />
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
          <div className="flex items-center gap-2 mb-6 justify-center">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">
              ALFASL <span className="text-gradient-gold font-arabic">الفصل</span>
            </span>
          </div>

          <h1 className="text-2xl font-bold text-foreground text-center mb-2">
            {isLogin ? "Connexion" : "Inscription"}
          </h1>
          <p className="text-sm text-muted-foreground text-center mb-6">
            {isLogin ? "Accédez à votre espace élève" : "Créez votre compte pour commencer"}
          </p>

          {/* Social login buttons */}
          <div className="space-y-3 mb-6">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              {googleLoading ? "Connexion…" : "Continuer avec Google"}
            </Button>
          </div>

          <div className="relative mb-6">
            <Separator />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-3 text-xs text-muted-foreground">
              Ou continuer avec
            </span>
          </div>

          <form onSubmit={isLogin ? handleLogin : handleInfoSubmit} className="space-y-4">
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} required placeholder="Prénom" />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} required placeholder="Nom" />
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="votre@email.fr" />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
            </div>

            {!isLogin && (
              <div>
                <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
                <Input id="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required minLength={6} placeholder="••••••••" />
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full gradient-emerald border-0 text-primary-foreground">
              {loading ? "Chargement..." : isLogin ? "Se connecter" : (
                <>Créer mon compte <ArrowRight className="ml-2 h-4 w-4" /></>
              )}
            </Button>
          </form>

          {/* Legal notice for signup */}
          {!isLogin && (
            <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
              En créant un compte vous acceptez nos{" "}
              <Link to="/conditions" className="text-primary hover:underline font-medium">
                Conditions d'utilisation
              </Link>{" "}
              et notre{" "}
              <Link to="/confidentialite" className="text-primary hover:underline font-medium">
                Politique de confidentialité
              </Link>
            </p>
          )}

          <p className="text-sm text-muted-foreground text-center mt-6">
            {isLogin ? "Pas encore de compte ?" : "Déjà inscrit ?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setSignupStep("info");
              }}
              className="text-primary font-medium hover:underline"
            >
              {isLogin ? "S'inscrire" : "Se connecter"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
