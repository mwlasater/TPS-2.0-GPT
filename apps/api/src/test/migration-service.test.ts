import { describe, expect, it } from "vitest";

import { loadMigrations } from "../db/migration-service.js";

describe("migration service", () => {
  it("loads sql migrations in sorted order", async () => {
    const migrations = await loadMigrations();

    expect(migrations.length).toBeGreaterThan(0);
    expect(migrations.map((migration) => migration.id)).toEqual([
      "0001_foundation",
      "0002_operations",
      "0003_admin_platform",
      "0004_run_resources",
      "0005_user_admin",
      "0006_reference_admin_actions",
      "0007_fare_enforcement_locks",
      "0008_train_run_approval_history",
      "0009_fare_enforcement_counts",
      "0010_delay_management",
      "0011_resource_templates",
      "0012_delay_templates",
      "0013_personnel_directory",
      "0015_user_admin_history",
      "0017_train_run_status_history"
    ]);
  });
});
