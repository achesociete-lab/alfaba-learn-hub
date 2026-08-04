import { createClient } from 'npm:@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // 1. Validate the caller's JWT
    const authHeader = req.headers.get('Authorization') ?? ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Unauthorized' }, 401)
    }

    const userClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userError } = await userClient.auth.getUser()
    if (userError || !user) return json({ error: 'Unauthorized' }, 401)

    const admin = createClient(supabaseUrl, serviceKey)

    // 2. Only admins / teachers may list emails
    const { data: roles } = await admin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)

    const allowed = (roles ?? []).some((r: { role: string }) => r.role === 'admin' || r.role === 'teacher')
    if (!allowed) return json({ error: 'Forbidden' }, 403)

    // 3. List all users (paginated)
    const emails: Record<string, string> = {}
    let page = 1
    while (true) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 1000 })
      if (error) {
        console.error('listUsers error:', error)
        return json({ error: error.message }, 500)
      }
      const users = data?.users ?? []
      for (const u of users) {
        if (u.id && u.email) emails[u.id] = u.email
      }
      if (users.length < 1000) break
      page++
    }

    return json({ emails })
  } catch (err) {
    console.error('get-student-emails error', err)
    return json({ error: String(err) }, 500)
  }
})
