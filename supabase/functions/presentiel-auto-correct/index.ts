// Correction IA automatique des photos d'élèves (écriture et dictée)
// Utilise Gemini 2.5 Pro vision via Lovable AI Gateway
// Input:  { photo_url, step_type: "ecriture"|"dictee", lesson_text?, dictation_words? }
// Output: { score_label, score_num, total_num, feedback, suggestions }

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const body = await req.json();
    const { photo_url, step_type, lesson_text, dictation_words } = body as {
      photo_url: string;
      step_type: "ecriture" | "dictee";
      lesson_text?: string;
      dictation_words?: string[];
    };

    if (!photo_url || !step_type) {
      return json({ error: "photo_url et step_type requis" }, 400);
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return json({ error: "LOVABLE_API_KEY manquant" }, 500);
    }

    const isDictee = step_type === "dictee";

    const systemPrompt = isDictee
      ? `Tu es un professeur d'arabe expert qui corrige une DICTÉE d'élève.
Les mots attendus (dans l'ordre) sont : ${(dictation_words || []).join(" ، ")}.

Analyse la photo de la dictée écrite par l'élève et :
1. Identifie chaque mot écrit par l'élève
2. Compare avec les mots attendus
3. Note les erreurs : lettres manquantes, harakat incorrects, confusion de lettres similaires
4. Donne un score (mots correctement écrits / total)

Réponds UNIQUEMENT en JSON strict :
{
  "score_num": <nombre entier de mots corrects>,
  "total_num": <nombre total de mots>,
  "score_label": "<score_num>/<total_num>",
  "feedback": "<commentaire bienveillant en français, max 3 phrases>",
  "suggestions": ["<amélioration 1>", "<amélioration 2>"],
  "word_results": [{"word_expected": "...", "word_written": "...", "correct": true/false, "note": "..."}]
}`
      : `Tu es un professeur d'arabe expert qui corrige un EXERCICE D'ÉCRITURE d'élève.
Le texte attendu est : ${lesson_text || ""}

L'élève devait recopier ce texte arabe 3 fois.

Analyse la photo et :
1. Vérifie la lisibilité de l'écriture
2. Repère les lettres mal formées, les harakat manquants/incorrects, les mots illisibles
3. Évalue le soin apporté (présentation, régularité)

Réponds UNIQUEMENT en JSON strict :
{
  "score_num": <note entière sur 10>,
  "total_num": 10,
  "score_label": "<score_num>/10",
  "feedback": "<commentaire bienveillant en français, max 3 phrases>",
  "suggestions": ["<amélioration 1>", "<amélioration 2>", "<amélioration 3>"],
  "quality": "<excellent|bien|passable|à_revoir>"
}`;

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
          {
            role: "user",
            content: [
              {
                type: "text",
                text: isDictee
                  ? "Voici la photo de la dictée de l'élève. Corrige-la."
                  : "Voici la photo de l'exercice d'écriture de l'élève. Corrige-la.",
              },
              { type: "image_url", image_url: { url: photo_url } },
            ],
          },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI error", aiRes.status, t.slice(0, 300));
      if (aiRes.status === 429) return json({ error: "Limite de requêtes — réessayez dans 30s" }, 429);
      if (aiRes.status === 402) return json({ error: "Crédits IA épuisés" }, 402);
      return json({ error: `Erreur IA ${aiRes.status}` }, 500);
    }

    const data = await aiRes.json();
    const raw = data.choices?.[0]?.message?.content ?? "{}";
    let parsed: Record<string, unknown>;
    try {
      parsed = typeof raw === "string" ? JSON.parse(raw) : raw;
    } catch {
      return json({ error: "Réponse IA invalide" }, 500);
    }

    return json({ ok: true, ...parsed });
  } catch (e) {
    console.error("presentiel-auto-correct error:", e);
    return json({ error: e instanceof Error ? e.message : "Erreur inconnue" }, 500);
  }
});
