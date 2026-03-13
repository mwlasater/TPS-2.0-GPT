CREATE TABLE IF NOT EXISTS shared.train_run_approval_history (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  train_run_id TEXT NOT NULL REFERENCES shared.train_run(id),
  action TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  notes TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS train_run_approval_history_run_idx
ON shared.train_run_approval_history (train_run_id, created_at DESC);
