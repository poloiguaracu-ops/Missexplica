-- MissExplica — rate limiting persistente para CPF + RU.
create table if not exists public.login_attempts (
  id uuid primary key default gen_random_uuid(),
  subject_hash text not null,
  ip_hash text not null,
  attempted_at timestamptz not null default now(),
  successful boolean not null default false
);
create index if not exists login_attempts_lookup_idx on public.login_attempts(subject_hash,ip_hash,attempted_at desc);
alter table public.login_attempts enable row level security;
revoke all on public.login_attempts from public,anon,authenticated;

create or replace function public.check_login_rate_limit(p_subject_hash text,p_ip_hash text,p_window_seconds integer default 900,p_max_attempts integer default 8)
returns boolean language plpgsql security definer set search_path=public as $$
declare attempts integer;
begin
  delete from public.login_attempts where attempted_at < now() - interval '1 day';
  select count(*) into attempts from public.login_attempts where subject_hash=p_subject_hash and ip_hash=p_ip_hash and attempted_at >= now() - make_interval(secs=>p_window_seconds);
  if attempts >= p_max_attempts then return false; end if;
  insert into public.login_attempts(subject_hash,ip_hash,successful) values(p_subject_hash,p_ip_hash,false);
  return true;
end; $$;

revoke all on function public.check_login_rate_limit(text,text,integer,integer) from public,anon,authenticated;
grant execute on function public.check_login_rate_limit(text,text,integer,integer) to service_role;
