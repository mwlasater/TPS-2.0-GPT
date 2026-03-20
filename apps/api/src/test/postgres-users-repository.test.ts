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

  it("creates managed users and returns refreshed detail", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "user-created",
            display_name: "Morgan Lee",
            email: "morgan.lee@herzog.com",
            status: "invited",
            role_label: "Operations Analyst",
            last_seen_at: null,
            last_action_text: "Invitation sent on 2026-03-20"
          }
        ]
      })
      .mockResolvedValueOnce({
        rows: [{ railroad_code: "caltrain" }]
      })
      .mockResolvedValueOnce({
        rows: [{ name: "Reporting Admin" }]
      });

    const repository = new PostgresUsersRepository({ query });
    const user = await repository.createUser("caltrain", {
      displayName: "Morgan Lee",
      email: "morgan.lee@herzog.com",
      roleLabel: "Operations Analyst",
      propertyAccess: ["caltrain"],
      groups: ["Reporting Admin"]
    }, "Local Development User");

    expect(user).toEqual({
      id: "user-created",
      displayName: "Morgan Lee",
      email: "morgan.lee@herzog.com",
      status: "invited",
      roleLabel: "Operations Analyst",
      lastSeen: "",
      propertyAccess: ["caltrain"],
      groups: ["Reporting Admin"],
      lastAction: "Invitation sent on 2026-03-20"
    });
    expect(query).toHaveBeenNthCalledWith(1, "BEGIN");
    expect(query).toHaveBeenNthCalledWith(2, expect.stringContaining("INSERT INTO shared.user_account"), [
      expect.stringMatching(/^user-/),
      "Morgan Lee",
      "morgan.lee@herzog.com",
      "Operations Analyst",
      "Invitation sent on 2026-03-20"
    ]);
    expect(query).toHaveBeenNthCalledWith(
      3,
      expect.stringContaining("INSERT INTO shared.user_property_access"),
      [expect.stringMatching(/^user-/), ["caltrain"]]
    );
    expect(query).toHaveBeenNthCalledWith(
      4,
      expect.stringContaining("INSERT INTO shared.user_permission_group"),
      [expect.stringMatching(/^user-/), "caltrain", ["Reporting Admin"]]
    );
    expect(query).toHaveBeenNthCalledWith(
      5,
      expect.stringContaining("INSERT INTO shared.user_admin_history"),
      [
        expect.any(String),
        expect.stringMatching(/^user-/),
        "invite-user",
        "Local Development User",
        "Invitation sent on 2026-03-20"
      ]
    );
  });

  it("maps user admin history rows into entries", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [{ user_id: "ops-manager" }]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "user-history-1",
            user_id: "ops-manager",
            action_name: "reset-password",
            actor_name: "Jordan Reyes",
            summary_text: "Password reset sent on 2026-03-01",
            created_at: new Date("2026-03-01T08:15:00Z")
          }
        ]
      });

    const repository = new PostgresUsersRepository({ query });
    const history = await repository.listUserAdminHistory("ops-manager", "caltrain");

    expect(history).toEqual({
      items: [
        {
          id: "user-history-1",
          userId: "ops-manager",
          action: "reset-password",
          actorName: "Jordan Reyes",
          summary: "Password reset sent on 2026-03-01",
          createdAt: "2026-03-01T08:15:00.000Z"
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

  it("updates permission group definitions", async () => {
    const query = vi.fn().mockResolvedValueOnce({ rowCount: 1 });

    const repository = new PostgresUsersRepository({ query });
    await repository.updatePermissionGroup("caltrain", "12", {
      description: "Expanded operational admin coverage.",
      permissions: ["schedules.write", "runs.approve", "reports.schedule"]
    });

    expect(query).toHaveBeenCalledWith(
      expect.stringContaining("UPDATE shared.permission_group"),
      ["caltrain", "12", "Expanded operational admin coverage.", ["schedules.write", "runs.approve", "reports.schedule"]]
    );
  });

  it("maps personnel record rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "personnel-1",
          employee_id: "HZG-1001",
          employee_name: "Jordan Reyes",
          status: "active",
          primary_role: "Engineer",
          certifications: ["FRA Engineer", "Rules Qualified"]
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const personnel = await repository.listPersonnelRecords("caltrain");

    expect(personnel).toEqual({
      items: [
        {
          id: "personnel-1",
          employeeId: "HZG-1001",
          employeeName: "Jordan Reyes",
          status: "active",
          primaryRole: "Engineer",
          certifications: ["FRA Engineer", "Rules Qualified"]
        }
      ]
    });
  });

  it("updates personnel record status", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "personnel-1",
          employee_id: "HZG-1001",
          employee_name: "Jordan Reyes",
          status: "on_leave",
          primary_role: "Engineer",
          certifications: ["FRA Engineer", "Rules Qualified"]
        }
      ]
    });

    const repository = new PostgresUsersRepository({ query });
    const personnel = await repository.updatePersonnelStatus("caltrain", "personnel-1", {
      status: "on_leave",
      primaryRole: "Engineer"
    });

    expect(personnel).toEqual({
      id: "personnel-1",
      employeeId: "HZG-1001",
      employeeName: "Jordan Reyes",
      status: "on_leave",
      primaryRole: "Engineer",
      certifications: ["FRA Engineer", "Rules Qualified"]
    });
  });

  it("updates user property access and returns refreshed detail", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
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
    }, "Local Development User");

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
    }, "Local Development User");

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
    const actions = await repository.listUserAdminActions("caltrain", ["users.manage"]);

    expect(actions).toEqual({
      items: [
        {
          id: "reset-password",
          label: "Reset Password",
          style: "primary",
          requiredPermission: "users.manage",
          isAllowed: true
        }
      ]
    });
  });

  it("executes user admin actions and returns refreshed detail", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [{ user_id: "ops-manager" }]
      })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "ops-manager",
            display_name: "Jordan Reyes",
            email: "jordan.reyes@herzog.com",
            status: "disabled",
            role_label: "Operations Manager",
            last_seen_at: new Date("2026-03-06T14:10:00Z"),
            last_action_text: "User disabled on 2026-03-13"
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
    const user = await repository.executeUserAdminAction(
      "ops-manager",
      "caltrain",
      "disable-user",
      "Local Development User"
    );

    expect(user).toEqual({
      id: "ops-manager",
      displayName: "Jordan Reyes",
      email: "jordan.reyes@herzog.com",
      status: "disabled",
      roleLabel: "Operations Manager",
      lastSeen: "2026-03-06T14:10:00.000Z",
      propertyAccess: ["caltrain", "capmetro"],
      groups: ["Dispatch Leadership", "Operations Admin"],
      lastAction: "User disabled on 2026-03-13"
    });
  });

  it("executes enable-user admin actions and returns refreshed detail", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] })
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
            last_action_text: "User enabled on 2026-03-20"
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
    const user = await repository.executeUserAdminAction(
      "ops-manager",
      "caltrain",
      "enable-user",
      "Local Development User"
    );

    expect(user).toEqual({
      id: "ops-manager",
      displayName: "Jordan Reyes",
      email: "jordan.reyes@herzog.com",
      status: "active",
      roleLabel: "Operations Manager",
      lastSeen: "2026-03-06T14:10:00.000Z",
      propertyAccess: ["caltrain", "capmetro"],
      groups: ["Dispatch Leadership", "Operations Admin"],
      lastAction: "User enabled on 2026-03-20"
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
