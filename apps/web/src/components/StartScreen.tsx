import React, { useEffect, useMemo, useState } from "react";
import { Persona, Level, PersonaOption, LevelOption, CurriculumLesson, CurriculumModule, CurriculumPhrase, LearningLevel } from "../types";
import { apiClient } from "../api/client";

export interface SessionLearningContext {
  moduleId?: string;
  lessonId?: string;
  phraseId?: string;
  lessonTitle?: string;
  targetPhrase?: CurriculumPhrase;
}

interface StartScreenProps {
  onStartSession: (persona: Persona, level: Level, context?: SessionLearningContext) => void;
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

const PERSONA_BY_MODULE: Record<string, Persona> = {
  module_daily: "conversation_partner",
  module_pronunciation: "pronunciation_coach",
  module_grammar: "grammar_tutor",
  module_fluency: "fluency_coach",
};

export const StartScreen: React.FC<StartScreenProps> = ({ onStartSession, isLoading }) => {
  const [selectedPersona, setSelectedPersona] = useState<Persona>("conversation_partner");
  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");
  const [modules, setModules] = useState<CurriculumModule[]>([]);
  const [levels, setLevels] = useState<LearningLevel[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [selectedPhraseId, setSelectedPhraseId] = useState<string | null>(null);
  const [contentState, setContentState] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    let mounted = true;
    Promise.all([apiClient.getCurriculum(), apiClient.getLevels()]).then(([response, levelResponse]) => {
      if (!mounted) return;
      setModules(response.modules);
      setLevels(levelResponse.levels);
      const params = new URLSearchParams(window.location.search);
      const phraseId = params.get("phraseId");
      const lessonId = params.get("lessonId");
      const moduleId = params.get("moduleId");
      const module = response.modules.find((item) => item.id === moduleId) ?? response.modules[0];
      const lesson = module?.lessons.find((item) => item.id === lessonId) ?? module?.lessons[0];
      const phrase = lesson?.phrases.find((item) => item.id === phraseId) ?? lesson?.phrases[0];
      if (module && lesson) {
        setSelectedModuleId(module.id);
        setSelectedLessonId(lesson.id);
        setSelectedPhraseId(phrase?.id ?? null);
        setSelectedPersona(PERSONA_BY_MODULE[module.id] ?? "conversation_partner");
        setSelectedLevel((module.levelMin as Level) || "beginner");
      }
      setContentState("ready");
    }).catch(() => mounted && setContentState("error"));
    return () => { mounted = false; };
  }, []);

  const selectedModule = useMemo(() => modules.find((module) => module.id === selectedModuleId) ?? null, [modules, selectedModuleId]);
  const selectedLesson = useMemo(() => selectedModule?.lessons.find((lesson) => lesson.id === selectedLessonId) ?? null, [selectedLessonId, selectedModule]);
  const selectedPhrase = useMemo(() => selectedLesson?.phrases.find((phrase) => phrase.id === selectedPhraseId) ?? null, [selectedLesson, selectedPhraseId]);

  const selectModule = (module: CurriculumModule) => {
    const lesson = module.lessons[0];
    setSelectedModuleId(module.id);
    setSelectedLessonId(lesson?.id ?? null);
    setSelectedPhraseId(lesson?.phrases[0]?.id ?? null);
    setSelectedPersona(PERSONA_BY_MODULE[module.id] ?? "conversation_partner");
    setSelectedLevel((module.levelMin as Level) || "beginner");
  };

