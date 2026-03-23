INSERT INTO shared.power_bi_session (
  id,
  railroad_code,
  report_id,
  report_name,
  embed_url,
  access_token,
  expires_at,
  requested_at,
  requested_by
)
VALUES
  (
    'pbi-session-caltrain-1',
    'caltrain',
    'bi_caltrain_1',
    'Daily OTP',
    'https://app.powerbi.com/reportEmbed?reportId=daily-otp',
    'pbi-seeded-caltrain-token',
    TIMESTAMPTZ '2026-03-06T13:00:00Z',
    TIMESTAMPTZ '2026-03-06T12:00:00Z',
    'Taylor Brooks'
  ),
  (
    'pbi-session-capmetro-1',
    'capmetro',
    'bi_capmetro_1',
    'Streetcar Service Summary',
    'https://app.powerbi.com/reportEmbed?reportId=streetcar-service',
    'pbi-seeded-capmetro-token',
    TIMESTAMPTZ '2026-03-06T14:00:00Z',
    TIMESTAMPTZ '2026-03-06T13:15:00Z',
    'Jordan Reyes'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  report_id = EXCLUDED.report_id,
  report_name = EXCLUDED.report_name,
  embed_url = EXCLUDED.embed_url,
  access_token = EXCLUDED.access_token,
  expires_at = EXCLUDED.expires_at,
  requested_at = EXCLUDED.requested_at,
  requested_by = EXCLUDED.requested_by;

INSERT INTO shared.cmms_sync_job (
  id,
  railroad_code,
  work_order_id,
  asset_id,
  status,
  requested_at,
  requested_by,
  notes
)
VALUES
  (
    'cmms-sync-caltrain-1',
    'caltrain',
    'WO-1427',
    'LOCO-120',
    'synced',
    TIMESTAMPTZ '2026-03-06T06:32:00Z',
    'Dispatch Supervisor',
    'Sync locomotive fault work order to CMMS.'
  ),
  (
    'cmms-sync-capmetro-1',
    'capmetro',
    'WO-7102',
    NULL,
    'queued',
    TIMESTAMPTZ '2026-03-06T07:18:00Z',
    'Jordan Reyes',
    'Awaiting asset assignment from streetcar maintenance.'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  work_order_id = EXCLUDED.work_order_id,
  asset_id = EXCLUDED.asset_id,
  status = EXCLUDED.status,
  requested_at = EXCLUDED.requested_at,
  requested_by = EXCLUDED.requested_by,
  notes = EXCLUDED.notes;
