CREATE TABLE IF NOT EXISTS shared.reference_delay_reason (
  id BIGSERIAL PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  reason_text TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.reference_crew_role (
  id BIGSERIAL PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  role_name TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.reference_station_code (
  id BIGSERIAL PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  station_code TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.user_admin_action (
  id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  style TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0
);
