import { describe, expect, it } from "vitest";
import { scorePhraseMatch } from "../../apps/api/src/services/matching";

describe("lightweight phrase matching", () => {
  it("accepts punctuation/case differences as an exact spoken match", () => {
    expect(scorePhraseMatch("How are you?", "how are you")).toBe(1);
  });

  it("gives partial credit for a mostly matching spoken phrase", () => {
    expect(scorePhraseMatch("I am working from home today.", "I am working from home")).toBeGreaterThanOrEqual(0.55);
  });

  it("rejects an unrelated transcript", () => {
    expect(scorePhraseMatch("Turn left at the corner.", "I like coffee in the morning.")).toBeLessThan(0.55);
  });
});
