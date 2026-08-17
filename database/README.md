# Banco de dados da MissExplica

O AVA usa PostgreSQL/Supabase para autenticação, cursos, matrículas, aulas e progresso.

## Ordem oficial de instalação

1. Crie o projeto no Supabase.
2. Execute `schema.sql`.
3. Execute `rls_hardening.sql`.
4. Execute `production_repair.sql`.
5. Execute `lesson_progress_canonical.sql` para consolidar o progresso e criar `student_complete_lesson`.
6. Configure o Storage conforme as políticas do projeto.
7. Faça o deploy de `supabase/functions/student-login` e configure os secrets necessários.
8. Configure `supabase-config.js` somente com Project URL e chave anon/public.
9. Nunca coloque `service_role` no navegador, no GitHub ou em HTML/JavaScript público.

## Identidade acadêmica

Cada aluno possui um RU único da MissExplica, independente do curso. O RU é identificador interno e não substitui RA ou outro registro oficial da instituição parceira.

Fluxo:

`CPF + RU → validação → sessão Supabase → AVA → somente matrículas liberadas`

A função `issue_student_ru` é o gerador oficial. A função `manager_enroll_student` garante que o aluno tenha RU e libera a matrícula.

## Modelo principal

- `profiles`: usuário, papel, CPF e RU
- `courses`: cursos e professor responsável
- `modules`: módulos
- `lessons`: aulas
- `materials`: materiais
- `enrollments`: matrículas
- `lesson_progress`: progresso individual
- `live_classes`: aulas ao vivo
- `messages`: comunicação
- `certificates`: certificados

## Progresso

O modelo canônico de `lesson_progress` usa `completed`, `completed_at`, `watched_seconds` e `updated_at`. A função `student_complete_lesson(uuid)` valida a matrícula e grava a conclusão de forma transacional.

`database/lesson_progress.sql` é apenas compatibilidade. O arquivo oficial é `database/lesson_progress_canonical.sql`.

## Regra de acesso

O papel não é escolhido pelo usuário no navegador. Ele é definido em `profiles.role`. As matrículas determinam quais cursos o aluno pode estudar e as políticas RLS reforçam isso no banco.
