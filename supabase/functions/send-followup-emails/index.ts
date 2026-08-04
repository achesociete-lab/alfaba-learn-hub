import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceKey)

    // Check if this is a manual send (body contains userId, email, firstName, level)
    let body: any = {}
    try {
      body = await req.json()
    } catch (_) {}

    let emailsToSend: { student_id: string; email: string; first_name: string; level: string }[] = []

    if (body?.userId && body?.email) {
      // Manual send for a specific student
      emailsToSend = [{
        student_id: body.userId,
        email: body.email,
        first_name: body.firstName || 'Élève',
        level: body.level || 'niveau_1',
      }]
    } else {
      // Automatic cron mode: find students who signed up 3-4 days ago without paid plan
      const threeDaysAgo = new Date()
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
      const threeDaysAgoISO = threeDaysAgo.toISOString()

      const fourDaysAgo = new Date()
      fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)
      const fourDaysAgoISO = fourDaysAgo.toISOString()

      const { data: studentsToFollowUp, error: queryError } = await supabase
        .from('profiles')
        .select('user_id, first_name, last_name, level, created_at')
        .eq('type_eleve', 'en_ligne')
        .gte('created_at', fourDaysAgoISO)
        .lte('created_at', threeDaysAgoISO)

      if (queryError) {
        console.error('Query error:', queryError)
        return new Response(JSON.stringify({ error: queryError.message }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (!studentsToFollowUp || studentsToFollowUp.length === 0) {
        return new Response(JSON.stringify({ ok: true, count: 0 }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      for (const student of studentsToFollowUp) {
        const { data: subscription } = await supabase
          .from('subscriptions')
          .select('plan, status')
          .eq('user_id', student.user_id)
          .eq('status', 'active')
          .neq('plan', 'découverte')
          .maybeSingle()

        if (!subscription) {
          const { data: { users } } = await supabase.auth.admin.listUsers()
          const user = users?.find(u => u.id === student.user_id)
          if (user?.email) {
            emailsToSend.push({
              student_id: student.user_id,
              email: user.email,
              first_name: student.first_name,
              level: student.level,
            })
          }
        }
      }
    }

    // Send emails
    let successCount = 0
    let failureCount = 0

    for (const emailData of emailsToSend) {
      const templateName = emailData.level === 'niveau_1'
        ? 'followup-level1-online'
        : 'followup-level2-online'

      const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-transactional-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${serviceKey}`,
          apikey: serviceKey,
        },
        body: JSON.stringify({
          templateName,
          recipientEmail: emailData.email,
          idempotencyKey: `followup-manual-${emailData.student_id}-${new Date().toISOString().split('T')[0]}`,
          templateData: {
            studentName: emailData.first_name,
            studentEmail: emailData.email,
          },
        }),
      })

      if (emailRes.ok) {
        successCount++
        console.log(`Email sent to ${emailData.email}`)
      } else {
        failureCount++
        const errorBody = await emailRes.text()
        console.error(`Failed to send email to ${emailData.email}:`, errorBody)
      }
    }

    return new Response(
      JSON.stringify({
        ok: true,
        total: emailsToSend.length,
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
