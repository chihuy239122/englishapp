import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getSupportedMimeType,
  validateAudioBlob,
  MAX_AUDIO_SIZE_BYTES,
  SILENT_WAV_BASE64,
} from "../../apps/web/src/utils/audio";

describe("Audio Utilities", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should detect supported MIME types in order", () => {
    // Mock MediaRecorder.isTypeSupported
    const isTypeSupportedMock = vi.fn((mime: string) => {
      return mime === "audio/webm;codecs=opus";
    });

    global.MediaRecorder = {
      isTypeSupported: isTypeSupportedMock,
    } as any;

    const result = getSupportedMimeType();
    expect(result.mimeType).toBe("audio/webm;codecs=opus");
    expect(result.isFallbackWav).toBe(false);
  });

  it("should fallback to audio/wav if primary mimes are unsupported", () => {
    const isTypeSupportedMock = vi.fn((mime: string) => {
      return mime === "audio/wav";
    });

    global.MediaRecorder = {
      isTypeSupported: isTypeSupportedMock,
    } as any;

    const result = getSupportedMimeType();
    expect(result.mimeType).toBe("audio/wav");
    expect(result.isFallbackWav).toBe(true);
  });

  it("should throw STT_EMPTY if audio blob size is 0", () => {
    const emptyBlob = new Blob([], { type: "audio/mp4" });
    expect(() => validateAudioBlob(emptyBlob, false)).toThrow("STT_EMPTY");
  });

  it("should throw AUDIO_SIZE_EXCEEDED if audio blob size exceeds 8MB", () => {
    const hugeBlob = { size: MAX_AUDIO_SIZE_BYTES + 100 } as Blob;
    expect(() => validateAudioBlob(hugeBlob, false)).toThrow("AUDIO_SIZE_EXCEEDED");
  });

  it("should pass validation for valid blob", () => {
    const validBlob = new Blob(["test audio bytes"], { type: "audio/webm" });
    expect(() => validateAudioBlob(validBlob, false)).not.toThrow();
  });

  it("should contain silent WAV base64 buffer string", () => {
    expect(SILENT_WAV_BASE64).toContain("data:audio/wav;base64,");
  });
});
