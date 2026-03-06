Initial SQL persistence tooling for TPS 2.0.

- `migrations/0001_foundation.sql`: shared tenant, user, permission, and report foundations
- `migrations/0002_operations.sql`: schedules, runs, stops, and delay tables
- `migrations/0003_admin_platform.sql`: staffing, files, notifications, and Power BI tables
- `seeds/0001_bootstrap.sql`: bootstrap property settings plus a small set of schedules and runs

Commands:

- `npm --workspace @tps/api run migrate:status`
- `npm --workspace @tps/api run migrate`
- `npm --workspace @tps/api run seed:status`
- `npm --workspace @tps/api run seed`

Run migrations before seeds. The seed set is intended for local Postgres bootstrap so the persisted repositories can be exercised end to end.
