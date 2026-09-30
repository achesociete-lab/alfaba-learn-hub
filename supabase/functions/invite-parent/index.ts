import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
const jsonHeaders = { ...corsHeaders, 'Content-Type': 'application/json' }
const errRes = (message: string, status = 500) =>
  new Response(JSON.stringify({ message }), { status, headers: jsonHeaders })

const SITE_URL = 'https://alfasl.fr'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey     = Deno.env.get('SUPABASE_ANON_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return errRes('Non authentifié', 401)

    const userClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: userErr } = await userClient.auth.getUser()
    if (userErr || !user) return errRes('Utilisateur introuvable', 401)

    const { parentEmail, childProfileId, childName } = await req.json()
    if (!parentEmail || !childProfileId || !childName)
      return errRes('parentEmail, childProfileId et childName sont requis', 400)

    const admin = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

    // 1. Create invite record
    const { data: invite, error: inviteErr } = await admin
      .from('parent_invites')
      .insert({
        parent_email: parentEmail.trim().toLowerCase(),
        child_profile_id: childProfileId,
        child_name: childName,
      })
      .select('id')
      .single()

    if (inviteErr || !invite) {
      console.error('invite insert error', inviteErr)
      return errRes(`Erreur création invitation: ${inviteErr?.message ?? 'unknown'}`)
    }

    const inviteId = (invite as any).id

    // 2. Send email — simple link to site, no magic link needed.
    //    ParentInviteActivator activates the invite automatically on login.
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
        templateData: { childName, siteUrl: SITE_URL },
      }),
    })

    if (!emailRes.ok) {
      const errBody = await emailRes.text()
      console.error('send-transactional-email failed', emailRes.status, errBody)
      return errRes(`Erreur envoi email (${emailRes.status}): ${errBody}`)
    }

    return new Response(JSON.stringify({ ok: true, inviteId }), { status: 200, headers: jsonHeaders })

  } catch (err) {
    console.error('invite-parent error', err)
    return new Response(JSON.stringify({ message: String(err) }), { status: 500, headers: jsonHeaders })
  }
})
