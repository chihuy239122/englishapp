import React, { useEffect, useState } from "react";
import { UserStatsResponse, UserDailyStat, UserProgressResponse } from "../types";
import { apiClient } from "../api/client";

interface StatsViewProps {
  userId: string;
}

export const StatsView: React.FC<StatsViewProps> = ({ userId }) => {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [progress, setProgress] = useState<UserProgressResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [data, progressData] = await Promise.all([apiClient.getUserStats(userId), apiClient.getUserProgress(userId)]);
      setStats(data);
      setProgress(progressData);
    } catch (err: any) {
      setError(err.message || "Không thể tải dữ liệu thống kê.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [userId]);

  return (
    <main className="stats-view" id="main-content">
      <div className="stats-card">
        <div className="stats-header">
          <h2>Thống kê tiến trình học tập</h2>
          <button
            type="button"
            className="refresh-btn secondary-btn"
            onClick={fetchStats}
            disabled={isLoading}
            aria-label="Cập nhật lại thống kê"
          >
            🔄 Làm mới
          </button>
        </div>

        {isLoading ? (
          <div className="loading-indicator" role="status">
            <span>Đang tải dữ liệu thống kê...</span>
          </div>
        ) : error ? (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <button type="button" className="retry-btn" onClick={fetchStats}>
              Thử lại
            </button>
          </div>
        ) : stats ? (
          <div className="stats-content">
            <div className="kpi-grid">
              <div className="kpi-card">
                <span className="kpi-icon" aria-hidden="true">⏱️</span>
                <div className="kpi-info">
                  <span className="kpi-value">{stats.totalMinutes ?? 0}</span>
                  <span className="kpi-label">Tổng phút luyện tập</span>
                </div>
              </div>

              <div className="kpi-card">
                <span className="kpi-icon" aria-hidden="true">💬</span>
                <div className="kpi-info">
                  <span className="kpi-value">{stats.totalTurns ?? 0}</span>
                  <span className="kpi-label">Tổng lượt nói</span>
                </div>
              </div>
            </div>

            <section className="daily-stats-section">
              <section className="learning-progress-section" aria-labelledby="learning-progress-heading">
                <div className="progress-section-header">
                  <div><h3 id="learning-progress-heading">Tiến trình lộ trình</h3><p>Theo dõi số câu đã luyện và bài đã mở khóa.</p></div>
                  <strong>{progress?.modules.reduce((sum, module) => sum + module.lessons.filter((lesson) => lesson.completionPercent > 0).length, 0) ?? 0} bài đang học</strong>
                </div>
                <div className="progress-module-list">
                  {(progress?.modules ?? []).map((module) => (
                    <article key={module.moduleId} className="progress-module-card">
                      <div className="progress-module-title"><strong>{module.title}</strong><span>{module.completionPercent}%</span></div>
                      <div className="progress-bar" aria-label={`${module.title}: ${module.completionPercent}%`}><span style={{ width: `${module.completionPercent}%` }} /></div>
                      <div className="progress-lesson-list">
                        {module.lessons.map((lesson) => (
                          <div key={lesson.lessonId} className="progress-lesson-row">
                            <span className={`progress-status ${lesson.completionPercent >= 100 ? "complete" : lesson.unlocked ? "open" : "locked"}`} aria-label={lesson.unlocked ? "Đã mở" : "Chưa mở"}>{lesson.completionPercent >= 100 ? "✓" : lesson.unlocked ? "•" : "🔒"}</span>
                            <span>{lesson.title}</span><small>{lesson.practicedPhrases}/{lesson.totalPhrases} câu</small>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className="daily-stats-section">
              <h3>Chi tiết theo ngày</h3>
              {(!stats.dailyStats || stats.dailyStats.length === 0) ? (
                <p className="no-data">Chưa có dữ liệu thống kê theo ngày.</p>
              ) : (
                <div className="daily-stats-table-wrapper">
                  <table className="daily-stats-table">
                    <thead>
                      <tr>
                        <th scope="col">Ngày</th>
                        <th scope="col">Số lượt nói</th>
                        <th scope="col">Thời lượng (phút)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.dailyStats.map((row: UserDailyStat) => (
                        <tr key={row.date}>
                          <td>{row.date}</td>
                          <td>{row.turns} lượt</td>
                          <td>{row.minutes} phút</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              </section>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
};
