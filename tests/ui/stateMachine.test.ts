import { describe, it, expect } from "vitest";
import {
  transition,
  initialContext,
  MachineContext,
} from "../../apps/web/src/utils/stateMachine";

describe("UI State Machine", () => {
  it("should start in IDLE state", () => {
    expect(initialContext.state).toBe("IDLE");
  });

  it("should follow full happy path transition flow", () => {
    // 1. IDLE -> RECORDING
    let ctx = transition(initialContext, { type: "START_RECORDING" });
    expect(ctx.state).toBe("RECORDING");

    // 2. RECORDING -> UPLOADING_STT
    ctx = transition(ctx, { type: "STOP_RECORDING" });
    expect(ctx.state).toBe("UPLOADING_STT");

    // 3. UPLOADING_STT -> EDITING_TRANSCRIPT
    ctx = transition(ctx, {
      type: "STT_SUCCESS",
      transcript: "Hello world",
      turnToken: "token_123",
    });
    expect(ctx.state).toBe("EDITING_TRANSCRIPT");
    expect(ctx.transcript).toBe("Hello world");
    expect(ctx.turnToken).toBe("token_123");

    // 4. EDITING_TRANSCRIPT -> GENERATING_RESPONSE
    ctx = transition(ctx, { type: "SUBMIT_TRANSCRIPT" });
    expect(ctx.state).toBe("GENERATING_RESPONSE");

    // 5. GENERATING_RESPONSE -> PLAYBACK
    ctx = transition(ctx, {
      type: "TURN_SUCCESS",
      aiReply: "Hello! How can I help you?",
      audioBase64: "dGVzdGF1ZGlv",
      audioAvailable: true,
    });
    expect(ctx.state).toBe("PLAYBACK");

    // 6. PLAYBACK -> COMPLETE
    ctx = transition(ctx, { type: "AUDIO_ENDED" });
    expect(ctx.state).toBe("COMPLETE");
  });

  it("should handle STT_EMPTY and allow entering empty transcript state", () => {
    let ctx = transition(initialContext, { type: "START_RECORDING" });
    ctx = transition(ctx, { type: "STOP_RECORDING" });
    ctx = transition(ctx, {
      type: "STT_EMPTY",
      message: "Không nghe rõ giọng nói",
      turnToken: "token_empty_123",
    });

    expect(ctx.state).toBe("EDITING_TRANSCRIPT");
    expect(ctx.transcript).toBe("");
    expect(ctx.isSttEmpty).toBe(true);
    expect(ctx.turnToken).toBe("token_empty_123");
  });

  it("should handle RECORD_AGAIN branch and clear turnToken", () => {
    let ctx: MachineContext = {
      ...initialContext,
      state: "EDITING_TRANSCRIPT",
      transcript: "Test text",
      turnToken: "token_123",
    };

    ctx = transition(ctx, { type: "RECORD_AGAIN" });
    expect(ctx.state).toBe("RECORDING");
    expect(ctx.transcript).toBe("");
    expect(ctx.turnToken).toBeNull();
  });

  it("should handle CANCEL branch from RECORDING, UPLOADING_STT, EDITING_TRANSCRIPT", () => {
    let ctx1 = transition(initialContext, { type: "START_RECORDING" });
    ctx1 = transition(ctx1, { type: "CANCEL" });
    expect(ctx1.state).toBe("IDLE");

    let ctx2: MachineContext = {
      ...initialContext,
      state: "UPLOADING_STT",
    };
    ctx2 = transition(ctx2, { type: "CANCEL" });
    expect(ctx2.state).toBe("IDLE");

    let ctx3: MachineContext = {
      ...initialContext,
      state: "EDITING_TRANSCRIPT",
      transcript: "Test",
      turnToken: "token_123",
    };
    ctx3 = transition(ctx3, { type: "CANCEL" });
    expect(ctx3.state).toBe("IDLE");
    expect(ctx3.turnToken).toBeNull();
  });

  it("should handle AUTOPLAY_BLOCKED during PLAYBACK without losing state", () => {
    let ctx: MachineContext = {
      ...initialContext,
      state: "PLAYBACK",
    };

    ctx = transition(ctx, { type: "AUTOPLAY_BLOCKED" });
    expect(ctx.state).toBe("COMPLETE");
    expect(ctx.autoplayBlocked).toBe(true);
  });

  it("should handle ERROR state and RETRY_EDIT branch when turnToken exists", () => {
    let ctx: MachineContext = {
      ...initialContext,
      state: "GENERATING_RESPONSE",
      transcript: "Existing transcript",
      turnToken: "token_123",
    };

    ctx = transition(ctx, {
      type: "TURN_FAILURE",
      error: "LLM_TIMEOUT: Server timed out",
    });

    expect(ctx.state).toBe("ERROR");
    expect(ctx.errorMessage).toBe("LLM_TIMEOUT: Server timed out");

    // Retry edit
    ctx = transition(ctx, { type: "RETRY_EDIT" });
    expect(ctx.state).toBe("EDITING_TRANSCRIPT");
    expect(ctx.transcript).toBe("Existing transcript");
    expect(ctx.turnToken).toBe("token_123");
  });
});
