# Pausar/liberar envios de documentos

## Contexto

Em 2026-08-28 foi aplicado um hotfix (`codex/hotfix-fechar-envios`, mergeado em
`62f213b` na branch `gcp-deploy` do `controle-de-metas`) que fechava os envios
de documentos apenas no frontend, escondendo botões e desabilitando ações via
uma constante local (`DOCUMENT_SUBMISSIONS_OPEN`). O próprio spec desse hotfix
já registrava que essa era uma solução temporária, sem acesso ao backend na
época, e que "a solução definitiva" deveria ter o backend como autoridade da
regra.

Esse hotfix foi revertido (commit `a691392` em `gcp-deploy`), voltando o
sistema ao estado anterior ao fechamento (envios abertos, sem nenhuma trava).

Esta feature substitui o hotfix por uma solução definitiva, com o backend
(`backend-metas`) como autoridade: um admin liga/desliga os envios, a API
passa a rejeitar as ações quando pausado, e o frontend apenas reflete esse
estado.

## Objetivo

Permitir que um usuário com role Admin pause e libere os envios de documentos
de forma global, com a regra sendo aplicada e validada no backend — não
apenas escondida na interface.

## Modelo de dados (backend-metas)

Nova entidade `DocumentSubmissionSettings`, mapeada para uma linha única
(sem histórico/log — apenas o estado atual):

- `IsPaused: bool`
- `UpdatedByUserId: Guid?`
- `UpdatedAt: DateTime?`

Se a tabela ainda não tiver nenhuma linha, o estado é considerado
`IsPaused = false` (aberto por padrão). Não é necessário seed na migration —
a primeira chamada de pausa cria a linha.

## Endpoints (backend-metas)

Novo controller `DocumentSubmissionsController`, seguindo o padrão de
`MaintenanceController` (mesma policy `RequireAdmin` para escrita):

- `GET /document-submissions/status`
  `[Authorize]` (qualquer usuário autenticado). Retorna:
  `{ isPaused, updatedByUserName, updatedAt }`.

- `POST /document-submissions/status`
  `[Authorize(Policy = "RequireAdmin")]`. Body: `{ isPaused: bool }`.
  Atualiza `IsPaused`, `UpdatedByUserId` (usuário autenticado) e
  `UpdatedAt` (now), retorna o mesmo shape do GET.

## Enforcement no backend

Em `TopicoDocumentosController`, todas as ações de escrita passam a checar o
estado antes de delegar ao `_service`:

- `Upload`, `Reupload`, `Approve`, `ApproveWithFile`, `Confirm`, `Return`,
  `Delete` → se `IsPaused == true`, retornam `403` com
  `{ message: "Envios de documentos estão pausados." }` e não chamam o
  service.
- `GetAll` e `GetLogs` (leitura) continuam sempre liberados, mesmo pausado.

A checagem usa um novo serviço (`IDocumentSubmissionSettingsService` ou
equivalente, seguindo o padrão dos serviços já injetados nesse controller)
com um método simples tipo `GetStatusAsync()` / `SetPausedAsync(bool, userId)`.

## Tempo real (SignalR)

O `POST /document-submissions/status` dispara, após salvar:

```
Clients.All.SendAsync("documentSubmissionsStatusChanged", status)
```

no `MetaHub` já existente (mesmo `IHubContext<MetaHub>` já usado em
`MetasController`, `UsersController` etc. — sem hub novo).

## Frontend (controle-de-metas)

- `src/hooks/useMetaHub.ts` ganha um novo callback opcional
  `onDocumentSubmissionsStatusChanged`, registrando
  `globalConnection.on("documentSubmissionsStatusChanged", handler)`,
  seguindo exatamente o padrão dos outros eventos já registrados nesse hook
  (`metaStatusChanged`, `topicoDocumentAdded` etc.).

- **`src/components/dashboard/IntegracoesView.tsx`**: novo card com toggle
  ligar/desligar envios, mostrando quem pausou e quando
  (`updatedByUserName` / `updatedAt`). Chama `GET` ao montar e
  `POST /document-submissions/status` ao alternar. Segue o mesmo padrão
  visual já usado no card de status do Google Drive.

- **`src/components/dashboard/TemasView.tsx`**: busca
  `GET /document-submissions/status` ao montar, escuta o evento em tempo
  real via `useMetaHub`. Quando `isPaused === true`:
  - esconde/desabilita upload, reenvio, exclusão, devolução, aprovação
    (com ou sem arquivo novo) e confirmação do analista;
  - mantém visualização, links do Drive e histórico;
  - exibe banner fixo: "Envios de documentos temporariamente pausados."

## Erros e comunicação

Se um handler bloqueado for acionado mesmo assim (ex.: tela desatualizada),
a API responde `403` e o frontend mostra um toast de erro com a mensagem
recebida, sem retry automático — mesmo padrão de tratamento de erro já usado
nas outras chamadas dessa tela.

## Testes

**Backend:**
- `GET /document-submissions/status` retorna o estado default quando não há
  linha na tabela.
- `POST /document-submissions/status` exige `RequireAdmin` (403 para não-admin).
- `POST /document-submissions/status` grava corretamente e retorna o novo
  estado.
- Cada ação de escrita em `TopicoDocumentosController`
  (Upload/Reupload/Approve/ApproveWithFile/Confirm/Return/Delete) retorna
  `403` quando `IsPaused == true` e funciona normalmente quando `false`.

**Frontend:**
- `useMetaHub` chama `onDocumentSubmissionsStatusChanged` ao receber o
  evento do hub.
- `TemasView` mostra o banner e desabilita as ações corretas quando
  `isPaused === true`, e libera tudo quando `false`.
- `IntegracoesView`: toggle chama o endpoint certo e reflete o estado
  retornado.
- Suite completa do frontend e build de produção.

## Repositórios e branches

Feature cross-repo, uma branch em cada:

- `backend-metas`: `feature/pausar-liberar-envios`, baseada em `gcp-deploy`
  (commit `7969759`).
- `controle-de-metas`: `feature/pausar-liberar-envios`, baseada em
  `gcp-deploy` (commit `a691392`, já com o hotfix de fechamento revertido).

Nenhuma migration destrutiva é necessária para reverter esta feature — a
tabela nova pode ser ignorada/dropada e os endpoints removidos sem afetar
dados existentes de documentos ou metas.
