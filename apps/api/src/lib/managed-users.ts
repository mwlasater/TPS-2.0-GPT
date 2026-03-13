import type { ManagedUser, ManagedUserList, PropertyCode } from "@tps/types";

const defaultUsers: ManagedUser[] = [
  {
    id: "ops-manager",
    displayName: "Jordan Reyes",
    email: "jordan.reyes@herzog.com",
    status: "active",
    roleLabel: "Operations Manager",
    lastSeen: "2026-03-06T14:10:00Z"
  },
  {
    id: "dispatcher-1",
    displayName: "Taylor Brooks",
    email: "taylor.brooks@herzog.com",
    status: "active",
    roleLabel: "Dispatcher",
    lastSeen: "2026-03-06T13:45:00Z"
  },
  {
    id: "reporting-admin",
    displayName: "Casey Morgan",
    email: "casey.morgan@herzog.com",
    status: "invited",
    roleLabel: "Reporting Admin",
    lastSeen: "2026-03-05T17:20:00Z"
  }
];

const propertyRoleOverrides: Partial<Record<PropertyCode, string[]>> = {
  capmetro: ["Transit Operations Manager", "Dispatcher", "Maintenance Liaison"],
  tre: ["Rail Operations Manager", "Crew Dispatcher", "Reporting Admin"],
  kcstreetcar: ["Streetcar Operations Lead", "Dispatcher", "Reporting Admin"]
};

export function listManagedUsers(propertyCode: PropertyCode): ManagedUserList {
  const overrides = propertyRoleOverrides[propertyCode];

  return {
    items: defaultUsers.map((user, index) => ({
      ...user,
      roleLabel: overrides?.[index] ?? user.roleLabel
    }))
  };
}
