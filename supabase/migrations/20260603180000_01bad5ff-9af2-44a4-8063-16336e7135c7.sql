-- hifz_mushaf_annotations : création + session_id (migration Lovable-compatible)

create table if not exists hifz_mushaf_annotations (
  id                  uuid primary key default gen_random_uuid(),
  student_id          uuid references auth.users not null,
  page_number         int  not null check (page_number between 1 and 604),
  annotated_image_url text not null,
  note                text,
  session_id          uuid references hifz_sessions(id) on delete set null,
  created_at          timestamptz default now()
);

-- Ajout de session_id si la table existait déjà sans cette colonne
alter table hifz_mushaf_annotations
  add column if not exists session_id uuid references hifz_sessions(id) on delete set null;

-- RLS
alter table hifz_mushaf_annotations enable row level security;

-- Supprime les anciennes politiques si elles existent déjà pour éviter le doublon
drop policy if exists "admin_all"        on hifz_mushaf_annotations;
drop policy if exists "student_read_own" on hifz_mushaf_annotations;

-- L'admin (tout utilisateur authentifié qui insère) peut tout faire
create policy "admin_all" on hifz_mushaf_annotations
  for all using (true) with check (true);

-- L'élève voit ses propres annotations
create policy "student_read_own" on hifz_mushaf_annotations
  for select using (auth.uid() = student_id);
