-- MissExplica — permissões do professor.
-- O professor só pode administrar cursos atribuídos a ele.

create or replace function public.teacher_can_manage_course(target_course uuid)
returns boolean language sql stable security definer set search_path=public as $$
  select public.current_user_role() in ('teacher','manager')
  and exists (select 1 from public.courses c where c.id=target_course and (c.teacher_id=auth.uid() or public.current_user_role()='manager'));
$$;

create or replace function public.teacher_create_module(target_course uuid, module_title text)
returns public.modules language plpgsql security definer set search_path=public as $$
declare r public.modules;
begin
  if not public.teacher_can_manage_course(target_course) then raise exception 'Sem permissão para este curso'; end if;
  if length(trim(module_title))<2 then raise exception 'Nome do módulo inválido'; end if;
  insert into public.modules(course_id,title,position) values(target_course,trim(module_title),(select coalesce(max(position),0)+1 from public.modules where course_id=target_course)) returning * into r;
  return r;
end; $$;

create or replace function public.teacher_create_lesson(target_module uuid, lesson_title text, lesson_description text, lesson_video_url text)
returns public.lessons language plpgsql security definer set search_path=public as $$
declare r public.lessons; c uuid;
begin
  select course_id into c from public.modules where id=target_module;
  if c is null or not public.teacher_can_manage_course(c) then raise exception 'Sem permissão para este módulo'; end if;
  if length(trim(lesson_title))<2 then raise exception 'Nome da aula inválido'; end if;
  insert into public.lessons(module_id,title,description,video_url,position,published) values(target_module,trim(lesson_title),nullif(trim(lesson_description),''),nullif(trim(lesson_video_url),''),(select coalesce(max(position),0)+1 from public.lessons where module_id=target_module),false) returning * into r;
  return r;
end; $$;

create or replace function public.teacher_publish_lesson(target_lesson uuid, new_published boolean)
returns public.lessons language plpgsql security definer set search_path=public as $$
declare r public.lessons; c uuid;
begin
  select m.course_id into c from public.lessons l join public.modules m on m.id=l.module_id where l.id=target_lesson;
  if c is null or not public.teacher_can_manage_course(c) then raise exception 'Sem permissão para esta aula'; end if;
  update public.lessons set published=new_published where id=target_lesson returning * into r;
  return r;
end; $$;

revoke all on function public.teacher_create_module(uuid,text) from public;
revoke all on function public.teacher_create_lesson(uuid,text,text,text) from public;
revoke all on function public.teacher_publish_lesson(uuid,boolean) from public;
grant execute on function public.teacher_create_module(uuid,text) to authenticated;
grant execute on function public.teacher_create_lesson(uuid,text,text,text) to authenticated;
grant execute on function public.teacher_publish_lesson(uuid,boolean) to authenticated;
