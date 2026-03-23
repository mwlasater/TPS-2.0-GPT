import type { PropertyCode } from "@tps/types";

import type { Queryable } from "../repositories/postgres-client.js";

interface PropertyAccessRow {
  railroad_code: PropertyCode;
}

interface PermissionRow {
  railroad_code: PropertyCode;
  permissions: string[];
}

export interface UserAuthorization {
  allowedProperties: PropertyCode[];
  propertyPermissions: Partial<Record<PropertyCode, string[]>>;
}

export async function loadPersistedUserAuthorization(
  db: Queryable,
  userId: string
): Promise<UserAuthorization> {
  const [accessResult, permissionResult] = await Promise.all([
    db.query<PropertyAccessRow>(
      `
        SELECT railroad_code
        FROM shared.user_property_access
        WHERE user_id = $1
        ORDER BY railroad_code
      `,
      [userId]
    ),
    db.query<PermissionRow>(
      `
        SELECT
          pg.railroad_code,
          pg.permissions
        FROM shared.user_permission_group upg
        JOIN shared.permission_group pg ON pg.id = upg.permission_group_id
        WHERE upg.user_id = $1
      `,
      [userId]
    )
  ]);

  const propertyPermissions = permissionResult.rows.reduce<Partial<Record<PropertyCode, string[]>>>(
    (accumulator, row) => {
      const existing = new Set(accumulator[row.railroad_code] ?? []);

      for (const permission of row.permissions) {
        existing.add(permission);
      }

      accumulator[row.railroad_code] = [...existing].sort();
      return accumulator;
    },
    {}
  );

  return {
    allowedProperties: accessResult.rows.map((row) => row.railroad_code),
    propertyPermissions
  };
}
