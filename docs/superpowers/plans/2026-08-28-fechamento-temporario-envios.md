# Fechamento Temporario de Envios Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Impedir temporariamente, pela interface administrativa, qualquer novo envio ou alteracao de arquivo sem migration ou mudanca no backend.

**Architecture:** Uma politica pura em `src/lib/document-submissions.ts` concentra o estado aberto/fechado e a permissao de cada acao. `TemasView` usa essa politica tanto para renderizar controles quanto para proteger handlers, mantendo aprovacao do PDF existente, confirmacao, leitura e historico.

**Tech Stack:** Next.js 15, React 18, TypeScript, Vitest, Tailwind CSS, Radix UI.

**Spec:** `docs/superpowers/specs/2026-08-28-fechamento-temporario-envios-design.md`

## Global Constraints

- `DOCUMENT_SUBMISSIONS_OPEN` deve ser publicado como `false`.
- Nenhum endpoint, contrato da API, tabela, migration ou configuracao de producao sera alterado.
- A trava e temporaria e atua somente no frontend; chamadas diretas a API permanecem fora do escopo.
- Visualizacao, links do Drive, historico, aprovacao do PDF existente e confirmacao final continuam disponiveis.

---

### Task 1: Politica central de envios

**Files:**
- Create: `src/lib/document-submissions.ts`
- Create: `src/lib/document-submissions.test.ts`

**Interfaces:**
- Produces: `DOCUMENT_SUBMISSIONS_OPEN: boolean`
- Produces: `DOCUMENT_SUBMISSIONS_CLOSED_MESSAGE: string`
- Produces: `DocumentSubmissionAction`
- Produces: `isDocumentSubmissionActionAllowed(action, submissionsOpen?): boolean`

- [x] **Step 1: Write the failing policy tests**

```ts
import { describe, expect, it } from "vitest";
import {
  DOCUMENT_SUBMISSIONS_OPEN,
  isDocumentSubmissionActionAllowed,
} from "@/lib/document-submissions";

describe("document submission policy", () => {
  it("ships with document mutations closed", () => {
    expect(DOCUMENT_SUBMISSIONS_OPEN).toBe(false);
    for (const action of ["upload", "reupload", "delete", "return", "approveWithFile"] as const) {
      expect(isDocumentSubmissionActionAllowed(action)).toBe(false);
    }
  });

  it("keeps existing-file approval and final confirmation available", () => {
    expect(isDocumentSubmissionActionAllowed("approveExisting")).toBe(true);
    expect(isDocumentSubmissionActionAllowed("confirm")).toBe(true);
  });

  it("allows every action when submissions are reopened", () => {
    expect(isDocumentSubmissionActionAllowed("upload", true)).toBe(true);
    expect(isDocumentSubmissionActionAllowed("approveWithFile", true)).toBe(true);
  });
});
```

- [x] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- src/lib/document-submissions.test.ts`

Expected: FAIL because `@/lib/document-submissions` does not exist.

- [x] **Step 3: Implement the minimal policy**

```ts
export const DOCUMENT_SUBMISSIONS_OPEN = false;

export const DOCUMENT_SUBMISSIONS_CLOSED_MESSAGE =
  "Os envios e alteracoes de documentos estao encerrados.";

export type DocumentSubmissionAction =
  | "upload"
  | "reupload"
  | "delete"
  | "return"
  | "approveWithFile"
  | "approveExisting"
  | "confirm";

const CLOSED_ALLOWED_ACTIONS = new Set<DocumentSubmissionAction>([
  "approveExisting",
  "confirm",
]);

export function isDocumentSubmissionActionAllowed(
  action: DocumentSubmissionAction,
  submissionsOpen = DOCUMENT_SUBMISSIONS_OPEN
): boolean {
  return submissionsOpen || CLOSED_ALLOWED_ACTIONS.has(action);
}
```

- [x] **Step 4: Run the focused test to verify it passes**

Run: `npm test -- src/lib/document-submissions.test.ts`

Expected: PASS with 3 tests.

- [x] **Step 5: Commit the policy**

```bash
git add -- src/lib/document-submissions.ts src/lib/document-submissions.test.ts
git commit -m "feat: adicionar politica temporaria de envios"
```

### Task 2: Aplicar a trava ao dashboard

**Files:**
- Modify: `src/components/dashboard/TemasView.tsx`

**Interfaces:**
- Consumes: `DOCUMENT_SUBMISSIONS_OPEN`
- Consumes: `DOCUMENT_SUBMISSIONS_CLOSED_MESSAGE`
- Consumes: `DocumentSubmissionAction`
- Consumes: `isDocumentSubmissionActionAllowed(action, submissionsOpen?): boolean`

- [x] **Step 1: Import the policy and derive action permissions**

Adicionar os imports da politica. Manter as regras atuais de papel e autoria,
mas combinar cada mutacao com a acao correspondente:

```ts
const canUpload = roleCanUpload && isDocumentSubmissionActionAllowed("upload");

