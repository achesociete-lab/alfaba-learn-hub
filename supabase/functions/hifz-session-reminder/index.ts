import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { format, addDays } from "npm:date-fns@3.6.0";
import { fr } from "npm:date-fns@3.6.0/locale";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SESSION_LABELS: Record<string, string> = {
  sabaq:         "Nouvel apprentissage",
  sabaq_para:    "Révision récente",
  dhor:          "Révision ancienne",
  rattrapage:    "Consolidation",
  test_surprise: "Test surprise",
  khatm_partiel: "Juz complet",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const tomorrow = format(addDays(new Date(), 1), "yyyy-MM-dd");

  // Fetch all confirmed sessions for tomorrow
  const { data: sessions, error } = await supabase
    .from("hifz_sessions")
    .select("id, student_id, session_date, session_time, session_type, meet_link, notes_eleve, juz_number")
    .eq("status", "confirmee")
    .eq("session_date", tomorrow);

  if (error) {
    console.error("Error fetching sessions:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
  }

  if (!sessions || sessions.length === 0) {
    console.log(`No confirmed sessions for ${tomorrow}`);
    return new Response(JSON.stringify({ sent: 0 }), { headers: corsHeaders });
  }

  let sent = 0;

  for (const session of sessions) {
    // Get student email from auth.users
    const { data: userData } = await supabase.auth.admin.getUserById(session.student_id);
    const email = userData?.user?.email;
    if (!email) continue;

    // Get student name from profiles
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", session.student_id)
      .maybeSingle();

    const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || email.split("@")[0];
    const sessionTypeLabel = SESSION_LABELS[session.session_type] ?? "Séance Hifd";

    // Parse page range from notes_eleve if present
    const pageMatch = session.notes_eleve?.match(/^\[Pages (\d+–\d+)\]/);
    const pageRange = pageMatch ? pageMatch[1] : null;

    const dateFormatted = format(new Date(session.session_date + "T12:00:00"), "EEEE d MMMM yyyy", { locale: fr });
    const timeFormatted = session.session_time?.slice(0, 5);

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        templateName: "hifz-session-reminder",
        recipientEmail: email,
        idempotencyKey: `hifz-reminder-${session.id}-${tomorrow}`,
        templateData: {
          studentName,
          date: dateFormatted,
          time: timeFormatted,
          sessionType: session.session_type,
          sessionTypeLabel,
          meetLink: session.meet_link ?? null,
          juzNumber: session.juz_number ?? null,
          pageRange,
        },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`Failed to send reminder for session ${session.id}: ${resp.status} ${errText}`);
    } else {
      await resp.text();
      sent++;
      console.log(`Reminder sent to ${email} for session ${session.id}`);
    }

  }

  return new Response(JSON.stringify({ sent, total: sessions.length, date: tomorrow }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
