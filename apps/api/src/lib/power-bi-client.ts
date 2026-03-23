import crypto from "node:crypto";

import type { AppConfig } from "@tps/config";

export interface PowerBiEmbedTokenRequest {
  reportName: string;
  workspaceId: string;
  reportId: string;
  embedUrl: string;
  actorName: string;
}

export interface PowerBiEmbedTokenResponse {
  accessToken: string;
  embedUrl: string;
  expiresAt: string;
}

export interface PowerBiClient {
  issueEmbedToken(input: PowerBiEmbedTokenRequest): Promise<PowerBiEmbedTokenResponse>;
}

interface CachedAccessToken {
  accessToken: string;
  expiresAt: number;
}

let cachedAccessToken: CachedAccessToken | null = null;

function getCachedAccessToken(): string | null {
  if (!cachedAccessToken || cachedAccessToken.expiresAt <= Date.now()) {
    cachedAccessToken = null;
    return null;
  }

  return cachedAccessToken.accessToken;
}

function cacheAccessToken(accessToken: string, expiresInSeconds: number): void {
  cachedAccessToken = {
    accessToken,
    expiresAt: Date.now() + Math.max(expiresInSeconds - 60, 60) * 1000
  };
}

async function acquirePowerBiAccessToken(config: AppConfig): Promise<string> {
  const cached = getCachedAccessToken();
  if (cached) {
    return cached;
  }

  const tokenEndpoint = `${config.POWER_BI_AUTHORITY_HOST.replace(/\/$/, "")}/${config.POWER_BI_TENANT_ID}/oauth2/v2.0/token`;
  const body = new URLSearchParams({
    client_id: config.POWER_BI_CLIENT_ID,
    client_secret: config.POWER_BI_CLIENT_SECRET,
    grant_type: "client_credentials",
    scope: config.POWER_BI_SCOPE
  });

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error("power_bi.token_exchange_failed");
  }

  const payload = (await response.json()) as {
    access_token?: string;
    expires_in?: number;
  };

  if (!payload.access_token || typeof payload.expires_in !== "number") {
    throw new Error("power_bi.token_invalid");
  }

  cacheAccessToken(payload.access_token, payload.expires_in);
  return payload.access_token;
}

function createDevelopmentPowerBiClient(): PowerBiClient {
  return {
    async issueEmbedToken(input) {
      return {
        accessToken: `pbi-${crypto.randomUUID()}`,
        embedUrl: input.embedUrl,
        expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString()
      };
    }
  };
}

function createClientCredentialsPowerBiClient(config: AppConfig): PowerBiClient {
  const apiBaseUrl = config.POWER_BI_API_BASE_URL.replace(/\/$/, "");

  return {
    async issueEmbedToken(input) {
      const accessToken = await acquirePowerBiAccessToken(config);
      const generateTokenResponse = await fetch(
        `${apiBaseUrl}/groups/${input.workspaceId}/reports/${input.reportId}/GenerateToken`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            accessLevel: "View",
            allowSaveAs: false
          })
        }
      );

      if (!generateTokenResponse.ok) {
        throw new Error("power_bi.generate_token_failed");
      }

      const payload = (await generateTokenResponse.json()) as {
        token?: string;
        expiration?: string;
      };

      if (!payload.token || !payload.expiration) {
        throw new Error("power_bi.embed_token_invalid");
      }

      return {
        accessToken: payload.token,
        embedUrl: input.embedUrl,
        expiresAt: payload.expiration
      };
    }
  };
}

export function createPowerBiClient(config: AppConfig): PowerBiClient {
  return config.POWER_BI_AUTH_MODE === "client_credentials"
    ? createClientCredentialsPowerBiClient(config)
    : createDevelopmentPowerBiClient();
}

export function resetPowerBiClientCache(): void {
  cachedAccessToken = null;
}
