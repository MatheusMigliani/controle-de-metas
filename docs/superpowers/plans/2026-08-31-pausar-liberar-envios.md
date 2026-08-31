# Pausar/liberar envios de documentos — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o hotfix frontend-only de fechamento de envios por uma feature real, com o backend (`backend-metas`) como autoridade de um estado global "envios pausados/liberados", e o frontend (`controle-de-metas`) refletindo esse estado em tempo real.

**Architecture:** Nova tabela de linha única no Postgres guarda o estado (`IsPaused`, quem alterou, quando). Um novo controller expõe `GET/POST /document-submissions/status` (POST exige Admin). As sete ações de escrita em `TopicoDocumentosController` passam a checar esse estado antes de executar, retornando 403 se pausado. Toda mudança de estado dispara um evento SignalR no `MetaHub` já existente. No frontend, o hook `useMetaHub` ganha esse evento, `TemasView` busca o estado ao montar e reage ao evento (banner + desabilita ações via uma nova função de política pura e testável), e `IntegracoesView` ganha um card de admin com toggle.

**Tech Stack:** Backend: .NET 10, ASP.NET Core, EF Core (Postgres), SignalR. Frontend: Next.js/React, TypeScript, axios, `@microsoft/signalr`, Vitest + Testing Library, Tailwind, shadcn/ui (`Switch`).

**Repositórios e branches (já criadas):**
- `backend-metas` → branch `feature/pausar-liberar-envios` (baseada em `gcp-deploy`, commit `7969759`)
- `controle-de-metas` → branch `feature/pausar-liberar-envios` (baseada em `gcp-deploy`, commit `a691392`, já com o hotfix de fechamento revertido)

Os caminhos de arquivo abaixo são relativos à raiz de cada repositório — a Task indica em qual repo/diretório rodar os comandos.

---

## Parte 1 — Backend (`backend-metas`)

### Task 1: Entidade `DocumentSubmissionSettings`

**Repo:** `backend-metas`

**Files:**
- Create: `src/ControleAcao.Domain/Entities/DocumentSubmissionSettings.cs`

- [ ] **Step 1: Criar a entidade**

```csharp
namespace ControleAcao.Domain.Entities;

public class DocumentSubmissionSettings
{
    public Guid      Id              { get; set; } = Guid.NewGuid();
    public bool      IsPaused        { get; set; }
    public Guid?     UpdatedByUserId { get; set; }
    public DateTime? UpdatedAt       { get; set; }
}
```

- [ ] **Step 2: Build**

Run: `dotnet build`
Expected: build succeeds (0 erros).

- [ ] **Step 3: Commit**

```bash
git add src/ControleAcao.Domain/Entities/DocumentSubmissionSettings.cs
git commit -m "feat: adicionar entidade DocumentSubmissionSettings"
```

---

### Task 2: Configuração EF + registro no DbContext

**Repo:** `backend-metas`

**Files:**
- Create: `src/ControleAcao.Infrastructure/Data/Configurations/DocumentSubmissionSettingsConfiguration.cs`
- Modify: `src/ControleAcao.Infrastructure/Data/AppDbContext.cs`

- [ ] **Step 1: Criar a configuração EF**

```csharp
using ControleAcao.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ControleAcao.Infrastructure.Data.Configurations;

public class DocumentSubmissionSettingsConfiguration : IEntityTypeConfiguration<DocumentSubmissionSettings>
{
    public void Configure(EntityTypeBuilder<DocumentSubmissionSettings> builder)
    {
        builder.ToTable("document_submission_settings");
        builder.HasKey(s => s.Id);
        builder.Property(s => s.Id).HasColumnName("id");
        builder.Property(s => s.IsPaused).HasColumnName("is_paused").IsRequired();
        builder.Property(s => s.UpdatedByUserId).HasColumnName("updated_by_user_id");
        builder.Property(s => s.UpdatedAt).HasColumnName("updated_at");
    }
}
```

- [ ] **Step 2: Registrar o DbSet e a configuração no `AppDbContext`**

Em `src/ControleAcao.Infrastructure/Data/AppDbContext.cs`, adicione o `DbSet` junto aos outros (após a linha do `NewsletterDigestLogs`):

```csharp
    public DbSet<NewsletterDigestLog>  NewsletterDigestLogs  => Set<NewsletterDigestLog>();
    public DbSet<DocumentSubmissionSettings> DocumentSubmissionSettings => Set<DocumentSubmissionSettings>();
```

E em `OnModelCreating`, após `ApplyConfiguration(new NewsletterDigestLogConfiguration())`:

```csharp
        modelBuilder.ApplyConfiguration(new NewsletterDigestLogConfiguration());
        modelBuilder.ApplyConfiguration(new DocumentSubmissionSettingsConfiguration());
```

- [ ] **Step 3: Build**

Run: `dotnet build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/ControleAcao.Infrastructure/Data/Configurations/DocumentSubmissionSettingsConfiguration.cs src/ControleAcao.Infrastructure/Data/AppDbContext.cs
git commit -m "feat: mapear DocumentSubmissionSettings no EF Core"
```

---

### Task 3: Migration

**Repo:** `backend-metas`

**Files:**
- Create (auto-gerado): `src/ControleAcao.Infrastructure/Data/Migrations/<timestamp>_AddDocumentSubmissionSettings.cs` e `.Designer.cs`
- Modify (auto-gerado): `src/ControleAcao.Infrastructure/Data/Migrations/AppDbContextModelSnapshot.cs`

- [ ] **Step 1: Garantir que o Postgres local está rodando**

