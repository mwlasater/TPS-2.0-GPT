INSERT INTO shared.report_delivery_request (
  id,
  railroad_code,
  report_name,
  delivery_format,
  delivery_mode,
  recipient,
  status,
  requested_at,
  requested_by,
  notes
)
VALUES
  (
    'report-delivery-1',
    'caltrain',
    'Daily OTP',
    'pdf',
    'email',
    'operations.leadership@herzog.com',
    'sent',
    '2026-03-06T06:16:00Z',
    'Taylor Brooks',
    'Morning leadership packet.'
  ),
  (
    'street-report-delivery-1',
    'kcstreetcar',
    'Streetcar Service Summary',
    'pdf',
    'download',
    'Street Supervisors',
    'generated',
    '2026-03-06T07:05:00Z',
    'Jordan Reyes',
    'Supervisor handoff packet.'
  )
ON CONFLICT (id) DO NOTHING;
