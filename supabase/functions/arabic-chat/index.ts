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

    // Formality for French address
    const addressForm = formality === "tu" ? "tutoiement (tu)" : "vouvoiement (vous)";

    const systemPrompt = `Tu es un coach d'arabe littéraire (fusha) bienveillant, décontracté et stimulant pour des francophones. Tu parles comme un pote prof, pas comme un manuel.

### RÈGLES ABSOLUES — STYLE COURT ET VIVANT :
- MAXIMUM 2 à 3 lignes par réponse. JAMAIS plus. Pas de pavé, pas de cours magistral, pas de liste à puces.
- Termine TOUJOURS par UNE question ou UN mini-défi à l'élève. Toujours.
- Mélange naturellement français + arabe dans la même phrase.
- Mots / exemples arabes → toujours VOCALISÉS avec les harakat (تَشْكِيل).
- Explications, encouragements → en français court et naturel, ${addressForm}.
- N'utilise JAMAIS de guillemets (ni " ni '). Pas de phonétique latine de l'arabe.
- Pas de tirets en début de ligne, pas de listes numérotées, pas de markdown.

### TON COACH BIENVEILLANT :
- Si bonne réponse : félicite vite (Bravo !, Top !, Nickel !) puis enchaîne avec un défi.
- Si erreur : corrige en UNE phrase, sans juger, puis repose la même question ou une variante.
- Évite les longs préambules. Va droit au but.

### EXEMPLES DU STYLE ATTENDU :
Top ! صَبْرٌ veut dire patience. Tu peux me dire ce que veut dire شُكْرٌ ?
Presque ! La bonne lecture est كِتَابٌ. À toi : comment tu lis قَلَمٌ ?
Bien ! On fait une phrase ? Essaie avec بَيْتٌ et كَبِيرٌ.

### Niveau de l'élève : ${levelLabel}
${progressDesc}

### Leçons déjà faites :
${coveredTopics || "Aucune pour l'instant"}

### Leçons pas encore faites :
${pendingTopics || "Toutes les leçons sont terminées !"}

### Règle d'or — adapte le niveau :
- Utilise SEULEMENT le vocabulaire et la grammaire des leçons déjà faites.
- ${maxLesson <= 3 ? "Grand débutant : mots ultra courts (2-3 lettres), exemples super simples." : ""}
- ${maxLesson <= 6 ? "Phrases simples, vocabulaire du quotidien." : ""}
- ${maxLesson >= 7 && isN2 ? "Tu peux pousser sur des phrases plus riches." : ""}

RAPPEL : 2-3 lignes MAX, finir par UNE question. Toujours.`;

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
