import React from "react";
import { Persona, Level } from "../types";

interface HeaderProps {
  activeTab: "practice" | "stats";
  setActiveTab: (tab: "practice" | "stats") => void;
  persona: Persona | null;
  level: Level | null;
  userId: string;
  onEndSession?: () => void;
}

const CANONICAL_ISPEAKER_URL = "https://ispeakerreact-5u6.pages.dev";

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  persona,
  level,
  userId,
  onEndSession,
}) => {
  const ispeakerUrl =
    (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_ISPEAKER_URL ||
    CANONICAL_ISPEAKER_URL;

  const getPersonaLabel = (p: Persona) => {
    switch (p) {
      case "conversation_partner": return "Trò chuyện";
      case "grammar_tutor": return "Gia sư Ngữ pháp";
      case "pronunciation_coach": return "Sửa Phát âm";
      case "fluency_coach": return "Luyện Phản xạ";
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
    <header className="app-header" role="banner">
      <div className="header-container">
        <div className="brand">
          <span className="brand-logo" aria-hidden="true">🎙️</span>
          <h1 className="brand-title">English AI Tutor</h1>
        </div>

        {persona && level && (
          <div className="session-badge" aria-label="Thông tin session hiện tại">
            <span className="badge-item">{getPersonaLabel(persona)}</span>
            <span className="badge-divider">•</span>
            <span className="badge-item">{getLevelLabel(level)}</span>
            {onEndSession && (
              <button
                type="button"
                className="end-session-btn"
                onClick={onEndSession}
                title="Đổi Persona / Trình độ"
                aria-label="Đổi Persona hoặc Trình độ"
              >
                Đổi
              </button>
            )}
          </div>
        )}

        <nav className="header-nav" aria-label="Điều hướng trang">
          <button
            type="button"
            className={`nav-tab ${activeTab === "practice" ? "active" : ""}`}
            onClick={() => setActiveTab("practice")}
            aria-selected={activeTab === "practice"}
            role="tab"
          >
            Luyện tập
          </button>
          <button
            type="button"
            className={`nav-tab ${activeTab === "stats" ? "active" : ""}`}
            onClick={() => setActiveTab("stats")}
            aria-selected={activeTab === "stats"}
            role="tab"
          >
            Thống kê
          </button>
          <a
            href={ispeakerUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="nav-tab nav-external-link"
            aria-label="Mở ứng dụng iSpeaker React (mở trong thẻ mới)"
            title="Mở ứng dụng iSpeaker React"
          >
            iSpeaker ↗
          </a>
        </nav>
      </div>
    </header>
  );
};
