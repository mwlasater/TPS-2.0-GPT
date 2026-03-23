UPDATE shared.report_delivery_request
SET
  retry_count = 0,
  last_retried_at = NULL
WHERE id IN ('report-delivery-1', 'street-report-delivery-1');

INSERT INTO shared.live_report_execution (
  id,
  railroad_code,
  report_id,
  report_name,
  execution_format,
  delivery_mode,
  recipient,
  status,
  executed_at,
  executed_by,
  filters_summary,
  notes,
  linked_delivery_id
)
VALUES
  (
    'live-execution-1',
    'caltrain',
    'bi_caltrain_1',
    'Daily OTP',
    'interactive',
    'view',
    'Operations Leadership',
    'ready',
    TIMESTAMPTZ '2026-03-06T06:10:00Z',
    'Taylor Brooks',
    'Weekday service, current operating day',
    'Leadership standup review.',
    NULL
  ),
  (
    'street-live-execution-1',
    'kcstreetcar',
    'bi_capmetro_1',
    'Streetcar Service Summary',
    'pdf',
    'download',
    'Street Supervisors',
    'generated',
    TIMESTAMPTZ '2026-03-06T07:00:00Z',
    'Jordan Reyes',
    'Peak service only',
    'Morning supervisor packet.',
    'street-report-delivery-1'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  report_id = EXCLUDED.report_id,
  report_name = EXCLUDED.report_name,
  execution_format = EXCLUDED.execution_format,
  delivery_mode = EXCLUDED.delivery_mode,
  recipient = EXCLUDED.recipient,
  status = EXCLUDED.status,
  executed_at = EXCLUDED.executed_at,
  executed_by = EXCLUDED.executed_by,
  filters_summary = EXCLUDED.filters_summary,
  notes = EXCLUDED.notes,
  linked_delivery_id = EXCLUDED.linked_delivery_id;
