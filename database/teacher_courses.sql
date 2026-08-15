-- MissExplica — consulta segura dos cursos do professor logado.
create or replace view public.my_teacher_courses as
select c.id,c.title,c.published,c.teacher_id
from public.courses c
where c.teacher_id=auth.uid();

alter view public.my_teacher_courses set (security_invoker=true);

grant select on public.my_teacher_courses to authenticated;
