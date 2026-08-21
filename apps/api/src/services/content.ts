import type { ApiEnv } from "../index";
import { ApiError } from "../lib/errors";

export interface ContentRow {
  topic_id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  target_persona: string;
  default_level: string;
  phrase_id: string | null;
  english: string | null;
  vietnamese_hint: string | null;
  phonetic_hint: string | null;
  audio_tip: string | null;
  focus_grammar: string | null;
  phrase_order: number | null;
}

export interface LearningPhrase {
  id: string;
  english: string;
  vietnameseHint: string;
  phoneticHint?: string;
  audioTip?: string;
  focusGrammar?: string;
}

export interface LearningTopic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  targetPersona: string;
  defaultLevel: string;
  phrases: LearningPhrase[];
}

export function mapContentRows(rows: ContentRow[]): LearningTopic[] {
  const topics = new Map<string, LearningTopic>();

  for (const row of rows) {
    const topic = topics.get(row.topic_id) ?? {
      id: row.topic_id,
      title: row.title,
      category: row.category,
      description: row.description,
      icon: row.icon,
      targetPersona: row.target_persona,
      defaultLevel: row.default_level,
      phrases: [],
    };

    if (row.phrase_id && row.english && row.vietnamese_hint) {
      topic.phrases.push({
        id: row.phrase_id,
        english: row.english,
        vietnameseHint: row.vietnamese_hint,
        ...(row.phonetic_hint ? { phoneticHint: row.phonetic_hint } : {}),
        ...(row.audio_tip ? { audioTip: row.audio_tip } : {}),
        ...(row.focus_grammar ? { focusGrammar: row.focus_grammar } : {}),
      });
    }

    topics.set(row.topic_id, topic);
  }

  return [...topics.values()];
}

export async function listLearningTopics(db: ApiEnv["Bindings"]["DB"], level?: string): Promise<LearningTopic[]> {
  if (level && !["beginner", "intermediate", "advanced"].includes(level)) {
    throw new ApiError("CONTENT_LEVEL_INVALID", "Trình độ nội dung chưa hợp lệ.", false, "PERSISTENCE");
  }

  const query = `
    SELECT t.id AS topic_id, t.title, t.category, t.description, t.icon,
      t.target_persona, t.default_level, p.id AS phrase_id, p.english,
      p.vietnamese_hint, p.phonetic_hint, p.audio_tip, p.focus_grammar,
      p.phrase_order
    FROM content_topics t
    LEFT JOIN content_phrases p ON p.topic_id = t.id
    WHERE (? IS NULL OR t.default_level = ?)
    ORDER BY t.default_level ASC, t.id ASC, p.phrase_order ASC
  `;
  const result = await db.prepare(query).bind(level ?? null, level ?? null).all<ContentRow>();
  return mapContentRows(result.results);
}
