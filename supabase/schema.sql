-- MissExplica • banco de dados do AVA
-- Execute este arquivo no SQL Editor do seu projeto Supabase.

create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('student','teacher','manager'); exception when duplicate_object then null; end $$;
do $$ begin create type public.lesson_status as enum ('draft','published'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, full_name text not null default '', role public.user_role not null default 'student', active boolean not null default true, created_at timestamptz not null default now());
create table if not exists public.courses (id uuid primary key default gen_random_uuid(), title text not null, description text default '', thumbnail_url text, workload_hours integer default 0, active boolean not null default true, created_by uuid references public.profiles(id), created_at timestamptz not null default now());
create table if not exists public.course_teachers (course_id uuid references public.courses(id) on delete cascade, teacher_id uuid references public.profiles(id) on delete cascade, primary key (course_id, teacher_id));
create table if not exists public.modules (id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade, title text not null, description text default '', position integer not null default 0, created_at timestamptz not null default now());
create table if not exists public.lessons (id uuid primary key default gen_random_uuid(), module_id uuid not null references public.modules(id) on delete cascade, title text not null, description text default '', video_url text, status public.lesson_status not null default 'draft', position integer not null default 0, duration_minutes integer default 0, created_by uuid references public.profiles(id), created_at timestamptz not null default now());
create table if not exists public.materials (id uuid primary key default gen_random_uuid(), lesson_id uuid not null references public.lessons(id) on delete cascade, name text not null, storage_path text not null, mime_type text, created_at timestamptz not null default now());
create table if not exists public.enrollments (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade, course_id uuid not null references public.courses(id) on delete cascade, active boolean not null default true, enrolled_at timestamptz not null default now(), unique(student_id, course_id));
create table if not exists public.lesson_progress (student_id uuid not null references public.profiles(id) on delete cascade, lesson_id uuid not null references public.lessons(id) on delete cascade, completed boolean not null default false, completed_at timestamptz, primary key (student_id, lesson_id));
create table if not exists public.messages (id uuid primary key default gen_random_uuid(), sender_id uuid not null references public.profiles(id) on delete cascade, recipient_id uuid not null references public.profiles(id) on delete cascade, course_id uuid references public.courses(id) on delete set null, body text not null, read_at timestamptz, created_at timestamptz not null default now());
create table if not exists public.live_classes (id uuid primary key default gen_random_uuid(), course_id uuid not null references public.courses(id) on delete cascade, teacher_id uuid not null references public.profiles(id), title text not null, starts_at timestamptz not null, meet_url text, recording_url text, created_at timestamptz not null default now());
create table if not exists public.certificates (id uuid primary key default gen_random_uuid(), student_id uuid not null references public.profiles(id) on delete cascade, course_id uuid not null references public.courses(id) on delete cascade, certificate_code text not null unique, issued_at timestamptz not null default now());

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$ begin insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name','')) on conflict (id) do nothing; return new; end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

create or replace function public.my_role() returns public.user_role language sql stable security definer set search_path = public as $$ select role from public.profiles where id = auth.uid(); $$;

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.course_teachers enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.messages enable row level security;
alter table public.live_classes enable row level security;
alter table public.certificates enable row level security;

create policy "profiles own read" on public.profiles for select using (id = auth.uid());
create policy "manager profiles all" on public.profiles for all using (public.my_role() = 'manager') with check (public.my_role() = 'manager');
create policy "authenticated courses read" on public.courses for select to authenticated using (active = true or public.my_role() = 'manager');
create policy "manager courses write" on public.courses for all using (public.my_role() = 'manager') with check (public.my_role() = 'manager');
create policy "teacher course links read" on public.course_teachers for select to authenticated using (teacher_id = auth.uid() or public.my_role() = 'manager');
create policy "manager course links write" on public.course_teachers for all using (public.my_role() = 'manager') with check (public.my_role() = 'manager');
create policy "course modules read" on public.modules for select to authenticated using (exists (select 1 from public.courses c where c.id = course_id and c.active = true));
create policy "teacher modules write" on public.modules for all using (public.my_role() = 'manager' or exists (select 1 from public.course_teachers ct where ct.course_id = course_id and ct.teacher_id = auth.uid())) with check (public.my_role() = 'manager' or exists (select 1 from public.course_teachers ct where ct.course_id = course_id and ct.teacher_id = auth.uid()));
create policy "lessons read" on public.lessons for select to authenticated using (public.my_role() = 'manager' or status = 'published' or exists (select 1 from public.course_teachers ct join public.modules m on m.course_id = ct.course_id where m.id = module_id and ct.teacher_id = auth.uid()));
create policy "teachers manage lessons" on public.lessons for all using (public.my_role() = 'manager' or exists (select 1 from public.course_teachers ct join public.modules m on m.course_id = ct.course_id where m.id = module_id and ct.teacher_id = auth.uid())) with check (public.my_role() = 'manager' or exists (select 1 from public.course_teachers ct join public.modules m on m.course_id = ct.course_id where m.id = module_id and ct.teacher_id = auth.uid()));
create policy "student own enrollments" on public.enrollments for select using (student_id = auth.uid() or public.my_role() = 'manager');
create policy "manager enrollment write" on public.enrollments for all using (public.my_role() = 'manager') with check (public.my_role() = 'manager');
create policy "student own progress" on public.lesson_progress for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy "teacher progress read" on public.lesson_progress for select using (public.my_role() = 'manager' or exists (select 1 from public.lessons l join public.modules m on m.id = l.module_id join public.course_teachers ct on ct.course_id = m.course_id where l.id = lesson_id and ct.teacher_id = auth.uid()));
create policy "messages participants" on public.messages for select using (sender_id = auth.uid() or recipient_id = auth.uid() or public.my_role() = 'manager');
create policy "messages sender" on public.messages for insert with check (sender_id = auth.uid());
create policy "messages recipient update" on public.messages for update using (recipient_id = auth.uid()) with check (recipient_id = auth.uid());
create policy "live classes authenticated read" on public.live_classes for select to authenticated using (true);
create policy "teacher live classes write" on public.live_classes for all using (teacher_id = auth.uid() or public.my_role() = 'manager') with check (teacher_id = auth.uid() or public.my_role() = 'manager');
create policy "student own certificates" on public.certificates for select using (student_id = auth.uid() or public.my_role() = 'manager');
create policy "manager certificates write" on public.certificates for all using (public.my_role() = 'manager') with check (public.my_role() = 'manager');

-- Para criar o primeiro gestor: cadastre a conta no Auth e depois execute:
-- update public.profiles set role='manager' where id=(select id from auth.users where email='SEU_EMAIL');
