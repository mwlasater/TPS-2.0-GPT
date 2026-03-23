CREATE TABLE IF NOT EXISTS shared.passenger_report_import (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  import_name TEXT NOT NULL,
  source_file_name TEXT NOT NULL,
  imported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  imported_by TEXT NOT NULL,
  operating_date DATE NOT NULL,
  row_count INTEGER NOT NULL CHECK (row_count > 0),
  status TEXT NOT NULL CHECK (status IN ('processed', 'warning')),
  notes TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.notable_delay_type (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code) ON DELETE CASCADE,
  delay_type_label TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('mechanical', 'traffic', 'operations', 'passenger')),
  requires_work_order BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE UNIQUE INDEX IF NOT EXISTS notable_delay_type_railroad_label_idx
  ON shared.notable_delay_type (railroad_code, delay_type_label);

CREATE TABLE IF NOT EXISTS shared.delay_work_order (
  delay_id TEXT PRIMARY KEY REFERENCES shared.delay_event(id) ON DELETE CASCADE,
  work_order_id TEXT NOT NULL,
  notable_delay_type TEXT NOT NULL,
  asset_id TEXT,
  repair_type TEXT NOT NULL,
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high')),
  status TEXT NOT NULL CHECK (status IN ('open', 'scheduled', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_by TEXT NOT NULL
);
