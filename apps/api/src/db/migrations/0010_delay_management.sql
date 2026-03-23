CREATE TABLE IF NOT EXISTS shared.delay_common_location (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  location_label TEXT NOT NULL,
  usage_count INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS shared.special_movement (
  id TEXT PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  movement_label TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.delay_additional_info (
  delay_id TEXT PRIMARY KEY REFERENCES shared.delay_event(id) ON DELETE CASCADE,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  location_detail TEXT NOT NULL DEFAULT '',
  responsible_party TEXT NOT NULL DEFAULT '',
  notable_delay_type TEXT NOT NULL DEFAULT '',
  special_movement_id TEXT REFERENCES shared.special_movement(id),
  work_order_id TEXT,
  mechanical_notes TEXT NOT NULL DEFAULT '',
  passenger_impact_summary TEXT NOT NULL DEFAULT ''
);
