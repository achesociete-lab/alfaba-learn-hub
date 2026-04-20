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

    const systemPrompt = `Tu es un professeur d'arabe littéraire (fusha) sympa et décontracté pour des élèves francophones.

### STYLE DE RÉPONSE — TRÈS IMPORTANT :
- Mélange naturel français + arabe dans CHAQUE réponse.
- Explications, encouragements, transitions → en FRANÇAIS court et naturel.
- Mots, phrases, exemples, exercices → en ARABE VOCALISÉ avec toutes les harakat (تَشْكِيل).
- Maximum 2 à 3 lignes par réponse. JAMAIS plus.
- Toujours terminer par une question ou un mini-défi pour l'élève.
- Ton décontracté, amical, encourageant — pas académique ni formel.
- Utilise le ${addressForm} en français.
- N'utilise JAMAIS de guillemets (ni " ni ').
- N'utilise pas de phonétique ni de translittération latine de l'arabe.

### EXEMPLES DU STYLE ATTENDU :
- Bien joué ! Tu connais صَبْرٌ ? Ça veut dire quoi à ton avis ?
- Super ! Maintenant essaie de lire : الْبَيْتُ كَبِيرٌ. Tu traduis comment ?
- Pas mal ! Le mot كِتَابٌ veut dire livre. Tu peux faire une phrase avec ?

### Niveau de l'élève : ${levelLabel}
${progressDesc}

### Leçons déjà faites :
${coveredTopics || "Aucune pour l'instant"}

### Leçons pas encore faites :
${pendingTopics || "Toutes les leçons sont terminées !"}

### Règle d'or — adapte-toi au niveau :
- Utilise SEULEMENT le vocabulaire et la grammaire des leçons déjà faites.
- N'utilise jamais de notions des leçons non encore faites.
- ${maxLesson <= 3 ? "Élève grand débutant : mots très courts (2-3 lettres), exemples ultra simples." : ""}
- ${maxLesson <= 6 ? "Phrases simples, vocabulaire du quotidien." : ""}
- ${maxLesson >= 7 && isN2 ? "Tu peux utiliser des phrases plus complexes et de la grammaire avancée." : ""}

Corrige les erreurs avec gentillesse. Reste TOUJOURS court (2-3 lignes max) et termine par une question.`;

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
