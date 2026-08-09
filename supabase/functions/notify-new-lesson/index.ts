// Edge Function: notify-new-lesson
// Envoie une notification aux élèves concernés lorsqu'une nouvelle leçon est publiée.
// Supporte les modules "niveau_1", "niveau_2" (en ligne) et "presentiel".
// Réservé aux admins/teachers.

import { createClient } from 'npm:@supabase/supabase-js@2.49.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type Module = 'niveau_1' | 'niveau_2' | 'presentiel'

interface Payload {
  module: Module
  lessonTitle: string
  // online lessons
  level?: 'niveau_1' | 'niveau_2'
  lessonNumber?: number
  // presentiel
  courseId?: string
}

const APP_URLS: Record<string, string> = {
  niveau_1: 'https://alfasl.fr/niveau-1',
  niveau_2: 'https://alfasl.fr/niveau-2',
  presentiel: 'https://alfasl.fr/cours-presentiel',
}

const MODULE_LABEL: Record<Module, string> = {
  niveau_1: 'Niveau 1',
  niveau_2: 'Niveau 2',
  presentiel: 'Cours en présentiel',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Non autorisé' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const authClient = createClient(SUPABASE_URL, ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user }, error: userErr } = await authClient.auth.getUser()
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: 'Utilisateur invalide' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const admin = createClient(SUPABASE_URL, SERVICE_ROLE)
    const { data: roles } = await admin.from('user_roles').select('role').eq('user_id', user.id)
    const isAdmin = roles?.some((r: any) => r.role === 'admin' || r.role === 'teacher')
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'Accès admin requis' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = (await req.json()) as Payload
    const { module: mod, lessonTitle, level, lessonNumber, courseId } = body
    if (!mod || !lessonTitle) {
      return new Response(JSON.stringify({ error: 'module et lessonTitle requis' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Récupère les user_ids concernés
    let recipientUserIds: string[] = []
    let idemSuffix = ''

    if (mod === 'presentiel') {
      if (!courseId) {
        return new Response(JSON.stringify({ error: 'courseId requis pour presentiel' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      const { data: assigns, error } = await admin
        .from('presentiel_course_assignments')
        .select('user_id')
        .eq('course_id', courseId)
      if (error) throw error
      recipientUserIds = (assigns ?? []).map((a: any) => a.user_id)
      idemSuffix = `presentiel-${courseId}`
    } else {
      if (!level) {
        return new Response(JSON.stringify({ error: 'level requis pour niveau_1/2' }), {
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      // Élèves en ligne du bon niveau
      const { data: profs, error } = await admin
        .from('profiles')
        .select('user_id')
        .eq('type_eleve', 'en_ligne')
        .eq('level', level)
      if (error) throw error
      recipientUserIds = (profs ?? []).map((p: any) => p.user_id)
      idemSuffix = `${level}-${lessonNumber ?? 'x'}`
    }

    if (recipientUserIds.length === 0) {
      return new Response(JSON.stringify({ ok: true, sent: 0, note: 'Aucun destinataire' }), {
        status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const lessonUrl = APP_URLS[mod] ?? 'https://alfasl.fr/dashboard'
    const moduleLabel = MODULE_LABEL[mod]

    // Résolution emails via auth.admin.listUsers (paginé)
    const emailByUserId = new Map<string, { email: string; firstName?: string }>()
    const idSet = new Set(recipientUserIds)
    let page = 1
    const perPage = 1000
    while (idSet.size > 0) {
      const { data, error } = await admin.auth.admin.listUsers({ page, perPage })
      if (error) throw error
      const users = data?.users ?? []
      for (const u of users) {
        if (idSet.has(u.id) && u.email) {
          const meta: any = u.user_metadata ?? {}
          emailByUserId.set(u.id, {
            email: u.email,
            firstName: meta.first_name || meta.given_name || (meta.full_name || '').split(' ')[0],
          })
          idSet.delete(u.id)
        }
      }
      if (users.length < perPage) break
      page += 1
      if (page > 50) break // garde-fou
    }

    // Récupère prénoms depuis profiles pour ceux sans metadata
    const { data: profileNames } = await admin
      .from('profiles')
      .select('user_id, first_name')
      .in('user_id', recipientUserIds)
    const nameByUserId = new Map<string, string>(
      (profileNames ?? []).map((p: any) => [p.user_id, p.first_name || ''])
    )

    let sent = 0
    let failed = 0
    for (const uid of recipientUserIds) {
      const info = emailByUserId.get(uid)
      if (!info?.email) continue
      const firstName = info.firstName || nameByUserId.get(uid) || ''
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SERVICE_ROLE}`,
            apikey: SERVICE_ROLE,
          },
          body: JSON.stringify({
            templateName: 'new-lesson-published',
            recipientEmail: info.email,
            idempotencyKey: `new-lesson-${idemSuffix}-${uid}`,
            templateData: {
              studentName: firstName,
              lessonTitle,
              moduleLabel,
              lessonUrl,
            },
          }),
        })
        if (res.ok) sent += 1
        else {
          failed += 1
          console.error('send-transactional-email failed', res.status, await res.text())
        }
      } catch (e) {
        failed += 1
        console.error('send error', e)
      }
    }

    // Notifie l'admin pour les cours présentiel
    if (mod === 'presentiel') {
      try {
        await fetch(`${SUPABASE_URL}/functions/v1/send-transactional-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${SERVICE_ROLE}`,
            apikey: SERVICE_ROLE,
          },
          body: JSON.stringify({
            templateName: 'new-lesson-published',
            recipientEmail: 'ache.societe@gmail.com',
            idempotencyKey: `new-lesson-admin-${idemSuffix}`,
            templateData: {
              studentName: 'Admin',
              lessonTitle,
              moduleLabel,
              lessonUrl,
            },
          }),
        })
      } catch (e) {
        console.error('admin notify error', e)
      }
    }

    return new Response(JSON.stringify({ ok: true, sent, failed, total: recipientUserIds.length }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err: any) {
    console.error('notify-new-lesson error', err)
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
