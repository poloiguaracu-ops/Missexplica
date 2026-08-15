-- MissExplica: funções administrativas seguras.
-- Execute após schema.sql e rls_hardening.sql.
-- As funções SECURITY DEFINER validam o gestor dentro do banco.

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles
  where id = auth.uid() and active = true
  limit 1;
$$;

create or replace function public.admin_set_user_role(target_user uuid, new_role public.user_role)
returns public.profiles
language plpgsql
security definer
set search_path = public
as $$
declare result public.profiles;
begin
  if auth.uid() is null or public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem alterar perfis';
  end if;
  if target_user = auth.uid() and new_role <> 'manager' then
    raise exception 'O gestor atual não pode remover o próprio acesso de gestor';
  end if;
  update public.profiles set role = new_role, updated_at = now()
  where id = target_user returning * into result;
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
  if auth.uid() is null or public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem alterar status';
  end if;
  if target_user = auth.uid() and new_status = false then
    raise exception 'O gestor atual não pode bloquear a própria conta';
  end if;
  update public.profiles set active = new_status, updated_at = now()
  where id = target_user returning * into result;
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
  if auth.uid() is null or public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem matricular alunos';
  end if;
  if not exists (select 1 from public.profiles where id = target_student and role = 'student' and active = true) then
    raise exception 'O usuário precisa ser um aluno ativo';
  end if;
  if not exists (select 1 from public.courses where id = target_course) then
    raise exception 'Curso não encontrado';
  end if;
  insert into public.enrollments(student_id, course_id, status)
  values (target_student, target_course, 'active')
  on conflict (student_id, course_id)
  do update set status = 'active', enrolled_at = coalesce(public.enrollments.enrolled_at, now()), completed_at = null
  returning * into result;
  return result;
end;
$$;

create or replace function public.admin_cancel_enrollment(target_enrollment uuid)
returns public.enrollments
language plpgsql
security definer
set search_path = public
as $$
declare result public.enrollments;
begin
  if auth.uid() is null or public.current_user_role() <> 'manager' then
    raise exception 'Apenas gestores podem cancelar matrículas';
  end if;
  update public.enrollments set status = 'cancelled'
  where id = target_enrollment returning * into result;
  if result.id is null then raise exception 'Matrícula não encontrada'; end if;
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
  if auth.uid() is null then raise exception 'Usuário não autenticado'; end if;
  insert into public.lesson_progress(student_id, lesson_id, completed, completed_at)
  values (auth.uid(), target_lesson, true, now())
  on conflict (student_id, lesson_id)
  do update set completed = true, completed_at = now(), updated_at = now()
  returning * into result;
  return result;
end;
$$;

-- Restringe a execução a usuários autenticados. A própria função valida o papel.
revoke all on function public.admin_set_user_role(uuid, public.user_role) from public;
revoke all on function public.admin_set_user_status(uuid, boolean) from public;
revoke all on function public.admin_enroll_student(uuid, uuid) from public;
revoke all on function public.admin_cancel_enrollment(uuid) from public;
revoke all on function public.student_complete_lesson(uuid) from public;
grant execute on function public.admin_set_user_role(uuid, public.user_role) to authenticated;
grant execute on function public.admin_set_user_status(uuid, boolean) to authenticated;
grant execute on function public.admin_enroll_student(uuid, uuid) to authenticated;
grant execute on function public.admin_cancel_enrollment(uuid) to authenticated;
grant execute on function public.student_complete_lesson(uuid) to authenticated;
