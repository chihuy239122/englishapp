import React, { useState } from "react";
import { Topic, SamplePhrase, Level } from "../types";
import { speakSampleText } from "../utils/audioUtils";

interface PhraseCardsProps {
  topic: Topic | null;
  selectedLevel: Level;
  onStartSessionWithPhrase?: (phrase: SamplePhrase) => void;
}

export const PhraseCards: React.FC<PhraseCardsProps> = ({
  topic,
  selectedLevel,
  onStartSessionWithPhrase,
}) => {
  const [playingPhraseId, setPlayingPhraseId] = useState<string | null>(null);

  if (!topic) {
    return (
      <section className="phrase-cards-section empty">
        <p className="empty-notice">
          👈 Hãy chọn một chủ đề ở mục trên để xem các câu mẫu & hướng dẫn phát âm chi tiết.
        </p>
      </section>
    );
  }

  const handlePlayAudio = (phrase: SamplePhrase) => {
    setPlayingPhraseId(phrase.id);
    speakSampleText(phrase.english, () => {
      setPlayingPhraseId(null);
    });
  };

  return (
    <section className="phrase-cards-section" aria-labelledby="phrase-heading">
      <div className="section-header">
        <h2 id="phrase-heading" className="section-title">
          2. Câu Mẫu Hướng Dẫn — {topic.title} ({selectedLevel})
        </h2>
        <p className="section-desc">
          Nghe phát âm chuẩn bằng trình duyệt và xem mẹo phát âm trước khi mở phòng nói tự do.
        </p>
      </div>

      <div className="phrases-list">
        {topic.phrases.map((phrase, idx) => (
          <div key={phrase.id} className="phrase-card">
            <div className="phrase-number">{idx + 1}</div>

            <div className="phrase-content">
              <div className="phrase-english-row">
                <span className="phrase-english">{phrase.english}</span>
                <button
                  type="button"
                  className={`speak-btn ${playingPhraseId === phrase.id ? "playing" : ""}`}
                  onClick={() => handlePlayAudio(phrase)}
                  aria-label={`Nghe đọc mẫu câu: ${phrase.english}`}
                >
                  {playingPhraseId === phrase.id ? "🔊 Đang phát..." : "🔊 Nghe mẫu"}
                </button>
              </div>

              <div className="phrase-vietnamese">{phrase.vietnameseHint}</div>

              {phrase.phoneticHint && (
                <div className="phrase-phonetic">
                  <span className="phonetic-tag">Phiên âm:</span> {phrase.phoneticHint}
                </div>
              )}

              {phrase.audioTip && (
                <div className="phrase-tip">
                  <span className="tip-icon">💡</span> {phrase.audioTip}
                </div>
              )}

              {phrase.focusGrammar && (
                <div className="phrase-grammar">
                  <span className="grammar-icon">📌</span> {phrase.focusGrammar}
                </div>
              )}

              {onStartSessionWithPhrase && (
                <div className="phrase-actions">
                  <button
                    type="button"
                    className="practice-phrase-btn"
                    onClick={() => onStartSessionWithPhrase(phrase)}
                  >
                    🎙️ Luyện nói câu này với AI →
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
