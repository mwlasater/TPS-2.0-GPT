import { randomUUID } from "node:crypto";

import type {
  AttendanceException,
  AttendanceExceptionList,
  AttendanceExceptionUpdate,
  JobProfile,
  JobProfileList,
  JobProfileUpdate,
  ManagedUser,
  ManagedUserCreate,
  ManagedUserDetail,
  ManagedUserList,
  UserAdminHistoryEntry,
  UserAdminHistoryList,
  PersonnelRecord,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PermissionGroup,
  PermissionGroupCreate,
  PermissionGroupDeleteResult,
  PermissionGroupList,
  PermissionGroupUpdate,
  PropertyCode,
  UserAdminAction,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";

import { listAttendanceExceptions, listJobProfiles } from "../lib/baseline-data.js";
import { listManagedUsers } from "../lib/managed-users.js";
import { listPersonnelRecords } from "../lib/personnel-data.js";
import { listPermissionGroups } from "../lib/permission-groups.js";
import {
  getManagedUserDetail,
  getUserAdminActionSummary,
  getUserAdminActionPermission,
  listUserAdminActions
} from "../lib/user-admin-data.js";

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

interface PersonnelRecordRow {
  id: string;
  employee_id: string;
  employee_name: string;
  status: PersonnelRecord["status"];
  primary_role: string;
  certifications: string[];
}

interface UserAdminActionRow {
  id: string;
  label: string;
  style: UserAdminAction["style"];
}

interface UserAdminHistoryRow {
  id: string;
  user_id: string;
  action_name: string;
  actor_name: string;
  summary_text: string;
  created_at: string | Date;
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

  private async recordUserAdminHistory(
    userId: string,
    action: string,
    actorName: string,
    summary: string
  ): Promise<void> {
    await this.db.query(
      `
        INSERT INTO shared.user_admin_history (
          id,
          user_id,
          action_name,
          actor_name,
          summary_text
        )
        VALUES ($1, $2, $3, $4, $5)
      `,
      [randomUUID(), userId, action, actorName, summary]
    );
  }

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

  async createUser(
    propertyCode: PropertyCode,
    input: ManagedUserCreate,
    actorName: string
  ): Promise<ManagedUserDetail> {
    const userId = `user-${randomUUID()}`;

    await this.db.query("BEGIN");

    try {
      await this.db.query(
        `
          INSERT INTO shared.user_account (
            id,
            display_name,
            email,
            status,
            role_label,
            last_seen_at,
            last_action_text
          )
          VALUES ($1, $2, $3, 'invited', $4, NULL, $5)
        `,
        [userId, input.displayName, input.email, input.roleLabel, "Invitation sent on 2026-03-20"]
      );

      await this.db.query(
        `
          INSERT INTO shared.user_property_access (user_id, railroad_code)
          SELECT $1, UNNEST($2::TEXT[])
        `,
        [userId, input.propertyAccess]
      );

      if (input.groups.length > 0) {
        await this.db.query(
          `
            INSERT INTO shared.user_permission_group (user_id, permission_group_id)
            SELECT $1, pg.id
            FROM shared.permission_group pg
            WHERE pg.railroad_code = $2
              AND pg.name = ANY($3::TEXT[])
          `,
          [userId, propertyCode, input.groups]
        );
      }

      await this.recordUserAdminHistory(
        userId,
        "invite-user",
        actorName,
        "Invitation sent on 2026-03-20"
      );

      await this.db.query("COMMIT");
    } catch (error) {
      await this.db.query("ROLLBACK");
      throw error;
    }

    return (await this.buildUserDetail(userId)) ?? getManagedUserDetail(userId, propertyCode);
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

  async listUserAdminHistory(
    userId: string,
    propertyCode: PropertyCode
  ): Promise<UserAdminHistoryList> {
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
      return { items: [] };
    }

    const result = await this.db.query<UserAdminHistoryRow>(
      `
        SELECT
          id,
          user_id,
          action_name,
          actor_name,
          summary_text,
          created_at
        FROM shared.user_admin_history
        WHERE user_id = $1
        ORDER BY created_at DESC
      `,
      [userId]
    );

    return {
      items: result.rows.map(
        (row): UserAdminHistoryEntry => ({
          id: row.id,
          userId: row.user_id,
          action: row.action_name,
          actorName: row.actor_name,
          summary: row.summary_text,
          createdAt: toIsoTimestamp(row.created_at)
        })
      )
    };
  }

  async executeUserAdminAction(
    userId: string,
    propertyCode: PropertyCode,
    actionId: string,
    actorName: string
  ): Promise<ManagedUserDetail> {
    const status =
      actionId === "disable-user"
        ? "disabled"
        : actionId === "resend-invite"
          ? "invited"
          : actionId === "enable-user"
            ? "active"
            : null;
    const lastAction =
      actionId === "reset-password"
        ? "Password reset sent on 2026-03-13"
        : actionId === "resend-invite"
          ? "Invitation resent on 2026-03-13"
          : actionId === "disable-user"
            ? "User disabled on 2026-03-13"
            : actionId === "enable-user"
              ? "User enabled on 2026-03-20"
            : null;

    if (!lastAction) {
      throw new Error("user_admin_action.not_found");
    }

    await this.db.query(
      `
        UPDATE shared.user_account
        SET
          status = COALESCE($2, status),
          last_action_text = $3
        WHERE id = $1
      `,
      [userId, status, lastAction]
    );

    await this.recordUserAdminHistory(userId, actionId, actorName, getUserAdminActionSummary(actionId));

    return (await this.getUserDetail(userId, propertyCode)) ?? getManagedUserDetail(userId, propertyCode);
  }

  async updateUserPropertyAccess(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPropertyAccessUpdate,
    actorName: string
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
      await this.recordUserAdminHistory(
        userId,
        "property-access-updated",
        actorName,
        `Property access updated to ${update.propertyAccess.join(", ")}`
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
    update: UserPermissionGroupUpdate,
    actorName: string
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

    await this.recordUserAdminHistory(
      userId,
      "permission-groups-updated",
      actorName,
      `Permission groups updated to ${update.groups.join(", ")}`
    );

    return (await this.buildUserDetail(userId)) ?? getManagedUserDetail(userId, propertyCode);
  }

  async listUserAdminActions(
    _propertyCode: PropertyCode,
    actorPermissions: string[]
  ): Promise<UserAdminActionList> {
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
      return listUserAdminActions(actorPermissions);
    }

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        label: row.label,
        style: row.style,
        requiredPermission: getUserAdminActionPermission(row.id),
        isAllowed: actorPermissions.includes(getUserAdminActionPermission(row.id))
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

  async updatePermissionGroup(
    propertyCode: PropertyCode,
    groupId: string,
    update: PermissionGroupUpdate
  ): Promise<void> {
    const result = await this.db.query(
      `
        UPDATE shared.permission_group
        SET
          description = $3,
          permissions = $4
        WHERE railroad_code = $1
          AND id = $2::BIGINT
      `,
      [propertyCode, groupId, update.description, update.permissions]
    );

    if ((result as { rowCount?: number }).rowCount === 0) {
      throw new Error("permission_group.not_found");
    }
  }

  async createPermissionGroup(
    propertyCode: PropertyCode,
    input: PermissionGroupCreate
  ): Promise<void> {
    await this.db.query(
      `
        INSERT INTO shared.permission_group (
          railroad_code,
          name,
          description,
          permissions
        )
        VALUES ($1, $2, $3, $4)
      `,
      [propertyCode, input.name, input.description, input.permissions]
    );
  }

  async deletePermissionGroup(
    propertyCode: PropertyCode,
    groupId: string
  ): Promise<PermissionGroupDeleteResult> {
    const result = await this.db.query(
      `
        DELETE FROM shared.permission_group
        WHERE railroad_code = $1
          AND id = $2::BIGINT
      `,
      [propertyCode, groupId]
    );

    if ((result as { rowCount?: number }).rowCount === 0) {
      throw new Error("permission_group.not_found");
    }

    return {
      deletedGroupId: groupId
    };
  }

  async listPersonnelRecords(propertyCode: PropertyCode): Promise<PersonnelRecordList> {
    const result = await this.db.query<PersonnelRecordRow>(
      `
        SELECT
          id,
          employee_id,
          employee_name,
          status,
          primary_role,
          certifications
        FROM shared.personnel_record
        WHERE railroad_code = $1
        ORDER BY employee_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listPersonnelRecords(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): PersonnelRecord => ({
          id: row.id,
          employeeId: row.employee_id,
          employeeName: row.employee_name,
          status: row.status,
          primaryRole: row.primary_role,
          certifications: row.certifications
        })
      )
    };
  }

  async updatePersonnelStatus(
    propertyCode: PropertyCode,
    personnelId: string,
    update: PersonnelStatusUpdate
  ): Promise<PersonnelRecord> {
    const result = await this.db.query<PersonnelRecordRow>(
      `
        UPDATE shared.personnel_record
        SET
          status = $3,
          primary_role = $4
        WHERE railroad_code = $1
          AND id = $2
        RETURNING
          id,
          employee_id,
          employee_name,
          status,
          primary_role,
          certifications
      `,
      [propertyCode, personnelId, update.status, update.primaryRole]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("personnel_record.not_found");
    }

    return {
      id: row.id,
      employeeId: row.employee_id,
      employeeName: row.employee_name,
      status: row.status,
      primaryRole: row.primary_role,
      certifications: row.certifications
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
