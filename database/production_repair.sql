-- MissExplica — reparo estrutural consolidado.
-- Execute este arquivo DEPOIS do database/schema.sql e antes das funções de gestão.

alter table public.courses add column if not exists teacher_id uuid references public.profiles(id) on delete set null;
create index if not exists idx_courses_teacher on public.courses(teacher_id);

create sequence if not exists public.missexplica_ru_seq start 100001;

alter table public.profiles add column if not exists cpf text;
alter table public.profiles add column if not exists ru text;
alter table public.profiles add column if not exists ru_issued_at timestamptz;
alter table public.profiles add column if not exists active boolean not null default true;

create or replace function public.normalize_cpf(value text)
returns text language sql immutable as $$
  select nullif(regexp_replace(coalesce(value,''),'[^0-9]','','g'),'')
$$;

create unique index if not exists profiles_cpf_unique_idx on public.profiles(cpf) where cpf is not null;
create unique index if not exists profiles_ru_unique_idx on public.profiles(ru) where ru is not null;

create or replace function public.issue_student_ru(target_student uuid)
returns text language plpgsql security definer set search_path=public as $$
declare current_ru text;
begin
  if public.current_user_role() <> 'manager' then raise exception 'Apenas gestores podem gerar RU'; end if;
  select ru into current_ru from public.profiles where id=target_student and role='student' for update;
  if not found then raise exception 'Aluno não encontrado'; end if;
  if current_ru is not null then return current_ru; end if;
  current_ru := 'MX' || lpad(nextval('public.missexplica_ru_seq')::text,6,'0');
  update public.profiles set ru=current_ru,ru_issued_at=now() where id=target_student;
  return current_ru;
end; $$;

grant execute on function public.issue_student_ru(uuid) to authenticated;

create or replace function public.manager_enroll_student(target_student uuid,target_course uuid)
returns public.enrollments language plpgsql security definer set search_path=public as $$
declare r public.enrollments;
begin
  if public.current_user_role() <> 'manager' then raise exception 'Apenas gestores podem matricular alunos'; end if;
  if not exists(select 1 from public.profiles where id=target_student and role='student' and active=true) then raise exception 'Aluno não encontrado ou bloqueado'; end if;
  if not exists(select 1 from public.courses where id=target_course) then raise exception 'Curso não encontrado'; end if;
  perform public.issue_student_ru(target_student);
  insert into public.enrollments(student_id,course_id,status) values(target_student,target_course,'active')
  on conflict(student_id,course_id) do update set status='active' returning * into r;
  return r;
end; $$;

grant execute on function public.manager_enroll_student(uuid,uuid) to authenticated;

-- Um único caminho de autorização para professores.
create or replace function public.teacher_can_manage_course(target_course uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.current_user_role() in ('teacher','manager')
  and exists(select 1 from public.courses c where c.id=target_course and (c.teacher_id=auth.uid() or public.current_user_role()='manager'));
$$;

grant execute on function public.teacher_can_manage_course(uuid) to authenticated;
