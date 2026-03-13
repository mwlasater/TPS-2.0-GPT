import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../app.js";

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
  USER_PROPERTY_ACCESS: "local-dev-user:caltrain|capmetro"
};

describe("app contracts", () => {
  const app = buildApp(env);

  beforeAll(async () => {
    await app.ready();
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
        id: "local-dev-user"
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
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/train-schedules/ct-101/approval-history",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

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
    expect(summaryResponse.json().items[0]).toMatchObject({
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

  it("returns approval history for a train run", async () => {
    const response = await app.inject({
      method: "GET",
      url: "/api/v1/train-runs/caltrain-run-1/approval-history",
      headers: {
        authorization: "Bearer local-dev-token",
        "x-property": "caltrain"
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().items[0]).toMatchObject({
      actorName: "Local Development User"
    });
    expect(["approved", "unapproved"]).toContain(response.json().items[0].action);
  });
});
