INSERT INTO shared.report_config (
  id,
  railroad_code,
  report_name,
  audience,
  embed_enabled,
  schedule_text
)
VALUES
  (101, 'caltrain', 'Daily OTP', 'Operations Leadership', TRUE, '06:00 daily'),
  (102, 'caltrain', 'Delay Detail', 'Dispatch', TRUE, 'Every 30 min'),
  (103, 'capmetro', 'Streetcar Service Summary', 'Operations Leadership', TRUE, '07:00 daily')
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  report_name = EXCLUDED.report_name,
  audience = EXCLUDED.audience,
  embed_enabled = EXCLUDED.embed_enabled,
  schedule_text = EXCLUDED.schedule_text;

INSERT INTO shared.file_service_item (
  id,
  railroad_code,
  file_name,
  category,
  uploaded_at,
  status
)
VALUES
  (
    'file_caltrain_1',
    'caltrain',
    'daily-delay-export.csv',
    'operations',
    TIMESTAMPTZ '2026-03-06T11:20:00Z',
    'available'
  ),
  (
    'file_caltrain_2',
    'caltrain',
    'crew-roster.xlsx',
    'crew',
    TIMESTAMPTZ '2026-03-06T10:05:00Z',
    'processing'
  ),
  (
    'file_capmetro_1',
    'capmetro',
    'incident-log.pdf',
    'safety',
    TIMESTAMPTZ '2026-03-06T09:15:00Z',
    'available'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  file_name = EXCLUDED.file_name,
  category = EXCLUDED.category,
  uploaded_at = EXCLUDED.uploaded_at,
  status = EXCLUDED.status;

INSERT INTO shared.notification_template (
  id,
  railroad_code,
  channel,
  template_name,
  recipient_group,
  enabled
)
VALUES
  ('notif_caltrain_1', 'caltrain', 'email', 'Delay Escalation', 'Dispatch Leadership', TRUE),
  ('notif_caltrain_2', 'caltrain', 'in_app', 'Crew Relief Needed', 'Crew Management', TRUE),
  ('notif_capmetro_1', 'capmetro', 'in_app', 'Street Incident Alert', 'Street Supervisors', TRUE)
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  channel = EXCLUDED.channel,
  template_name = EXCLUDED.template_name,
  recipient_group = EXCLUDED.recipient_group,
  enabled = EXCLUDED.enabled;

INSERT INTO shared.power_bi_embed (
  id,
  railroad_code,
  report_name,
  workspace_name,
  embed_url,
  enabled
)
VALUES
  (
    'bi_caltrain_1',
    'caltrain',
    'Daily OTP',
    'Transit Ops',
    'https://app.powerbi.com/reportEmbed?reportId=daily-otp',
    TRUE
  ),
  (
    'bi_caltrain_2',
    'caltrain',
    'Delay Detail',
    'Transit Ops',
    'https://app.powerbi.com/reportEmbed?reportId=delay-detail',
    TRUE
  ),
  (
    'bi_capmetro_1',
    'capmetro',
    'Streetcar Service Summary',
    'Streetcar Ops',
    'https://app.powerbi.com/reportEmbed?reportId=streetcar-service',
    TRUE
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  report_name = EXCLUDED.report_name,
  workspace_name = EXCLUDED.workspace_name,
  embed_url = EXCLUDED.embed_url,
  enabled = EXCLUDED.enabled;
