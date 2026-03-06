CREATE TABLE IF NOT EXISTS shared.property_settings (
  railroad_code TEXT PRIMARY KEY REFERENCES shared.railroad(code),
  support_email TEXT NOT NULL,
  timezone_name TEXT NOT NULL,
  primary_color TEXT NOT NULL,
  logo_mode TEXT NOT NULL,
  power_bi_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  file_uploads_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  cmms_enabled BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS shared.train_schedule (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  train_number TEXT NOT NULL,
  route_name TEXT NOT NULL,
  direction TEXT NOT NULL,
  service_days TEXT[] NOT NULL DEFAULT '{}',
  stop_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shared.train_run (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  schedule_id TEXT NOT NULL REFERENCES shared.train_schedule(id),
  operating_date DATE NOT NULL,
  status TEXT NOT NULL,
  delay_minutes INTEGER NOT NULL DEFAULT 0,
  crew_assigned INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shared.station_stop (
  id TEXT PRIMARY KEY,
  train_run_id TEXT NOT NULL REFERENCES shared.train_run(id),
  station_code TEXT NOT NULL,
  stop_sequence INTEGER NOT NULL,
  scheduled_time TEXT NOT NULL,
  actual_time TEXT,
  boardings INTEGER NOT NULL DEFAULT 0,
  alightings INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shared.delay_event (
  id TEXT PRIMARY KEY,
  train_run_id TEXT NOT NULL REFERENCES shared.train_run(id),
  category TEXT NOT NULL,
  minutes INTEGER NOT NULL DEFAULT 0,
  notes TEXT NOT NULL,
  reported_at TIMESTAMPTZ NOT NULL
);

