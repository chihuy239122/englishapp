import { describe, expect, it, vi } from "vitest";
import { app } from "../../apps/api/src/index";

function createContentDb() {
  const rows = [
    {
      topic_id: "topic_daily_cc0",
      title: "Giao tiếp hàng ngày",
      category: "Conversation",
      description: "Luyện những câu nói ngắn trong sinh hoạt hằng ngày.",
      icon: "☕",
      target_persona: "conversation_partner",
      default_level: "beginner",
      phrase_id: "phrase_zoo",
      english: "There is a zebra, monkey, and flamingo at the zoo!",
      vietnamese_hint: "Có một con ngựa vằn, khỉ và hồng hạc ở sở thú!",
      phonetic_hint: null,
      audio_tip: "Nối nhẹ âm cuối giữa các danh từ trong danh sách.",
      focus_grammar: null,
      phrase_order: 1,
    },
  ];

  return {
    prepare: vi.fn(() => ({
      bind: vi.fn(() => ({
        all: vi.fn(async () => ({ results: rows })),
      })),
    })),
  } as unknown as D1Database;
}

describe("GET /api/content/topics", () => {
  it("returns D1-backed topics with nested phrases and provenance-safe fields", async () => {
    const response = await app.request(
      "http://localhost/api/content/topics",
      {},
      { DB: createContentDb() },
    );

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({
      topics: [
        {
          id: "topic_daily_cc0",
          title: "Giao tiếp hàng ngày",
          category: "Conversation",
          description: "Luyện những câu nói ngắn trong sinh hoạt hằng ngày.",
          icon: "☕",
          targetPersona: "conversation_partner",
          defaultLevel: "beginner",
          phrases: [
            {
              id: "phrase_zoo",
              english: "There is a zebra, monkey, and flamingo at the zoo!",
              vietnameseHint: "Có một con ngựa vằn, khỉ và hồng hạc ở sở thú!",
              audioTip: "Nối nhẹ âm cuối giữa các danh từ trong danh sách.",
            },
          ],
        },
      ],
    });
  });
});
