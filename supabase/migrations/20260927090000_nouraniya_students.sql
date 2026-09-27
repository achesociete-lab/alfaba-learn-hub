-- Élèves Nouraniya sans compte plateforme (enfants sans email)
create table if not exists nouraniya_students (
  id uuid default gen_random_uuid() primary key,
  first_name text not null,
  last_name text not null,
  date_of_birth date,
  level text default 'debutant',
  notes text,
  profile_id uuid references profiles(user_id) on delete set null, -- lien optionnel vers un compte plateforme
  created_at timestamptz default now()
);

alter table nouraniya_students enable row level security;

create policy "Authenticated users can manage nouraniya_students"
  on nouraniya_students for all using (auth.role() = 'authenticated');
