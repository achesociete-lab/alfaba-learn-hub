import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Loader2, MailX, CheckCircle } from "lucide-react";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<"loading" | "valid" | "already" | "invalid" | "done" | "error">("loading");

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`;
    fetch(url, { headers: { apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY } })
      .then((r) => r.json())
      .then((d) => {
        if (d.valid) setState("valid");
        else if (d.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      })
      .catch(() => setState("error"));
  }, [token]);

  const confirm = async () => {
    setState("loading");
    try {
      const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-email-unsubscribe`;
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY },
        body: JSON.stringify({ token }),
      });
      const d = await r.json();
      if (d.success) setState("done");
      else if (d.reason === "already_unsubscribed") setState("already");
      else setState("error");
    } catch {
      setState("error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="max-w-md w-full bg-card border border-border rounded-xl p-8 text-center shadow-lg">
        {state === "loading" && <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto" />}
        {state === "valid" && (
          <>
            <MailX className="h-12 w-12 text-gold mx-auto mb-4" />
            <h1 className="text-xl font-bold mb-2">Confirmer la désinscription</h1>
            <p className="text-muted-foreground mb-6">Vous ne recevrez plus d'emails de notre part.</p>
            <Button onClick={confirm} className="w-full">Confirmer</Button>
          </>
        )}
        {state === "done" && (<><CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" /><h1 className="text-xl font-bold">Vous êtes désinscrit(e)</h1></>)}
        {state === "already" && (<><CheckCircle className="h-12 w-12 text-primary mx-auto mb-4" /><h1 className="text-xl font-bold">Déjà désinscrit(e)</h1></>)}
        {(state === "invalid" || state === "error") && (<><MailX className="h-12 w-12 text-destructive mx-auto mb-4" /><h1 className="text-xl font-bold">Lien invalide</h1></>)}
      </div>
    </div>
  );
};

export default Unsubscribe;
