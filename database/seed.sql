-- Dados mínimos de demonstração para testar o AVA.
-- NÃO cria usuários Auth. Depois de executar schema.sql + RLS,
-- crie os usuários pelo Supabase Auth e cadastre seus profiles.

-- Exemplo de curso (descomente e ajuste created_by para um UUID de gestor/professor real):
-- insert into public.courses (title, description, published, created_by)
-- values ('Curso de exemplo', 'Curso livre de demonstração', true, 'UUID_DO_USUARIO');

-- O restante do conteúdo deve ser criado pelo gestor/professor após a autenticação.
-- Isso evita contas e matrículas falsas no ambiente de produção.
