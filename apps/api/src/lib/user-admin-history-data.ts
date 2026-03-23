import { randomUUID } from "node:crypto";

import type { PropertyCode, UserAdminHistoryEntry, UserAdminHistoryList } from "@tps/types";

const initialHistoryCatalog: Partial<Record<PropertyCode, UserAdminHistoryEntry[]>> = {
  caltrain: [
    {
      id: "user-history-ops-manager-1",
      userId: "ops-manager",
      action: "reset-password",
      actorName: "Jordan Reyes",
      summary: "Password reset sent on 2026-03-01",
      createdAt: "2026-03-01T08:15:00Z"
    },
    {
      id: "user-history-reporting-admin-1",
      userId: "reporting-admin",
      action: "resend-invite",
      actorName: "Casey Morgan",
      summary: "Invitation resent on 2026-03-05",
      createdAt: "2026-03-05T17:20:00Z"
    }
  ]
};

const historyCatalog: Partial<Record<PropertyCode, UserAdminHistoryEntry[]>> = cloneHistoryCatalog(
  initialHistoryCatalog
);

function cloneHistoryCatalog(
  source: Partial<Record<PropertyCode, UserAdminHistoryEntry[]>>
): Partial<Record<PropertyCode, UserAdminHistoryEntry[]>> {
  return Object.fromEntries(
    Object.entries(source).map(([propertyCode, items]) => [
      propertyCode,
      items.map((item) => ({ ...item }))
    ])
  ) as Partial<Record<PropertyCode, UserAdminHistoryEntry[]>>;
}

export function listUserAdminHistory(
  propertyCode: PropertyCode,
  userId: string
): UserAdminHistoryList {
  return {
    items: (historyCatalog[propertyCode] ?? []).filter((entry) => entry.userId === userId)
  };
}

export function recordUserAdminHistory(
  propertyCode: PropertyCode,
  userId: string,
  action: string,
  actorName: string,
  summary: string
): UserAdminHistoryEntry {
  const entry: UserAdminHistoryEntry = {
    id: `user-history-${randomUUID()}`,
    userId,
    action,
    actorName,
    summary,
    createdAt: new Date().toISOString()
  };

  if (!historyCatalog[propertyCode]) {
    historyCatalog[propertyCode] = [];
  }

  historyCatalog[propertyCode]!.unshift(entry);
  return entry;
}

export function resetUserAdminHistoryData(): void {
  for (const propertyCode of Object.keys(historyCatalog) as PropertyCode[]) {
    delete historyCatalog[propertyCode];
  }

  Object.assign(historyCatalog, cloneHistoryCatalog(initialHistoryCatalog));
}
