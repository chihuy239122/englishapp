import type { ErrorStage } from "../../../../packages/shared/types";

export class ApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean,
    public readonly stage: ErrorStage,
    public readonly extra: Record<string, unknown> = {},
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function errorResponse(error: unknown): Response {
  const apiError = error instanceof ApiError
    ? error
    : new ApiError("INTERNAL_ERROR", "Không thể xử lý yêu cầu lúc này.", true, "PERSISTENCE");
  return Response.json({ error: {
    code: apiError.code,
    message: apiError.message,
    retryable: apiError.retryable,
    stage: apiError.stage,
  }, ...apiError.extra }, { status: statusFor(apiError.code) });
}

function statusFor(code: string): number {
  if (["SESSION_INVALID", "TURN_TOKEN_EXPIRED", "TURN_TOKEN_USED", "TURN_CLIENT_ID_INVALID", "TRANSCRIPT_INVALID"].includes(code)) return 422;
  if (["AUDIO_MIME_INVALID", "AUDIO_SIZE_EXCEEDED", "DURATION_EXCEEDED", "AUDIO_EMPTY", "STT_EMPTY"].includes(code)) return 422;
  if (code === "DB_PERSIST_ERROR" || code === "INTERNAL_ERROR") return 500;
  return 503;
}
