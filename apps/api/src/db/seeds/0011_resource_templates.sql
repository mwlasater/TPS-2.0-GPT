INSERT INTO shared.consist_template (id, railroad_code, template_name)
VALUES
  ('consist_caltrain_standard', 'caltrain', 'Commuter Standard'),
  ('consist_caltrain_short_turn', 'caltrain', 'Short Turn'),
  ('consist_capmetro_standard', 'capmetro', 'Streetcar Standard')
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  template_name = EXCLUDED.template_name;

INSERT INTO shared.consist_template_item (
  id,
  template_id,
  equipment_number,
  equipment_type,
  position_index,
  status
)
VALUES
  ('tmpl_consist_item_1', 'consist_caltrain_standard', 'CAB-901', 'Cab Car', 1, 'active'),
  ('tmpl_consist_item_2', 'consist_caltrain_standard', 'COACH-442', 'Coach', 2, 'active'),
  ('tmpl_consist_item_3', 'consist_caltrain_standard', 'LOCO-120', 'Locomotive', 3, 'active'),
  ('tmpl_consist_item_4', 'consist_caltrain_short_turn', 'CAB-911', 'Cab Car', 1, 'active'),
  ('tmpl_consist_item_5', 'consist_caltrain_short_turn', 'COACH-510', 'Coach', 2, 'active'),
  ('tmpl_consist_item_6', 'consist_caltrain_short_turn', 'LOCO-201', 'Locomotive', 3, 'active'),
  ('tmpl_consist_item_7', 'consist_capmetro_standard', 'SC-01', 'Streetcar Vehicle', 1, 'active')
ON CONFLICT (id) DO UPDATE
SET
  template_id = EXCLUDED.template_id,
  equipment_number = EXCLUDED.equipment_number,
  equipment_type = EXCLUDED.equipment_type,
  position_index = EXCLUDED.position_index,
  status = EXCLUDED.status;

INSERT INTO shared.crew_template (id, railroad_code, template_name)
VALUES
  ('crew_caltrain_standard', 'caltrain', 'Standard Crew'),
  ('crew_caltrain_relief', 'caltrain', 'Relief Crew'),
  ('crew_capmetro_standard', 'capmetro', 'Streetcar Crew')
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  template_name = EXCLUDED.template_name;

INSERT INTO shared.crew_template_item (
  id,
  template_id,
  employee_name,
  role_name,
  on_duty_time,
  status
)
VALUES
  ('tmpl_crew_item_1', 'crew_caltrain_standard', 'Jordan Reyes', 'Engineer', '05:30', 'assigned'),
  ('tmpl_crew_item_2', 'crew_caltrain_standard', 'Taylor Brooks', 'Conductor', '05:35', 'assigned'),
  ('tmpl_crew_item_3', 'crew_caltrain_relief', 'Morgan Lee', 'Engineer', '05:55', 'assigned'),
  ('tmpl_crew_item_4', 'crew_caltrain_relief', 'Alex Carter', 'Conductor', '06:00', 'assigned'),
  ('tmpl_crew_item_5', 'crew_capmetro_standard', 'Jordan Reyes', 'Operator', '06:45', 'assigned')
ON CONFLICT (id) DO UPDATE
SET
  template_id = EXCLUDED.template_id,
  employee_name = EXCLUDED.employee_name,
  role_name = EXCLUDED.role_name,
  on_duty_time = EXCLUDED.on_duty_time,
  status = EXCLUDED.status;
