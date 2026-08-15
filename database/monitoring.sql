-- MissExplica: consultas de monitoramento para o gestor.
-- Execute no SQL Editor quando precisar acompanhar a operação.

create or replace view public.manager_course_stats as
select
  c.id as course_id,
  c.title,
  c.published,
  count(distinct e.student_id) filter (where e.status in ('active','completed')) as enrolled_students,
  count(distinct lp.student_id) as students_with_progress,
  count(lp.id) filter (where lp.completed = true) as completed_lessons
from public.courses c
left join public.enrollments e on e.course_id = c.id
left join public.modules m on m.course_id = c.id
left join public.lessons l on l.module_id = m.id
left join public.lesson_progress lp on lp.lesson_id = l.id
group by c.id, c.title, c.published;

create or replace view public.manager_platform_stats as
select
  (select count(*) from public.profiles where active = true) as active_users,
  (select count(*) from public.profiles where role = 'student' and active = true) as active_students,
  (select count(*) from public.profiles where role = 'teacher' and active = true) as active_teachers,
  (select count(*) from public.courses where published = true) as published_courses,
  (select count(*) from public.enrollments where status in ('active','completed')) as active_enrollments;

-- As views acima devem ser consultadas apenas por gestores.
revoke all on public.manager_course_stats from anon, authenticated;
revoke all on public.manager_platform_stats from anon, authenticated;
-- Se seu projeto usar uma role específica de gestor/backend, conceda SELECT nessa role.
