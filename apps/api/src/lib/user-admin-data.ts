import { randomUUID } from "node:crypto";

import type {
  ManagedUserCreate,
  UserAdminAction,
  ManagedUserDetail,
  PropertyCode,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";
import { createManagedUser, upsertManagedUser } from "./managed-users.js";

const actionPermissionMap: Record<string, string> = {
  "reset-password": "users.manage",
  "resend-invite": "users.invite",
  "disable-user": "users.manage",
  "enable-user": "users.manage"
};

const userDetails: Record<string, Omit<ManagedUserDetail, "propertyAccess">> = {
  "ops-manager": {
    id: "ops-manager",
    displayName: "Jordan Reyes",
    email: "jordan.reyes@herzog.com",
    status: "active",
    roleLabel: "Operations Manager",
    lastSeen: "2026-03-06T14:10:00Z",
    groups: ["Operations Admin", "Dispatch Leadership"],
    lastAction: "Password reset sent on 2026-03-01"
  },
  "dispatcher-1": {
    id: "dispatcher-1",
    displayName: "Taylor Brooks",
    email: "taylor.brooks@herzog.com",
    status: "active",
    roleLabel: "Dispatcher",
    lastSeen: "2026-03-06T13:45:00Z",
    groups: ["Dispatcher"],
    lastAction: "Invite accepted on 2026-02-19"
  },
  "reporting-admin": {
    id: "reporting-admin",
    displayName: "Casey Morgan",
    email: "casey.morgan@herzog.com",
    status: "invited",
    roleLabel: "Reporting Admin",
    lastSeen: "2026-03-05T17:20:00Z",
    groups: ["Reporting Admin"],
    lastAction: "Invitation resent on 2026-03-05"
  }
};
const initialUserDetails = JSON.parse(JSON.stringify(userDetails)) as typeof userDetails;

const defaultActions: UserAdminActionList = {
  items: [
    {
      id: "reset-password",
      label: "Reset Password",
      style: "primary",
      requiredPermission: "users.manage",
      isAllowed: true
    },
    {
      id: "resend-invite",
      label: "Resend Invite",
      style: "secondary",
      requiredPermission: "users.invite",
      isAllowed: true
    },
    {
      id: "disable-user",
      label: "Disable User",
      style: "warning",
      requiredPermission: "users.manage",
      isAllowed: true
    },
    {
      id: "enable-user",
      label: "Enable User",
      style: "primary",
      requiredPermission: "users.manage",
      isAllowed: true
    }
  ]
};

const propertyAccessByUser: Partial<Record<string, PropertyCode[]>> = {
  "ops-manager": ["caltrain", "capmetro"],
  "dispatcher-1": ["caltrain", "tre"],
  "reporting-admin": ["caltrain"]
};
const initialPropertyAccessByUser = JSON.parse(
  JSON.stringify(propertyAccessByUser)
) as typeof propertyAccessByUser;

const groupsByUser: Partial<Record<string, string[]>> = {
  "ops-manager": ["Operations Admin", "Dispatch Leadership"],
  "dispatcher-1": ["Dispatcher"],
  "reporting-admin": ["Reporting Admin"]
};
const initialGroupsByUser = JSON.parse(JSON.stringify(groupsByUser)) as typeof groupsByUser;

export function getManagedUserDetail(userId: string, propertyCode: PropertyCode): ManagedUserDetail {
  const base = userDetails[userId];

  if (!base) {
    throw new Error("managed_user.not_found");
  }

  return {
    ...base,
    propertyAccess: propertyAccessByUser[userId] ?? [propertyCode],
    groups: groupsByUser[userId] ?? base.groups
  };
}

export function updateManagedUserPropertyAccess(
  userId: string,
  propertyCode: PropertyCode,
  update: UserPropertyAccessUpdate
): ManagedUserDetail {
  propertyAccessByUser[userId] = [...update.propertyAccess];
  return getManagedUserDetail(userId, propertyCode);
}

export function updateManagedUserPermissionGroups(
  userId: string,
  propertyCode: PropertyCode,
  update: UserPermissionGroupUpdate
): ManagedUserDetail {
  groupsByUser[userId] = [...update.groups];
  return getManagedUserDetail(userId, propertyCode);
}

export function getUserAdminActionPermission(actionId: string): string {
  const permission = actionPermissionMap[actionId];

  if (!permission) {
    throw new Error("user_admin_action.not_found");
  }

  return permission;
}

export function listUserAdminActions(actorPermissions: string[] = []): UserAdminActionList {
  return {
    items: defaultActions.items.map(
      (action): UserAdminAction => ({
        ...action,
        isAllowed: actorPermissions.includes(action.requiredPermission)
      })
    )
  };
}

export function createManagedUserDetail(
  propertyCode: PropertyCode,
  input: ManagedUserCreate
): ManagedUserDetail {
  const summary = createManagedUser(input);
  const userId = summary.id || `user-${randomUUID()}`;
  const detail: Omit<ManagedUserDetail, "propertyAccess"> = {
    ...summary,
    id: userId,
    groups: [...input.groups],
    lastAction: "Invitation sent on 2026-03-20"
  };

  userDetails[userId] = detail;
  propertyAccessByUser[userId] = [...input.propertyAccess];
  groupsByUser[userId] = [...input.groups];
  upsertManagedUser({
    ...summary,
    id: userId
  });

  return getManagedUserDetail(userId, propertyCode);
}

export function executeUserAdminAction(
  userId: string,
  propertyCode: PropertyCode,
  actionId: string
): ManagedUserDetail {
  const detail = userDetails[userId];

  if (!detail) {
    throw new Error("managed_user.not_found");
  }

  switch (actionId) {
    case "reset-password":
      detail.lastAction = "Password reset sent on 2026-03-13";
      break;
    case "resend-invite":
      detail.status = "invited";
      detail.lastAction = "Invitation resent on 2026-03-13";
      break;
    case "disable-user":
      detail.status = "disabled";
      detail.lastAction = "User disabled on 2026-03-13";
      break;
    case "enable-user":
      detail.status = "active";
      detail.lastAction = "User enabled on 2026-03-20";
      break;
    default:
      throw new Error("user_admin_action.not_found");
  }

  userDetails[userId] = detail;
  upsertManagedUser({
    id: detail.id,
    displayName: detail.displayName,
    email: detail.email,
    status: detail.status,
    roleLabel: detail.roleLabel,
    lastSeen: detail.lastSeen
  });
  return getManagedUserDetail(userId, propertyCode);
}

export function getUserAdminActionSummary(actionId: string): string {
  switch (actionId) {
    case "reset-password":
      return "Password reset sent on 2026-03-13";
    case "resend-invite":
      return "Invitation resent on 2026-03-13";
    case "disable-user":
      return "User disabled on 2026-03-13";
    case "enable-user":
      return "User enabled on 2026-03-20";
    default:
      throw new Error("user_admin_action.not_found");
  }
}

export function resetUserAdminData(): void {
  for (const userId of Object.keys(userDetails)) {
    delete userDetails[userId];
  }

  for (const [userId, detail] of Object.entries(initialUserDetails)) {
    userDetails[userId] = { ...detail, groups: [...detail.groups] };
  }

  for (const userId of Object.keys(propertyAccessByUser)) {
    delete propertyAccessByUser[userId];
  }

  for (const [userId, propertyAccess] of Object.entries(initialPropertyAccessByUser)) {
    propertyAccessByUser[userId] = [...(propertyAccess ?? [])];
  }

  for (const userId of Object.keys(groupsByUser)) {
    delete groupsByUser[userId];
  }

  for (const [userId, groups] of Object.entries(initialGroupsByUser)) {
    groupsByUser[userId] = [...(groups ?? [])];
  }
}
