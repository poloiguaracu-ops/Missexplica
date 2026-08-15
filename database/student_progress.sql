-- MissExplica: visão segura de progresso do próprio aluno.
create or replace function public.student_course_progress(target_course uuid)
returns jsonb
language plpgsql
security invoker
set search_path = public
as $$
declare result jsonb;
begin
  if auth.uid() is null then raise exception 'Usuário não autenticado'; end if;
  if not exists (select 1 from public.enrollments where student_id=auth.uid() and course_id=target_course and status in ('active','completed')) then
    raise exception 'Você não possui matrícula ativa neste curso';
  end if;
  select jsonb_build_object(
    'course_id',target_course,
    'total_lessons',(select count(*) from public.lessons l join public.modules m on m.id=l.module_id where m.course_id=target_course and l.published=true),
    'completed_lessons',(select count(*) from public.lesson_progress p join public.lessons l on l.id=p.lesson_id join public.modules m on m.id=l.module_id where p.student_id=auth.uid() and p.completed=true and m.course_id=target_course)
  ) into result;
  return result;
end;
$$;
revoke all on function public.student_course_progress(uuid) from public;
grant execute on function public.student_course_progress(uuid) to authenticated;
