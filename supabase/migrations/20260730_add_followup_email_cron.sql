-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a scheduled job to send follow-up emails every day at 9 AM UTC
-- This will find students who signed up 3-4 days ago and haven't paid
SELECT cron.schedule(
  'send-followup-emails',
  '0 9 * * *', -- Every day at 9 AM UTC
  $$
  SELECT
    net.http_post(
      url := current_setting('app.supabase_url') || '/functions/v1/send-followup-emails',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || current_setting('app.service_role_key')
      ),
      body := '{}'::jsonb
    ) as request_id;
  $$
);

-- Alternative: If you want to use a Supabase Edge Function directly
-- You can also manually trigger this via the Supabase dashboard
-- by calling: SELECT net.http_post('https://YOUR_PROJECT.supabase.co/functions/v1/send-followup-emails', ...)
