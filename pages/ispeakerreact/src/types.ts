export type Persona = "conversation_partner" | "grammar_tutor" | "pronunciation_coach" | "fluency_coach";
export type Level = "beginner" | "intermediate" | "advanced";

export interface SamplePhrase {
  id: string;
  english: string;
  vietnameseHint: string;
  phoneticHint?: string;
  audioTip?: string;
  focusGrammar?: string;
}

export interface Topic {
  id: string;
  title: string;
  category: string;
  description: string;
  icon: string;
  targetPersona: Persona;
  defaultLevel: Level;
  phrases: SamplePhrase[];
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
}

export interface LearningContext {
  moduleId?: string;
  lessonId?: string;
  phraseId?: string;
}

export type ErrorStage = "AUDIO_UPLOAD" | "STT" | "LLM_GEN" | "TTS_GEN" | "PERSISTENCE";

export interface ApiErrorEnvelope {
  error: {
    code: string;
    message: string;
    retryable: boolean;
    stage: ErrorStage;
  };
}

export interface ActiveSessionState {
  sessionId: string | null;
  persona: Persona;
  level: Level;
  topicId: string | null;
  startedAt: number | null;
}
