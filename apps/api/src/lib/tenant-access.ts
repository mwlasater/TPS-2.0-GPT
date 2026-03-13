import type { PropertyCode, UserSession } from "@tps/types";

export function ensurePropertyAccess(
  property: string | undefined,
  propertyCodes: string[],
  session: UserSession
): PropertyCode {
  if (!property) {
    throw new Error("property.required");
  }

  if (!propertyCodes.includes(property)) {
    throw new Error("property.invalid");
  }

  if (!session.allowedProperties.includes(property as PropertyCode)) {
    throw new Error("property.forbidden");
  }

  return property as PropertyCode;
}

