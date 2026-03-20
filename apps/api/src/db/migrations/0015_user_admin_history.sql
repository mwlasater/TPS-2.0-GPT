CREATE TABLE IF NOT EXISTS shared.user_admin_history (
  id UUID PRIMARY KEY,
  user_id TEXT NOT NULL REFERENCES shared.user_account(id),
  action_name TEXT NOT NULL,
  actor_name TEXT NOT NULL,
  summary_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS user_admin_history_user_idx
ON shared.user_admin_history (user_id, created_at DESC);
