-- Email notification triggers for ALFASL
-- This migration sets up automatic welcome emails via a pg_net HTTP call
-- when a new user confirms their email (profile created).
--
-- Prerequisites:
--   1. pg_net extension must be enabled in your Supabase project
--      (Extensions → pg_net in the Supabase dashboard)
--   2. The on-user-signup Edge Function must be deployed:
--      supabase functions deploy on-user-signup
--   3. Replace YOUR_SUPABASE_URL and YOUR_SUPABASE_SERVICE_ROLE_KEY below
--      with your actual values (or use vault.decrypted_secrets if available)

-- Enable pg_net if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_net;

-- ─── Helper: call on-user-signup Edge Function via HTTP ─────────────────────
CREATE OR REPLACE FUNCTION notify_user_signup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url  text := current_setting('app.supabase_url', true) || '/functions/v1/on-user-signup';
  v_key  text := current_setting('app.service_role_key', true);
  v_body jsonb;
BEGIN
  -- Only fire when email is confirmed for the first time
  IF NEW.email_confirmed_at IS NULL THEN
    RETURN NEW;
  END IF;
  IF OLD.email_confirmed_at IS NOT NULL THEN
    RETURN NEW; -- already confirmed, not a new confirmation
  END IF;

  v_body := jsonb_build_object(
    'user_id', NEW.id,
    'email',   NEW.email,
    'name',    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
  );

  PERFORM net.http_post(
    url     := v_url,
    body    := v_body::text,
    headers := jsonb_build_object(
      'Content-Type',  'application/json',
      'Authorization', 'Bearer ' || v_key
    )
  );

  RETURN NEW;
END;
$$;

-- ─── Trigger on auth.users ───────────────────────────────────────────────────
DROP TRIGGER IF EXISTS on_email_confirmed ON auth.users;

CREATE TRIGGER on_email_confirmed
  AFTER UPDATE OF email_confirmed_at ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION notify_user_signup();

-- ─── Supabase config: store URL + key so the function can read them ──────────
-- Run these two commands with your real values (in SQL Editor or via CLI):
--
--   ALTER DATABASE postgres SET app.supabase_url = 'https://YOUR_PROJECT.supabase.co';
--   ALTER DATABASE postgres SET app.service_role_key = 'YOUR_SERVICE_ROLE_KEY';
--
-- IMPORTANT: service_role_key in a DB trigger is safe because:
--   - the function is SECURITY DEFINER and only callable by the DB itself
--   - pg_net calls are outbound only (no inbound surface)
--   - the Edge Function validates the JWT before processing
--
-- Alternative (more secure): use vault.create_secret() to store the key
-- and vault.decrypted_secrets to read it inside the trigger.

COMMENT ON FUNCTION notify_user_signup IS
  'Sends a welcome email via the on-user-signup Edge Function when a user confirms their email for the first time.';
