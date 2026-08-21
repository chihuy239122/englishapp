import type { ApiEnv } from "../index";

export interface CurriculumRow {
  module_id: string;
  module_title: string;
  module_level_min: string;
  module_level_max: string;
  module_description: string;
  module_icon: string;
  module_order: number;
  lesson_id: string;
  lesson_title: string;
  lesson_description: string;
  lesson_order: number;
  required_phrase_count: number;
  phrase_id: string | null;
  english: string | null;
  vietnamese_hint: string | null;
  phonetic_hint: string | null;
  audio_tip: string | null;
  focus_grammar: string | null;
  phrase_order: number | null;
  vocabulary_id: string | null;
  word: string | null;
  ipa: string | null;
  meaning: string | null;
  example: string | null;
}

export interface CurriculumVocabulary {
  id: string;
  word: string;
  ipa: string;
  meaning: string;
  example: string;
}

export interface CurriculumPhrase {
  id: string;
  english: string;
  vietnameseHint: string;
  phoneticHint?: string;
  audioTip?: string;
  focusGrammar?: string;
  phraseOrder: number;
}

export interface CurriculumLesson {
  id: string;
  moduleId: string;
  title: string;
  description: string;
  lessonOrder: number;
  requiredPhraseCount: number;
  phrases: CurriculumPhrase[];
  vocabulary: CurriculumVocabulary[];
}

export interface CurriculumModule {
  id: string;
  title: string;
  levelMin: string;
  levelMax: string;
  description: string;
  icon: string;
  moduleOrder: number;
  lessons: CurriculumLesson[];
}

export interface ProgressRow {
  module_id: string;
  module_title: string;
  module_order: number;
  lesson_id: string;
  lesson_title: string;
  lesson_order: number;
  phrase_count: number;
  practiced_phrases: number;
  mastered_phrases: number;
  practice_count: number;
}

export interface LessonProgress {
  lessonId: string;
  title: string;
  lessonOrder: number;
  totalPhrases: number;
  practicedPhrases: number;
  masteredPhrases: number;
  practiceCount: number;
  completionPercent: number;
  unlocked: boolean;
}

export interface ModuleProgress {
  moduleId: string;
  title: string;
  lessons: LessonProgress[];
  completionPercent: number;
}

export function mapCurriculumRows(rows: CurriculumRow[]): CurriculumModule[] {
  const modules = new Map<string, CurriculumModule>();
  const lessons = new Map<string, CurriculumLesson>();

  for (const row of rows) {
    const module = modules.get(row.module_id) ?? {
      id: row.module_id,
      title: row.module_title,
      levelMin: row.module_level_min,
      levelMax: row.module_level_max,
      description: row.module_description,
      icon: row.module_icon,
      moduleOrder: Number(row.module_order),
      lessons: [],
    };
    modules.set(row.module_id, module);

    const lesson = lessons.get(row.lesson_id) ?? {
      id: row.lesson_id,
      moduleId: row.module_id,
      title: row.lesson_title,
      description: row.lesson_description,
      lessonOrder: Number(row.lesson_order),
      requiredPhraseCount: Number(row.required_phrase_count),
      phrases: [],
      vocabulary: [],
    };
    if (!module.lessons.includes(lesson)) module.lessons.push(lesson);
    lessons.set(row.lesson_id, lesson);

    if (row.phrase_id && row.english && row.vietnamese_hint && !lesson.phrases.some((phrase) => phrase.id === row.phrase_id)) {
      lesson.phrases.push({
        id: row.phrase_id,
        english: row.english,
        vietnameseHint: row.vietnamese_hint,
        phraseOrder: Number(row.phrase_order || lesson.phrases.length + 1),
        ...(row.phonetic_hint ? { phoneticHint: row.phonetic_hint } : {}),
        ...(row.audio_tip ? { audioTip: row.audio_tip } : {}),
        ...(row.focus_grammar ? { focusGrammar: row.focus_grammar } : {}),
      });
    }
    if (row.vocabulary_id && row.word && row.ipa && row.meaning && row.example && !lesson.vocabulary.some((word) => word.id === row.vocabulary_id)) {
      lesson.vocabulary.push({ id: row.vocabulary_id, word: row.word, ipa: row.ipa, meaning: row.meaning, example: row.example });
    }
  }

  return [...modules.values()]
    .sort((a, b) => a.moduleOrder - b.moduleOrder)
    .map((module) => ({
      ...module,
      lessons: module.lessons
        .sort((a, b) => a.lessonOrder - b.lessonOrder)
        .map((lesson) => ({
          ...lesson,
          phrases: lesson.phrases.sort((a, b) => a.phraseOrder - b.phraseOrder),
          vocabulary: lesson.vocabulary.sort((a, b) => a.word.localeCompare(b.word)),
        })),
    }));
}