Run: `docker compose -f docker-compose.local.yml up -d`
Expected: container `controle-metas-postgres` `running`/`healthy`. Se já estiver rodando, este comando não faz nada de novo.

- [ ] **Step 2: Gerar a migration**

Run:
```bash
dotnet ef migrations add AddDocumentSubmissionSettings --project src/ControleAcao.Infrastructure/ControleAcao.Infrastructure.csproj --startup-project src/ControleAcao.Api/ControleAcao.Api.csproj -o Data/Migrations
```
Expected: saída `Done.` e os dois arquivos novos aparecem em `src/ControleAcao.Infrastructure/Data/Migrations/`.

- [ ] **Step 3: Conferir o conteúdo gerado**

Abra o arquivo `<timestamp>_AddDocumentSubmissionSettings.cs` e confirme que `Up()` cria a tabela `document_submission_settings` no schema `controle_acao` com as colunas `id` (uuid, PK), `is_paused` (bool, not null), `updated_by_user_id` (uuid, nullable), `updated_at` (timestamp with time zone, nullable) — sem seed de dados.

- [ ] **Step 4: Aplicar a migration no banco local**

Run:
```bash
dotnet ef database update --project src/ControleAcao.Infrastructure/ControleAcao.Infrastructure.csproj --startup-project src/ControleAcao.Api/ControleAcao.Api.csproj
```
Expected: `Done.`, sem erros de conexão.

- [ ] **Step 5: Commit**

```bash
git add src/ControleAcao.Infrastructure/Data/Migrations/
git commit -m "feat: adicionar migration da tabela document_submission_settings"
```

---

### Task 4: Repositório

**Repo:** `backend-metas`

**Files:**
- Create: `src/ControleAcao.Domain/Interfaces/Repositories/IDocumentSubmissionSettingsRepository.cs`
- Create: `src/ControleAcao.Infrastructure/Repositories/DocumentSubmissionSettingsRepository.cs`
- Modify: `src/ControleAcao.Infrastructure/Extensions/ServiceCollectionExtensions.cs`

- [ ] **Step 1: Criar a interface do repositório**

```csharp
using ControleAcao.Domain.Entities;

namespace ControleAcao.Domain.Interfaces.Repositories;

public interface IDocumentSubmissionSettingsRepository
{
    Task<DocumentSubmissionSettings?> GetAsync();
    Task<DocumentSubmissionSettings>  SetPausedAsync(bool isPaused, Guid? updatedByUserId);
}
```

- [ ] **Step 2: Implementar o repositório**

```csharp
using ControleAcao.Domain.Entities;
using ControleAcao.Domain.Interfaces.Repositories;
using ControleAcao.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ControleAcao.Infrastructure.Repositories;

public class DocumentSubmissionSettingsRepository : IDocumentSubmissionSettingsRepository
{
    private readonly AppDbContext _context;
    public DocumentSubmissionSettingsRepository(AppDbContext context) => _context = context;

    public Task<DocumentSubmissionSettings?> GetAsync() =>
        _context.DocumentSubmissionSettings.FirstOrDefaultAsync();

    public async Task<DocumentSubmissionSettings> SetPausedAsync(bool isPaused, Guid? updatedByUserId)
    {
        var existing = await _context.DocumentSubmissionSettings.FirstOrDefaultAsync();
        var now = DateTime.UtcNow;

        if (existing == null)
        {
            existing = new DocumentSubmissionSettings
            {
                IsPaused        = isPaused,
                UpdatedByUserId = updatedByUserId,
                UpdatedAt       = now
            };
            _context.DocumentSubmissionSettings.Add(existing);
        }
        else
        {
            existing.IsPaused        = isPaused;
            existing.UpdatedByUserId = updatedByUserId;
            existing.UpdatedAt       = now;
        }

        await _context.SaveChangesAsync();
        return existing;
    }
}
```

- [ ] **Step 3: Registrar no DI**

Em `src/ControleAcao.Infrastructure/Extensions/ServiceCollectionExtensions.cs`, adicione junto aos outros repositórios (após `services.AddScoped<INewsletterDigestLogRepository, NewsletterDigestLogRepository>();` ou linha equivalente):

```csharp
        services.AddScoped<IDocumentSubmissionSettingsRepository, DocumentSubmissionSettingsRepository>();
```

- [ ] **Step 4: Build**

Run: `dotnet build`
Expected: build succeeds.

- [ ] **Step 5: Commit**

```bash
git add src/ControleAcao.Domain/Interfaces/Repositories/IDocumentSubmissionSettingsRepository.cs src/ControleAcao.Infrastructure/Repositories/DocumentSubmissionSettingsRepository.cs src/ControleAcao.Infrastructure/Extensions/ServiceCollectionExtensions.cs
git commit -m "feat: adicionar repositorio de DocumentSubmissionSettings"
```

---

### Task 5: DTOs

**Repo:** `backend-metas`

**Files:**
- Create: `src/ControleAcao.Application/DTOs/DocumentSubmissions/DocumentSubmissionsStatusDto.cs`

- [ ] **Step 1: Criar os DTOs de request/response**

```csharp
namespace ControleAcao.Application.DTOs.DocumentSubmissions;

/// <summary>Estado atual dos envios de documentos.</summary>
/// <param name="IsPaused">Se os envios estão pausados.</param>
/// <param name="UpdatedByUserId">Usuário que fez a última alteração.</param>
/// <param name="UpdatedByUserName">Nome do usuário que fez a última alteração.</param>
/// <param name="UpdatedAt">Quando a última alteração ocorreu.</param>
public record DocumentSubmissionsStatusDto(
    bool      IsPaused,
    Guid?     UpdatedByUserId,
    string?   UpdatedByUserName,
    DateTime? UpdatedAt
);

/// <summary>Payload para pausar/liberar os envios de documentos.</summary>
/// <param name="IsPaused">Novo estado desejado.</param>
public record SetDocumentSubmissionsStatusDto(bool IsPaused);
```

