ALTER TABLE shared.report_delivery_request
ADD COLUMN IF NOT EXISTS retry_count INTEGER NOT NULL DEFAULT 0;

ALTER TABLE shared.report_delivery_request
ADD COLUMN IF NOT EXISTS last_retried_at TIMESTAMPTZ;

CREATE TABLE IF NOT EXISTS shared.live_report_execution (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  report_id TEXT NOT NULL,
  report_name TEXT NOT NULL,
  execution_format TEXT NOT NULL CHECK (execution_format IN ('interactive', 'pdf', 'xlsx')),
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('view', 'download', 'email')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ready', 'generated', 'sent')),
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  executed_by TEXT NOT NULL,
  filters_summary TEXT NOT NULL,
  notes TEXT NOT NULL,
  linked_delivery_id TEXT
);

CREATE INDEX IF NOT EXISTS live_report_execution_railroad_idx
  ON shared.live_report_execution (railroad_code, executed_at DESC);
