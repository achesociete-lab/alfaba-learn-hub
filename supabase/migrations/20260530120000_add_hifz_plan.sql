-- Add 'hifz' as a valid plan value in subscriptions
ALTER TABLE public.subscriptions
  DROP CONSTRAINT subscriptions_plan_check,
  ADD CONSTRAINT subscriptions_plan_check
    CHECK (plan IN ('découverte', 'essentiel', 'premium', 'hifz'));
