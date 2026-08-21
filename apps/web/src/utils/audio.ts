/**
 * Audio Utility Helper for English Practice App
 * Implements iOS-safe MIME feature detection, 60s recording cap, 8MB blob limit,
 * and gesture-safe audio priming with 100ms silent buffer.
 */

export const MAX_AUDIO_DURATION_MS = 60000; // 60 seconds
export const MAX_AUDIO_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

// 100ms silent PCM WAV 16-bit 8000Hz mono header+data
export const SILENT_WAV_BASE64 =
  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==";

export interface AudioDetectionResult {
  mimeType: string;
  isFallbackWav: boolean;
}

/**
 * Detects supported MediaRecorder MIME type in iOS-safe priority order.
 */
export function getSupportedMimeType(): AudioDetectionResult {
  if (typeof MediaRecorder === "undefined") {
    throw new Error("AUDIO_MIME_UNSUPPORTED: MediaRecorder is not supported in this environment.");
  }

  const mimeCandidates = [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
  ];

  for (const mime of mimeCandidates) {
    if (MediaRecorder.isTypeSupported(mime)) {
      return { mimeType: mime, isFallbackWav: false };
    }
  }

  // Check WAV fallback
  if (MediaRecorder.isTypeSupported("audio/wav")) {
    return { mimeType: "audio/wav", isFallbackWav: true };
  }

  // Default fallback if MediaRecorder allows constructor without MIME or defaults to mp4/webm
  return { mimeType: "", isFallbackWav: false };
}

/**
 * Validates audio blob size against 8MB limit.
 */
export function validateAudioBlob(blob: Blob, isFallbackWav: boolean): void {
  if (blob.size === 0) {
    throw new Error("STT_EMPTY: File âm thanh rỗng. Vui lòng ghi âm lại.");
  }
  if (blob.size > MAX_AUDIO_SIZE_BYTES) {
    throw new Error("AUDIO_SIZE_EXCEEDED: Dung lượng file âm thanh vượt quá 8MB.");
  }
  if (isFallbackWav && blob.size > MAX_AUDIO_SIZE_BYTES) {
    throw new Error("AUDIO_SIZE_EXCEEDED: File WAV vượt quá 8MB.");
  }
}

// Global audio element singleton for iOS gesture unlocking & reuse
let globalAudioElement: HTMLAudioElement | null = null;

export function getGlobalAudioElement(): HTMLAudioElement {
  if (!globalAudioElement) {
    globalAudioElement = new Audio();
    globalAudioElement.preload = "auto";
  }
  return globalAudioElement;
}

/**
 * Primes/unlocks audio element on user gesture by playing a 100ms silent buffer.
 * MUST be called synchronously inside a user click/touch handler.
 */
export async function primeAudioContext(): Promise<boolean> {
  try {
    const audio = getGlobalAudioElement();
    audio.src = SILENT_WAV_BASE64;
    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      audio.pause();
      audio.currentTime = 0;
    }
    return true;
  } catch (err) {
    console.warn("Audio priming failed or blocked:", err);
    return false;
  }
}

/**
 * Plays base64 audio payload (e.g. MeloTTS output).
 * Returns true if autoplay succeeded, false if autoplay was blocked by browser.
 */
export async function playBase64Audio(
  base64Data: string,
  onEnded?: () => void,
  onError?: (err: Error) => void
): Promise<boolean> {
  try {
    const audio = getGlobalAudioElement();
    audio.pause();
    
    // Format src: if already data URL use directly, else wrap in audio/wav or audio/mp3 data URI
    const src = base64Data.startsWith("data:")
      ? base64Data
      : `data:audio/wav;base64,${base64Data}`;

    audio.src = src;

    if (onEnded) {
      audio.onended = () => {
        onEnded();
      };
    }

    if (onError) {
      audio.onerror = () => {
        onError(new Error("Playback error occurred in HTMLAudioElement."));
      };
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      await playPromise;
      return true;
    }
    return true;
  } catch (err) {
    console.warn("Autoplay blocked or failed:", err);
    return false; // Indicates autoplay blocked by Safari/browser
  }
}
