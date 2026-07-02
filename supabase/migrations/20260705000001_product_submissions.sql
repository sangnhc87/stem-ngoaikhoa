create table if not exists public.product_submissions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id text not null,
  door integer not null check (door >= 1),
  title text not null,
  product_url text,
  description text not null,
  prompt text,
  verification text,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint product_submissions_team_fk foreign key (season_id, team_id)
    references public.teams(season_id, team_id) on delete cascade,
  constraint product_submissions_challenge_fk foreign key (season_id, door)
    references public.challenges(season_id, door) on delete cascade,
  unique(season_id, team_id, door)
);

create index if not exists product_submissions_season_time_idx
on public.product_submissions(season_id, created_at desc);

alter table public.product_submissions enable row level security;

drop policy if exists "Public can read product submissions" on public.product_submissions;
create policy "Public can read product submissions"
on public.product_submissions for select
to anon
using (true);

