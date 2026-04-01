ALTER TABLE sessions ADD COLUMN IF NOT EXISTS adjusted_accuracy NUMERIC(5,2);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS adjusted_cwpm NUMERIC(5,1);
ALTER TABLE sessions ADD COLUMN IF NOT EXISTS adjusted_error_counts JSONB;
