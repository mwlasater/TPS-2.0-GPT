type AuthMode = "development" | "oidc";

export interface AuthState {
  error: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  mode: AuthMode;
}

interface AuthTokenCache {
  accessToken: string;
  expiresAt: number;
}

interface OidcConfig {
  authority: string;
  authorizeEndpoint: string;
  clientId: string;
  redirectUri: string;
  scopes: string[];
  tokenEndpoint: string;
}

const tokenStorageKey = "tps.auth.token";
const pkceVerifierStorageKey = "tps.auth.pkce.verifier";
const pkceStateStorageKey = "tps.auth.pkce.state";

function getAuthMode(): AuthMode {
  return import.meta.env.VITE_AUTH_MODE === "oidc" ? "oidc" : "development";
}

function getDevelopmentToken(): string {
  return import.meta.env.VITE_DEV_BEARER_TOKEN ?? "local-dev-token";
}

function getOidcConfig(): OidcConfig {
  const authority = (import.meta.env.VITE_OIDC_AUTHORITY ?? "").replace(/\/$/, "");
  const redirectUri = import.meta.env.VITE_OIDC_REDIRECT_URI ?? window.location.origin;

  return {
    authority,
    authorizeEndpoint:
      import.meta.env.VITE_OIDC_AUTHORIZE_ENDPOINT ?? `${authority}/oauth2/v2.0/authorize`,
    clientId: import.meta.env.VITE_OIDC_CLIENT_ID ?? "",
    redirectUri,
    scopes: (import.meta.env.VITE_OIDC_SCOPES ?? "openid profile email")
      .split(/\s+/)
      .map((value: string) => value.trim())
      .filter(Boolean),
    tokenEndpoint: import.meta.env.VITE_OIDC_TOKEN_ENDPOINT ?? `${authority}/oauth2/v2.0/token`
  };
}

function loadCachedToken(): AuthTokenCache | null {
  const serialized = window.sessionStorage.getItem(tokenStorageKey);

  if (!serialized) {
    return null;
  }

  try {
    const parsed = JSON.parse(serialized) as AuthTokenCache;

    if (parsed.expiresAt <= Date.now()) {
      clearAuthCache();
      return null;
    }

    return parsed;
  } catch {
    clearAuthCache();
    return null;
  }
}

function cacheToken(accessToken: string, expiresInSeconds: number) {
  const expiresAt = Date.now() + Math.max(expiresInSeconds - 30, 30) * 1000;
  window.sessionStorage.setItem(
    tokenStorageKey,
    JSON.stringify({
      accessToken,
      expiresAt
    } satisfies AuthTokenCache)
  );
}

function clearAuthCache() {
  window.sessionStorage.removeItem(tokenStorageKey);
  window.sessionStorage.removeItem(pkceVerifierStorageKey);
  window.sessionStorage.removeItem(pkceStateStorageKey);
}

function encodeBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function createRandomString(length = 32): string {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return encodeBase64Url(bytes);
}

async function createPkceChallenge(verifier: string): Promise<string> {
  const data = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return encodeBase64Url(new Uint8Array(digest));
}

function getCallbackParameters() {
  const searchParams = new URLSearchParams(window.location.search);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  return {
    code,
    error,
    state
  };
}

function clearCallbackParameters() {
  const url = new URL(window.location.href);
  url.searchParams.delete("code");
  url.searchParams.delete("state");
  url.searchParams.delete("session_state");
  url.searchParams.delete("error");
  url.searchParams.delete("error_description");
  window.history.replaceState({}, document.title, `${url.pathname}${url.search}${url.hash}`);
}

