import React, { useState } from "react";
import { TurnData } from "../types";
import { playBase64Audio } from "../utils/audio";

interface TurnHistoryProps {
  turns: TurnData[];
}

export const TurnHistory: React.FC<TurnHistoryProps> = ({ turns }) => {
  const [playingTurnId, setPlayingTurnId] = useState<string | null>(null);

  if (turns.length === 0) {
    return (
      <div className="empty-history" role="status">
        <p>Chưa có lượt hội thoại nào trong session này. Bấm nút micro bên dưới để bắt đầu!</p>
      </div>
    );
  }

  const handleReplayAudio = async (turn: TurnData) => {
    if (!turn.audioBase64) return;
    setPlayingTurnId(turn.turnId);
    await playBase64Audio(
      turn.audioBase64,
      () => setPlayingTurnId(null),
      () => setPlayingTurnId(null)
    );
  };

  return (
    <div className="turn-history-list" aria-label="Lịch sử hội thoại">
      {turns.map((turn, index) => {
        const isPlaying = playingTurnId === turn.turnId;
        return (
          <div key={turn.turnId || index} className="turn-card">
            {/* User message */}
            <div className="chat-bubble user-bubble">
              <div className="bubble-header">
                <span className="user-icon" aria-hidden="true">👤</span>
                <span className="bubble-author">Bạn</span>
                <span className="turn-number">#{index + 1}</span>
              </div>
              <p className="bubble-text">{turn.transcript}</p>
            </div>

            {/* AI Response */}
            <div className="chat-bubble ai-bubble">
              <div className="bubble-header">
                <span className="ai-icon" aria-hidden="true">🤖</span>
                <span className="bubble-author">Gia sư AI</span>

                {turn.audioAvailable && turn.audioBase64 && (
                  <button
                    type="button"
                    className={`replay-btn ${isPlaying ? "playing" : ""}`}
                    onClick={() => handleReplayAudio(turn)}
                    aria-label={`Nghe lại phản hồi âm thanh lượt #${index + 1}`}
                  >
                    {isPlaying ? "🔊 Đang phát..." : "▶️ Nghe lại"}
                  </button>
                )}
              </div>
              <p className="bubble-text">{turn.aiReply}</p>

              {/* Corrections block */}
              {turn.corrections && turn.corrections.length > 0 && (
                <div className="corrections-block">
                  <h4 className="corrections-title">💡 Gợi ý & Sửa lỗi:</h4>
                  <ul className="corrections-list">
                    {turn.corrections.map((corr, cIdx) => (
                      <li key={cIdx} className="correction-item">
                        <div className="corr-row">
                          <span className="corr-label error-label">Chưa chính xác:</span>
                          <span className="corr-val error-val">{corr.error}</span>
                        </div>
                        <div className="corr-row">
                          <span className="corr-label fix-label">Nên dùng:</span>
                          <span className="corr-val fix-val">{corr.fix}</span>
                        </div>
                        {corr.rule && (
                          <div className="corr-row rule-row">
                            <span className="corr-label rule-label">Giải thích:</span>
                            <span className="corr-val rule-val">{corr.rule}</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
