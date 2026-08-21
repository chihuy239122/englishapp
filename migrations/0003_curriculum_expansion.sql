-- Structured English App curriculum: modules -> lessons -> phrases -> vocabulary.
-- All examples below are original English App content; source attribution remains in 0002.

CREATE TABLE content_modules (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  level_min TEXT NOT NULL,
  level_max TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  module_order INTEGER NOT NULL
);

CREATE TABLE content_lessons (
  id TEXT PRIMARY KEY,
  module_id TEXT NOT NULL REFERENCES content_modules(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  lesson_order INTEGER NOT NULL,
  required_phrase_count INTEGER NOT NULL DEFAULT 5
);

CREATE TABLE content_vocabulary (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES content_lessons(id),
  word TEXT NOT NULL,
  ipa TEXT NOT NULL,
  meaning TEXT NOT NULL,
  example TEXT NOT NULL
);

CREATE TABLE lesson_phrases (
  lesson_id TEXT NOT NULL REFERENCES content_lessons(id),
  phrase_id TEXT NOT NULL REFERENCES content_phrases(id),
  phrase_order INTEGER NOT NULL,
  PRIMARY KEY (lesson_id, phrase_id)
);

CREATE TABLE user_progress (
  user_id TEXT NOT NULL REFERENCES users(id),
  phrase_id TEXT NOT NULL REFERENCES content_phrases(id),
  times_practiced INTEGER NOT NULL DEFAULT 0,
  last_practiced_at INTEGER,
  mastered INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, phrase_id)
);

ALTER TABLE sessions ADD COLUMN module_id TEXT;
ALTER TABLE sessions ADD COLUMN lesson_id TEXT;
ALTER TABLE sessions ADD COLUMN phrase_id TEXT;
ALTER TABLE turns ADD COLUMN phrase_id TEXT;

CREATE INDEX idx_content_lessons_module_order ON content_lessons(module_id, lesson_order);
CREATE INDEX idx_lesson_phrases_lesson_order ON lesson_phrases(lesson_id, phrase_order);
CREATE INDEX idx_content_vocabulary_lesson ON content_vocabulary(lesson_id);
CREATE INDEX idx_user_progress_user ON user_progress(user_id);

INSERT OR IGNORE INTO content_modules (id, title, level_min, level_max, description, icon, module_order) VALUES
  ('module_daily', 'Giao tiếp hằng ngày', 'beginner', 'intermediate', 'Xây nền phản xạ bằng những tình huống ngắn, gần với đời sống.', '☀️', 1),
  ('module_pronunciation', 'Phát âm rõ và tự nhiên', 'beginner', 'intermediate', 'Sửa âm cuối, trọng âm và nối âm để người nghe hiểu dễ hơn.', '🔊', 2),
  ('module_grammar', 'Ngữ pháp trong giao tiếp', 'intermediate', 'advanced', 'Dùng cấu trúc đúng trong câu nói thật, không học ngữ pháp rời rạc.', '🧩', 3),
  ('module_fluency', 'Trôi chảy và phỏng vấn', 'intermediate', 'advanced', 'Luyện trả lời có ý, mở rộng câu và xử lý tình huống khó.', '🚀', 4);

INSERT OR IGNORE INTO content_lessons (id, module_id, title, description, lesson_order, required_phrase_count) VALUES
  ('lesson_daily_01', 'module_daily', 'Chào hỏi và làm quen', 'Giới thiệu bản thân, hỏi thăm và tạo kết nối đầu tiên.', 1, 5),
  ('lesson_daily_02', 'module_daily', 'Lịch trình một ngày', 'Nói về giờ giấc, thói quen và việc đang làm.', 2, 5),
  ('lesson_daily_03', 'module_daily', 'Mua sắm và gọi món', 'Hỏi giá, chọn món và xử lý yêu cầu đơn giản.', 3, 5),
  ('lesson_daily_04', 'module_daily', 'Đi lại và chỉ đường', 'Hỏi đường, mô tả vị trí và xác nhận thông tin.', 4, 5),
  ('lesson_pron_01', 'module_pronunciation', 'Âm cuối rõ ràng', 'Tập các âm cuối thường bị nuốt khi nói nhanh.', 1, 5),
  ('lesson_pron_02', 'module_pronunciation', 'Trọng âm từ', 'Nhấn đúng âm tiết để từ nghe tự nhiên hơn.', 2, 5),
  ('lesson_pron_03', 'module_pronunciation', 'Nối âm trong câu', 'Nói liền mạch giữa phụ âm cuối và nguyên âm đầu.', 3, 5),
  ('lesson_pron_04', 'module_pronunciation', 'Ngữ điệu và ý định', 'Dùng lên xuống giọng để thể hiện câu hỏi, xác nhận và cảm xúc.', 4, 5),
  ('lesson_grammar_01', 'module_grammar', 'Hiện tại và thói quen', 'Phân biệt việc đang diễn ra với thói quen thường ngày.', 1, 5),
  ('lesson_grammar_02', 'module_grammar', 'Kể chuyện quá khứ', 'Kể một trải nghiệm theo trình tự rõ ràng.', 2, 5),
  ('lesson_grammar_03', 'module_grammar', 'Kế hoạch và dự định', 'Nói về dự định, lịch hẹn và quyết định mới.', 3, 5),
  ('lesson_grammar_04', 'module_grammar', 'Ý kiến và lý do', 'Nêu quan điểm, giải thích và phản hồi lịch sự.', 4, 5),
  ('lesson_fluency_01', 'module_fluency', 'Trả lời có cấu trúc', 'Trả lời theo công thức ý chính, ví dụ và kết luận.', 1, 5),
  ('lesson_fluency_02', 'module_fluency', 'Mô tả vấn đề', 'Trình bày vấn đề và đề xuất hướng giải quyết.', 2, 5),
  ('lesson_fluency_03', 'module_fluency', 'Phỏng vấn công việc', 'Nói về kinh nghiệm, điểm mạnh và mục tiêu.', 3, 5),
  ('lesson_fluency_04', 'module_fluency', 'Phản xạ nâng cao', 'Câu giờ, làm rõ câu hỏi và giữ cuộc hội thoại tự nhiên.', 4, 5);

