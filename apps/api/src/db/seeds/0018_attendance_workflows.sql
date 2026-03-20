UPDATE shared.attendance_exception
SET
  employee_name = 'Taylor Brooks',
  employee_id = 'personnel-2',
  end_date = DATE '2026-03-07'
WHERE id = 'att_caltrain_1';

UPDATE shared.attendance_exception
SET
  employee_name = 'Taylor Brooks',
  employee_id = 'personnel-2',
  end_date = NULL
WHERE id = 'att_caltrain_2';

UPDATE shared.attendance_exception
SET
  employee_name = 'Jordan Reyes',
  employee_id = 'personnel-3',
  end_date = DATE '2026-03-06'
WHERE id = 'att_capmetro_1';

INSERT INTO shared.attendance_exception (
  id,
  railroad_code,
  employee_id,
  employee_name,
  exception_type,
  start_date,
  end_date,
  status,
  notes
)
VALUES
  (
    'att_caltrain_3',
    'caltrain',
    'personnel-2',
    'Taylor Brooks',
    'absence',
    DATE '2026-02-24',
    DATE '2026-02-24',
    'resolved',
    'Prior approved absence retained for history.'
  ),
  (
    'att_caltrain_4',
    'caltrain',
    'personnel-1',
    'Jordan Reyes',
    'tardy',
    DATE '2026-03-01',
    DATE '2026-03-01',
    'resolved',
    'Late sign-on cleared after dispatcher review.'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  employee_id = EXCLUDED.employee_id,
  employee_name = EXCLUDED.employee_name,
  exception_type = EXCLUDED.exception_type,
  start_date = EXCLUDED.start_date,
  end_date = EXCLUDED.end_date,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;

INSERT INTO shared.attendance_notification_rule (
  id,
  railroad_code,
  issue_type,
  trigger_status,
  recipient_group,
  template_name,
  enabled
)
VALUES
  (
    'attendance-rule-caltrain-absence-open',
    'caltrain',
    'absence',
    'open',
    'Operations Leadership',
    'Absence Open Alert',
    TRUE
  ),
  (
    'attendance-rule-caltrain-tardy-approved',
    'caltrain',
    'tardiness',
    'approved',
    'Crew Management',
    'Tardiness Supervisor Notice',
    TRUE
  ),
  (
    'attendance-rule-capmetro-tardy-open',
    'capmetro',
    'tardiness',
    'open',
    'Street Operations',
    'Streetcar Tardiness Alert',
    TRUE
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  issue_type = EXCLUDED.issue_type,
  trigger_status = EXCLUDED.trigger_status,
  recipient_group = EXCLUDED.recipient_group,
  template_name = EXCLUDED.template_name,
  enabled = EXCLUDED.enabled;
