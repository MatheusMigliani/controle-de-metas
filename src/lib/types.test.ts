import { describe, expect, it } from "vitest";
import {
  getMetaStatusConfig,
  isCompletedMetaStatus,
} from "@/lib/types";

describe("meta status mapping", () => {
  it("maps the backend Concluido status to the concluded UI state", () => {
    expect(getMetaStatusConfig("Concluido").label).toBe("Concluída");
  });

  it("counts the backend Concluido status as completed progress", () => {
    expect(isCompletedMetaStatus("Concluido")).toBe(true);
  });
});
