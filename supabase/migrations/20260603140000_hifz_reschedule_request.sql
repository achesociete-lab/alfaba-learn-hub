-- Demande de report / retard pour les séances Hifd
ALTER TABLE hifz_sessions
  ADD COLUMN IF NOT EXISTS reschedule_type text,
  ADD COLUMN IF NOT EXISTS reschedule_message text,
  ADD COLUMN IF NOT EXISTS reschedule_proposed_date date,
  ADD COLUMN IF NOT EXISTS reschedule_proposed_time time,
  ADD COLUMN IF NOT EXISTS reschedule_requested_at timestamptz;
