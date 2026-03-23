UPDATE shared.train_run
SET
  status_comment = CASE
    WHEN id = 'caltrain-run-1' THEN 'Dispatch is watching downstream crowding through 22nd Street.'
    WHEN id = 'capmetro-run-1' THEN 'Morning service packet completed and locked.'
    ELSE status_comment
  END,
  status_updated_at = TIMESTAMPTZ '2026-03-20T17:00:00Z',
  status_updated_by = 'Jordan Reyes'
WHERE id IN ('caltrain-run-1', 'capmetro-run-1');

INSERT INTO shared.train_run_event_history (
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
    'train-run-event-caltrain-1',
    'caltrain',
    'caltrain-run-1',
    'status-updated',
    'Jordan Reyes',
    'Dispatch is watching downstream crowding through 22nd Street.',
    TIMESTAMPTZ '2026-03-20T17:00:00Z'
  ),
  (
    'train-run-event-capmetro-1',
    'capmetro',
    'capmetro-run-1',
    'status-updated',
    'Jordan Reyes',
    'Morning service packet completed and locked.',
    TIMESTAMPTZ '2026-03-20T17:05:00Z'
  )
ON CONFLICT (id) DO UPDATE
SET
  action = EXCLUDED.action,
  actor_name = EXCLUDED.actor_name,
  notes = EXCLUDED.notes,
  created_at = EXCLUDED.created_at;
