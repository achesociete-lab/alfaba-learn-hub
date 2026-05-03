-- Add welcome_email_sent flag to profiles table
-- Ensures the welcome email is sent exactly once per user, tracked in the DB.
-- Triggered from the React client (AuthContext) on first email confirmation or OAuth signup.

ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS welcome_email_sent boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN profiles.welcome_email_sent IS
  'Set to true once the one-time welcome email has been queued for this user.';
