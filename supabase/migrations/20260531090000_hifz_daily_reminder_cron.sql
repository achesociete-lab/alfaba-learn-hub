-- Rappel quotidien de révision pour tous les élèves Hifz/Premium actifs
-- Déclenché chaque jour à 6h00 UTC (= 7h00 ou 8h00 heure de Paris selon DST)
SELECT cron.schedule(
  'hifz-daily-reminder',
  '0 6 * * *',
  $$
  SELECT net.http_post(
    url := 'https://ruqudrizhrrnxowirito.supabase.co/functions/v1/hifz-daily-reminder',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ1cXVkcml6aHJybnhvd2lyaXRvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ0NzY5MDIsImV4cCI6MjA5MDA1MjkwMn0.S6Y-FK4TY_H6zH7_ebSEXZh3Lluzn6HXoTcv9i1M0gE'
    ),
    body := '{}'::jsonb
  );
  $$
);
