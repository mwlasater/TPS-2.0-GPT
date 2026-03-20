import crypto from "node:crypto";

interface JwtHeader {
  alg?: string;
  kid?: string;
  typ?: string;
}

export interface JwtClaims {
  aud?: string | string[];
  email?: string;
  exp?: number;
  family_name?: string;
  given_name?: string;
  iat?: number;
  iss?: string;
  name?: string;
  nbf?: number;
  oid?: string;
  preferred_username?: string;
  sub?: string;
  upn?: string;
  [key: string]: unknown;
}

interface Jwk {
  alg?: string;
  e?: string;
  kid?: string;
  kty?: string;
  n?: string;
  use?: string;
}

interface JwkSet {
  keys: Jwk[];
}

interface CachedJwkSet {
  expiresAt: number;
  jwkSet: JwkSet;
}

export interface JwtVerificationOptions {
  audience: string;
  issuer: string;
  jwksUri: string;
  clockToleranceSeconds?: number;
  fetchJwkSet?: (jwksUri: string) => Promise<JwkSet>;
  now?: () => number;
}

const DEFAULT_CACHE_TTL_MS = 5 * 60 * 1000;
const jwksCache = new Map<string, CachedJwkSet>();

function decodeBase64Url(value: string): Buffer {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return Buffer.from(padded, "base64");
}

function parseJwtSegment<T>(segment: string, errorCode: string): T {
  try {
    return JSON.parse(decodeBase64Url(segment).toString("utf8")) as T;
  } catch {
    throw new Error(errorCode);
  }
}

async function defaultFetchJwkSet(jwksUri: string): Promise<JwkSet> {
  const response = await fetch(jwksUri);

  if (!response.ok) {
    throw new Error("auth.jwks_fetch_failed");
  }

  return response.json() as Promise<JwkSet>;
}

async function loadJwkSet(
  jwksUri: string,
  fetchJwkSet: (jwksUri: string) => Promise<JwkSet>,
  now: () => number,
  forceRefresh = false
): Promise<JwkSet> {
  const cached = jwksCache.get(jwksUri);

  if (!forceRefresh && cached && cached.expiresAt > now()) {
    return cached.jwkSet;
  }

  const jwkSet = await fetchJwkSet(jwksUri);
  jwksCache.set(jwksUri, {
    expiresAt: now() + DEFAULT_CACHE_TTL_MS,
    jwkSet
  });

  return jwkSet;
}

async function resolveJwk(
  header: JwtHeader,
  options: Required<Pick<JwtVerificationOptions, "jwksUri" | "fetchJwkSet" | "now">>
): Promise<Jwk> {
  if (!header.kid) {
    throw new Error("auth.jwt_kid_missing");
  }

  const firstJwkSet = await loadJwkSet(
    options.jwksUri,
    options.fetchJwkSet,
    options.now
  );
  let jwk = firstJwkSet.keys.find((candidate) => candidate.kid === header.kid);

  if (!jwk) {
    const refreshedJwkSet = await loadJwkSet(
      options.jwksUri,
      options.fetchJwkSet,
      options.now,
      true
    );
    jwk = refreshedJwkSet.keys.find((candidate) => candidate.kid === header.kid);
  }

  if (!jwk) {
    throw new Error("auth.jwk_not_found");
  }

  if (jwk.kty !== "RSA" || !jwk.n || !jwk.e) {
    throw new Error("auth.jwk_invalid");
  }

  return jwk;
}

function verifyRegisteredClaims(
  claims: JwtClaims,
  options: Required<Pick<JwtVerificationOptions, "audience" | "issuer" | "now">> &
    Pick<JwtVerificationOptions, "clockToleranceSeconds">
) {
  const nowSeconds = Math.floor(options.now() / 1000);
  const tolerance = options.clockToleranceSeconds ?? 30;
  const audience = claims.aud;
  const audienceMatches = Array.isArray(audience)
    ? audience.includes(options.audience)
    : audience === options.audience;

  if (!claims.iss || claims.iss !== options.issuer) {
    throw new Error("auth.jwt_issuer_invalid");
  }

  if (!audienceMatches) {
    throw new Error("auth.jwt_audience_invalid");
  }

  if (typeof claims.nbf === "number" && claims.nbf > nowSeconds + tolerance) {
    throw new Error("auth.jwt_not_yet_valid");
  }

  if (typeof claims.exp !== "number" || claims.exp <= nowSeconds - tolerance) {
    throw new Error("auth.jwt_expired");
  }
}

export async function verifyJwtToken(
  token: string,
  options: JwtVerificationOptions
): Promise<JwtClaims> {
  const segments = token.split(".");

  if (segments.length !== 3) {
    throw new Error("auth.jwt_malformed");
  }

  const encodedHeader = segments[0]!;
  const encodedPayload = segments[1]!;
  const encodedSignature = segments[2]!;
  const header = parseJwtSegment<JwtHeader>(encodedHeader, "auth.jwt_header_invalid");

  if (header.alg !== "RS256") {
    throw new Error("auth.jwt_algorithm_unsupported");
  }

  const claims = parseJwtSegment<JwtClaims>(encodedPayload, "auth.jwt_payload_invalid");
  verifyRegisteredClaims(claims, {
    audience: options.audience,
    issuer: options.issuer,
    now: options.now ?? Date.now,
    ...(options.clockToleranceSeconds === undefined
      ? {}
      : {
          clockToleranceSeconds: options.clockToleranceSeconds
        })
  });

  const jwk = await resolveJwk(header, {
    jwksUri: options.jwksUri,
    fetchJwkSet: options.fetchJwkSet ?? defaultFetchJwkSet,
    now: options.now ?? Date.now
  });

  const publicKey = crypto.createPublicKey({
    key: {
      kty: "RSA",
      n: jwk.n!,
      e: jwk.e!
    },
    format: "jwk"
  });

  const verified = crypto.verify(
    "RSA-SHA256",
    Buffer.from(`${encodedHeader}.${encodedPayload}`),
    publicKey,
    decodeBase64Url(encodedSignature)
  );

  if (!verified) {
    throw new Error("auth.jwt_signature_invalid");
  }

  return claims;
}

export function getUserIdentityFromClaims(claims: JwtClaims) {
  const id = claims.oid ?? claims.sub;

  if (!id) {
    throw new Error("auth.jwt_subject_missing");
  }

  const email =
    claims.preferred_username ??
    claims.email ??
    claims.upn ??
    (typeof claims.sub === "string" ? claims.sub : undefined);

  if (!email) {
    throw new Error("auth.jwt_email_missing");
  }

  const displayName =
    claims.name ??
    [claims.given_name, claims.family_name].filter(Boolean).join(" ").trim() ??
    email;

  return {
    id,
    email,
    displayName: displayName || email
  };
}

export function resetJwkCache() {
  jwksCache.clear();
}
