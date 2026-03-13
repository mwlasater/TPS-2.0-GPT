INSERT INTO shared.user_account (
  id,
  email,
  display_name,
  status,
  role_label,
  last_seen_at,
  last_action_text
)
VALUES
  (
    'ops-manager',
    'jordan.reyes@herzog.com',
    'Jordan Reyes',
    'active',
    'Operations Manager',
    TIMESTAMPTZ '2026-03-06T14:10:00Z',
    'Password reset sent on 2026-03-01'
  ),
  (
    'dispatcher-1',
    'taylor.brooks@herzog.com',
    'Taylor Brooks',
    'active',
    'Dispatcher',
    TIMESTAMPTZ '2026-03-06T13:45:00Z',
    'Invite accepted on 2026-02-19'
  ),
  (
    'reporting-admin',
    'casey.morgan@herzog.com',
    'Casey Morgan',
    'invited',
    'Reporting Admin',
    TIMESTAMPTZ '2026-03-05T17:20:00Z',
    'Invitation resent on 2026-03-05'
  )
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  status = EXCLUDED.status,
  role_label = EXCLUDED.role_label,
  last_seen_at = EXCLUDED.last_seen_at,
  last_action_text = EXCLUDED.last_action_text;

INSERT INTO shared.user_property_access (user_id, railroad_code)
VALUES
  ('ops-manager', 'caltrain'),
  ('ops-manager', 'capmetro'),
  ('dispatcher-1', 'caltrain'),
  ('dispatcher-1', 'tre'),
  ('reporting-admin', 'caltrain')
ON CONFLICT (user_id, railroad_code) DO NOTHING;

INSERT INTO shared.permission_group (
  railroad_code,
  name,
  description,
  permissions
)
VALUES
  (
    'caltrain',
    'Operations Admin',
    'Full operational control across schedules, runs, delays, and crew.',
    ARRAY['schedules.write', 'runs.approve', 'delays.write', 'crew.assign']
  ),
  (
    'caltrain',
    'Dispatch Leadership',
    'Day-of-service editing for train runs and delays.',
    ARRAY['runs.write', 'delays.write', 'stops.write']
  ),
  (
    'tre',
    'Dispatcher',
    'Day-of-service editing for train runs and delays.',
    ARRAY['runs.write', 'delays.write', 'stops.write']
  )
ON CONFLICT (railroad_code, name) DO UPDATE
SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

INSERT INTO shared.user_permission_group (user_id, permission_group_id)
SELECT 'ops-manager', pg.id
FROM shared.permission_group pg
WHERE pg.railroad_code = 'caltrain'
  AND pg.name IN ('Operations Admin', 'Dispatch Leadership')
ON CONFLICT (user_id, permission_group_id) DO NOTHING;

INSERT INTO shared.user_permission_group (user_id, permission_group_id)
SELECT 'dispatcher-1', pg.id
FROM shared.permission_group pg
WHERE pg.railroad_code = 'tre'
  AND pg.name = 'Dispatcher'
ON CONFLICT (user_id, permission_group_id) DO NOTHING;

INSERT INTO shared.user_permission_group (user_id, permission_group_id)
SELECT 'reporting-admin', pg.id
FROM shared.permission_group pg
WHERE pg.railroad_code = 'caltrain'
  AND pg.name = 'Dispatch Leadership'
ON CONFLICT (user_id, permission_group_id) DO NOTHING;
