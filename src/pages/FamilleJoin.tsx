import { useEffect, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Loader2, CheckCircle2, XCircle, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";

type State = "loading" | "joining" | "success" | "error" | "needsAuth";

export default function FamilleJoin() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [state, setState] = useState<State>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (!token) { setState("error"); setErrorMsg("Lien d'invitation invalide."); return; }
    if (!user) { setState("needsAuth"); return; }
    join();
  }, [authLoading, user, token]);

  const join = async () => {
    setState("joining");
    try {
      const { data, error } = await supabase.functions.invoke("join-family", {
        body: { token },
      });
      if (error || data?.error) {
        setErrorMsg(data?.error || error?.message || "Erreur inconnue");
        setState("error");
      } else {
        setState("success");
        // Invalidate subscription cache by forcing reload after 1.5s
        setTimeout(() => navigate("/dashboard"), 1800);
      }
    } catch (e: any) {
      setErrorMsg(e.message || "Erreur réseau");
      setState("error");
    }
  };

  return (
    <div className="min-h-screen bg-[#fdf8ef]">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-32 pb-16 text-center">

        {/* Icon */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-emerald-700 to-amber-700 flex items-center justify-center mb-8 shadow-xl">
          <Users className="h-10 w-10 text-white" />
        </div>

        {(state === "loading" || state === "joining") && (
          <>
            <Loader2 className="h-8 w-8 animate-spin text-emerald-700 mx-auto mb-4" />
            <p className="text-amber-800/70 text-sm">
              {state === "loading" ? "Vérification de l'invitation…" : "Activation de votre accès…"}
            </p>
          </>
        )}

        {state === "needsAuth" && (
          <>
            <h1 className="text-2xl font-bold text-emerald-900 mb-3">Vous avez été invité !</h1>
            <p className="text-amber-800/70 mb-8">
              Connectez-vous ou créez un compte pour rejoindre la famille et accéder à toute la plateforme.
            </p>
            <div className="flex flex-col gap-3">
              <Button
                asChild
                className="bg-gradient-to-r from-emerald-700 to-amber-700 text-white border-0 hover:opacity-90 h-12 text-base font-semibold"
              >
                <Link to={`/auth?redirect=/famille/rejoindre?token=${token}`}>
                  Se connecter / Créer un compte
                </Link>
              </Button>
            </div>
          </>
        )}

        {state === "success" && (
          <>
            <CheckCircle2 className="h-14 w-14 text-emerald-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-emerald-900 mb-2">Bienvenue dans la famille !</h1>
            <p className="text-amber-800/70 mb-2">
              Votre accès Premium est maintenant actif. Vous allez être redirigé…
            </p>
          </>
        )}

        {state === "error" && (
          <>
            <XCircle className="h-14 w-14 text-red-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-red-700 mb-2">Invitation invalide</h1>
            <p className="text-amber-800/70 mb-6">{errorMsg}</p>
            <Button asChild variant="outline" className="border-emerald-300 text-emerald-700">
              <Link to="/">Retour à l'accueil</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
