-- MissExplica — políticas do bucket lesson-materials.
-- Execute no SQL Editor do Supabase. O bucket precisa existir antes.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('lesson-materials','lesson-materials',false,52428800,array['application/pdf','application/msword','application/vnd.openxmlformats-officedocument.wordprocessingml.document','application/vnd.ms-powerpoint','application/vnd.openxmlformats-officedocument.presentationml.presentation','application/vnd.ms-excel','application/vnd.openxmlformats-officedocument.spreadsheetml.sheet','text/plain','image/png','image/jpeg','video/mp4'])
on conflict (id) do update set public=false,file_size_limit=52428800;
create policy "authenticated material read" on storage.objects for select to authenticated using (bucket_id='lesson-materials' and exists(select 1 from public.lesson_materials m join public.enrollments e on e.course_id=m.course_id where m.file_url like '%'||storage.objects.name and e.student_id=auth.uid() and e.status in ('active','completed')));
create policy "teachers upload materials" on storage.objects for insert to authenticated with check (bucket_id='lesson-materials' and public.current_user_role() in ('teacher','manager'));
create policy "teachers delete materials" on storage.objects for delete to authenticated using (bucket_id='lesson-materials' and public.current_user_role() in ('teacher','manager'));
