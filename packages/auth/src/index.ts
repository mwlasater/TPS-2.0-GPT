import type { PropertyCode, UserSession } from "@tps/types";

export function createDevelopmentSession(
  token: string,
  expectedToken: string,
  allowedProperties: PropertyCode[]
): UserSession | null {
  if (token !== expectedToken) {
    return null;
  }

  return {
    id: "local-dev-user",
    email: "local-dev-user@herzog.com",
    displayName: "Local Development User",
    allowedProperties
  };
}

