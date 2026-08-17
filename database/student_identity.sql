-- MissExplica — identidade acadêmica do aluno.
create extension if not exists pgcrypto;
alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists ru text;
alter table public.profiles add column if not exists active boolean not null default true;
create unique index if not exists profiles_ru_unique on public.profiles(ru) where ru is not null;
create unique index if not exists profiles_cpf_unique on public.profiles(cpf) where cpf is not null;

create or replace function public.normalize_cpf(value text)
returns text language sql immutable as $$ select regexp_replace(coalesce(value,''),'[^0-9]','','g') $$;

create or replace function public.generate_student_ru()
returns text language plpgsql as $$
declare candidate text;
begin
 loop
  candidate := 'MX' || lpad(nextval('student_ru_seq')::text,6,'0');
  exit when not exists(select 1 from public.profiles where ru=candidate);
 end loop;
 return candidate;
end; $$;

create sequence if not exists student_ru_seq start 100001;

create or replace function public.assign_student_identity(target_user uuid, target_cpf text)
returns public.profiles language plpgsql security definer set search_path=public as $$
declare r public.profiles; normalized text;
begin
 if public.current_user_role()<>'manager' then raise exception 'Apenas gestores podem gerar RU'; end if;
 normalized:=public.normalize_cpf(target_cpf);
 if length(normalized)<>11 then raise exception 'CPF inválido'; end if;
 if exists(select 1 from public.profiles where cpf=normalized and id<>target_user) then raise exception 'CPF já cadastrado'; end if;
 update public.profiles set cpf=normalized, ru=coalesce(ru,public.generate_student_ru()) where id=target_user and role='student' returning * into r;
 if not found then raise exception 'Aluno não encontrado'; end if;
 return r;
end; $$;

grant execute on function public.assign_student_identity(uuid,text) to authenticated;
