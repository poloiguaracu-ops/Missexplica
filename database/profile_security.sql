-- MissExplica — endurecimento do perfil do aluno.
-- Execute depois de schema.sql e rls_hardening.sql em projetos já existentes.
-- O cliente nunca deve alterar diretamente role, active, cpf ou ru.

drop policy if exists "profile self update" on public.profiles;

alter table public.profiles enable row level security;

-- Mantém apenas leitura do próprio perfil pelo usuário autenticado.
drop policy if exists "profile self read" on public.profiles;
create policy "profile self read" on public.profiles
for select to authenticated
using (auth.uid() = id);

-- Nenhum UPDATE direto pelo navegador.
-- Alterações de cadastro/permissões devem ser feitas por Edge Functions
-- com service_role e validação de gestor.
