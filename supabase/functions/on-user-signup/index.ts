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
    console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
    return new Response("Server configuration error", { status: 500 });
  }

  let payload: Record<string, any>;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON body", { status: 400 });
  }

  // Support two trigger modes:
  // 1. Supabase Database Webhook (record in payload.record)
  // 2. Direct call with { user_id, email, name }
  const record = payload.record ?? payload;
  const userId: string | undefined = record.id ?? record.user_id;
  const email: string | undefined = record.email;
  const rawName: string | undefined =
    record.raw_user_meta_data?.full_name ??
    record.raw_user_meta_data?.name ??
    record.name ??
    "";

  if (!email) {
    console.warn("on-user-signup: no email in payload, skipping");
    return new Response(JSON.stringify({ skipped: true, reason: "no email" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  // Derive first name for friendly greeting
  const firstName = rawName ? rawName.split(" ")[0] : email.split("@")[0];

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
      idempotencyKey: `welcome-${userId ?? email}`,
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

  console.log(`on-user-signup: welcome email queued for ${email}`);
  return new Response(
    JSON.stringify({ success: true, email }),
    { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
  );
});
