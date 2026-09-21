-- ============================================================
-- Comptes de test ALFASL — à coller dans Supabase SQL Editor
-- Mot de passe commun : Test1234!
-- ============================================================

DO $$
DECLARE
  id_decouverte  uuid := gen_random_uuid();
  id_essentiel   uuid := gen_random_uuid();
  id_premium     uuid := gen_random_uuid();
  id_famille     uuid := gen_random_uuid();
  id_hifz        uuid := gen_random_uuid();
BEGIN

  -- ── 1. Créer les utilisateurs dans auth.users ──────────────
  INSERT INTO auth.users (
    id, instance_id, email, encrypted_password,
    email_confirmed_at, confirmation_sent_at,
    raw_app_meta_data, raw_user_meta_data,
    aud, role, created_at, updated_at
  ) VALUES
    (id_decouverte, '00000000-0000-0000-0000-000000000000',
     'test.decouverte@alfasl.fr', crypt('Test1234!', gen_salt('bf')),
     now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Test","last_name":"Découverte"}',
     'authenticated', 'authenticated', now(), now()),

    (id_essentiel, '00000000-0000-0000-0000-000000000000',
     'test.essentiel@alfasl.fr', crypt('Test1234!', gen_salt('bf')),
     now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Test","last_name":"Essentiel"}',
     'authenticated', 'authenticated', now(), now()),

    (id_premium, '00000000-0000-0000-0000-000000000000',
     'test.premium@alfasl.fr', crypt('Test1234!', gen_salt('bf')),
     now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Test","last_name":"Premium"}',
     'authenticated', 'authenticated', now(), now()),

    (id_famille, '00000000-0000-0000-0000-000000000000',
     'test.famille@alfasl.fr', crypt('Test1234!', gen_salt('bf')),
     now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Test","last_name":"Famille"}',
     'authenticated', 'authenticated', now(), now()),

    (id_hifz, '00000000-0000-0000-0000-000000000000',
     'test.hifz@alfasl.fr', crypt('Test1234!', gen_salt('bf')),
     now(), now(),
     '{"provider":"email","providers":["email"]}',
     '{"first_name":"Test","last_name":"Hifd"}',
     'authenticated', 'authenticated', now(), now())
  ON CONFLICT (email) DO NOTHING;

  -- ── 2. Profils (le trigger handle_new_user le fait normalement,
  --         mais on insère manuellement au cas où il ne se déclenche pas en SQL direct)
  INSERT INTO public.profiles (user_id, first_name, last_name, level)
  VALUES
    (id_decouverte, 'Test', 'Découverte', 'debutant'),
    (id_essentiel,  'Test', 'Essentiel',  'debutant'),
    (id_premium,    'Test', 'Premium',    'debutant'),
    (id_famille,    'Test', 'Famille',    'debutant'),
    (id_hifz,       'Test', 'Hifd',       'debutant')
  ON CONFLICT (user_id) DO NOTHING;

  -- ── 3. Abonnements ─────────────────────────────────────────
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES
    (id_decouverte, 'découverte', 'active'),
    (id_essentiel,  'essentiel',  'active'),
    (id_premium,    'premium',    'active'),
    (id_famille,    'famille',    'active'),
    (id_hifz,       'hifz',       'active')
  ON CONFLICT DO NOTHING;

  -- ── 4. Config Hifd pour le compte hifz ────────────────────
  INSERT INTO public.hifz_config (student_id, hizb_already_memo, duration_months)
  VALUES (id_hifz, 0, 12)
  ON CONFLICT DO NOTHING;

END $$;

-- Vérification
SELECT u.email, s.plan, s.status
FROM auth.users u
JOIN public.subscriptions s ON s.user_id = u.id
WHERE u.email LIKE 'test.%@alfasl.fr'
ORDER BY s.plan;
