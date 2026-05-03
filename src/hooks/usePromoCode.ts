import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface PromoResult {
  valid: boolean;
  discount: number;
  codeId: string | null;
  message: string;
}

export function usePromoCode() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PromoResult | null>(null);

  const validate = async (code: string): Promise<PromoResult> => {
    if (!code.trim()) {
      const r: PromoResult = { valid: false, discount: 0, codeId: null, message: "" };
      setResult(r);
      return r;
    }

    setLoading(true);
    try {
      const { data } = await supabase
        .from("promo_codes" as any)
        .select("id, discount_percentage, usage_count, usage_limit, expiry_date, active")
        .eq("code", code.toUpperCase().trim())
        .maybeSingle();

      if (!data) {
        const r: PromoResult = { valid: false, discount: 0, codeId: null, message: "Code invalide" };
        setResult(r);
        return r;
      }

      if (!data.active) {
        const r: PromoResult = { valid: false, discount: 0, codeId: null, message: "Ce code n'est plus actif" };
        setResult(r);
        return r;
      }

      if (new Date(data.expiry_date) < new Date()) {
        const r: PromoResult = { valid: false, discount: 0, codeId: null, message: "Ce code a expiré" };
        setResult(r);
        return r;
      }

      if (data.usage_count >= data.usage_limit) {
        const r: PromoResult = { valid: false, discount: 0, codeId: null, message: "Ce code a atteint sa limite d'utilisation" };
        setResult(r);
        return r;
      }

      const r: PromoResult = {
        valid: true,
        discount: data.discount_percentage,
        codeId: data.id,
        message: `${data.discount_percentage}% de réduction appliquée !`,
      };
      setResult(r);
      return r;
    } finally {
      setLoading(false);
    }
  };

  const clear = () => setResult(null);

  return { validate, clear, loading, result };
}
