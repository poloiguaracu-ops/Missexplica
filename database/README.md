# Banco de dados da MissExplica

O arquivo `schema.sql` cria a base PostgreSQL/Supabase do AVA.

## Como ativar
1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Cole o conteúdo de `schema.sql` e execute.
4. Em **Authentication**, habilite e-mail/senha.
5. Configure `supabase-config.js` com a Project URL e a chave `anon/public`.
6. Nunca coloque a `service_role` no navegador.

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

O acesso administrativo deve ser feito por backend/Edge Functions. A chave pública do navegador não deve receber permissões administrativas.
