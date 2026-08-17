-- MissExplica — matrícula do aluno com RU único e automático.
-- Caminho canônico: use este fluxo depois de database/production_repair.sql.
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
