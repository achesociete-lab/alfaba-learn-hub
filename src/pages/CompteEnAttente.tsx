import { Link } from "react-router-dom";
import { Hourglass, LogOut, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const CompteEnAttente = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background geometric-pattern flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card border border-border rounded-xl p-8 shadow-lg text-center">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <BookOpen className="h-7 w-7 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">
              ALFASL <span className="text-gradient-gold font-arabic">الفصل</span>
            </span>
          </div>

          <div className="w-20 h-20 rounded-full bg-gold/10 flex items-center justify-center mx-auto mb-6">
            <Hourglass className="h-10 w-10 text-gold animate-pulse" />
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-3">
            Votre compte est en attente de validation
          </h1>
          <p className="text-muted-foreground mb-2 leading-relaxed">
            Votre inscription en présentiel a bien été enregistrée. Un professeur va valider votre compte dans les plus brefs délais.
          </p>
          <p className="text-sm text-muted-foreground mb-6">
            Vous recevrez un accès à vos cours dès la validation. Reconnectez-vous pour vérifier l'état de votre compte.
          </p>

          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-foreground">
              <strong>Besoin d'aide ?</strong> Contactez votre professeur ou écrivez à{" "}
              <a href="mailto:abdelkarim7@gmail.com" className="text-primary hover:underline">
                abdelkarim7@gmail.com
              </a>
            </p>
          </div>

          <Button onClick={handleLogout} variant="outline" className="w-full">
            <LogOut className="h-4 w-4 mr-2" /> Se déconnecter
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CompteEnAttente;
