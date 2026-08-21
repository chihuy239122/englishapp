import { UIState } from "../types";

export type UIEvent =
  | { type: "START_RECORDING" }
  | { type: "STOP_RECORDING" }
  | { type: "CANCEL" }
  | { type: "STT_SUCCESS"; transcript: string; turnToken: string }
  | { type: "STT_EMPTY"; message: string; turnToken: string }
  | { type: "STT_FAILURE"; error: string }
  | { type: "RECORD_AGAIN" }
  | { type: "SUBMIT_TRANSCRIPT" }
  | { type: "TURN_SUCCESS"; aiReply: string; audioBase64?: string; audioAvailable: boolean }
  | { type: "TURN_FAILURE"; error: string }
  | { type: "AUDIO_ENDED" }
  | { type: "AUTOPLAY_BLOCKED" }
  | { type: "RETRY_EDIT" }
  | { type: "RESET" };

export interface MachineContext {
  state: UIState;
  transcript: string;
  turnToken: string | null;
  errorMessage: string | null;
  isSttEmpty: boolean;
  sttWarning: string | null;
  autoplayBlocked: boolean;
}

export const initialContext: MachineContext = {
  state: "IDLE",
  transcript: "",
  turnToken: null,
  errorMessage: null,
  isSttEmpty: false,
  sttWarning: null,
  autoplayBlocked: false,
};

export function transition(ctx: MachineContext, event: UIEvent): MachineContext {
  switch (ctx.state) {
    case "IDLE":
      if (event.type === "START_RECORDING") {
        return {
          ...ctx,
          state: "RECORDING",
          errorMessage: null,
          isSttEmpty: false,
          sttWarning: null,
          autoplayBlocked: false,
        };
      }
      break;

    case "RECORDING":
      if (event.type === "STOP_RECORDING") {
        return { ...ctx, state: "UPLOADING_STT", errorMessage: null };
      }
      if (event.type === "CANCEL") {
        return { ...initialContext, state: "IDLE" };
      }
      break;

    case "UPLOADING_STT":
      if (event.type === "STT_SUCCESS") {
        return {
          ...ctx,
          state: "EDITING_TRANSCRIPT",
          transcript: event.transcript,
          turnToken: event.turnToken,
          isSttEmpty: false,
          sttWarning: null,
          errorMessage: null,
        };
      }
      if (event.type === "STT_EMPTY") {
        return {
          ...ctx,
          state: "EDITING_TRANSCRIPT",
          transcript: "",
          turnToken: event.turnToken,
          isSttEmpty: true,
          sttWarning: event.message || "Không ghi nhận được giọng nói. Vui lòng tự nhập tối thiểu 2 ký tự hoặc ghi âm lại.",
          errorMessage: null,
        };
      }
      if (event.type === "STT_FAILURE") {
        return {
          ...ctx,
          state: "ERROR",
          errorMessage: event.error,
        };
      }
      if (event.type === "CANCEL") {
        return { ...initialContext, state: "IDLE" };
      }
      break;

    case "EDITING_TRANSCRIPT":
      if (event.type === "SUBMIT_TRANSCRIPT") {
        return {
          ...ctx,
          state: "GENERATING_RESPONSE",
          errorMessage: null,
        };
      }
      if (event.type === "RECORD_AGAIN") {
        return {
          ...ctx,
          state: "RECORDING",
          transcript: "",
          turnToken: null,
          isSttEmpty: false,
          sttWarning: null,
          errorMessage: null,
        };
      }
      if (event.type === "CANCEL") {
        return { ...initialContext, state: "IDLE" };
      }
      break;

    case "GENERATING_RESPONSE":
      if (event.type === "TURN_SUCCESS") {
        if (event.audioAvailable && event.audioBase64) {
          return {
            ...ctx,
            state: "PLAYBACK",
            errorMessage: null,
            autoplayBlocked: false,
          };
        }
        return {
          ...ctx,
          state: "COMPLETE",
          errorMessage: null,
          autoplayBlocked: false,
        };
      }
      if (event.type === "TURN_FAILURE") {
        return {
          ...ctx,
          state: "ERROR",
          errorMessage: event.error,
        };
      }
      break;

    case "PLAYBACK":
      if (event.type === "AUDIO_ENDED") {
        return {
          ...ctx,
          state: "COMPLETE",
        };
      }
      if (event.type === "AUTOPLAY_BLOCKED") {
        return {
          ...ctx,
          state: "COMPLETE",
          autoplayBlocked: true,
        };
      }
      break;

    case "COMPLETE":
      if (event.type === "START_RECORDING") {
        return {
          ...initialContext,
          state: "RECORDING",
        };
      }
      if (event.type === "RESET") {
        return { ...initialContext, state: "IDLE" };
      }
      break;

    case "ERROR":
      if (event.type === "RETRY_EDIT") {
        if (ctx.turnToken) {
          return {
            ...ctx,
            state: "EDITING_TRANSCRIPT",
            errorMessage: null,
          };
        }
        return { ...initialContext, state: "IDLE" };
      }
      if (event.type === "RESET" || event.type === "CANCEL") {
        return { ...initialContext, state: "IDLE" };
      }
      break;
  }

  return ctx;
}
