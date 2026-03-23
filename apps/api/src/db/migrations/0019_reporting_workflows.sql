CREATE TABLE IF NOT EXISTS shared.report_preference (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  report_name TEXT NOT NULL,
  visible_columns TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  sort_order TEXT NOT NULL,
  filters_summary TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.scheduled_report_email_job (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  report_name TEXT NOT NULL,
  recipient_group TEXT NOT NULL,
  schedule_text TEXT NOT NULL,
  delivery_format TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS report_preference_railroad_idx
  ON shared.report_preference (railroad_code, report_name);

CREATE INDEX IF NOT EXISTS scheduled_report_email_job_railroad_idx
  ON shared.scheduled_report_email_job (railroad_code, report_name);
