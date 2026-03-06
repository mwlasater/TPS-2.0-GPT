import { describe, expect, it, vi } from "vitest";

import { PostgresOperationsRepository } from "../repositories/postgres-operations-repository.js";

describe("PostgresOperationsRepository", () => {
  it("maps schedule rows into train schedules", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "ct-101",
          train_number: "101",
          route_name: "San Francisco to San Jose",
          direction: "southbound",
          service_days: ["Mon", "Tue"],
          stop_count: 10
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const schedules = await repository.listTrainSchedules("caltrain");

    expect(schedules).toEqual({
      items: [
        {
          id: "ct-101",
          trainNumber: "101",
          routeName: "San Francisco to San Jose",
          direction: "southbound",
          serviceDays: ["Mon", "Tue"],
          stopCount: 10
        }
      ]
    });
  });

  it("maps run rows into train runs", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "caltrain-run-1",
          schedule_id: "ct-101",
          train_number: "101",
          operating_date: new Date("2026-03-06T00:00:00Z"),
          status: "in_progress",
          delay_minutes: 7,
          crew_assigned: 3
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const runs = await repository.listTrainRuns("caltrain");

    expect(runs).toEqual({
      items: [
        {
          id: "caltrain-run-1",
          scheduleId: "ct-101",
          trainNumber: "101",
          operatingDate: "2026-03-06",
          status: "in_progress",
          delayMinutes: 7,
          crewAssigned: 3
        }
      ]
    });
  });

  it("maps station stop rows into run stops", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "stop-1",
          station_code: "SFC",
          stop_sequence: 1,
          scheduled_time: "06:05",
          actual_time: "06:06",
          boardings: 42,
          alightings: 3
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const stops = await repository.listStationStops("caltrain", "run_caltrain_101_2026_03_06");

    expect(stops).toEqual({
      items: [
        {
          id: "stop-1",
          stationCode: "SFC",
          sequence: 1,
          scheduledTime: "06:05",
          actualTime: "06:06",
          boardings: 42,
          alightings: 3
        }
      ]
    });
  });

  it("maps delay rows into delay events", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "delay-1",
          category: "Signal delay",
          minutes: 4,
          notes: "Signal clearance held at interlocking.",
          reported_at: new Date("2026-03-06T06:19:00Z")
        }
      ]
    });

    const repository = new PostgresOperationsRepository({ query });
    const delays = await repository.listDelayEvents("caltrain", "run_caltrain_101_2026_03_06");

    expect(delays).toEqual({
      items: [
        {
          id: "delay-1",
          category: "Signal delay",
          minutes: 4,
          notes: "Signal clearance held at interlocking.",
          reportedAt: "2026-03-06T06:19:00.000Z"
        }
      ]
    });
  });
});
