import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AppConfig } from "@tps/config";

const applyPendingMigrations = vi.fn();
const applyPendingSeeds = vi.fn();

vi.mock("../db/migration-service.js", () => ({
  applyPendingMigrations
}));

vi.mock("../db/seed-service.js", () => ({
  applyPendingSeeds
}));

function createConfig(overrides: Partial<AppConfig> = {}): AppConfig {
  return {
    NODE_ENV: "development",
    PORT: 3000,
    HOST: "0.0.0.0",
    APP_VERSION: "0.1.0",
    API_PREFIX: "/api/v1",
    WEB_ORIGIN: "http://localhost:5173",
    DATABASE_URL: "postgres://tps:tps@localhost:5432/tps",
    DATA_ACCESS_MODE: "postgres",
    DB_AUTO_BOOTSTRAP: true,
    DB_BOOTSTRAP_MAX_ATTEMPTS: 3,
    DB_BOOTSTRAP_RETRY_MS: 1,
    JWT_AUTH_MODE: "development",
    JWT_AUDIENCE: "tps-2.0",
    JWT_ISSUER: "https://login.microsoftonline.com/example/v2.0",
    JWT_JWKS_URI: "",
    JWT_CLOCK_TOLERANCE_SECONDS: 30,
    JWT_DEV_TOKEN: "local-dev-token",
    PROPERTY_CODES: "caltrain,capmetro,tre",
    USER_PROPERTY_ACCESS: "local-dev-user:caltrain|capmetro|tre",
    USER_PROPERTY_PERMISSIONS:
      "local-dev-user@caltrain:users.invite|users.manage|users.access.write",
    propertyCodes: ["caltrain", "capmetro", "tre"],
    userPropertyAccess: {
      "local-dev-user": ["caltrain", "capmetro", "tre"]
    },
    userPropertyPermissions: {
      "local-dev-user": {
        caltrain: ["users.invite", "users.manage", "users.access.write"]
      }
    },
    ...overrides
  };
}

describe("bootstrapDatabase", () => {
  beforeEach(() => {
    applyPendingMigrations.mockReset();
    applyPendingSeeds.mockReset();
  });

  it("skips bootstrap when disabled", async () => {
    const { bootstrapDatabase } = await import("../db/bootstrap-service.js");

    await bootstrapDatabase(
      createConfig({
        DB_AUTO_BOOTSTRAP: false
      })
    );

    expect(applyPendingMigrations).not.toHaveBeenCalled();
    expect(applyPendingSeeds).not.toHaveBeenCalled();
  });

  it("applies migrations and seeds when enabled", async () => {
    applyPendingMigrations.mockResolvedValueOnce(["0001_foundation"]);
    applyPendingSeeds.mockResolvedValueOnce(["0001_bootstrap"]);

    const { bootstrapDatabase } = await import("../db/bootstrap-service.js");
    await bootstrapDatabase(createConfig());

    expect(applyPendingMigrations).toHaveBeenCalledTimes(1);
    expect(applyPendingSeeds).toHaveBeenCalledTimes(1);
  });

  it("retries failed bootstrap attempts before succeeding", async () => {
    applyPendingMigrations.mockRejectedValueOnce(new Error("connect ECONNREFUSED"));
    applyPendingMigrations.mockResolvedValueOnce(["0001_foundation"]);
    applyPendingSeeds.mockResolvedValueOnce(["0001_bootstrap"]);

    const { bootstrapDatabase } = await import("../db/bootstrap-service.js");
    await bootstrapDatabase(createConfig());

    expect(applyPendingMigrations).toHaveBeenCalledTimes(2);
    expect(applyPendingSeeds).toHaveBeenCalledTimes(1);
  });
});
