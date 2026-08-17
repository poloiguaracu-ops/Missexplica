-- MissExplica — identificação acadêmica interna (RU) e login do aluno.
-- O RU é um identificador da MissExplica. Não é um documento oficial nem substitui o CPF/RA da instituição parceira.

create sequence if not exists public.missexplica_ru_seq start 100001;

alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists ru text;
alter table public.profiles add column if not exists ru_issued_at timestamptz;

create unique index if not exists profiles_cpf_unique_idx
on public.profiles(cpf) where cpf is not null;

create unique index if not exists profiles_ru_unique_idx
on public.profiles(ru) where ru is not null;

create or replace function public.normalize_cpf(value text)
returns text language sql immutable as $$
  select nullif(regexp_replace(coalesce(value,''),'[^0-9]','','g'),'')
$$;

create or replace function public.issue_student_ru(target_student uuid)
returns text language plpgsql security definer set search_path=public as $$
declare
  current_ru text;
begin
  if public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem gerar RU';
  end if;

  select ru into current_ru from public.profiles where id=target_student for update;
  if not found then raise exception 'Aluno não encontrado'; end if;
  if current_ru is not null then return current_ru; end if;

  current_ru := 'MX' || nextval('public.missexplica_ru_seq')::text;
  update public.profiles set ru=current_ru,ru_issued_at=now(),role='student' where id=target_student;
  return current_ru;
end; $$;

grant execute on function public.issue_student_ru(uuid) to authenticated;

-- Matrícula continua sendo a regra que libera os cursos.
-- O aluno autentica na conta e o RLS das tabelas de cursos/matrículas decide o que ele pode acessar.
