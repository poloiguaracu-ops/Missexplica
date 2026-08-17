-- MissExplica — identidade acadêmica do aluno.
-- Este arquivo usa exclusivamente o gerador canônico de RU de production_repair.sql.
-- Execute depois de database/production_repair.sql.

create or replace function public.assign_student_identity(target_user uuid, target_cpf text)
returns public.profiles language plpgsql security definer set search_path=public as $$
declare r public.profiles; normalized text;
begin
  if public.current_user_role()<>'manager' then raise exception 'Apenas gestores podem gerar RU'; end if;
  normalized:=public.normalize_cpf(target_cpf);
  if length(normalized)<>11 then raise exception 'CPF inválido'; end if;
  if exists(select 1 from public.profiles where cpf=normalized and id<>target_user) then raise exception 'CPF já cadastrado'; end if;
  update public.profiles
  set cpf=normalized,
      ru=coalesce(ru,('MX' || lpad(nextval('public.missexplica_ru_seq')::text,6,'0'))),
      ru_issued_at=coalesce(ru_issued_at,now())
  where id=target_user and role='student'
  returning * into r;
  if not found then raise exception 'Aluno não encontrado'; end if;
  return r;
end; $$;

grant execute on function public.assign_student_identity(uuid,text) to authenticated;
