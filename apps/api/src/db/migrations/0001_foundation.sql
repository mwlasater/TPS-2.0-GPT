CREATE SCHEMA IF NOT EXISTS shared;

CREATE TABLE IF NOT EXISTS shared.railroad (
  id BIGSERIAL PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  schema_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  profile TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared.user_account (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shared.user_property_access (
  user_id TEXT NOT NULL REFERENCES shared.user_account(id),
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  PRIMARY KEY (user_id, railroad_code)
);

CREATE TABLE IF NOT EXISTS shared.permission_group (
  id BIGSERIAL PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  name TEXT NOT NULL,
  description TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS shared.report_config (
  id BIGSERIAL PRIMARY KEY,
  railroad_code TEXT NOT NULL REFERENCES shared.railroad(code),
  report_name TEXT NOT NULL,
  audience TEXT NOT NULL,
  embed_enabled BOOLEAN NOT NULL DEFAULT FALSE,
  schedule_text TEXT NOT NULL
);

