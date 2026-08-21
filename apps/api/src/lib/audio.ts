const MAX_AUDIO_BYTES = 8 * 1024 * 1024;
const MAX_AUDIO_DURATION_MS = 60_000;

export type SupportedAudioMime = "audio/webm" | "audio/mp4" | "audio/wav" | "audio/aac";

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.slice(start, start + length));
}

export function detectAudioContainer(bytes: Uint8Array): SupportedAudioMime | null {
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) return "audio/webm";
  if (bytes.length >= 8 && ascii(bytes, 4, 4) === "ftyp") return "audio/mp4";
  if (bytes.length >= 12 && ascii(bytes, 0, 4) === "RIFF" && ascii(bytes, 8, 4) === "WAVE") return "audio/wav";
  if (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xf6) === 0xf0) return "audio/aac";
  return null;
}

export function validateAudio(bytes: Uint8Array, declaredMime: string, durationMs?: number): SupportedAudioMime {
  if (bytes.byteLength === 0) throw new Error("AUDIO_EMPTY");
  if (bytes.byteLength > MAX_AUDIO_BYTES) throw new Error("AUDIO_SIZE_EXCEEDED");
  if (typeof durationMs === "number" && durationMs > MAX_AUDIO_DURATION_MS) throw new Error("DURATION_EXCEEDED");

  const declared = declaredMime.split(";", 1)[0] as SupportedAudioMime;
  if (!["audio/webm", "audio/mp4", "audio/wav", "audio/aac"].includes(declared)) throw new Error("AUDIO_MIME_INVALID");
  const detected = detectAudioContainer(bytes);
  if (!detected || detected !== declared) throw new Error("AUDIO_MIME_INVALID");
  return detected;
}

export { MAX_AUDIO_BYTES, MAX_AUDIO_DURATION_MS };
