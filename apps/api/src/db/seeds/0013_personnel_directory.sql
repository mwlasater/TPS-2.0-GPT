INSERT INTO shared.personnel_record (
  id,
  railroad_code,
  employee_id,
  employee_name,
  status,
  primary_role,
  certifications
)
VALUES
  (
    'personnel-1',
    'caltrain',
    'HZG-1001',
    'Jordan Reyes',
    'active',
    'Engineer',
    ARRAY['FRA Engineer', 'Rules Qualified']
  ),
  (
    'personnel-2',
    'caltrain',
    'HZG-1002',
    'Taylor Brooks',
    'on_leave',
    'Conductor',
    ARRAY['Conductor', 'Roadway Worker Protection']
  ),
  (
    'personnel-3',
    'capmetro',
    'HZG-1003',
    'Morgan Lee',
    'active',
    'Engineer',
    ARRAY['FRA Engineer']
  )
ON CONFLICT (id) DO NOTHING;
