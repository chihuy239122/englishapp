export type Persona = "conversation_partner" | "grammar_tutor" | "pronunciation_coach" | "fluency_coach";
export type Level = "beginner" | "intermediate" | "advanced";

export interface Correction {
  error: string;
  fix: string;
  rule: string;
}

export interface TurnResponse {
  turnId: string;
  transcript: string;
  aiReply: string;
  corrections: Correction[];
  audioBase64: string;
  audioAvailable: boolean;
  phraseId?: string;
}

export interface TranscribeResponse {
  transcript: string;
  turnToken: string;
  audioContentType: string;
}

export interface CompleteTurnRequest {
  transcript: string;
  turnToken: string;
  clientTurnId: string;
}

export type ErrorStage = "AUDIO_UPLOAD" | "STT" | "LLM_GEN" | "TTS_GEN" | "PERSISTENCE";

export interface ApiErrorDetail {
  code: string;
  message: string;
  retryable: boolean;
  stage: ErrorStage;
}

export interface ApiErrorEnvelope {
  error: ApiErrorDetail;
}

export interface UserDailyStat {
  date: string;
  minutes: number;
  turns: number;
}

export interface UserStatsResponse {
  userId: string;
  totalMinutes: number;
  totalTurns: number;
  dailyStats: UserDailyStat[];
}

export interface SessionInfo {
  sessionId: string;
  userId: string;
  persona: Persona;
  level: Level;
  startedAt: number;
  moduleId?: string;
  lessonId?: string;
  phraseId?: string;
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

export interface CurriculumResponse {
  modules: CurriculumModule[];
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

export interface UserProgressResponse {
  userId: string;
  modules: ModuleProgress[];
}
