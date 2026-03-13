INSERT INTO shared.reference_delay_reason (railroad_code, reason_text)
VALUES
  ('caltrain', 'Mechanical'),
  ('caltrain', 'Signal delay'),
  ('caltrain', 'Late crew'),
  ('caltrain', 'Passenger loading'),
  ('capmetro', 'Traffic hold'),
  ('capmetro', 'Signal issue'),
  ('capmetro', 'Passenger assistance'),
  ('capmetro', 'Vehicle reset')
ON CONFLICT DO NOTHING;

INSERT INTO shared.reference_crew_role (railroad_code, role_name)
VALUES
  ('caltrain', 'Engineer'),
  ('caltrain', 'Conductor'),
  ('caltrain', 'Assistant Conductor'),
  ('caltrain', 'Dispatcher'),
  ('capmetro', 'Operator'),
  ('capmetro', 'Street Supervisor'),
  ('capmetro', 'Service Lead')
ON CONFLICT DO NOTHING;

INSERT INTO shared.reference_station_code (railroad_code, station_code)
VALUES
  ('caltrain', 'STA'),
  ('caltrain', 'STB'),
  ('caltrain', 'STC'),
  ('caltrain', 'STD'),
  ('caltrain', 'STE'),
  ('capmetro', 'ST01'),
  ('capmetro', 'ST02'),
  ('capmetro', 'ST03'),
  ('capmetro', 'ST04')
ON CONFLICT DO NOTHING;

INSERT INTO shared.user_admin_action (id, label, style, display_order)
VALUES
  ('reset-password', 'Reset Password', 'primary', 1),
  ('resend-invite', 'Resend Invite', 'secondary', 2),
  ('disable-user', 'Disable User', 'warning', 3)
ON CONFLICT (id) DO UPDATE
SET
  label = EXCLUDED.label,
  style = EXCLUDED.style,
  display_order = EXCLUDED.display_order;
