import React, { useState } from "react";
import { primeAudioContext } from "../utils/audio";

interface TranscriptEditorProps {
  initialTranscript: string;
  isSttEmpty: boolean;
  sttWarning: string | null;
  onSubmit: (transcript: string) => void;
  onRecordAgain: () => void;
  onCancel: () => void;
  isSubmitting: boolean;
}

export const TranscriptEditor: React.FC<TranscriptEditorProps> = ({
  initialTranscript,
  isSttEmpty,
  sttWarning,
  onSubmit,
  onRecordAgain,
  onCancel,
  isSubmitting,
}) => {
  const [transcript, setTranscript] = useState(initialTranscript);
  const isValid = transcript.trim().length >= 2;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    // Gesture-safe audio priming in exact user click handler
    await primeAudioContext();
    onSubmit(transcript.trim());
  };

  return (
    <div className="transcript-editor-card" role="region" aria-label="Sửa văn bản transcript">
      <div className="editor-header">
        <h3>Kiểm tra & Sửa transcript</h3>
        <p className="editor-hint">
          Bạn có thể chỉnh sửa văn bản trước khi gửi để AI phân tích và phản hồi chính xác nhất.
        </p>
      </div>

      {(isSttEmpty || sttWarning) && (
        <div className="warning-banner" role="status" aria-live="polite">
          <span className="warning-icon" aria-hidden="true">⚠️</span>
          <span>{sttWarning || "Không ghi nhận được giọng nói. Vui lòng tự nhập tối thiểu 2 ký tự hoặc bấm Ghi âm lại."}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="editor-form">
        <div className="form-group">
          <label htmlFor="transcript-input" className="sr-only">
            Nội dung câu nói của bạn
          </label>
          <textarea
            id="transcript-input"
            className="transcript-textarea"
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Nhập nội dung câu nói của bạn tại đây (tối thiểu 2 ký tự)..."
            rows={4}
            disabled={isSubmitting}
            autoFocus
          />
          <div className="char-count">
            {transcript.trim().length} / 2 ký tự tối thiểu
          </div>
        </div>

        <div className="editor-actions">
          <button
            type="submit"
            className="action-btn primary-btn submit-btn"
            disabled={!isValid || isSubmitting}
            aria-busy={isSubmitting}
          >
            {isSubmitting ? "Đang gửi AI..." : "Gửi transcript 🚀"}
          </button>

          <button
            type="button"
            className="action-btn secondary-btn"
            onClick={onRecordAgain}
            disabled={isSubmitting}
          >
            🎙️ Ghi âm lại
          </button>

          <button
            type="button"
            className="action-btn danger-btn"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ❌ Hủy lượt
          </button>
        </div>
      </form>
    </div>
  );
};
