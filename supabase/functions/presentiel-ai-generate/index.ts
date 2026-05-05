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
    const { photo_url, photo_urls, additional_photo_urls, theme, level, mode } = body || {};

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY manquant");

    // ── MODE: dictation_only — extraire des mots de dictée depuis des leçons précédentes ──
    if (mode === "dictation_only") {
      const urls: string[] = Array.isArray(photo_urls)
        ? photo_urls
        : photo_url ? [photo_url] : [];
      if (urls.length === 0) {
        return new Response(JSON.stringify({ error: "Au moins une photo requise" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const systemPrompt = `Tu es un professeur d'arabe expert. Tu extrais du vocabulaire arabe de pages de manuel scolaire.
RÈGLES ABSOLUES :
- Chaque mot extrait DOIT avoir ses harakat complets (fatha, kasra, damma, sukun, shadda, tanwin).
- Uniquement des mots isolés — jamais de phrases.
- Varie les types de mots : noms, verbes, adjectifs.
- Si les harakat sont absents sur la photo, tu les ajoutes correctement selon les règles de la langue arabe classique.`;

      const userContent: any[] = [
        {
          type: "text",
          text: `Voici ${urls.length} photo(s) de leçons d'arabe précédentes.
Extrais entre 10 et 15 mots de vocabulaire arabes bien vocalisés (avec harakat complets) de ces pages.
Ces mots seront utilisés pour une dictée de révision : choisis les mots les plus représentatifs et utiles.`,
        },
        ...urls.map((url) => ({ type: "image_url", image_url: { url } })),
      ];

      const dictationTool = [{
        type: "function",
        function: {
          name: "extract_dictation_words",
          description: "Extraire les mots de dictée vocalisés depuis les photos de leçons précédentes",
          parameters: {
            type: "object",
            properties: {
              dictation_words: {
                type: "array",
                items: { type: "string" },
                description: "Liste de mots arabes avec harakat complets pour la dictée",
              },
            },
            required: ["dictation_words"],
          },
        },
      }];

      const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-pro",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
          tools: dictationTool,
          tool_choice: { type: "function", function: { name: "extract_dictation_words" } },
        }),
      });

      if (!aiRes.ok) {
        const t = await aiRes.text();
        console.error("AI error (dictation_only)", aiRes.status, t);
        if (aiRes.status === 429) return new Response(JSON.stringify({ error: "Limite de requêtes atteinte, réessayez dans un instant." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (aiRes.status === 402) return new Response(JSON.stringify({ error: "Crédits IA épuisés, ajoutez des crédits dans Lovable." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        return new Response(JSON.stringify({ error: "Erreur IA" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const data = await aiRes.json();
      const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
      if (!toolCall) throw new Error("Aucun tool_call dans la réponse IA");
      const result = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify({ dictation_words: result.dictation_words || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // ── MODE: génération complète du cours ──
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
    ? "4 à 5 questions de compréhension EN ARABE avec leurs réponses courtes tirées du texte (réponse = segment exact du texte, 2-5 mots), et 3 phrases de la leçon à remettre en ordre (correct_order)"
    : "2 à 3 questions de compréhension simples EN ARABE avec leurs réponses courtes tirées du texte (réponse = segment exact du texte, 2-4 mots maximum). PAS de remise en ordre pour Niveau 1."}.
- Le champ lesson_text DOIT être le texte arabe complet de la leçon avec harakat.
- Les réponses de compréhension doivent être des extraits EXACTS et COURTS du texte (jamais de phrases complètes, toujours des groupes de mots reconnaissables dans le texte).`;

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

    const userContent: any[] = [];
    const extraUrls: string[] = Array.isArray(additional_photo_urls) ? additional_photo_urls.filter((u: any) => typeof u === "string" && u) : [];
    if (photo_url) {
      const totalPages = 1 + extraUrls.length;
      userContent.push({
        type: "text",
        text: `Voici ${totalPages > 1 ? `${totalPages} photos` : "la photo"} d'une leçon d'arabe ${isN2 ? "Niveau 2 (intermédiaire)" : "Niveau 1 (débutant)"}${totalPages > 1 ? ` (page principale + ${extraUrls.length} page(s) additionnelle(s), dans l'ordre)` : ""}.
1) Extrais FIDÈLEMENT tout le texte arabe visible sur ${totalPages > 1 ? "TOUTES les pages, dans l'ordre" : "la page"} (avec harakat complets, ajoute-les si absents).
2) Génère ensuite le cours complet (titre, vocabulaire, dictée${isN2 ? ", compréhension, remise en ordre" : ""}) basé sur l'ENSEMBLE du texte extrait${totalPages > 1 ? " (toutes les pages combinées, pas seulement la première)" : ""}.
N'invente rien : le lesson_text doit refléter exactement ce qui est sur ${totalPages > 1 ? "les photos" : "la photo"}.`,
      });
      userContent.push({ type: "image_url", image_url: { url: photo_url } });
      for (const url of extraUrls) {
        userContent.push({ type: "image_url", image_url: { url } });
      }
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
