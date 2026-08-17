-- MissExplica — modelo canônico de progresso por aluno/aula.
-- Execute depois de database/schema.sql e database/rls_hardening.sql.

alter table public.lesson_progress add column if not exists completed boolean not null default false;
alter table public.lesson_progress add column if not exists watched_seconds integer not null default 0 check (watched_seconds >= 0);
alter table public.lesson_progress add column if not exists updated_at timestamptz not null default now();
alter table public.lesson_progress add column if not exists completed_at timestamptz;

update public.lesson_progress
set completed = true
where completed_at is not null and completed is distinct from true;

update public.lesson_progress
set completed_at = coalesce(completed_at, updated_at, now())
where completed = true and completed_at is null;

create index if not exists lesson_progress_student_idx on public.lesson_progress(student_id);
create index if not exists lesson_progress_lesson_idx on public.lesson_progress(lesson_id);

alter table public.lesson_progress enable row level security;

drop policy if exists "students manage own progress" on public.lesson_progress;
drop policy if exists "teachers managers read course progress" on public.lesson_progress;
drop policy if exists "student own progress" on public.lesson_progress;
drop policy if exists "progress own enrolled" on public.lesson_progress;

create policy "progress own enrolled" on public.lesson_progress
for all to authenticated
using (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_progress.lesson_id
      and e.student_id = auth.uid()
      and e.status in ('active','completed')
  )
)
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.enrollments e on e.course_id = m.course_id
    where l.id = lesson_progress.lesson_id
      and e.student_id = auth.uid()
      and e.status in ('active','completed')
  )
);

create policy "teachers managers read course progress" on public.lesson_progress
for select to authenticated
using (
  public.current_user_role() = 'manager'
  or exists (
    select 1 from public.lessons l
    join public.modules m on m.id = l.module_id
    join public.courses c on c.id = m.course_id
    where l.id = lesson_progress.lesson_id
      and c.teacher_id = auth.uid()
  )
);
