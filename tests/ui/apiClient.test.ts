import { describe, it, expect, vi, beforeEach } from "vitest";
import { apiClient, ApiError } from "../../apps/web/src/api/client";

describe("API Client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should create session (Stage 1)", async () => {
    const mockResponse = { sessionId: "sess_abc123" };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const res = await apiClient.createSession({
      userId: "user_1",
      persona: "conversation_partner",
      level: "beginner",
      moduleId: "module_daily",
      lessonId: "lesson_greetings",
      phraseId: "phrase_1",
    });

    expect(res.sessionId).toBe("sess_abc123");
    expect(global.fetch).toHaveBeenCalledWith("/api/sessions", expect.objectContaining({
      method: "POST",
    }));
    expect(JSON.parse((global.fetch as any).mock.calls[0][1].body)).toMatchObject({
      moduleId: "module_daily",
      lessonId: "lesson_greetings",
      phraseId: "phrase_1",
    });
  });

  it("loads curriculum and learner progress", async () => {
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: async () => ({ modules: [] }) } as Response)
      .mockResolvedValueOnce({ ok: true, json: async () => ({ userId: "user_1", modules: [] }) } as Response);

    await expect(apiClient.getCurriculum()).resolves.toEqual({ modules: [] });
    await expect(apiClient.getUserProgress("user_1")).resolves.toEqual({ userId: "user_1", modules: [] });
    expect(global.fetch).toHaveBeenNthCalledWith(1, "/api/content/curriculum");
    expect(global.fetch).toHaveBeenNthCalledWith(2, "/api/users/user_1/progress");
  });

  it("should transcribe audio (Stage 2a)", async () => {
    const mockResponse = {
      transcript: "Hello AI",
      turnToken: "token_xyz",
      audioContentType: "audio/mp4",
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const dummyBlob = new Blob(["audio data"], { type: "audio/mp4" });
    const res = await apiClient.transcribeAudio("sess_abc123", dummyBlob);

    expect(res.transcript).toBe("Hello AI");
    expect(res.turnToken).toBe("token_xyz");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/sessions/sess_abc123/transcribe",
      expect.objectContaining({ method: "POST" })
    );
  });

  it("should complete turn (Stage 2b)", async () => {
    const mockTurnResponse = {
      turnId: "turn_999",
      transcript: "Hello AI",
      aiReply: "Hello student!",
      corrections: [],
      audioBase64: "base64audio...",
      audioAvailable: true,
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => mockTurnResponse,
    } as Response);

    const res = await apiClient.completeTurn("sess_abc123", {
      transcript: "Hello AI",
      turnToken: "token_xyz",
      clientTurnId: "client_turn_1",
    });

    expect(res.turnId).toBe("turn_999");
    expect(res.aiReply).toBe("Hello student!");
    expect(res.audioAvailable).toBe(true);
  });

  it("should parse ApiErrorEnvelope on HTTP error response", async () => {
    const mockErrorEnvelope = {
      error: {
        code: "STT_FAILURE",
        message: "Whisper audio processing error",
        retryable: true,
        stage: "STT",
      },
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => mockErrorEnvelope,
    } as Response);

    const dummyBlob = new Blob(["audio data"], { type: "audio/mp4" });

    try {
      await apiClient.transcribeAudio("sess_abc123", dummyBlob);
      expect.fail("Should have thrown ApiError");
    } catch (err: any) {
      expect(err).toBeInstanceOf(ApiError);
      expect(err.code).toBe("STT_FAILURE");
      expect(err.message).toBe("Whisper audio processing error");
      expect(err.retryable).toBe(true);
      expect(err.stage).toBe("STT");
    }
  });
});
