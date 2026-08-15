-- MissExplica — gestor atribui professor ao curso.
create or replace function public.manager_assign_teacher(target_course uuid, target_teacher uuid)
returns void language plpgsql security definer set search_path=public as $$
begin
 if public.current_user_role() <> 'manager' then raise exception 'Apenas gestores podem atribuir professores'; end if;
 if not exists(select 1 from public.profiles where id=target_teacher and role='teacher') then raise exception 'Usuário não é professor'; end if;
 if not exists(select 1 from public.courses where id=target_course) then raise exception 'Curso não encontrado'; end if;
 update public.courses set teacher_id=target_teacher where id=target_course;
end; $$;

grant execute on function public.manager_assign_teacher(uuid,uuid) to authenticated;
