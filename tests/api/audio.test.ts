import { describe, expect, it } from "vitest";
import { detectAudioContainer } from "../../apps/api/src/lib/audio";

describe("audio container validation", () => {
  it("accepts matching WebM EBML bytes", () => {
    expect(detectAudioContainer(new Uint8Array([0x1a, 0x45, 0xdf, 0xa3]))).toBe("audio/webm");
  });

  it("accepts matching MP4 ftyp bytes", () => {
    expect(detectAudioContainer(new Uint8Array([0, 0, 0, 0, 0x66, 0x74, 0x79, 0x70]))).toBe("audio/mp4");
  });

  it("rejects spoofed or unknown bytes", () => {
    expect(detectAudioContainer(new Uint8Array([0x1a, 0x45, 0xdf, 0xa2]))).toBeNull();
  });
});
