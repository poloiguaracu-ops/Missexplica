# Configurar o backend real da MissExplica

A interface usa Supabase para autenticação, matrículas, cursos e progresso. Chaves privadas nunca devem ser colocadas no navegador, no GitHub ou compartilhadas em mensagens.

## 1. Criar o projeto

1. Crie o projeto no Supabase.
2. Abra **Project Settings → API**.
3. Copie a **Project URL** e a chave **anon/public**.
4. Configure esses dois valores em `supabase-config.js`.

A chave `service_role` é privada e nunca deve aparecer em arquivos públicos.

## 2. Banco de dados

Execute os scripts na ordem indicada em `database/README.md`. O fluxo atual usa:

- `profiles` para identidade, CPF, RU, papel e status de acesso;
- `courses`, `modules` e `lessons` para conteúdo;
- `enrollments` para matrículas;
- `lesson_progress` para progresso individual.

O RU é gerado pelo banco no momento em que o gestor libera a matrícula.

## 3. Edge Functions e secrets

As funções principais são:

- `student-login` — login por **CPF ou RU + senha**;
- `provision-student` — criação/atualização administrativa da conta do aluno.

Configure os secrets necessários nas Edge Functions:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `MISS_EXP_SUPABASE_SERVICE_ROLE`
- `ALLOWED_ORIGINS`

`ALLOWED_ORIGINS` deve conter a origem oficial do AVA, sem `/` no final, e não deve usar `*` em produção.

## 4. Gestor e alunos

O gestor precisa ter uma conta no Supabase Auth e uma linha correspondente em `public.profiles` com:

- `role = 'manager'`
- `active = true`

O aluno precisa ter:

- uma conta no Supabase Auth;
- um perfil em `public.profiles`;
- `role = 'student'`;
- `active = true`;
- CPF cadastrado.

O RU não precisa ser digitado manualmente. A matrícula pode gerar o RU automaticamente.

## 5. Login

O aluno entra somente pela tela de login do AVA usando:

**CPF + senha**

ou

**RU + senha**

O papel não é escolhido pelo aluno no navegador. Depois da autenticação, o sistema consulta `profiles` e abre o ambiente correspondente ao papel salvo no banco.

## 6. Publicação

Depois de alterar arquivos do frontend, faça o deploy/publicação normal do projeto no Cloudflare Pages/Workers e depois teste com **Ctrl + F5**.

As Edge Functions precisam ser republicadas separadamente quando o código de uma função for alterado.

## 7. Checklist antes de liberar para alunos reais

- testar CPF + senha;
- testar RU + senha;
- testar criação de aluno pelo gestor;
- testar matrícula e geração automática de RU;
- confirmar que o aluno vê somente suas matrículas;
- testar progresso de aula;
- testar professor e gestor com usuários separados;
- revisar RLS com contas diferentes;
- configurar armazenamento privado para arquivos;
- definir hospedagem de vídeos;
- configurar domínio oficial e URLs autorizadas do Supabase Auth.
