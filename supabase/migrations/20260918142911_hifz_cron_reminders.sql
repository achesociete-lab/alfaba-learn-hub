-- Active les extensions nécessaires si pas déjà présentes
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Supprime les anciens jobs s'ils existent (idempotence)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'hifz-session-reminder-daily') THEN
    PERFORM cron.unschedule('hifz-session-reminder-daily');
  END IF;
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'hifz-daily-reminder-daily') THEN
    PERFORM cron.unschedule('hifz-daily-reminder-daily');
  END IF;
END $$;

-- Rappel de séance : chaque jour à 08:00 UTC (10h Paris été / 9h hiver)
-- Envoie un email aux élèves ayant une séance Hifd confirmée le lendemain
SELECT cron.schedule(
  'hifz-session-reminder-daily',
  '0 8 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ruqudrizhrrnxowirito.supabase.co/functions/v1/hifz-session-reminder',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cXVkcml6aHJybnhvd2lyaXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzY5MDIsImV4cCI6MjA5MDA1MjkwMn0.S6Y-FK4TY_H6zH7_ebSEXZh3Lluzn6HXoTcv9i1M0gE"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);

-- Rappel de révision quotidienne : chaque jour à 06:30 UTC (8h30 Paris été / 7h30 hiver)
-- Envoie un email de motivation aux abonnés Hifd actifs
SELECT cron.schedule(
  'hifz-daily-reminder-daily',
  '30 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ruqudrizhrrnxowirito.supabase.co/functions/v1/hifz-daily-reminder',
    headers := '{"Content-Type": "application/json", "apikey": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cXVkcml6aHJybnhvd2lyaXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzY5MDIsImV4cCI6MjA5MDA1MjkwMn0.S6Y-FK4TY_H6zH7_ebSEXZh3Lluzn6HXoTcv9i1M0gE"}'::jsonb,
    body := '{}'::jsonb
  ) AS request_id;
  $$
);
