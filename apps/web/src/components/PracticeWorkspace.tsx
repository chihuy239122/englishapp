import React, { useState, useEffect, useRef } from "react";
import { Persona, Level, TurnData, CurriculumPhrase } from "../types";
import { apiClient, ApiError } from "../api/client";
import {
  transition,
  initialContext,
  MachineContext,
} from "../utils/stateMachine";
import {
  getSupportedMimeType,
  validateAudioBlob,
  MAX_AUDIO_DURATION_MS,
  playBase64Audio,
  primeAudioContext,
} from "../utils/audio";
import { TurnHistory } from "./TurnHistory";
import { TranscriptEditor } from "./TranscriptEditor";

interface PracticeWorkspaceProps {
  sessionId: string;
  persona: Persona;
  level: Level;
  userId: string;
  lessonTitle?: string;
  targetPhrase?: CurriculumPhrase;
}

export const PracticeWorkspace: React.FC<PracticeWorkspaceProps> = ({
  sessionId,
  persona,
  level,
  userId,
  lessonTitle,
  targetPhrase,
}) => {
  const [machineCtx, setMachineCtx] = useState<MachineContext>(initialContext);
  const [turns, setTurns] = useState<TurnData[]>([]);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  // Audio recording refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const countdownIntervalRef = useRef<number | null>(null);
  const activeMimeRef = useRef<{ mimeType: string; isFallbackWav: boolean }>({
    mimeType: "",
    isFallbackWav: false,
  });

  // Fetch past turns when session starts
  useEffect(() => {
    let isMounted = true;
    apiClient
      .getSessionTurns(sessionId)
      .then((existingTurns) => {
        if (isMounted) {
          setTurns(
            existingTurns.map((t) => ({
              turnId: t.turnId,
              transcript: t.transcript,
              aiReply: t.aiReply,
              corrections: t.corrections || [],
              audioBase64: t.audioBase64,
              audioAvailable: t.audioAvailable,
            }))
          );
        }
      })
      .catch((err) => {
        console.warn("Failed to load existing turns:", err);
      });
    return () => {
      isMounted = false;
    };
  }, [sessionId]);

  // Clean up recording timers on unmount
  useEffect(() => {
    return () => {
      clearRecordingTimers();
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state !== "inactive"
      ) {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

  const clearRecordingTimers = () => {
    if (recordTimerRef.current !== null) {
      window.clearTimeout(recordTimerRef.current);
      recordTimerRef.current = null;
    }
    if (countdownIntervalRef.current !== null) {
      window.clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  const dispatchEvent = (evt: Parameters<typeof transition>[1]) => {
    setMachineCtx((prev) => transition(prev, evt));
  };

  // Start recording flow
  const handleStartRecording = async () => {
    try {
      // Prime audio context synchronously in user click
      await primeAudioContext();

      const detection = getSupportedMimeType();
      activeMimeRef.current = detection;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const options = detection.mimeType ? { mimeType: detection.mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        clearRecordingTimers();
        // Stop stream tracks
        stream.getTracks().forEach((track) => track.stop());

        // Process recorded audio if state is UPLOADING_STT
        const blob = new Blob(audioChunksRef.current, {
          type: detection.mimeType || "audio/webm",
        });

        try {
          validateAudioBlob(blob, detection.isFallbackWav);
          const response = await apiClient.transcribeAudio(sessionId, blob);

          if (!response.transcript || response.transcript.trim().length === 0) {
            dispatchEvent({
              type: "STT_EMPTY",
              message: "Không nghe rõ giọng nói. Vui lòng tự nhập tối thiểu 2 ký tự hoặc ghi âm lại.",
              turnToken: response.turnToken,
            });
          } else {
            dispatchEvent({
              type: "STT_SUCCESS",
              transcript: response.transcript,
              turnToken: response.turnToken,
            });
          }
        } catch (err: any) {
          if (err instanceof ApiError && err.code === "STT_EMPTY" && typeof err.payload?.turnToken === "string") {
            dispatchEvent({
              type: "STT_EMPTY",
              message: err.message,
              turnToken: err.payload.turnToken,
            });
            return;
          }
          const msg = err instanceof ApiError ? err.message : (err.message || "Lỗi xử lý file âm thanh.");
          dispatchEvent({ type: "STT_FAILURE", error: msg });
        }
      };

      mediaRecorder.start(200);
      setRecordingSeconds(0);
      dispatchEvent({ type: "START_RECORDING" });

      // Countdown interval & 60-second cap timer
      countdownIntervalRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      recordTimerRef.current = window.setTimeout(() => {
        handleStopRecording();
      }, MAX_AUDIO_DURATION_MS);
    } catch (err: any) {
      console.error("Microphone access error:", err);
      dispatchEvent({
        type: "STT_FAILURE",
        error: "Không thể truy cập microphone. Vui lòng kiểm tra quyền thiết bị.",
      });
    }
  };

  // Stop recording manually or by timer
  const handleStopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      dispatchEvent({ type: "STOP_RECORDING" });
      mediaRecorderRef.current.stop();
    }
  };

  // Cancel recording flow
  const handleCancelRecording = () => {
    clearRecordingTimers();
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state !== "inactive"
    ) {
      mediaRecorderRef.current.onstop = null; // Ignore blob processing
      mediaRecorderRef.current.stop();
    }
    dispatchEvent({ type: "CANCEL" });
  };

  // Submit transcript to complete turn
  const handleSubmitTranscript = async (finalTranscript: string) => {
    if (!machineCtx.turnToken) {
      dispatchEvent({ type: "TURN_FAILURE", error: "Thiếu turnToken. Vui lòng ghi âm lại." });
      return;
    }

    dispatchEvent({ type: "SUBMIT_TRANSCRIPT" });

    const clientTurnId = crypto.randomUUID();

    try {
      const response = await apiClient.completeTurn(sessionId, {
        transcript: finalTranscript,
        turnToken: machineCtx.turnToken,
        clientTurnId,
      });

      const newTurn: TurnData = {
        turnId: response.turnId,
        transcript: response.transcript,
        aiReply: response.aiReply,
        corrections: response.corrections || [],
        audioBase64: response.audioBase64,
        audioAvailable: response.audioAvailable,
      };

      setTurns((prev) => [...prev, newTurn]);

      if (response.audioAvailable && response.audioBase64) {
        dispatchEvent({
          type: "TURN_SUCCESS",
          aiReply: response.aiReply,
          audioBase64: response.audioBase64,
          audioAvailable: true,
        });

        // Play MeloTTS response
        const playedSuccessfully = await playBase64Audio(
          response.audioBase64,
          () => dispatchEvent({ type: "AUDIO_ENDED" }),
          (err) => console.warn("Audio playback warning:", err)
        );

        if (!playedSuccessfully) {
          // Autoplay blocked by browser/Safari
          dispatchEvent({ type: "AUTOPLAY_BLOCKED" });
        }
      } else {
        dispatchEvent({
          type: "TURN_SUCCESS",
          aiReply: response.aiReply,
          audioAvailable: false,
        });
      }
    } catch (err: any) {
      const msg = err instanceof ApiError ? err.message : (err.message || "Lỗi sinh phản hồi AI.");
      dispatchEvent({ type: "TURN_FAILURE", error: msg });
    }
  };

  return (
    <main className="practice-workspace" id="main-content">
      {(lessonTitle || targetPhrase) && (
        <section className="target-phrase-card" aria-labelledby="target-phrase-title">
          <div className="target-phrase-meta"><span className="eyebrow">Đang luyện</span>{lessonTitle && <span>{lessonTitle}</span>}</div>
          {targetPhrase && <>
            <h2 id="target-phrase-title">{targetPhrase.english}</h2>
            <p className="target-phrase-translation">{targetPhrase.vietnameseHint}</p>
            {targetPhrase.phoneticHint && <p className="target-phrase-phonetic">{targetPhrase.phoneticHint}</p>}
          </>}
          <p className="target-phrase-tip">Nói câu mục tiêu bằng lời của bạn. Sau khi ghi âm, bạn có thể sửa transcript trước khi gửi.</p>
        </section>
      )}
      {/* Live Status Banner */}
      <div className="status-banner" role="status" aria-live="polite">
        {machineCtx.state === "IDLE" && (
          <span>Bấm nút Micro bên dưới để bắt đầu nói (tối đa 60s).</span>
        )}
        {machineCtx.state === "RECORDING" && (
          <span className="status-recording">
            🔴 Đang ghi âm... ({recordingSeconds}s / 60s)
          </span>
        )}
        {machineCtx.state === "UPLOADING_STT" && (
          <span>⌛ Đang tải âm thanh và chuyển thành văn bản (STT)...</span>
        )}
        {machineCtx.state === "GENERATING_RESPONSE" && (
          <span>🤖 Đang tạo phản hồi AI và giọng nói...</span>
        )}
        {machineCtx.state === "PLAYBACK" && (
          <span>🔊 Đang phát câu trả lời của AI...</span>
        )}
        {machineCtx.state === "COMPLETE" && (
          <span>✅ Hoàn tất lượt nói! Tiếp tục lượt mới khi sẵn sàng.</span>
        )}
        {machineCtx.state === "ERROR" && (
          <span className="status-error">⚠️ Lỗi: {machineCtx.errorMessage}</span>
        )}
      </div>

      {/* Autoplay Blocked Notice */}
      {machineCtx.autoplayBlocked && (
        <div className="autoplay-notice" role="alert">
          <span>Trình duyệt (Safari) đã chặn tự động phát âm thanh. Vui lòng bấm nút <strong>Nghe lại</strong> trong câu trả lời bên dưới.</span>
        </div>
      )}

      {/* Workspace Body: Turn History */}
      <section className="history-section">
        <TurnHistory turns={turns} />
      </section>

      {/* Editing Transcript View */}
      {machineCtx.state === "EDITING_TRANSCRIPT" && (
        <section className="editor-section">
          <TranscriptEditor
            initialTranscript={machineCtx.transcript}
            isSttEmpty={machineCtx.isSttEmpty}
            sttWarning={machineCtx.sttWarning}
            onSubmit={handleSubmitTranscript}
            onRecordAgain={() => dispatchEvent({ type: "RECORD_AGAIN" })}
            onCancel={() => dispatchEvent({ type: "CANCEL" })}
            isSubmitting={false}
          />
        </section>
      )}

      {/* Error View Controls */}
      {machineCtx.state === "ERROR" && (
        <div className="error-controls">
          {machineCtx.turnToken ? (
            <button
              type="button"
              className="action-btn primary-btn"
              onClick={() => dispatchEvent({ type: "RETRY_EDIT" })}
            >
              Sửa & Gửi lại lượt này
            </button>
          ) : null}
          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={() => dispatchEvent({ type: "RESET" })}
          >
            Quay lại ban đầu
          </button>
        </div>
      )}

      {/* Primary Action Dock */}
      {(machineCtx.state === "IDLE" ||
        machineCtx.state === "COMPLETE" ||
        machineCtx.state === "RECORDING") && (
        <div className="action-dock">
          {machineCtx.state === "RECORDING" ? (
            <div className="recording-controls">
              <button
                type="button"
                className="mic-btn stop-mic-btn"
                onClick={handleStopRecording}
                aria-label="Dừng ghi âm và gửi"
              >
                ⏹️ Dừng & Gửi
              </button>
              <button
                type="button"
                className="cancel-btn"
                onClick={handleCancelRecording}
                aria-label="Hủy lượt ghi âm"
              >
                Hủy
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="mic-btn start-mic-btn"
              onClick={handleStartRecording}
              aria-label="Bắt đầu ghi âm câu nói"
            >
              🎙️ Chạm để Nói
            </button>
          )}
        </div>
      )}
    </main>
  );
};
