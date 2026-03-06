CREATE TABLE IF NOT EXISTS shared.consist_equipment (
  id TEXT PRIMARY KEY,
  train_run_id TEXT NOT NULL REFERENCES shared.train_run(id),
  equipment_number TEXT NOT NULL,
  equipment_type TEXT NOT NULL,
  position_index INTEGER NOT NULL,
  status TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.crew_assignment (
  id TEXT PRIMARY KEY,
  train_run_id TEXT NOT NULL REFERENCES shared.train_run(id),
  employee_name TEXT NOT NULL,
  role_name TEXT NOT NULL,
  on_duty_time TEXT NOT NULL,
  status TEXT NOT NULL
);
