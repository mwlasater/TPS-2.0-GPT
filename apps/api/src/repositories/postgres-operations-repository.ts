import type {
  ConsistEquipment,
  ConsistEquipmentList,
  CrewAssignment,
  CrewAssignmentList,
  DelayEvent,
  DelayEventList,
  PropertyCode,
  StationStop,
  StationStopList,
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

interface StationStopRow {
  id: string;
  station_code: string;
  stop_sequence: number;
  scheduled_time: string;
  actual_time: string | null;
  boardings: number;
  alightings: number;
}

interface DelayEventRow {
  id: string;
  category: string;
  minutes: number;
  notes: string;
  reported_at: string | Date;
}

interface ConsistEquipmentRow {
  id: string;
  equipment_number: string;
  equipment_type: string;
  position_index: number;
  status: ConsistEquipment["status"];
}

interface CrewAssignmentRow {
  id: string;
  employee_name: string;
  role_name: string;
  on_duty_time: string;
  status: CrewAssignment["status"];
}

function toIsoDate(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value;
}

function toIsoTimestamp(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
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

  async listStationStops(propertyCode: PropertyCode, runId: string): Promise<StationStopList> {
    const result = await this.db.query<StationStopRow>(
      `
        SELECT
          ss.id,
          ss.station_code,
          ss.stop_sequence,
          ss.scheduled_time,
          ss.actual_time,
          ss.boardings,
          ss.alightings
        FROM shared.station_stop ss
        JOIN shared.train_run tr ON tr.id = ss.train_run_id
        WHERE tr.railroad_code = $1
          AND ss.train_run_id = $2
        ORDER BY ss.stop_sequence
      `,
      [propertyCode, runId]
    );

    if (!result.rows.length) {
      return listStationStops(propertyCode, runId);
    }

    return {
      items: result.rows.map(
        (row): StationStop => ({
          id: row.id,
          stationCode: row.station_code,
          sequence: row.stop_sequence,
          scheduledTime: row.scheduled_time,
          actualTime: row.actual_time,
          boardings: row.boardings,
          alightings: row.alightings
        })
      )
    };
  }

  async listDelayEvents(propertyCode: PropertyCode, runId: string): Promise<DelayEventList> {
    const result = await this.db.query<DelayEventRow>(
      `
        SELECT
          de.id,
          de.category,
          de.minutes,
          de.notes,
          de.reported_at
        FROM shared.delay_event de
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND de.train_run_id = $2
        ORDER BY de.reported_at
      `,
      [propertyCode, runId]
    );

    if (!result.rows.length) {
      return listDelayEvents(propertyCode, runId);
    }

    return {
      items: result.rows.map(
        (row): DelayEvent => ({
          id: row.id,
          category: row.category,
          minutes: row.minutes,
          notes: row.notes,
          reportedAt: toIsoTimestamp(row.reported_at)
        })
      )
    };
  }

  async listConsistEquipment(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<ConsistEquipmentList> {
    const result = await this.db.query<ConsistEquipmentRow>(
      `
        SELECT
          ce.id,
          ce.equipment_number,
          ce.equipment_type,
          ce.position_index,
          ce.status
        FROM shared.consist_equipment ce
        JOIN shared.train_run tr ON tr.id = ce.train_run_id
        WHERE tr.railroad_code = $1
          AND ce.train_run_id = $2
        ORDER BY ce.position_index
      `,
      [propertyCode, runId]
    );

    if (!result.rows.length) {
      return listConsistEquipment(propertyCode, runId);
    }

    return {
      items: result.rows.map(
        (row): ConsistEquipment => ({
          id: row.id,
          equipmentNumber: row.equipment_number,
          equipmentType: row.equipment_type,
          position: row.position_index,
          status: row.status
        })
      )
    };
  }

  async listCrewAssignments(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<CrewAssignmentList> {
    const result = await this.db.query<CrewAssignmentRow>(
      `
        SELECT
          ca.id,
          ca.employee_name,
          ca.role_name,
          ca.on_duty_time,
          ca.status
        FROM shared.crew_assignment ca
        JOIN shared.train_run tr ON tr.id = ca.train_run_id
        WHERE tr.railroad_code = $1
          AND ca.train_run_id = $2
        ORDER BY ca.on_duty_time, ca.employee_name
      `,
      [propertyCode, runId]
    );

    if (!result.rows.length) {
      return listCrewAssignments(propertyCode, runId);
    }

    return {
      items: result.rows.map(
        (row): CrewAssignment => ({
          id: row.id,
          employeeName: row.employee_name,
          role: row.role_name,
          onDutyTime: row.on_duty_time,
          status: row.status
        })
      )
    };
  }
}
