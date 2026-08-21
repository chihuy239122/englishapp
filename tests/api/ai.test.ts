import { describe, expect, it } from "vitest";
import { parseLlamaResponse } from "../../apps/api/src/ai/llama";

describe("Llama response parsing", () => {
  it("parses compact JSON and clamps corrections", () => {
    const result = parseLlamaResponse(JSON.stringify({
      reply: "Keep going.",
      corrections: [1, 2, 3, 4].map((n) => ({ error: `e${n}`, fix: `f${n}`, rule: `r${n}` })),
    }));

    expect(result).toEqual({
      reply: "Keep going.",
      corrections: [
        { error: "e1", fix: "f1", rule: "r1" },
        { error: "e2", fix: "f2", rule: "r2" },
        { error: "e3", fix: "f3", rule: "r3" },
      ],
    });
  });

  it("rejects malformed JSON", () => {
    expect(() => parseLlamaResponse("not json")).toThrow();
  });
});
