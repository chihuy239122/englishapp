import React from "react";
import { Topic, Level } from "../types";

interface TopicSelectorProps {
  topics: Topic[];
  selectedTopicId: string | null;
  onSelectTopic: (topic: Topic) => void;
  selectedLevel: Level;
  onChangeLevel: (level: Level) => void;
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  selectedTopicId,
  onSelectTopic,
  selectedLevel,
  onChangeLevel,
}) => {
  return (
    <section className="topic-selector-section" aria-labelledby="topic-heading">
      <div className="section-header">
        <h2 id="topic-heading" className="section-title">
          1. Chọn Chủ Đề & Trình Độ Luyện Nói
        </h2>
        <p className="section-desc">
          Mỗi chủ đề được thiết kế cho một Persona AI riêng biệt giúp bạn tập trung đúng mục tiêu giao tiếp.
        </p>
      </div>

      <div className="level-picker-bar">
        <span className="level-label">Trình độ mục tiêu:</span>
        <div className="level-options" role="radiogroup" aria-label="Chọn trình độ">
          <button
            type="button"
            className={`level-btn ${selectedLevel === "beginner" ? "active" : ""}`}
            onClick={() => onChangeLevel("beginner")}
            role="radio"
            aria-checked={selectedLevel === "beginner"}
          >
            🌱 Cơ bản (Beginner)
          </button>
          <button
            type="button"
            className={`level-btn ${selectedLevel === "intermediate" ? "active" : ""}`}
            onClick={() => onChangeLevel("intermediate")}
            role="radio"
            aria-checked={selectedLevel === "intermediate"}
          >
            🌿 Trung cấp (Intermediate)
          </button>
          <button
            type="button"
            className={`level-btn ${selectedLevel === "advanced" ? "active" : ""}`}
            onClick={() => onChangeLevel("advanced")}
            role="radio"
            aria-checked={selectedLevel === "advanced"}
          >
            🌳 Nâng cao (Advanced)
          </button>
        </div>
      </div>

      <div className="topic-grid">
        {topics.map((topic) => {
          const isSelected = selectedTopicId === topic.id;

          return (
            <div
              key={topic.id}
              className={`topic-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectTopic(topic)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onSelectTopic(topic);
                }
              }}
              aria-pressed={isSelected}
            >
              <div className="topic-card-header">
                <span className="topic-icon" aria-hidden="true">
                  {topic.icon}
                </span>
                <span className="topic-category">{topic.category}</span>
              </div>
              <h3 className="topic-title">{topic.title}</h3>
              <p className="topic-description">{topic.description}</p>
              <div className="topic-footer">
                <span className="topic-phrase-count">
                  {topic.phrases.length} câu mẫu gợi ý
                </span>
                <span className="select-badge">
                  {isSelected ? "✓ Đã chọn" : "Chọn chủ đề →"}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