CREATE TABLE curriculum_phrase_seed (
  id TEXT PRIMARY KEY,
  topic_id TEXT NOT NULL,
  english TEXT NOT NULL,
  vietnamese_hint TEXT NOT NULL,
  phonetic_hint TEXT,
  audio_tip TEXT,
  focus_grammar TEXT,
  phrase_order INTEGER NOT NULL
);

INSERT OR IGNORE INTO curriculum_phrase_seed (id, topic_id, english, vietnamese_hint, phonetic_hint, audio_tip, focus_grammar, phrase_order) VALUES
  ('phrase_daily_01_01', 'topic_daily_open', 'Hi, I am glad to meet you.', 'Chào, tôi rất vui được gặp bạn.', '/aɪ əm ɡlæd/', 'Nhấn glad và nối am glad.', 'be + adjective', 1),
  ('phrase_daily_01_02', 'topic_daily_open', 'What should I call you?', 'Tôi nên gọi bạn là gì?', '/wʌt ʃəd aɪ/', 'Âm should nhẹ, không đọc thành shoot.', 'wh-question', 2),
  ('phrase_daily_01_03', 'topic_daily_open', 'I usually go by Alex.', 'Tôi thường dùng tên Alex.', '/ˈjuːʒuəli ɡoʊ baɪ/', 'Nhấn usually và Alex.', 'present simple', 3),
  ('phrase_daily_01_04', 'topic_daily_open', 'Where are you from?', 'Bạn đến từ đâu?', '/wer ər ju frəm/', 'Nối where are.', 'be question', 4),
  ('phrase_daily_01_05', 'topic_daily_open', 'I am from a small town.', 'Tôi đến từ một thị trấn nhỏ.', '/aɪ əm frəm/', 'Giữ rõ âm m cuối.', 'be + from', 5),
  ('phrase_daily_02_01', 'topic_daily_open', 'I wake up at seven every day.', 'Tôi thức dậy lúc bảy giờ mỗi ngày.', '/weɪk ʌp/', 'Nối wake up.', 'present simple', 1),
  ('phrase_daily_02_02', 'topic_daily_open', 'I am working from home today.', 'Hôm nay tôi đang làm việc ở nhà.', '/ˈwɜrkɪŋ/', 'Nhấn working, nhẹ âm from.', 'present continuous', 2),
  ('phrase_daily_02_03', 'topic_daily_open', 'I have a short break at noon.', 'Tôi nghỉ ngắn vào buổi trưa.', '/ʃɔrt breɪk/', 'Bật âm t trong short.', 'have + noun', 3),
  ('phrase_daily_02_04', 'topic_daily_open', 'What time do you finish?', 'Bạn kết thúc lúc mấy giờ?', '/wʌt taɪm/', 'Hạ giọng nhẹ ở finish.', 'do question', 4),
  ('phrase_daily_02_05', 'topic_daily_open', 'I finish around five thirty.', 'Tôi kết thúc khoảng năm rưỡi.', '/əˈraʊnd/', 'Nối finish around.', 'present simple', 5),
  ('phrase_daily_03_01', 'topic_daily_open', 'How much is this shirt?', 'Chiếc áo này bao nhiêu tiền?', '/haʊ mʌtʃ/', 'Âm ch trong much rõ.', 'how much', 1),
  ('phrase_daily_03_02', 'topic_daily_open', 'Do you have this in blue?', 'Bạn có mẫu này màu xanh không?', '/ɪn bluː/', 'Nối in blue.', 'do question', 2),
  ('phrase_daily_03_03', 'topic_daily_open', 'I would like a bowl of noodles.', 'Tôi muốn một bát mì.', '/wʊd laɪk/', 'Would like nói liền.', 'would like', 3),
  ('phrase_daily_03_04', 'topic_daily_open', 'Could I have the bill, please?', 'Cho tôi xin hóa đơn được không?', '/kəd aɪ hæv/', 'Could đọc nhẹ.', 'could request', 4),
  ('phrase_daily_03_05', 'topic_daily_open', 'Everything was delicious.', 'Mọi thứ rất ngon.', '/ˈɛvrɪθɪŋ/', 'Bật âm th trong everything.', 'past be', 5),
  ('phrase_daily_04_01', 'topic_daily_open', 'Excuse me, where is the station?', 'Xin lỗi, nhà ga ở đâu?', '/ɪkˈskjuːz mi/', 'Nhấn scuse.', 'where is', 1),
  ('phrase_daily_04_02', 'topic_daily_open', 'It is across from the bank.', 'Nó ở đối diện ngân hàng.', '/əˈkrɔs frəm/', 'Nối across from.', 'prepositions', 2),
  ('phrase_daily_04_03', 'topic_daily_open', 'Go straight for two blocks.', 'Đi thẳng hai dãy nhà.', '/ɡoʊ streɪt/', 'Âm t cuối straight rõ.', 'imperative', 3),
  ('phrase_daily_04_04', 'topic_daily_open', 'Turn left at the corner.', 'Rẽ trái ở góc đường.', '/tɜrn left/', 'Không nuốt t trong left.', 'imperative', 4),
  ('phrase_daily_04_05', 'topic_daily_open', 'Is it within walking distance?', 'Có thể đi bộ đến đó không?', '/ˈwɔkɪŋ/', 'Nhấn walking distance.', 'is question', 5),

  ('phrase_pron_01_01', 'topic_pronunciation_cc0', 'Please keep the lights on.', 'Vui lòng để đèn sáng.', '/pliːz kiːp/', 'Bật p cuối keep.', 'imperative', 1),
  ('phrase_pron_01_02', 'topic_pronunciation_cc0', 'I need to send the report.', 'Tôi cần gửi báo cáo.', '/niːd tə sɛnd/', 'Âm d trong need và send.', 'need to', 2),
  ('phrase_pron_01_03', 'topic_pronunciation_cc0', 'The bus stopped near the bridge.', 'Xe buýt dừng gần cây cầu.', '/stɑpt nɪr/', 'Bật p và t trong stopped.', 'past simple', 3),
  ('phrase_pron_01_04', 'topic_pronunciation_cc0', 'She asked for a glass of water.', 'Cô ấy xin một cốc nước.', '/æskt fər/', 'Cụm asked for có ba phụ âm cuối.', 'asked for', 4),
  ('phrase_pron_01_05', 'topic_pronunciation_cc0', 'I packed my bag last night.', 'Tôi đã đóng túi tối qua.', '/pækt maɪ/', 'Bật k trong packed.', 'past simple', 5),
  ('phrase_pron_02_01', 'topic_pronunciation_cc0', 'I can record a short message.', 'Tôi có thể thu một tin nhắn ngắn.', '/rɪˈkɔrd/', 'Danh từ record nhấn âm đầu.', 'can', 1),
  ('phrase_pron_02_02', 'topic_pronunciation_cc0', 'Please present your idea clearly.', 'Hãy trình bày ý tưởng rõ ràng.', '/prɪˈzɛnt/', 'Động từ present nhấn âm hai.', 'imperative', 2),
  ('phrase_pron_02_03', 'topic_pronunciation_cc0', 'The project will progress next week.', 'Dự án sẽ tiến triển tuần tới.', '/prəˈɡrɛs/', 'Động từ progress nhấn âm hai.', 'will', 3),
  ('phrase_pron_02_04', 'topic_pronunciation_cc0', 'We need a permit for this work.', 'Chúng tôi cần giấy phép cho việc này.', '/ˈpɜrmɪt/', 'Danh từ permit nhấn âm đầu.', 'need', 4),
  ('phrase_pron_02_05', 'topic_pronunciation_cc0', 'They will permit us to enter.', 'Họ sẽ cho phép chúng tôi vào.', '/pərˈmɪt/', 'Động từ permit nhấn âm hai.', 'will', 5),
  ('phrase_pron_03_01', 'topic_pronunciation_cc0', 'Can you open the window?', 'Bạn mở cửa sổ được không?', '/kən ju ˈoʊpən/', 'Nối can you.', 'can question', 1),
  ('phrase_pron_03_02', 'topic_pronunciation_cc0', 'I agree with your plan.', 'Tôi đồng ý với kế hoạch của bạn.', '/aɪ əˈɡriː/', 'Nối agree with.', 'agree with', 2),
  ('phrase_pron_03_03', 'topic_pronunciation_cc0', 'Take a look at this.', 'Hãy xem cái này.', '/teɪk ə lʊk/', 'Nối take a look.', 'imperative', 3),
  ('phrase_pron_03_04', 'topic_pronunciation_cc0', 'Could you send it again?', 'Bạn gửi lại được không?', '/kəd ju sɛnd/', 'Nối could you.', 'could question', 4),
  ('phrase_pron_03_05', 'topic_pronunciation_cc0', 'I will ask about it later.', 'Tôi sẽ hỏi về việc đó sau.', '/aɪl æsk əˈbaʊt/', 'Nối I will, ask about.', 'will', 5),
  ('phrase_pron_04_01', 'topic_pronunciation_cc0', 'Are you ready to begin?', 'Bạn sẵn sàng bắt đầu chưa?', '/ər ju ˈrɛdi/', 'Lên giọng ở cuối câu hỏi.', 'be question', 1),
  ('phrase_pron_04_02', 'topic_pronunciation_cc0', 'You finished already?', 'Bạn làm xong rồi à?', '/ju ˈfɪnɪʃt/', 'Lên giọng để thể hiện ngạc nhiên.', 'past simple', 2),
  ('phrase_pron_04_03', 'topic_pronunciation_cc0', 'That sounds like a good plan.', 'Nghe như một kế hoạch tốt.', '/ðaʔ saʊndz/', 'Hạ giọng ở plan.', 'sounds like', 3),
  ('phrase_pron_04_04', 'topic_pronunciation_cc0', 'Really, you did that?', 'Thật à, bạn đã làm vậy sao?', '/ˈrɪəli/', 'Lên giọng ở cuối để hỏi lại.', 'did question', 4),
  ('phrase_pron_04_05', 'topic_pronunciation_cc0', 'I see what you mean.', 'Tôi hiểu ý bạn.', '/aɪ siː/', 'Hạ giọng, thể hiện đồng cảm.', 'what-clause', 5),

  ('phrase_grammar_01_01', 'topic_grammar_open', 'I work with a small team.', 'Tôi làm việc với một nhóm nhỏ.', '/aɪ wɜrk/', 'Nhấn work và team.', 'present simple', 1),
  ('phrase_grammar_01_02', 'topic_grammar_open', 'I am learning English this month.', 'Tôi đang học tiếng Anh tháng này.', '/əm ˈlɜrnɪŋ/', 'Nối am learning.', 'present continuous', 2),
  ('phrase_grammar_01_03', 'topic_grammar_open', 'She does not drive to work.', 'Cô ấy không lái xe đi làm.', '/dəz nɑt draɪv/', 'Does not nói gọn nhưng rõ.', 'negative', 3),
  ('phrase_grammar_01_04', 'topic_grammar_open', 'Do they meet here every Friday?', 'Họ có gặp nhau ở đây thứ Sáu hàng tuần không?', '/du ðeɪ miːt/', 'Giữ trợ động từ do.', 'question', 4),
  ('phrase_grammar_01_05', 'topic_grammar_open', 'The shop opens at nine.', 'Cửa hàng mở lúc chín giờ.', '/ˈoʊpənz/', 'Thêm s ở opens.', 'third person', 5),
  ('phrase_grammar_02_01', 'topic_grammar_open', 'I visited my cousin last summer.', 'Tôi thăm anh họ mùa hè trước.', '/ˈvɪzɪtɪd/', 'Đuôi -ed đọc /ɪd/.', 'past simple', 1),
  ('phrase_grammar_02_02', 'topic_grammar_open', 'We took the early train.', 'Chúng tôi đi chuyến tàu sớm.', '/tʊk/', 'Take chuyển thành took.', 'irregular past', 2),
  ('phrase_grammar_02_03', 'topic_grammar_open', 'I had never tried it before.', 'Trước đây tôi chưa từng thử.', '/hæd ˈnɛvər/', 'Nhấn never và before.', 'past perfect', 3),
  ('phrase_grammar_02_04', 'topic_grammar_open', 'The meeting started after lunch.', 'Cuộc họp bắt đầu sau bữa trưa.', '/ˈstɑrtɪd/', 'Đuôi -ed rõ.', 'past simple', 4),
  ('phrase_grammar_02_05', 'topic_grammar_open', 'What did you learn from it?', 'Bạn học được gì từ việc đó?', '/wʌt dɪd ju/', 'Giữ did, động từ về nguyên mẫu.', 'did question', 5),
  ('phrase_grammar_03_01', 'topic_grammar_open', 'I am going to call her tonight.', 'Tối nay tôi sẽ gọi cô ấy.', '/əm ˈɡoʊɪŋ tə/', 'Nối going to.', 'going to', 1),
  ('phrase_grammar_03_02', 'topic_grammar_open', 'We will review the plan tomorrow.', 'Ngày mai chúng ta sẽ xem lại kế hoạch.', '/wɪl rɪˈvjuː/', 'Nhấn review.', 'will', 2),
  ('phrase_grammar_03_03', 'topic_grammar_open', 'I have decided to take a course.', 'Tôi đã quyết định học một khóa.', '/hæv dɪˈsaɪdɪd/', 'Nối decided to.', 'present perfect', 3),
  ('phrase_grammar_03_04', 'topic_grammar_open', 'Would you like to join us?', 'Bạn có muốn tham gia cùng chúng tôi không?', '/wʊd ju laɪk/', 'Would you lịch sự.', 'would like', 4),
  ('phrase_grammar_03_05', 'topic_grammar_open', 'I might change my schedule.', 'Có thể tôi sẽ đổi lịch.', '/maɪt tʃeɪndʒ/', 'Might chỉ khả năng.', 'modal', 5),
  ('phrase_grammar_04_01', 'topic_grammar_open', 'I think this option is practical.', 'Tôi nghĩ lựa chọn này thực tế.', '/aɪ θɪŋk/', 'Nêu ý kiến nhẹ nhàng.', 'think + clause', 1),
  ('phrase_grammar_04_02', 'topic_grammar_open', 'The main reason is the lower cost.', 'Lý do chính là chi phí thấp hơn.', '/meɪn ˈriːzən/', 'Nhấn main reason.', 'reason', 2),
  ('phrase_grammar_04_03', 'topic_grammar_open', 'However, we should check the risks.', 'Tuy nhiên, chúng ta nên kiểm tra rủi ro.', '/haʊˈɛvər/', 'Ngắt nhẹ sau however.', 'should', 3),
  ('phrase_grammar_04_04', 'topic_grammar_open', 'That is a fair point.', 'Đó là một ý kiến hợp lý.', '/ðæt ɪz/', 'Dùng để đồng ý lịch sự.', 'be + noun', 4),
  ('phrase_grammar_04_05', 'topic_grammar_open', 'I understand, but I see it differently.', 'Tôi hiểu, nhưng tôi nhìn khác.', '/ˌʌndərˈstænd/', 'Ngắt trước but.', 'contrast', 5),

  ('phrase_fluency_01_01', 'topic_fluency_open', 'My short answer is yes.', 'Câu trả lời ngắn của tôi là có.', '/maɪ ʃɔrt ˈænsər/', 'Mở đầu có cấu trúc.', 'be + noun', 1),
  ('phrase_fluency_01_02', 'topic_fluency_open', 'The main reason is that I enjoy learning.', 'Lý do chính là tôi thích học.', '/ðə meɪn ˈriːzən/', 'Dùng that để nối ý.', 'reason that', 2),
  ('phrase_fluency_01_03', 'topic_fluency_open', 'For example, I practice on my commute.', 'Ví dụ, tôi luyện tập khi đi làm.', '/fər ɪɡˈzæmpəl/', 'Ngắt sau for example.', 'for example', 3),
  ('phrase_fluency_01_04', 'topic_fluency_open', 'That is why this habit works for me.', 'Đó là lý do thói quen này hiệu quả với tôi.', '/ðæt ɪz waɪ/', 'Kết luận bằng that is why.', 'why-clause', 4),
  ('phrase_fluency_01_05', 'topic_fluency_open', 'Overall, I would recommend this approach.', 'Nhìn chung, tôi sẽ khuyên dùng cách này.', '/ˈoʊvərɔl/', 'Hạ giọng ở overall.', 'would recommend', 5),
  ('phrase_fluency_02_01', 'topic_fluency_open', 'The main issue is a lack of time.', 'Vấn đề chính là thiếu thời gian.', '/ðə meɪn ˈɪʃu/', 'Nêu vấn đề trực tiếp.', 'issue is', 1),
  ('phrase_fluency_02_02', 'topic_fluency_open', 'We could solve it by sharing the work.', 'Chúng ta có thể giải quyết bằng cách chia việc.', '/kəd sɑlv ɪt/', 'Nối could solve.', 'could + by', 2),
  ('phrase_fluency_02_03', 'topic_fluency_open', 'If that does not work, we can ask for help.', 'Nếu cách đó không được, ta có thể nhờ giúp.', '/ɪf ðæt dəz nɑt/', 'Ngắt sau work.', 'first conditional', 3),
  ('phrase_fluency_02_04', 'topic_fluency_open', 'I would start with the simplest step.', 'Tôi sẽ bắt đầu với bước đơn giản nhất.', '/aɪd stɑrt/', 'Would thể hiện đề xuất.', 'would', 4),
  ('phrase_fluency_02_05', 'topic_fluency_open', 'Then I would measure the result.', 'Sau đó tôi sẽ đo kết quả.', '/ðɛn aɪd/', 'Nối then I would.', 'would', 5),
  ('phrase_fluency_03_01', 'topic_fluency_open', 'I have three years of project experience.', 'Tôi có ba năm kinh nghiệm dự án.', '/hæv θriː jɪrz/', 'Nhấn years và experience.', 'present perfect', 1),
  ('phrase_fluency_03_02', 'topic_fluency_open', 'My strength is turning plans into action.', 'Điểm mạnh của tôi là biến kế hoạch thành hành động.', '/maɪ strɛŋθ/', 'Bật âm th trong strength.', 'gerund', 2),
  ('phrase_fluency_03_03', 'topic_fluency_open', 'I learned to communicate across teams.', 'Tôi học cách giao tiếp giữa các nhóm.', '/aɪ lɜrnd tə/', 'Nối learned to.', 'learned to', 3),
  ('phrase_fluency_03_04', 'topic_fluency_open', 'I am looking for a role where I can grow.', 'Tôi tìm một vai trò để phát triển.', '/aɪ əm ˈlʊkɪŋ/', 'Nhấn looking và grow.', 'relative where', 4),
  ('phrase_fluency_03_05', 'topic_fluency_open', 'I would be happy to discuss the next step.', 'Tôi sẵn lòng trao đổi bước tiếp theo.', '/aɪd bi ˈhæpi/', 'Câu kết phỏng vấn lịch sự.', 'would be', 5),
  ('phrase_fluency_04_01', 'topic_fluency_open', 'Could you clarify what you mean?', 'Bạn làm rõ ý bạn được không?', '/kəd ju ˈklærəfaɪ/', 'Câu hỏi làm rõ lịch sự.', 'could you', 1),
  ('phrase_fluency_04_02', 'topic_fluency_open', 'Let me think about that for a moment.', 'Cho tôi suy nghĩ một lát.', '/lɛt mi θɪŋk/', 'Câu giờ tự nhiên.', 'let me', 2),
  ('phrase_fluency_04_03', 'topic_fluency_open', 'That is an interesting question.', 'Đó là một câu hỏi thú vị.', '/ˈɪntrəstɪŋ/', 'Dùng để mở câu trả lời.', 'adjective', 3),
  ('phrase_fluency_04_04', 'topic_fluency_open', 'There are two ways to look at it.', 'Có hai cách nhìn việc đó.', '/ðer ər tuː/', 'Mở rộng câu trả lời.', 'there are', 4),
  ('phrase_fluency_04_05', 'topic_fluency_open', 'Let me give you a concrete example.', 'Để tôi đưa một ví dụ cụ thể.', '/lɛt mi ɡɪv ju/', 'Nối give you.', 'let me', 5);

