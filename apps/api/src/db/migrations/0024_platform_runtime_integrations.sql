CREATE TABLE IF NOT EXISTS shared.power_bi_session (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  report_id TEXT NOT NULL REFERENCES shared.power_bi_embed(id) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  access_token TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS power_bi_session_railroad_requested_idx
  ON shared.power_bi_session (railroad_code, requested_at DESC);

CREATE TABLE IF NOT EXISTS shared.cmms_sync_job (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  work_order_id TEXT NOT NULL,
  asset_id TEXT,
  status TEXT NOT NULL CHECK (status IN ('queued', 'synced', 'failed')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS cmms_sync_job_railroad_requested_idx
  ON shared.cmms_sync_job (railroad_code, requested_at DESC);
