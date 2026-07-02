alter table public.teams
  add column if not exists active_session_token text,
  add column if not exists active_session_at timestamptz;

create index if not exists teams_active_session_idx
on public.teams(active_session_token)
where active_session_token is not null;
