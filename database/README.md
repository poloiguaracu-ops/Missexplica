# Banco de dados da MissExplica

O AVA usa PostgreSQL/Supabase para autenticação, cursos, matrículas, aulas e progresso.

## Instalação segura

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute `schema.sql` inteiro.
4. Execute `rls_hardening.sql` inteiro depois do schema.
5. Em **Authentication → Providers**, habilite e-mail/senha e Google quando as credenciais OAuth estiverem configuradas.
6. Configure `supabase-config.js` somente com a Project URL e a chave `anon/public`.
7. Nunca coloque a `service_role` no navegador, no GitHub ou em HTML/JavaScript público.
8. Operações administrativas sensíveis devem usar backend/Edge Functions com a `service_role` armazenada como secret.

## Modelo

- `profiles`: usuário e perfil (aluno, professor, gestor)
- `courses`: cursos
- `modules`: módulos
- `lessons`: aulas e vídeos
- `materials`: arquivos/materiais
- `enrollments`: matrícula e permissão de acesso
- `lesson_progress`: progresso individual
- `live_classes`: aulas ao vivo/Meet
- `messages`: comunicação
- `certificates`: certificados

## Regra de acesso

O papel não deve ser escolhido pelo usuário no navegador. Ele é definido no `profiles.role`. Matrículas determinam quais cursos o aluno pode estudar. As políticas RLS em `rls_hardening.sql` reforçam essas regras no banco, inclusive contra consultas manipuladas pelo frontend.

## Primeiro gestor

Crie o usuário normalmente pelo Supabase Auth e atribua `manager` de forma administrativa/segura no banco. Depois, o gerenciamento de outros usuários deve ser feito por uma Edge Function/backend autorizado, e não diretamente com uma chave administrativa no navegador.
