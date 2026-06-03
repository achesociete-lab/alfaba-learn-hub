create table if not exists hifz_mushaf_annotations (
  id uuid primary key default gen_random_uuid(),
  student_id uuid references auth.users not null,
  page_number int not null check (page_number between 1 and 604),
  annotated_image_url text not null,
  note text,
  session_id uuid references hifz_sessions(id) on delete set null,
  created_at timestamptz default now()
);

alter table hifz_mushaf_annotations enable row level security;

-- L'admin peut tout faire
create policy "admin_all" on hifz_mushaf_annotations
  for all using (true);

-- L'élève peut lire ses propres annotations
create policy "student_read_own" on hifz_mushaf_annotations
  for select using (auth.uid() = student_id);
