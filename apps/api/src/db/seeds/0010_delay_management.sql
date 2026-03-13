INSERT INTO shared.delay_common_location (id, railroad_code, location_label, usage_count)
VALUES
  ('loc_caltrain_sfc', 'caltrain', 'San Francisco', 18),
  ('loc_caltrain_pao', 'caltrain', 'Palo Alto', 11),
  ('loc_caltrain_sjc', 'caltrain', 'San Jose', 9),
  ('loc_capmetro_lnr', 'capmetro', 'Leander', 8),
  ('loc_capmetro_mlk', 'capmetro', 'MLK', 5)
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  location_label = EXCLUDED.location_label,
  usage_count = EXCLUDED.usage_count;

INSERT INTO shared.special_movement (id, railroad_code, movement_label, description)
VALUES
  ('movement_single_track', 'caltrain', 'Single-track meet', 'Temporary meet requiring dispatch coordination.'),
  ('movement_yard_out', 'caltrain', 'Yard departure', 'Late release from yard or shop movement.'),
  ('movement_escort', 'capmetro', 'Street escort', 'Manual escort through mixed-traffic segment.')
ON CONFLICT (id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  movement_label = EXCLUDED.movement_label,
  description = EXCLUDED.description;

INSERT INTO shared.delay_additional_info (
  delay_id,
  railroad_code,
  location_detail,
  responsible_party,
  notable_delay_type,
  special_movement_id,
  work_order_id,
  mechanical_notes,
  passenger_impact_summary
)
VALUES
  (
    'delay_caltrain_101_1',
    'caltrain',
    'CP Coast interlocking',
    'Signal Maintainer',
    'Interlocking failure',
    'movement_single_track',
    'WO-1427',
    '',
    'Peak riders held through two downstream stops.'
  ),
  (
    'delay_caltrain_101_2',
    'caltrain',
    'Palo Alto northbound platform',
    'Station Operations',
    'Platform crowding',
    NULL,
    NULL,
    '',
    'Boarding queue extended onto concourse.'
  )
ON CONFLICT (delay_id) DO UPDATE
SET
  railroad_code = EXCLUDED.railroad_code,
  location_detail = EXCLUDED.location_detail,
  responsible_party = EXCLUDED.responsible_party,
  notable_delay_type = EXCLUDED.notable_delay_type,
  special_movement_id = EXCLUDED.special_movement_id,
  work_order_id = EXCLUDED.work_order_id,
  mechanical_notes = EXCLUDED.mechanical_notes,
  passenger_impact_summary = EXCLUDED.passenger_impact_summary;
