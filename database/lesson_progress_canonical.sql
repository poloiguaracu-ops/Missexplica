-- MissExplica — modelo canônico de progresso.
-- Execute depois de database/schema.sql e antes das funções do AVA.

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  completed_at timestamptz,
  watched_seconds integer not null default 0 check (watched_seconds >= 0),
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

alter table public.lesson_progress add column if not exists completed boolean not null default false;
alter table public.lesson_progress add column if not exists completed_at timestamptz;
alter table public.lesson_progress add column if not exists watched_seconds integer not null default 0;
alter table public.lesson_progress add column if not exists updated_at timestamptz not null default now();

create index if not exists idx_lesson_progress_student on public.lesson_progress(student_id);
create index if not exists idx_lesson_progress_lesson on public.lesson_progress(lesson_id);
alter table public.lesson_progress enable row level security;

drop policy if exists "students manage own progress" on public.lesson_progress;
drop policy if exists "teachers managers read course progress" on public.lesson_progress;
drop policy if exists "student own progress" on public.lesson_progress;

create policy "student progress own" on public.lesson_progress
for all to authenticated
using (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.modules m on m.id=l.module_id
    join public.enrollments e on e.course_id=m.course_id
    where l.id=lesson_progress.lesson_id
      and e.student_id=auth.uid()
      and e.status in ('active','completed')
  )
)
with check (
  student_id = auth.uid()
  and exists (
    select 1 from public.lessons l
    join public.modules m on m.id=l.module_id
    join public.enrollments e on e.course_id=m.course_id
    where l.id=lesson_progress.lesson_id
      and e.student_id=auth.uid()
      and e.status in ('active','completed')
  )
);

create or replace function public.student_complete_lesson(target_lesson uuid)
returns public.lesson_progress
language plpgsql
security definer
set search_path=public
as $$
declare r public.lesson_progress;
begin
  if auth.uid() is null then raise exception 'Usuário não autenticado'; end if;
  if not exists (
    select 1 from public.lessons l
    join public.modules m on m.id=l.module_id
    join public.enrollments e on e.course_id=m.course_id
    where l.id=target_lesson
      and l.published=true
      and e.student_id=auth.uid()
      and e.status in ('active','completed')
  ) then raise exception 'Aula não disponível para este aluno'; end if;

  insert into public.lesson_progress(student_id,lesson_id,completed,completed_at,updated_at)
  values(auth.uid(),target_lesson,true,coalesce((select completed_at from public.lesson_progress where student_id=auth.uid() and lesson_id=target_lesson),now()),now())
  on conflict(student_id,lesson_id) do update
    set completed=true,
        completed_at=coalesce(public.lesson_progress.completed_at,now()),
        updated_at=now()
  returning * into r;
  return r;
end;
$$;

revoke all on function public.student_complete_lesson(uuid) from public;
grant execute on function public.student_complete_lesson(uuid) to authenticated;
