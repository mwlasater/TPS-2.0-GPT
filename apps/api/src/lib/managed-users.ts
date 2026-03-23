import { randomUUID } from "node:crypto";

import type { ManagedUser, ManagedUserCreate, ManagedUserList, PropertyCode } from "@tps/types";

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

const usersById = new Map(defaultUsers.map((user) => [user.id, { ...user }]));
const initialUserIds = defaultUsers.map((user) => user.id);

const propertyRoleOverrides: Partial<Record<PropertyCode, string[]>> = {
  capmetro: ["Transit Operations Manager", "Dispatcher", "Maintenance Liaison"],
  tre: ["Rail Operations Manager", "Crew Dispatcher", "Reporting Admin"],
  kcstreetcar: ["Streetcar Operations Lead", "Dispatcher", "Reporting Admin"]
};

export function listManagedUsers(propertyCode: PropertyCode): ManagedUserList {
  const overrides = propertyRoleOverrides[propertyCode];

  return {
    items: Array.from(usersById.values()).map((user, index) => ({
      ...user,
      roleLabel: overrides?.[index] ?? user.roleLabel
    }))
  };
}

export function upsertManagedUser(user: ManagedUser): ManagedUser {
  usersById.set(user.id, { ...user });
  return usersById.get(user.id)!;
}

export function createManagedUser(input: ManagedUserCreate): ManagedUser {
  const user: ManagedUser = {
    id: `user-${randomUUID()}`,
    displayName: input.displayName,
    email: input.email,
    status: "invited",
    roleLabel: input.roleLabel,
    lastSeen: ""
  };

  return upsertManagedUser(user);
}

export function resetManagedUsers(): void {
  usersById.clear();

  for (const userId of initialUserIds) {
    const user = defaultUsers.find((candidate) => candidate.id === userId);

    if (user) {
      usersById.set(user.id, { ...user });
    }
  }
}
