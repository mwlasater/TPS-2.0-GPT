CREATE TABLE IF NOT EXISTS shared.fare_enforcement_history (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  fare_record_id TEXT NOT NULL,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  actor_name TEXT NOT NULL,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fare_enforcement_history_record_idx
ON shared.fare_enforcement_history (railroad_code, fare_record_id, created_at DESC);
