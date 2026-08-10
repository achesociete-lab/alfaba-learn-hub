import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Funnel milestones: days after signup → template name
const FUNNEL_MILESTONES = [
  { day: 1, templateName: 'funnel-j1' },
  { day: 4, templateName: 'funnel-j4' },
  { day: 7, templateName: 'funnel-j7' },
] as const

/**
 * Returns [windowStart, windowEnd] ISO strings for profiles created ~N days ago.
 * Uses a ±12-hour buffer to tolerate cron scheduling drift.
 */
function dayWindow(daysAgo: number): [string, string] {
  const center = new Date()
  center.setDate(center.getDate() - daysAgo)

  const start = new Date(center)
  start.setHours(start.getHours() - 12)

  const end = new Date(center)
  end.setHours(end.getHours() + 12)

  return [start.toISOString(), end.toISOString()]
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    let body: any = {}
    try { body = await req.json() } catch (_) {}

    const today = new Date().toISOString().split('T')[0]
    const ADMIN_COPY_EMAIL = 'ache.societe@gmail.com'
    let successCount = 0
    let failureCount = 0
    const relancedStudents: { name: string; email: string; level: string; milestone: string }[] = []

    // ─── MANUAL MODE ──────────────────────────────────────────────────────────
    // Payload: { userId, email, firstName, level?, day? }
    // day defaults to 1 if not provided (sends funnel-j1)
    if (body?.userId && body?.email) {
      const milestone = FUNNEL_MILESTONES.find(m => m.day === (body.day ?? 1)) ?? FUNNEL_MILESTONES[0]
      const idempotencyKey = `funnel-${milestone.day}-${body.userId}-${today}`

      // Idempotency: skip if this template was already successfully sent to this address
      const { data: alreadySent } = await supabase
        .from('email_send_log')
        .select('id')
        .eq('recipient_email', body.email)
        .eq('template_name', milestone.templateName)
        .eq('status', 'sent')
        .maybeSingle()

      if (!alreadySent) {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
          body: JSON.stringify({
            templateName: milestone.templateName,
            recipientEmail: body.email,
            idempotencyKey,
            templateData: {
              studentName: body.firstName || 'Élève',
              studentEmail: body.email,
            },
          }),
        })

        if (emailRes.ok) {
          successCount++
          console.log(`[manual] funnel-j${milestone.day} sent to ${body.email}`)
        } else {
          failureCount++
          console.error(`[manual] Failed funnel-j${milestone.day} for ${body.email}:`, await emailRes.text())
        }
      } else {
        console.log(`[manual] funnel-j${milestone.day} already sent to ${body.email}, skipping`)
      }

      return new Response(
        JSON.stringify({ ok: true, success: successCount, failed: failureCount }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // ─── AUTOMATIC CRON MODE ──────────────────────────────────────────────────
    // Runs all 3 milestones each time. Each milestone picks up students whose
    // signup date falls in the target window and who still have no paid plan.
    for (const milestone of FUNNEL_MILESTONES) {
      const [windowStart, windowEnd] = dayWindow(milestone.day)

      const { data: candidates, error: queryError } = await supabase
        .from('profiles')
        .select('user_id, first_name, level, created_at')
        .eq('type_eleve', 'en_ligne')
        .gte('created_at', windowStart)
        .lte('created_at', windowEnd)

      if (queryError) {
        console.error(`[funnel-j${milestone.day}] Query error:`, queryError)
        continue
      }

      if (!candidates || candidates.length === 0) {
        console.log(`[funnel-j${milestone.day}] No candidates found`)
        continue
      }

      for (const student of candidates) {
        // Skip students who have already converted to a paid plan
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', student.user_id)
          .eq('status', 'active')
          .neq('plan', 'découverte')
          .maybeSingle()

        if (subscription) {
          console.log(`[funnel-j${milestone.day}] ${student.user_id} already paid, skipping`)
          continue
        }

        // Resolve auth email
        const { data: { users } } = await supabase.auth.admin.listUsers()
        const user = users?.find(u => u.id === student.user_id)
        if (!user?.email) {
          console.warn(`[funnel-j${milestone.day}] No auth email for ${student.user_id}`)
          continue
        }

        const studentEmail = user.email
        const idempotencyKey = `funnel-${milestone.day}-${student.user_id}-${today}`

        // Idempotency: skip if this template was already successfully sent to this address
        const { data: alreadySent } = await supabase
          .from('email_send_log')
          .select('id')
          .eq('recipient_email', studentEmail)
          .eq('template_name', milestone.templateName)
          .eq('status', 'sent')
          .maybeSingle()

        if (alreadySent) {
          console.log(`[funnel-j${milestone.day}] Already sent to ${studentEmail}, skipping`)
          continue
        }

        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${serviceKey}`,
            apikey: serviceKey,
          },
          body: JSON.stringify({
            templateName: milestone.templateName,
            recipientEmail: studentEmail,
            idempotencyKey,
            templateData: {
              studentName: student.first_name || 'Élève',
              studentEmail,
            },
          }),
        })

        if (emailRes.ok) {
          successCount++
          relancedStudents.push({
            name: student.first_name || 'Élève',
            email: studentEmail,
            level: student.level,
            milestone: `J+${milestone.day}`,
          })
          console.log(`[funnel-j${milestone.day}] Sent to ${studentEmail}`)
        } else {
          failureCount++
          console.error(`[funnel-j${milestone.day}] Failed for ${studentEmail}:`, await emailRes.text())
        }
      }
    }

    // Send admin summary if at least one funnel email went out
    if (relancedStudents.length > 0) {
      await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          templateName: 'admin-relance-summary',
          recipientEmail: ADMIN_COPY_EMAIL,
          idempotencyKey: `funnel-admin-summary-${today}-${Date.now()}`,
          templateData: {
            students: relancedStudents,
            successCount,
            date: today,
          },
        }),
      }).catch(err => console.warn('Admin summary email failed:', err))
    }

    return new Response(
      JSON.stringify({
        ok: true,
        total: successCount + failureCount,
        success: successCount,
        failed: failureCount,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (err) {
    console.error('send-followup-emails error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
