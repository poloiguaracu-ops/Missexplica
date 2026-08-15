-- MissExplica — mensagens professor ↔ aluno.
create table if not exists public.messages (
 id uuid primary key default gen_random_uuid(),
 sender_id uuid not null references public.profiles(id) on delete cascade,
 recipient_id uuid not null references public.profiles(id) on delete cascade,
 course_id uuid references public.courses(id) on delete set null,
 body text not null check (char_length(trim(body)) between 1 and 4000),
 read_at timestamptz,
 created_at timestamptz not null default now()
);
create index if not exists messages_recipient_idx on public.messages(recipient_id,created_at desc);
create index if not exists messages_conversation_idx on public.messages(sender_id,recipient_id,created_at desc);
alter table public.messages enable row level security;
create policy "users read own messages" on public.messages for select to authenticated using (sender_id=auth.uid() or recipient_id=auth.uid());
create policy "users send messages" on public.messages for insert to authenticated with check (sender_id=auth.uid());
create policy "recipient marks messages read" on public.messages for update to authenticated using (recipient_id=auth.uid()) with check (recipient_id=auth.uid());
