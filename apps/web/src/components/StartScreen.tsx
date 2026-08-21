import React, { useState } from "react";
import { Persona, Level, PersonaOption, LevelOption } from "../types";

interface StartScreenProps {
  onStartSession: (persona: Persona, level: Level) => void;
  isLoading: boolean;
}

const PERSONA_OPTIONS: PersonaOption[] = [
  {
    id: "conversation_partner",
    title: "Người bạn trò chuyện (Conversation Partner)",
    description: "Phản hồi tự nhiên, ngắn gọn, khuyến khích nói tiếp, ít bắt lỗi giữa chừng.",
    icon: "💬",
  },
  {
    id: "grammar_tutor",
    title: "Gia sư Ngữ pháp (Grammar Tutor)",
    description: "Tập trung phát hiện và giải thích chi tiết các lỗi ngữ pháp trong câu của bạn.",
    icon: "📝",
  },
  {
    id: "pronunciation_coach",
    title: "Hướng dẫn Phát âm (Pronunciation Coach)",
    description: "Gợi ý cách đọc đúng từ transcript kèm phiên âm tiếng Việt dễ hiểu.",
    icon: "🗣️",
  },
  {
    id: "fluency_coach",
    title: "Luyện Phản xạ & Trôi chảy (Fluency Coach)",
    description: "Khuyến khích nói câu dài hơn, đặt câu hỏi mở để rèn luyện phản xạ giao tiếp.",
    icon: "🚀",
  },
];

const LEVEL_OPTIONS: LevelOption[] = [
  {
    id: "beginner",
    title: "Cơ bản (Beginner)",
    description: "AI nói câu ngắn, từ vựng thông dụng, dễ hiểu.",
  },
  {
    id: "intermediate",
    title: "Trung cấp (Intermediate)",
    description: "AI dùng mẫu câu tự nhiên, đa dạng cấu trúc.",
  },
  {
    id: "advanced",
    title: "Nâng cao (Advanced)",
    description: "AI phản hồi tự nhiên như người bản xứ, từ vựng nâng cao.",
  },
];

export const StartScreen: React.FC<StartScreenProps> = ({ onStartSession, isLoading }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>("conversation_partner");
  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartSession(selectedPersona, selectedLevel);
  };

  return (
    <main className="start-screen" id="main-content">
      <div className="start-card">
        <div className="card-header">
          <h2>Chọn mục tiêu luyện tập</h2>
          <p className="subtitle">Tùy chỉnh gia sư AI phù hợp với nhu cầu và trình độ của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="start-form">
          <section className="form-section">
            <h3 className="section-title">1. Chọn Persona (Phong cách AI)</h3>
            <div className="options-grid" role="radiogroup" aria-label="Chọn Persona">
              {PERSONA_OPTIONS.map((p) => {
                const isSelected = selectedPersona === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedPersona(p.id)}
                  >
                    <div className="option-header">
                      <span className="option-icon" aria-hidden="true">{p.icon}</span>
                      <span className="option-title">{p.title}</span>
                    </div>
                    <p className="option-desc">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="form-section">
            <h3 className="section-title">2. Chọn Trình độ (Level)</h3>
            <div className="options-grid cols-3" role="radiogroup" aria-label="Chọn Trình độ">
              {LEVEL_OPTIONS.map((l) => {
                const isSelected = selectedLevel === l.id;
                return (
                  <button
                    key={l.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`option-card level-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setSelectedLevel(l.id)}
                  >
                    <span className="option-title">{l.title}</span>
                    <p className="option-desc">{l.description}</p>
                  </button>
                );
              })}
            </div>
          </section>

          <div className="form-actions">
            <button
              type="submit"
              className="submit-btn primary-btn"
              disabled={isLoading}
              aria-busy={isLoading}
            >
              {isLoading ? "Đang khởi tạo Session..." : "Bắt đầu luyện tập 🎙️"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
};
