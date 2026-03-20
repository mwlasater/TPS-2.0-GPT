ALTER TABLE shared.train_run
ADD COLUMN IF NOT EXISTS status_comment TEXT NOT NULL DEFAULT '',
ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS status_updated_by TEXT;

CREATE TABLE IF NOT EXISTS shared.train_run_event_history (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  train_run_id TEXT NOT NULL,
  action TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_train_run_event_history_lookup
  ON shared.train_run_event_history (railroad_code, train_run_id, created_at DESC);
