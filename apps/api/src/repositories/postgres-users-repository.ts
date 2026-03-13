import type {
  AttendanceException,
  AttendanceExceptionList,
  AttendanceExceptionUpdate,
  JobProfile,
  JobProfileList,
  JobProfileUpdate,
  ManagedUser,
  ManagedUserDetail,
  ManagedUserList,
  PermissionGroup,
  PermissionGroupList,
  PropertyCode,
  UserAdminAction,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
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

interface JobProfileRow {
  id: string;
  title: string;
  department: string;
  minimum_headcount: number;
  relief_required: boolean;
}

interface AttendanceExceptionRow {
  id: string;
  employee_name: string;
  exception_type: AttendanceException["exceptionType"];
  start_date: string | Date;
  status: AttendanceException["status"];
  notes: string;
}

interface UserAdminActionRow {
  id: string;
  label: string;
  style: UserAdminAction["style"];
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

function toIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

export class PostgresUsersRepository implements UserRepository {
  constructor(private readonly db: Queryable) {}

  private async buildUserDetail(userId: string): Promise<ManagedUserDetail | null> {
    const detailResult = await this.db.query<ManagedUserDetailRow>(
      `
        SELECT
          id,
          display_name,
          email,
          status,
          role_label,
          last_seen_at,
          last_action_text
        FROM shared.user_account
        WHERE id = $1
      `,
      [userId]
    );

    const row = detailResult.rows[0];
    if (!row) {
      return null;
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
    const accessResult = await this.db.query<{ user_id: string }>(
      `
        SELECT user_id
        FROM shared.user_property_access
        WHERE user_id = $1
          AND railroad_code = $2
      `,
      [userId, propertyCode]
    );

    if (!accessResult.rows[0]) {
      return getManagedUserDetail(userId, propertyCode);
    }

    return (await this.buildUserDetail(userId)) ?? getManagedUserDetail(userId, propertyCode);
  }

  async updateUserPropertyAccess(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPropertyAccessUpdate
  ): Promise<ManagedUserDetail> {
    await this.db.query("BEGIN");

    try {
      await this.db.query("DELETE FROM shared.user_property_access WHERE user_id = $1", [userId]);
      await this.db.query(
        `
          INSERT INTO shared.user_property_access (user_id, railroad_code)
          SELECT $1, UNNEST($2::TEXT[])
        `,
        [userId, update.propertyAccess]
      );
      await this.db.query("COMMIT");
    } catch (error) {
      await this.db.query("ROLLBACK");
      throw error;
    }

    return (await this.buildUserDetail(userId)) ?? getManagedUserDetail(userId, propertyCode);
  }

  async updateUserPermissionGroups(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPermissionGroupUpdate
  ): Promise<ManagedUserDetail> {
    await this.db.query(
      `
        DELETE FROM shared.user_permission_group upg
        USING shared.permission_group pg
        WHERE upg.permission_group_id = pg.id
          AND upg.user_id = $1
          AND pg.railroad_code = $2
      `,
      [userId, propertyCode]
    );

    if (update.groups.length > 0) {
      await this.db.query(
        `
          INSERT INTO shared.user_permission_group (user_id, permission_group_id)
          SELECT $1, pg.id
          FROM shared.permission_group pg
          WHERE pg.railroad_code = $2
            AND pg.name = ANY($3::TEXT[])
        `,
        [userId, propertyCode, update.groups]
      );
    }

    return (await this.buildUserDetail(userId)) ?? getManagedUserDetail(userId, propertyCode);
  }

  async listUserAdminActions(): Promise<UserAdminActionList> {
    const result = await this.db.query<UserAdminActionRow>(
      `
        SELECT
          id,
          label,
          style
        FROM shared.user_admin_action
        ORDER BY display_order, id
      `
    );

    if (!result.rows.length) {
      return listUserAdminActions();
    }

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        label: row.label,
        style: row.style
      }))
    };
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

  async listJobProfiles(propertyCode: PropertyCode): Promise<JobProfileList> {
    const result = await this.db.query<JobProfileRow>(
      `
        SELECT
          id,
          title,
          department,
          minimum_headcount,
          relief_required
        FROM shared.job_profile
        WHERE railroad_code = $1
        ORDER BY title
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listJobProfiles(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): JobProfile => ({
          id: row.id,
          title: row.title,
          department: row.department,
          minimumHeadcount: row.minimum_headcount,
          reliefRequired: row.relief_required
        })
      )
    };
  }

  async updateJobProfile(
    propertyCode: PropertyCode,
    profileId: string,
    update: JobProfileUpdate
  ): Promise<JobProfile> {
    await this.db.query(
      `
        UPDATE shared.job_profile
        SET
          department = $3,
          minimum_headcount = $4,
          relief_required = $5
        WHERE railroad_code = $1
          AND id = $2
      `,
      [
        propertyCode,
        profileId,
        update.department,
        update.minimumHeadcount,
        update.reliefRequired
      ]
    );

    const result = await this.db.query<JobProfileRow>(
      `
        SELECT
          id,
          title,
          department,
          minimum_headcount,
          relief_required
        FROM shared.job_profile
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, profileId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("job_profile.not_found");
    }

    return {
      id: row.id,
      title: row.title,
      department: row.department,
      minimumHeadcount: row.minimum_headcount,
      reliefRequired: row.relief_required
    };
  }

  async listAttendanceExceptions(propertyCode: PropertyCode): Promise<AttendanceExceptionList> {
    const result = await this.db.query<AttendanceExceptionRow>(
      `
        SELECT
          id,
          employee_name,
          exception_type,
          start_date,
          status,
          notes
        FROM shared.attendance_exception
        WHERE railroad_code = $1
        ORDER BY start_date DESC, employee_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listAttendanceExceptions(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): AttendanceException => ({
          id: row.id,
          employeeName: row.employee_name,
          exceptionType: row.exception_type,
          startDate: toIsoDate(row.start_date),
          status: row.status,
          notes: row.notes
        })
      )
    };
  }

  async updateAttendanceException(
    propertyCode: PropertyCode,
    exceptionId: string,
    update: AttendanceExceptionUpdate
  ): Promise<AttendanceException> {
    await this.db.query(
      `
        UPDATE shared.attendance_exception
        SET
          status = $3,
          notes = $4
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, exceptionId, update.status, update.notes]
    );

    const result = await this.db.query<AttendanceExceptionRow>(
      `
        SELECT
          id,
          employee_name,
          exception_type,
          start_date,
          status,
          notes
        FROM shared.attendance_exception
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, exceptionId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("attendance_exception.not_found");
    }

    return {
      id: row.id,
      employeeName: row.employee_name,
      exceptionType: row.exception_type,
      startDate: toIsoDate(row.start_date),
      status: row.status,
      notes: row.notes
    };
  }
}
