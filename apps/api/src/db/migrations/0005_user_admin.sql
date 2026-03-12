ALTER TABLE shared.user_account
  ADD COLUMN IF NOT EXISTS role_label TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_action_text TEXT NOT NULL DEFAULT '';

ALTER TABLE shared.permission_group
  ADD COLUMN IF NOT EXISTS permissions TEXT[] NOT NULL DEFAULT '{}';

CREATE UNIQUE INDEX IF NOT EXISTS permission_group_railroad_name_idx
  ON shared.permission_group (railroad_code, name);

CREATE TABLE IF NOT EXISTS shared.user_permission_group (
  user_id TEXT NOT NULL REFERENCES shared.user_account(id),
  permission_group_id BIGINT NOT NULL REFERENCES shared.permission_group(id),
  PRIMARY KEY (user_id, permission_group_id)
);
