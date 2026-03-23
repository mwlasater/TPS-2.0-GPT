INSERT INTO shared.passenger_report_import (
  id,
  railroad_code,
  import_name,
  source_file_name,
  imported_at,
  imported_by,
  operating_date,
  row_count,
  status,
  notes
)
VALUES
  (
    'passenger-import-1',
    'caltrain',
    'Weekday passenger reconciliation',
    'caltrain-passenger-2026-03-06.csv',
    '2026-03-06T13:05:00Z',
    'Taylor Brooks',
    '2026-03-06',
    184,
    'processed',
    'Matched to daily boarding feed with no rejected rows.'
  ),
  (
    'street-passenger-import-1',
    'kcstreetcar',
    'Streetcar rider count import',
    'kcstreetcar-passenger-2026-03-06.csv',
    '2026-03-06T12:10:00Z',
    'Jordan Reyes',
    '2026-03-06',
    44,
    'warning',
    'Two rows flagged for missing stop codes and held for review.'
  )
ON CONFLICT (id) DO NOTHING;

INSERT INTO shared.notable_delay_type (id, railroad_code, delay_type_label, category, requires_work_order)
VALUES
  ('notable-interlocking', 'caltrain', 'Interlocking failure', 'mechanical', TRUE),
  ('notable-platform', 'caltrain', 'Platform crowding', 'passenger', FALSE),
  ('notable-traffic', 'caltrain', 'Traffic interference', 'traffic', FALSE),
  ('notable-signal-priority', 'kcstreetcar', 'Signal priority override', 'operations', FALSE),
  ('notable-vehicle-fault', 'kcstreetcar', 'Vehicle fault', 'mechanical', TRUE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO shared.delay_work_order (
  delay_id,
  work_order_id,
  notable_delay_type,
  asset_id,
  repair_type,
  priority,
  status,
  created_at,
  created_by
)
VALUES
  (
    'delay-1',
    'WO-1427',
    'Interlocking failure',
    'SIG-204',
    'Signal diagnostics',
    'high',
    'scheduled',
    '2026-03-06T06:21:00Z',
    'Dispatch Supervisor'
  )
ON CONFLICT (delay_id) DO NOTHING;
