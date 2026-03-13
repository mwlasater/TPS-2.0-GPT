INSERT INTO shared.delay_template (
  id,
  railroad_code,
  template_name,
  category,
  minutes,
  notes,
  notable_delay_type,
  special_movement_id
)
VALUES
  (
    'delay-template-signal',
    'caltrain',
    'Signal Hold',
    'Signal delay',
    4,
    'Signal clearance held at interlocking.',
    'Interlocking failure',
    'movement-single-track'
  ),
  (
    'delay-template-boarding',
    'caltrain',
    'Heavy Boarding',
    'Passenger loading',
    3,
    'Heavy boarding volume at central station.',
    'Platform crowding',
    NULL
  ),
  (
    'delay-template-signal',
    'capmetro',
    'Signal Hold',
    'Signal delay',
    4,
    'Signal clearance held at interlocking.',
    'Interlocking failure',
    'movement-single-track'
  )
ON CONFLICT (railroad_code, id) DO NOTHING;
