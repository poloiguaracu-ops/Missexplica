-- MissExplica — anotações sincronizadas entre dispositivos.
create table if not exists public.student_notes (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade,
 lesson_id uuid not null references public.lessons(id) on delete cascade,
 body text not null default '' check (char_length(body)<=5000),
 updated_at timestamptz not null default now(),
 unique(student_id,lesson_id)
);
create index if not exists student_notes_student_idx on public.student_notes(student_id,updated_at desc);
alter table public.student_notes enable row level security;
create policy "students own notes" on public.student_notes for all to authenticated using (student_id=auth.uid()) with check (student_id=auth.uid());
