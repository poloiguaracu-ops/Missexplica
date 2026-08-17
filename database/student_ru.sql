-- MissExplica — identidade acadêmica única do aluno.
-- O RU é identificador interno da MissExplica e não substitui RA/registro da instituição parceira.
create sequence if not exists public.missexplica_ru_seq start 100001;
alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists ru text;
alter table public.profiles add column if not exists ru_issued_at timestamptz;
alter table public.profiles add column if not exists active boolean not null default true;
create unique index if not exists profiles_cpf_unique_idx on public.profiles(cpf) where cpf is not null;
create unique index if not exists profiles_ru_unique_idx on public.profiles(ru) where ru is not null;
create or replace function public.normalize_cpf(value text)
returns text language sql immutable as $$ select nullif(regexp_replace(coalesce(value,''),'[^0-9]','','g'),'') $$;
create or replace function public.issue_student_ru(target_student uuid)
returns text language plpgsql security definer set search_path=public as $$
declare current_ru text;
begin
 if public.current_user_role()<>'manager' then raise exception 'Apenas gestores podem gerar RU'; end if;
 select ru into current_ru from public.profiles where id=target_student and role='student' for update;
 if not found then raise exception 'Aluno não encontrado'; end if;
 if current_ru is not null then return current_ru; end if;
 current_ru := 'MX' || lpad(nextval('public.missexplica_ru_seq')::text,6,'0');
 update public.profiles set ru=current_ru,ru_issued_at=now() where id=target_student;
 return current_ru;
end; $$;
grant execute on function public.issue_student_ru(uuid) to authenticated;
create or replace function public.assign_student_identity(target_user uuid,target_cpf text)
returns public.profiles language plpgsql security definer set search_path=public as $$
declare r public.profiles; normalized text;
begin
 if public.current_user_role()<>'manager' then raise exception 'Apenas gestores podem cadastrar identidade'; end if;
 normalized:=public.normalize_cpf(target_cpf);
 if length(normalized)<>11 then raise exception 'CPF inválido'; end if;
 if exists(select 1 from public.profiles where cpf=normalized and id<>target_user) then raise exception 'CPF já cadastrado'; end if;
 update public.profiles set cpf=normalized,ru=coalesce(ru,public.issue_student_ru(target_user)) where id=target_user and role='student' returning * into r;
 if not found then raise exception 'Aluno não encontrado'; end if;
 return r;
end; $$;
grant execute on function public.assign_student_identity(uuid,text) to authenticated;
