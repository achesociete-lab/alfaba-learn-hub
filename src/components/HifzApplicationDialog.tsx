import { useState } from "react";
import { Loader2, BookOpen, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  trigger?: React.ReactNode;
  triggerClassName?: string;
  triggerLabel?: string;
}

export default function HifzApplicationDialog({ trigger, triggerClassName, triggerLabel }: Props) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [prenom, setPrenom] = useState("");
  const [niveauArabe, setNiveauArabe] = useState<"sait_lire" | "ne_sait_pas" | "">("");
  const [disponibilites, setDisponibilites] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");

  const canSubmit = prenom.trim() && niveauArabe && disponibilites.trim() && contact.trim();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const niveauLabel = niveauArabe === "sait_lire" ? "Sait lire l'arabe" : "Ne sait pas encore lire l'arabe";

      // Sauvegarde en base (source de vérité — indépendant de l'email)
      const { error: dbError } = await supabase.from("hifz_applications").insert({
        prenom: prenom.trim(),
        niveau_arabe: niveauLabel,
        disponibilites: disponibilites.trim(),
        contact: contact.trim(),
        message: message.trim() || null,
      });
      if (dbError) throw dbError;

      // Notification email (best-effort — ne bloque pas si ça échoue)
      supabase.functions.invoke("send-transactional-email", {
        body: {
          templateName: "hifz-application-admin",
          recipientEmail: "ache.societe@gmail.com",
          templateData: {
            prenom: prenom.trim(),
            niveauArabe: niveauLabel,
            disponibilites: disponibilites.trim(),
            emailOuTelephone: contact.trim(),
            message: message.trim() || null,
          },
        },
      }).catch((err) => console.warn("Email notification failed", err));

      setSubmitted(true);
    } catch (err: any) {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpen = () => {
    setOpen(true);
    setSubmitted(false);
    setPrenom("");
    setNiveauArabe("");
    setDisponibilites("");
    setContact("");
    setMessage("");
  };

  return (
    <>
      {trigger ? (
        <span onClick={handleOpen} style={{ cursor: "pointer" }}>{trigger}</span>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className={triggerClassName}
        >
          {triggerLabel ?? "Demander à rejoindre le programme"}
        </button>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-emerald-800">
              <BookOpen className="h-5 w-5" />
              Rejoindre le programme Hifd al-Qur'ān
            </DialogTitle>
          </DialogHeader>

          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-6 text-center">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-8 w-8 text-emerald-600" />
              </div>
              <div>
                <p className="font-semibold text-emerald-800 text-lg mb-1">Demande reçue !</p>
                <p className="text-sm text-amber-800/70">
                  Votre demande a été reçue, le professeur vous recontacte sous 24h.
                </p>
              </div>
              <Button variant="outline" onClick={() => setOpen(false)} className="mt-2">
                Fermer
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 pt-1">
              <p className="text-sm text-amber-800/70">
                Le paiement se fait directement avec le professeur (PayPal / virement) après votre premier contact.
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="hifz-prenom">Prénom <span className="text-red-500">*</span></Label>
                <Input
                  id="hifz-prenom"
                  value={prenom}
                  onChange={(e) => setPrenom(e.target.value)}
                  placeholder="Votre prénom"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Savez-vous lire l'arabe ? <span className="text-red-500">*</span></Label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "sait_lire", label: "Oui, je sais lire" },
                    { value: "ne_sait_pas", label: "Non, pas encore" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setNiveauArabe(opt.value as typeof niveauArabe)}
                      className={`px-3 py-2.5 rounded-xl border-2 text-sm font-medium transition-all text-left ${
                        niveauArabe === opt.value
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800"
                          : "border-gray-200 bg-white text-gray-600 hover:border-emerald-200"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hifz-dispo">Disponibilités <span className="text-red-500">*</span></Label>
                <Input
                  id="hifz-dispo"
                  value={disponibilites}
                  onChange={(e) => setDisponibilites(e.target.value)}
                  placeholder="Ex : lundi et jeudi soir, samedi matin…"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hifz-contact">Email ou téléphone <span className="text-red-500">*</span></Label>
                <Input
                  id="hifz-contact"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="votre@email.com ou 06 12 34 56 78"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="hifz-message">Message <span className="text-gray-400 font-normal">(optionnel)</span></Label>
                <Textarea
                  id="hifz-message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Votre niveau actuel, vos objectifs, vos questions…"
                  rows={3}
                  className="resize-none text-sm"
                />
              </div>

              <Button
                type="submit"
                disabled={!canSubmit || submitting}
                className="w-full h-11 bg-gradient-to-r from-emerald-700 to-amber-700 hover:opacity-90 border-0 text-white font-semibold"
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Envoi en cours…</>
                ) : (
                  "Envoyer ma demande"
                )}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
