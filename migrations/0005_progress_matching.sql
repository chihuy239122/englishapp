-- Record whether a completed spoken turn matched its target phrase and when it should be reviewed again.
ALTER TABLE user_progress ADD COLUMN matched_practices INTEGER NOT NULL DEFAULT 0;
ALTER TABLE user_progress ADD COLUMN next_review_at INTEGER;
ALTER TABLE turns ADD COLUMN phrase_match_score REAL;

CREATE INDEX idx_user_progress_review ON user_progress(user_id, next_review_at);
