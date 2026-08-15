-- MissExplica — avisos persistentes do curso.
create table if not exists public.course_announcements (
 id uuid primary key default gen_random_uuid(),
 course_id uuid not null references public.courses(id) on delete cascade,
 author_id uuid not null references public.profiles(id),
 title text not null check (char_length(trim(title)) between 3 and 120),
 body text not null check (char_length(trim(body)) between 1 and 5000),
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
create index if not exists course_announcements_course_idx on public.course_announcements(course_id,created_at desc);
alter table public.course_announcements enable row level security;
create policy "enrolled students read announcements" on public.course_announcements for select to authenticated using (exists(select 1 from public.enrollments e where e.course_id=course_announcements.course_id and e.student_id=auth.uid() and e.status in ('active','completed')) or public.current_user_role()='manager');
create policy "assigned teachers create announcements" on public.course_announcements for insert to authenticated with check (author_id=auth.uid() and (public.current_user_role()='manager' or exists(select 1 from public.courses c where c.id=course_id and c.teacher_id=auth.uid())));
create policy "authors manage announcements" on public.course_announcements for update to authenticated using (author_id=auth.uid() or public.current_user_role()='manager') with check (author_id=auth.uid() or public.current_user_role()='manager');
create policy "authors delete announcements" on public.course_announcements for delete to authenticated using (author_id=auth.uid() or public.current_user_role()='manager');
