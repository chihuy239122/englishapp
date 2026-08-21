import { Persona, Level, Topic, UserStatsResponse, ApiErrorEnvelope } from "../types";
import { getFileExtensionForMime } from "../utils/audioUtils";

export class ApiError extends Error {
  code: string;
  retryable: boolean;
  stage?: string;

  constructor(code: string, message: string, retryable: boolean, stage?: string) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.retryable = retryable;
    this.stage = stage;
  }
}

class ISpeakerClient {
  private baseUrl: string;

  constructor(baseUrl: string = (import.meta as ImportMeta & {
    env?: { VITE_API_BASE_URL?: string };
  }).env?.VITE_API_BASE_URL || "/api") {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options?.headers || {}),
      },
    });

    if (!res.ok) {
      let errorData: ApiErrorEnvelope | null = null;
      try {
        errorData = await res.json();
      } catch {
        // Fallback for non-JSON errors
      }

      if (errorData?.error) {
        throw new ApiError(
          errorData.error.code,
          errorData.error.message,
          errorData.error.retryable,
          errorData.error.stage
        );
      }

      throw new ApiError(
        "HTTP_ERROR",
        `Yêu cầu thất bại với mã lỗi HTTP ${res.status}`,
        res.status >= 500
      );
    }

    return res.json() as Promise<T>;
  }

  async createSession(params: { userId: string; persona: Persona; level: Level }): Promise<{ sessionId: string }> {
    return this.request<{ sessionId: string }>("/sessions", {
      method: "POST",
      body: JSON.stringify(params),
    });
  }

  async getUserStats(userId: string): Promise<UserStatsResponse> {
    return this.request<UserStatsResponse>(`/users/${encodeURIComponent(userId)}/stats`, {
      method: "GET",
    });
  }

  async getTopics(): Promise<Topic[]> {
    const response = await this.request<{ topics: Topic[] }>("/content/topics", {
      method: "GET",
    });
    return response.topics;
  }

  async getSessionTurns(sessionId: string): Promise<any[]> {
    return this.request<any[]>(`/sessions/${encodeURIComponent(sessionId)}/turns`, {
      method: "GET",
    });
  }

  async transcribeAudio(
    sessionId: string,
    audioBlob: Blob,
    durationMs?: number
  ): Promise<{ transcript: string; turnToken: string; audioContentType: string }> {
    // Filename must reflect the Blob's ACTUAL mime type (audioBlob.type), not a hardcoded
    // guess: iPhone Safari MediaRecorder commonly reports audio/mp4 or audio/aac, and a
    // mismatched ".mp4" filename over webm/aac bytes confuses downstream tooling/logs even
    // though the multipart Content-Type is still driven by the Blob's own type.
    const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
    if (audioBlob.size > MAX_AUDIO_BYTES) {
      throw new ApiError(
        "AUDIO_SIZE_EXCEEDED",
        `Tệp âm thanh quá lớn (${(audioBlob.size / (1024 * 1024)).toFixed(1)}MB), giới hạn 8MB.`,
        false,
        "AUDIO_UPLOAD"
      );
    }

    const mimeType = audioBlob.type || "audio/webm";
    const extension = getFileExtensionForMime(mimeType);
    const fileName = `speech_sample.${extension}`;

    const formData = new FormData();
    formData.append("audio", audioBlob, fileName);
    if (typeof durationMs === "number" && Number.isFinite(durationMs) && durationMs >= 0) {
      formData.append("durationMs", String(Math.round(durationMs)));
    }

    const res = await fetch(`${this.baseUrl}/sessions/${encodeURIComponent(sessionId)}/transcribe`, {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      let errorData: ApiErrorEnvelope | null = null;
      try {
        errorData = await res.json();
      } catch {}

      if (errorData?.error) {
        throw new ApiError(
          errorData.error.code,
          errorData.error.message,
          errorData.error.retryable,
          errorData.error.stage
        );
      }

      throw new ApiError(
        "STT_UPLOAD_FAILED",
        `Tải âm thanh thất bại (${res.status})`,
        true,
        "AUDIO_UPLOAD"
      );
    }

    return res.json();
  }
}

export const ispeakerClient = new ISpeakerClient();