export function mapProgressRows(rows: ProgressRow[]): ModuleProgress[] {
  const modules = new Map<string, ModuleProgress>();
  let previousComplete = true;

  for (const row of rows) {
    const module = modules.get(row.module_id) ?? { moduleId: row.module_id, title: row.module_title, lessons: [], completionPercent: 0 };
    const totalPhrases = Number(row.phrase_count || 0);
    const practicedPhrases = Number(row.practiced_phrases || 0);
    const completionPercent = totalPhrases === 0 ? 0 : Math.round((practicedPhrases / totalPhrases) * 100);
    module.lessons.push({
      lessonId: row.lesson_id,
      title: row.lesson_title,
      lessonOrder: Number(row.lesson_order),
      totalPhrases,
      practicedPhrases,
      masteredPhrases: Number(row.mastered_phrases || 0),
      practiceCount: Number(row.practice_count || 0),
      completionPercent: Math.min(100, completionPercent),
      unlocked: previousComplete,
    });
    previousComplete = completionPercent >= 100;
    modules.set(row.module_id, module);
  }

  return [...modules.values()].map((module) => ({
    ...module,
    completionPercent: module.lessons.length === 0 ? 0 : Math.round(module.lessons.reduce((sum, lesson) => sum + lesson.completionPercent, 0) / module.lessons.length),
  }));
}

export async function getCurriculum(db: ApiEnv["Bindings"]["DB"]): Promise<CurriculumModule[]> {
  const query = `
    SELECT m.id AS module_id, m.title AS module_title, m.level_min AS module_level_min,
      m.level_max AS module_level_max, m.description AS module_description,
      m.icon AS module_icon, m.module_order, l.id AS lesson_id, l.title AS lesson_title,
      l.description AS lesson_description, l.lesson_order, l.required_phrase_count,
      p.id AS phrase_id, p.english, p.vietnamese_hint, p.phonetic_hint, p.audio_tip,
      p.focus_grammar, lp.phrase_order, v.id AS vocabulary_id, v.word, v.ipa,
      v.meaning, v.example
    FROM content_modules m
    JOIN content_lessons l ON l.module_id = m.id
    LEFT JOIN lesson_phrases lp ON lp.lesson_id = l.id
    LEFT JOIN content_phrases p ON p.id = lp.phrase_id
    LEFT JOIN content_vocabulary v ON v.lesson_id = l.id
    ORDER BY m.module_order, l.lesson_order, lp.phrase_order, v.id
  `;
  const result = await db.prepare(query).all<CurriculumRow>();
  return mapCurriculumRows(result.results);
}

export async function getUserProgress(db: ApiEnv["Bindings"]["DB"], userId: string): Promise<ModuleProgress[]> {
  const query = `
    SELECT m.id AS module_id, m.title AS module_title, m.module_order,
      l.id AS lesson_id, l.title AS lesson_title, l.lesson_order,
      COUNT(lp.phrase_id) AS phrase_count,
      COUNT(DISTINCT CASE WHEN up.matched_practices > 0 THEN lp.phrase_id END) AS practiced_phrases,
      COUNT(DISTINCT CASE WHEN up.mastered = 1 THEN lp.phrase_id END) AS mastered_phrases,
      COALESCE(SUM(up.times_practiced), 0) AS practice_count
    FROM content_modules m
    JOIN content_lessons l ON l.module_id = m.id
    LEFT JOIN lesson_phrases lp ON lp.lesson_id = l.id
    LEFT JOIN user_progress up ON up.phrase_id = lp.phrase_id AND up.user_id = ?
    GROUP BY m.id, m.title, m.module_order, l.id, l.title, l.lesson_order
    ORDER BY m.module_order, l.lesson_order
  `;
  const result = await db.prepare(query).bind(userId).all<ProgressRow>();
  return mapProgressRows(result.results);
}

export async function getDueReviewCount(db: ApiEnv["Bindings"]["DB"], userId: string, now: number): Promise<number> {
  const row = await db.prepare("SELECT COUNT(*) AS due_count FROM user_progress WHERE user_id = ? AND next_review_at IS NOT NULL AND next_review_at <= ?").bind(userId, now).first<{ due_count: number }>();
  return Number(row?.due_count || 0);
}
