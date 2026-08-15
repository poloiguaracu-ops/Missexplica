-- MissExplica: vincula arquivos do Storage às aulas.
create table if not exists public.lesson_assets (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  bucket text not null check (bucket in ('course-videos','course-materials')),
  storage_path text not null,
  original_name text not null,
  mime_type text not null,
  size_bytes bigint not null check (size_bytes > 0),
  created_at timestamptz not null default now()
);

create index if not exists lesson_assets_lesson_idx on public.lesson_assets(lesson_id);
alter table public.lesson_assets enable row level security;

create policy "students read assets from enrolled courses"
on public.lesson_assets for select to authenticated
using (exists (
  select 1 from public.lessons l
  join public.modules m on m.id=l.module_id
  join public.enrollments e on e.course_id=m.course_id
  where l.id=lesson_assets.lesson_id and e.student_id=auth.uid() and e.status in ('active','completed')
));

create or replace function public.teacher_attach_asset(target_lesson uuid, target_bucket text, target_path text, target_name text, target_mime text, target_size bigint)
returns public.lesson_assets language plpgsql security definer set search_path=public as $$
declare r public.lesson_assets; c uuid;
begin
 select m.course_id into c from public.lessons l join public.modules m on m.id=l.module_id where l.id=target_lesson;
 if c is null or not public.teacher_can_manage_course(c) then raise exception 'Sem permissão para esta aula'; end if;
 if target_bucket not in ('course-videos','course-materials') then raise exception 'Bucket inválido'; end if;
 if length(trim(target_path))<3 or length(trim(target_name))<1 then raise exception 'Arquivo inválido'; end if;
 insert into public.lesson_assets(lesson_id,bucket,storage_path,original_name,mime_type,size_bytes)
 values(target_lesson,target_bucket,target_path,trim(target_name),target_mime,target_size) returning * into r;
 return r;
end; $$;

grant execute on function public.teacher_attach_asset(uuid,text,text,text,text,bigint) to authenticated;
