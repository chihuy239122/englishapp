import React, { useEffect, useState } from "react";
import { Persona, Level, Topic, SamplePhrase } from "./types";
import { ispeakerClient } from "./api/ispeakerClient";
import { Header } from "./components/Header";
import { TopicSelector } from "./components/TopicSelector";
import { PhraseCards } from "./components/PhraseCards";
import { MicCheck } from "./components/MicCheck";
import { MainAppBridge } from "./components/MainAppBridge";
import { StatsSummary } from "./components/StatsSummary";

const DEFAULT_USER_ID = "user_demo_1";

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"topics" | "miccheck" | "stats" | "bridge">("topics");
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<Persona>("conversation_partner");
  const [selectedLevel, setSelectedLevel] = useState<Level>("beginner");
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [isLoadingSession, setIsLoadingSession] = useState<boolean>(false);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    ispeakerClient.getTopics()
      .then((loadedTopics) => {
        if (isMounted) {
          setTopics(loadedTopics);
          const firstTopic = loadedTopics[0] ?? null;
          setSelectedTopic(firstTopic);
          if (firstTopic) {
            setSelectedPersona(firstTopic.targetPersona);
            setSelectedLevel(firstTopic.defaultLevel);
          }
        }
      })
      .catch(() => {
        if (isMounted) setNoticeMessage("Chưa thể tải kho bài học từ Worker API.");
      });
    return () => { isMounted = false; };
  }, []);

  const handleSelectTopic = (topic: Topic) => {
    setSelectedTopic(topic);
    setSelectedPersona(topic.targetPersona);
    setSelectedLevel(topic.defaultLevel);
    setNoticeMessage(
      `Đã chọn chủ đề "${topic.title}". Persona AI tự động thiết lập: ${topic.targetPersona}, trình độ: ${topic.defaultLevel}`
    );
  };

  const handleCreateSession = async () => {
    setIsLoadingSession(true);
    setNoticeMessage(null);

    try {
      const res = await ispeakerClient.createSession({
        userId: DEFAULT_USER_ID,
        persona: selectedPersona,
        level: selectedLevel,
      });

      setActiveSessionId(res.sessionId);
      setNoticeMessage(`🎉 Đã khởi tạo Session ${res.sessionId} thành công trên Worker API!`);
      setActiveTab("bridge");
    } catch (err: any) {
      console.error("Failed to create session in iSpeaker:", err);
      setNoticeMessage(`⚠️ Lỗi khởi tạo session: ${err.message || "Không thể kết nối API."}`);
    } finally {
      setIsLoadingSession(false);
    }
  };

  const handleStartSessionWithPhrase = (phrase: SamplePhrase) => {
    setNoticeMessage(`Bắt đầu bài luyện cho câu: "${phrase.english}"`);
    handleCreateSession();
  };

  return (
    <div className="ispeaker-app">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        activePersona={selectedPersona}
        activeLevel={selectedLevel}
        userId={DEFAULT_USER_ID}
      />

      {noticeMessage && (
        <div className="app-toast" role="status" aria-live="polite">
          <span>{noticeMessage}</span>
        </div>
      )}

      <main className="ispeaker-main">
        {activeTab === "topics" && (
          <>
            <TopicSelector
              topics={topics}
              selectedTopicId={selectedTopic?.id ?? null}
              onSelectTopic={handleSelectTopic}
              selectedLevel={selectedLevel}
              onChangeLevel={setSelectedLevel}
            />

            <PhraseCards
              topic={selectedTopic}
              selectedLevel={selectedLevel}
              onStartSessionWithPhrase={handleStartSessionWithPhrase}
            />
          </>
        )}

        {activeTab === "miccheck" && (
          <MicCheck activeSessionId={activeSessionId} />
        )}

        {activeTab === "stats" && (
          <StatsSummary userId={DEFAULT_USER_ID} />
        )}

        {activeTab === "bridge" && (
          <MainAppBridge
            selectedTopic={selectedTopic}
            selectedPersona={selectedPersona}
            selectedLevel={selectedLevel}
            activeSessionId={activeSessionId}
            onLaunchSession={handleCreateSession}
            isLoadingSession={isLoadingSession}
          />
        )}
      </main>
    </div>
  );
};
