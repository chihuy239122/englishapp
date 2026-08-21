import type { ApiEnv } from "../index";

export interface LevelRow {
  level_id: string;
  code: string;
  level_title: string;
  level_description: string;
  level_order: number;
  unit_id: string;
  unit_title: string;
  unit_description: string;
  unit_icon: string;
  target_persona: string;
  unit_order: number;
  vocabulary_id: string | null;
  word: string | null;
  ipa: string | null;
  meaning_vi: string | null;
  example_en: string | null;
  example_vi: string | null;
  word_order: number | null;
  sentence_id: string | null;
  sentence_english: string | null;
  sentence_vietnamese_hint: string | null;
  audio_tip: string | null;
  focus_grammar: string | null;
  sentence_order: number | null;
}

export interface LearningLevel {
  id: string;
  code: string;
  title: string;
  description: string;
  levelOrder: number;
  units: LearningUnit[];
}

export interface LearningUnit {
  id: string;
  title: string;
  description: string;
  icon: string;
  targetPersona: string;
  unitOrder: number;
  vocabulary: LearningWord[];
  sentences: LearningSentence[];
}

export interface LearningWord {
  id: string;
  word: string;
  ipa?: string;
  meaningVi: string;
  exampleEn: string;
  exampleVi: string;
  wordOrder: number;
}

export interface LearningSentence {
  id: string;
  english: string;
  vietnameseHint: string;
  audioTip?: string;
  focusGrammar?: string;
  sentenceOrder: number;
}

export function mapLevelRows(rows: LevelRow[]): LearningLevel[] {
  const levels = new Map<string, LearningLevel>();
  const units = new Map<string, LearningUnit>();
  for (const row of rows) {
    const level = levels.get(row.level_id) ?? { id: row.level_id, code: row.code, title: row.level_title, description: row.level_description, levelOrder: Number(row.level_order), units: [] };
    levels.set(row.level_id, level);
    const unit = units.get(row.unit_id) ?? { id: row.unit_id, title: row.unit_title, description: row.unit_description, icon: row.unit_icon, targetPersona: row.target_persona, unitOrder: Number(row.unit_order), vocabulary: [], sentences: [] };
    if (!level.units.includes(unit)) level.units.push(unit);
    units.set(row.unit_id, unit);
    if (row.vocabulary_id && row.word && row.meaning_vi && row.example_en && row.example_vi && !unit.vocabulary.some((item) => item.id === row.vocabulary_id)) {
      unit.vocabulary.push({ id: row.vocabulary_id, word: row.word, meaningVi: row.meaning_vi, exampleEn: row.example_en, exampleVi: row.example_vi, wordOrder: Number(row.word_order || unit.vocabulary.length + 1), ...(row.ipa ? { ipa: row.ipa } : {}) });
    }
    if (row.sentence_id && row.sentence_english && row.sentence_vietnamese_hint && !unit.sentences.some((item) => item.id === row.sentence_id)) {
      unit.sentences.push({ id: row.sentence_id, english: row.sentence_english, vietnameseHint: row.sentence_vietnamese_hint, sentenceOrder: Number(row.sentence_order || unit.sentences.length + 1), ...(row.audio_tip ? { audioTip: row.audio_tip } : {}), ...(row.focus_grammar ? { focusGrammar: row.focus_grammar } : {}) });
    }
  }
  return [...levels.values()].sort((a, b) => a.levelOrder - b.levelOrder).map((level) => ({
    ...level,
    units: level.units.sort((a, b) => a.unitOrder - b.unitOrder).map((unit) => ({ ...unit, vocabulary: unit.vocabulary.sort((a, b) => a.wordOrder - b.wordOrder), sentences: unit.sentences.sort((a, b) => a.sentenceOrder - b.sentenceOrder) })),
  }));
}

export async function getLearningLevels(db: ApiEnv["Bindings"]["DB"]): Promise<LearningLevel[]> {
  const query = `
    SELECT l.id AS level_id, l.code, l.title AS level_title, l.description AS level_description,
      l.level_order, u.id AS unit_id, u.title AS unit_title, u.description AS unit_description,
      u.icon AS unit_icon, u.target_persona, u.unit_order, v.id AS vocabulary_id,
      v.word, v.ipa, v.meaning_vi, v.example_en, v.example_vi, v.word_order,
      s.id AS sentence_id, s.english AS sentence_english,
      s.vietnamese_hint AS sentence_vietnamese_hint, s.audio_tip, s.focus_grammar,
      s.sentence_order
    FROM content_levels l
    JOIN content_units u ON u.level_id = l.id
    LEFT JOIN content_level_vocabulary v ON v.unit_id = u.id
    LEFT JOIN content_unit_sentences s ON s.unit_id = u.id
    ORDER BY l.level_order, u.unit_order, v.word_order, s.sentence_order
  `;
  const result = await db.prepare(query).all<LevelRow>();
  return mapLevelRows(result.results);
}
