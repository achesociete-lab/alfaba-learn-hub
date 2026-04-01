import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import PlacementTest from "@/components/PlacementTest";

type SignupStep = "info" | "test";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [level, setLevel] = useState<"niveau_1" | "niveau_2">("niveau_1");
  const [loading, setLoading] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [resending, setResending] = useState(false);
  const [signupStep, setSignupStep] = useState<SignupStep>("info");
  const navigate = useNavigate();

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
    // Validate fields before moving to test
    if (!firstName.trim() || !lastName.trim() || !email.trim() || password.length < 6) {
      toast.error("Veuillez remplir tous les champs (mot de passe : 6 caractères minimum)");
      return;
    }
    setSignupStep("test");
  };

  const handleTestComplete = (determinedLevel: "niveau_1" | "niveau_2") => {
    setLevel(determinedLevel);
    handleSignup();
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

            <Button type="submit" disabled={loading} className="w-full gradient-emerald border-0 text-primary-foreground">
              {loading ? "Chargement..." : isLogin ? "Se connecter" : "Passer le test de niveau →"}
            </Button>
          </form>

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