INSERT OR IGNORE INTO content_phrases (id, topic_id, english, vietnamese_hint, phonetic_hint, audio_tip, focus_grammar, source_id, phrase_order)
  SELECT id, topic_id, english, vietnamese_hint, phonetic_hint, audio_tip, focus_grammar, 'english-app-curated', phrase_order
  FROM curriculum_phrase_seed;
DROP TABLE curriculum_phrase_seed;

INSERT OR IGNORE INTO lesson_phrases (lesson_id, phrase_id, phrase_order) VALUES
  ('lesson_daily_01', 'phrase_daily_01_01', 1), ('lesson_daily_01', 'phrase_daily_01_02', 2), ('lesson_daily_01', 'phrase_daily_01_03', 3), ('lesson_daily_01', 'phrase_daily_01_04', 4), ('lesson_daily_01', 'phrase_daily_01_05', 5),
  ('lesson_daily_02', 'phrase_daily_02_01', 1), ('lesson_daily_02', 'phrase_daily_02_02', 2), ('lesson_daily_02', 'phrase_daily_02_03', 3), ('lesson_daily_02', 'phrase_daily_02_04', 4), ('lesson_daily_02', 'phrase_daily_02_05', 5),
  ('lesson_daily_03', 'phrase_daily_03_01', 1), ('lesson_daily_03', 'phrase_daily_03_02', 2), ('lesson_daily_03', 'phrase_daily_03_03', 3), ('lesson_daily_03', 'phrase_daily_03_04', 4), ('lesson_daily_03', 'phrase_daily_03_05', 5),
  ('lesson_daily_04', 'phrase_daily_04_01', 1), ('lesson_daily_04', 'phrase_daily_04_02', 2), ('lesson_daily_04', 'phrase_daily_04_03', 3), ('lesson_daily_04', 'phrase_daily_04_04', 4), ('lesson_daily_04', 'phrase_daily_04_05', 5),
  ('lesson_pron_01', 'phrase_pron_01_01', 1), ('lesson_pron_01', 'phrase_pron_01_02', 2), ('lesson_pron_01', 'phrase_pron_01_03', 3), ('lesson_pron_01', 'phrase_pron_01_04', 4), ('lesson_pron_01', 'phrase_pron_01_05', 5),
  ('lesson_pron_02', 'phrase_pron_02_01', 1), ('lesson_pron_02', 'phrase_pron_02_02', 2), ('lesson_pron_02', 'phrase_pron_02_03', 3), ('lesson_pron_02', 'phrase_pron_02_04', 4), ('lesson_pron_02', 'phrase_pron_02_05', 5),
  ('lesson_pron_03', 'phrase_pron_03_01', 1), ('lesson_pron_03', 'phrase_pron_03_02', 2), ('lesson_pron_03', 'phrase_pron_03_03', 3), ('lesson_pron_03', 'phrase_pron_03_04', 4), ('lesson_pron_03', 'phrase_pron_03_05', 5),
  ('lesson_pron_04', 'phrase_pron_04_01', 1), ('lesson_pron_04', 'phrase_pron_04_02', 2), ('lesson_pron_04', 'phrase_pron_04_03', 3), ('lesson_pron_04', 'phrase_pron_04_04', 4), ('lesson_pron_04', 'phrase_pron_04_05', 5),
  ('lesson_grammar_01', 'phrase_grammar_01_01', 1), ('lesson_grammar_01', 'phrase_grammar_01_02', 2), ('lesson_grammar_01', 'phrase_grammar_01_03', 3), ('lesson_grammar_01', 'phrase_grammar_01_04', 4), ('lesson_grammar_01', 'phrase_grammar_01_05', 5),
  ('lesson_grammar_02', 'phrase_grammar_02_01', 1), ('lesson_grammar_02', 'phrase_grammar_02_02', 2), ('lesson_grammar_02', 'phrase_grammar_02_03', 3), ('lesson_grammar_02', 'phrase_grammar_02_04', 4), ('lesson_grammar_02', 'phrase_grammar_02_05', 5),
  ('lesson_grammar_03', 'phrase_grammar_03_01', 1), ('lesson_grammar_03', 'phrase_grammar_03_02', 2), ('lesson_grammar_03', 'phrase_grammar_03_03', 3), ('lesson_grammar_03', 'phrase_grammar_03_04', 4), ('lesson_grammar_03', 'phrase_grammar_03_05', 5),
  ('lesson_grammar_04', 'phrase_grammar_04_01', 1), ('lesson_grammar_04', 'phrase_grammar_04_02', 2), ('lesson_grammar_04', 'phrase_grammar_04_03', 3), ('lesson_grammar_04', 'phrase_grammar_04_04', 4), ('lesson_grammar_04', 'phrase_grammar_04_05', 5),
  ('lesson_fluency_01', 'phrase_fluency_01_01', 1), ('lesson_fluency_01', 'phrase_fluency_01_02', 2), ('lesson_fluency_01', 'phrase_fluency_01_03', 3), ('lesson_fluency_01', 'phrase_fluency_01_04', 4), ('lesson_fluency_01', 'phrase_fluency_01_05', 5),
  ('lesson_fluency_02', 'phrase_fluency_02_01', 1), ('lesson_fluency_02', 'phrase_fluency_02_02', 2), ('lesson_fluency_02', 'phrase_fluency_02_03', 3), ('lesson_fluency_02', 'phrase_fluency_02_04', 4), ('lesson_fluency_02', 'phrase_fluency_02_05', 5),
  ('lesson_fluency_03', 'phrase_fluency_03_01', 1), ('lesson_fluency_03', 'phrase_fluency_03_02', 2), ('lesson_fluency_03', 'phrase_fluency_03_03', 3), ('lesson_fluency_03', 'phrase_fluency_03_04', 4), ('lesson_fluency_03', 'phrase_fluency_03_05', 5),
  ('lesson_fluency_04', 'phrase_fluency_04_01', 1), ('lesson_fluency_04', 'phrase_fluency_04_02', 2), ('lesson_fluency_04', 'phrase_fluency_04_03', 3), ('lesson_fluency_04', 'phrase_fluency_04_04', 4), ('lesson_fluency_04', 'phrase_fluency_04_05', 5);

