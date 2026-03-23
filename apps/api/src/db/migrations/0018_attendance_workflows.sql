ALTER TABLE shared.attendance_exception
ADD COLUMN IF NOT EXISTS employee_id TEXT,
ADD COLUMN IF NOT EXISTS end_date DATE;

CREATE TABLE IF NOT EXISTS shared.attendance_notification_rule (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  issue_type TEXT NOT NULL,
  trigger_status TEXT NOT NULL,
  recipient_group TEXT NOT NULL,
  template_name TEXT NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE INDEX IF NOT EXISTS attendance_exception_railroad_employee_idx
  ON shared.attendance_exception (railroad_code, employee_id, start_date DESC);

CREATE INDEX IF NOT EXISTS attendance_notification_rule_railroad_idx
  ON shared.attendance_notification_rule (railroad_code, issue_type);
