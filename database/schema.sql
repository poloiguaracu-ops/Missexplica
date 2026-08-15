-- MissExplica AVA - banco inicial Supabase/PostgreSQL
-- Execute este arquivo no SQL Editor do seu projeto Supabase.
create extension if not exists pgcrypto;

do $$ begin create type public.user_role as enum ('student','teacher','manager'); exception when duplicate_object then null; end $$;

do $$ begin create type public.enrollment_status as enum ('active','blocked','completed','cancelled'); exception when duplicate_object then null; end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  role public.user_role not null default 'student',
  avatar_url text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text unique not null,
  description text,
  cover_url text,
  workload_hours integer not null default 0 check (workload_hours >= 0),
  published boolean not null default false,
  created_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  title text not null,
  description text,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules(id) on delete cascade,
  title text not null,
  description text,
  video_url text,
  content text,
  position integer not null default 0,
  published boolean not null default false,
  duration_minutes integer not null default 0 check (duration_minutes >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.materials (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  name text not null,
  file_url text not null,
  mime_type text,
  created_at timestamptz not null default now()
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  unique(student_id, course_id)
);

create table if not exists public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  lesson_id uuid not null references public.lessons(id) on delete cascade,
  completed boolean not null default false,
  watched_seconds integer not null default 0 check (watched_seconds >= 0),
  updated_at timestamptz not null default now(),
  unique(student_id, lesson_id)
);

create table if not exists public.live_classes (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  starts_at timestamptz not null,
  meet_url text,
  recording_url text,
  created_at timestamptz not null default now()
);

create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  recipient_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid references public.courses(id) on delete set null,
  subject text,
  body text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.certificates (
  id uuid primary key default gen_random_uuid(),
  student_id uuid not null references public.profiles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  certificate_code text unique not null,
  issued_at timestamptz not null default now(),
  unique(student_id, course_id)
);

create index if not exists idx_modules_course on public.modules(course_id, position);
create index if not exists idx_lessons_module on public.lessons(module_id, position);
create index if not exists idx_enrollments_student on public.enrollments(student_id);
create index if not exists idx_progress_student on public.lesson_progress(student_id);
create index if not exists idx_messages_recipient on public.messages(recipient_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.materials enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.live_classes enable row level security;
alter table public.messages enable row level security;
alter table public.certificates enable row level security;

-- Perfil: o próprio usuário lê/atualiza seus dados básicos.
create policy if not exists "profile self read" on public.profiles for select using (auth.uid() = id);
create policy if not exists "profile self update" on public.profiles for update using (auth.uid() = id);

-- Cursos publicados são visíveis a usuários autenticados.
create policy if not exists "published courses read" on public.courses for select using (published = true or created_by = auth.uid());

-- Aluno só lê matrícula própria.
create policy if not exists "student own enrollments" on public.enrollments for select using (student_id = auth.uid());
create policy if not exists "student own progress" on public.lesson_progress for all using (student_id = auth.uid()) with check (student_id = auth.uid());
create policy if not exists "student own certificates" on public.certificates for select using (student_id = auth.uid());
create policy if not exists "messages sender recipient" on public.messages for select using (sender_id = auth.uid() or recipient_id = auth.uid());

-- Nota: operações administrativas (criação de usuários, matrícula, publicação e gestão)
-- devem passar por Edge Functions/backend com service role, nunca pela chave exposta no navegador.
