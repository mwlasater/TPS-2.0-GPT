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
});
