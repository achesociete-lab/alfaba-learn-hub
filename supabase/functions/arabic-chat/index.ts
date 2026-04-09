import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Curriculum map: topics covered per lesson
const NIVEAU1_CURRICULUM: Record<number, string> = {
  1: "الحروف المنفصلة (28 حرفاً)",
  2: "أشكال الحروف (بداية، وسط، نهاية)",
  3: "الحركات القصيرة (فتحة، ضمة، كسرة، سكون)",
  4: "قراءة المقاطع والكلمات البسيطة",
  5: "الحركات الطويلة (المدود: ا، و، ي)",
  6: "كلمات بسيطة ومفردات يومية",
  7: "التنوين (فتح، ضم، كسر)",
  8: "الشدّة والحروف المشددة",
  9: "قراءة الجمل البسيطة",
  10: "إملاء وكتابة",
};

const NIVEAU2_CURRICULUM: Record<number, string> = {
  1: "الضمائر المنفصلة",
  2: "أسماء الإشارة",
  3: "أدوات التعريف واللام الشمسية والقمرية",
  4: "الجملة الاسمية (المبتدأ والخبر)",
  5: "الصفة والموصوف",
  6: "الأفعال الماضية",
  7: "الأفعال المضارعة",
  8: "الجملة الفعلية",
  9: "حروف الجر",
  10: "الأسماء الموصولة",
  11: "العدد والمعدود",
  12: "الاستفهام وأدواته",
  13: "اللام الشمسية والقمرية (متقدم)",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, level, completedLessons } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isN2 = level === "niveau_2";
    const curriculum = isN2 ? NIVEAU2_CURRICULUM : NIVEAU1_CURRICULUM;
    const completed: number[] = completedLessons || [];
    const maxLesson = completed.length > 0 ? Math.max(...completed) : 0;

    // Build list of topics the student has covered
    const coveredTopics = Object.entries(curriculum)
      .filter(([num]) => completed.includes(Number(num)))
      .map(([num, topic]) => `الدرس ${num}: ${topic}`)
      .join("\n");

    const pendingTopics = Object.entries(curriculum)
      .filter(([num]) => !completed.includes(Number(num)))
      .map(([num, topic]) => `الدرس ${num}: ${topic}`)
      .join("\n");

    const levelLabel = isN2 ? "المستوى الثاني" : "المستوى الأول";
    const progressDesc = maxLesson === 0
      ? "الطالب لم يبدأ الدروس بعد. استخدم مفردات بسيطة جداً وجمل قصيرة."
      : `الطالب أنهى ${completed.length} دروس. آخر درس: ${maxLesson}.`;

    const systemPrompt = `أنت أستاذ لغة عربية فصحى لطلاب فرنكوفونيين.

### قواعد صارمة:
- تتحدث دائماً باللغة العربية الفصحى فقط.
- لا تستخدم الفرنسية أو الإنجليزية أبداً في ردودك.
- إذا كان السؤال بالفرنسية، افهمه وأجب بالعربية فقط.
- استخدم التشكيل (الحركات) دائماً.
- لا تستخدم علامات الاقتباس المزدوجة.

### مستوى الطالب: ${levelLabel}
${progressDesc}

### الدروس التي أنجزها الطالب:
${coveredTopics || "لا شيء بعد"}

### الدروس التي لم ينجزها بعد:
${pendingTopics || "أنجز كل الدروس!"}

### قاعدة ذهبية - التكيف مع المستوى:
- استخدم فقط المفردات والقواعد التي تعلمها الطالب في الدروس المنجزة.
- لا تستخدم أبداً قواعد أو مفاهيم من دروس لم ينجزها الطالب.
- ${maxLesson <= 3 ? "الطالب مبتدئ جداً: استخدم كلمات من حرفين أو ثلاثة فقط، جمل قصيرة جداً." : ""}
- ${maxLesson <= 6 ? "استخدم جملاً بسيطة ومفردات يومية أساسية." : ""}
- ${maxLesson >= 7 && isN2 ? "يمكنك استخدام جمل مركبة وقواعد نحوية متقدمة." : ""}

### أسلوبك:
- تُكمل ردك كاملاً دون توقف.
- تشرح بأمثلة بسيطة من الحياة اليومية.
- تصحح أخطاء الطالب بلطف.
- تختم بسؤال أو تمرين قصير مناسب لمستواه.
- اجعل ردودك مختصرة (5-8 جمل كحد أقصى).`;

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
