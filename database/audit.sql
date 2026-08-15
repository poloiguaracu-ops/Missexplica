-- MissExplica: trilha básica de auditoria administrativa.
-- Execute após schema.sql.
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_audit_actor_date on public.audit_log(actor_id, created_at desc);
create index if not exists idx_audit_entity on public.audit_log(entity_type, entity_id, created_at desc);

alter table public.audit_log enable row level security;
drop policy if exists "audit manager read" on public.audit_log;
create policy "audit manager read" on public.audit_log
for select to authenticated
using (public.current_user_role() = 'manager');

create or replace function public.write_audit_event(p_action text,p_entity_type text default null,p_entity_id uuid default null,p_metadata jsonb default '{}'::jsonb)
returns void language plpgsql security definer set search_path=public
as $$
begin
  if auth.uid() is null then raise exception 'Usuário não autenticado'; end if;
  insert into public.audit_log(actor_id,action,entity_type,entity_id,metadata)
  values(auth.uid(),p_action,p_entity_type,p_entity_id,coalesce(p_metadata,'{}'::jsonb));
end;
$$;
revoke all on function public.write_audit_event(text,text,uuid,jsonb) from public;
grant execute on function public.write_audit_event(text,text,uuid,jsonb) to authenticated;
