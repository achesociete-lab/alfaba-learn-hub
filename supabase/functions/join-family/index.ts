import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const serviceKey  = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
  const anonKey    = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

  // Identify the calling user
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "Non authentifié" }), { status: 401, headers: corsHeaders });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: { user }, error: userError } = await userClient.auth.getUser();
  if (userError || !user) {
    return new Response(JSON.stringify({ error: "Utilisateur introuvable" }), { status: 401, headers: corsHeaders });
  }

  const { token } = await req.json();
  if (!token) {
    return new Response(JSON.stringify({ error: "Token manquant" }), { status: 400, headers: corsHeaders });
  }

  // Use service role to bypass RLS
  const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } });

  // Find pending invite
  const { data: invite, error: inviteError } = await admin
    .from("family_members")
    .select("*, owner:owner_id(email)")
    .eq("invite_token", token)
    .eq("status", "pending")
    .maybeSingle();

  if (inviteError || !invite) {
    return new Response(JSON.stringify({ error: "Invitation invalide ou déjà utilisée" }), { status: 404, headers: corsHeaders });
  }

  // Check owner still has active famille subscription
  const { data: ownerSub } = await admin
    .from("subscriptions")
    .select("id")
    .eq("user_id", invite.owner_id)
    .eq("plan", "famille")
    .eq("status", "active")
    .maybeSingle();

  if (!ownerSub) {
    return new Response(JSON.stringify({ error: "L'abonnement Famille du propriétaire n'est plus actif" }), { status: 403, headers: corsHeaders });
  }

  // Check max 4 members not exceeded
  const { count } = await admin
    .from("family_members")
    .select("id", { count: "exact", head: true })
    .eq("owner_id", invite.owner_id)
    .eq("status", "active");

  if ((count ?? 0) >= 4) {
    return new Response(JSON.stringify({ error: "La famille est complète (4 membres maximum)" }), { status: 403, headers: corsHeaders });
  }

  // Activate member
  const { error: updateError } = await admin
    .from("family_members")
    .update({
      member_id: user.id,
      status: "active",
      joined_at: new Date().toISOString(),
    })
    .eq("id", invite.id);

  if (updateError) {
    return new Response(JSON.stringify({ error: updateError.message }), { status: 500, headers: corsHeaders });
  }

  return new Response(JSON.stringify({ success: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200,
  });
});
