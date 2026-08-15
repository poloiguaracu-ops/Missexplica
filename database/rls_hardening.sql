-- MissExplica: endurecimento das regras de acesso.
-- Execute DEPOIS de database/schema.sql no SQL Editor do Supabase.

-- Função auxiliar: papel do usuário autenticado.
create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid() and active = true limit 1;
$$;

revoke all on function public.current_user_role() from public;
grant execute on function public.current_user_role() to authenticated;

-- Remove políticas permissivas/insuficientes antes de recriar regras de domínio.
drop policy if exists "published courses read" on public.courses;
drop policy if exists "student own enrollments" on public.enrollments;
drop policy if exists "student own progress" on public.lesson_progress;
drop policy if exists "student own certificates" on public.certificates;
drop policy if exists "messages sender recipient" on public.messages;

-- CURSOS: autenticados podem descobrir cursos publicados; gestores e professores
-- podem consultar cursos que administram.
create policy "courses authenticated read" on public.courses
for select to authenticated
using (
  published = true
  or created_by = auth.uid()
  or public.current_user_role() = 'manager'
);

create policy "courses teacher create" on public.courses
for insert to authenticated
with check (
  public.current_user_role() in ('teacher','manager')
  and created_by = auth.uid()
);

create policy "courses manager or owner update" on public.courses
for update to authenticated
using (
  public.current_user_role() = 'manager' or created_by = auth.uid()
)
with check (
  public.current_user_role() = 'manager' or created_by = auth.uid()
);

-- MÓDULOS: somente cursos publicados, próprios do professor ou administrados pelo gestor.
create policy "modules enrolled or staff read" on public.modules
for select to authenticated
using (
  exists (select 1 from public.courses c where c.id = course_id and c.published = true)
  or exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid())
  or public.current_user_role() = 'manager'
);

create policy "modules staff write" on public.modules
for all to authenticated
using (
  public.current_user_role() = 'manager'
  or exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid())
)
with check (
  public.current_user_role() = 'manager'
  or exists (select 1 from public.courses c where c.id = course_id and c.created_by = auth.uid())
);

-- AULAS: aluno só enxerga aulas publicadas de cursos nos quais possui matrícula ativa/completa.
-- Professor/gestor enxerga o conteúdo que administra.
create policy "lessons access by enrollment" on public.lessons
for select to authenticated
using (
  (
    published = true and exists (
      select 1 from public.modules m
      join public.enrollments e on e.course_id = m.course_id
      where m.id = module_id
        and e.student_id = auth.uid()
        and e.status in ('active','completed')
    )
  )
  or exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.created_by = auth.uid()
  )
  or public.current_user_role() = 'manager'
);

create policy "lessons staff write" on public.lessons
for all to authenticated
using (
  public.current_user_role() = 'manager'
  or exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.created_by = auth.uid()
  )
)
with check (
  public.current_user_role() = 'manager'
  or exists (
    select 1 from public.modules m
    join public.courses c on c.id = m.course_id
    where m.id = module_id and c.created_by = auth.uid()
  )
);

-- MATRÍCULAS: aluno lê somente a própria; gestor administra.
create policy "enrollment own read" on public.enrollments
for select to authenticated using (student_id = auth.uid() or public.current_user_role() = 'manager');

create policy "enrollment manager manage" on public.enrollments
for all to authenticated
using (public.current_user_role() = 'manager')
with check (public.current_user_role() = 'manager');

-- PROGRESSO: aluno só pode gravar seu próprio progresso e apenas de aula que pertence
-- a um curso no qual está matriculado. Gestor/teacher não alteram progresso pelo cliente.
create policy "progress own enrolled" on public.lesson_progress
for all to authenticated
using (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_id and e.student_id = auth.uid() and e.status in ('active','completed')
  )
)
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_id and e.student_id = auth.uid() and e.status in ('active','completed')
  )
);

-- MATERIAIS: acesso apenas se a aula estiver acessível ao usuário.
create policy "materials access" on public.materials
for select to authenticated
using (
  exists (select 1 from public.lessons l where l.id = lesson_id and l.published = true)
  and (
    exists (
      select 1 from public.lessons l
      join public.modules m on m.id = l.module_id
      join public.enrollments e on e.course_id = m.course_id
      where l.id = lesson_id and e.student_id = auth.uid() and e.status in ('active','completed')
    )
    or public.current_user_role() = 'manager'
  )
);

-- CERTIFICADOS: próprio aluno ou gestor.
create policy "certificates own read" on public.certificates
for select to authenticated
using (student_id = auth.uid() or public.current_user_role() = 'manager');

-- MENSAGENS: remetente/destinatário. Inserção somente como o próprio remetente.
create policy "messages participants read" on public.messages
for select to authenticated
using (sender_id = auth.uid() or recipient_id = auth.uid());

create policy "messages own send" on public.messages
for insert to authenticated
with check (sender_id = auth.uid());

create policy "messages recipient mark read" on public.messages
for update to authenticated
using (recipient_id = auth.uid())
with check (recipient_id = auth.uid());

-- AULAS AO VIVO: aluno só vê eventos de curso em que está matriculado; equipe vê os seus.
create policy "live classes access" on public.live_classes
for select to authenticated
using (
  exists (select 1 from public.enrollments e where e.course_id = live_classes.course_id and e.student_id = auth.uid() and e.status in ('active','completed'))
  or teacher_id = auth.uid()
  or public.current_user_role() = 'manager'
);

create policy "live classes staff manage" on public.live_classes
for all to authenticated
using (teacher_id = auth.uid() or public.current_user_role() = 'manager')
with check (teacher_id = auth.uid() or public.current_user_role() = 'manager');

-- Índices adicionais para consultas do AVA.
create index if not exists idx_courses_created_by on public.courses(created_by);
create index if not exists idx_lessons_published on public.lessons(module_id, published, position);
create index if not exists idx_live_classes_course_date on public.live_classes(course_id, starts_at);
create index if not exists idx_messages_sender on public.messages(sender_id, created_at desc);
