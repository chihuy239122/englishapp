PRAGMA foreign_keys = ON;

CREATE TABLE content_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  license TEXT NOT NULL,
  retrieved_at TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE content_topics (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  target_persona TEXT NOT NULL,
  default_level TEXT NOT NULL,
  source_id TEXT NOT NULL REFERENCES content_sources(id)
);

CREATE TABLE content_phrases (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL REFERENCES content_topics(id),
  english TEXT NOT NULL,
  vietnamese_hint TEXT NOT NULL,
  phonetic_hint TEXT,
  audio_tip TEXT,
  focus_grammar TEXT,
  source_id TEXT NOT NULL REFERENCES content_sources(id),
  phrase_order INTEGER NOT NULL
);

CREATE INDEX idx_content_topics_level ON content_topics(default_level);
CREATE INDEX idx_content_phrases_topic ON content_phrases(topic_id, phrase_order);

INSERT INTO content_sources (id, name, url, license, retrieved_at, notes) VALUES
  ('openjam', 'Openjam English vocabulary database', 'https://github.com/amirj4m/openjam', 'MIT', '2026-08-20', 'Used as an open vocabulary and level reference. Example sentences in this release are original or separately attributed.'),
  ('common-voice-cc0', 'Mozilla Common Voice sentence prompts', 'https://gist.github.com/8f2581641caca265945786fe99274966', 'CC0', '2026-08-20', 'A small set of pronunciation prompts is reused under the stated CC0 dedication.'),
  ('english-app-curated', 'English App curated examples', 'https://github.com/chihuy239122/englishapp', 'Original', '2026-08-20', 'Short bilingual teaching examples authored for this release and reviewed for learner safety and clarity.');

INSERT INTO content_topics (id, title, category, description, icon, target_persona, default_level, source_id) VALUES
  ('topic_daily_open', 'Giao tiếp hàng ngày', 'Conversation', 'Luyện những câu nói ngắn về lịch trình, sở thích và kế hoạch trong ngày.', '☕', 'conversation_partner', 'beginner', 'openjam'),
  ('topic_grammar_open', 'Xây câu & Ngữ pháp', 'Grammar', 'Luyện ghép câu với hiện tại hoàn thành, điều kiện loại một và câu hỏi tự nhiên.', '📐', 'grammar_tutor', 'intermediate', 'openjam'),
  ('topic_pronunciation_cc0', 'Âm khó & Nhịp câu', 'Pronunciation', 'Tập âm /th/, phụ âm cuối và nhịp nói qua các câu ngắn dễ lặp lại.', '🎙️', 'pronunciation_coach', 'beginner', 'openjam'),
  ('topic_fluency_open', 'Phản xạ & Phỏng vấn', 'Fluency', 'Tổ chức ý kiến, dùng từ nối và trả lời câu hỏi mở mạch lạc hơn.', '⚡', 'fluency_coach', 'advanced', 'openjam');

INSERT INTO content_phrases (id, topic_id, english, vietnamese_hint, phonetic_hint, audio_tip, focus_grammar, source_id, phrase_order) VALUES
  ('phrase_daily_plan', 'topic_daily_open', 'I have a meeting at nine, but I can talk after lunch.', 'Tôi có cuộc họp lúc chín giờ, nhưng tôi có thể nói chuyện sau bữa trưa.', NULL, 'Nhấn nhẹ vào meeting, nine và after lunch.', NULL, 'english-app-curated', 1),
  ('phrase_daily_weekend', 'topic_daily_open', 'What do you usually do on weekends?', 'Bạn thường làm gì vào cuối tuần?', NULL, 'Lên giọng nhẹ ở cuối câu hỏi.', 'Câu hỏi với do + chủ ngữ + động từ nguyên mẫu.', 'english-app-curated', 2),
  ('phrase_daily_goal', 'topic_daily_open', 'My goal is to practice English for ten minutes today.', 'Mục tiêu của tôi là luyện tiếng Anh mười phút hôm nay.', NULL, 'Nối practice English thành một cụm liền mạch.', 'My goal is to + verb.', 'english-app-curated', 3),
  ('phrase_grammar_lived', 'topic_grammar_open', 'I have lived in this city for three years.', 'Tôi đã sống ở thành phố này được ba năm.', NULL, 'Đọc rõ âm cuối trong lived.', 'Hiện tại hoàn thành với for + khoảng thời gian.', 'english-app-curated', 1),
  ('phrase_grammar_condition', 'topic_grammar_open', 'If I have enough time, I will practice speaking tonight.', 'Nếu có đủ thời gian, tối nay tôi sẽ luyện nói.', NULL, 'Tạm dừng rất ngắn sau mệnh đề If.', 'If + hiện tại đơn, will + động từ nguyên mẫu.', 'english-app-curated', 2),
  ('phrase_grammar_question', 'topic_grammar_open', 'Could you explain that idea in a simpler way?', 'Bạn có thể giải thích ý đó theo cách đơn giản hơn không?', NULL, 'Could you là một cụm lịch sự, không đọc tách từng từ.', 'Could you + verb để yêu cầu lịch sự.', 'english-app-curated', 3),
  ('phrase_pronunciation_zoo', 'topic_pronunciation_cc0', 'There is a zebra, monkey, and flamingo at the zoo!', 'Có một con ngựa vằn, khỉ và hồng hạc ở sở thú!', NULL, 'Nối nhẹ các danh từ trong danh sách.', NULL, 'common-voice-cc0', 1),
  ('phrase_pronunciation_sit', 'topic_pronunciation_cc0', 'Would you please just sit down?', 'Bạn vui lòng ngồi xuống được không?', NULL, 'Giữ âm /dʒ/ trong just rõ nhưng ngắn.', NULL, 'common-voice-cc0', 2),
  ('phrase_pronunciation_tea', 'topic_pronunciation_cc0', 'Drinking tea is one of life''s great pleasures.', 'Uống trà là một trong những niềm vui lớn của cuộc sống.', NULL, 'Nhấn vào drinking, great và pleasures.', NULL, 'common-voice-cc0', 3),
  ('phrase_fluency_perspective', 'topic_fluency_open', 'From my perspective, flexible work can improve focus.', 'Theo quan điểm của tôi, công việc linh hoạt có thể cải thiện sự tập trung.', NULL, 'Dùng From my perspective như một cụm mở đầu.', 'Cụm mở đầu nêu quan điểm.', 'english-app-curated', 1),
  ('phrase_fluency_balance', 'topic_fluency_open', 'On the one hand, technology saves time; on the other hand, it can distract us.', 'Một mặt, công nghệ tiết kiệm thời gian; mặt khác, nó có thể làm chúng ta xao nhãng.', NULL, 'Tạo nhịp dừng ở dấu chấm phẩy.', 'On the one hand ..., on the other hand ...', 'english-app-curated', 2),
  ('phrase_fluency_question', 'topic_fluency_open', 'My goal is to explain the idea clearly and ask one useful question.', 'Mục tiêu của tôi là giải thích ý tưởng rõ ràng và đặt một câu hỏi hữu ích.', NULL, 'Chia câu thành hai nhịp: explain clearly / ask one question.', 'Song song với and: to explain ... and ask ...', 'english-app-curated', 3);
