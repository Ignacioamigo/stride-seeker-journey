create table if not exists public.strava_tokens (
  user_id uuid primary key references auth.users(id) on delete cascade,
  athlete_id bigint not null,
  access_token text not null,
  refresh_token text not null,
  expires_at bigint not null,
  scopes text not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Add Strava fields to published_activities if they don't exist
do $$ begin
  if not exists (select 1 from information_schema.columns where table_name = 'published_activities' and column_name = 'strava_upload_id') then
    alter table public.published_activities add column strava_upload_id text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'published_activities' and column_name = 'strava_activity_id') then
    alter table public.published_activities add column strava_activity_id bigint;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'published_activities' and column_name = 'imported_from_strava') then
    alter table public.published_activities add column imported_from_strava boolean default false;
  end if;
end $$;

alter table public.strava_tokens enable row level security;

do $$ begin
  if not exists (
    select 1 from pg_policies where schemaname = 'public' and tablename = 'strava_tokens' and policyname = 'Users can manage their own strava tokens'
  ) then
    create policy "Users can manage their own strava tokens" on public.strava_tokens
      for all
      using (auth.uid() = user_id)
      with check (auth.uid() = user_id);
  end if;
end $$;


