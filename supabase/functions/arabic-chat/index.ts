import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, level } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `أنت معلم لغة عربية ودود وصبور. اسمك "أستاذ". مهمتك هي التحدث مع الطالب باللغة العربية لمساعدته على التدرب والتعلم.

القواعد:
- تحدث بالعربية الفصحى دائماً
- ${level === "niveau_2" ? "استخدم جملاً متوسطة التعقيد مناسبة للمستوى المتوسط" : "استخدم جملاً بسيطة وقصيرة مناسبة للمبتدئين"}
- بعد كل رد بالعربية، أضف ترجمة فرنسية مختصرة بين قوسين مربعين مثل: (Traduction: ...)
- صحّح أخطاء الطالب بلطف واشرح التصحيح بالفرنسية
- شجّع الطالب واستخدم عبارات تحفيزية
- اقترح مواضيع للمحادثة إذا توقف الطالب
- استخدم التشكيل (الحركات) في النص العربي لمساعدة الطالب على القراءة الصحيحة
- اجعل ردودك مختصرة (3-5 جمل كحد أقصى)
- لا تستخدم علامات الاقتباس أو الاقتباس المزدوج أبداً في ردودك`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Trop de requêtes, réessayez dans un instant." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Crédits insuffisants." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erreur du service IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("arabic-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
