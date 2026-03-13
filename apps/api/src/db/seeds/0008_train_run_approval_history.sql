INSERT INTO shared.train_run_approval_history (
  id,
  railroad_code,
  train_run_id,
  action,
  actor_name,
  notes,
  created_at
)
VALUES
  (
    'approval_caltrain_101_1',
    'caltrain',
    'run_caltrain_101_2026_03_06',
    'approved',
    'Jordan Reyes',
    'Ready for dispatch closeout after final delay reconciliation.',
    TIMESTAMPTZ '2026-03-06T12:15:00Z'
  ),
  (
    'approval_capmetro_550_1',
    'capmetro',
    'run_capmetro_550_2026_03_06',
    'approved',
    'Jordan Reyes',
    'Morning service packet completed.',
    TIMESTAMPTZ '2026-03-06T07:26:00Z'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  train_run_id = EXCLUDED.train_run_id,
  action = EXCLUDED.action,
  actor_name = EXCLUDED.actor_name,
  notes = EXCLUDED.notes,
  created_at = EXCLUDED.created_at;
