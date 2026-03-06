import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { buildApp } from "../app.js";

const env = {
  NODE_ENV: "test",
  PORT: "3000",
  HOST: "127.0.0.1",
  APP_VERSION: "0.1.0-test",
  API_PREFIX: "/api/v1",
  WEB_ORIGIN: "http://localhost:5173",
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
      status: "in_progress"
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
});
