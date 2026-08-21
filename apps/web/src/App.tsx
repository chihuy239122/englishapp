import React, { useState } from "react";
import { Persona, Level, SessionInfo } from "./types";
import { apiClient } from "./api/client";
import { Header } from "./components/Header";
import { SessionLearningContext, StartScreen } from "./components/StartScreen";
import { PracticeWorkspace } from "./components/PracticeWorkspace";
import { StatsView } from "./components/StatsView";

const DEFAULT_USER_ID = "user_demo_1";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"practice" | "stats">("practice");
  const [currentSession, setCurrentSession] = useState<SessionInfo | null>(null);
  const [isStartingSession, setIsStartingSession] = useState<boolean>(false);
  const [appError, setAppError] = useState<string | null>(null);

  const handleStartSession = async (persona: Persona, level: Level, learningContext?: SessionLearningContext) => {
    setIsStartingSession(true);
    setAppError(null);

    try {
      const response = await apiClient.createSession({
        userId: DEFAULT_USER_ID,
        persona,
        level,
        ...(learningContext?.moduleId ? { moduleId: learningContext.moduleId } : {}),
        ...(learningContext?.lessonId ? { lessonId: learningContext.lessonId } : {}),
        ...(learningContext?.phraseId ? { phraseId: learningContext.phraseId } : {}),
      });

      setCurrentSession({
        sessionId: response.sessionId,
        userId: DEFAULT_USER_ID,
        persona,
        level,
        startedAt: Date.now(),
        moduleId: learningContext?.moduleId,
        lessonId: learningContext?.lessonId,
        phraseId: learningContext?.phraseId,
        lessonTitle: learningContext?.lessonTitle,
        targetPhrase: learningContext?.targetPhrase,
      });
    } catch (err: any) {
      console.error("Failed to create session:", err);
      setAppError(err.message || "Không thể khởi tạo session mới.");
    } finally {
      setIsStartingSession(false);
    }
  };

  const handleEndSession = () => {
    setCurrentSession(null);
  };

  return (
    <div className="app-container">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        persona={currentSession?.persona ?? null}
        level={currentSession?.level ?? null}
        userId={DEFAULT_USER_ID}
        onEndSession={currentSession ? handleEndSession : undefined}
      />

      {appError && (
        <div className="app-error-toast" role="alert">
          <span>{appError}</span>
          <button type="button" onClick={() => setAppError(null)}>
            Đóng
          </button>
        </div>
      )}

      {activeTab === "stats" ? (
        <StatsView userId={DEFAULT_USER_ID} />
      ) : currentSession ? (
        <PracticeWorkspace
          sessionId={currentSession.sessionId}
          persona={currentSession.persona}
          level={currentSession.level}
          userId={currentSession.userId}
          lessonTitle={currentSession.lessonTitle}
          targetPhrase={currentSession.targetPhrase}
        />
      ) : (
        <StartScreen
          onStartSession={handleStartSession}
          isLoading={isStartingSession}
        />
      )}
    </div>
  );
};
