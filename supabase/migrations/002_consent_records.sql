CREATE TABLE IF NOT EXISTS consent_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  required_data BOOLEAN NOT NULL,
  audio_recording BOOLEAN NOT NULL DEFAULT false,
  event_logging BOOLEAN NOT NULL DEFAULT false,
  parent_name TEXT NOT NULL,
  parent_relation TEXT NOT NULL,
  consent_date DATE NOT NULL,
  student_confirmed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_consent_student ON consent_records(student_id);
ALTER TABLE consent_records ENABLE ROW LEVEL SECURITY;
