import type {
  ManagedUser,
  ManagedUserDetail,
  ManagedUserList,
  PermissionGroup,
  PermissionGroupList,
  PropertyCode,
  UserAdminActionList
} from "@tps/types";

import { listAttendanceExceptions, listJobProfiles } from "../lib/baseline-data.js";
import { listManagedUsers } from "../lib/managed-users.js";
import { listPermissionGroups } from "../lib/permission-groups.js";
import { getManagedUserDetail, listUserAdminActions } from "../lib/user-admin-data.js";

import type { UserRepository } from "./contracts.js";
import type { Queryable } from "./postgres-client.js";

interface ManagedUserRow {
  id: string;
  display_name: string;
  email: string;
  status: ManagedUser["status"];
  role_label: string;
  last_seen_at: string | Date | null;
}

interface ManagedUserDetailRow extends ManagedUserRow {
  last_action_text: string;
}

interface PropertyAccessRow {
  railroad_code: PropertyCode;
}

interface PermissionGroupRow {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  member_count: number;
}

function toIsoTimestamp(value: string | Date | null): string {
  if (!value) {
    return "";
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class PostgresUsersRepository implements UserRepository {
  constructor(private readonly db: Queryable) {}

  async listUsers(propertyCode: PropertyCode): Promise<ManagedUserList> {
    const result = await this.db.query<ManagedUserRow>(
      `
        SELECT
          ua.id,
          ua.display_name,
          ua.email,
          ua.status,
          ua.role_label,
          ua.last_seen_at
        FROM shared.user_account ua
        JOIN shared.user_property_access upa ON upa.user_id = ua.id
        WHERE upa.railroad_code = $1
        ORDER BY ua.display_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listManagedUsers(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): ManagedUser => ({
          id: row.id,
          displayName: row.display_name,
          email: row.email,
          status: row.status,
          roleLabel: row.role_label,
          lastSeen: toIsoTimestamp(row.last_seen_at)
        })
      )
    };
  }

  async getUserDetail(userId: string, propertyCode: PropertyCode): Promise<ManagedUserDetail> {
    const detailResult = await this.db.query<ManagedUserDetailRow>(
      `
        SELECT
          ua.id,
          ua.display_name,
          ua.email,
          ua.status,
          ua.role_label,
          ua.last_seen_at,
          ua.last_action_text
        FROM shared.user_account ua
        JOIN shared.user_property_access upa ON upa.user_id = ua.id
        WHERE ua.id = $1
          AND upa.railroad_code = $2
      `,
      [userId, propertyCode]
    );

    const row = detailResult.rows[0];
    if (!row) {
      return getManagedUserDetail(userId, propertyCode);
    }

    const [propertyAccessResult, groupsResult] = await Promise.all([
      this.db.query<PropertyAccessRow>(
        `
          SELECT railroad_code
          FROM shared.user_property_access
          WHERE user_id = $1
          ORDER BY railroad_code
        `,
        [userId]
      ),
      this.db.query<{ name: string }>(
        `
          SELECT pg.name
          FROM shared.user_permission_group upg
          JOIN shared.permission_group pg ON pg.id = upg.permission_group_id
          WHERE upg.user_id = $1
          ORDER BY pg.name
        `,
        [userId]
      )
    ]);

    return {
      id: row.id,
      displayName: row.display_name,
      email: row.email,
      status: row.status,
      roleLabel: row.role_label,
      lastSeen: toIsoTimestamp(row.last_seen_at),
      propertyAccess: propertyAccessResult.rows.map((access) => access.railroad_code),
      groups: groupsResult.rows.map((group) => group.name),
      lastAction: row.last_action_text
    };
  }

  listUserAdminActions(): UserAdminActionList {
    return listUserAdminActions();
  }

  async listPermissionGroups(propertyCode: PropertyCode): Promise<PermissionGroupList> {
    const result = await this.db.query<PermissionGroupRow>(
      `
        SELECT
          pg.id,
          pg.name,
          pg.description,
          pg.permissions,
          COUNT(upg.user_id)::INTEGER AS member_count
        FROM shared.permission_group pg
        LEFT JOIN shared.user_permission_group upg
          ON upg.permission_group_id = pg.id
        WHERE pg.railroad_code = $1
        GROUP BY pg.id, pg.name, pg.description, pg.permissions
        ORDER BY pg.name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listPermissionGroups(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): PermissionGroup => ({
          id: String(row.id),
          name: row.name,
          description: row.description,
          members: row.member_count,
          permissions: row.permissions
        })
      )
    };
  }

  listJobProfiles(propertyCode: PropertyCode) {
    return listJobProfiles(propertyCode);
  }

  listAttendanceExceptions(propertyCode: PropertyCode) {
    return listAttendanceExceptions(propertyCode);
  }
}
