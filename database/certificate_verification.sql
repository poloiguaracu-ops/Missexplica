-- MissExplica — certificados com código público de validação.
create extension if not exists pgcrypto;
create table if not exists public.certificates (
 id uuid primary key default gen_random_uuid(),
 student_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid not null references public.courses(id) on delete cascade,
 certificate_code text not null unique default upper(encode(gen_random_bytes(6),'hex')),
 issued_at timestamptz not null default now(),
 unique(student_id,course_id)
);
create index if not exists certificates_code_idx on public.certificates(certificate_code);
alter table public.certificates enable row level security;
create policy "students read own certificates" on public.certificates for select to authenticated using (student_id=auth.uid() or public.current_user_role()='manager');
create or replace function public.issue_certificate(target_course uuid)
returns public.certificates language plpgsql security definer set search_path=public as $$
declare uid uuid; r public.certificates;
begin
 uid:=auth.uid();
 if uid is null or public.current_user_role()<>'student' then raise exception 'Apenas alunos podem emitir certificados'; end if;
 if not exists(select 1 from public.enrollments where student_id=uid and course_id=target_course and status in ('active','completed')) then raise exception 'Matrícula não encontrada'; end if;
 if not exists(select 1 from public.lessons l join public.modules m on m.id=l.module_id where m.course_id=target_course and l.published and not exists(select 1 from public.lesson_progress p where p.student_id=uid and p.lesson_id=l.id)) then raise exception 'Curso ainda não foi concluído'; end if;
 insert into public.certificates(student_id,course_id) values(uid,target_course) on conflict(student_id,course_id) do update set issued_at=public.certificates.issued_at returning * into r;
 update public.enrollments set status='completed' where student_id=uid and course_id=target_course;
 return r;
end; $$;
grant execute on function public.issue_certificate(uuid) to authenticated;
