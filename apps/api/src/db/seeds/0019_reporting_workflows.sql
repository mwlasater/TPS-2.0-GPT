INSERT INTO shared.report_preference (
  id,
  railroad_code,
  report_name,
  visible_columns,
  sort_order,
  filters_summary
)
VALUES
  (
    'report-pref-caltrain-1',
    'caltrain',
    'Daily OTP',
    ARRAY['trainNumber', 'otpPercent', 'lateTrains'],
    'otpPercent desc',
    'Weekday service only'
  ),
  (
    'report-pref-caltrain-2',
    'caltrain',
    'Delay Detail',
    ARRAY['trainNumber', 'delayType', 'minutes'],
    'minutes desc',
    'Exclude resolved delays'
  ),
  (
    'report-pref-capmetro-1',
    'capmetro',
    'Streetcar Service Summary',
    ARRAY['line', 'headway', 'ridership'],
    'headway asc',
    'Peak service only'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  report_name = EXCLUDED.report_name,
  visible_columns = EXCLUDED.visible_columns,
  sort_order = EXCLUDED.sort_order,
  filters_summary = EXCLUDED.filters_summary;

INSERT INTO shared.scheduled_report_email_job (
  id,
  railroad_code,
  report_name,
  recipient_group,
  schedule_text,
  delivery_format,
  enabled
)
VALUES
  (
    'report-email-caltrain-1',
    'caltrain',
    'Daily OTP',
    'Operations Leadership',
    '06:15 daily',
    'pdf',
    TRUE
  ),
  (
    'report-email-caltrain-2',
    'caltrain',
    'Delay Detail',
    'Dispatch',
    'Every 30 min',
    'xlsx',
    TRUE
  ),
  (
    'report-email-capmetro-1',
    'capmetro',
    'Streetcar Service Summary',
    'Street Supervisors',
    '07:00 daily',
    'pdf',
    TRUE
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  report_name = EXCLUDED.report_name,
  recipient_group = EXCLUDED.recipient_group,
  schedule_text = EXCLUDED.schedule_text,
  delivery_format = EXCLUDED.delivery_format,
  enabled = EXCLUDED.enabled;
