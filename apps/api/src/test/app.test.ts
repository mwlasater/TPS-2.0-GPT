import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import { buildApp } from "../app.js";
import { resetManagedUsers } from "../lib/managed-users.js";
import { resetApprovalHistoryData } from "../lib/approval-history-data.js";
import { resetUserAdminHistoryData } from "../lib/user-admin-history-data.js";
import { resetFareEnforcementData } from "../lib/fare-enforcement-data.js";
import { resetOperationsData } from "../lib/operations-data.js";
import { resetPersonnelData } from "../lib/personnel-data.js";
import { resetPermissionGroups } from "../lib/permission-groups.js";
import { resetReferenceData } from "../lib/reference-data.js";
import { resetRunDetailData } from "../lib/run-detail-data.js";
import { resetRunResourceData } from "../lib/run-resource-data.js";
import { resetUserAdminData } from "../lib/user-admin-data.js";

const env = {
  NODE_ENV: "test",
  PORT: "3000",
  HOST: "127.0.0.1",
  APP_VERSION: "0.1.0-test",
  API_PREFIX: "/api/v1",
  WEB_ORIGIN: "http://localhost:5173",
  DATABASE_URL: "postgres://tps:tps@localhost:5432/tps",
  JWT_AUDIENCE: "tps-2.0",
  JWT_ISSUER: "https://login.microsoftonline.com/example/v2.0",
  JWT_DEV_TOKEN: "local-dev-token",
  PROPERTY_CODES: "caltrain,capmetro,tre",
  USER_PROPERTY_ACCESS: "local-dev-user:caltrain|capmetro",
  USER_PROPERTY_PERMISSIONS:
    "local-dev-user@caltrain:schedules.write|runs.approve|runs.write|stops.write|delays.write|consist.write|crew.assign|fare.write|users.invite|users.manage|users.access.write|admin.permissions.write|reports.schedule|notifications.write|staffing.write,local-dev-user@capmetro:schedules.write|runs.approve|runs.write|stops.write|delays.write|consist.write|crew.assign|fare.write|users.invite|users.manage|users.access.write|admin.permissions.write|reports.schedule|notifications.write|staffing.write"
};

