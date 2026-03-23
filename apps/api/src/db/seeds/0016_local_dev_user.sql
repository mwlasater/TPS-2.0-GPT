INSERT INTO shared.user_account (
  id,
  email,
  display_name,
  status,
  role_label,
  last_action_text
)
VALUES (
  'local-dev-user',
  'local-dev-user@herzog.com',
  'Local Development User',
  'active',
  'Development Administrator',
  'Development session seeded'
)
ON CONFLICT (id) DO UPDATE
SET
  email = EXCLUDED.email,
  display_name = EXCLUDED.display_name,
  status = EXCLUDED.status,
  role_label = EXCLUDED.role_label,
  last_action_text = EXCLUDED.last_action_text;

INSERT INTO shared.user_property_access (user_id, railroad_code)
VALUES
  ('local-dev-user', 'caltrain'),
  ('local-dev-user', 'capmetro')
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
    'Development Admin',
    'Full administrative access for the local development operator.',
    ARRAY[
      'schedules.write',
      'runs.approve',
      'runs.write',
      'stops.write',
      'delays.write',
      'consist.write',
      'crew.assign',
      'fare.write',
      'users.invite',
      'users.manage',
      'users.access.write',
      'admin.permissions.write',
      'reports.schedule',
      'notifications.write',
      'staffing.write'
    ]
  ),
  (
    'capmetro',
    'Development Admin',
    'Full administrative access for the local development operator.',
    ARRAY[
      'schedules.write',
      'runs.approve',
      'runs.write',
      'stops.write',
      'delays.write',
      'consist.write',
      'crew.assign',
      'fare.write',
      'users.invite',
      'users.manage',
      'users.access.write',
      'admin.permissions.write',
      'reports.schedule',
      'notifications.write',
      'staffing.write'
    ]
  )
ON CONFLICT (railroad_code, name) DO UPDATE
SET
  description = EXCLUDED.description,
  permissions = EXCLUDED.permissions;

INSERT INTO shared.user_permission_group (user_id, permission_group_id)
SELECT 'local-dev-user', pg.id
FROM shared.permission_group pg
WHERE pg.railroad_code = 'caltrain'
  AND pg.name IN ('Operations Admin', 'Dispatch Leadership', 'Development Admin')
ON CONFLICT (user_id, permission_group_id) DO NOTHING;

INSERT INTO shared.user_permission_group (user_id, permission_group_id)
SELECT 'local-dev-user', pg.id
FROM shared.permission_group pg
WHERE pg.railroad_code = 'capmetro'
  AND pg.name = 'Development Admin'
ON CONFLICT (user_id, permission_group_id) DO NOTHING;
