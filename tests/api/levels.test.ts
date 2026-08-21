import { describe, expect, it } from "vitest";
import { mapLevelRows } from "../../apps/api/src/services/levels";

describe("CEFR level service", () => {
  it("deduplicates the vocabulary/sentence join and keeps level order", () => {
    const rows = [
      { level_id: "lvl_a1", code: "A1", level_title: "Starter", level_description: "Nền tảng", level_order: 1, unit_id: "unit_a1", unit_title: "Hello", unit_description: "Chào hỏi", unit_icon: "👋", target_persona: "conversation_partner", unit_order: 1, vocabulary_id: "word_1", word: "hello", ipa: "/həˈloʊ/", meaning_vi: "xin chào", example_en: "Hello!", example_vi: "Xin chào!", word_order: 1, sentence_id: "sentence_1", sentence_english: "Hello, my name is Mai.", sentence_vietnamese_hint: "Xin chào, tôi tên Mai.", audio_tip: null, focus_grammar: null, sentence_order: 1 },
      { level_id: "lvl_a1", code: "A1", level_title: "Starter", level_description: "Nền tảng", level_order: 1, unit_id: "unit_a1", unit_title: "Hello", unit_description: "Chào hỏi", unit_icon: "👋", target_persona: "conversation_partner", unit_order: 1, vocabulary_id: "word_1", word: "hello", ipa: "/həˈloʊ/", meaning_vi: "xin chào", example_en: "Hello!", example_vi: "Xin chào!", word_order: 1, sentence_id: "sentence_2", sentence_english: "Nice to meet you.", sentence_vietnamese_hint: "Rất vui được gặp bạn.", audio_tip: null, focus_grammar: null, sentence_order: 2 },
    ] as any;
    const result = mapLevelRows(rows);
    expect(result[0].code).toBe("A1");
    expect(result[0].units[0].vocabulary).toHaveLength(1);
    expect(result[0].units[0].sentences).toHaveLength(2);
  });
});
