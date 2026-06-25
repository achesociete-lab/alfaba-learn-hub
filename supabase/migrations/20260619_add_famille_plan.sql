-- Add "famille" plan to subscriptions constraint
ALTER TABLE public.subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE public.subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan = ANY (ARRAY['découverte'::text, 'essentiel'::text, 'premium'::text, 'famille'::text, 'hifz'::text]));
