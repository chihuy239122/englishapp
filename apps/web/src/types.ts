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