const canDelete = (doc: TopicoDocumento) => {
  if (!isDocumentSubmissionActionAllowed("delete")) return false;
  if (user?.role === "Admin") return true;
  if (doc.status === "Aprovado") return false;
  return doc.uploadedByUserId === user?.userId;
};
```

Aplicar o mesmo principio a reenvio, devolucao e aprovacao com arquivo.

- [x] **Step 2: Guard every blocked handler**

Criar um helper local que informa o fechamento e evita a chamada HTTP:

```ts
function guardDocumentAction(action: DocumentSubmissionAction): boolean {
  if (isDocumentSubmissionActionAllowed(action)) return true;
  toast.info(DOCUMENT_SUBMISSIONS_CLOSED_MESSAGE);
  return false;
}
```

Usar o helper no inicio de `uploadFile`, `handleReuploadChange`,
`handleApproveWithFile`, `handleReturn` e `handleDelete`. Limpar o input de
arquivo quando um evento bloqueado ja tiver sido disparado.

- [x] **Step 3: Remove mutation controls while closed**

- Renderizar os inputs ocultos de reenvio e aprovacao com arquivo apenas quando
  suas acoes estiverem permitidas.
- Manter o botao e input de novo upload condicionados a `canUpload`.
- Manter drag-and-drop inerte quando `canUpload` for falso.
- Renderizar `Devolver`, `Reenviar` e `Excluir` apenas quando suas permissoes
  combinadas forem verdadeiras.
- Renderizar a opcao "Subir arquivo corrigido em PDF" somente quando
  `approveWithFile` for permitida.
- Quando fechado, exibir "Revisado" apenas para documentos PDF, pois somente
  esses podem seguir pela aprovacao do arquivo existente.
- Manter "Confirmar versao final" sem alteracao.

- [x] **Step 4: Add the closed-state notice**

Na cabecalho de "Documentos Anexados", renderizar quando fechado:

```tsx
<div className="mb-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
  <AlertCircle size={13} className="shrink-0" />
  <span className="text-[11px] font-medium">Envios e alteracoes de documentos encerrados.</span>
</div>
```

- [x] **Step 5: Run all frontend tests**

Run: `npm test`

Expected: PASS for all test files with zero failures.

- [x] **Step 6: Run the production build**

Run: `npm run build`

Expected: exit code 0. Existing unrelated lint warnings may remain, but no new
TypeScript or ESLint errors are allowed.

- [ ] **Step 7: Verify the admin workflow manually**

Blocked locally: the in-app browser reached `/login` and no authenticated
dashboard session was available. No credentials or production data were
modified to bypass authentication.

Run the frontend and inspect `/dashboard` with an authenticated profile:

- the closed-state notice is visible;
- upload, drag-and-drop, return, reupload, delete and replacement upload are absent;
- existing PDF approval remains available;
- final confirmation remains available;
- document links and history remain available;
- browser console has no new errors.

- [x] **Step 8: Commit the dashboard integration**

```bash
git add -- src/components/dashboard/TemasView.tsx
git commit -m "fix: fechar alteracoes de documentos no dashboard"
```

### Task 3: Final verification and PR readiness

**Files:**
- Modify: `docs/superpowers/plans/2026-08-28-fechamento-temporario-envios.md`

**Interfaces:**
- Consumes: the policy and dashboard integration from Tasks 1 and 2.
- Produces: a verified branch ready to push and open against `gcp-deploy`.

- [x] **Step 1: Mark completed plan items**

Atualizar cada checkbox executado de `[ ]` para `[x]` sem alterar os requisitos.

- [x] **Step 2: Verify the final diff**

Run: `git diff origin/gcp-deploy...HEAD --check`

Expected: no whitespace errors.

Run: `git diff origin/gcp-deploy...HEAD --stat`

Expected: only the spec, plan, policy, policy tests and `TemasView.tsx`.

- [x] **Step 3: Commit plan completion**

```bash
git add -- docs/superpowers/plans/2026-08-28-fechamento-temporario-envios.md
git commit -m "docs: registrar execucao do hotfix de envios"
```

- [ ] **Step 4: Re-run the final verification suite**

Run: `npm test`

Expected: all tests pass with zero failures.

Run: `npm run build`

Expected: exit code 0 with no new errors.
