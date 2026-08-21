import React from "react";
import { Topic, Persona, Level } from "../types";

interface MainAppBridgeProps {
  selectedTopic: Topic | null;
  selectedPersona: Persona;
  selectedLevel: Level;
  activeSessionId: string | null;
  onLaunchSession: () => void;
  isLoadingSession: boolean;
}

export const MainAppBridge: React.FC<MainAppBridgeProps> = ({
  selectedTopic,
  selectedPersona,
  selectedLevel,
  activeSessionId,
  onLaunchSession,
  isLoadingSession,
}) => {
  const getPersonaLabel = (p: Persona) => {
    switch (p) {
      case "conversation_partner": return "Giao tiếp Tự do (Conversation Partner)";
      case "grammar_tutor": return "Gia sư Ngữ pháp (Grammar Tutor)";
      case "pronunciation_coach": return "Coach Phát âm (Pronunciation Coach)";
      case "fluency_coach": return "Phản xạ Phỏng vấn (Fluency Coach)";
    }
  };

  const getLevelLabel = (l: Level) => {
    switch (l) {
      case "beginner": return "Cơ bản (Beginner)";
      case "intermediate": return "Trung cấp (Intermediate)";
      case "advanced": return "Nâng cao (Advanced)";
    }
  };

  return (
    <section className="main-app-bridge-section" aria-labelledby="bridge-heading">
      <div className="section-header">
        <h2 id="bridge-heading" className="section-title">
          🚀 Kết Nối & Khởi Động Phòng Luyện Tập Tiếng Anh
        </h2>
        <p className="section-desc">
          Ứng dụng 2 lớp Cloudflare Architecture: Lớp 1 (Pages frontend `ispeakerreact`) liên kết liền mạch với Lớp 2 (Main Practice Room & Hono Worker API).
        </p>
      </div>

      <div className="bridge-card">
        <div className="summary-grid">
          <div className="summary-item">
            <span className="summary-label">Chủ đề đã chọn:</span>
            <span className="summary-value highlight">
              {selectedTopic ? selectedTopic.title : "Tự do chọn chủ đề"}
            </span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Persona AI chỉ định:</span>
            <span className="summary-value">{getPersonaLabel(selectedPersona)}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Trình độ luyện tập:</span>
            <span className="summary-value">{getLevelLabel(selectedLevel)}</span>
          </div>

          <div className="summary-item">
            <span className="summary-label">Mã Session D1:</span>
            <span className="summary-value code-pill">
              {activeSessionId ? activeSessionId : "Chưa khởi tạo"}
            </span>
          </div>
        </div>

        <div className="architecture-note">
          <h4>ℹ️ Ràng buộc kỹ thuật Cloudflare:</h4>
          <ul>
            <li>✅ Mọi cuộc gọi AI (Whisper STT, Llama-3.3, MeloTTS) đều được điều hướng qua Hono Worker API.</li>
            <li>✅ Không gọi trực tiếp Workers AI từ client Pages.</li>
            <li>✅ Dữ liệu Session & Lượt thoại lưu tập trung trên Cloudflare D1 / R2, không trùng lặp state.</li>
            <li>✅ Hỗ trợ quay lại ứng dụng chính bất cứ lúc nào mà không làm gián đoạn bài học.</li>
          </ul>
        </div>

        <div className="bridge-actions">
          {!activeSessionId ? (
            <button
              type="button"
              className="launch-btn primary"
              onClick={onLaunchSession}
              disabled={isLoadingSession}
              aria-label="Khởi tạo bài học mới trên Worker API"
            >
              {isLoadingSession ? "⏳ Đang tạo Session..." : "⚡ Khởi Tạo Bài Học Mới"}
            </button>
          ) : (
            <div className="session-ready-box">
              <p className="ready-text">
                🎉 Session <strong>{activeSessionId}</strong> đã sẵn sàng! Bạn có thể luyện tập ngay bên dưới hoặc mở ứng dụng chính.
              </p>
              <a
                href="/"
                className="launch-link-btn"
                title="Mở ứng dụng chính English AI Tutor"
              >
                🏠 Về App Luyện Tập Chính (apps/web) →
              </a>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
