create table if not exists cartoon_series (
    id uuid default gen_random_uuid() primary key,
    title_fr text not null,
    title_ar text not null,
    description_fr text,
    level text default 'tous' check (level in ('tous','debutant','intermediaire','avance')),
    age_range text default '4-12 ans',
    is_active boolean default true,
    sort_order integer default 0,
    created_at timestamptz default now()
  );

  create table if not exists cartoon_episodes (
    id uuid default gen_random_uuid() primary key,
    series_id uuid references cartoon_series(id) on delete cascade not null,
    episode_number integer not null,
    title_fr text,
    title_ar text,
    youtube_id text not null,
    duration_minutes integer,
    is_free boolean default false,
    sort_order integer default 0,
    created_at timestamptz default now()
  );

GRANT SELECT ON cartoon_series TO anon;
GRANT SELECT ON cartoon_episodes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON cartoon_series TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON cartoon_episodes TO authenticated;
GRANT ALL ON cartoon_series TO service_role;
GRANT ALL ON cartoon_episodes TO service_role;

  alter table cartoon_series enable row level security;
  alter table cartoon_episodes enable row level security;

  create policy "Anyone can view active series"
    on cartoon_series for select using (is_active = true);

  create policy "Anyone can view episodes"
    on cartoon_episodes for select using (true);

  create policy "Authenticated users can manage series"
    on cartoon_series for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);

  create policy "Authenticated users can manage episodes"
    on cartoon_episodes for all to authenticated using (auth.uid() is not null) with check (auth.uid() is not null);