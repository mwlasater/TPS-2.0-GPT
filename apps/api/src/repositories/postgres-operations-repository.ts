import type {
  ConsistEquipment,
  ConsistEquipmentList,
  ConsistEquipmentUpdate,
  CrewAssignment,
  CrewAssignmentList,
  CrewAssignmentUpdate,
  DelayEvent,
  DelayEventList,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementCreate,
  FareEnforcementDashboard,
  FareEnforcementSummary,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  PropertyCode,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalHistoryEntry,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

import { listFareEnforcement, listFareEnforcementSummary } from "../lib/fare-enforcement-data.js";
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
  is_approved: boolean;
  approved_at: string | Date | null;
  stop_count?: number;
  consist_count?: number;
  crew_count?: number;
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

interface FareEnforcementRow {
  id: string;
  train_run_id: string;
  inspector_name: string;
  first_location: string;
  second_location: string;
  activity_count: number;
  amtrak_transfers: number;
  amtrak_tickets: number;
  upass_count: number;
  tickets_sold: number;
  notes: string;
  captured_at: string | Date;
}

interface FareEnforcementSummaryRow {
  run_id: string;
  record_count: number;
  activity_count: number;
  amtrak_transfers: number;
  amtrak_tickets: number;
  upass_count: number;
  tickets_sold: number;
  inspectors: string[];
  latest_captured_at: string | Date | null;
}

interface FareEnforcementDashboardRow {
  total_records: number;
  total_activity_count: number;
  total_amtrak_transfers: number;
  total_amtrak_tickets: number;
  total_upass_count: number;
  total_tickets_sold: number;
  covered_runs: number;
}

interface TrainRunApprovalHistoryRow {
  id: string;
  train_run_id: string;
  action: "approved" | "unapproved";
  actor_name: string;
  notes: string;
  created_at: string | Date;
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

  private getApprovalBlockers(row: Pick<TrainRunRow, "stop_count" | "consist_count" | "crew_count">): string[] {
    const blockers: string[] = [];

    if (!row.crew_count) {
      blockers.push("Crew assignment required before approval.");
    }

    if (!row.consist_count) {
      blockers.push("Consist assignment required before approval.");
    }

    if (!row.stop_count) {
      blockers.push("Station stop records required before approval.");
    }

    return blockers;
  }

  private async assertRunMutable(propertyCode: PropertyCode, runId: string): Promise<void> {
    const result = await this.db.query<{ is_approved: boolean }>(
      `
        SELECT is_approved
        FROM shared.train_run
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, runId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("train_run.not_found");
    }

    if (row.is_approved) {
      throw new Error("train_run.locked");
    }
  }

  private async loadApprovalBlockers(propertyCode: PropertyCode, runId: string): Promise<string[]> {
    const result = await this.db.query<Pick<TrainRunRow, "stop_count" | "consist_count" | "crew_count">>(
      `
        SELECT
          (SELECT COUNT(*)::INTEGER FROM shared.station_stop WHERE train_run_id = tr.id) AS stop_count,
          (SELECT COUNT(*)::INTEGER FROM shared.consist_equipment WHERE train_run_id = tr.id) AS consist_count,
          (SELECT COUNT(*)::INTEGER FROM shared.crew_assignment WHERE train_run_id = tr.id) AS crew_count
        FROM shared.train_run tr
        WHERE tr.railroad_code = $1
          AND tr.id = $2
      `,
      [propertyCode, runId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("train_run.not_found");
    }

    return this.getApprovalBlockers(row);
  }

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
          tr.crew_assigned,
          tr.is_approved,
          tr.approved_at,
          (SELECT COUNT(*)::INTEGER FROM shared.station_stop WHERE train_run_id = tr.id) AS stop_count,
          (SELECT COUNT(*)::INTEGER FROM shared.consist_equipment WHERE train_run_id = tr.id) AS consist_count,
          (SELECT COUNT(*)::INTEGER FROM shared.crew_assignment WHERE train_run_id = tr.id) AS crew_count
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
          crewAssigned: row.crew_assigned,
          isApproved: row.is_approved,
          approvedAt: row.approved_at ? toIsoTimestamp(row.approved_at) : null,
          approvalBlockers: this.getApprovalBlockers(row)
        })
      )
    };
  }

  async updateTrainRunApproval(
    propertyCode: PropertyCode,
    runId: string,
    update: TrainRunApprovalUpdate,
    actorName: string
  ): Promise<TrainRun> {
    if (update.isApproved) {
      const blockers = await this.loadApprovalBlockers(propertyCode, runId);

      if (blockers.length) {
        throw new Error("train_run.approval_blocked");
      }
    }

    const result = await this.db.query<TrainRunRow>(
      `
        UPDATE shared.train_run
        SET
          is_approved = $3,
          approved_at = CASE WHEN $3 THEN COALESCE(approved_at, NOW()) ELSE NULL END,
          status = CASE
            WHEN $3 THEN 'approved'
            WHEN status = 'approved' THEN 'in_progress'
            ELSE status
          END
        WHERE railroad_code = $1
          AND id = $2
        RETURNING
          id,
          schedule_id,
          (SELECT train_number FROM shared.train_schedule WHERE id = schedule_id) AS train_number,
          operating_date,
          status,
          delay_minutes,
          crew_assigned,
          is_approved,
          approved_at,
          (SELECT COUNT(*)::INTEGER FROM shared.station_stop WHERE train_run_id = shared.train_run.id) AS stop_count,
          (SELECT COUNT(*)::INTEGER FROM shared.consist_equipment WHERE train_run_id = shared.train_run.id) AS consist_count,
          (SELECT COUNT(*)::INTEGER FROM shared.crew_assignment WHERE train_run_id = shared.train_run.id) AS crew_count
      `,
      [propertyCode, runId, update.isApproved]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("train_run.not_found");
    }

    await this.db.query(
      `
        INSERT INTO shared.train_run_approval_history (
          id,
          railroad_code,
          train_run_id,
          action,
          actor_name,
          notes,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `,
      [
        `${runId}-${update.isApproved ? "approved" : "unapproved"}-${Date.now()}`,
        propertyCode,
        runId,
        update.isApproved ? "approved" : "unapproved",
        actorName,
        update.notes
      ]
    );

    return {
      id: row.id,
      scheduleId: row.schedule_id,
      trainNumber: row.train_number,
      operatingDate: toIsoDate(row.operating_date),
      status: row.status,
      delayMinutes: row.delay_minutes,
      crewAssigned: row.crew_assigned,
      isApproved: row.is_approved,
      approvedAt: row.approved_at ? toIsoTimestamp(row.approved_at) : null,
      approvalBlockers: this.getApprovalBlockers(row)
    };
  }

  async updateTrainRunApprovalBatch(
    propertyCode: PropertyCode,
    update: TrainRunBatchApprovalUpdate,
    actorName: string
  ): Promise<TrainRunBatchApprovalResult> {
    const updatedRuns: TrainRun[] = [];
    const blockedRuns: TrainRunBatchApprovalResult["blockedRuns"] = [];

    for (const runId of update.runIds) {
      try {
        updatedRuns.push(
          await this.updateTrainRunApproval(
            propertyCode,
            runId,
            {
              isApproved: update.isApproved,
              notes: update.notes
            },
            actorName
          )
        );
      } catch (error) {
        if (
          error instanceof Error &&
          error.message === "train_run.approval_blocked" &&
          update.isApproved
        ) {
          blockedRuns.push({
            runId,
            blockers: await this.loadApprovalBlockers(propertyCode, runId)
          });
          continue;
        }

        throw error;
      }
    }

    return {
      updatedRuns,
      blockedRuns
    };
  }

  async listTrainRunApprovalHistory(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<TrainRunApprovalHistoryList> {
    const result = await this.db.query<TrainRunApprovalHistoryRow>(
      `
        SELECT
          ah.id,
          ah.train_run_id,
          ah.action,
          ah.actor_name,
          ah.notes,
          ah.created_at
        FROM shared.train_run_approval_history ah
        JOIN shared.train_run tr ON tr.id = ah.train_run_id
        WHERE tr.railroad_code = $1
          AND ah.train_run_id = $2
        ORDER BY ah.created_at DESC
      `,
      [propertyCode, runId]
    );

    return {
      items: result.rows.map(
        (row): TrainRunApprovalHistoryEntry => ({
          id: row.id,
          runId: row.train_run_id,
          action: row.action,
          actorName: row.actor_name,
          notes: row.notes,
          createdAt: toIsoTimestamp(row.created_at)
        })
      )
    };
  }

  async listTrainScheduleApprovalHistory(
    propertyCode: PropertyCode,
    scheduleId: string
  ): Promise<TrainRunApprovalHistoryList> {
    const result = await this.db.query<TrainRunApprovalHistoryRow>(
      `
        SELECT
          ah.id,
          ah.train_run_id,
          ah.action,
          ah.actor_name,
          ah.notes,
          ah.created_at
        FROM shared.train_run_approval_history ah
        JOIN shared.train_run tr ON tr.id = ah.train_run_id
        WHERE ah.railroad_code = $1
          AND tr.schedule_id = $2
        ORDER BY ah.created_at DESC
      `,
      [propertyCode, scheduleId]
    );

    return {
      items: result.rows.map(
        (row): TrainRunApprovalHistoryEntry => ({
          id: row.id,
          runId: row.train_run_id,
          action: row.action,
          actorName: row.actor_name,
          notes: row.notes,
          createdAt: toIsoTimestamp(row.created_at)
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

  async updateStationStop(
    propertyCode: PropertyCode,
    runId: string,
    stopId: string,
    update: StationStopUpdate
  ): Promise<StationStop> {
    await this.assertRunMutable(propertyCode, runId);

    const result = await this.db.query<StationStopRow>(
      `
        UPDATE shared.station_stop ss
        SET
          actual_time = $3,
          boardings = $4,
          alightings = $5
        FROM shared.train_run tr
        WHERE tr.id = ss.train_run_id
          AND tr.railroad_code = $1
          AND ss.train_run_id = $2
          AND ss.id = $6
        RETURNING
          ss.id,
          ss.station_code,
          ss.stop_sequence,
          ss.scheduled_time,
          ss.actual_time,
          ss.boardings,
          ss.alightings
      `,
      [propertyCode, runId, update.actualTime, update.boardings, update.alightings, stopId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("station_stop.not_found");
    }

    return {
      id: row.id,
      stationCode: row.station_code,
      sequence: row.stop_sequence,
      scheduledTime: row.scheduled_time,
      actualTime: row.actual_time,
      boardings: row.boardings,
      alightings: row.alightings
    };
  }

  async updateDelayEvent(
    propertyCode: PropertyCode,
    runId: string,
    delayId: string,
    update: DelayEventUpdate
  ): Promise<DelayEvent> {
    await this.assertRunMutable(propertyCode, runId);

    const result = await this.db.query<DelayEventRow>(
      `
        UPDATE shared.delay_event de
        SET
          category = $3,
          minutes = $4,
          notes = $5,
          reported_at = $6
        FROM shared.train_run tr
        WHERE tr.id = de.train_run_id
          AND tr.railroad_code = $1
          AND de.train_run_id = $2
          AND de.id = $7
        RETURNING
          de.id,
          de.category,
          de.minutes,
          de.notes,
          de.reported_at
      `,
      [propertyCode, runId, update.category, update.minutes, update.notes, update.reportedAt, delayId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("delay_event.not_found");
    }

    await this.db.query(
      `
        UPDATE shared.train_run
        SET delay_minutes = (
          SELECT COALESCE(SUM(minutes), 0)
          FROM shared.delay_event
          WHERE train_run_id = $1
        )
        WHERE id = $1
      `,
      [runId]
    );

    return {
      id: row.id,
      category: row.category,
      minutes: row.minutes,
      notes: row.notes,
      reportedAt: toIsoTimestamp(row.reported_at)
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

  async updateConsistEquipment(
    propertyCode: PropertyCode,
    runId: string,
    equipmentId: string,
    update: ConsistEquipmentUpdate
  ): Promise<ConsistEquipment> {
    await this.assertRunMutable(propertyCode, runId);

    const result = await this.db.query<ConsistEquipmentRow>(
      `
        UPDATE shared.consist_equipment ce
        SET
          position_index = $3,
          status = $4
        FROM shared.train_run tr
        WHERE tr.id = ce.train_run_id
          AND tr.railroad_code = $1
          AND ce.train_run_id = $2
          AND ce.id = $5
        RETURNING
          ce.id,
          ce.equipment_number,
          ce.equipment_type,
          ce.position_index,
          ce.status
      `,
      [propertyCode, runId, update.position, update.status, equipmentId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("consist_equipment.not_found");
    }

    return {
      id: row.id,
      equipmentNumber: row.equipment_number,
      equipmentType: row.equipment_type,
      position: row.position_index,
      status: row.status
    };
  }

  async updateCrewAssignment(
    propertyCode: PropertyCode,
    runId: string,
    assignmentId: string,
    update: CrewAssignmentUpdate
  ): Promise<CrewAssignment> {
    await this.assertRunMutable(propertyCode, runId);

    const result = await this.db.query<CrewAssignmentRow>(
      `
        UPDATE shared.crew_assignment ca
        SET
          role_name = $3,
          on_duty_time = $4,
          status = $5
        FROM shared.train_run tr
        WHERE tr.id = ca.train_run_id
          AND tr.railroad_code = $1
          AND ca.train_run_id = $2
          AND ca.id = $6
        RETURNING
          ca.id,
          ca.employee_name,
          ca.role_name,
          ca.on_duty_time,
          ca.status
      `,
      [propertyCode, runId, update.role, update.onDutyTime, update.status, assignmentId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("crew_assignment.not_found");
    }

    return {
      id: row.id,
      employeeName: row.employee_name,
      role: row.role_name,
      onDutyTime: row.on_duty_time,
      status: row.status
    };
  }

  async listFareEnforcement(propertyCode: PropertyCode, runId?: string): Promise<FareEnforcementList> {
    const result = await this.db.query<FareEnforcementRow>(
      `
        SELECT
          fe.id,
          fe.train_run_id,
          fe.inspector_name,
          fe.first_location,
          fe.second_location,
          fe.activity_count,
          fe.amtrak_transfers,
          fe.amtrak_tickets,
          fe.upass_count,
          fe.tickets_sold,
          fe.notes,
          fe.captured_at
        FROM shared.fare_enforcement fe
        JOIN shared.train_run tr ON tr.id = fe.train_run_id
        WHERE tr.railroad_code = $1
          AND ($2::TEXT IS NULL OR fe.train_run_id = $2)
        ORDER BY fe.captured_at
      `,
      [propertyCode, runId ?? null]
    );

    if (!result.rows.length) {
      return listFareEnforcement(propertyCode, runId);
    }

    return {
      items: result.rows.map(
        (row): FareEnforcementRecord => ({
          id: row.id,
          runId: row.train_run_id,
          inspectorName: row.inspector_name,
          firstLocation: row.first_location,
          secondLocation: row.second_location,
          activityCount: row.activity_count,
          amtrakTransfers: row.amtrak_transfers,
          amtrakTickets: row.amtrak_tickets,
          upassCount: row.upass_count,
          ticketsSold: row.tickets_sold,
          notes: row.notes,
          capturedAt: toIsoTimestamp(row.captured_at)
        })
      )
    };
  }

  async listFareEnforcementSummary(propertyCode: PropertyCode): Promise<FareEnforcementSummaryList> {
    const result = await this.db.query<FareEnforcementSummaryRow>(
      `
        SELECT
          fe.train_run_id AS run_id,
          COUNT(*)::INTEGER AS record_count,
          COALESCE(SUM(fe.activity_count), 0)::INTEGER AS activity_count,
          COALESCE(SUM(fe.amtrak_transfers), 0)::INTEGER AS amtrak_transfers,
          COALESCE(SUM(fe.amtrak_tickets), 0)::INTEGER AS amtrak_tickets,
          COALESCE(SUM(fe.upass_count), 0)::INTEGER AS upass_count,
          COALESCE(SUM(fe.tickets_sold), 0)::INTEGER AS tickets_sold,
          ARRAY_AGG(DISTINCT fe.inspector_name ORDER BY fe.inspector_name) AS inspectors,
          MAX(fe.captured_at) AS latest_captured_at
        FROM shared.fare_enforcement fe
        JOIN shared.train_run tr ON tr.id = fe.train_run_id
        WHERE tr.railroad_code = $1
        GROUP BY fe.train_run_id
        ORDER BY MAX(fe.captured_at) DESC
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listFareEnforcementSummary(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): FareEnforcementSummary => ({
          runId: row.run_id,
          recordCount: row.record_count,
          activityCount: row.activity_count,
          amtrakTransfers: row.amtrak_transfers,
          amtrakTickets: row.amtrak_tickets,
          upassCount: row.upass_count,
          ticketsSold: row.tickets_sold,
          inspectors: row.inspectors,
          latestCapturedAt: row.latest_captured_at ? toIsoTimestamp(row.latest_captured_at) : null
        })
      )
    };
  }

  async getFareEnforcementDashboard(propertyCode: PropertyCode): Promise<FareEnforcementDashboard> {
    const [totalsResult, uncoveredRunsResult, topInspectorsResult] = await Promise.all([
      this.db.query<FareEnforcementDashboardRow>(
        `
          SELECT
            COUNT(*)::INTEGER AS total_records,
            COALESCE(SUM(fe.activity_count), 0)::INTEGER AS total_activity_count,
            COALESCE(SUM(fe.amtrak_transfers), 0)::INTEGER AS total_amtrak_transfers,
            COALESCE(SUM(fe.amtrak_tickets), 0)::INTEGER AS total_amtrak_tickets,
            COALESCE(SUM(fe.upass_count), 0)::INTEGER AS total_upass_count,
            COALESCE(SUM(fe.tickets_sold), 0)::INTEGER AS total_tickets_sold,
            COUNT(DISTINCT fe.train_run_id)::INTEGER AS covered_runs
          FROM shared.fare_enforcement fe
          JOIN shared.train_run tr ON tr.id = fe.train_run_id
          WHERE tr.railroad_code = $1
        `,
        [propertyCode]
      ),
      this.db.query<{ run_id: string }>(
        `
          SELECT tr.id AS run_id
          FROM shared.train_run tr
          WHERE tr.railroad_code = $1
            AND NOT EXISTS (
              SELECT 1
              FROM shared.fare_enforcement fe
              WHERE fe.train_run_id = tr.id
            )
          ORDER BY tr.operating_date DESC, tr.id
        `,
        [propertyCode]
      ),
      this.db.query<{ inspector_name: string; activity_count: number; record_count: number }>(
        `
          SELECT
            fe.inspector_name,
            COALESCE(SUM(fe.activity_count), 0)::INTEGER AS activity_count,
            COUNT(*)::INTEGER AS record_count
          FROM shared.fare_enforcement fe
          JOIN shared.train_run tr ON tr.id = fe.train_run_id
          WHERE tr.railroad_code = $1
          GROUP BY fe.inspector_name
          ORDER BY activity_count DESC, record_count DESC, fe.inspector_name
        `,
        [propertyCode]
      )
    ]);

    const totals = totalsResult.rows[0] ?? {
      total_records: 0,
      total_activity_count: 0,
      total_amtrak_transfers: 0,
      total_amtrak_tickets: 0,
      total_upass_count: 0,
      total_tickets_sold: 0,
      covered_runs: 0
    };

    return {
      totalRecords: totals.total_records,
      totalActivityCount: totals.total_activity_count,
      totalAmtrakTransfers: totals.total_amtrak_transfers,
      totalAmtrakTickets: totals.total_amtrak_tickets,
      totalUpassCount: totals.total_upass_count,
      totalTicketsSold: totals.total_tickets_sold,
      coveredRuns: totals.covered_runs,
      uncoveredRuns: uncoveredRunsResult.rows.map((row) => row.run_id),
      topInspectors: topInspectorsResult.rows.map((row) => ({
        inspectorName: row.inspector_name,
        activityCount: row.activity_count,
        recordCount: row.record_count
      }))
    };
  }

  async createFareEnforcement(
    propertyCode: PropertyCode,
    input: FareEnforcementCreate
  ): Promise<FareEnforcementRecord> {
    const result = await this.db.query<FareEnforcementRow>(
      `
        INSERT INTO shared.fare_enforcement (
          id,
          railroad_code,
          train_run_id,
          inspector_name,
          first_location,
          second_location,
          activity_count,
          amtrak_transfers,
          amtrak_tickets,
          upass_count,
          tickets_sold,
          notes,
          captured_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        RETURNING
          id,
          train_run_id,
          inspector_name,
          first_location,
          second_location,
          activity_count,
          amtrak_transfers,
          amtrak_tickets,
          upass_count,
          tickets_sold,
          notes,
          captured_at
      `,
      [
        `${input.runId}-${Date.now()}`,
        propertyCode,
        input.runId,
        input.inspectorName,
        input.firstLocation,
        input.secondLocation,
        input.activityCount,
        input.amtrakTransfers,
        input.amtrakTickets,
        input.upassCount,
        input.ticketsSold,
        input.notes,
        input.capturedAt
      ]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("fare_enforcement.create_failed");
    }

    return {
      id: row.id,
      runId: row.train_run_id,
      inspectorName: row.inspector_name,
      firstLocation: row.first_location,
      secondLocation: row.second_location,
      activityCount: row.activity_count,
      amtrakTransfers: row.amtrak_transfers,
      amtrakTickets: row.amtrak_tickets,
      upassCount: row.upass_count,
      ticketsSold: row.tickets_sold,
      notes: row.notes,
      capturedAt: toIsoTimestamp(row.captured_at)
    };
  }

  async updateFareEnforcement(
    propertyCode: PropertyCode,
    recordId: string,
    update: FareEnforcementUpdate
  ): Promise<FareEnforcementRecord> {
    const result = await this.db.query<FareEnforcementRow>(
      `
        UPDATE shared.fare_enforcement fe
        SET
          inspector_name = $2,
          first_location = $3,
          second_location = $4,
          activity_count = $5,
          amtrak_transfers = $6,
          amtrak_tickets = $7,
          upass_count = $8,
          tickets_sold = $9,
          notes = $10,
          captured_at = $11
        FROM shared.train_run tr
        WHERE tr.id = fe.train_run_id
          AND tr.railroad_code = $1
          AND fe.id = $12
        RETURNING
          fe.id,
          fe.train_run_id,
          fe.inspector_name,
          fe.first_location,
          fe.second_location,
          fe.activity_count,
          fe.amtrak_transfers,
          fe.amtrak_tickets,
          fe.upass_count,
          fe.tickets_sold,
          fe.notes,
          fe.captured_at
      `,
      [
        propertyCode,
        update.inspectorName,
        update.firstLocation,
        update.secondLocation,
        update.activityCount,
        update.amtrakTransfers,
        update.amtrakTickets,
        update.upassCount,
        update.ticketsSold,
        update.notes,
        update.capturedAt,
        recordId
      ]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("fare_enforcement.not_found");
    }

    return {
      id: row.id,
      runId: row.train_run_id,
      inspectorName: row.inspector_name,
      firstLocation: row.first_location,
      secondLocation: row.second_location,
      activityCount: row.activity_count,
      amtrakTransfers: row.amtrak_transfers,
      amtrakTickets: row.amtrak_tickets,
      upassCount: row.upass_count,
      ticketsSold: row.tickets_sold,
      notes: row.notes,
      capturedAt: toIsoTimestamp(row.captured_at)
    };
  }
}
