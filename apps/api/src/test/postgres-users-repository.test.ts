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
        rows: [{ user_id: "ops-manager" }]
      })
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

  it("updates user property access and returns refreshed detail", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
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
        rows: [{ railroad_code: "caltrain" }, { railroad_code: "tre" }]
      })
      .mockResolvedValueOnce({
        rows: [{ name: "Dispatch Leadership" }, { name: "Operations Admin" }]
      });

    const repository = new PostgresUsersRepository({ query });
    const user = await repository.updateUserPropertyAccess("ops-manager", "caltrain", {
      propertyAccess: ["caltrain", "tre"]
    });

    expect(user).toEqual({
      id: "ops-manager",
      displayName: "Jordan Reyes",
      email: "jordan.reyes@herzog.com",
      status: "active",
      roleLabel: "Operations Manager",
      lastSeen: "2026-03-06T14:10:00.000Z",
      propertyAccess: ["caltrain", "tre"],
      groups: ["Dispatch Leadership", "Operations Admin"],
      lastAction: "Password reset sent on 2026-03-01"
    });
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO shared.user_property_access"),
      ["ops-manager", ["caltrain", "tre"]]
    );
  });

  it("updates user permission groups for a property and returns refreshed detail", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
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
        rows: [{ name: "Dispatch Leadership" }]
      });

    const repository = new PostgresUsersRepository({ query });
    const user = await repository.updateUserPermissionGroups("ops-manager", "caltrain", {
      groups: ["Dispatch Leadership"]
    });

    expect(user).toEqual({
      id: "ops-manager",
      displayName: "Jordan Reyes",
      email: "jordan.reyes@herzog.com",
      status: "active",
      roleLabel: "Operations Manager",
      lastSeen: "2026-03-06T14:10:00.000Z",
      propertyAccess: ["caltrain", "capmetro"],
      groups: ["Dispatch Leadership"],
      lastAction: "Password reset sent on 2026-03-01"
    });
    expect(query).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("INSERT INTO shared.user_permission_group"),
      ["ops-manager", "caltrain", ["Dispatch Leadership"]]
    );
  });

  it("maps persisted user admin actions", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "reset-password",
          label: "Reset Password",
          style: "primary"
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const actions = await repository.listUserAdminActions();

    expect(actions).toEqual({
      items: [
        {
          id: "reset-password",
          label: "Reset Password",
          style: "primary"
        }
      ]
    });
  });

  it("maps job profile rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "job_caltrain_engineer",
          title: "Engineer",
          department: "Transportation",
          minimum_headcount: 1,
          relief_required: true
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const profiles = await repository.listJobProfiles("caltrain");

    expect(profiles).toEqual({
      items: [
        {
          id: "job_caltrain_engineer",
          title: "Engineer",
          department: "Transportation",
          minimumHeadcount: 1,
          reliefRequired: true
        }
      ]
    });
  });

  it("updates job profile rows", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "job_caltrain_engineer",
            title: "Engineer",
            department: "Operations Control",
            minimum_headcount: 2,
            relief_required: false
          }
        ]
      });

    const repository = new PostgresUsersRepository({ query });
    const profile = await repository.updateJobProfile("caltrain", "job_caltrain_engineer", {
      department: "Operations Control",
      minimumHeadcount: 2,
      reliefRequired: false
    });

    expect(profile).toEqual({
      id: "job_caltrain_engineer",
      title: "Engineer",
      department: "Operations Control",
      minimumHeadcount: 2,
      reliefRequired: false
    });
  });

  it("maps attendance exception rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "att_caltrain_1",
          employee_name: "Casey Morgan",
          exception_type: "absence",
          start_date: new Date("2026-03-06T00:00:00Z"),
          status: "approved",
          notes: "Approved medical leave."
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const exceptions = await repository.listAttendanceExceptions("caltrain");

    expect(exceptions).toEqual({
      items: [
        {
          id: "att_caltrain_1",
          employeeName: "Casey Morgan",
          exceptionType: "absence",
          startDate: "2026-03-06",
          status: "approved",
          notes: "Approved medical leave."
        }
      ]
    });
  });

  it("updates attendance exception rows", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "att_caltrain_1",
            employee_name: "Casey Morgan",
            exception_type: "absence",
            start_date: new Date("2026-03-06T00:00:00Z"),
            status: "resolved",
            notes: "Cleared for duty."
          }
        ]
      });

    const repository = new PostgresUsersRepository({ query });
    const exception = await repository.updateAttendanceException("caltrain", "att_caltrain_1", {
      status: "resolved",
      notes: "Cleared for duty."
    });

    expect(exception).toEqual({
      id: "att_caltrain_1",
      employeeName: "Casey Morgan",
      exceptionType: "absence",
      startDate: "2026-03-06",
      status: "resolved",
      notes: "Cleared for duty."
    });
  });
});
