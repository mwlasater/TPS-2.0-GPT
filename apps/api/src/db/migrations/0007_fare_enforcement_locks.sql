ALTER TABLE shared.train_run
ADD COLUMN IF NOT EXISTS is_approved BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE shared.train_run
ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

UPDATE shared.train_run
SET
  is_approved = status = 'approved',
  approved_at = CASE
    WHEN status = 'approved' AND approved_at IS NULL THEN NOW()
    ELSE approved_at
  END
WHERE is_approved = FALSE OR approved_at IS NULL;

CREATE TABLE IF NOT EXISTS shared.fare_enforcement (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  train_run_id TEXT NOT NULL REFERENCES shared.train_run(id),
  inspector_name TEXT NOT NULL,
  first_location TEXT NOT NULL,
  second_location TEXT NOT NULL,
  activity_count INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL DEFAULT '',
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS fare_enforcement_run_idx
ON shared.fare_enforcement (train_run_id, captured_at);
