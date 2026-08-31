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

  it("nega quando o usuário não tem role ou está pendente", () => {
    expect(canUploadDocuments(undefined, false)).toBe(false);
    expect(canUploadDocuments("Pending", false)).toBe(false);
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

  it("nega quando o usuário não tem role ou está pendente", () => {
    expect(canReviewDocuments(undefined, false)).toBe(false);
    expect(canReviewDocuments("Pending", false)).toBe(false);
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

  it("nega quando o usuário não tem role ou está pendente", () => {
    expect(canReuploadDocument("Devolvido", "user-1", "user-2", undefined, false)).toBe(false);
    expect(canReuploadDocument("Devolvido", "user-1", "user-2", "Pending", false)).toBe(false);
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

  it("nega quando o usuário não tem role ou está pendente", () => {
    expect(canDeleteDocument("PendenteAprovacao", "user-1", "user-2", undefined, false)).toBe(false);
    expect(canDeleteDocument("PendenteAprovacao", "user-1", "user-2", "Pending", false)).toBe(false);
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

  it("nega quando o usuário não tem role ou está pendente", () => {
    expect(canConfirmDocument("PendenteConfirmacaoAnalista", "user-1", "user-2", undefined, false)).toBe(false);
    expect(canConfirmDocument("PendenteConfirmacaoAnalista", "user-1", "user-2", "Pending", false)).toBe(false);
  });
});
