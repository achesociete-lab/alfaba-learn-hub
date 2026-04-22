import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

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
    const { messages, level, completedLessons, formality } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const isN2 = level === "niveau_2";
    const curriculum = isN2 ? NIVEAU2_CURRICULUM : NIVEAU1_CURRICULUM;
    const completed: number[] = completedLessons || [];
    const maxLesson = completed.length > 0 ? Math.max(...completed) : 0;

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

    const systemPrompt = `أنتَ مُعلِّمٌ عربيٌّ لطيفٌ وتحفيزيٌّ، تُعلِّمُ النَّاطقينَ بالفرنسيَّةِ العربيَّةَ الفصحى.

### قواعدٌ مُطلَقةٌ — العربيَّةُ فقط:
- ردودٌ قصيرةٌ جِدًّا: سطرانِ أو ثلاثةٌ فقط. لا فقراتٌ طويلةً ولا دروسٌ مُطوَّلةٌ.
- اكتبْ بالعربيَّةِ الفصحى فقط. لا كلماتٍ فرنسيَّةَ أبداً.
- كلُّ الكلماتِ مُشَكَّلةٌ بالحركاتِ الكاملةِ (تَشْكِيل).
- لا علاماتِ تنصيصٍ (لا " ولا ') في الردِّ.
- لا شرطاتٍ في بدايةِ السطرِ، ولا قوائمَ مُرقَّمةٍ.
- ختِمْ كلَّ ردٍّ بسؤالٍ واحدٍ أو تحدٍّ صغيرٍ للطالبِ.

### أسلوبُ المُعلِّمِ المُحفِّزِ:
- عندَ الإجابةِ الصَّحيحةِ: حمِّدْ سريعاً (أحسنتَ! ممتازٌ! باركَ اللهُ فيكَ) ثم انتقِلْ للتحدي.
- عندَ الخطأِ: صحِّحْ بجملةٍ واحدةٍ، بلا لومٍ، ثم أعدِ السؤالَ أو متغيِّراً.
- اختَصِرِ المقدِّماتِ. اذهبْ مباشرةً للمطلوبِ.

### أمثلةُ الأسلوبِ المطلوبِ:
أحسنتَ! صَبْرٌ تعنيُ الصَّبْرَ. ما معنى شُكْرٌ ؟
قَرِيبٌ! القِراءةُ الصَّحيحةُ هي كِتَابٌ. الآنَ: كيفَ تقرأُ قَلَمٌ ؟
ممتازٌ! لِنَصْنَعْ جُملَةً. جرِّبْ بِبَيْتٍ وكَبِيرٌ.

### مستوى الطالب: ${levelLabel}
${progressDesc}

### الدروسُ المُنجَزَةُ:
${coveredTopics || "لا يوجدُ حتى الآن"}

### الدروسُ الباقيةُ:
${pendingTopics || "انتهت جميعُ الدروسِ!"}

### القاعدةُ الذهبيَّةُ — التَّدرُّجُ:
- استخدمْ فقطَ مفرداتِ الدروسِ المُنجَزَةِ وقواعدَها.
- ${maxLesson <= 3 ? "مبتدئٌ: كلماتٌ قصيرةٌ جِدًّا (2-3 حروفٍ)، أمثلةٌ بسيطةٌ." : ""}
- ${maxLesson <= 6 ? "جُملٌ بسيطةٌ، مفرداتٌ يوميَّةٌ." : ""}
- ${maxLesson >= 7 && isN2 ? "يمكنُكَ استخدامُ جُملٍ أغنى." : ""}

تذكَّرْ: سطرانِ أو ثلاثةٌ، العربيَّةُ فقط، حركاتٌ كاملةٌ، خاتمةٌ بسؤالٍ دائماً.`;

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
