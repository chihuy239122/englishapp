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
  transcript?: string;
  turnToken?: string;
  audioContentType?: string;
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
  lessonTitle?: string;
  targetPhrase?: CurriculumPhrase;
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

export interface LevelsResponse {
  levels: LearningLevel[];
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
  dueReviewCount: number;
}

export type UIState =
  | "IDLE"
  | "RECORDING"
  | "UPLOADING_STT"
  | "EDITING_TRANSCRIPT"
  | "GENERATING_RESPONSE"
  | "PLAYBACK"
  | "COMPLETE"
  | "ERROR";

export interface PersonaOption {
  id: Persona;
  title: string;
  description: string;
  icon: string;
}

export interface LevelOption {
  id: Level;
  title: string;
  description: string;
}

export interface TurnData {
  turnId: string;
  transcript: string;
  aiReply: string;
  corrections: Correction[];
  audioBase64?: string;
  audioAvailable: boolean;
}
