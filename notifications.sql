-- MissExplica — notificações persistentes.
create table if not exists public.notifications (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.profiles(id) on delete cascade,
 type text not null check (type in ('message','course','lesson','system')),
 title text not null check (char_length(trim(title)) between 1 and 180),
 body text not null default '' check (char_length(body)<=1000),
 link text,
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id,created_at desc);
alter table public.notifications enable row level security;
create policy "users read own notifications" on public.notifications for select to authenticated using(user_id=auth.uid());
create policy "users mark own notifications" on public.notifications for update to authenticated using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "authenticated create notifications" on public.notifications for insert to authenticated with check(user_id is not null);
