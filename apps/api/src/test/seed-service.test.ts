import { describe, expect, it } from "vitest";

import { loadSeeds } from "../db/seed-service.js";

describe("seed service", () => {
  it("loads sql seeds in sorted order", async () => {
    const seeds = await loadSeeds();

    expect(seeds.length).toBeGreaterThan(0);
    expect(seeds.map((seed) => seed.id)).toEqual([
      "0001_bootstrap",
      "0002_run_resources",
      "0003_user_admin",
      "0004_platform_admin",
      "0005_baseline_admin",
      "0006_reference_admin_actions",
      "0007_fare_enforcement_locks",
      "0008_train_run_approval_history",
      "0009_fare_enforcement_counts",
      "0010_delay_management",
      "0011_resource_templates",
      "0012_delay_templates",
      "0013_personnel_directory"
    ]);
  });
});
