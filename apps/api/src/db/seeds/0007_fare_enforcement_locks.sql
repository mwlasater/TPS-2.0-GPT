UPDATE shared.train_run
SET
  is_approved = FALSE,
  approved_at = NULL
WHERE id = 'run_caltrain_101_2026_03_06';

UPDATE shared.train_run
SET
  is_approved = FALSE,
  approved_at = NULL
WHERE id = 'run_tre_221_2026_03_06';

UPDATE shared.train_run
SET
  is_approved = TRUE,
  approved_at = TIMESTAMPTZ '2026-03-06T07:26:00Z'
WHERE id = 'run_capmetro_550_2026_03_06';

INSERT INTO shared.fare_enforcement (
  id,
  railroad_code,
  train_run_id,
  inspector_name,
  first_location,
  second_location,
  activity_count,
  notes,
  captured_at
)
VALUES
  (
    'fare_caltrain_101_1',
    'caltrain',
    'run_caltrain_101_2026_03_06',
    'Morgan Lee',
    'SFC',
    'PAO',
    16,
    'Peak boarding checks completed before Palo Alto.',
    TIMESTAMPTZ '2026-03-06T06:28:00Z'
  ),
  (
    'fare_capmetro_550_1',
    'capmetro',
    'run_capmetro_550_2026_03_06',
    'Jordan Reyes',
    'LNR',
    'MLK',
    9,
    'Morning commuter inspection pass.',
    TIMESTAMPTZ '2026-03-06T07:24:00Z'
  ),
  (
    'fare_tre_221_1',
    'tre',
    'run_tre_221_2026_03_06',
    'Taylor Brooks',
    'DAL',
    'CEN',
    12,
    'Manual validation after dispatch hold.',
    TIMESTAMPTZ '2026-03-06T08:08:00Z'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  train_run_id = EXCLUDED.train_run_id,
  inspector_name = EXCLUDED.inspector_name,
  first_location = EXCLUDED.first_location,
  second_location = EXCLUDED.second_location,
  activity_count = EXCLUDED.activity_count,
  notes = EXCLUDED.notes,
  captured_at = EXCLUDED.captured_at;
