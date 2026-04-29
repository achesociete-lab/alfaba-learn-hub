// Génère un cours présentiel COMPLET à partir d'une photo de leçon (OCR + génération)
// ou à défaut à partir d'un thème. Utilise Gemini multimodal via Lovable AI Gateway.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { photo_url, theme, level } = body || {};
    if (!level) {
      return new Response(JSON.stringify({ error: "level requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!photo_url && !theme) {
      return new Response(JSON.stringify({ error: "photo_url ou theme requis" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY manquant");

    const isN2 = level === "niveau_2";

    const systemPrompt = `Tu es un professeur d'arabe expérimenté et un OCR expert pour textes arabes vocalisés.

RÈGLES STRICTES :
- TOUT le contenu arabe DOIT contenir les harakat complets (fatha, kasra, damma, sukun, shadda, tanwin).
- AUCUNE phonétique, AUCUNE translittération, AUCUNE parenthèse latine dans le contenu arabe.
- Si une photo est fournie : tu dois EXTRAIRE FIDÈLEMENT le texte arabe visible sur la page (sans rien inventer, sans rien retirer). Si les harakat sont absents sur la photo, tu les ajoutes correctement. Conserve l'ordre exact des phrases.
- À partir du texte extrait (ou du thème), tu génères ENSUITE :
  • un titre court en français résumant la leçon
  • un vocabulaire de 6 à 10 paires arabe/français tirées du texte
  • 8 à 12 mots de dictée tirés du texte
  • ${isN2
    ? "4 questions de compréhension EN ARABE avec leurs réponses, et 3 phrases de la leçon à remettre en ordre (correct_order)"
    : "PAS de compréhension ni de remise en ordre (Niveau 1)"}.
- Le champ lesson_text DOIT être le texte arabe complet de la leçon avec harakat.`;

    const tools = [{
      type: "function",
      function: {
        name: "create_presentiel_course",
        description: "Créer un cours présentiel complet à partir de la leçon",
        parameters: {
          type: "object",
          properties: {
            title: { type: "string", description: "Titre du cours en français" },
            lesson_text: { type: "string", description: "Texte arabe complet de la leçon, avec harakat" },
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

    // Construire le message utilisateur (multimodal si photo)
    const userContent: any[] = [];
    if (photo_url) {
      userContent.push({
        type: "text",
        text: `Voici la photo d'une page de leçon d'arabe ${isN2 ? "Niveau 2 (intermédiaire)" : "Niveau 1 (débutant)"}.
1) Extrais FIDÈLEMENT tout le texte arabe visible (avec harakat complets, ajoute-les si absents).
2) Génère ensuite le cours complet (titre, vocabulaire, dictée${isN2 ? ", compréhension, remise en ordre" : ""}) basé sur CE texte.
N'invente rien : le lesson_text doit refléter exactement ce qui est sur la photo.`,
      });
      userContent.push({ type: "image_url", image_url: { url: photo_url } });
    } else {
      userContent.push({
        type: "text",
        text: `Génère un cours d'arabe ${isN2 ? "Niveau 2" : "Niveau 1"} sur le thème : "${theme}".`,
      });
    }

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
          { role: "user", content: userContent },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "create_presentiel_course" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t);
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
