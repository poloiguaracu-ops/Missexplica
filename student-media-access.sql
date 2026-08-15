-- MissExplica — URLs temporárias somente para aluno matriculado.
create or replace function public.student_media_url(target_course uuid, target_bucket text, target_path text)
returns text language plpgsql security definer set search_path=public, storage
as $$
declare result text;
begin
  if auth.uid() is null then raise exception 'Usuário não autenticado'; end if;
  if target_bucket not in ('course-videos','course-materials') then raise exception 'Bucket inválido'; end if;
  if not exists (select 1 from public.enrollments where student_id=auth.uid() and course_id=target_course and status in ('active','completed')) then raise exception 'Sem acesso ao curso'; end if;
  select storage.create_signed_url(target_path, 3600) into result;
  return result;
end; $$;
revoke all on function public.student_media_url(uuid,text,text) from public;
grant execute on function public.student_media_url(uuid,text,text) to authenticated;
