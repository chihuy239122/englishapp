import React from "react";
import { Persona, Level } from "../types";

interface HeaderProps {
  activeTab: "topics" | "miccheck" | "stats" | "bridge";
  setActiveTab: (tab: "topics" | "miccheck" | "stats" | "bridge") => void;
  activePersona: Persona | null;
  activeLevel: Level | null;
  userId: string;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  activePersona,
  activeLevel,
  userId,
}) => {
  const getPersonaLabel = (p: Persona) => {
    switch (p) {
      case "conversation_partner": return "Giao tiếp Tự do";
      case "grammar_tutor": return "Gia sư Ngữ pháp";
      case "pronunciation_coach": return "Luyện Phát âm";
      case "fluency_coach": return "Phản xạ Phỏng vấn";
    }
  };

  const getLevelLabel = (l: Level) => {
    switch (l) {
      case "beginner": return "Cơ bản";
      case "intermediate": return "Trung cấp";
      case "advanced": return "Nâng cao";
    }
  };

  return (
    <header className="ispeaker-header" role="banner">
      <div className="header-inner">
        <div className="brand-group">
          <div className="brand-badge">Lớp 1 Pages</div>
          <h1 className="brand-title">🎙️ iSpeaker React</h1>
          <p className="brand-subtitle">Cổng Luyện Nói & Chọn Chủ Đề Tiếng Anh</p>
        </div>

        {activePersona && activeLevel && (
          <div className="status-badge" aria-label="Persona và trình độ đang chọn">
            <span className="badge-tag">{getPersonaLabel(activePersona)}</span>
            <span className="badge-dot">•</span>
            <span className="badge-tag">{getLevelLabel(activeLevel)}</span>
            <span className="badge-dot">•</span>
            <span className="badge-tag">{userId}</span>
          </div>
        )}

        <nav className="ispeaker-nav" aria-label="Thanh điều hướng iSpeaker">
          <button
            type="button"
            className={`nav-btn ${activeTab === "topics" ? "active" : ""}`}
            onClick={() => setActiveTab("topics")}
            role="tab"
            aria-selected={activeTab === "topics"}
          >
            📚 Chủ đề & Câu mẫu
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "miccheck" ? "active" : ""}`}
            onClick={() => setActiveTab("miccheck")}
            role="tab"
            aria-selected={activeTab === "miccheck"}
          >
            🎙️ Kiểm tra Mic
          </button>

          <button
            type="button"
            className={`nav-btn ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
            role="tab"
            aria-selected={activeTab === "stats"}
          >
            📊 Thống kê
          </button>

          <button
            type="button"
            className={`nav-btn highlight-btn ${activeTab === "bridge" ? "active" : ""}`}
            onClick={() => setActiveTab("bridge")}
            role="tab"
            aria-selected={activeTab === "bridge"}
          >
            🚀 Phòng Luyện Tập (Main App)
          </button>
        </nav>
      </div>
    </header>
  );
};