describe("app contracts", () => {
  const app = buildApp(env);

  function resetMockState() {
    resetApprovalHistoryData();
    resetFareEnforcementData();
    resetOperationsData();
    resetPersonnelData();
    resetPermissionGroups();
    resetReferenceData();
    resetRunDetailData();
    resetRunResourceData();
    resetManagedUsers();
    resetUserAdminData();
    resetUserAdminHistoryData();
  }

  beforeAll(async () => {
    resetMockState();
    await app.ready();
  });

  beforeEach(() => {
    resetMockState();
  });

  afterAll(async () => {
    await app.close();
  });

  it("returns health data", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "ok",
      version: "0.1.0-test"
    });
  });

  it("rejects production startup with dev-token auth config", () => {
    expect(() =>
      buildApp({
        ...env,
        NODE_ENV: "production"
      })
    ).toThrow("auth.dev_token_forbidden");
  });

  it("rejects missing property headers on protected routes", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: {
        authorization: "Bearer local-dev-token"
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "property.required"
    });
  });

  it("rejects unauthorized property access", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/me",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "tre"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "property.forbidden"
    });
  });

  it("returns bootstrap data for authenticated users", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/auth/session",
      headers: {
        authorization: "Bearer local-dev-token"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      user: {
        id: "local-dev-user",
        propertyPermissions: {
          caltrain: expect.arrayContaining([
            "schedules.write",
            "runs.approve",
            "runs.write",
            "stops.write",
            "delays.write",
            "consist.write",
            "crew.assign",
            "fare.write",
            "users.invite",
            "users.manage",
            "users.access.write",
            "admin.permissions.write",
            "reports.schedule",
            "notifications.write",
            "staffing.write"
          ])
        }
      },
      defaultProperty: "caltrain"
    });
  });

  it("returns property settings for authorized property context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/settings/property",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      propertyCode: "caltrain",
      branding: {
        primaryColor: "#1E3A5F"
      }
    });
  });

  it("updates property settings for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/settings/property",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        supportEmail: "dispatch@caltrain.herzogops.com",
        timezone: "America/Chicago",
        branding: {
          primaryColor: "#112233",
          logoMode: "property-override"
        },
        features: {
          powerBi: false,
          fileUploads: true,
          cmms: true
        }
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      propertyCode: "caltrain",
      supportEmail: "dispatch@caltrain.herzogops.com",
      timezone: "America/Chicago",
      branding: {
        primaryColor: "#112233",
        logoMode: "property-override"
      },
      features: {
        powerBi: false,
        fileUploads: true,
        cmms: true
      }
    });
  });

  it("rejects invalid property settings payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/settings/property",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        supportEmail: "not-an-email",
        timezone: "",
        branding: {
          primaryColor: "",
          logoMode: "bad-mode"
        },
        features: {
          powerBi: false,
          fileUploads: true,
          cmms: true
        }
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("returns permission groups and report configuration for authorized property context", async () => {
    const groupsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const reportResponse = await app.inject({
      method: "GET",
      url: "/api/v1/report-config",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(groupsResponse.statusCode).toBe(200);
    expect(reportResponse.statusCode).toBe(200);
    expect(groupsResponse.json().items[0]).toMatchObject({
      name: "Operations Admin"
    });
    expect(reportResponse.json().items[0]).toMatchObject({
      reportName: "Daily OTP"
    });
  });

  it("updates permission groups for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/permission-groups/ops-admin",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        description: "Expanded operational admin coverage.",
        permissions: ["schedules.write", "runs.approve", "reports.schedule"]
      }
    });

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items.find((group: { id: string }) => group.id === "ops-admin")).toMatchObject({
      description: "Expanded operational admin coverage.",
      permissions: ["schedules.write", "runs.approve", "reports.schedule"]
    });
  });

  it("creates and deletes permission groups for authorized property context", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        name: "Service Review",
        description: "Review-focused access for service and incident oversight.",
        permissions: ["reports.view", "reports.schedule", "delays.write"]
      }
    });

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const createdGroup = listResponse.json().items.find((group: { name: string }) => group.name === "Service Review");

    const deleteResponse = await app.inject({
      method: "DELETE",
      url: `/api/v1/permission-groups/${createdGroup.id}`,
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(createResponse.statusCode).toBe(200);
    expect(createdGroup).toMatchObject({
      name: "Service Review",
      permissions: ["reports.view", "reports.schedule", "delays.write"]
    });
    expect(deleteResponse.statusCode).toBe(200);
    expect(deleteResponse.json()).toMatchObject({
      deletedGroupId: createdGroup.id
    });
  });

  it("rejects permission group writes without admin permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:users.manage"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "POST",
      url: "/api/v1/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        name: "Service Review",
        description: "Review-focused access for service and incident oversight.",
        permissions: ["reports.view", "reports.schedule", "delays.write"]
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("updates report configuration for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/report-config/report-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        audience: "Dispatch Leadership",
        embedEnabled: false,
        schedule: "07:00 daily"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      audience: "Dispatch Leadership",
      embedEnabled: false,
      schedule: "07:00 daily"
    });
  });

  it("rejects report configuration updates without report scheduling permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:users.manage"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/report-config/report-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        audience: "Dispatch Leadership",
        embedEnabled: false,
        schedule: "07:00 daily"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("rejects invalid report configuration payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/report-config/report-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        audience: "",
        embedEnabled: false,
        schedule: ""
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("returns job profiles and attendance exceptions for authorized property context", async () => {
    const profilesResponse = await app.inject({
      method: "GET",
      url: "/api/v1/job-profiles",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const attendanceResponse = await app.inject({
      method: "GET",
      url: "/api/v1/attendance-exceptions",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(profilesResponse.statusCode).toBe(200);
    expect(attendanceResponse.statusCode).toBe(200);
    expect(profilesResponse.json().items[0]).toMatchObject({
      title: "Engineer"
    });
    expect(attendanceResponse.json().items[0]).toMatchObject({
      exceptionType: "absence"
    });
  });

  it("returns and updates personnel records for authorized property context", async () => {
    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/personnel",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/personnel/personnel-1/status",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        status: "on_leave",
        primaryRole: "Engineer"
      }
    });

    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items[0]).toMatchObject({
      employeeName: "Jordan Reyes",
      primaryRole: "Engineer"
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      id: "personnel-1",
      status: "on_leave",
      primaryRole: "Engineer"
    });
  });

  it("updates job profiles for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/job-profiles/engineer",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        department: "Operations Control",
        minimumHeadcount: 2,
        reliefRequired: false
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      department: "Operations Control",
      minimumHeadcount: 2,
      reliefRequired: false
    });
  });

  it("rejects invalid job profile payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/job-profiles/engineer",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        department: "",
        minimumHeadcount: 0,
        reliefRequired: false
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("updates attendance exceptions for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/attendance-exceptions/att-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        status: "resolved",
        notes: "Cleared for duty."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "resolved",
      notes: "Cleared for duty."
    });
  });

  it("rejects invalid attendance exception payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/attendance-exceptions/att-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        status: "resolved",
        notes: ""
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("returns platform integrations for authorized property context", async () => {
    const filesResponse = await app.inject({
      method: "GET",
      url: "/api/v1/files",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const notificationsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/notifications",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const powerBiResponse = await app.inject({
      method: "GET",
      url: "/api/v1/power-bi",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(filesResponse.statusCode).toBe(200);
    expect(notificationsResponse.statusCode).toBe(200);
    expect(powerBiResponse.statusCode).toBe(200);
    expect(filesResponse.json().items[0]).toMatchObject({
      fileName: "daily-delay-export.csv"
    });
    expect(notificationsResponse.json().items[0]).toMatchObject({
      channel: "email"
    });
    expect(powerBiResponse.json().items[0]).toMatchObject({
      reportName: "Daily OTP"
    });
  });

  it("updates notifications for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/notifications/notif-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        channel: "in_app",
        recipientGroup: "Operations Leadership",
        enabled: false
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      channel: "in_app",
      recipientGroup: "Operations Leadership",
      enabled: false
    });
  });

  it("rejects invalid notification payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/notifications/notif-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        channel: "email",
        recipientGroup: "",
        enabled: true
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("returns managed users for authorized property context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/users",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "capmetro"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "ops-manager"
        })
      ])
    );
  });

  it("returns managed user detail and admin actions for authorized property context", async () => {
    const detailResponse = await app.inject({
      method: "GET",
      url: "/api/v1/users/ops-manager",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const actionsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/users/ops-manager/actions",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(detailResponse.statusCode).toBe(200);
    expect(actionsResponse.statusCode).toBe(200);
    expect(detailResponse.json()).toMatchObject({
      id: "ops-manager",
      propertyAccess: ["caltrain", "capmetro"]
    });
    expect(actionsResponse.json().items[0]).toMatchObject({
      label: "Reset Password"
    });
    expect(
      actionsResponse.json().items.some((action: { id: string }) => action.id === "enable-user")
    ).toBe(true);
    expect(
      actionsResponse.json().items.find((action: { id: string }) => action.id === "reset-password")
    ).toMatchObject({
      requiredPermission: "users.manage",
      isAllowed: true
    });
  });

  it("returns managed user admin history for authorized property context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/users/ops-manager/history",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().items[0]).toMatchObject({
      userId: "ops-manager",
      action: "reset-password",
      actorName: "Jordan Reyes"
    });
  });

  it("creates managed users for the current property scope", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/users",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        displayName: "Morgan Lee",
        email: "morgan.lee@herzog.com",
        roleLabel: "Operations Analyst",
        propertyAccess: ["caltrain"],
        groups: ["Reporting Admin"]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      displayName: "Morgan Lee",
      email: "morgan.lee@herzog.com",
      status: "invited",
      propertyAccess: ["caltrain"],
      groups: ["Reporting Admin"],
      lastAction: "Invitation sent on 2026-03-20"
    });
  });

  it("records audit history for managed user invite and admin actions", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/users",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        displayName: "Morgan Lee",
        email: "morgan.lee@herzog.com",
        roleLabel: "Operations Analyst",
        propertyAccess: ["caltrain"],
        groups: ["Reporting Admin"]
      }
    });

    const createdUserId = createResponse.json().id as string;

    await app.inject({
      method: "POST",
      url: `/api/v1/users/${createdUserId}/actions/resend-invite`,
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const historyResponse = await app.inject({
      method: "GET",
      url: `/api/v1/users/${createdUserId}/history`,
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(historyResponse.statusCode).toBe(200);
    expect(historyResponse.json().items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          action: "invite-user",
          actorName: "Local Development User"
        }),
        expect.objectContaining({
          action: "resend-invite",
          actorName: "Local Development User"
        })
      ])
    );
  });

  it("executes managed user admin actions", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/users/ops-manager/actions/disable-user",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "ops-manager",
      status: "disabled",
      lastAction: "User disabled on 2026-03-13"
    });
  });

  it("enables disabled managed users", async () => {
    const disableResponse = await app.inject({
      method: "POST",
      url: "/api/v1/users/ops-manager/actions/disable-user",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const enableResponse = await app.inject({
      method: "POST",
      url: "/api/v1/users/ops-manager/actions/enable-user",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(disableResponse.statusCode).toBe(200);
    expect(enableResponse.statusCode).toBe(200);
    expect(enableResponse.json()).toMatchObject({
      id: "ops-manager",
      status: "active",
      lastAction: "User enabled on 2026-03-20"
    });
  });

  it("updates managed user property access", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/users/ops-manager/property-access",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        propertyAccess: ["caltrain", "tre"]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "ops-manager",
      propertyAccess: ["caltrain", "tre"]
    });
  });

  it("rejects invalid managed user property access payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/users/ops-manager/property-access",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        propertyAccess: []
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("updates managed user permission groups", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/users/ops-manager/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        groups: ["Dispatch Leadership"]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "ops-manager",
      groups: ["Dispatch Leadership"]
    });
  });

  it("rejects invalid managed user permission group payloads", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/users/ops-manager/permission-groups",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        groups: [""]
      }
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: "validation.failed"
    });
  });

  it("rejects managed user creation without invite permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:users.manage"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "POST",
      url: "/api/v1/users",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        displayName: "Morgan Lee",
        email: "morgan.lee@herzog.com",
        roleLabel: "Operations Analyst",
        propertyAccess: ["caltrain"],
        groups: ["Reporting Admin"]
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("rejects managed user actions without manage permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:users.invite"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "POST",
      url: "/api/v1/users/ops-manager/actions/disable-user",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("rejects user access edits without access-write permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:users.manage|users.invite"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/users/ops-manager/property-access",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        propertyAccess: ["caltrain", "capmetro"]
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("returns reference data for authorized property context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/reference-data",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      delayReasons: expect.arrayContaining(["Mechanical"])
    });
  });

  it("updates reference data for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/reference-data",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        delayReasons: ["Mechanical", "Signal delay", "Weather hold"],
        crewRoles: ["Engineer", "Conductor", "Road Foreman"],
        stationCodes: ["STA", "STB", "STX"]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      delayReasons: ["Mechanical", "Signal delay", "Weather hold"],
      crewRoles: ["Engineer", "Conductor", "Road Foreman"],
      stationCodes: ["STA", "STB", "STX"]
    });
  });

  it("returns train schedules and train runs for authorized property context", async () => {
    const schedulesResponse = await app.inject({
      method: "GET",
      url: "/api/v1/train-schedules",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const runsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(schedulesResponse.statusCode).toBe(200);
    expect(runsResponse.statusCode).toBe(200);
    expect(schedulesResponse.json().items[0]).toMatchObject({
      trainNumber: "101"
    });
    expect(runsResponse.json().items[0]).toMatchObject({
      status: "in_progress",
      isApproved: false,
      approvalBlockers: []
    });
  });

  it("initializes daily train runs for the selected schedules", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/initialize",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        operatingDate: "2026-03-07",
        scheduleIds: ["ct-101"]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      createdRuns: [
        {
          scheduleId: "ct-101",
          operatingDate: "2026-03-07",
          isApproved: false
        }
      ],
      skippedScheduleIds: []
    });
  });

  it("resets editable train runs and clears operational data", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/reset",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "caltrain-run-1",
      status: "scheduled",
      delayMinutes: 0,
      crewAssigned: 0,
      isApproved: false
    });
  });

  it("deletes editable train runs", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/v1/train-runs/caltrain-run-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deletedRunId: "caltrain-run-1"
    });
  });

  it("returns run detail stops and delays for authorized property context", async () => {
    const stopsResponse = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs/caltrain-run-1/stops",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const delaysResponse = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs/caltrain-run-1/delays",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(stopsResponse.statusCode).toBe(200);
    expect(delaysResponse.statusCode).toBe(200);
    expect(stopsResponse.json().items[0]).toMatchObject({
      stationCode: "STA"
    });
    expect(delaysResponse.json().items[0]).toMatchObject({
      category: "Signal delay"
    });
  });

  it("returns delay metadata catalogs and additional info", async () => {
    const commonLocations = await app.inject({
      method: "GET",
      url: "/api/v1/delays/common-locations",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const specialMovements = await app.inject({
      method: "GET",
      url: "/api/v1/delays/special-movements",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const additionalInfo = await app.inject({
      method: "GET",
      url: "/api/v1/delays/delay-1/additional-info",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(commonLocations.statusCode).toBe(200);
    expect(commonLocations.json().items[0]).toMatchObject({
      label: "San Francisco"
    });
    expect(specialMovements.statusCode).toBe(200);
    expect(specialMovements.json().items[0]).toMatchObject({
      label: "Single-track meet"
    });
    expect(additionalInfo.statusCode).toBe(200);
    expect(additionalInfo.json()).toMatchObject({
      delayId: "delay-1",
      responsibleParty: "Signal Maintainer"
    });
  });

  it("returns delay templates for authorized property context", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/delays/templates",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().items[0]).toMatchObject({
      id: "delay-template-signal",
      name: "Signal Hold",
      category: "Signal delay"
    });
  });

  it("updates admin delay catalogs for authorized property context", async () => {
    const commonLocationResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/delay-common-locations/loc-sfc",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        label: "San Francisco Terminal",
        usageCount: 21
      }
    });

    const templateResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/delay-templates/delay-template-signal",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        name: "Signal Hold Updated",
        category: "Signal delay",
        minutes: 5,
        notes: "Signal clearance held at interlocking. Supervisor review added.",
        notableDelayType: "Interlocking failure",
        specialMovementId: "movement-single-track"
      }
    });

    const movementResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/special-movements/movement-single-track",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        label: "Single-track meet Updated",
        description: "Temporary meet requiring dispatch coordination. Updated for admin workflow."
      }
    });

    expect(commonLocationResponse.statusCode).toBe(200);
    expect(templateResponse.statusCode).toBe(200);
    expect(movementResponse.statusCode).toBe(200);
    expect(commonLocationResponse.json()).toMatchObject({ ok: true });
    expect(templateResponse.json()).toMatchObject({ ok: true });
    expect(movementResponse.json()).toMatchObject({ ok: true });
  });

  it("updates delay additional info for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/delays/delay-1/additional-info",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        locationDetail: "South approach to Palo Alto",
        responsibleParty: "Dispatch",
        notableDelayType: "Traffic interference",
        specialMovementId: "movement-single-track",
        workOrderId: "WO-2001",
        mechanicalNotes: "No equipment fault observed.",
        passengerImpactSummary: "Crowding pushed to next two stops."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      delayId: "delay-1",
      responsibleParty: "Dispatch",
      workOrderId: "WO-2001"
    });
  });

  it("rejects delay metadata updates without delay write permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:stops.write"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/delays/delay-1/additional-info",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        locationDetail: "South approach to Palo Alto",
        responsibleParty: "Dispatch",
        notableDelayType: "Traffic interference",
        specialMovementId: "movement-single-track",
        workOrderId: "WO-2001",
        mechanicalNotes: "No equipment fault observed.",
        passengerImpactSummary: "Crowding pushed to next two stops."
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("creates multiple delay events for editable train runs", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/train-runs/caltrain-run-1/delays/batch",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        delays: [
          {
            category: "Mechanical",
            minutes: 2,
            notes: "Door recycle at platform.",
            reportedAt: "2026-03-06T06:30:00Z"
          },
          {
            category: "Late crew",
            minutes: 1,
            notes: "Relief handoff behind schedule.",
            reportedAt: "2026-03-06T06:33:00Z"
          }
        ]
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      items: [
        {
          category: "Mechanical",
          minutes: 2
        },
        {
          category: "Late crew",
          minutes: 1
        }
      ]
    });
  });

  it("creates delay events from templates for editable train runs", async () => {
    const response = await app.inject({
      method: "POST",
      url: "/api/v1/train-runs/caltrain-run-1/delays/template",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        templateId: "delay-template-signal",
        reportedAt: "2026-03-06T06:28:00Z"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      category: "Signal delay",
      minutes: 4,
      notes: "Signal clearance held at interlocking."
    });
  });

  it("deletes delay events for editable train runs", async () => {
    const response = await app.inject({
      method: "DELETE",
      url: "/api/v1/train-runs/caltrain-run-1/delays/delay-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      deletedId: "delay-1",
      runId: "caltrain-run-1"
    });
  });

  it("rejects delay event writes without delay write permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:stops.write"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/delays/delay-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        category: "Signal",
        minutes: 12,
        notes: "Dispatcher hold",
        reportedAt: "2026-03-06T06:18:00Z"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("updates station stops for editable train runs", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/stops/stop-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        actualTime: "06:07",
        boardings: 45,
        alightings: 3
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "stop-1",
      actualTime: "06:07",
      boardings: 45
    });
  });

  it("rejects station stop updates without stop write permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:delays.write"
    });

    await restrictedApp.ready();

    const response = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/stops/stop-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        actualTime: "06:07",
        boardings: 45,
        alightings: 3
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("updates consist and crew assignments for editable train runs", async () => {
    const consistResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/consist/equip-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        position: 1,
        status: "spare"
      }
    });

    const crewResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/crew/crew-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        role: "Engineer",
        onDutyTime: "05:45",
        status: "pending_relief"
      }
    });

    expect(consistResponse.statusCode).toBe(200);
    expect(crewResponse.statusCode).toBe(200);
    expect(consistResponse.json()).toMatchObject({
      id: "equip-1",
      status: "spare"
    });
    expect(crewResponse.json()).toMatchObject({
      id: "crew-1",
      status: "pending_relief",
      onDutyTime: "05:45"
    });
  });

  it("rejects consist and crew writes without the matching resource permissions", async () => {
    const noConsistApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:crew.assign"
    });
    const noCrewApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:consist.write"
    });

    await noConsistApp.ready();
    await noCrewApp.ready();

    const consistResponse = await noConsistApp.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/consist/equip-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        position: 1,
        status: "spare"
      }
    });

    const crewResponse = await noCrewApp.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/crew/crew-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        role: "Engineer",
        onDutyTime: "05:45",
        status: "pending_relief"
      }
    });

    expect(consistResponse.statusCode).toBe(403);
    expect(consistResponse.json()).toMatchObject({
      error: "permission.forbidden"
    });
    expect(crewResponse.statusCode).toBe(403);
    expect(crewResponse.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await noConsistApp.close();
    await noCrewApp.close();
  });

  it("approves train runs for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/approval",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        isApproved: true,
        notes: "Ready for dispatch closeout."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "caltrain-run-1",
      status: "approved",
      isApproved: true,
      approvalBlockers: []
    });
  });

  it("rejects schedule initialization and run approval without the matching permissions", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:runs.write"
    });

    await restrictedApp.ready();

    const initializeResponse = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/train-runs/initialize",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        operatingDate: "2026-03-07",
        scheduleIds: ["schedule-caltrain-101"]
      }
    });

    const approvalResponse = await restrictedApp.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/approval",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        isApproved: true,
        notes: "Ready for dispatch closeout."
      }
    });

    expect(initializeResponse.statusCode).toBe(403);
    expect(initializeResponse.json()).toMatchObject({
      error: "permission.forbidden"
    });
    expect(approvalResponse.statusCode).toBe(403);
    expect(approvalResponse.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("reopens approved train runs for authorized property context", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/approval",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        isApproved: false,
        notes: "Reopened for stop correction."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      id: "caltrain-run-1",
      status: "in_progress",
      isApproved: false,
      approvedAt: null
    });
  });

  it("batch approves ready train runs and reports blocked runs", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/approval/batch",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        runIds: ["caltrain-run-1", "caltrain-run-2"],
        isApproved: true,
        notes: "Batch closeout for ready runs."
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      updatedRuns: [
        {
          id: "caltrain-run-1",
          isApproved: true
        }
      ],
      blockedRuns: [
        {
          runId: "caltrain-run-2",
          blockers: expect.arrayContaining([
            "Crew assignment required before approval."
          ])
        }
      ]
    });
  });

  it("returns schedule approval history for a train schedule", async () => {
    const approvalResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/approval",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        isApproved: true,
        notes: "Ready for schedule closeout."
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/train-schedules/ct-101/approval-history",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(approvalResponse.statusCode).toBe(200);
    expect(response.statusCode).toBe(200);
    expect(response.json().items[0]).toMatchObject({
      runId: "caltrain-run-1",
      actorName: "Local Development User"
    });
    expect(["approved", "unapproved"]).toContain(response.json().items[0].action);
  });

  it("rejects approval when readiness blockers exist", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-2/approval",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        isApproved: true,
        notes: "Attempting approval without complete resources."
      }
    });

    expect(response.statusCode).toBe(409);
    expect(response.json()).toMatchObject({
      error: "train_run.approval_blocked"
    });
  });

  it("rejects delay updates for approved train runs", async () => {
    const response = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/capmetro-run-1/delays/delay-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "capmetro"
      },
      payload: {
        category: "Traffic hold",
        minutes: 3,
        notes: "Attempted update should be blocked.",
        reportedAt: "2026-03-06T07:21:00Z"
      }
    });

    expect(response.statusCode).toBe(403);
    expect(response.json()).toMatchObject({
      error: "train_run.locked"
    });
  });

  it("returns consist and crew assignments for authorized property context", async () => {
    const consistResponse = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs/caltrain-run-1/consist",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const crewResponse = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs/caltrain-run-1/crew",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(consistResponse.statusCode).toBe(200);
    expect(crewResponse.statusCode).toBe(200);
    expect(consistResponse.json().items[0]).toMatchObject({
      equipmentType: "Cab Car"
    });
    expect(crewResponse.json().items[0]).toMatchObject({
      role: "Engineer"
    });
  });

  it("returns consist and crew templates for authorized property context", async () => {
    const consistResponse = await app.inject({
      method: "GET",
      url: "/api/v1/consist/templates",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const crewResponse = await app.inject({
      method: "GET",
      url: "/api/v1/crew/templates",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(consistResponse.statusCode).toBe(200);
    expect(crewResponse.statusCode).toBe(200);
    expect(consistResponse.json().items[0]).toMatchObject({
      id: "consist-commuter-standard",
      name: "Commuter Standard"
    });
    expect(crewResponse.json().items[0]).toMatchObject({
      id: "crew-commuter-standard",
      name: "Standard Crew"
    });
  });

  it("swaps consist and crew templates for editable train runs", async () => {
    const consistResponse = await app.inject({
      method: "POST",
      url: "/api/v1/train-runs/caltrain-run-1/consist/swap",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        templateId: "consist-commuter-short-turn"
      }
    });

    const crewResponse = await app.inject({
      method: "POST",
      url: "/api/v1/train-runs/caltrain-run-1/crew/swap",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        templateId: "crew-commuter-relief"
      }
    });

    expect(consistResponse.statusCode).toBe(200);
    expect(crewResponse.statusCode).toBe(200);
    expect(consistResponse.json().items[0]).toMatchObject({
      equipmentNumber: "CAB-911"
    });
    expect(crewResponse.json().items[0]).toMatchObject({
      employeeName: "Morgan Lee"
    });
  });

  it("returns and updates fare enforcement for authorized property context", async () => {
    const createResponse = await app.inject({
      method: "POST",
      url: "/api/v1/fare-enforcement",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        runId: "caltrain-run-1",
        inspectorName: "Morgan Lee",
        firstLocation: "SFC",
        secondLocation: "SJC",
        activityCount: 8,
        amtrakTransfers: 1,
        amtrakTickets: 2,
        upassCount: 3,
        ticketsSold: 4,
        notes: "Midday inspection sweep.",
        capturedAt: "2026-03-06T09:00:00Z"
      }
    });

    const summaryResponse = await app.inject({
      method: "GET",
      url: "/api/v1/fare-enforcement/summary",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const dashboardResponse = await app.inject({
      method: "GET",
      url: "/api/v1/fare-enforcement/dashboard",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const listResponse = await app.inject({
      method: "GET",
      url: "/api/v1/fare-enforcement?runId=caltrain-run-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    const updateResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/fare-enforcement/fare-caltrain-1",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        inspectorName: "Morgan Lee",
        firstLocation: "SFC",
        secondLocation: "SJC",
        activityCount: 18,
        amtrakTransfers: 3,
        amtrakTickets: 4,
        upassCount: 6,
        ticketsSold: 5,
        notes: "Extended inspection coverage through San Jose.",
        capturedAt: "2026-03-06T06:31:00Z"
      }
    });

    expect(createResponse.statusCode).toBe(200);
    expect(createResponse.json()).toMatchObject({
      runId: "caltrain-run-1",
      activityCount: 8,
      amtrakTransfers: 1,
      ticketsSold: 4
    });
    expect(summaryResponse.statusCode).toBe(200);
    expect(
      summaryResponse.json().items.find((item: { runId: string }) => item.runId === "caltrain-run-1")
    ).toMatchObject({
      runId: "caltrain-run-1",
      activityCount: 24,
      amtrakTransfers: 3,
      amtrakTickets: 5,
      upassCount: 8,
      ticketsSold: 8
    });
    expect(dashboardResponse.statusCode).toBe(200);
    expect(dashboardResponse.json()).toMatchObject({
      totalRecords: 2,
      totalActivityCount: 24,
      totalAmtrakTransfers: 3,
      totalAmtrakTickets: 5,
      totalUpassCount: 8,
      totalTicketsSold: 8,
      coveredRuns: 1,
      uncoveredRuns: expect.arrayContaining(["caltrain-run-2"]),
      topInspectors: expect.arrayContaining([
        expect.objectContaining({
          inspectorName: "Morgan Lee"
        })
      ])
    });
    expect(listResponse.statusCode).toBe(200);
    expect(listResponse.json().items[0]).toMatchObject({
      inspectorName: "Morgan Lee",
      amtrakTickets: 2
    });
    expect(updateResponse.statusCode).toBe(200);
    expect(updateResponse.json()).toMatchObject({
      id: "fare-caltrain-1",
      secondLocation: "SJC",
      activityCount: 18,
      amtrakTransfers: 3,
      ticketsSold: 5
    });
  });

  it("rejects fare enforcement writes without fare write permission", async () => {
    const restrictedApp = buildApp({
      ...env,
      USER_PROPERTY_PERMISSIONS: "local-dev-user@caltrain:delays.write"
    });

    await restrictedApp.ready();

    const createResponse = await restrictedApp.inject({
      method: "POST",
      url: "/api/v1/fare-enforcement",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        runId: "caltrain-run-1",
        inspectorName: "Morgan Lee",
        firstLocation: "SFC",
        secondLocation: "SJC",
        activityCount: 8,
        amtrakTransfers: 1,
        amtrakTickets: 3,
        upassCount: 2,
        ticketsSold: 4,
        notes: "Additional inspection pass",
        capturedAt: "2026-03-06T07:00:00Z"
      }
    });

    expect(createResponse.statusCode).toBe(403);
    expect(createResponse.json()).toMatchObject({
      error: "permission.forbidden"
    });

    await restrictedApp.close();
  });

  it("returns approval history for a train run", async () => {
    const approvalResponse = await app.inject({
      method: "PUT",
      url: "/api/v1/train-runs/caltrain-run-1/approval",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      },
      payload: {
        isApproved: true,
        notes: "Ready for run closeout."
      }
    });

    const response = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs/caltrain-run-1/approval-history",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(approvalResponse.statusCode).toBe(200);
    expect(response.statusCode).toBe(200);
    expect(response.json().items[0]).toMatchObject({
      actorName: "Local Development User"
    });
    expect(["approved", "unapproved"]).toContain(response.json().items[0].action);
  });
});
