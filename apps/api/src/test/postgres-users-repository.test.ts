import { describe, expect, it, vi } from "vitest";

import { PostgresUsersRepository } from "../repositories/postgres-users-repository.js";

describe("PostgresUsersRepository", () => {
  it("maps managed user rows into a property-scoped user list", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "ops-manager",
          display_name: "Jordan Reyes",
          email: "jordan.reyes@herzog.com",
          status: "active",
          role_label: "Operations Manager",
          last_seen_at: new Date("2026-03-06T14:10:00Z")
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const users = await repository.listUsers("caltrain");

    expect(users).toEqual({
      items: [
        {
          id: "ops-manager",
          displayName: "Jordan Reyes",
          email: "jordan.reyes@herzog.com",
          status: "active",
          roleLabel: "Operations Manager",
          lastSeen: "2026-03-06T14:10:00.000Z"
        }
      ]
    });
  });

  it("maps user detail rows into a managed user detail payload", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: "ops-manager",
            display_name: "Jordan Reyes",
            email: "jordan.reyes@herzog.com",
            status: "active",
            role_label: "Operations Manager",
            last_seen_at: new Date("2026-03-06T14:10:00Z"),
            last_action_text: "Password reset sent on 2026-03-01"
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ railroad_code: "caltrain" }, { railroad_code: "capmetro" }]
      })
      .mockResolvedValueOnce({
        rows: [{ name: "Dispatch Leadership" }, { name: "Operations Admin" }]
      });

    const repository = new PostgresUsersRepository({ query });
    const user = await repository.getUserDetail("ops-manager", "caltrain");

    expect(user).toEqual({
      id: "ops-manager",
      displayName: "Jordan Reyes",
      email: "jordan.reyes@herzog.com",
      status: "active",
      roleLabel: "Operations Manager",
      lastSeen: "2026-03-06T14:10:00.000Z",
      propertyAccess: ["caltrain", "capmetro"],
      groups: ["Dispatch Leadership", "Operations Admin"],
      lastAction: "Password reset sent on 2026-03-01"
    });
  });

  it("maps permission group rows into permission groups", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: 12,
          name: "Operations Admin",
          description: "Full operational control across schedules, runs, delays, and crew.",
          permissions: [
            "schedules.write",
            "runs.approve",
            "delays.write",
            "crew.assign"
          ],
          member_count: 2
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const groups = await repository.listPermissionGroups("caltrain");

    expect(groups).toEqual({
      items: [
        {
          id: "12",
          name: "Operations Admin",
          description: "Full operational control across schedules, runs, delays, and crew.",
          members: 2,
          permissions: [
            "schedules.write",
            "runs.approve",
            "delays.write",
            "crew.assign"
          ]
        }
      ]
    });
  });
});
