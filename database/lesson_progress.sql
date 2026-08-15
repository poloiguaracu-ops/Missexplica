-- MissExplica — progresso por aluno/aula.
create table if not exists public.lesson_progress (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete cascade,
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 completed_at timestamptz not null default now(),
 unique(student_id,lesson_id)
);
create index if not exists lesson_progress_student_idx on public.lesson_progress(student_id);
alter table public.lesson_progress enable row level security;
create policy "students manage own progress" on public.lesson_progress for all to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());
create policy "teachers managers read course progress" on public.lesson_progress for select to authenticated using (
 public.current_user_role()='manager' or exists(
   select 1 from public.lessons l join public.modules m on m.id=l.module_id join public.courses c on c.id=m.course_id
   where l.id=lesson_progress.lesson_id and c.teacher_id=auth.uid()
 )
);
