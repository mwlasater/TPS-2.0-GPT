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
      "0006_reference_admin_actions"
    ]);
  });
});
