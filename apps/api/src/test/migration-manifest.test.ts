import { describe, expect, it } from "vitest";

import { migrationManifest } from "../db/migration-manifest.js";
import { loadMigrations } from "../db/migration-service.js";

describe("migration manifest", () => {
  it("covers every migration on disk", async () => {
    const migrations = await loadMigrations();

    expect(migrationManifest.map((entry) => entry.id)).toEqual(migrations.map((entry) => entry.id));
  });

  it("declares tracked tables for every entry", () => {
    expect(migrationManifest.every((entry) => entry.tables.length > 0)).toBe(true);
  });
});
