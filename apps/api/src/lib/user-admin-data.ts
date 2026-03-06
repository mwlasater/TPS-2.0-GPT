import type {
  ManagedUserDetail,
  PropertyCode,
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

export function getManagedUserDetail(userId: string, propertyCode: PropertyCode): ManagedUserDetail {
  const base = userDetails[userId] ?? userDetails["ops-manager"]!;
  return {
    ...base,
    propertyAccess: [propertyCode]
  };
}

export function listUserAdminActions(): UserAdminActionList {
  return defaultActions;
}
