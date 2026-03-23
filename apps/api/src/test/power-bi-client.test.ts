import { afterEach, describe, expect, it, vi } from "vitest";

import { createPowerBiClient, resetPowerBiClientCache } from "../lib/power-bi-client.js";

const baseConfig = {
  APP_VERSION: "0.1.0-test",
  API_PREFIX: "/api/v1",
  DATA_ACCESS_MODE: "postgres" as const,
  DATABASE_URL: "postgres://tps:tps@localhost:5432/tps",
  DB_AUTO_BOOTSTRAP: false,
  DB_BOOTSTRAP_MAX_ATTEMPTS: 12,
  DB_BOOTSTRAP_RETRY_MS: 1000,
  HOST: "127.0.0.1",
  JWT_AUDIENCE: "tps-2.0",
  JWT_AUTH_MODE: "development" as const,
  JWT_CLOCK_TOLERANCE_SECONDS: 30,
  JWT_DEV_TOKEN: "local-dev-token",
  JWT_ISSUER: "https://login.microsoftonline.com/example/v2.0",
  JWT_JWKS_URI: "",
  NODE_ENV: "test" as const,
  PORT: 3000,
  POWER_BI_API_BASE_URL: "https://api.powerbi.com/v1.0/myorg",
  POWER_BI_AUTH_MODE: "client_credentials" as const,
  POWER_BI_AUTHORITY_HOST: "https://login.microsoftonline.com",
  POWER_BI_CLIENT_ID: "power-bi-client-id",
  POWER_BI_CLIENT_SECRET: "power-bi-client-secret",
  POWER_BI_SCOPE: "https://analysis.windows.net/powerbi/api/.default",
  POWER_BI_TENANT_ID: "tenant-id",
  PROPERTY_CODES: "caltrain",
  USER_PROPERTY_ACCESS: "local-dev-user:caltrain",
  USER_PROPERTY_PERMISSIONS: "",
  WEB_ORIGIN: "http://localhost:5173",
  propertyCodes: ["caltrain"],
  userPropertyAccess: {
    "local-dev-user": ["caltrain"]
  },
  userPropertyPermissions: {}
};

describe("power bi client", () => {
  afterEach(() => {
    resetPowerBiClientCache();
    vi.unstubAllGlobals();
  });

  it("issues embed tokens with client credentials", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "aad-access-token",
          expires_in: 3600
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          token: "embed-token-1",
          expiration: "2026-03-06T13:00:00Z"
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    const client = createPowerBiClient(baseConfig);
    const session = await client.issueEmbedToken({
      reportName: "Daily OTP",
      workspaceId: "11111111-1111-1111-1111-111111111111",
      reportId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      actorName: "Taylor Brooks"
    });

    expect(session).toEqual({
      accessToken: "embed-token-1",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      expiresAt: "2026-03-06T13:00:00Z"
    });
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "https://login.microsoftonline.com/tenant-id/oauth2/v2.0/token",
      expect.objectContaining({
        method: "POST"
      })
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "https://api.powerbi.com/v1.0/myorg/groups/11111111-1111-1111-1111-111111111111/reports/aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa/GenerateToken",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer aad-access-token"
        })
      })
    );
  });

  it("reuses cached AAD tokens across embed requests", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          access_token: "aad-access-token",
          expires_in: 3600
        })
      })
      .mockResolvedValue({
        ok: true,
        json: async () => ({
          token: "embed-token-1",
          expiration: "2026-03-06T13:00:00Z"
        })
      });
    vi.stubGlobal("fetch", fetchMock);

    const client = createPowerBiClient(baseConfig);
    await client.issueEmbedToken({
      reportName: "Daily OTP",
      workspaceId: "11111111-1111-1111-1111-111111111111",
      reportId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      actorName: "Taylor Brooks"
    });
    await client.issueEmbedToken({
      reportName: "Delay Detail",
      workspaceId: "11111111-1111-1111-1111-111111111111",
      reportId: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=delay-detail",
      actorName: "Taylor Brooks"
    });

    expect(fetchMock).toHaveBeenCalledTimes(3);
  });
});
