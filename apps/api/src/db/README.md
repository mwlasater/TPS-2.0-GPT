Initial SQL persistence tooling for TPS 2.0.

- `migrations/0001_foundation.sql`: shared tenant, user, permission, and report foundations
- `migrations/0002_operations.sql`: schedules, runs, stops, and delay tables
- `migrations/0003_admin_platform.sql`: staffing, files, notifications, and Power BI tables
- `migrations/0004_run_resources.sql`: consist equipment and crew assignments for train runs
- `migrations/0005_user_admin.sql`: persisted user metadata, permission arrays, and user/group membership
- `seeds/0001_bootstrap.sql`: bootstrap property settings plus a small set of schedules and runs
- `seeds/0002_run_resources.sql`: consist and crew records for seeded train runs
- `seeds/0003_user_admin.sql`: managed users, property access, permission groups, and memberships
- `seeds/0004_platform_admin.sql`: report config plus file, notification, and Power BI records

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
