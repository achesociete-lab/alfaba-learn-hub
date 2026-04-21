// OCR + génération QCM/traduction/dictée à partir d'une photo de cours arabe
// Utilise Lovable AI Gateway (Gemini 2.5 Pro) pour la vision

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { imageUrl, title } = await req.json()
    if (!imageUrl) {
      return json({ error: 'imageUrl required' }, 400)
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY')
    if (!apiKey) return json({ error: 'LOVABLE_API_KEY missing' }, 500)

    const systemPrompt = `Tu es un professeur d'arabe expert. À partir d'une PHOTO de cours d'arabe, tu dois :
1. Lire le texte arabe visible (vocalisé ou non)
2. Générer un QCM de 10 questions de compréhension/grammaire (4 choix chacun, une seule bonne réponse, basé STRICTEMENT sur le contenu de la photo)
3. Fournir une traduction française complète et naturelle du texte
4. Créer un exercice de dictée : sélectionner 5 phrases-clés du cours

Réponds UNIQUEMENT en JSON strict, sans markdown, sans \`\`\`, structure exacte :
{
  "ocr_text": "texte arabe complet extrait avec harakat si possible",
  "qcm": [{"question":"...","choices":["a","b","c","d"],"correct":0,"explanation":"..."}, ... 10 entries],
  "translation": {"arabic":"texte arabe complet","french":"traduction complète"},
  "dictation": {"sentences":[{"arabic":"phrase1","french":"trad1"}, ... 5 entries]}
}`

    const userText = title
      ? `Titre du cours : ${title}\n\nAnalyse cette photo de cours d'arabe et génère le contenu pédagogique demandé.`
      : `Analyse cette photo de cours d'arabe et génère le contenu pédagogique demandé.`

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          { role: 'system', content: systemPrompt },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              { type: 'image_url', image_url: { url: imageUrl } },
            ],
          },
        ],
        response_format: { type: 'json_object' },
      }),
    })

    if (response.status === 429) return json({ error: 'Rate limit, réessayez dans 30s' }, 429)
    if (response.status === 402) return json({ error: 'Crédits IA épuisés' }, 402)
    if (!response.ok) {
      const text = await response.text()
      console.error('AI gateway error', response.status, text)
      return json({ error: `IA gateway: ${response.status}` }, 500)
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content ?? '{}'
    let parsed: any
    try {
      parsed = typeof raw === 'string' ? JSON.parse(raw) : raw
    } catch (e) {
      console.error('Parse error', raw)
      return json({ error: 'Réponse IA invalide' }, 500)
    }

    return json({ ok: true, ...parsed })
  } catch (err) {
    console.error('presentiel-generate error', err)
    return json({ error: String(err) }, 500)
  }
})

function json(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
