# MissExplica + Supabase

A MissExplica foi estruturada para usar o Supabase como backend do AVA.

## 1. Criar o projeto

Crie um projeto no Supabase e abra **SQL Editor**.

Execute todo o arquivo `supabase/schema.sql`.

## 2. Criar o primeiro gestor

Cadastre a conta do gestor em **Authentication → Users**.

Depois, no SQL Editor, execute:

```sql
update public.profiles
set role = 'manager'
where id = (select id from auth.users where email = 'SEU_EMAIL');
```

Substitua `SEU_EMAIL` pelo e-mail real do gestor. Não coloque senha no código do GitHub.

## 3. Armazenamento

Crie no Storage um bucket privado chamado `course-materials` para PDFs, apostilas e outros materiais.

Para vídeos, recomendamos inicialmente usar um serviço de vídeo/streaming ou links privados. Não é uma boa ideia colocar arquivos grandes de vídeo diretamente no repositório GitHub.

## 4. Aula ao vivo

O professor poderá salvar um `meet_url` na tabela `live_classes`. O botão da plataforma abrirá o Google Meet. A criação automática de reuniões pelo Google Calendar/Meet exige uma integração OAuth separada; não devemos colocar credenciais do Google no frontend.

## 5. Segurança

O banco usa Row Level Security (RLS). Alunos, professores e gestores recebem permissões diferentes. A chave `service_role` do Supabase **nunca** deve ser colocada no navegador ou no GitHub.

## 6. Próxima integração

Depois que o projeto Supabase existir, conectar o frontend com:

- Supabase Auth para login/logout;
- tabela `profiles` para papel do usuário;
- `courses`, `modules` e `lessons` para conteúdo;
- `enrollments` para controlar quem pagou/tem acesso;
- `lesson_progress` para progresso;
- `messages` para comunicação;
- `live_classes` para aulas ao vivo;
- Storage para materiais;
- `certificates` para certificados.

A interface atual continua funcionando como protótipo enquanto essa conexão é feita.