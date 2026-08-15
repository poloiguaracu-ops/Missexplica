# Configurar o backend real da MissExplica

A interface já está preparada para autenticação com Supabase. As credenciais **não devem** ser colocadas no código do servidor ou compartilhadas no chat.

## 1. Criar o projeto
1. Entre no Supabase e crie um projeto para a MissExplica.
2. Abra **Project Settings → API**.
3. Copie a **Project URL** e a chave **anon/public**.
4. Edite `supabase-config.js` e substitua `SEU-PROJETO` e `SUA_ANON_PUBLIC_KEY`.

A chave `service_role` nunca deve ser colocada no navegador, no GitHub ou em `supabase-config.js`.

## 2. Banco
O arquivo SQL criado anteriormente no projeto deve ser executado no **SQL Editor** do Supabase antes do primeiro login. Ele cria as tabelas, relações e políticas de acesso do AVA.

## 3. Usuários
O gestor deve criar o usuário pelo fluxo administrativo. O usuário também precisa ter uma linha correspondente em `public.profiles`, com `role` igual a `student`, `teacher` ou `manager` e `status` igual a `active`.

## 4. Login
O formulário da MissExplica usa `signInWithPassword`. Depois do login, o sistema consulta `profiles` e somente abre o ambiente quando o perfil existe, está ativo e corresponde ao tipo selecionado na tela.

## 5. Produção
Antes de liberar para alunos:
- configurar domínio/URL autorizado no Supabase Auth;
- habilitar confirmação de e-mail se desejado;
- criar políticas RLS e testar com aluno, professor e gestor;
- configurar armazenamento privado para PDFs e arquivos;
- decidir onde os vídeos serão hospedados;
- integrar o provedor de aulas ao vivo (Google Meet pode ser usado como link externo inicialmente).
