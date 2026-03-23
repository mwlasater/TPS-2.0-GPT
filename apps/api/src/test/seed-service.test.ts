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
      "0013_personnel_directory",
      "0014_user_enable_action",
      "0015_user_admin_history",
      "0016_local_dev_user",
      "0017_train_run_status_history",
      "0018_attendance_workflows",
      "0019_reporting_workflows",
      "0020_reporting_delay_extensions",
      "0021_report_delivery_history",
      "0022_fare_enforcement_history",
      "0023_live_report_workflows",
      "0024_platform_runtime_integrations"
    ]);
  });
});
