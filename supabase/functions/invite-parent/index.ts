import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SITE_URL = 'https://alfasl.fr'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify caller is an authenticated admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non authentifié' }), { status: 401, headers: corsHeaders })
    }
    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Utilisateur introuvable' }), { status: 401, headers: corsHeaders })
    }

    const { parentEmail, childProfileId, childName } = await req.json()
    if (!parentEmail || !childProfileId || !childName) {
      return new Response(JSON.stringify({ error: 'parentEmail, childProfileId et childName sont requis' }), {
        status: 400, headers: corsHeaders,
      })
    }

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    // 1. Create invite record
    const { data: invite, error: inviteErr } = await admin
      .from('parent_invites')
      .insert({ parent_email: parentEmail.trim().toLowerCase(), child_profile_id: childProfileId, child_name: childName })
      .select('id')
      .single()

    if (inviteErr || !invite) {
      console.error('invite insert error', inviteErr)
      return new Response(JSON.stringify({ error: 'Erreur création invitation' }), { status: 500, headers: corsHeaders })
    }

    const inviteId = invite.id
    const redirectTo = `${SITE_URL}/parents/activer?invite_id=${inviteId}`

    // 2. Generate magic link via Supabase admin API
    const { data: linkData, error: linkErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: parentEmail.trim().toLowerCase(),
      options: { redirectTo },
    })

    if (linkErr || !linkData?.properties?.action_link) {
      console.error('generateLink error', linkErr)
      return new Response(JSON.stringify({ error: 'Erreur génération du lien' }), { status: 500, headers: corsHeaders })
    }

    const magicLink = linkData.properties.action_link

    // 3. Send custom email
    const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        templateName: 'parent-invite',
        recipientEmail: parentEmail.trim().toLowerCase(),
        idempotencyKey: `parent-invite-${inviteId}`,
        templateData: { childName, magicLink },
      }),
    })

    if (!emailRes.ok) {
      const errBody = await emailRes.text()
      console.error('send-transactional-email failed', emailRes.status, errBody)
      return new Response(JSON.stringify({ error: 'Erreur envoi email' }), { status: 500, headers: corsHeaders })
    }

    return new Response(JSON.stringify({ ok: true, inviteId }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (err) {
    console.error('invite-parent error', err)
    return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: corsHeaders })
  }
})
