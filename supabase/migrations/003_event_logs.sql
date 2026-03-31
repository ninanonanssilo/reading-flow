-- 기존 sessions 테이블에 이벤트 로그 컬럼 추가
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS event_logs JSONB DEFAULT '[]'::jsonb;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS screen_durations JSONB DEFAULT '{}'::jsonb;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS srl_distribution JSONB DEFAULT '{}'::jsonb;
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS event_session_id TEXT;
