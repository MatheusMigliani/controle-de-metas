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
