# Banco de dados da MissExplica

O AVA usa PostgreSQL/Supabase para autenticação, cursos, matrículas, aulas e progresso.

## Ordem oficial de instalação

1. Crie o projeto no Supabase.
2. Execute `schema.sql`.
3. Execute `rls_hardening.sql`.
4. Execute `production_repair.sql`.
5. Execute `lesson_progress_canonical.sql` para consolidar o progresso e criar `student_complete_lesson`.
6. Execute `login_rate_limit.sql` para proteção contra tentativas repetidas no login.
7. Configure o Storage conforme as políticas do projeto.
8. Faça o deploy de `supabase/functions/student-login`.
9. Faça o deploy de `supabase/functions/provision-student`.
10. Configure na Edge Function o secret customizado `MISS_EXP_SUPABASE_SERVICE_ROLE` e o secret `ALLOWED_ORIGINS`. As variáveis padrão `SUPABASE_URL` e `SUPABASE_ANON_KEY` são fornecidas pelo ambiente do Supabase.
11. Configure `supabase-config.js` somente com Project URL e chave anon/public.
12. Nunca coloque `service_role`/secret key no navegador, no GitHub ou em HTML/JavaScript público.

## Login do aluno

O aluno pode entrar de duas formas equivalentes:

`CPF + senha`

ou

`RU + senha`

A Edge Function encontra o aluno pelo CPF ou pelo RU e valida a senha pela autenticação do Supabase. Depois da sessão criada, o aluno entra diretamente no AVA e só enxerga as matrículas liberadas para seu perfil.

A senha deve ser definida no provisionamento administrativo do aluno pela Edge Function `supabase/functions/provision-student` e deve ter pelo menos 8 caracteres.

## CORS

`ALLOWED_ORIGINS` deve conter somente as origens oficiais do AVA, separadas por vírgula. Não use `*` em produção.

## Identidade acadêmica

Cada aluno possui um RU único da MissExplica, independente do curso. O RU é identificador interno e não substitui RA ou outro registro oficial da instituição parceira.

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

O modelo canônico de `lesson_progress` usa `completed`, `completed_at`, `watched_seconds` e `updated_at`. A função `student_complete_lesson(uuid)` valida a matrícula e grava a conclusão.

`database/lesson_progress.sql` é apenas compatibilidade. O arquivo oficial é `database/lesson_progress_canonical.sql`.

## Rate limiting

`login_rate_limit.sql` limita a 8 tentativas por combinação de identificador e endereço IP em uma janela de 15 minutos. Os identificadores armazenados são hashes.

## Regra de acesso

O papel não é escolhido pelo usuário no navegador. Ele é definido em `profiles.role`. As matrículas determinam quais cursos o aluno pode estudar e as políticas RLS reforçam isso no banco.

## Frontend

`student-courses.js` é a fonte ativa para carregar os cursos reais do aluno. O carregador legado `student-data.js` não é incluído pelo `index.html` para evitar que dois carregadores concorrentes sobrescrevam `loadStudentCourses`.
