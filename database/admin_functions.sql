-- Funções administrativas da MissExplica.
-- Execute após schema.sql e rls_hardening.sql.
-- Estas funções permitem que o gestor administre perfis/matrículas sem expor service_role ao navegador.

create or replace function public.admin_set_user_role(target_user uuid, new_role public.user_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare result public.profiles;
begin
  if public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem alterar perfis';
  end if;

  update public.profiles
     set role = new_role, updated_at = now()
   where id = target_user
   returning * into result;

  if result.id is null then raise exception 'Usuário não encontrado'; end if;
  return result;
end;
$$;

create or replace function public.admin_set_user_status(target_user uuid, new_status boolean)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare result public.profiles;
begin
  if public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem alterar status';
  end if;

  update public.profiles
     set active = new_status, updated_at = now()
   where id = target_user
   returning * into result;

  if result.id is null then raise exception 'Usuário não encontrado'; end if;
  return result;
end;
$$;

create or replace function public.admin_enroll_student(target_student uuid, target_course uuid)
returns public.enrollments
language plpgsql
security definer
set search_path = public
as $$
declare result public.enrollments;
begin
  if public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem matricular alunos';
  end if;

  insert into public.enrollments(student_id, course_id, status)
  values (target_student, target_course, 'active')
  on conflict (student_id, course_id)
  do update set status = 'active', updated_at = now()
  returning * into result;

  return result;
end;
$$;

create or replace function public.student_complete_lesson(target_lesson uuid)
returns public.lesson_progress
language plpgsql
security invoker
set search_path = public
as $$
declare result public.lesson_progress;
begin
  insert into public.lesson_progress(student_id, lesson_id, completed, completed_at)
  values (auth.uid(), target_lesson, true, now())
  on conflict (student_id, lesson_id)
  do update set completed = true, completed_at = now(), updated_at = now()
  returning * into result;

  return result;
end;
$$;

grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_set_user_status(uuid, boolean) to authenticated;
grant execute on function public.admin_enroll_student(uuid, uuid) to authenticated;
grant execute on function public.student_complete_lesson(uuid) to authenticated;
