import type { PropertyCode, UserSession } from "@tps/types";

export function getPropertyPermissions(
  session: UserSession,
  propertyCode: PropertyCode
): string[] {
  return session.propertyPermissions[propertyCode] ?? [];
}

export function ensurePropertyPermission(
  session: UserSession,
  propertyCode: PropertyCode,
  permission: string
): void {
  if (!getPropertyPermissions(session, propertyCode).includes(permission)) {
    throw new Error("permission.forbidden");
  }
}
