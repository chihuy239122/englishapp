import React, { useState, useRef, useEffect, useCallback } from "react";
import { getSupportedMimeType, unlockAudioContext, formatTime, getMicrophoneErrorMessage } from "../utils/audioUtils";
import { ispeakerClient } from "../api/ispeakerClient";

interface MicCheckProps {
  activeSessionId?: string | null;
}

export const MicCheck: React.FC<MicCheckProps> = ({ activeSessionId }) => {
  const [supportedType, setSupportedType] = useState<string>("");
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState<boolean>(false);
  const [testTranscript, setTestTranscript] = useState<string | null>(null);
  const [checkError, setCheckError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recordingStartedAtRef = useRef<number | null>(null);
  const [recordedDurationMs, setRecordedDurationMs] = useState<number>(0);

  useEffect(() => {
    setSupportedType(getSupportedMimeType());
  }, []);

  const stopStreamTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Hardening: if the user navigates away / this component unmounts while still
  // recording, make sure the interval timer, MediaRecorder, and mic stream are all
  // torn down. Leaving any of these running leaks the microphone indicator and the
  // timer callback on iPhone Safari.
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          // Recorder may already be stopping; ignore.
        }
      }
      stopStreamTracks();
    };
  }, [stopStreamTracks]);

  const startRecording = async () => {
    setCheckError(null);
    setTestTranscript(null);
    setRecordedBlob(null);
    setAudioUrl(null);
    setRecordingSeconds(0);
    audioChunksRef.current = [];

    unlockAudioContext();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mime = getSupportedMimeType();

      let recorder: MediaRecorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: mime });
      } catch {
        recorder = new MediaRecorder(stream);
      }

      mediaRecorderRef.current = recorder;
      recordingStartedAtRef.current = Date.now();

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        // Use the MediaRecorder's own reported mimeType for the Blob whenever available;
        // it reflects what iOS Safari actually recorded, which can differ from the
        // requested mime (e.g. requesting audio/mp4 but getting a slightly different
        // codec string back).
        const actualMime = recorder.mimeType || mime;
        const blob = new Blob(audioChunksRef.current, { type: actualMime });
        setRecordedBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);

        const startedAt = recordingStartedAtRef.current;
        setRecordedDurationMs(startedAt ? Date.now() - startedAt : 0);
        recordingStartedAtRef.current = null;

        stopStreamTracks();
      };

      recorder.start(250);
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        setRecordingSeconds((prev) => {
          if (prev >= 59) {
            stopRecording();
            return 60;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err: unknown) {
      console.error("Mic access failed:", err);
      setCheckError(getMicrophoneErrorMessage(err));
    }
  };

  const stopRecording = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    } else {
      // Recorder already inactive (e.g. stopped itself on error): still release the stream.
      stopStreamTracks();
    }
    setIsRecording(false);
  };

  const handleTestTranscribe = async () => {
    if (!recordedBlob) return;
    if (!activeSessionId) {
      setCheckError(
        "Chưa có Session hoạt động. Hãy khởi tạo Session ở bước chọn chủ đề hoặc chuyển sang tab Phòng Luyện Tập."
      );
      return;
    }

    setIsTranscribing(true);
    setCheckError(null);

    try {
      const res = await ispeakerClient.transcribeAudio(activeSessionId, recordedBlob, recordedDurationMs);
      setTestTranscript(res.transcript || "(Không nhận diện được giọng nói trong đoạn ghi âm)");
    } catch (err: any) {
      setCheckError(err.message || "Thử nghiệm STT qua Worker API thất bại.");
    } finally {
      setIsTranscribing(false);
    }
  };

  return (
    <section className="mic-check-section" aria-labelledby="mic-heading">
      <div className="section-header">
        <h2 id="mic-heading" className="section-title">
          🎙️ Kiểm Tra Thiết Bị & Microphone (iPhone Safari & Mobile Compatible)
        </h2>
        <p className="section-desc">
          Đảm bảo định dạng âm thanh `MediaRecorder` hoạt động chuẩn trên thiết bị trước khi bắt đầu bài học.
        </p>
      </div>

      <div className="mic-info-card">
        <div className="info-row">
          <span className="info-label">Định dạng Audio hỗ trợ:</span>
          <span className="info-value code-pill">{supportedType || "Đang kiểm tra..."}</span>
        </div>
        <div className="info-row">
          <span className="info-label">Giới hạn thời lượng:</span>
          <span className="info-value">Tối đa 60 giây / lượt ghi</span>
        </div>
        <div className="info-row">
          <span className="info-label">Trạng thái Session:</span>
          <span className="info-value">
            {activeSessionId ? `✅ Đã sẵn sàng (${activeSessionId})` : "⚠️ Chưa chọn Session"}
          </span>
        </div>
      </div>

      {checkError && (
        <div className="mic-error-toast" role="alert">
          <span>{checkError}</span>
        </div>
      )}

      <div className="mic-controls">
        {!isRecording ? (
          <button
            type="button"
            className="record-btn start"
            onClick={startRecording}
            aria-label="Bắt đầu ghi âm thử nghiệm micro"
          >
            🎙️ Bắt đầu Thử Micro
          </button>
        ) : (
          <button
            type="button"
            className="record-btn stop pulsing"
            onClick={stopRecording}
            aria-label="Dừng ghi âm micro"
          >
            ⏹ Dừng Ghi ({formatTime(recordingSeconds)})
          </button>
        )}
      </div>

      {audioUrl && (
        <div className="playback-panel">
          <h3 className="panel-title">🎧 Đoạn ghi âm thử nghiệm:</h3>
          <audio controls src={audioUrl} className="audio-preview" />

          {activeSessionId && (
            <div className="stt-test-action">
              <button
                type="button"
                className="stt-btn"
                onClick={handleTestTranscribe}
                disabled={isTranscribing}
              >
                {isTranscribing ? "⏳ Đang chuyển Whisper STT qua Worker..." : "🔍 Thử STT qua Worker API"}
              </button>
            </div>
          )}
        </div>
      )}

      {testTranscript && (
        <div className="stt-result-card" role="region" aria-live="polite">
          <h4>Văn bản nhận diện từ Whisper Worker API:</h4>
          <p className="transcript-text">"{testTranscript}"</p>
          <small className="notice">
            ✅ STT được xử lý an toàn qua Cloudflare Worker backend; client không gọi Workers AI trực tiếp.
          </small>
        </div>
      )}
    </section>
  );
};
