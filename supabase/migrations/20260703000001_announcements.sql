

-- ======================================================
-- Bảng announcements: thông báo phát sóng từ admin
-- ======================================================
create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  season_id uuid not null references public.seasons(id) on delete cascade,
  message text not null,
  is_active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists announcements_season_idx on public.announcements(season_id, is_active, created_at desc);

-- ======================================================
-- Row Level Security
-- ======================================================
alter table public.announcements enable row level security;

-- Chỉ service_role được quản lý announcements
drop policy if exists "Service role manages announcements" on public.announcements;
create policy "Service role manages announcements"
on public.announcements for all
to service_role
using (true)
with check (true);

-- anon có thể đọc announcements đang hoạt động
drop policy if exists "Public can read active announcements" on public.announcements;
create policy "Public can read active announcements"
on public.announcements for select
to anon
using (
  is_active = true
  and (expires_at is null or expires_at > now())
);
