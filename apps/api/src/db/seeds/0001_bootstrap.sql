INSERT INTO shared.railroad (code, schema_name, display_name, profile, is_active)
VALUES
  ('caltrain', 'caltrain', 'Caltrain', 'commuter_rail', TRUE),
  ('texrail', 'texrail', 'TEXRail', 'commuter_rail', TRUE),
  ('tre', 'tre', 'Trinity Railway Express', 'commuter_rail', TRUE),
  ('trirail', 'trirail', 'Tri-Rail', 'commuter_rail', TRUE),
  ('nmrx', 'nmrx', 'New Mexico Rail Runner Express', 'commuter_rail', TRUE),
  ('ctrail', 'ctrail', 'CTrail Hartford Line', 'commuter_rail', TRUE),
  ('ace', 'ace', 'Altamont Corridor Express', 'commuter_rail', TRUE),
  ('capmetro', 'capmetro', 'CapMetro', 'commuter_rail', TRUE),
  ('kcstreetcar', 'kcstreetcar', 'KC Streetcar', 'streetcar', TRUE),
  ('okcstreetcar', 'okcstreetcar', 'OKC Streetcar', 'streetcar', TRUE),
  ('octastreetcar', 'octastreetcar', 'OCTA Streetcar', 'streetcar', TRUE),
  ('metrolinkarrow', 'metrolinkarrow', 'Metrolink Arrow', 'commuter_rail', TRUE),
  ('silverline', 'silverline', 'Silver Line', 'commuter_rail', TRUE)
ON CONFLICT (code) DO UPDATE
SET
  schema_name = EXCLUDED.schema_name,
  display_name = EXCLUDED.display_name,
  profile = EXCLUDED.profile,
  is_active = EXCLUDED.is_active;

INSERT INTO shared.property_settings (
  railroad_code,
  support_email,
  timezone_name,
  primary_color,
  logo_mode,
  power_bi_enabled,
  file_uploads_enabled,
  cmms_enabled
)
VALUES
  ('caltrain', 'ops@caltrain.herzogops.com', 'America/Los_Angeles', '#d71920', 'property-override', TRUE, TRUE, FALSE),
  ('texrail', 'dispatch@texrail.herzogops.com', 'America/Chicago', '#0057a8', 'herzog-default', TRUE, TRUE, TRUE),
  ('tre', 'support@tre.herzogops.com', 'America/Chicago', '#1f4f99', 'herzog-default', TRUE, TRUE, TRUE),
  ('trirail', 'ops@trirail.herzogops.com', 'America/New_York', '#006d77', 'herzog-default', TRUE, TRUE, TRUE),
  ('nmrx', 'support@nmrx.herzogops.com', 'America/Denver', '#c14953', 'herzog-default', FALSE, TRUE, FALSE),
  ('ctrail', 'support@ctrail.herzogops.com', 'America/New_York', '#ff6b35', 'herzog-default', TRUE, FALSE, FALSE),
  ('ace', 'support@ace.herzogops.com', 'America/Los_Angeles', '#2a628f', 'herzog-default', TRUE, TRUE, FALSE),
  ('capmetro', 'support@capmetro.herzogops.com', 'America/Chicago', '#f28c28', 'property-override', TRUE, TRUE, TRUE),
  ('kcstreetcar', 'support@kcstreetcar.herzogops.com', 'America/Chicago', '#c8102e', 'property-override', FALSE, TRUE, FALSE),
  ('okcstreetcar', 'support@okcstreetcar.herzogops.com', 'America/Chicago', '#00843d', 'herzog-default', FALSE, TRUE, FALSE),
  ('octastreetcar', 'support@octastreetcar.herzogops.com', 'America/Los_Angeles', '#ff8200', 'herzog-default', TRUE, TRUE, FALSE),
  ('metrolinkarrow', 'support@metrolinkarrow.herzogops.com', 'America/Los_Angeles', '#6d597a', 'herzog-default', TRUE, FALSE, FALSE),
  ('silverline', 'support@silverline.herzogops.com', 'America/Chicago', '#4f6d7a', 'herzog-default', FALSE, TRUE, FALSE)
ON CONFLICT (railroad_code) DO UPDATE
SET
  support_email = EXCLUDED.support_email,
  timezone_name = EXCLUDED.timezone_name,
  primary_color = EXCLUDED.primary_color,
  logo_mode = EXCLUDED.logo_mode,
  power_bi_enabled = EXCLUDED.power_bi_enabled,
  file_uploads_enabled = EXCLUDED.file_uploads_enabled,
  cmms_enabled = EXCLUDED.cmms_enabled;

