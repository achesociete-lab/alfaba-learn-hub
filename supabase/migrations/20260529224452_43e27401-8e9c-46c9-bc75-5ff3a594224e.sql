
CREATE TABLE public.admin_hifz_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slot_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1,
  notes TEXT,
  created_by UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.admin_hifz_slots TO authenticated;
GRANT ALL ON public.admin_hifz_slots TO service_role;

ALTER TABLE public.admin_hifz_slots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view slots"
ON public.admin_hifz_slots FOR SELECT TO authenticated
USING (true);

CREATE POLICY "Admins manage slots"
ON public.admin_hifz_slots FOR ALL TO authenticated
USING (is_admin_or_teacher()) WITH CHECK (is_admin_or_teacher());

CREATE INDEX idx_admin_hifz_slots_date ON public.admin_hifz_slots(slot_date);
