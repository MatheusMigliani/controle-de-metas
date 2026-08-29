import { describe, expect, it } from "vitest";
import {
  DOCUMENT_SUBMISSIONS_OPEN,
  isDocumentSubmissionActionAllowed,
} from "@/lib/document-submissions";

describe("document submission policy", () => {
  it("blocks file mutations while submissions are closed", () => {
    expect(DOCUMENT_SUBMISSIONS_OPEN).toBe(false);

    for (const action of [
      "upload",
      "reupload",
      "delete",
      "return",
      "approveWithFile",
    ] as const) {
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