INSERT INTO shared.train_schedule (
  id,
  railroad_code,
  train_number,
  route_name,
  direction,
  service_days,
  stop_count
)
VALUES
  ('sched_caltrain_101', 'caltrain', '101', 'San Francisco - San Jose', 'southbound', ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 10),
  ('sched_caltrain_152', 'caltrain', '152', 'San Jose - San Francisco', 'northbound', ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 10),
  ('sched_capmetro_550', 'capmetro', '550', 'Leander - Downtown', 'southbound', ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], 9),
  ('sched_tre_221', 'tre', '221', 'Fort Worth - Dallas', 'eastbound', ARRAY['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], 7)
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  train_number = EXCLUDED.train_number,
  route_name = EXCLUDED.route_name,
  direction = EXCLUDED.direction,
  service_days = EXCLUDED.service_days,
  stop_count = EXCLUDED.stop_count;

INSERT INTO shared.train_run (
  id,
  railroad_code,
  schedule_id,
  operating_date,
  status,
  delay_minutes,
  crew_assigned
)
VALUES
  ('run_caltrain_101_2026_03_06', 'caltrain', 'sched_caltrain_101', DATE '2026-03-06', 'in_progress', 6, 4),
  ('run_caltrain_152_2026_03_06', 'caltrain', 'sched_caltrain_152', DATE '2026-03-06', 'scheduled', 0, 4),
  ('run_capmetro_550_2026_03_06', 'capmetro', 'sched_capmetro_550', DATE '2026-03-06', 'approved', 2, 3),
  ('run_tre_221_2026_03_06', 'tre', 'sched_tre_221', DATE '2026-03-06', 'delayed', 14, 5)
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  schedule_id = EXCLUDED.schedule_id,
  operating_date = EXCLUDED.operating_date,
  status = EXCLUDED.status,
  delay_minutes = EXCLUDED.delay_minutes,
  crew_assigned = EXCLUDED.crew_assigned;

INSERT INTO shared.station_stop (
  id,
  train_run_id,
  station_code,
  stop_sequence,
  scheduled_time,
  actual_time,
  boardings,
  alightings
)
VALUES
  ('stop_caltrain_101_1', 'run_caltrain_101_2026_03_06', 'SFC', 1, '06:05', '06:06', 42, 3),
  ('stop_caltrain_101_2', 'run_caltrain_101_2026_03_06', 'PAO', 2, '06:18', '06:23', 27, 11),
  ('stop_caltrain_101_3', 'run_caltrain_101_2026_03_06', 'SJC', 3, '06:31', NULL, 0, 0),
  ('stop_capmetro_550_1', 'run_capmetro_550_2026_03_06', 'LNR', 1, '07:10', '07:10', 14, 2),
  ('stop_capmetro_550_2', 'run_capmetro_550_2026_03_06', 'MLK', 2, '07:18', '07:20', 8, 4)
ON CONFLICT (id) DO UPDATE
SET
  train_run_id = EXCLUDED.train_run_id,
  station_code = EXCLUDED.station_code,
  stop_sequence = EXCLUDED.stop_sequence,
  scheduled_time = EXCLUDED.scheduled_time,
  actual_time = EXCLUDED.actual_time,
  boardings = EXCLUDED.boardings,
  alightings = EXCLUDED.alightings;

INSERT INTO shared.delay_event (
  id,
  train_run_id,
  category,
  minutes,
  notes,
  reported_at
)
VALUES
  ('delay_caltrain_101_1', 'run_caltrain_101_2026_03_06', 'Signal delay', 4, 'Signal clearance held at interlocking.', TIMESTAMPTZ '2026-03-06T06:19:00Z'),
  ('delay_caltrain_101_2', 'run_caltrain_101_2026_03_06', 'Passenger loading', 3, 'Heavy boarding volume at central station.', TIMESTAMPTZ '2026-03-06T06:24:00Z'),
  ('delay_tre_221_1', 'run_tre_221_2026_03_06', 'Dispatch conflict', 14, 'Single-track meet required an unscheduled hold.', TIMESTAMPTZ '2026-03-06T08:02:00Z')
ON CONFLICT (id) DO UPDATE
SET
  train_run_id = EXCLUDED.train_run_id,
  category = EXCLUDED.category,
  minutes = EXCLUDED.minutes,
  notes = EXCLUDED.notes,
  reported_at = EXCLUDED.reported_at;
