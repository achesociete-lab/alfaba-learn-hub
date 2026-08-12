import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const ADMIN_EMAIL = 'ache.societe@gmail.com'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const { studentName, studentEmail, studentLevel, userId } = await req.json()
    if (!studentEmail || !userId || !studentName) {
      return new Response(JSON.stringify({ error: 'Missing fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Send email to admin
    const adminEmailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        templateName: 'admin-new-student-signup',
        recipientEmail: ADMIN_EMAIL,
        idempotencyKey: `new-student-signup-admin-${userId}`,
        templateData: { 
          studentName, 
          studentEmail, 
          studentLevel: studentLevel || 'Non spécifié',
          ccEmail: CC_EMAIL,
        },
      }),
    })

    if (!adminEmailRes.ok) {
      const errorBody = await adminEmailRes.text()
      console.error('send-transactional-email to admin failed', adminEmailRes.status, errorBody)
      return new Response(JSON.stringify({ ok: false, error: errorBody }), {
        status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Send email to CC
    const ccEmailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${serviceKey}`,
        apikey: serviceKey,
      },
      body: JSON.stringify({
        templateName: 'admin-new-student-signup',
        recipientEmail: CC_EMAIL,
        idempotencyKey: `new-student-signup-cc-${userId}`,
        templateData: { 
          studentName, 
          studentEmail, 
          studentLevel: studentLevel || 'Non spécifié',
          ccEmail: CC_EMAIL,
        },
      }),
    })

    if (!ccEmailRes.ok) {
      const errorBody = await ccEmailRes.text()
      console.error('send-transactional-email to CC failed', ccEmailRes.status, errorBody)
      // Don't fail the whole request if CC fails
      console.warn('CC email failed but continuing')
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('notify-new-student-signup error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
