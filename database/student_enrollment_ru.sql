-- MissExplica — matrícula que já garante RU ao aluno.
-- Execute depois de student_ru.sql.
create or replace function public.manager_enroll_student(target_student uuid, target_course uuid)
returns public.enrollments language plpgsql security definer set search_path=public as $$
declare
  r public.enrollments;
  generated_ru text;
begin
  if public.current_user_role() <> 'manager' then raise exception 'Apenas gestores podem matricular alunos'; end if;
  if not exists(select 1 from public.profiles where id=target_student and role='student' and active=true) then raise exception 'Aluno não encontrado ou bloqueado'; end if;
  if not exists(select 1 from public.courses where id=target_course) then raise exception 'Curso não encontrado'; end if;

  select ru into generated_ru from public.profiles where id=target_student for update;
  if generated_ru is null then
    generated_ru := 'MX' || nextval('public.missexplica_ru_seq')::text;
    update public.profiles set ru=generated_ru,ru_issued_at=now() where id=target_student;
  end if;

  insert into public.enrollments(student_id,course_id,status)
  values(target_student,target_course,'active')
  on conflict (student_id,course_id) do update set status='active'
  returning * into r;

  return r;
end; $$;

grant execute on function public.manager_enroll_student(uuid,uuid) to authenticated;
