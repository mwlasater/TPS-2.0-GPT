INSERT INTO shared.fare_enforcement_history (
  id,
  railroad_code,
  fare_record_id,
  action,
  actor_name,
  notes,
  created_at
)
VALUES
  (
    'fare_history_caltrain_101_1_created',
    'caltrain',
    'fare_caltrain_101_1',
    'created',
    'Morgan Lee',
    'Initial fare inspection capture logged.',
    TIMESTAMPTZ '2026-03-06T06:28:00Z'
  ),
  (
    'fare_history_capmetro_550_1_created',
    'capmetro',
    'fare_capmetro_550_1',
    'created',
    'Jordan Reyes',
    'Initial fare inspection capture logged.',
    TIMESTAMPTZ '2026-03-06T07:24:00Z'
  ),
  (
    'fare_history_tre_221_1_created',
    'tre',
    'fare_tre_221_1',
    'created',
    'Taylor Brooks',
    'Initial fare inspection capture logged.',
    TIMESTAMPTZ '2026-03-06T08:08:00Z'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  fare_record_id = EXCLUDED.fare_record_id,
  action = EXCLUDED.action,
  actor_name = EXCLUDED.actor_name,
  notes = EXCLUDED.notes,
  created_at = EXCLUDED.created_at;
