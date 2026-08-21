import { describe, expect, it } from "vitest";
import { isLevel, isPersona, isUuid } from "../../apps/api/src/lib/validation";

describe("request validation", () => {
  it("accepts only supported persona and level values", () => {
    expect(isPersona("grammar_tutor")).toBe(true);
    expect(isPersona("admin")).toBe(false);
    expect(isLevel("advanced")).toBe(true);
    expect(isLevel("expert")).toBe(false);
  });

  it("validates UUID client ids", () => {
    expect(isUuid("550e8400-e29b-41d4-a716-446655440000")).toBe(true);
    expect(isUuid("turn-1")).toBe(false);
  });
});
