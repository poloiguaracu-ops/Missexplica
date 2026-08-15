-- MissExplica: camada segura para o dashboard do gestor.
-- Execute após schema.sql e admin_functions.sql.

create or replace function public.manager_dashboard()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare result jsonb;
begin
  if auth.uid() is null or public.current_user_role() <> 'manager' then
    raise exception 'Acesso restrito a gestores';
  end if;

  select jsonb_build_object(
    'users', (select count(*) from public.profiles where active = true),
    'students', (select count(*) from public.profiles where role = 'student' and active = true),
    'teachers', (select count(*) from public.profiles where role = 'teacher' and active = true),
    'courses', (select count(*) from public.courses where published = true),
    'enrollments', (select count(*) from public.enrollments where status = 'active'),
    'completed_lessons', (select count(*) from public.lesson_progress where completed = true),
    'courses_detail', coalesce((
      select jsonb_agg(jsonb_build_object(
        'id', c.id,
        'title', c.title,
        'published', c.published,
        'students', (select count(*) from public.enrollments e where e.course_id = c.id and e.status in ('active','completed'))
      ) order by c.title)
      from public.courses c
    ), '[]'::jsonb)
  ) into result;

  return result;
end;
$$;

revoke all on function public.manager_dashboard() from public;
grant execute on function public.manager_dashboard() to authenticated;

comment on function public.manager_dashboard() is 'Retorna indicadores administrativos somente para gestores autenticados.';
