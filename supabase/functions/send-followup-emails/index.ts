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

    // Get all online students who signed up 3 days ago and haven't paid
    const threeDaysAgo = new Date()
    threeDaysAgo.setDate(threeDaysAgo.getDate() - 3)
    const threeDaysAgoISO = threeDaysAgo.toISOString()

    const fourDaysAgo = new Date()
    fourDaysAgo.setDate(fourDaysAgo.getDate() - 4)
    const fourDaysAgoISO = fourDaysAgo.toISOString()

    // Query: Get profiles created 3-4 days ago, online, without active subscription
    const { data: studentsToFollowUp, error: queryError } = await supabase
      .from('profiles')
      .select(`
        user_id,
        first_name,
        last_name,
        level,
        created_at
      `)
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
      console.log('No students to follow up')
      return new Response(JSON.stringify({ ok: true, count: 0 }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Found ${studentsToFollowUp.length} students to follow up`)

    // For each student, check if they have an active subscription (not découverte)
    const emailsToSend = []

    for (const student of studentsToFollowUp) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('plan, status')
        .eq('user_id', student.user_id)
        .eq('status', 'active')
        .neq('plan', 'découverte')
        .maybeSingle()

      // Only send email if no active subscription
      if (!subscription) {
        // Get email from auth.users
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

    console.log(`Sending ${emailsToSend.length} follow-up emails`)

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
          idempotencyKey: `followup-${emailData.student_id}-${new Date().toISOString().split('T')[0]}`,
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
      {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  } catch (err) {
    console.error('send-followup-emails error', err)
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