async function exchangeAuthorizationCode(code: string, config: OidcConfig): Promise<void> {
  const storedState = window.sessionStorage.getItem(pkceStateStorageKey);
  const storedVerifier = window.sessionStorage.getItem(pkceVerifierStorageKey);
  const callback = getCallbackParameters();

  if (!storedState || !storedVerifier || callback.state !== storedState) {
    throw new Error("auth.oidc_state_invalid");
  }

  const body = new URLSearchParams({
    client_id: config.clientId,
    code,
    code_verifier: storedVerifier,
    grant_type: "authorization_code",
    redirect_uri: config.redirectUri,
    scope: config.scopes.join(" ")
  });

  const response = await fetch(config.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body
  });

  if (!response.ok) {
    throw new Error("auth.oidc_token_exchange_failed");
  }

  const tokenResponse = await response.json() as {
    access_token?: string;
    expires_in?: number;
  };

  if (!tokenResponse.access_token || typeof tokenResponse.expires_in !== "number") {
    throw new Error("auth.oidc_token_invalid");
  }

  cacheToken(tokenResponse.access_token, tokenResponse.expires_in);
  clearCallbackParameters();
  window.sessionStorage.removeItem(pkceVerifierStorageKey);
  window.sessionStorage.removeItem(pkceStateStorageKey);
}

export async function initializeAuth(): Promise<AuthState> {
  const mode = getAuthMode();

  if (mode === "development") {
    return {
      error: null,
      isAuthenticated: true,
      isLoading: false,
      mode
    };
  }

  const config = getOidcConfig();

  if (!config.authority || !config.clientId) {
    return {
      error: "auth.oidc_config_missing",
      isAuthenticated: false,
      isLoading: false,
      mode
    };
  }

  const callback = getCallbackParameters();

  if (callback.error) {
    clearCallbackParameters();
    return {
      error: `auth.${callback.error}`,
      isAuthenticated: false,
      isLoading: false,
      mode
    };
  }

  if (callback.code) {
    try {
      await exchangeAuthorizationCode(callback.code, config);
    } catch (error) {
      clearAuthCache();
      clearCallbackParameters();
      return {
        error: error instanceof Error ? error.message : "auth.oidc_callback_failed",
        isAuthenticated: false,
        isLoading: false,
        mode
      };
    }
  }

  const cachedToken = loadCachedToken();

  return {
    error: cachedToken ? null : null,
    isAuthenticated: cachedToken !== null,
    isLoading: false,
    mode
  };
}

export async function startSignIn(): Promise<void> {
  const mode = getAuthMode();

  if (mode === "development") {
    return;
  }

  const config = getOidcConfig();

  if (!config.authority || !config.clientId) {
    throw new Error("auth.oidc_config_missing");
  }

  const state = createRandomString();
  const verifier = createRandomString(64);
  const challenge = await createPkceChallenge(verifier);
  window.sessionStorage.setItem(pkceStateStorageKey, state);
  window.sessionStorage.setItem(pkceVerifierStorageKey, verifier);

  const authorizeUrl = new URL(config.authorizeEndpoint);
  authorizeUrl.searchParams.set("client_id", config.clientId);
  authorizeUrl.searchParams.set("response_type", "code");
  authorizeUrl.searchParams.set("redirect_uri", config.redirectUri);
  authorizeUrl.searchParams.set("response_mode", "query");
  authorizeUrl.searchParams.set("scope", config.scopes.join(" "));
  authorizeUrl.searchParams.set("code_challenge", challenge);
  authorizeUrl.searchParams.set("code_challenge_method", "S256");
  authorizeUrl.searchParams.set("state", state);

  window.location.assign(authorizeUrl.toString());
}

export function signOut(): void {
  clearAuthCache();
  window.location.assign(window.location.pathname);
}

export async function getAccessToken(): Promise<string> {
  if (getAuthMode() === "development") {
    return getDevelopmentToken();
  }

  const cachedToken = loadCachedToken();

  if (!cachedToken) {
    throw new Error("auth.token_missing");
  }

  return cachedToken.accessToken;
}

export async function buildAuthorizedHeaders(
  headers: Record<string, string> = {}
): Promise<Record<string, string>> {
  return {
    Authorization: `Bearer ${await getAccessToken()}`,
    ...headers
  };
}

export function isDemoFallbackEnabled(): boolean {
  return getAuthMode() === "development";
}
