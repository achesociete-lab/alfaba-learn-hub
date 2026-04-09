import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcription, expectedText, surahNumber, ayahStart, ayahEnd } = await req.json();

    if (!transcription?.trim() || !expectedText?.trim()) {
      return new Response(JSON.stringify({ error: 'Transcription and expected text are required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Tu es un professeur de Coran expert en tajwid qui corrige des élèves francophones.

Ton rôle :
1. ÉVALUE D'ABORD le niveau de l'élève (débutant, intermédiaire, avancé) en analysant sa récitation globale.
2. ADAPTE ta correction selon ce niveau :
   - Débutant : corrige les erreurs les plus graves (mots sautés, inversés, très mal prononcés). Sois encourageant.
   - Intermédiaire : corrige aussi les erreurs de prononciation des lettres (ث/س, ح/ه, ع/أ, ص/س, ض/د, ط/ت, ظ/ذ, ق/ك, etc.)
   - Avancé : corrige finement le tajwid (ghunna, idgham, ikhfa, madd, qalqala, etc.)

Règles :
- Réponds en français clair.
- Sois précis sur les erreurs de PRONONCIATION : indique la lettre mal prononcée et comment la prononcer correctement.
- Pour chaque erreur, donne le mot arabe concerné et une explication concrète de la correction.
- Identifie jusqu'à 5 erreurs, classées par importance.
- Le score doit refléter fidèlement la qualité : sois exigeant mais juste.
- Mentionne dans le feedback général le niveau estimé de l'élève.
- Les conseils de tajwid doivent être spécifiques aux erreurs détectées (pas génériques).
- Le message d'encouragement doit être adapté au niveau.

Réponds UNIQUEMENT avec un appel à la fonction evaluate_recitation.`;

    const userPrompt = `Sourate ${surahNumber}, versets ${ayahStart}-${ayahEnd}

Texte attendu (correct):
${expectedText}

Transcription de l'élève:
${transcription}

Évalue cette récitation.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'evaluate_recitation',
              description: 'Évalue une récitation coranique',
              parameters: {
                type: 'object',
                properties: {
                  estimatedLevel: { type: 'string', enum: ['débutant', 'intermédiaire', 'avancé'], description: 'Niveau estimé de l\'élève' },
                  score: { type: 'number', description: 'Score sur 100, exigeant et fidèle à la qualité réelle' },
                  overallFeedback: { type: 'string', description: 'Feedback général mentionnant le niveau estimé, en français' },
                  errors: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        word: { type: 'string', description: 'Le mot arabe concerné' },
                        type: { type: 'string', enum: ['missing', 'added', 'mispronounced', 'tajwid'] },
                        correction: { type: 'string', description: 'Explication précise : quelle lettre est mal prononcée et comment la corriger' },
                      },
                      required: ['word', 'type', 'correction'],
                    },
                    description: 'Jusqu\'à 5 erreurs classées par importance',
                  },
                  tajwidNotes: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Règles de tajwid spécifiques aux erreurs détectées',
                  },
                  encouragement: { type: 'string', description: 'Message encourageant adapté au niveau' },
                },
                required: ['estimatedLevel', 'score', 'overallFeedback', 'errors', 'tajwidNotes', 'encouragement'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'evaluate_recitation' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Trop de requêtes, veuillez réessayer dans un moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Crédits insuffisants.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error [${response.status}]`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      throw new Error('No evaluation result from AI');
    }

    const evaluation = JSON.parse(toolCall.function.arguments);

    return new Response(JSON.stringify(evaluation), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: unknown) {
    console.error('Evaluation error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
