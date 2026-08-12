create table if not exists hifz_applications (
  id uuid primary key default gen_random_uuid(),
  prenom text not null,
  niveau_arabe text not null,
  disponibilites text not null,
  contact text not null,
  message text,
  status text not null default 'en_attente',
  created_at timestamptz not null default now()
);

alter table hifz_applications enable row level security;

-- Insertion publique (formulaire sans auth)
create policy "public insert hifz_applications"
  on hifz_applications for insert
  with check (true);

-- Lecture réservée aux admins
create policy "admin read hifz_applications"
  on hifz_applications for select
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('admin', 'teacher')
    )
  );

-- Mise à jour réservée aux admins
create policy "admin update hifz_applications"
  on hifz_applications for update
  using (
    exists (
      select 1 from user_roles
      where user_id = auth.uid()
      and role in ('admin', 'teacher')
    )
  );
