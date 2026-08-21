import React, { useState, useEffect } from "react";
import { UserStatsResponse } from "../types";
import { ispeakerClient } from "../api/ispeakerClient";

interface StatsSummaryProps {
  userId: string;
}

export const StatsSummary: React.FC<StatsSummaryProps> = ({ userId }) => {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    ispeakerClient
      .getUserStats(userId)
      .then((data) => {
        if (isMounted) {
          setStats(data);
          setErrorMsg(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.warn("Could not fetch user stats:", err);
          setErrorMsg("Chưa thể tải dữ liệu thống kê từ Worker API.");
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [userId]);

  return (
    <section className="stats-summary-section" aria-labelledby="stats-heading">
      <div className="section-header">
        <h2 id="stats-heading" className="section-title">
          📊 Thống Kê Tiến Độ Luyện Nói ({userId})
        </h2>
        <p className="section-desc">
          Dữ liệu được tổng hợp trực tiếp từ Cloudflare D1 database (không tạo cache trùng lặp).
        </p>
      </div>

      {isLoading ? (
        <div className="stats-loading">⏳ Đang tải thống kê tiến độ...</div>
      ) : errorMsg ? (
        <div className="stats-error" role="alert">
          <span>{errorMsg}</span>
        </div>
      ) : (
        <div className="stats-content">
          <div className="stats-cards-grid">
            <div className="stat-card">
              <span className="stat-icon">⏱️</span>
              <div className="stat-body">
                <span className="stat-value">{stats?.totalMinutes ?? 0}</span>
                <span className="stat-label">Phút luyện nói</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">💬</span>
              <div className="stat-body">
                <span className="stat-value">{stats?.totalTurns ?? 0}</span>
                <span className="stat-label">Lượt hội thoại</span>
              </div>
            </div>

            <div className="stat-card">
              <span className="stat-icon">📅</span>
              <div className="stat-body">
                <span className="stat-value">{stats?.dailyStats?.length ?? 0}</span>
                <span className="stat-label">Ngày tích cực</span>
              </div>
            </div>
          </div>

          {stats?.dailyStats && stats.dailyStats.length > 0 && (
            <div className="daily-stats-table-wrapper">
              <h3>Chi tiết theo ngày:</h3>
              <table className="daily-stats-table">
                <thead>
                  <tr>
                    <th>Ngày</th>
                    <th>Số phút nói</th>
                    <th>Số lượt hội thoại</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.dailyStats.map((item) => (
                    <tr key={item.date}>
                      <td>{item.date}</td>
                      <td>{item.minutes} phút</td>
                      <td>{item.turns} lượt</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
