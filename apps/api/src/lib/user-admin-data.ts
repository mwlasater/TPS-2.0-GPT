import type {
  ManagedUserDetail,
  PropertyCode,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";

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
      style: "primary"
    },
    {
      id: "resend-invite",
      label: "Resend Invite",
      style: "secondary"
    },
    {
      id: "disable-user",
      label: "Disable User",
      style: "warning"
    }
  ]
};

const propertyAccessByUser: Partial<Record<string, PropertyCode[]>> = {
  "ops-manager": ["caltrain", "capmetro"],
  "dispatcher-1": ["caltrain", "tre"],
  "reporting-admin": ["caltrain"]
};

const groupsByUser: Partial<Record<string, string[]>> = {
  "ops-manager": ["Operations Admin", "Dispatch Leadership"],
  "dispatcher-1": ["Dispatcher"],
  "reporting-admin": ["Reporting Admin"]
};

export function getManagedUserDetail(userId: string, propertyCode: PropertyCode): ManagedUserDetail {
  const base = userDetails[userId] ?? userDetails["ops-manager"]!;
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

export function listUserAdminActions(): UserAdminActionList {
  return defaultActions;
}

export function executeUserAdminAction(
  userId: string,
  propertyCode: PropertyCode,
  actionId: string
): ManagedUserDetail {
  const detail = userDetails[userId] ?? userDetails["ops-manager"]!;

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
    default:
      throw new Error("user_admin_action.not_found");
  }

  userDetails[userId] = detail;
  return getManagedUserDetail(userId, propertyCode);
}

export function resetUserAdminData(): void {
  for (const userId of Object.keys(userDetails)) {
    delete userDetails[userId];
  }

  for (const [userId, detail] of Object.entries(initialUserDetails)) {
    userDetails[userId] = { ...detail, groups: [...detail.groups] };
  }
}
