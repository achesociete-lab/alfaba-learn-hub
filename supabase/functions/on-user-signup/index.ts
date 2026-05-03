import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  if (!supabaseUrl || !serviceKey) {
    return new Response("Server configuration error", { status: 500, headers: corsHeaders });
  }

  // Extract the caller's JWT to identify the user
  const authHeader = req.headers.get("Authorization") ?? "";
  const jwt = authHeader.replace("Bearer ", "").trim();

  // Use a service-role client for DB writes, but verify the caller via their JWT
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false },
  });

  // Verify the JWT and get the user
  const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
  if (authError || !user) {
    console.warn("on-user-signup: invalid or missing JWT");
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
      { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const userId = user.id;
  const email = user.email ?? "";

  // Check idempotency: has the welcome email already been sent?
  const { data: profile } = await supabase
    .from("profiles")
    .select("welcome_email_sent, first_name, last_name")
    .eq("user_id", userId)
    .maybeSingle();

  if (profile?.welcome_email_sent) {
    console.log(`on-user-signup: welcome email already sent for ${userId}, skipping`);
    return new Response(
      JSON.stringify({ success: true, skipped: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Derive first name for greeting
  const firstName =
    profile?.first_name?.trim() ||
    user.user_metadata?.given_name ||
    user.user_metadata?.full_name?.split(" ")[0] ||
    user.user_metadata?.name?.split(" ")[0] ||
    email.split("@")[0];

  console.log(`on-user-signup: sending welcome email to ${email} (user ${userId})`);

  // Call send-transactional-email with the welcome-new-user template
  const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${serviceKey}`,
    },
    body: JSON.stringify({
      templateName: "welcome-new-user",
      recipientEmail: email,
      templateData: {
        userName: firstName,
        userEmail: email,
      },
      idempotencyKey: `welcome-${userId}`,
    }),
  });

  if (!emailRes.ok) {
    const errBody = await emailRes.text();
    console.error(`on-user-signup: email send failed — ${emailRes.status}: ${errBody}`);
    return new Response(
      JSON.stringify({ success: false, error: errBody }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  // Mark as sent in the profiles table (idempotency guard)
  await supabase
    .from("profiles")
    .update({ welcome_email_sent: true })
    .eq("user_id", userId);

  console.log(`on-user-signup: welcome email queued for ${email}`);
  return new Response(
    JSON.stringify({ success: true, email }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
