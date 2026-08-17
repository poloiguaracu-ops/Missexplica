# Banco de dados da MissExplica

O AVA usa PostgreSQL/Supabase para autenticação, cursos, matrículas, aulas e progresso.

## Instalação oficial

1. Crie um projeto no Supabase.
2. Abra **SQL Editor**.
3. Execute `schema.sql` inteiro.
4. Execute `rls_hardening.sql` inteiro.
5. Execute `production_repair.sql` para consolidar RU, matrícula e vínculo professor/curso.
6. Execute `lesson_progress.sql` para consolidar o único modelo de progresso.
7. Execute `student_progress_canonical.sql` para disponibilizar a conclusão segura de aulas.
8. Faça o deploy de `supabase/functions/student-login`.
9. Configure na Edge Function o secret `SUPABASE_SERVICE_ROLE_KEY` e, quando necessário, `STUDENT_LOGIN_REDIRECT`.
10. Configure `supabase-config.js` somente com a Project URL e a chave `anon/public`.
11. Nunca coloque `service_role` no navegador, no GitHub ou em HTML/JavaScript público.

## Identidade acadêmica da MissExplica

Cada aluno possui um **RU único da MissExplica**, independente do curso. O RU é um identificador interno e não substitui RA ou outro registro oficial de instituição parceira.

O fluxo do aluno é:

`CPF + RU → validação → sessão autenticada → AVA → somente matrículas liberadas`

A função `issue_student_ru` gera o RU uma única vez. A função `manager_enroll_student` chama essa rotina e libera o curso. Não existe outro gerador oficial de RU.

## Progresso

`lesson_progress` é a tabela canônica. Ela usa `completed`, `completed_at`, `watched_seconds` e `updated_at`. A função `student_complete_lesson` grava a conclusão de uma aula publicada somente quando o aluno possui matrícula válida no curso.

## Modelo

- `profiles`: usuário e identidade acadêmica (aluno, professor, gestor, CPF, RU)
- `courses`: cursos e vínculo do professor
- `modules`: módulos
- `lessons`: aulas e vídeos
- `materials`: arquivos/materiais
- `enrollments`: matrícula e permissão de acesso
- `lesson_progress`: progresso individual
- `live_classes`: aulas ao vivo/Meet
- `messages`: comunicação
- `certificates`: certificados

## Regra de acesso

O papel não deve ser escolhido pelo usuário no navegador. Ele é definido no `profiles.role`. Matrículas determinam quais cursos o aluno pode estudar. As políticas RLS em `rls_hardening.sql` e `lesson_progress.sql` reforçam essas regras no banco.

## Primeiro gestor

Crie o usuário normalmente pelo Supabase Auth e atribua `manager` de forma administrativa/segura no banco. Depois, o gerenciamento de outros usuários deve ser feito por uma Edge Function/backend autorizado, e não diretamente com uma chave administrativa no navegador.
