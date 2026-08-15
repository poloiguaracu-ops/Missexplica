# Backend seguro da MissExplica

As funções administrativas sensíveis devem ser executadas no backend/Edge Functions. Nunca coloque a `service_role` no navegador.

Endpoints previstos:
- criação/invite de usuário;
- alteração administrativa de perfil;
- bloqueio/desbloqueio;
- criação de matrícula;
- emissão de certificado;
- notificações.

O frontend usa apenas a chave `anon/public` e as RPCs protegidas por RLS/validação de papel.
