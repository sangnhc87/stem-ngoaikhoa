create extension if not exists pgcrypto;

create table if not exists public.seasons (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  year integer,
  theme text,
  status text not null check (status in ('DRAFT', 'OPEN', 'CLOSED')) default 'DRAFT',
  start_time timestamptz,
  end_time timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id text not null,
  team_name text not null,
  password_hash text not null,
  current_door integer not null default 1 check (current_door >= 1),
  solved integer not null default 0 check (solved >= 0),
  wrong_count integer not null default 0 check (wrong_count >= 0),
  last_pass_time timestamptz,
  created_at timestamptz not null default now(),
  unique(season_id, team_id)
);

create table if not exists public.challenges (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  door integer not null check (door >= 1),
  title text not null,
  mission text not null,
  file_url text,
  difficulty integer not null default 1 check (difficulty >= 1),
  module text,
  is_boss boolean not null default false,
  created_at timestamptz not null default now(),
  unique(season_id, door)
);

create table if not exists public.answers (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id text not null,
  door integer not null check (door >= 1),
  answer_hash text not null check (answer_hash like 'hmac-sha256:%'),
  created_at timestamptz not null default now(),
  unique(season_id, team_id, door),
  constraint answers_team_fk foreign key (season_id, team_id)
    references public.teams(season_id, team_id) on delete cascade,
  constraint answers_challenge_fk foreign key (season_id, door)
    references public.challenges(season_id, door) on delete cascade
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  team_id text not null,
  door integer not null check (door >= 1),
  submitted_key_hash text check (submitted_key_hash is null or submitted_key_hash like 'hmac-sha256:%'),
  result text not null check (result in ('correct', 'wrong', 'closed', 'invalid', 'rate_limited')),
  user_agent text,
  ip_hash text,
  created_at timestamptz not null default now(),
  constraint submissions_team_fk foreign key (season_id, team_id)
    references public.teams(season_id, team_id) on delete cascade
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  door integer not null check (door >= 1),
  team_id text,
  file_url text not null,
  file_type text,
  created_at timestamptz not null default now(),
  constraint files_challenge_fk foreign key (season_id, door)
    references public.challenges(season_id, door) on delete cascade,
  constraint files_team_fk foreign key (season_id, team_id)
    references public.teams(season_id, team_id) on delete cascade
);

create index if not exists seasons_status_created_idx on public.seasons(status, created_at desc);
create index if not exists teams_leaderboard_idx on public.teams(season_id, solved desc, last_pass_time asc nulls last, wrong_count asc);
create index if not exists teams_wrong_count_idx on public.teams(season_id, wrong_count desc);
create index if not exists challenges_season_door_idx on public.challenges(season_id, door);
create index if not exists answers_lookup_idx on public.answers(season_id, team_id, door);
create index if not exists submissions_team_time_idx on public.submissions(season_id, team_id, created_at desc);
create index if not exists submissions_season_time_idx on public.submissions(season_id, created_at desc);

alter table public.seasons enable row level security;
alter table public.teams enable row level security;
alter table public.challenges enable row level security;
alter table public.answers enable row level security;
alter table public.submissions enable row level security;
alter table public.files enable row level security;

drop policy if exists "Public can read season metadata" on public.seasons;
create policy "Public can read season metadata"
on public.seasons for select
to anon
using (true);

drop policy if exists "Public can read challenge file metadata" on public.files;
create policy "Public can read challenge file metadata"
on public.files for select
to anon
using (true);

