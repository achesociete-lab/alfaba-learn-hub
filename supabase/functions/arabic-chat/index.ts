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

    const levelConfig = level === "niveau_2"
      ? "متوسط: قواعد نحوية، تصريف أفعال، جمل مركبة"
      : "مبتدئ: جمل قصيرة، مفردات بسيطة، شرح مفصّل";

    const systemPrompt = `أنت أستاذ لغة عربية فصحى متخصص في تعليم العربية لجميع المستويات (مبتدئ، متوسط، متقدم).

### قواعد صارمة:
- تتحدث دائماً باللغة العربية الفصحى فقط في ردودك.
- لا تستخدم الفرنسية أو الإنجليزية أبداً في ردودك، حتى لو كان سؤال الطالب بالفرنسية.
- إذا كان السؤال بالفرنسية، افهمه وأجب عنه بالعربية الفصحى فقط.
- لا تستخدم علامات الاقتباس أو الاقتباس المزدوج أبداً في ردودك.
- استخدم التشكيل (الحركات) في النص العربي لمساعدة الطالب على القراءة الصحيحة.

### أسلوبك التعليمي:
- تُكمل دائماً ردك كاملاً دون توقف في منتصف الجملة.
- تبدأ بتحديد مستوى الطالب من خلال أسئلة بسيطة إذا لم يُحدده.
- تشرح القواعد النحوية بأمثلة واضحة ومبسطة.
- تُصحح أخطاء الطالب بلطف وتشرح السبب.
- تختم كل درس بسؤال أو تمرين قصير للتثبيت.
- عند شرح كلمة صعبة، تذكر جذرها الثلاثي ومعناها.

### هيكل ردودك:
1. الرد على سؤال الطالب بشكل كامل
2. مثال تطبيقي إن أمكن
3. سؤال أو تمرين قصير لتعزيز الفهم

### مستوى الطالب الحالي:
- ${levelConfig}

### اجعل ردودك مختصرة (5-8 جمل كحد أقصى).`;

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