- [ ] **Step 2: Build**

Run: `dotnet build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ControleAcao.Application/DTOs/DocumentSubmissions/DocumentSubmissionsStatusDto.cs
git commit -m "feat: adicionar DTOs de status dos envios de documentos"
```

---

### Task 6: `DocumentSubmissionsController`

**Repo:** `backend-metas`

**Files:**
- Create: `src/ControleAcao.Api/Controllers/DocumentSubmissionsController.cs`

- [ ] **Step 1: Criar o controller**

```csharp
using System.Security.Claims;
using ControleAcao.Api.Hubs;
using ControleAcao.Application.DTOs.DocumentSubmissions;
using ControleAcao.Domain.Interfaces.Repositories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;

namespace ControleAcao.Api.Controllers;

/// <summary>
/// Estado global de pausa/liberação dos envios de documentos.
/// Leitura para qualquer usuário autenticado; alteração requer Admin.
/// </summary>
[ApiController]
[Route("document-submissions")]
[Authorize]
public class DocumentSubmissionsController : ControllerBase
{
    private readonly IDocumentSubmissionSettingsRepository _repo;
    private readonly IUserRepository                       _users;
    private readonly IHubContext<MetaHub>                  _hubContext;

    public DocumentSubmissionsController(
        IDocumentSubmissionSettingsRepository repo,
        IUserRepository users,
        IHubContext<MetaHub> hubContext)
    {
        _repo       = repo;
        _users      = users;
        _hubContext = hubContext;
    }

    /// <summary>Retorna se os envios de documentos estão pausados.</summary>
    [HttpGet("status")]
    [ProducesResponseType(typeof(DocumentSubmissionsStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetStatus()
    {
        return Ok(await BuildStatusDtoAsync());
    }

    /// <summary>Pausa ou libera os envios de documentos. Requer Admin.</summary>
    [HttpPost("status")]
    [Authorize(Policy = "RequireAdmin")]
    [ProducesResponseType(typeof(DocumentSubmissionsStatusDto), StatusCodes.Status200OK)]
    public async Task<IActionResult> SetStatus([FromBody] SetDocumentSubmissionsStatusDto dto)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        await _repo.SetPausedAsync(dto.IsPaused, userId);

        var status = await BuildStatusDtoAsync();
        await _hubContext.Clients.All.SendAsync("documentSubmissionsStatusChanged", status);

        return Ok(status);
    }

    private async Task<DocumentSubmissionsStatusDto> BuildStatusDtoAsync()
    {
        var settings = await _repo.GetAsync();
        if (settings == null)
            return new DocumentSubmissionsStatusDto(false, null, null, null);

        string? userName = null;
        if (settings.UpdatedByUserId is { } uid)
        {
            var user = await _users.GetByIdAsync(uid);
            userName = user?.Name;
        }

        return new DocumentSubmissionsStatusDto(
            settings.IsPaused, settings.UpdatedByUserId, userName, settings.UpdatedAt);
    }
}
```

- [ ] **Step 2: Build**

Run: `dotnet build`
Expected: build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/ControleAcao.Api/Controllers/DocumentSubmissionsController.cs
git commit -m "feat: adicionar endpoints de status dos envios de documentos"
```

---

### Task 7: Bloquear ações de documento quando pausado

**Repo:** `backend-metas`

**Files:**
- Modify: `src/ControleAcao.Api/Controllers/TopicoDocumentosController.cs`

- [ ] **Step 1: Injetar o repositório e adicionar o helper de checagem**

No topo da classe, adicione o campo (após `private readonly NotificacaoHelper _notif;`):

```csharp
    private readonly NotificacaoHelper       _notif;
    private readonly IDocumentSubmissionSettingsRepository _submissionsRepo;
    private const string HubDocLogged = "topicoDocumentLogged";

    public TopicoDocumentosController(
        ITopicoDocumentoService service,
        IDocumentoLogService logService,
        IHubContext<MetaHub> hubContext,
        NotificacaoHelper notif,
        IDocumentSubmissionSettingsRepository submissionsRepo)
    {
        _service         = service;
        _logService      = logService;
        _hubContext      = hubContext;
        _notif           = notif;
        _submissionsRepo = submissionsRepo;
    }
```

(isso substitui o construtor e os campos `_notif`/`HubDocLogged` existentes — mantenha o resto igual.)

Adicione o helper de checagem junto aos outros helpers privados (após `IsAdmin()`):

```csharp
    private async Task<IActionResult?> CheckSubmissionsOpenAsync()
    {
        var settings = await _submissionsRepo.GetAsync();
        if (settings?.IsPaused == true)
            return StatusCode(403, ApiResponse<object>.Fail("Envios de documentos estão pausados."));
        return null;
    }