-- Keep the original topic picker backward-compatible while it moves to the new path.
INSERT OR IGNORE INTO lesson_phrases (lesson_id, phrase_id, phrase_order) VALUES
  ('lesson_daily_01', 'phrase_daily_plan', 6), ('lesson_daily_01', 'phrase_daily_weekend', 7), ('lesson_daily_01', 'phrase_daily_goal', 8),
  ('lesson_pron_01', 'phrase_pronunciation_zoo', 6), ('lesson_pron_01', 'phrase_pronunciation_sit', 7), ('lesson_pron_01', 'phrase_pronunciation_tea', 8),
  ('lesson_grammar_01', 'phrase_grammar_lived', 6), ('lesson_grammar_01', 'phrase_grammar_condition', 7), ('lesson_grammar_01', 'phrase_grammar_question', 8),
  ('lesson_fluency_01', 'phrase_fluency_perspective', 6), ('lesson_fluency_01', 'phrase_fluency_balance', 7), ('lesson_fluency_01', 'phrase_fluency_question', 8);

INSERT OR IGNORE INTO content_vocabulary (id, lesson_id, word, ipa, meaning, example) VALUES
  ('v_daily_01_1', 'lesson_daily_01', 'introduce', '/ˌɪntrəˈduːs/', 'giới thiệu', 'Let me introduce myself.'),
  ('v_daily_01_2', 'lesson_daily_01', 'usually', '/ˈjuːʒuəli/', 'thường xuyên', 'I usually walk to work.'),
  ('v_daily_01_3', 'lesson_daily_01', 'hometown', '/ˈhoʊmtaʊn/', 'quê nhà', 'My hometown is near the sea.'),
  ('v_daily_02_1', 'lesson_daily_02', 'routine', '/ruːˈtiːn/', 'thói quen', 'This is my morning routine.'),
  ('v_daily_02_2', 'lesson_daily_02', 'break', '/breɪk/', 'giờ nghỉ', 'I take a short break.'),
  ('v_daily_02_3', 'lesson_daily_02', 'finish', '/ˈfɪnɪʃ/', 'kết thúc', 'When do you finish work?'),
  ('v_daily_03_1', 'lesson_daily_03', 'price', '/praɪs/', 'giá', 'The price is reasonable.'),
  ('v_daily_03_2', 'lesson_daily_03', 'order', '/ˈɔrdər/', 'gọi món / đơn hàng', 'I would like to order lunch.'),
  ('v_daily_03_3', 'lesson_daily_03', 'delicious', '/dɪˈlɪʃəs/', 'ngon', 'The soup is delicious.'),
  ('v_daily_04_1', 'lesson_daily_04', 'station', '/ˈsteɪʃən/', 'nhà ga', 'The station is close.'),
  ('v_daily_04_2', 'lesson_daily_04', 'across', '/əˈkrɔs/', 'đối diện / ngang qua', 'The bank is across the road.'),
  ('v_daily_04_3', 'lesson_daily_04', 'corner', '/ˈkɔrnər/', 'góc đường', 'Turn right at the corner.'),
  ('v_pron_01_1', 'lesson_pron_01', 'lights', '/laɪts/', 'đèn', 'Please turn off the lights.'),
  ('v_pron_01_2', 'lesson_pron_01', 'report', '/rɪˈpɔrt/', 'báo cáo', 'I sent the report.'),
  ('v_pron_01_3', 'lesson_pron_01', 'bridge', '/brɪdʒ/', 'cây cầu', 'We crossed the bridge.'),
  ('v_pron_02_1', 'lesson_pron_02', 'record', '/ˈrɛkərd/', 'bản ghi', 'I saved the record.'),
  ('v_pron_02_2', 'lesson_pron_02', 'present', '/prɪˈzɛnt/', 'trình bày', 'Please present your idea.'),
  ('v_pron_02_3', 'lesson_pron_02', 'permit', '/ˈpɜrmɪt/', 'giấy phép', 'We need a permit.'),
  ('v_pron_03_1', 'lesson_pron_03', 'agree', '/əˈɡriː/', 'đồng ý', 'I agree with you.'),
  ('v_pron_03_2', 'lesson_pron_03', 'again', '/əˈɡɛn/', 'lại lần nữa', 'Could you say that again?'),
  ('v_pron_03_3', 'lesson_pron_03', 'later', '/ˈleɪtər/', 'sau', 'I will call later.'),
  ('v_pron_04_1', 'lesson_pron_04', 'ready', '/ˈrɛdi/', 'sẵn sàng', 'Are you ready?'),
  ('v_pron_04_2', 'lesson_pron_04', 'already', '/ɔlˈrɛdi/', 'đã rồi', 'She has already left.'),
  ('v_pron_04_3', 'lesson_pron_04', 'meaning', '/ˈmiːnɪŋ/', 'ý nghĩa', 'I understand your meaning.'),
  ('v_grammar_01_1', 'lesson_grammar_01', 'habit', '/ˈhæbɪt/', 'thói quen', 'Reading is a good habit.'),
  ('v_grammar_01_2', 'lesson_grammar_01', 'currently', '/ˈkɜrəntli/', 'hiện tại', 'I am currently studying.'),
  ('v_grammar_01_3', 'lesson_grammar_01', 'weekday', '/ˈwiːkdeɪ/', 'ngày trong tuần', 'I work on weekdays.'),
  ('v_grammar_02_1', 'lesson_grammar_02', 'experience', '/ɪkˈspɪriəns/', 'trải nghiệm', 'It was a useful experience.'),
  ('v_grammar_02_2', 'lesson_grammar_02', 'early', '/ˈɜrli/', 'sớm', 'We caught an early train.'),
  ('v_grammar_02_3', 'lesson_grammar_02', 'before', '/bɪˈfɔr/', 'trước đây', 'I had seen it before.'),
  ('v_grammar_03_1', 'lesson_grammar_03', 'decide', '/dɪˈsaɪd/', 'quyết định', 'I decided to join.'),
  ('v_grammar_03_2', 'lesson_grammar_03', 'schedule', '/ˈskɛdʒuːl/', 'lịch trình', 'My schedule is busy.'),
  ('v_grammar_03_3', 'lesson_grammar_03', 'course', '/kɔrs/', 'khóa học', 'She joined a course.'),
  ('v_grammar_04_1', 'lesson_grammar_04', 'practical', '/ˈpræktɪkəl/', 'thực tế', 'This is a practical idea.'),
  ('v_grammar_04_2', 'lesson_grammar_04', 'reason', '/ˈriːzən/', 'lý do', 'What is the reason?'),
  ('v_grammar_04_3', 'lesson_grammar_04', 'differently', '/ˈdɪfərəntli/', 'khác đi', 'I see it differently.'),
  ('v_fluency_01_1', 'lesson_fluency_01', 'overall', '/ˈoʊvərɔl/', 'nhìn chung', 'Overall, it went well.'),
  ('v_fluency_01_2', 'lesson_fluency_01', 'approach', '/əˈproʊtʃ/', 'cách tiếp cận', 'This approach is simple.'),
  ('v_fluency_01_3', 'lesson_fluency_01', 'recommend', '/ˌrɛkəˈmɛnd/', 'khuyên dùng', 'I recommend this book.'),
  ('v_fluency_02_1', 'lesson_fluency_02', 'issue', '/ˈɪʃuː/', 'vấn đề', 'We need to solve the issue.'),
  ('v_fluency_02_2', 'lesson_fluency_02', 'measure', '/ˈmɛʒər/', 'đo lường', 'We measure the result.'),
  ('v_fluency_02_3', 'lesson_fluency_02', 'simplest', '/ˈsɪmpləst/', 'đơn giản nhất', 'Start with the simplest step.'),
  ('v_fluency_03_1', 'lesson_fluency_03', 'strength', '/strɛŋθ/', 'điểm mạnh', 'Communication is my strength.'),
  ('v_fluency_03_2', 'lesson_fluency_03', 'role', '/roʊl/', 'vai trò', 'I understand the role.'),
  ('v_fluency_03_3', 'lesson_fluency_03', 'grow', '/ɡroʊ/', 'phát triển', 'I want to grow here.'),
  ('v_fluency_04_1', 'lesson_fluency_04', 'clarify', '/ˈklærəfaɪ/', 'làm rõ', 'Could you clarify that?'),
  ('v_fluency_04_2', 'lesson_fluency_04', 'concrete', '/ˈkɑnkriːt/', 'cụ thể', 'Give a concrete example.'),
  ('v_fluency_04_3', 'lesson_fluency_04', 'moment', '/ˈmoʊmənt/', 'một lát', 'Just a moment, please.');
