-- MissExplica — ações administrativas seguras.
create or replace function public.manager_set_role(target_user uuid, new_role text)
returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_user_role() <> 'manager' then raise exception 'Apenas gestores podem alterar funções'; end if;
 if new_role not in ('student','teacher','manager') then raise exception 'Função inválida'; end if;
 update public.profiles set role=new_role where id=target_user;
 if not found then raise exception 'Usuário não encontrado'; end if;
end; $$;

create or replace function public.manager_enroll_student(target_student uuid, target_course uuid)
returns public.enrollments language plpgsql security definer set search_path=public as $$
declare r public.enrollments;
begin
 if public.current_user_role() <> 'manager' then raise exception 'Apenas gestores podem matricular alunos'; end if;
 if not exists(select 1 from public.profiles where id=target_student and role='student') then raise exception 'Usuário não é aluno'; end if;
 if not exists(select 1 from public.courses where id=target_course) then raise exception 'Curso não encontrado'; end if;
 insert into public.enrollments(student_id,course_id,status) values(target_student,target_course,'active')
 on conflict (student_id,course_id) do update set status='active'
 returning * into r;
 return r;
end; $$;

grant execute on function public.manager_set_role(uuid,text) to authenticated;
grant execute on function public.manager_enroll_student(uuid,uuid) to authenticated;
