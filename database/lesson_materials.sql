-- MissExplica — materiais anexos às aulas.
create table if not exists public.lesson_materials (
 id uuid primary key default gen_random_uuid(),
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade,
 title text not null check (char_length(trim(title)) between 1 and 180),
 file_url text not null,
 file_name text not null,
 mime_type text,
 size_bytes bigint check (size_bytes is null or size_bytes>=0),
 created_at timestamptz not null default now()
);
create index if not exists lesson_materials_lesson_idx on public.lesson_materials(lesson_id,created_at);
alter table public.lesson_materials enable row level security;
create policy "enrolled students read materials" on public.lesson_materials for select to authenticated using (
 public.current_user_role()='manager' or exists(select 1 from public.enrollments e where e.course_id=lesson_materials.course_id and e.student_id=auth.uid() and e.status in ('active','completed'))
);
create policy "assigned teachers manage materials" on public.lesson_materials for insert to authenticated with check (
 public.current_user_role()='manager' or exists(select 1 from public.courses c where c.id=course_id and c.teacher_id=auth.uid())
);
create policy "assigned teachers update materials" on public.lesson_materials for update to authenticated using (public.current_user_role()='manager' or exists(select 1 from public.courses c where c.id=course_id and c.teacher_id=auth.uid())) with check (public.current_user_role()='manager' or exists(select 1 from public.courses c where c.id=course_id and c.teacher_id=auth.uid()));
create policy "assigned teachers delete materials" on public.lesson_materials for delete to authenticated using (public.current_user_role()='manager' or exists(select 1 from public.courses c where c.id=course_id and c.teacher_id=auth.uid()));
