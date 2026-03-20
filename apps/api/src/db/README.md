Initial SQL persistence tooling for TPS 2.0.

- `migrations/0001_foundation.sql`: shared tenant, user, permission, and report foundations
- `migrations/0002_operations.sql`: schedules, runs, stops, and delay tables
- `migrations/0003_admin_platform.sql`: staffing, files, notifications, and Power BI tables
- `migrations/0004_run_resources.sql`: consist equipment and crew assignments for train runs
- `migrations/0005_user_admin.sql`: persisted user metadata, permission arrays, and user/group membership
- `migrations/0006_reference_admin_actions.sql`: reference datasets and persisted user admin actions
- `migrations/0010_delay_management.sql`: delay common locations, special movements, and additional metadata
- `migrations/0011_resource_templates.sql`: reusable consist and crew template catalogs for swap workflows
- `migrations/0012_delay_templates.sql`: reusable delay templates for template-driven delay creation
- `migrations/0013_personnel_directory.sql`: property-scoped personnel directory records and statuses
- `migrations/0015_user_admin_history.sql`: persisted user admin audit history for lifecycle and access changes
- `migrations/0017_train_run_status_history.sql`: train-run status comments plus operational event history
- `migrations/0018_attendance_workflows.sql`: attendance employee linkage, history-friendly fields, and notification rules
- `seeds/0001_bootstrap.sql`: bootstrap property settings plus a small set of schedules and runs
- `seeds/0002_run_resources.sql`: consist and crew records for seeded train runs
- `seeds/0003_user_admin.sql`: managed users, property access, permission groups, and memberships
- `seeds/0004_platform_admin.sql`: report config plus file, notification, and Power BI records
- `seeds/0005_baseline_admin.sql`: job profiles and attendance exceptions
- `seeds/0006_reference_admin_actions.sql`: delay reasons, crew roles, station codes, and user admin actions
- `seeds/0010_delay_management.sql`: seeded delay locations, special movements, and additional delay metadata
- `seeds/0011_resource_templates.sql`: seeded consist and crew swap templates
- `seeds/0012_delay_templates.sql`: seeded delay templates for commuter properties
- `seeds/0013_personnel_directory.sql`: seeded personnel directory records
- `seeds/0014_user_enable_action.sql`: additive user admin action seed for re-enable workflows
- `seeds/0015_user_admin_history.sql`: seeded user admin audit history entries
- `seeds/0016_local_dev_user.sql`: seeded local development operator for persisted permission resolution
- `seeds/0017_train_run_status_history.sql`: seeded train-run status comments and operational events
- `seeds/0018_attendance_workflows.sql`: seeded attendance history rows plus attendance notification rules

Commands:

- `npm --workspace @tps/api run migrate:status`
- `npm --workspace @tps/api run migrate`
- `npm --workspace @tps/api run seed:status`
- `npm --workspace @tps/api run seed`

Run migrations before seeds. The seed set is intended for local Postgres bootstrap so the persisted repositories can be exercised end to end.

Local Docker bootstrap:

- `docker compose up --build` now runs the API in `DATA_ACCESS_MODE=postgres`
- the API can auto-apply migrations and seeds on startup when `DB_AUTO_BOOTSTRAP=true`
- retries are controlled by `DB_BOOTSTRAP_MAX_ATTEMPTS` and `DB_BOOTSTRAP_RETRY_MS`
