import { createClient } from "npm:@supabase/supabase-js@2.57.2";
import { format } from "npm:date-fns@3.6.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  const today = format(new Date(), "yyyy-MM-dd");

  // Fetch all active Hifz/Premium subscribers
  const { data: subscriptions, error: subError } = await supabase
    .from("subscriptions")
    .select("user_id")
    .in("plan", ["hifz", "premium"])
    .eq("status", "active");

  if (subError) {
    console.error("Error fetching subscriptions:", subError);
    return new Response(JSON.stringify({ error: subError.message }), { status: 500, headers: corsHeaders });
  }

  if (!subscriptions || subscriptions.length === 0) {
    return new Response(JSON.stringify({ sent: 0 }), { headers: corsHeaders });
  }

  let sent = 0;

  for (const sub of subscriptions) {
    const userId = sub.user_id;

    // Get student email
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    const email = userData?.user?.email;
    if (!email) continue;

    // Get student name
    const { data: profile } = await supabase
      .from("profiles")
      .select("first_name, last_name")
      .eq("user_id", userId)
      .maybeSingle();

    const studentName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || email.split("@")[0];

    // Get Hifz config for personalized pace
    const { data: config } = await supabase
      .from("hifz_config")
      .select("hizb_already_memo, duration_months")
      .eq("student_id", userId)
      .maybeSingle();

    // Get validated hizb count
    const { data: evals } = await supabase
      .from("hifz_evaluations")
      .select("hizb_number")
      .eq("student_id", userId)
      .eq("status", "valide");

    const validatedCount = new Set(evals?.map(e => e.hizb_number) ?? []).size;
    const totalMemorized = config ? Math.min(60, (config.hizb_already_memo || 0) + validatedCount) : null;

    let pacePerDay: number | null = null;
    if (config) {
      const remaining = Math.max(0, 60 - (totalMemorized ?? 0));
      pacePerDay = +(remaining * 10 / Math.max(1, config.duration_months * 30)).toFixed(2);
    }

    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const resp = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${anonKey}`,
        apikey: anonKey,
      },
      body: JSON.stringify({
        templateName: "hifz-daily-reminder",
        recipientEmail: email,
        idempotencyKey: `hifz-daily-${userId}-${today}`,
        templateData: {
          studentName,
          pacePerDay,
          totalMemorized,
          programmeUrl: "https://alfasl.fr/hifz",
        },
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error(`Failed to send to ${email}: ${resp.status} ${errText}`);
    } else {
      await resp.text();
      sent++;
    }

  }

  console.log(`Daily Hifz reminder: ${sent}/${subscriptions.length} sent for ${today}`);
  return new Response(JSON.stringify({ sent, total: subscriptions.length, date: today }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
