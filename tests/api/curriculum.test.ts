import { describe, expect, it } from "vitest";
import { mapCurriculumRows, mapProgressRows } from "../../apps/api/src/services/curriculum";

describe("curriculum service", () => {
  it("groups lessons, phrases and vocabulary into an ordered learning path", () => {
    const result = mapCurriculumRows([
      {
        module_id: "module_daily", module_title: "Daily Conversation", module_level_min: "beginner", module_level_max: "intermediate",
        module_description: "Nói chuyện mỗi ngày.", module_icon: "☀️", module_order: 1,
        lesson_id: "lesson_greetings", lesson_title: "Greetings", lesson_description: "Chào hỏi.", lesson_order: 1, required_phrase_count: 3,
        phrase_id: "phrase_1", english: "How are you?", vietnamese_hint: "Bạn khỏe không?", phonetic_hint: "/haʊ/", audio_tip: null, focus_grammar: "be", phrase_order: 1,
        vocabulary_id: "vocab_1", word: "greet", ipa: "/ɡriːt/", meaning: "chào", example: "I greet my teacher.",
      },
      {
        module_id: "module_daily", module_title: "Daily Conversation", module_level_min: "beginner", module_level_max: "intermediate",
        module_description: "Nói chuyện mỗi ngày.", module_icon: "☀️", module_order: 1,
        lesson_id: "lesson_greetings", lesson_title: "Greetings", lesson_description: "Chào hỏi.", lesson_order: 1, required_phrase_count: 3,
        phrase_id: "phrase_2", english: "Nice to meet you.", vietnamese_hint: "Rất vui được gặp bạn.", phonetic_hint: null, audio_tip: "Nối âm.", focus_grammar: null, phrase_order: 2,
        vocabulary_id: "vocab_2", word: "nice", ipa: "/naɪs/", meaning: "vui, tốt", example: "It is nice to meet you.",
      },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].lessons[0].phrases.map((phrase) => phrase.id)).toEqual(["phrase_1", "phrase_2"]);
    expect(result[0].lessons[0].vocabulary[0]).toEqual({
      id: "vocab_1", word: "greet", ipa: "/ɡriːt/", meaning: "chào", example: "I greet my teacher.",
    });
  });

  it("calculates lesson progress without turning missing data into completed work", () => {
    const result = mapProgressRows([
      { module_id: "module_daily", module_title: "Daily", module_order: 1, lesson_id: "lesson_1", lesson_title: "First", lesson_order: 1, phrase_count: 5, practiced_phrases: 2, mastered_phrases: 1, practice_count: 4 },
      { module_id: "module_daily", module_title: "Daily", module_order: 1, lesson_id: "lesson_2", lesson_title: "Second", lesson_order: 2, phrase_count: 5, practiced_phrases: 0, mastered_phrases: 0, practice_count: 0 },
    ]);

    expect(result[0].lessons[0]).toMatchObject({ practicedPhrases: 2, masteredPhrases: 1, completionPercent: 40, unlocked: true });
    expect(result[0].lessons[1]).toMatchObject({ practicedPhrases: 0, masteredPhrases: 0, completionPercent: 0, unlocked: false });
  });
});