create or replace function public.submit_key_attempt(
  p_team_uuid uuid,
  p_session_season_id uuid,
  p_submitted_key_hash text,
  p_user_agent text default null,
  p_ip_hash text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_team public.teams%rowtype;
  v_season public.seasons%rowtype;
  v_answer_hash text;
  v_last_submission timestamptz;
  v_total_doors integer;
  v_door integer;
begin
  select *
  into v_team
  from public.teams
  where id = p_team_uuid
    and season_id = p_session_season_id
  for update;

  if not found then
    return jsonb_build_object('result', 'invalid', 'message', 'Không tìm thấy đội thi.');
  end if;

  v_door := v_team.current_door;

  if p_submitted_key_hash is null or p_submitted_key_hash not like 'hmac-sha256:%' then
    insert into public.submissions (
      season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
    )
    values (
      v_team.season_id, v_team.team_id, v_door, null, 'invalid', p_user_agent, p_ip_hash
    );

    return jsonb_build_object('result', 'invalid', 'message', 'Khóa nộp không hợp lệ.');
  end if;

  select *
  into v_season
  from public.seasons
  where id = v_team.season_id;

  if not found then
    return jsonb_build_object('result', 'invalid', 'message', 'Không tìm thấy mùa thi.');
  end if;

  if v_season.status <> 'OPEN' then
    insert into public.submissions (
      season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
    )
    values (
      v_team.season_id, v_team.team_id, v_door, p_submitted_key_hash, 'closed', p_user_agent, p_ip_hash
    );

    return jsonb_build_object('result', 'closed', 'message', 'Cuộc thi chưa mở hoặc đã đóng.');
  end if;

  select created_at
  into v_last_submission
  from public.submissions
  where season_id = v_team.season_id
    and team_id = v_team.team_id
  order by created_at desc
  limit 1;

  if v_last_submission is not null and v_last_submission > now() - interval '3 seconds' then
    insert into public.submissions (
      season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
    )
    values (
      v_team.season_id, v_team.team_id, v_door, p_submitted_key_hash, 'rate_limited', p_user_agent, p_ip_hash
    );

    return jsonb_build_object('result', 'rate_limited', 'message', 'Vui lòng chờ ít nhất 3 giây trước khi nộp tiếp.');
  end if;

  select count(*)
  into v_total_doors
  from public.challenges
  where season_id = v_team.season_id;

  if v_total_doors = 0 or v_door > v_total_doors then
    insert into public.submissions (
      season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
    )
    values (
      v_team.season_id, v_team.team_id, greatest(v_door, 1), p_submitted_key_hash, 'invalid', p_user_agent, p_ip_hash
    );

    return jsonb_build_object('result', 'invalid', 'message', 'Đội không có cửa hợp lệ để nộp.');
  end if;

  select answer_hash
  into v_answer_hash
  from public.answers
  where season_id = v_team.season_id
    and team_id = v_team.team_id
    and door = v_door;

  if v_answer_hash is null then
    insert into public.submissions (
      season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
    )
    values (
      v_team.season_id, v_team.team_id, v_door, p_submitted_key_hash, 'invalid', p_user_agent, p_ip_hash
    );

    return jsonb_build_object('result', 'invalid', 'message', 'Chưa có đáp án cho đội và cửa này.');
  end if;

  if v_answer_hash = p_submitted_key_hash then
    insert into public.submissions (
      season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
    )
    values (
      v_team.season_id, v_team.team_id, v_door, p_submitted_key_hash, 'correct', p_user_agent, p_ip_hash
    );

    update public.teams
    set solved = solved + 1,
        current_door = current_door + 1,
        last_pass_time = now()
    where id = v_team.id;

    return jsonb_build_object(
      'result', 'correct',
      'message', 'Chính xác. Cửa tiếp theo đã được mở.',
      'solved', v_team.solved + 1,
      'current_door', v_team.current_door + 1
    );
  end if;

  insert into public.submissions (
    season_id, team_id, door, submitted_key_hash, result, user_agent, ip_hash
  )
  values (
    v_team.season_id, v_team.team_id, v_door, p_submitted_key_hash, 'wrong', p_user_agent, p_ip_hash
  );

  update public.teams
  set wrong_count = wrong_count + 1
  where id = v_team.id;

  return jsonb_build_object(
    'result', 'wrong',
    'message', 'Khóa chưa đúng. Hãy kiểm tra lại manh mối.',
    'wrong_count', v_team.wrong_count + 1
  );
end;
$$;

revoke all on function public.submit_key_attempt(uuid, uuid, text, text, text) from public;
grant execute on function public.submit_key_attempt(uuid, uuid, text, text, text) to service_role;

insert into storage.buckets (id, name, public)
values ('challenge-files', 'challenge-files', true)
on conflict (id) do update set public = excluded.public;

drop policy if exists "Public can read challenge files" on storage.objects;
create policy "Public can read challenge files"
on storage.objects for select
to anon
using (bucket_id = 'challenge-files');

drop policy if exists "Service role can manage challenge files" on storage.objects;
create policy "Service role can manage challenge files"
on storage.objects for all
to service_role
using (bucket_id = 'challenge-files')
with check (bucket_id = 'challenge-files');
