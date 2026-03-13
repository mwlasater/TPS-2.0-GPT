CREATE TABLE IF NOT EXISTS shared.job_profile (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  title TEXT NOT NULL,
  department TEXT NOT NULL,
  minimum_headcount INTEGER NOT NULL DEFAULT 1,
  relief_required BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS shared.attendance_exception (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  employee_name TEXT NOT NULL,
  exception_type TEXT NOT NULL,
  start_date DATE NOT NULL,
  status TEXT NOT NULL,
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.file_service_item (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  file_name TEXT NOT NULL,
  category TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.notification_template (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  channel TEXT NOT NULL,
  template_name TEXT NOT NULL,
  recipient_group TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS shared.power_bi_embed (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  report_name TEXT NOT NULL,
  workspace_name TEXT NOT NULL,
  embed_url TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

