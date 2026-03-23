INSERT INTO shared.user_admin_action (id, label, style, display_order)
VALUES ('enable-user', 'Enable User', 'primary', 4)
ON CONFLICT (id) DO UPDATE
SET
  label = EXCLUDED.label,
  style = EXCLUDED.style,
  display_order = EXCLUDED.display_order;
