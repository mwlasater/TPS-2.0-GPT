import crypto from "node:crypto";

import { afterEach, describe, expect, it, vi } from "vitest";

import { getUserIdentityFromClaims, resetJwkCache, verifyJwtToken } from "../lib/jwt-auth.js";

function createSignedJwt(overrides: Record<string, unknown> = {}) {
  const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048
  });
  const publicJwk = publicKey.export({
    format: "jwk"
  }) as crypto.JsonWebKey;
  const header = {
    alg: "RS256",
    typ: "JWT",
    kid: "test-key"
  };
  const payload = {
    aud: "tps-2.0",
    exp: Math.floor(Date.now() / 1000) + 3600,
    iss: "https://login.microsoftonline.com/example/v2.0",
    name: "Test Operator",
    oid: "entra-user-1",
    preferred_username: "operator@herzog.com",
    ...overrides
  };
  const encode = (value: unknown) =>
    Buffer.from(JSON.stringify(value)).toString("base64url");
  const signingInput = `${encode(header)}.${encode(payload)}`;
  const signature = crypto.sign("RSA-SHA256", Buffer.from(signingInput), privateKey)
    .toString("base64url");

  return {
    token: `${signingInput}.${signature}`,
    publicJwk: {
      ...publicJwk,
      alg: "RS256",
      kid: "test-key",
      use: "sig"
    }
  };
}

describe("verifyJwtToken", () => {
  afterEach(() => {
    resetJwkCache();
    vi.restoreAllMocks();
  });

  it("verifies RS256 tokens against a JWKS endpoint", async () => {
    const { token, publicJwk } = createSignedJwt();
    const fetchJwkSet = vi.fn().mockResolvedValue({
      keys: [publicJwk]
    });

    const claims = await verifyJwtToken(token, {
      audience: "tps-2.0",
      issuer: "https://login.microsoftonline.com/example/v2.0",
      jwksUri: "https://auth.example/.well-known/jwks.json",
      fetchJwkSet
    });

    expect(claims).toMatchObject({
      oid: "entra-user-1",
      preferred_username: "operator@herzog.com"
    });
    expect(fetchJwkSet).toHaveBeenCalledTimes(1);
  });

  it("rejects tokens with the wrong audience", async () => {
    const { token, publicJwk } = createSignedJwt({
      aud: "other-audience"
    });

    await expect(
      verifyJwtToken(token, {
        audience: "tps-2.0",
        issuer: "https://login.microsoftonline.com/example/v2.0",
        jwksUri: "https://auth.example/.well-known/jwks.json",
        fetchJwkSet: async () => ({ keys: [publicJwk] })
      })
    ).rejects.toThrow("auth.jwt_audience_invalid");
  });
});

describe("getUserIdentityFromClaims", () => {
  it("maps Entra-style claims into a user identity", () => {
    expect(getUserIdentityFromClaims({
      oid: "entra-user-1",
      preferred_username: "operator@herzog.com",
      name: "Test Operator"
    })).toEqual({
      id: "entra-user-1",
      email: "operator@herzog.com",
      displayName: "Test Operator"
    });
  });
});
