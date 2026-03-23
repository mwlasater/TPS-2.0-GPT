CREATE TABLE IF NOT EXISTS shared.report_delivery_request (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  report_name TEXT NOT NULL,
  delivery_format TEXT NOT NULL CHECK (delivery_format IN ('pdf', 'xlsx')),
  delivery_mode TEXT NOT NULL CHECK (delivery_mode IN ('download', 'email')),
  recipient TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('queued', 'generated', 'sent')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  requested_by TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS report_delivery_request_railroad_idx
  ON shared.report_delivery_request (railroad_code, requested_at DESC);
