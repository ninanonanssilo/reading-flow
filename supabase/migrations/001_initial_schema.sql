-- 교사 테이블
CREATE TABLE teachers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 학급 테이블
CREATE TABLE classrooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  school_year INT DEFAULT 2026,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 학생 테이블
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  classroom_id UUID NOT NULL REFERENCES classrooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pin TEXT NOT NULL,
  level INT DEFAULT 1,
  total_sessions INT DEFAULT 0,
  total_stars INT DEFAULT 0,
  badges JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(classroom_id, pin)
);

-- 세션(읽기 기록) 테이블
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  passage_id TEXT NOT NULL,
  goal_type TEXT NOT NULL,
  confidence INT NOT NULL,
  transcript TEXT DEFAULT '',
  accuracy NUMERIC(5,2) NOT NULL,
  cwpm NUMERIC(5,1) NOT NULL,
  prosody NUMERIC(5,2) DEFAULT 0,
  error_counts JSONB NOT NULL,
  word_mappings JSONB NOT NULL,
  self_rating INT,
  felt_difficulty BOOLEAN,
  scaffold_data JSONB,
  hhair_level TEXT DEFAULT 'ai-adjusted',
  reading_started_at TIMESTAMPTZ,
  reading_ended_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  audio_url TEXT,
  teacher_memo TEXT DEFAULT ''
);

-- 오류 재분류 이력
CREATE TABLE error_reclassifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  word_index INT NOT NULL,
  original_type TEXT NOT NULL,
  reclassified_type TEXT NOT NULL,
  reclassified_by UUID NOT NULL REFERENCES teachers(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_sessions_student ON sessions(student_id);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX idx_students_classroom ON students(classroom_id);
CREATE INDEX idx_reclassifications_session ON error_reclassifications(session_id);

-- Atomic 업데이트 RPC
CREATE OR REPLACE FUNCTION increment_student_stats(
  p_student_id UUID,
  p_stars INT,
  p_new_level INT
) RETURNS void AS $$
BEGIN
  UPDATE students
  SET
    total_sessions = total_sessions + 1,
    total_stars = total_stars + p_stars,
    level = GREATEST(level, p_new_level)
  WHERE id = p_student_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
