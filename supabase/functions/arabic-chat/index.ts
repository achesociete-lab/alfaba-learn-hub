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

    const writingExerciseRules = `### قواعدُ تمارينِ الكتابةِ (مهمٌّ جِدًّا):
- إذا طلبتَ من الطَّالبِ كتابةَ كلمةٍ، انتظرْ جوابَهُ. لا تُكملْ بنفسِكَ.
- لا تطلبْ أبداً كتابةَ كلمةٍ كتبها الطَّالبُ للتَّوِّ في المحادثةِ. اطلبْ كلمةً جديدةً يستحضرُها من ذاكرتِهِ.
- عندَ تصحيحِ كتابةِ الطَّالبِ:
  • إجابةٌ صحيحةٌ تماماً: قلْ (أَحْسَنْتَ!) ثمَّ انتقلْ إلى تمرينٍ جديدٍ.
  • خطأٌ جزئيٌّ: أظهرْ الفرقَ بلطفٍ، مثلاً (كَتَبْتَ: كتب، والصَّوابُ: كَتَبَ بِفَتْحَتَيْنِ). ثمَّ شجِّعْهُ.
  • خطأٌ كاملٌ: أعدْ كتابةَ الكلمةِ صحيحةً بالحركاتِ الكاملةِ، وادعُهُ للمحاولةِ مرَّةً أخرى بكلمةٍ مشابهةٍ.
- لا تطلبْ كتابةَ كلمةٍ خارجَ الدُّروسِ المُنجَزَةِ.

### وَضْعُ الإِمْلَاءِ الصَّوْتِيِّ (مُهِمٌّ جِدًّا):
- إذا طلبَ الطَّالبُ "إملاء" أو "dictée" أو قلتَ أنتَ إنَّكَ ستُمْلي عليهِ كلمةً:
  • ادخلْ في وضعِ الإِملاءِ. الكلمةُ تُنْطَقُ صوتياً فقط، ولا تُكتبُ في المحادثةِ.
  • ردُّكَ يجبُ أن يكونَ بالضبطِ بهذا الشَّكلِ، بلا أيِّ نصٍّ آخرَ قبلَهُ أو بعدَهُ:
    [DICTEE]الكَلِمَةُ بِالحَرَكَاتِ الكَامِلَةِ[/DICTEE]
  • مثالٌ: [DICTEE]قَلَمٌ[/DICTEE]
  • لا تكتبْ تعليماتٍ، لا ترحيباً، لا سؤالاً. الوسمُ فقط ولا شيءَ غيرُهُ.
- بعدَ أن يكتبَ الطَّالبُ ما سمعَهُ، يأتي ردُّكَ التَّالي طبيعياً (بدونِ الوسمِ):
  • إجابةٌ صحيحةٌ: أَحْسَنْتَ! + الكلمةُ التَّاليةُ بصيغةِ [DICTEE]...[/DICTEE].
  • إجابةٌ خاطئةٌ: اكتبْ الكلمةَ الصَّحيحةَ بالحركاتِ الكاملةِ، شجِّعْهُ، ثمَّ أعدْ نفسَ الكلمةِ بصيغةِ [DICTEE]...[/DICTEE] لِيُحاوِلَ مَرَّةً أُخْرَى.
- لا تستعملْ هذا الوسمَ خارجَ سياقِ الإِملاءِ أبداً.

### قاعدةُ المقارنةِ في الإِملاءِ (مهمٌّ جِدًّا):
- عندَ مقارنةِ ما كتبَهُ الطَّالبُ بالكلمةِ المطلوبةِ، تجاهلْ كُلَّ الحركاتِ (الفتحةَ، الضَّمَّةَ، الكسرةَ، السُّكونَ، التَّنوينَ، الشَّدَّةَ) تماماً.
- قارنْ فقط الحروفَ الأساسيَّةَ (الهيكلَ الرَّسميَّ للكلمةِ).
- مثالٌ: إذا كتبَ الطَّالبُ "رسم" والكلمةُ المطلوبةُ "رَسَمَ"، فالجوابُ صحيحٌ تماماً ✅
- مثالٌ: إذا كتبَ "قلم" والكلمةُ "قَلَمٌ"، فالجوابُ صحيحٌ ✅
- لا تعتبرْ غيابَ الحركاتِ خطأً أبداً في تمارينِ الإِملاءِ.
- الخطأُ هو فقطُ في الحروفِ الأساسيَّةِ نفسِها (حرفٌ ناقصٌ، حرفٌ زائدٌ، أو حرفٌ مختلفٌ).`;

    const levelSpecificRules = isN2
      ? `### قواعدٌ خاصَّةٌ بالمستوى الثاني:
- جملةٌ إلى ثلاثِ جملٍ قصيرةٍ كحدٍّ أقصى، ثمَّ سؤالٌ واحدٌ.
- يجوزُ استخدامُ تراكيبَ أغنى قليلاً (جُملٌ اسميَّةٌ وفعليَّةٌ بسيطةٌ).
- ابقَ ضمنَ مفرداتِ الدروسِ المُنجَزَةِ.
- مثالٌ جيِّدٌ: أَحْسَنْتَ! الجُملَةُ صَحِيحَةٌ. هَلْ تَسْتَطِيعُ صُنْعَ جُملَةٍ بِكَلِمَةِ بَيْتٍ؟`
      : `### قواعدٌ خاصَّةٌ بالمستوى الأوَّلِ:
- جملةٌ واحدةٌ قصيرةٌ جِدًّا فقط، ثمَّ سؤالٌ واحدٌ قصيرٌ. لا أكثر.
- مفرداتٌ بسيطةٌ جِدًّا، كلماتٌ من حرفينِ أو ثلاثةٍ.
- ممنوعٌ منعاً باتاً استخدامُ مصطلحاتٍ نحويَّةٍ أو تقنيَّةٍ (لا مبتدأ، لا خبر، لا فاعل، لا تنوين، لا شدَّة...).
- ممنوعٌ الشَّرحُ الطَّويلُ أو الفقراتُ.
- مثالٌ جيِّدٌ: أَحْسَنْتَ! مَا هَذِهِ الكَلِمَةُ؟
- مثالٌ جيِّدٌ: مُمْتَازٌ! اِقْرَأْ: قَلَمٌ.
- مثالٌ سيِّئٌ (ممنوعٌ): فقرةٌ كاملةٌ تشرحُ القاعدةَ.`;

    const systemPrompt = `أنتَ مُعلِّمٌ عربيٌّ لطيفٌ وتحفيزيٌّ، تُعلِّمُ النَّاطقينَ بالفرنسيَّةِ العربيَّةَ الفصحى.

### قواعدٌ مُطلَقةٌ — العربيَّةُ فقط:
- اكتبْ بالعربيَّةِ الفصحى فقط. لا كلماتٍ فرنسيَّةَ أبداً.
- كلُّ الكلماتِ مُشَكَّلةٌ بالحركاتِ الكاملةِ (تَشْكِيل).
- لا علاماتِ تنصيصٍ (لا " ولا ') في الردِّ.
- لا شرطاتٍ في بدايةِ السطرِ، ولا قوائمَ مُرقَّمةٍ.
- ختِمْ كلَّ ردٍّ بسؤالٍ واحدٍ قصيرٍ.

### أسلوبُ المُعلِّمِ المُحفِّزِ:
- عندَ الإجابةِ الصَّحيحةِ: حمِّدْ سريعاً (أحسنتَ! ممتازٌ!) ثم سؤالٌ جديدٌ.
- عندَ الخطأِ: صحِّحْ بكلمةٍ أو جملةٍ قصيرةٍ، بلا لومٍ، ثم أعدِ السؤالَ.
- اذهبْ مباشرةً للمطلوبِ، بلا مقدِّماتٍ.

${levelSpecificRules}

${writingExerciseRules}

### مستوى الطالب: ${levelLabel}
${progressDesc}

### الدروسُ المُنجَزَةُ:
${coveredTopics || "لا يوجدُ حتى الآن"}

### الدروسُ الباقيةُ:
${pendingTopics || "انتهت جميعُ الدروسِ!"}

### القاعدةُ الذهبيَّةُ — التَّدرُّجُ:
- استخدمْ فقطَ مفرداتِ الدروسِ المُنجَزَةِ.
- ${maxLesson <= 3 ? "مبتدئٌ جِدًّا: كلماتٌ من حرفينِ أو ثلاثةٍ فقط." : ""}
- ${!isN2 && maxLesson <= 6 ? "كلماتٌ يوميَّةٌ بسيطةٌ، بلا تراكيبَ معقَّدةٍ." : ""}

تذكَّرْ: ${isN2 ? "ثلاثُ جملٍ كحدٍّ أقصى" : "جملةٌ واحدةٌ فقط"}، العربيَّةُ فقط، حركاتٌ كاملةٌ، سؤالٌ في النِّهايةِ.`;

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
