CREATE TABLE IF NOT EXISTS shared.consist_template (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  template_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.consist_template_item (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES shared.consist_template(id) ON DELETE CASCADE,
  equipment_number TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  position_index INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.crew_template (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  template_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.crew_template_item (
  id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL REFERENCES shared.crew_template(id) ON DELETE CASCADE,
  employee_name TEXT NOT NULL,
  role_name TEXT NOT NULL,
  on_duty_time TEXT NOT NULL,
  status TEXT NOT NULL
);
