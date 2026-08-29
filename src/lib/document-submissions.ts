export const DOCUMENT_SUBMISSIONS_OPEN = false;

export const DOCUMENT_SUBMISSIONS_CLOSED_MESSAGE =
  "Os envios e alterações de documentos estão encerrados.";

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
