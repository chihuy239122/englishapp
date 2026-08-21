export function getFileExtensionForMime(mimeType: string): string {
  const base = (mimeType || "").split(";", 1)[0].trim().toLowerCase();
  switch (base) {
    case "audio/mp4":
    case "audio/m4a":
    case "audio/x-m4a":
      return "mp4";
    case "audio/aac":
      return "aac";
    case "audio/webm":
      return "webm";
    case "audio/wav":
    case "audio/x-wav":
      return "wav";
    default:
      // Unknown/empty MIME (e.g. Safari sometimes reports "" for MediaRecorder.mimeType).
      return "webm";
  }
}

export function getMicrophoneErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : (err as any)?.name;
  switch (name) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "Bạn đã từ chối quyền Microphone. Vào Cài đặt > Safari > Microphone (hoặc biểu tượng \"aA\" trên thanh địa chỉ) để cấp quyền rồi thử lại.";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "Không tìm thấy Microphone trên thiết bị này. Kiểm tra lại micro hoặc thử trên thiết bị khác.";
    case "NotReadableError":
    case "TrackStartError":
      return "Microphone đang được ứng dụng khác sử dụng hoặc gặp lỗi phần cứng. Đóng các app khác đang dùng micro rồi thử lại.";
    case "OverconstrainedError":
      return "Cấu hình Microphone yêu cầu không được thiết bị hỗ trợ. Thử lại với cấu hình mặc định.";
    case "SecurityError":
      return "Trình duyệt chặn truy cập Microphone vì trang không ở kết nối an toàn (HTTPS). Hãy mở trang qua HTTPS.";
    case "AbortError":
      return "Yêu cầu truy cập Microphone bị hủy. Vui lòng thử lại.";
    default:
      return "Không thể truy cập Microphone. Vui lòng cấp quyền micro cho trình duyệt trên iPhone / thiết bị của bạn.";
  }
}

export function getSupportedMimeType(): string {
  if (typeof window === "undefined" || !("MediaRecorder" in window)) {
    return "audio/webm";
  }

  const preferredTypes = [
    "audio/mp4",
    "audio/aac",
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/wav",
  ];

  for (const type of preferredTypes) {
    if (MediaRecorder.isTypeSupported(type)) {
      return type;
    }
  }

  return "audio/webm";
}

let globalAudioCtx: AudioContext | null = null;

export function unlockAudioContext(): void {
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;

    if (!globalAudioCtx) {
      globalAudioCtx = new AudioCtx();
    }

    if (globalAudioCtx.state === "suspended") {
      globalAudioCtx.resume();
    }

    // Play 100ms silent buffer
    const buffer = globalAudioCtx.createBuffer(1, 1, 22050);
    const source = globalAudioCtx.createBufferSource();
    source.buffer = buffer;
    source.connect(globalAudioCtx.destination);
    source.start(0);
  } catch (err) {
    console.warn("Could not unlock Web Audio Context:", err);
  }
}

export function speakSampleText(text: string, onEnd?: () => void): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) {
    alert("Trình duyệt không hỗ trợ phát giọng đọc mẫu.");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  utterance.rate = 0.9; // Slightly slower for clear learning

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  window.speechSynthesis.speak(utterance);
}

export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
}
