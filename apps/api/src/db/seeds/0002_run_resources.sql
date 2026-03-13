INSERT INTO shared.consist_equipment (
  id,
  train_run_id,
  equipment_number,
  equipment_type,
  position_index,
  status
)
VALUES
  ('equip_caltrain_101_1', 'run_caltrain_101_2026_03_06', 'CAB-901', 'Cab Car', 1, 'active'),
  ('equip_caltrain_101_2', 'run_caltrain_101_2026_03_06', 'COACH-442', 'Coach', 2, 'active'),
  ('equip_caltrain_101_3', 'run_caltrain_101_2026_03_06', 'LOCO-120', 'Locomotive', 3, 'active'),
  ('equip_capmetro_550_1', 'run_capmetro_550_2026_03_06', 'DMU-201', 'DMU', 1, 'active')
ON CONFLICT (id) DO UPDATE
SET
  train_run_id = EXCLUDED.train_run_id,
  equipment_number = EXCLUDED.equipment_number,
  equipment_type = EXCLUDED.equipment_type,
  position_index = EXCLUDED.position_index,
  status = EXCLUDED.status;

INSERT INTO shared.crew_assignment (
  id,
  train_run_id,
  employee_name,
  role_name,
  on_duty_time,
  status
)
VALUES
  ('crew_caltrain_101_1', 'run_caltrain_101_2026_03_06', 'Jordan Reyes', 'Engineer', '05:30', 'assigned'),
  ('crew_caltrain_101_2', 'run_caltrain_101_2026_03_06', 'Taylor Brooks', 'Conductor', '05:35', 'assigned'),
  ('crew_caltrain_101_3', 'run_caltrain_101_2026_03_06', 'Casey Morgan', 'Assistant Conductor', '05:40', 'pending_relief'),
  ('crew_capmetro_550_1', 'run_capmetro_550_2026_03_06', 'Jordan Reyes', 'Operator', '06:45', 'assigned')
ON CONFLICT (id) DO UPDATE
SET
  train_run_id = EXCLUDED.train_run_id,
  employee_name = EXCLUDED.employee_name,
  role_name = EXCLUDED.role_name,
  on_duty_time = EXCLUDED.on_duty_time,
  status = EXCLUDED.status;
