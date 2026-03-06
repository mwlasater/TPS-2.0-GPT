import type {
  PropertyCode,
  TrainRun,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

import { listConsistEquipment, listCrewAssignments } from "../lib/run-resource-data.js";
import { listDelayEvents, listStationStops } from "../lib/run-detail-data.js";

import type { OperationsRepository } from "./contracts.js";
import type { Queryable } from "./postgres-client.js";

interface TrainScheduleRow {
  id: string;
  train_number: string;
  route_name: string;
  direction: TrainSchedule["direction"];
  service_days: string[];
  stop_count: number;
}

interface TrainRunRow {
  id: string;
  schedule_id: string;
  train_number: string;
  operating_date: string | Date;
  status: TrainRun["status"];
  delay_minutes: number;
  crew_assigned: number;
}

function toIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

export class PostgresOperationsRepository implements OperationsRepository {
  constructor(private readonly db: Queryable) {}

  async listTrainSchedules(propertyCode: PropertyCode): Promise<TrainScheduleList> {
    const result = await this.db.query<TrainScheduleRow>(
      `
        SELECT
          id,
          train_number,
          route_name,
          direction,
          service_days,
          stop_count
        FROM shared.train_schedule
        WHERE railroad_code = $1
        ORDER BY train_number
      `,
      [propertyCode]
    );

    return {
      items: result.rows.map(
        (row): TrainSchedule => ({
          id: row.id,
          trainNumber: row.train_number,
          routeName: row.route_name,
          direction: row.direction,
          serviceDays: row.service_days,
          stopCount: row.stop_count
        })
      )
    };
  }

  async listTrainRuns(propertyCode: PropertyCode): Promise<TrainRunList> {
    const result = await this.db.query<TrainRunRow>(
      `
        SELECT
          tr.id,
          tr.schedule_id,
          ts.train_number,
          tr.operating_date,
          tr.status,
          tr.delay_minutes,
          tr.crew_assigned
        FROM shared.train_run tr
        JOIN shared.train_schedule ts ON ts.id = tr.schedule_id
        WHERE tr.railroad_code = $1
        ORDER BY tr.operating_date DESC, ts.train_number
      `,
      [propertyCode]
    );

    return {
      items: result.rows.map(
        (row): TrainRun => ({
          id: row.id,
          scheduleId: row.schedule_id,
          trainNumber: row.train_number,
          operatingDate: toIsoDate(row.operating_date),
          status: row.status,
          delayMinutes: row.delay_minutes,
          crewAssigned: row.crew_assigned
        })
      )
    };
  }

  listStationStops(propertyCode: PropertyCode, runId: string) {
    return listStationStops(propertyCode, runId);
  }

  listDelayEvents(propertyCode: PropertyCode, runId: string) {
    return listDelayEvents(propertyCode, runId);
  }

  listConsistEquipment(propertyCode: PropertyCode, runId: string) {
    return listConsistEquipment(propertyCode, runId);
  }

  listCrewAssignments(propertyCode: PropertyCode, runId: string) {
    return listCrewAssignments(propertyCode, runId);
  }
}

