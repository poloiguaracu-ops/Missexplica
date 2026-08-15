# Checklist antes de abrir para alunos

- [ ] Supabase criado e URL/anon key configuradas no frontend.
- [ ] `schema.sql` executado.
- [ ] `rls_hardening.sql` executado.
- [ ] Google OAuth configurado com URLs autorizadas.
- [ ] Primeiro gestor criado de forma administrativa.
- [ ] Os 10 cursos cadastrados.
- [ ] Professores vinculados aos cursos.
- [ ] Matrículas criadas para os alunos.
- [ ] Storage configurado para materiais e vídeos (sem expor buckets privados publicamente).
- [ ] Políticas de Storage revisadas.
- [ ] Testado: aluno A não consegue consultar matrícula/progresso de aluno B.
- [ ] Testado: aluno sem matrícula não consegue abrir aula privada.
- [ ] Testado: professor não consegue alterar curso de outro professor.
- [ ] Testado: aluno não consegue alterar o próprio papel para `manager`.
- [ ] Testado: logout e expiração de sessão.
- [ ] Testado: recuperação de senha.
- [ ] Backup/política de retenção definidos antes de produção.

## Regra de ouro

Nunca coloque `service_role` ou segredo OAuth no frontend. O navegador deve receber apenas credenciais públicas apropriadas (como a anon/public key) e o banco/Edge Functions devem proteger operações administrativas.
