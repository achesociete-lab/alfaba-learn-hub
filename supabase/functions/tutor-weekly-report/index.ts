// Cron job: every Sunday at 18:00 UTC, generates and emails weekly reports
// for Premium subscribers who had at least 1 tutor session this week.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

async function callAI(prompt: string) {
  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-pro",
      messages: [
        { role: "system", content: "Tu es un tuteur pédagogique. Réponds uniquement en JSON valide." },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) throw new Error(`AI ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return JSON.parse(data.choices[0].message.content);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    const now = new Date();
    const weekEnd = new Date(now);
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - 7);

    const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
    const fmtFr = (d: Date) => `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

    // Find premium users with at least one session this week
    const { data: premiumUsers } = await supabase
      .from("subscriptions")
      .select("user_id")
      .eq("status", "active")
      .eq("plan", "premium");

    const reports: any[] = [];

    for (const sub of premiumUsers || []) {
      const userId = sub.user_id;

      const { data: sessions } = await supabase
        .from("tutor_sessions")
        .select("score, summary, weak_points, strong_points")
        .eq("user_id", userId)
        .gte("started_at", weekStart.toISOString())
        .lte("started_at", weekEnd.toISOString())
        .not("ended_at", "is", null);

      if (!sessions || sessions.length === 0) continue;

      // Skip if report already sent for this week
      const { data: existing } = await supabase
        .from("tutor_reports")
        .select("id")
        .eq("user_id", userId)
        .eq("week_start", fmtDate(weekStart))
        .maybeSingle();
      if (existing) continue;

      const { data: profile } = await supabase
        .from("profiles").select("first_name").eq("user_id", userId).single();

      const { data: authUser } = await supabase.auth.admin.getUserById(userId);
      const email = authUser?.user?.email;
      if (!email) continue;

      const avg = sessions.reduce((a, s) => a + (Number(s.score) || 0), 0) / sessions.length;
      const allWeak = sessions.flatMap((s: any) => s.weak_points || []);
      const allStrong = sessions.flatMap((s: any) => s.strong_points || []);

      // AI summary + recommendations
      let aiData: any = { summary: "", recommendations: [] };
      try {
        aiData = await callAI(`Génère un bilan hebdomadaire bref pour un élève d'arabe. Sessions: ${sessions.length}, score moyen: ${avg.toFixed(0)}/100. Points faibles: ${JSON.stringify(allWeak)}. Points forts: ${JSON.stringify(allStrong)}. Réponds JSON: { "summary": "string en français, 2-3 phrases encourageantes", "recommendations": ["string en français, 3-4 actions concrètes"] }`);
      } catch (e) {
        console.error("AI summary failed:", e);
        aiData = {
          summary: `Vous avez complété ${sessions.length} session${sessions.length > 1 ? 's' : ''} cette semaine avec un score moyen de ${Math.round(avg)}/100.`,
          recommendations: ["Continuez à pratiquer régulièrement", "Revenez sur les points faibles identifiés"],
        };
      }

      // Insert report
      const { data: report } = await supabase.from("tutor_reports").insert({
        user_id: userId,
        week_start: fmtDate(weekStart),
        week_end: fmtDate(weekEnd),
        sessions_count: sessions.length,
        average_score: Number(avg.toFixed(2)),
        progress_summary: aiData.summary,
        recommendations: aiData.recommendations,
        sent_by_email: false,
      }).select().single();

      // Send email
      const { error: emailErr } = await supabase.functions.invoke('send-transactional-email', {
        body: {
          templateName: 'tutor-weekly-report',
          recipientEmail: email,
          idempotencyKey: `tutor-report-${userId}-${fmtDate(weekStart)}`,
          templateData: {
            firstName: profile?.first_name || '',
            weekStart: fmtFr(weekStart),
            weekEnd: fmtFr(weekEnd),
            sessionsCount: sessions.length,
            averageScore: avg,
            progressSummary: aiData.summary,
            recommendations: aiData.recommendations,
            weakPoints: [...new Set(allWeak)].slice(0, 5),
            strongPoints: [...new Set(allStrong)].slice(0, 5),
          },
        },
      });

      if (!emailErr && report) {
        await supabase.from("tutor_reports").update({ sent_by_email: true }).eq("id", report.id);
        reports.push({ userId, email });
      }
    }

    return new Response(JSON.stringify({ success: true, sent: reports.length, users: reports }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("[tutor-weekly-report]", msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
