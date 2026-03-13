INSERT INTO shared.job_profile (
  id,
  railroad_code,
  title,
  department,
  minimum_headcount,
  relief_required
)
VALUES
  ('job_caltrain_engineer', 'caltrain', 'Engineer', 'Transportation', 1, TRUE),
  ('job_caltrain_conductor', 'caltrain', 'Conductor', 'Transportation', 1, TRUE),
  ('job_caltrain_dispatcher', 'caltrain', 'Dispatcher', 'Control Center', 2, FALSE),
  ('job_capmetro_operator', 'capmetro', 'Operator', 'Street Operations', 1, TRUE)
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  title = EXCLUDED.title,
  department = EXCLUDED.department,
  minimum_headcount = EXCLUDED.minimum_headcount,
  relief_required = EXCLUDED.relief_required;

INSERT INTO shared.attendance_exception (
  id,
  railroad_code,
  employee_name,
  exception_type,
  start_date,
  status,
  notes
)
VALUES
  (
    'att_caltrain_1',
    'caltrain',
    'Casey Morgan',
    'absence',
    DATE '2026-03-06',
    'approved',
    'Approved medical leave.'
  ),
  (
    'att_caltrain_2',
    'caltrain',
    'Taylor Brooks',
    'tardy',
    DATE '2026-03-06',
    'open',
    'Reported 12 minutes late due to traffic.'
  ),
  (
    'att_capmetro_1',
    'capmetro',
    'Jordan Reyes',
    'tardy',
    DATE '2026-03-06',
    'resolved',
    'Late sign-on resolved with supervisor approval.'
  )
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  employee_name = EXCLUDED.employee_name,
  exception_type = EXCLUDED.exception_type,
  start_date = EXCLUDED.start_date,
  status = EXCLUDED.status,
  notes = EXCLUDED.notes;
