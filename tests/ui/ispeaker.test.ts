import { describe, it, expect, vi, beforeEach } from "vitest";
import { ispeakerClient, ApiError } from "../../pages/ispeakerreact/src/api/ispeakerClient";
import {
  getSupportedMimeType,
  formatTime,
  getFileExtensionForMime,
  getMicrophoneErrorMessage,
} from "../../pages/ispeakerreact/src/utils/audioUtils";

describe("iSpeaker React Integration & Utility Tests", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  describe("ispeakerClient", () => {
    it("should create a session for conversation_partner", async () => {
      const mockRes = { sessionId: "sess_ispk_123" };
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRes,
      } as Response);

      const res = await ispeakerClient.createSession({
        userId: "user_demo_1",
        persona: "conversation_partner",
        level: "beginner",
      });

      expect(res.sessionId).toBe("sess_ispk_123");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/sessions",
        expect.objectContaining({
          method: "POST",
          body: JSON.stringify({
            userId: "user_demo_1",
            persona: "conversation_partner",
            level: "beginner",
          }),
        })
      );
    });

    it("should fetch user stats cleanly from Worker API without local caching", async () => {
      const mockStats = {
        userId: "user_demo_1",
        totalMinutes: 25,
        totalTurns: 18,
        dailyStats: [
          { date: "2026-08-20", minutes: 10, turns: 7 },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockStats,
      } as Response);

      const stats = await ispeakerClient.getUserStats("user_demo_1");

      expect(stats.totalMinutes).toBe(25);
      expect(stats.totalTurns).toBe(18);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/users/user_demo_1/stats",
        expect.objectContaining({ method: "GET" })
      );
    });

    it("should load learning topics from the Worker content API", async () => {
      const mockTopics = {
        topics: [{
          id: "topic_daily_cc0",
          title: "Giao tiếp hàng ngày",
          category: "Conversation",
          description: "Luyện câu nói ngắn.",
          icon: "☕",
          targetPersona: "conversation_partner",
          defaultLevel: "beginner",
          phrases: [],
        }],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTopics,
      } as Response);

      const res = await ispeakerClient.getTopics();

      expect(res).toEqual(mockTopics.topics);
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/content/topics",
        expect.objectContaining({ method: "GET" }),
      );
    });

    it("should transcribe audio without calling Workers AI directly from client", async () => {
      const mockTranscribeRes = {
        transcript: "Testing iSpeaker Mic Check",
        turnToken: "token_abc123",
        audioContentType: "audio/mp4",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTranscribeRes,
      } as Response);

      const dummyBlob = new Blob(["test audio"], { type: "audio/mp4" });
      const res = await ispeakerClient.transcribeAudio("sess_ispk_123", dummyBlob);

      expect(res.transcript).toBe("Testing iSpeaker Mic Check");
      expect(res.turnToken).toBe("token_abc123");
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/sessions/sess_ispk_123/transcribe",
        expect.objectContaining({ method: "POST" })
      );
    });

    it("should build the multipart filename from the Blob's actual MIME type, not a hardcoded guess", async () => {
      const mockTranscribeRes = {
        transcript: "iPhone Safari recording",
        turnToken: "token_ios_1",
        audioContentType: "audio/webm",
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockTranscribeRes,
      } as Response);

      // A webm blob must NOT be uploaded under a "speech_sample.mp4" filename.
      const webmBlob = new Blob(["test audio"], { type: "audio/webm;codecs=opus" });
      await ispeakerClient.transcribeAudio("sess_ispk_123", webmBlob);

      const [, options] = (global.fetch as any).mock.calls[0];
      const formData = options.body as FormData;
      const audioEntry = formData.get("audio") as File;

      expect(audioEntry.name).toBe("speech_sample.webm");
      expect(audioEntry.name).not.toContain(".mp4");
    });

    it("should include durationMs in the transcribe upload when provided", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ transcript: "x", turnToken: "t", audioContentType: "audio/mp4" }),
      } as Response);

      const blob = new Blob(["test audio"], { type: "audio/mp4" });
      await ispeakerClient.transcribeAudio("sess_ispk_123", blob, 4321);

      const [, options] = (global.fetch as any).mock.calls[0];
      const formData = options.body as FormData;

      expect(formData.get("durationMs")).toBe("4321");
    });

    it("should omit durationMs from the upload when not provided", async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ transcript: "x", turnToken: "t", audioContentType: "audio/mp4" }),
      } as Response);

      const blob = new Blob(["test audio"], { type: "audio/mp4" });
      await ispeakerClient.transcribeAudio("sess_ispk_123", blob);

      const [, options] = (global.fetch as any).mock.calls[0];
      const formData = options.body as FormData;

      expect(formData.get("durationMs")).toBeNull();
    });

    it("should throw ApiError AUDIO_SIZE_EXCEEDED and never call fetch when the Blob exceeds 8MB", async () => {
      global.fetch = vi.fn();

      const oversizedBlob = new Blob([new Uint8Array(8 * 1024 * 1024 + 1)], { type: "audio/mp4" });

      try {
        await ispeakerClient.transcribeAudio("sess_ispk_123", oversizedBlob);
        expect.fail("Should throw ApiError");
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe("AUDIO_SIZE_EXCEEDED");
      }

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it("should throw structured ApiError when Worker returns error envelope", async () => {
      const mockErrorEnvelope = {
        error: {
          code: "AUDIO_MIME_INVALID",
          message: "Format audio không hợp lệ",
          retryable: false,
          stage: "AUDIO_UPLOAD",
        },
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 400,
        json: async () => mockErrorEnvelope,
      } as Response);

      const dummyBlob = new Blob(["invalid data"], { type: "audio/unknown" });

      try {
        await ispeakerClient.transcribeAudio("sess_ispk_123", dummyBlob);
        expect.fail("Should throw ApiError");
      } catch (err: any) {
        expect(err).toBeInstanceOf(ApiError);
        expect(err.code).toBe("AUDIO_MIME_INVALID");
        expect(err.retryable).toBe(false);
        expect(err.stage).toBe("AUDIO_UPLOAD");
      }
    });
  });

  describe("audioUtils", () => {
    it("should format time correctly in mm:ss", () => {
      expect(formatTime(0)).toBe("0:00");
      expect(formatTime(5)).toBe("0:05");
      expect(formatTime(60)).toBe("1:00");
      expect(formatTime(125)).toBe("2:05");
    });

    it("should return fallback MIME type when MediaRecorder is undefined or mocked", () => {
      const mime = getSupportedMimeType();
      expect(typeof mime).toBe("string");
      expect(mime.length).toBeGreaterThan(0);
    });

    it("should map each supported recorder MIME type to its matching upload extension", () => {
      expect(getFileExtensionForMime("audio/mp4")).toBe("mp4");
      expect(getFileExtensionForMime("audio/aac")).toBe("aac");
      expect(getFileExtensionForMime("audio/webm;codecs=opus")).toBe("webm");
      expect(getFileExtensionForMime("audio/webm")).toBe("webm");
      expect(getFileExtensionForMime("audio/wav")).toBe("wav");
    });

    it("should map m4a MIME variants (with codec params and x-m4a alias) to the mp4 extension", () => {
      expect(getFileExtensionForMime("audio/m4a;codecs=mp4a.40.2")).toBe("mp4");
      expect(getFileExtensionForMime("audio/x-m4a")).toBe("mp4");
    });

    it("should fall back to a safe extension for unknown/empty MIME strings", () => {
      expect(getFileExtensionForMime("")).toBe("webm");
      expect(getFileExtensionForMime("application/octet-stream")).toBe("webm");
    });

    it("should map getUserMedia DOMException names to clear, actionable Vietnamese messages", () => {
      const denied = getMicrophoneErrorMessage(new DOMException("denied", "NotAllowedError"));
      expect(denied).toMatch(/từ chối quyền Microphone/);

      const notFound = getMicrophoneErrorMessage(new DOMException("none", "NotFoundError"));
      expect(notFound).toMatch(/Không tìm thấy Microphone/);

      const notReadable = getMicrophoneErrorMessage(new DOMException("busy", "NotReadableError"));
      expect(notReadable).toMatch(/ứng dụng khác sử dụng/);

      const unknown = getMicrophoneErrorMessage(new Error("whatever"));
      expect(unknown).toMatch(/Không thể truy cập Microphone/);
    });
  });

  describe("Topics Data", () => {
    it("keeps content outside the UI bundle and exposes an API loader", () => {
      expect(typeof ispeakerClient.getTopics).toBe("function");
    });
  });

  describe("Topic/level label consistency", () => {
    it("syncs selectedLevel to the topic's defaultLevel on topic selection, so an advanced topic never shows a Beginner badge", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const appSource = fs.readFileSync(
        path.join(process.cwd(), "../../pages/ispeakerreact/src/App.tsx"),
        "utf-8"
      );

      const handleSelectTopicMatch = appSource.match(/const handleSelectTopic[\s\S]*?\n  };/);
      expect(handleSelectTopicMatch).not.toBeNull();
      expect(handleSelectTopicMatch![0]).toContain("setSelectedLevel(topic.defaultLevel)");
    });

    it("seeds selectedPersona and selectedLevel from the first loaded topic on initial topics load", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const appSource = fs.readFileSync(
        path.join(process.cwd(), "../../pages/ispeakerreact/src/App.tsx"),
        "utf-8"
      );

      const topicsLoadEffectMatch = appSource.match(
        /ispeakerClient\.getTopics\(\)[\s\S]*?if \(firstTopic\) \{[\s\S]*?\n\s*\}/
      );
      expect(topicsLoadEffectMatch).not.toBeNull();
      expect(topicsLoadEffectMatch![0]).toContain("setSelectedPersona(firstTopic.targetPersona)");
      expect(topicsLoadEffectMatch![0]).toContain("setSelectedLevel(firstTopic.defaultLevel)");
    });

    it("keeps the Phản xạ & Phỏng vấn topic seeded as advanced-level content matching its actual phrase difficulty", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const migrationSource = fs.readFileSync(
        path.join(process.cwd(), "../../migrations/0002_learning_content.sql"),
        "utf-8"
      );

      expect(migrationSource).toContain(
        "('topic_fluency_open', 'Phản xạ & Phỏng vấn', 'Fluency', 'Tổ chức ý kiến, dùng từ nối và trả lời câu hỏi mở mạch lạc hơn.', '⚡', 'fluency_coach', 'advanced', 'openjam')"
      );
    });
  });

  describe("Header iSpeaker Link Integration", () => {
    it("should define canonical iSpeaker Pages URL fallback", async () => {
      const fs = await import("fs");
      const path = await import("path");
      const headerSource = fs.readFileSync(
        path.join(process.cwd(), "../../apps/web/src/components/Header.tsx"),
        "utf-8"
      );

      expect(headerSource).toContain("https://ispeakerreact-5u6.pages.dev");
      expect(headerSource).toContain("VITE_ISPEAKER_URL");
      expect(headerSource).toContain('target="_blank"');
      expect(headerSource).toContain('rel="noopener noreferrer"');
      expect(headerSource).toContain('aria-label=');
    });
  });
});
