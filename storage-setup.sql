-- MissExplica: buckets privados para conteúdo educacional.
-- Execute no SQL Editor do Supabase.
-- O frontend nunca recebe service_role.

insert into storage.buckets (id,name,public)
values ('course-materials','course-materials',false)
on conflict (id) do nothing;

insert into storage.buckets (id,name,public)
values ('course-videos','course-videos',false)
on conflict (id) do nothing;

-- Acesso a arquivos: usuário precisa estar autenticado.
-- A autorização fina deve ser feita pela aplicação/Edge Function conforme a matrícula.
create policy "authenticated can read course files"
on storage.objects for select
to authenticated
using (bucket_id in ('course-materials','course-videos'));

create policy "authenticated can upload course files"
on storage.objects for insert
to authenticated
with check (bucket_id in ('course-materials','course-videos'));
