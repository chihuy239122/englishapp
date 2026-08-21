import React, { useEffect, useState } from "react";
import { UserStatsResponse, UserDailyStat } from "../types";
import { apiClient } from "../api/client";

interface StatsViewProps {
  userId: string;
}

export const StatsView: React.FC<StatsViewProps> = ({ userId }) => {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiClient.getUserStats(userId);
      setStats(data);
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
          </div>
        ) : null}
      </div>
    </main>
  );
};
