-- MissExplica — endurecimento do Storage.
-- Substitui as políticas amplas de upload/leitura do storage-setup.sql.
-- Execute este arquivo no SQL Editor do Supabase.

-- Remover políticas permissivas anteriores, se existirem.
drop policy if exists "authenticated can read course files" on storage.objects;
drop policy if exists "authenticated can upload course files" on storage.objects;

-- O aluno só lê objetos cujo registro pertence a uma aula de um curso em que está matriculado.
create policy "enrolled students read course files"
on storage.objects for select
to authenticated
using (
  bucket_id in ('course-materials','course-videos')
  and exists (
    select 1
    from public.lesson_assets a
    join public.lessons l on l.id=a.lesson_id
    join public.modules m on m.id=l.module_id
    join public.enrollments e on e.course_id=m.course_id
    where a.bucket=bucket_id
      and a.storage_path=name
      and e.student_id=auth.uid()
      and e.status in ('active','completed')
  )
);

-- Professores/gestores só enviam arquivos quando o caminho contém o próprio user id.
-- A validação do curso/aula ocorre no RPC teacher_attach_asset antes do arquivo ser associado.
create policy "teachers upload own course files"
on storage.objects for insert
to authenticated
with check (
  bucket_id in ('course-materials','course-videos')
  and split_part(name,'/',1)=auth.uid()::text
  and public.current_user_role() in ('teacher','manager')
);

-- Atualização/exclusão ficam bloqueadas por padrão. Use uma Edge Function administrativa
-- para remoção/substituição, depois de validar a relação professor -> curso -> aula.
