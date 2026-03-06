Initial SQL migration scaffolding for TPS 2.0.

- `0001_foundation.sql`: shared tenant, user, permission, and report foundations
- `0002_operations.sql`: schedules, runs, stops, and delay tables
- `0003_admin_platform.sql`: staffing, files, notifications, and Power BI tables

These migrations define the persistence boundary the mock repositories are expected to satisfy.