```

E adicione o using no topo do arquivo:

```csharp
using ControleAcao.Domain.Interfaces.Repositories;
```

- [ ] **Step 2: Adicionar a checagem no início de cada ação de escrita**

Em cada um dos métodos abaixo, adicione a primeira linha do corpo (antes de qualquer outra lógica):

```csharp
if (await CheckSubmissionsOpenAsync() is { } blocked) return blocked;
```

Métodos a alterar: `Upload`, `Reupload`, `Approve`, `ApproveWithFile`, `Confirm`, `Return`, `Delete`.

Exemplo para `Upload` (linha 94 antes da alteração):

```csharp
    public async Task<IActionResult> Upload(Guid topicoId, IFormFile file)
    {
        if (await CheckSubmissionsOpenAsync() is { } blocked) return blocked;

        if (file == null || file.Length == 0)
            return BadRequest(ApiResponse<object>.Fail("Nenhum arquivo enviado."));
        ...
```

Repita o mesmo padrão (checagem como primeira linha do corpo do método) para `Reupload`, `Approve`, `ApproveWithFile`, `Confirm`, `Return` e `Delete`. `GetAll` e `GetLogs` **não** recebem a checagem — continuam sempre liberados.

- [ ] **Step 3: Build**

Run: `dotnet build`
Expected: build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/ControleAcao.Api/Controllers/TopicoDocumentosController.cs
git commit -m "feat: bloquear acoes de documento quando envios estiverem pausados"
```

---

### Task 8: Verificação manual do backend

**Repo:** `backend-metas`

- [ ] **Step 1: Rodar a API localmente com auth de dev (bypass) e Swagger habilitados**

O `.env` local tem `METAS_PRODUCTION=TRUE`, o que desativa o Swagger e exige JWT real. Para testar rapidamente, rode só esta vez com override (não altera o `.env`):

Run: `METAS_PRODUCTION=FALSE dotnet run --project src/ControleAcao.Api`
Expected: log `Modo: DEVELOPMENT (auth desativada)`, API sobe em `http://localhost:5100`, Swagger em `http://localhost:5100/swagger`.

- [ ] **Step 2: Testar o fluxo via Swagger ou curl**

1. `GET /document-submissions/status` → `{ "isPaused": false, "updatedByUserId": null, "updatedByUserName": null, "updatedAt": null }`.
2. `POST /document-submissions/status` com `{ "isPaused": true }` → retorna `isPaused: true` e `updatedByUserName` preenchido (em dev bypass, o usuário é Admin automático).
3. `GET /document-submissions/status` de novo → confirma `isPaused: true` persistido.
4. `POST /topicos/{topicoId}/documents/{docId}/confirm` (ou qualquer outra ação de escrita, com um `docId` existente) → `403` com `{ "success": false, "error": "Envios de documentos estão pausados." }`.
5. `POST /document-submissions/status` com `{ "isPaused": false }` → libera de novo; repita o passo 4 e confirme que agora funciona normalmente (ou falha por outro motivo de negócio, não por 403 de pausa).

Expected: todos os passos batem com o descrito.

- [ ] **Step 3: Parar o servidor**

Encerre o `dotnet run` (Ctrl+C). Nenhum commit necessário neste task (é só verificação).

---

## Parte 2 — Frontend (`controle-de-metas`)

### Task 9: Evento de status no `useMetaHub`

**Repo:** `controle-de-metas`

**Files:**
- Modify: `src/hooks/useMetaHub.ts`

- [ ] **Step 1: Adicionar o tipo do payload**

Após a interface `NotificacaoPayload` (linha 77), adicione:

```ts
export interface DocumentSubmissionsStatusPayload {
  isPaused:          boolean;
  updatedByUserId:   string | null;
  updatedByUserName: string | null;
  updatedAt:         string | null;
}
```

- [ ] **Step 2: Adicionar o callback opcional em `UseMetaHubOptions`**

```ts
interface UseMetaHubOptions {
  onMetaStatusChanged?:      (payload: MetaStatusChangedPayload) => void;
  onMetaCreated?:            (payload: MetaCreatedPayload) => void;
  onTopicoDocumentAdded?:    (payload: TopicoDocumentoPayload) => void;
  onTopicoDocumentRemoved?:  (payload: TopicoDocumentoRemovedPayload) => void;
  onTopicoDocumentUpdated?:  (payload: TopicoDocumentoPayload) => void;
  onMetaStatusLogged?:       (payload: MetaStatusLoggedPayload) => void;
  onTopicoDocumentLogged?:   (payload: TopicoDocumentLoggedPayload) => void;
  onUserRoleLogged?:         (payload: UserRoleLoggedPayload) => void;
  onNotificacaoRecebida?:    (payload: NotificacaoPayload) => void;
  onDocumentSubmissionsStatusChanged?: (payload: DocumentSubmissionsStatusPayload) => void;
}
```

- [ ] **Step 3: Adicionar o parâmetro, o ref e o effect de sincronização**

Troque a assinatura de `useMetaHub`:

```ts
export function useMetaHub({
  onMetaStatusChanged,
  onMetaCreated,
  onTopicoDocumentAdded,
  onTopicoDocumentRemoved,
  onTopicoDocumentUpdated,
  onMetaStatusLogged,
  onTopicoDocumentLogged,
  onUserRoleLogged,
  onNotificacaoRecebida,
}: UseMetaHubOptions) {
```

por:

```ts
export function useMetaHub({
  onMetaStatusChanged,
  onMetaCreated,
  onTopicoDocumentAdded,
  onTopicoDocumentRemoved,
  onTopicoDocumentUpdated,
  onMetaStatusLogged,
  onTopicoDocumentLogged,
  onUserRoleLogged,
  onNotificacaoRecebida,
  onDocumentSubmissionsStatusChanged,
}: UseMetaHubOptions) {
```

Após `const onNotificacaoRef = useRef(onNotificacaoRecebida);`:

```ts
  const onSubmissionsStatusRef = useRef(onDocumentSubmissionsStatusChanged);
```

Após `useEffect(() => { onNotificacaoRef.current = onNotificacaoRecebida; }, [onNotificacaoRecebida]);`:

```ts
  useEffect(() => { onSubmissionsStatusRef.current = onDocumentSubmissionsStatusChanged; }, [onDocumentSubmissionsStatusChanged]);
```

- [ ] **Step 4: Registrar e desregistrar o evento no hub**

Após `const handleNotificacao = (p: NotificacaoPayload) => onNotificacaoRef.current?.(p);`:

```ts
    const handleSubmissionsStatus = (p: DocumentSubmissionsStatusPayload) => onSubmissionsStatusRef.current?.(p);
```

Após `globalConnection.on("notificacaoRecebida", handleNotificacao);`:

```ts
    globalConnection.on("documentSubmissionsStatusChanged", handleSubmissionsStatus);
```

Após `globalConnection.off("notificacaoRecebida", handleNotificacao);` (no cleanup):

```ts
        globalConnection.off("documentSubmissionsStatusChanged", handleSubmissionsStatus);
```

- [ ] **Step 5: Rodar o typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros novos relacionados a `useMetaHub.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/hooks/useMetaHub.ts
git commit -m "feat: adicionar evento documentSubmissionsStatusChanged ao useMetaHub"
```

---

### Task 10: Política pura de permissões (com testes)

**Repo:** `controle-de-metas`

**Files:**
- Create: `src/lib/document-submissions.ts`
- Test: `src/lib/document-submissions.test.ts`

- [ ] **Step 1: Escrever os testes (falhando)**

```ts
import { describe, expect, it } from "vitest";
import {
  canConfirmDocument,
  canDeleteDocument,
  canReuploadDocument,
  canReviewDocuments,
  canUploadDocuments,
} from "@/lib/document-submissions";

describe("canUploadDocuments", () => {
  it("permite Admin, Analista e Aprovador quando os envios estão abertos", () => {
    expect(canUploadDocuments("Admin", false)).toBe(true);
    expect(canUploadDocuments("Analista", false)).toBe(true);
    expect(canUploadDocuments("Aprovador", false)).toBe(true);
  });

  it("nega Visualizador mesmo com envios abertos", () => {
    expect(canUploadDocuments("Visualizador", false)).toBe(false);
  });

  it("nega qualquer role quando os envios estão pausados", () => {
    expect(canUploadDocuments("Admin", true)).toBe(false);
  });
});

describe("canReviewDocuments", () => {
  it("permite Admin e Aprovador quando aberto", () => {
    expect(canReviewDocuments("Admin", false)).toBe(true);
    expect(canReviewDocuments("Aprovador", false)).toBe(true);
  });

  it("nega Analista", () => {
    expect(canReviewDocuments("Analista", false)).toBe(false);
  });

  it("nega quando pausado", () => {
    expect(canReviewDocuments("Aprovador", true)).toBe(false);
  });
});

describe("canReuploadDocument", () => {
  it("permite o autor do upload quando o documento foi devolvido e está aberto", () => {
    expect(canReuploadDocument("Devolvido", "user-1", "user-1", "Analista", false)).toBe(true);
  });

  it("permite Admin mesmo não sendo o autor", () => {
    expect(canReuploadDocument("Devolvido", "user-1", "user-2", "Admin", false)).toBe(true);
  });

  it("nega outro analista que não é o autor", () => {
    expect(canReuploadDocument("Devolvido", "user-1", "user-2", "Analista", false)).toBe(false);
  });

  it("nega quando o documento não está devolvido", () => {
    expect(canReuploadDocument("PendenteAprovacao", "user-1", "user-1", "Analista", false)).toBe(false);
  });

  it("nega quando pausado", () => {
    expect(canReuploadDocument("Devolvido", "user-1", "user-1", "Admin", true)).toBe(false);
  });
});

describe("canDeleteDocument", () => {
  it("Admin pode excluir qualquer status quando aberto", () => {
    expect(canDeleteDocument("Aprovado", "user-1", "user-2", "Admin", false)).toBe(true);
  });

  it("autor pode excluir o próprio documento não aprovado", () => {
    expect(canDeleteDocument("PendenteAprovacao", "user-1", "user-1", "Analista", false)).toBe(true);
  });

  it("autor não pode excluir documento já aprovado", () => {
    expect(canDeleteDocument("Aprovado", "user-1", "user-1", "Analista", false)).toBe(false);
  });

  it("nega quando pausado, mesmo para Admin", () => {
    expect(canDeleteDocument("PendenteAprovacao", "user-1", "user-2", "Admin", true)).toBe(false);
  });
});

describe("canConfirmDocument", () => {
  it("permite o autor confirmar quando aguardando confirmação e aberto", () => {
    expect(canConfirmDocument("PendenteConfirmacaoAnalista", "user-1", "user-1", "Analista", false)).toBe(true);
  });

  it("permite Admin confirmar mesmo não sendo o autor", () => {
    expect(canConfirmDocument("PendenteConfirmacaoAnalista", "user-1", "user-2", "Admin", false)).toBe(true);
  });

  it("nega quando o status não é PendenteConfirmacaoAnalista", () => {
    expect(canConfirmDocument("Aprovado", "user-1", "user-1", "Analista", false)).toBe(false);
  });

  it("nega quando pausado", () => {
    expect(canConfirmDocument("PendenteConfirmacaoAnalista", "user-1", "user-1", "Admin", true)).toBe(false);
  });
});
```

- [ ] **Step 2: Rodar os testes para confirmar que falham**

Run: `npx vitest run src/lib/document-submissions.test.ts`
Expected: FAIL — `Cannot find module '@/lib/document-submissions'`.

- [ ] **Step 3: Implementar o módulo**

```ts
import type { Role } from "@/lib/auth";

type DocumentoStatus = "PendenteAprovacao" | "PendenteConfirmacaoAnalista" | "Aprovado" | "Devolvido";

export function canUploadDocuments(role: Role | undefined, submissionsPaused: boolean): boolean {
  if (submissionsPaused) return false;
  return role === "Admin" || role === "Analista" || role === "Aprovador";
}

export function canReviewDocuments(role: Role | undefined, submissionsPaused: boolean): boolean {
  if (submissionsPaused) return false;
  return role === "Admin" || role === "Aprovador";
}

export function canReuploadDocument(
  docStatus: DocumentoStatus,
  uploadedByUserId: string,
  currentUserId: string | undefined,
  role: Role | undefined,
  submissionsPaused: boolean
): boolean {
  if (submissionsPaused) return false;
  if (docStatus !== "Devolvido") return false;
  return role === "Admin" || uploadedByUserId === currentUserId;
}

export function canDeleteDocument(
  docStatus: DocumentoStatus,
  uploadedByUserId: string,
  currentUserId: string | undefined,
  role: Role | undefined,
  submissionsPaused: boolean
): boolean {
  if (submissionsPaused) return false;
  if (role === "Admin") return true;
  if (docStatus === "Aprovado") return false;
  return uploadedByUserId === currentUserId;
}

export function canConfirmDocument(
  docStatus: DocumentoStatus,
  uploadedByUserId: string,
  currentUserId: string | undefined,
  role: Role | undefined,
  submissionsPaused: boolean
): boolean {
  if (submissionsPaused) return false;
  if (docStatus !== "PendenteConfirmacaoAnalista") return false;
  return currentUserId === uploadedByUserId || role === "Admin";
}
```

- [ ] **Step 4: Rodar os testes de novo para confirmar que passam**

Run: `npx vitest run src/lib/document-submissions.test.ts`
Expected: PASS — todos os testes verdes.

- [ ] **Step 5: Commit**

```bash
git add src/lib/document-submissions.ts src/lib/document-submissions.test.ts
git commit -m "feat: adicionar politica de permissoes de envio de documentos"
```

---

### Task 11: `TemasView` — estado global, banner e tempo real

**Repo:** `controle-de-metas`

**Files:**
- Modify: `src/components/dashboard/TemasView.tsx`

- [ ] **Step 1: Importar o novo tipo do hook**

Na linha do import de `useMetaHub` (linha 12), adicione `DocumentSubmissionsStatusPayload` à lista de tipos importados:

```ts
import { useMetaHub, MetaStatus as LiveMetaStatus, TopicoDocumentoPayload, TopicoDocumentoRemovedPayload, MetaStatusLoggedPayload, TopicoDocumentLoggedPayload, UserRoleLoggedPayload, DocumentSubmissionsStatusPayload } from "@/hooks/useMetaHub";
```

- [ ] **Step 2: Adicionar o estado `submissionsPaused` no componente `TemasView`**

Após `const [hubConnected, setHubConnected] = useState(false);` (linha 1254):

```ts
  const [submissionsPaused, setSubmissionsPaused] = useState(false);
```

- [ ] **Step 3: Buscar o estado inicial ao montar**

Após o bloco `useEffect` de auto-expand (linhas 1257–1261), adicione:

```ts
  useEffect(() => {
    api.get<DocumentSubmissionsStatusPayload>("/document-submissions/status")
      .then((r) => setSubmissionsPaused(r.data.isPaused))
      .catch(() => {});
  }, []);
```

- [ ] **Step 4: Adicionar o handler de tempo real**

Após `const handleTopicoDocumentLogged = useCallback(...)` (linhas 1337–1339), adicione:

```ts
  const handleDocumentSubmissionsStatusChanged = useCallback((payload: DocumentSubmissionsStatusPayload) => {
    setSubmissionsPaused(payload.isPaused);
  }, []);
```

- [ ] **Step 5: Registrar o handler no `useMetaHub`**

No objeto passado para `useMetaHub` (linhas 1341–1349), adicione a última propriedade:

```ts
  useMetaHub({
    onMetaStatusChanged:      handleMetaStatusChanged,
    onMetaCreated:            handleMetaCreated,
    onTopicoDocumentAdded:    handleTopicoDocumentAdded,
    onTopicoDocumentRemoved:  handleTopicoDocumentRemoved,
    onTopicoDocumentUpdated:  handleTopicoDocumentUpdated,
    onMetaStatusLogged:       handleMetaStatusLogged,
    onTopicoDocumentLogged:   handleTopicoDocumentLogged,
    onDocumentSubmissionsStatusChanged: handleDocumentSubmissionsStatusChanged,
  });
```

- [ ] **Step 6: Renderizar o banner**

Logo após o `</div>` que fecha o cabeçalho da página (linha 1477, o `<div className="flex items-center justify-between">` com o título "Temas & Metas" e o botão "Novo Tema"), antes do comentário `{/* Create Tema Dialog */}`:

```tsx
      {submissionsPaused && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 dark:border-amber-400/20 dark:bg-amber-400/10 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
          <AlertCircle size={16} />
          <span className="font-medium">Envios de documentos temporariamente pausados.</span>
        </div>
      )}
```

(`AlertCircle` já está importado no topo do arquivo.)

- [ ] **Step 7: Passar o estado para `TopicoCard`**

No JSX que renderiza `<TopicoCard ...>` (linha 1707), adicione a prop logo após `topico={t}`:

```tsx
                      <TopicoCard
                        key={t.id}
                        topico={t}
                        submissionsPaused={submissionsPaused}
                        liveStatuses={liveStatuses}
```

- [ ] **Step 8: Rodar o typecheck**

Run: `npx tsc --noEmit`
Expected: erro esperado nesta etapa — `TopicoCardProps` ainda não tem `submissionsPaused` (resolvido no próximo task). Se aparecer qualquer outro erro não relacionado a isso, corrija antes de prosseguir.

- [ ] **Step 9: Commit**

```bash
git add src/components/dashboard/TemasView.tsx
git commit -m "feat: buscar e refletir estado global de envios pausados em TemasView"
```

---

### Task 12: `TopicoCard` — gating das ações com a política pura

**Repo:** `controle-de-metas`

**Files:**
- Modify: `src/components/dashboard/TemasView.tsx`

- [ ] **Step 1: Importar as funções de política**

Junto aos demais imports de `@/lib` no topo do arquivo (perto do import de `api`), adicione:

```ts
import {
  canConfirmDocument,
  canDeleteDocument,
  canReuploadDocument,
  canReviewDocuments,
  canUploadDocuments,
} from "@/lib/document-submissions";
```

- [ ] **Step 2: Adicionar `submissionsPaused` à interface e à assinatura de `TopicoCard`**

```ts
interface TopicoCardProps {
  topico:            Topico;
  onAddMeta:         (topicoId: string) => void;
  onTopicUpdated?:   () => void;
  liveStatuses:      Map<string, MetaStatus>;
  documents:         TopicoDocumento[];
  onDocumentsChange: (topicoId: string, docs: TopicoDocumento[]) => void;
  liveDocLogs:       Map<string, DocumentoLog>;
  liveMetaLogs:      Map<string, MetaStatusLog>;
  defaultExpanded?:  boolean;
  submissionsPaused: boolean;
}

function TopicoCard({ topico, onAddMeta, onTopicUpdated, liveStatuses, documents, onDocumentsChange, liveDocLogs, liveMetaLogs, defaultExpanded, submissionsPaused }: TopicoCardProps) {
```

- [ ] **Step 3: Substituir as checagens de permissão pelas funções puras**

Troque (linhas 419–431):

```ts
  const isApprover     = user?.role === "Admin" || user?.role === "Aprovador";
  const canUpload      = user?.role === "Admin" || user?.role === "Analista" || user?.role === "Aprovador";
  const canViewHistory = user?.role === "Admin" || user?.role === "Aprovador";

  const canDelete = (doc: TopicoDocumento) => {
    if (user?.role === "Admin") return true;
    if (doc.status === "Aprovado") return false;
    return doc.uploadedByUserId === user?.userId;
  };

  const canReupload = (doc: TopicoDocumento) =>
    doc.status === "Devolvido" &&
    (user?.role === "Admin" || doc.uploadedByUserId === user?.userId);
```

por:

```ts
  const isApprover     = canReviewDocuments(user?.role, submissionsPaused);
  const canUpload       = canUploadDocuments(user?.role, submissionsPaused);
  const canViewHistory = user?.role === "Admin" || user?.role === "Aprovador";

  const canDelete = (doc: TopicoDocumento) =>
    canDeleteDocument(doc.status, doc.uploadedByUserId, user?.userId, user?.role, submissionsPaused);

  const canReupload = (doc: TopicoDocumento) =>
    canReuploadDocument(doc.status, doc.uploadedByUserId, user?.userId, user?.role, submissionsPaused);
```

(`canViewHistory` não muda — ver histórico continua liberado mesmo pausado.)

- [ ] **Step 4: Gatear o botão "Confirmar versão final"**

Troque (linhas 1105–1106):

```tsx
                              {doc.status === "PendenteConfirmacaoAnalista" &&
                               (user?.userId === doc.uploadedByUserId || user?.role === "Admin") && (
```

por:

```tsx
                              {canConfirmDocument(doc.status, doc.uploadedByUserId, user?.userId, user?.role, submissionsPaused) && (
```

- [ ] **Step 5: Rodar o typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 6: Rodar a suíte de testes**

Run: `npx vitest run`
Expected: PASS (inclui os testes do Task 10).

- [ ] **Step 7: Commit**

```bash
git add src/components/dashboard/TemasView.tsx
git commit -m "feat: desabilitar acoes de documento em TopicoCard quando envios pausados"
```

---

### Task 13: Card de admin em `IntegracoesView`

**Repo:** `controle-de-metas`

**Files:**
- Modify: `src/components/dashboard/IntegracoesView.tsx`

- [ ] **Step 1: Adicionar imports**

Troque a linha de import de ícones:

```ts
import {
  Plug, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2, ExternalLink,
} from "lucide-react";
```

por:

```ts
import {
  Plug, RefreshCw, CheckCircle2, AlertTriangle, XCircle, Loader2, ExternalLink, PauseCircle, PlayCircle,
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { DocumentSubmissionsStatusPayload } from "@/hooks/useMetaHub";
```

- [ ] **Step 2: Adicionar estado e busca do status de envios**

Dentro de `export function IntegracoesView()`, após a declaração de `authorizing`:

```ts
  const [subStatus, setSubStatus]     = useState<DocumentSubmissionsStatusPayload | null>(null);
  const [subLoading, setSubLoading]   = useState(true);
  const [subToggling, setSubToggling] = useState(false);

  async function fetchSubStatus() {
    setSubLoading(true);
    try {
      const r = await api.get<DocumentSubmissionsStatusPayload>("/document-submissions/status");
      setSubStatus(r.data);
    } catch {
      toast.error("Erro ao carregar status dos envios de documentos.");
    } finally {
      setSubLoading(false);
    }
  }

  async function handleToggleSubmissions(checked: boolean) {
    setSubToggling(true);
    try {
      const r = await api.post<DocumentSubmissionsStatusPayload>("/document-submissions/status", { isPaused: checked });
      setSubStatus(r.data);
      toast.success(checked ? "Envios de documentos pausados." : "Envios de documentos liberados.");
    } catch {
      toast.error("Erro ao alterar o status dos envios.");
    } finally {
      setSubToggling(false);
    }
  }
```

- [ ] **Step 3: Buscar o status ao montar**

No `useEffect` existente que chama `fetchStatus()` ao montar, adicione a chamada nova junto:

```ts
  useEffect(() => {
    fetchStatus();
    fetchSubStatus();
    // Callback do OAuth volta com ?google_drive=ok — mostra toast e limpa query
```

(mantém o restante do `useEffect` igual.)

- [ ] **Step 4: Renderizar o novo card**

Após o `</motion.div>` que fecha o card do Google Drive (logo antes do `</div>` final que fecha `<div className="flex flex-col gap-6">`), adicione:

```tsx
      {/* Pausar/liberar envios de documentos */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.05 }}
        className="bg-white dark:bg-slate-900 border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col gap-5"
      >
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            {subStatus?.isPaused
              ? <PauseCircle size={20} className="text-amber-500" />
              : <PlayCircle size={20} className="text-primary" />}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-foreground">Envios de documentos</h3>
              <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                subStatus?.isPaused
                  ? "bg-amber-400/10 text-amber-500 border-amber-400/20"
                  : "bg-emerald-400/10 text-emerald-500 border-emerald-400/20"
              }`}>
                {subStatus?.isPaused ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
                {subStatus?.isPaused ? "Pausados" : "Abertos"}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Controla se analistas e aprovadores podem enviar, reenviar, aprovar, devolver, confirmar ou excluir documentos.
            </p>
          </div>
        </div>

        {subLoading ? (
          <div className="flex items-center justify-center h-16">
            <Loader2 size={20} className="animate-spin text-primary" />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-border/40 p-4">
              <div>
                <p className="text-sm font-semibold text-foreground">Pausar envios de documentos</p>
                {subStatus?.updatedByUserName && (
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Última alteração por {subStatus.updatedByUserName} em {formatDate(subStatus.updatedAt ?? undefined)}
                  </p>
                )}
              </div>
              <Switch
                checked={subStatus?.isPaused ?? false}
                disabled={subToggling}
                onCheckedChange={handleToggleSubmissions}
              />
            </div>
          </>
        )}
      </motion.div>
```

- [ ] **Step 5: Rodar o typecheck**

Run: `npx tsc --noEmit`
Expected: sem erros.

- [ ] **Step 6: Commit**

```bash
git add src/components/dashboard/IntegracoesView.tsx
git commit -m "feat: adicionar toggle de pausar/liberar envios em Integracoes"
```

---

### Task 14: Verificação manual no browser

**Repo:** `controle-de-metas`

- [ ] **Step 1: Subir o backend (dev bypass) e o frontend**

Terminal 1 (`backend-metas`): `METAS_PRODUCTION=FALSE dotnet run --project src/ControleAcao.Api`
Terminal 2 (`controle-de-metas`): `npm run dev`

- [ ] **Step 2: Build de produção do frontend**

Run: `npm run build`
Expected: build succeeds, sem erros de tipo ou lint.

- [ ] **Step 3: Fluxo manual completo**

1. Abrir o dashboard, ir em **Integrações** → conferir o novo card "Envios de documentos", estado inicial "Abertos".
2. Ativar o toggle → toast de sucesso, badge muda para "Pausados", mostra "Última alteração por ...".
3. Ir em **Temas & Metas** → banner amber "Envios de documentos temporariamente pausados" aparece no topo, sem precisar recarregar a página (chegou via SignalR).
4. Expandir um tópico com documentos → botões de anexar, reenviar, aprovar, devolver, confirmar e excluir somem/ficam indisponíveis; visualizar arquivo e histórico continuam funcionando.
5. Voltar em Integrações e desativar o toggle → banner em Temas & Metas some sozinho, ações voltam a aparecer.
6. Abrir duas abas logadas como Admin, pausar em uma, confirmar que a outra atualiza sozinha (tempo real).

Expected: todos os itens acima se comportam como descrito.

- [ ] **Step 4: Encerrar os servidores locais**

Ctrl+C nos dois terminais. Nenhum commit necessário neste task.

---

## Self-review (cobertura do spec)

- Modelo de dados / endpoints / enforcement no backend → Tasks 1–8.
- Tempo real via SignalR (`MetaHub`) → Task 6 (broadcast) e Task 9 (consumo no hook).
- Toggle admin em Integrações → Task 13.
- Banner + gating em TemasView → Tasks 11–12.
- Testes: backend sem testes automatizados (decisão explícita do usuário, documentada no spec) — coberto por verificação manual (Task 8). Frontend: política pura 100% testada via Vitest (Task 10); `useMetaHub`, `TemasView` e `IntegracoesView` cobertos por verificação manual no browser (Task 14) — não há testes de componente existentes no projeto para seguir como padrão, e montar esses componentes exigiria mockar `AuthContext`, `axios` e `@microsoft/signalr` para um ganho de cobertura desproporcional ao escopo "conciso" pedido.
