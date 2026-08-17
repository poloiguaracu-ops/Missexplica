-- MissExplica — funções canônicas de progresso do aluno.
-- Execute depois de schema.sql, rls_hardening.sql, production_repair.sql e lesson_progress.sql.

create or replace function public.student_complete_lesson(target_lesson uuid)
returns public.lesson_progress
language plpgsql
security invoker
set search_path=public
as $$
declare r public.lesson_progress;
begin
  if auth.uid() is null then raise exception 'Usuário não autenticado'; end if;
  if not exists(
    select 1 from public.lessons l
    join public.modules m on m.id=l.module_id
    join public.enrollments e on e.course_id=m.course_id
    where l.id=target_lesson and l.published=true
      and e.student_id=auth.uid() and e.status in ('active','completed')
  ) then raise exception 'Aula não disponível para este aluno'; end if;

  insert into public.lesson_progress(student_id,lesson_id,completed,completed_at,updated_at)
  values(auth.uid(),target_lesson,true,now(),now())
  on conflict(student_id,lesson_id) do update
    set completed=true, completed_at=coalesce(public.lesson_progress.completed_at,now()), updated_at=now()
  returning * into r;
  return r;
end;
$$;

revoke all on function public.student_complete_lesson(uuid) from public;
grant execute on function public.student_complete_lesson(uuid) to authenticated;
