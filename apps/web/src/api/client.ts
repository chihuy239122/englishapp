import {
  Persona,
  Level,
  TranscribeResponse,
  TurnResponse,
  CompleteTurnRequest,
  UserStatsResponse,
  CurriculumResponse,
  UserProgressResponse,
  LevelsResponse,
  ApiErrorEnvelope,
  ApiErrorDetail,
} from "../types";

export class ApiError extends Error {
  code: string;
  retryable: boolean;
  stage: string;
  payload: Record<string, unknown>;

  constructor(detail: ApiErrorDetail, payload: Record<string, unknown> = {}) {
    super(detail.message);
    this.name = "ApiError";
    this.code = detail.code;
    this.retryable = detail.retryable;
    this.stage = detail.stage;
    this.payload = payload;
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  let data: any;
  try {
    data = await res.json();
  } catch (err) {
    throw new ApiError({
      code: "HTTP_ERROR",
      message: `HTTP Error ${res.status}: ${res.statusText}`,
      retryable: res.status >= 500,
      stage: "PERSISTENCE",
    });
  }

  if (!res.ok || data.error) {
    const errorEnv = data as ApiErrorEnvelope;
    if (errorEnv.error) {
      throw new ApiError(errorEnv.error, data as Record<string, unknown>);
    }
    throw new ApiError({
      code: "UNKNOWN_ERROR",
      message: data.message || `Request failed with status ${res.status}`,
      retryable: res.status >= 500,
      stage: "PERSISTENCE",
    });
  }

  return data as T;
}

export interface CreateSessionParams {
  userId: string;
  persona: Persona;
  level: Level;
  moduleId?: string;
  lessonId?: string;
  phraseId?: string;
}

export interface CreateSessionResponse {
  sessionId: string;
  moduleId?: string | null;
  lessonId?: string | null;
  phraseId?: string | null;
}

/**
 * 2-Stage API Client implementation for Cloudflare English App backend
 */
export const apiClient = {
  /**
   * Stage 1: Create a new practice session
   */
  async createSession(params: CreateSessionParams): Promise<CreateSessionResponse> {
    const res = await fetch("/api/sessions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
    });
    return handleResponse<CreateSessionResponse>(res);
  },

  /**
   * Stage 2a: Transcribe recorded audio
   */
  async transcribeAudio(sessionId: string, audioBlob: Blob, filename = "speech.mp4"): Promise<TranscribeResponse> {
    const formData = new FormData();
    formData.append("audio", audioBlob, filename);

    const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/transcribe`, {
      method: "POST",
      body: formData,
    });
    return handleResponse<TranscribeResponse>(res);
  },

  /**
   * Stage 2b: Complete turn with finalized transcript & turnToken
   */
  async completeTurn(sessionId: string, request: CompleteTurnRequest): Promise<TurnResponse> {
    const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/turns`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    return handleResponse<TurnResponse>(res);
  },

  /**
   * Fetch session turn history
   */
  async getSessionTurns(sessionId: string): Promise<TurnResponse[]> {
    const res = await fetch(`/api/sessions/${encodeURIComponent(sessionId)}/turns`);
    return handleResponse<TurnResponse[]>(res);
  },

  /**
   * Fetch user aggregated practice stats
   */
  async getUserStats(userId: string): Promise<UserStatsResponse> {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/stats`);
    return handleResponse<UserStatsResponse>(res);
  },

  async getCurriculum(): Promise<CurriculumResponse> {
    const res = await fetch("/api/content/curriculum");
    return handleResponse<CurriculumResponse>(res);
  },

  async getLevels(): Promise<LevelsResponse> {
    const res = await fetch("/api/content/levels");
    return handleResponse<LevelsResponse>(res);
  },

  async getUserProgress(userId: string): Promise<UserProgressResponse> {
    const res = await fetch(`/api/users/${encodeURIComponent(userId)}/progress`);
    return handleResponse<UserProgressResponse>(res);
  },
};