  const selectLesson = (lesson: CurriculumLesson) => {
    setSelectedLessonId(lesson.id);
    setSelectedPhraseId(lesson.phrases[0]?.id ?? null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStartSession(selectedPersona, selectedLevel, {
      moduleId: selectedModule?.id,
      lessonId: selectedLesson?.id,
      phraseId: selectedPhrase?.id,
      lessonTitle: selectedLesson?.title,
      targetPhrase: selectedPhrase ?? undefined,
    });
  };

  return (
    <main className="start-screen" id="main-content">
      <div className="start-card">
        <div className="card-header">
          <h2>Chọn mục tiêu luyện tập</h2>
          <p className="subtitle">Tùy chỉnh gia sư AI phù hợp với nhu cầu và trình độ của bạn</p>
        </div>

        <form onSubmit={handleSubmit} className="start-form">
          <section className="form-section curriculum-section" aria-labelledby="curriculum-heading">
            <div className="section-heading-row">
              <div>
                <h3 className="section-title" id="curriculum-heading">Lộ trình của tôi</h3>
                <p className="section-hint">Chọn một bài học cụ thể để mỗi lượt nói được ghi nhận đúng vào tiến trình.</p>
              </div>
              <span className="content-count">{modules.reduce((sum, module) => sum + module.lessons.length, 0)} bài học</span>
            </div>
            {contentState === "loading" && <p className="loading-inline" role="status">Đang tải lộ trình...</p>}
            {contentState === "error" && <p className="error-inline" role="alert">Chưa tải được lộ trình. Bạn vẫn có thể luyện tự do bên dưới.</p>}
            {contentState === "ready" && (
              <>
                <div className="module-grid" role="list" aria-label="Các mô-đun học tập">
                  {modules.map((module) => (
                    <button key={module.id} type="button" role="listitem" className={`module-card ${selectedModuleId === module.id ? "selected" : ""}`} onClick={() => selectModule(module)}>
                      <span className="module-icon" aria-hidden="true">{module.icon}</span>
                      <span className="module-copy"><strong>{module.title}</strong><small>{module.lessons.length} bài · {module.levelMin} → {module.levelMax}</small></span>
                    </button>
                  ))}
                </div>
                <div className="cefr-track" aria-label="Lộ trình CEFR A1 đến C1">
                  <div className="cefr-track-heading"><strong>Bậc học A1 → C1</strong><span>{levels.reduce((sum, level) => sum + level.units.length, 0)} unit · {levels.reduce((sum, level) => sum + level.units.reduce((unitSum, unit) => unitSum + unit.vocabulary.length, 0), 0)} từ vựng</span></div>
                  <div className="cefr-level-list">{levels.map((level) => <div key={level.id} className="cefr-level"><strong>{level.code}</strong><span>{level.title}</span><small>{level.units.length} unit</small></div>)}</div>
                </div>
                {selectedModule && (
                  <div className="lesson-picker">
                    <div className="lesson-picker-header"><strong>{selectedModule.title}</strong><span>{selectedModule.description}</span></div>
                    <div className="lesson-list">
                      {selectedModule.lessons.map((lesson) => (
                        <button key={lesson.id} type="button" className={`lesson-row ${selectedLessonId === lesson.id ? "selected" : ""}`} onClick={() => selectLesson(lesson)}>
                          <span className="lesson-number">{String(lesson.lessonOrder).padStart(2, "0")}</span>
                          <span><strong>{lesson.title}</strong><small>{lesson.description}</small></span>
                          <span className="lesson-phrase-count">{lesson.phrases.length} câu</span>
                        </button>
                      ))}
                    </div>
                    {selectedLesson && (
                      <div className="phrase-picker" aria-label="Câu mục tiêu">
                        <div className="phrase-picker-title"><strong>Câu mục tiêu</strong><span>Chọn câu để nhận gợi ý phát âm</span></div>
                        <div className="phrase-chip-list">
                          {selectedLesson.phrases.map((phrase) => (
                            <button key={phrase.id} type="button" className={`phrase-chip ${selectedPhraseId === phrase.id ? "selected" : ""}`} onClick={() => setSelectedPhraseId(phrase.id)}>{phrase.english}</button>
                          ))}
                        </div>
                        {selectedPhrase && <p className="selected-phrase-hint">{selectedPhrase.phoneticHint || "Nói chậm, rõ và ưu tiên ý nghĩa của câu."}</p>}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </section>

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
