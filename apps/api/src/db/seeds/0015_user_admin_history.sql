INSERT INTO shared.user_admin_history (
  id,
  user_id,
  action_name,
  actor_name,
  summary_text,
  created_at
)
VALUES
  (
    '0d6eb2b0-67b0-4fd3-8d58-23393d381111',
    'ops-manager',
    'reset-password',
    'Jordan Reyes',
    'Password reset sent on 2026-03-01',
    TIMESTAMPTZ '2026-03-01T08:15:00Z'
  ),
  (
    '3f92d09f-7bc2-4c2a-a4af-2f5fdf8d2222',
    'reporting-admin',
    'resend-invite',
    'Casey Morgan',
    'Invitation resent on 2026-03-05',
    TIMESTAMPTZ '2026-03-05T17:20:00Z'
  )
ON CONFLICT (id) DO NOTHING;
