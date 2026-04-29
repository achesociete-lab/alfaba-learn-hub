// Génère un cours présentiel complet à partir d'un thème + niveau via Lovable AI
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { theme, level } = await req.json();
    if (!theme || !level) {
      return new Response(JSON.stringify({ error: "theme et level requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY manquant");

    const isN2 = level === "niveau_2";

    const systemPrompt = `Tu es un professeur d'arabe expérimenté. Tu génères des leçons en arabe Fusha avec harakat (tashkeel) complets.
RÈGLES STRICTES:
- TOUT le contenu arabe DOIT contenir les harakat (fatha, kasra, damma, sukun, shadda).
- Pas de phonétique, pas de translittération.
- Vocabulaire: 6 à 10 paires arabe/français adaptées au thème.
- Mots de dictée: 8 à 12 mots issus de la leçon.
- Niveau 1: texte court (3-5 phrases simples).
- Niveau 2: texte plus long (6-10 phrases), questions de compréhension (4) et phrases à remettre en ordre (3).`;

    const tools = [{
      type: "function",
      function: {
        name: "create_presentiel_course",
        description: "Créer un cours présentiel complet",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titre du cours en français" },
            lesson_text: { type: "string", description: "Texte arabe avec harakat" },
            vocabulary: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  arabic: { type: "string" },
                  french: { type: "string" },
                },
                required: ["arabic", "french"],
              },
            },
            dictation_words: { type: "array", items: { type: "string" } },
            comprehension_questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  answer: { type: "string" },
                },
                required: ["question", "answer"],
              },
            },
            reorder_exercises: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  correct_order: { type: "array", items: { type: "string" } },
                },
                required: ["correct_order"],
              },
            },
          },
          required: ["title", "lesson_text", "vocabulary", "dictation_words"],
        },
      },
    }];

    const userPrompt = `Génère un cours d'arabe ${isN2 ? "Niveau 2 (intermédiaire)" : "Niveau 1 (débutant)"} sur le thème: "${theme}".
${isN2 ? "Inclure 4 questions de compréhension (en arabe) et 3 phrases à remettre en ordre." : "Pas de compréhension ni de remise en ordre (Niveau 1)."}`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "create_presentiel_course" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans un instant." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "Crédits IA épuisés, ajoutez des crédits dans Lovable." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error("AI error", aiRes.status, t);
      return new Response(JSON.stringify({ error: "Erreur IA" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("Aucun tool_call dans la réponse IA");
    const course = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify({ course }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("presentiel-ai-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Erreur inconnue" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
