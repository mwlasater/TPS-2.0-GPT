CREATE TABLE IF NOT EXISTS shared.personnel_record (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL,
  employee_id TEXT NOT NULL,
  employee_name TEXT NOT NULL,
  status TEXT NOT NULL,
  primary_role TEXT NOT NULL,
  certifications TEXT[] NOT NULL DEFAULT '{}'
);

CREATE INDEX IF NOT EXISTS personnel_record_railroad_idx
  ON shared.personnel_record (railroad_code, employee_name);
