import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Plus, Trash2, Copy, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

interface PromoCode {
  id: string;
  code: string;
  discount_percentage: number;
  usage_limit: number;
  usage_count: number;
  expiry_date: string;
  active: boolean;
}

export default function AdminPromoTab() {
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [discount, setDiscount] = useState(20);
  const [limit, setLimit] = useState(50);
  const [expiryDate, setExpiryDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    return d.toISOString().split("T")[0];
  });

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const fetchPromoCodes = async () => {
    const { data } = await supabase
      .from("promo_codes" as any)
      .select("*")
      .order("created_at", { ascending: false });
    setPromoCodes((data as PromoCode[]) || []);
    setLoading(false);
  };

  const generateCode = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const code = "ALFASL" + Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    setNewCode(code);
  };

  const createPromoCode = async () => {
    if (!newCode.trim() || !expiryDate) {
      toast.error("Veuillez remplir tous les champs");
      return;
    }
    setCreating(true);
    const { error } = await supabase.from("promo_codes" as any).insert({
      code: newCode.toUpperCase(),
      discount_percentage: discount,
      usage_limit: limit,
      expiry_date: expiryDate,
    });

    if (error) {
      toast.error(error.code === "23505" ? "Ce code existe déjà" : "Erreur lors de la création");
    } else {
      toast.success(`Code ${newCode.toUpperCase()} créé !`);
      setNewCode("");
      fetchPromoCodes();
    }
    setCreating(false);
  };

  const togglePromoCode = async (id: string, active: boolean) => {
    await supabase.from("promo_codes" as any).update({ active: !active }).eq("id", id);
    setPromoCodes((prev) => prev.map((p) => p.id === id ? { ...p, active: !active } : p));
  };

  const deletePromoCode = async (id: string, code: string) => {
    if (!confirm(`Supprimer le code "${code}" ?`)) return;
    await supabase.from("promo_codes" as any).delete().eq("id", id);
    setPromoCodes((prev) => prev.filter((p) => p.id !== id));
    toast.success("Code supprimé");
  };

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`"${code}" copié !`);
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  if (loading) return <div className="p-8 text-center text-muted-foreground">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Create Form */}
      <div className="p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-4">Créer un code promo</h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-3">
          <div className="flex gap-2">
            <Input
              placeholder="Code (ex: ALFASL30)"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value.toUpperCase())}
              className="font-mono uppercase"
            />
            <Button type="button" variant="outline" onClick={generateCode} className="shrink-0">Auto</Button>
          </div>
          <Input
            type="number"
            placeholder="Réduction %"
            value={discount}
            onChange={(e) => setDiscount(Number(e.target.value))}
            min={1}
            max={100}
          />
        </div>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <Input
            type="number"
            placeholder="Limite d'utilisation"
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            min={1}
          />
          <Input
            type="date"
            value={expiryDate}
            onChange={(e) => setExpiryDate(e.target.value)}
          />
        </div>
        <Button onClick={createPromoCode} disabled={creating} className="w-full gap-2">
          <Plus className="h-4 w-4" />
          {creating ? "Création..." : "Créer le code promo"}
        </Button>
      </div>

      {/* List */}
      <div className="space-y-3">
        <h3 className="font-semibold">{promoCodes.length} code{promoCodes.length !== 1 ? "s" : ""}</h3>
        {promoCodes.length === 0 && (
          <p className="text-sm text-muted-foreground">Aucun code promo pour l'instant</p>
        )}
        {promoCodes.map((promo, i) => {
          const expired = isExpired(promo.expiry_date);
          const usagePct = Math.round((promo.usage_count / promo.usage_limit) * 100);
          return (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center gap-3"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-mono font-bold text-sm">{promo.code}</p>
                  <Badge variant={promo.active && !expired ? "default" : "secondary"} className="text-[10px]">
                    {expired ? "Expiré" : promo.active ? "Actif" : "Inactif"}
                  </Badge>
                  <Badge variant="outline" className="text-[10px]">{promo.discount_percentage}%</Badge>
                </div>
                <div className="text-xs text-muted-foreground space-x-3">
                  <span>{promo.usage_count}/{promo.usage_limit} utilisations ({usagePct}%)</span>
                  <span>Expire le {new Date(promo.expiry_date).toLocaleDateString("fr-FR")}</span>
                </div>
                {/* Usage bar */}
                <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden w-full max-w-xs">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${Math.min(usagePct, 100)}%` }}
                  />
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="outline" onClick={() => copyCode(promo.code)}>
                  <Copy className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePromoCode(promo.id, promo.active)}
                >
                  {promo.active ? <XCircle className="h-3 w-3" /> : <CheckCircle className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => deletePromoCode(promo.id, promo.code)}
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
