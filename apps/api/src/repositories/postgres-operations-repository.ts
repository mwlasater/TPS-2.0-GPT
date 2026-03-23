import type {
  ConsistEquipment,
  ConsistEquipmentList,
  ConsistTemplate,
  ConsistTemplateList,
  ConsistEquipmentUpdate,
  CrewAssignment,
  CrewAssignmentList,
  CrewTemplate,
  CrewTemplateList,
  CrewAssignmentUpdate,
  DelayAdditionalInfo,
  DelayAdditionalInfoDeleteResult,
  DelayAdditionalInfoUpdate,
  DelayPropagationPreview,
  DelayEventBatchCreate,
  DelayCommonLocation,
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayEventDeleteResult,
  DelayEvent,
  DelayEventList,
  DelayWorkOrder,
  DelayWorkOrderCreate,
  DelayTemplate,
  DelayTemplateCreateRequest,
  DelayTemplateList,
  DelayTemplateUpdate,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementCreate,
  FareEnforcementDeleteResult,
  FareEnforcementDashboard,
  FareEnforcementHistoryEntry,
  FareEnforcementHistoryList,
  FareEnforcementSummary,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  NotableDelayType,
  NotableDelayTypeList,
  PropertyCode,
  ResourceSwapRequest,
  SpecialMovement,
  SpecialMovementList,
  SpecialMovementUpdate,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
  TrainRunDeleteResult,
  TrainRunInitializeRequest,
  TrainRunInitializeResult,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalHistoryEntry,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunEventHistoryEntry,
  TrainRunEventHistoryList,
  TrainRunImpactSummary,
  TrainRunList,
  TrainRunStatusRecord,
  TrainRunStatusUpdate,
  TrainScheduleApprovalSummary,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

import {
  listFareEnforcement,
  listFareEnforcementHistory,
  listFareEnforcementSummary
} from "../lib/fare-enforcement-data.js";
import {
  deriveTrainRunImpactSummary,
  deriveTrainScheduleApprovalSummary
} from "../lib/run-impact-data.js";
import {
  listConsistEquipment,
  listConsistTemplates,
  listCrewAssignments,
  listCrewTemplates
} from "../lib/run-resource-data.js";
import {
  createDelayWorkOrder,
  getDelayPropagationPreview,
  getDelayAdditionalInfo,
  getDelayWorkOrder,
  listDelayCommonLocations,
  listDelayEvents,
  listNotableDelayTypes,
  listDelayTemplates,
  listSpecialMovements,
  listStationStops
} from "../lib/run-detail-data.js";

import type { OperationsRepository } from "./contracts.js";
import type { Queryable } from "./postgres-client.js";
import { toIsoTimestamp } from "./time.js";

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

interface DelayMinutesRow {
  delay_minutes: number;
}

interface DelayCommonLocationRow {
  id: string;
  location_label: string;
  usage_count: number;
}

interface SpecialMovementRow {
  id: string;
  movement_label: string;
  description: string;
}

interface DelayAdditionalInfoRow {
  delay_id: string;
  location_detail: string;
  responsible_party: string;
  notable_delay_type: string;
  special_movement_id: string | null;
  work_order_id: string | null;
  mechanical_notes: string;
  passenger_impact_summary: string;
}

interface DelayTemplateRow {
  id: string;
  template_name: string;
  category: string;
  minutes: number;
  notes: string;
  notable_delay_type: string;
  special_movement_id: string | null;
}

interface NotableDelayTypeRow {
  id: string;
  delay_type_label: string;
  category: NotableDelayType["category"];
  requires_work_order: boolean;
}

interface DelayWorkOrderRow {
  delay_id: string;
  work_order_id: string;
  notable_delay_type: string;
  asset_id: string | null;
  repair_type: string;
  priority: DelayWorkOrder["priority"];
  status: DelayWorkOrder["status"];
  created_at: string | Date;
  created_by: string;
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

interface ConsistTemplateRow {
  template_id: string;
  template_name: string;
  item_id: string;
  equipment_number: string;
  equipment_type: string;
  position_index: number;
  status: ConsistEquipment["status"];
}

interface CrewTemplateRow {
  template_id: string;
  template_name: string;
  item_id: string;
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

interface FareEnforcementHistoryRow {
  id: string;
  fare_record_id: string;
  action: FareEnforcementHistoryEntry["action"];
  actor_name: string;
  notes: string;
  created_at: string | Date;
}

interface TrainRunApprovalHistoryRow {
  id: string;
  train_run_id: string;
  action: "approved" | "unapproved";
  actor_name: string;
  notes: string;
  created_at: string | Date;
}

interface TrainRunStatusRow {
  train_run_id: string;
  status: TrainRun["status"];
  status_comment: string;
  status_updated_at: string | Date | null;
  status_updated_by: string | null;
}

interface TrainRunEventHistoryRow {
  id: string;
  train_run_id: string;
  action: TrainRunEventHistoryEntry["action"];
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

export class PostgresOperationsRepository implements OperationsRepository {
  constructor(private readonly db: Queryable) {}

  private getApprovalBlockers(
    row: Pick<
      TrainRunRow,
      "stop_count" | "consist_count" | "crew_count"
    > & {
      inactive_consist_count?: number;
      pending_relief_count?: number;
      incomplete_delay_metadata_count?: number;
    }
  ): string[] {
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

    if ((row.pending_relief_count ?? 0) > 0) {
      blockers.push("Pending crew relief must be resolved before approval.");
    }

    if ((row.inactive_consist_count ?? 0) > 0) {
      blockers.push("Consist must be active before approval.");
    }

    if ((row.incomplete_delay_metadata_count ?? 0) > 0) {
      blockers.push("Delay metadata must be completed before approval.");
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
    const result = await this.db.query<
      Pick<TrainRunRow, "stop_count" | "consist_count" | "crew_count"> & {
        inactive_consist_count: number;
        pending_relief_count: number;
        incomplete_delay_metadata_count: number;
      }
    >(
      `
        SELECT
          (SELECT COUNT(*)::INTEGER FROM shared.station_stop WHERE train_run_id = tr.id) AS stop_count,
          (SELECT COUNT(*)::INTEGER FROM shared.consist_equipment WHERE train_run_id = tr.id) AS consist_count,
          (SELECT COUNT(*)::INTEGER FROM shared.crew_assignment WHERE train_run_id = tr.id) AS crew_count,
          (
            SELECT COUNT(*)::INTEGER
            FROM shared.consist_equipment ce
            WHERE ce.train_run_id = tr.id
              AND ce.status <> 'active'
          ) AS inactive_consist_count,
          (
            SELECT COUNT(*)::INTEGER
            FROM shared.crew_assignment ca
            WHERE ca.train_run_id = tr.id
              AND ca.status = 'pending_relief'
          ) AS pending_relief_count,
          (
            SELECT COUNT(*)::INTEGER
            FROM shared.delay_event de
            LEFT JOIN shared.delay_additional_info dai
              ON dai.delay_id = de.id
            WHERE de.train_run_id = tr.id
              AND (
                dai.delay_id IS NULL OR
                BTRIM(dai.location_detail) = '' OR
                BTRIM(dai.responsible_party) = '' OR
                BTRIM(dai.passenger_impact_summary) = ''
              )
          ) AS incomplete_delay_metadata_count
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

  private async recordRunEvent(
    propertyCode: PropertyCode,
    runId: string,
    action: TrainRunEventHistoryEntry["action"],
    actorName: string,
    notes: string
  ): Promise<void> {
    await this.db.query(
      `
        INSERT INTO shared.train_run_event_history (
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
      [`train-run-event-${crypto.randomUUID()}`, propertyCode, runId, action, actorName, notes]
    );
  }

  private async recordFareHistory(
    propertyCode: PropertyCode,
    recordId: string,
    action: FareEnforcementHistoryEntry["action"],
    actorName: string,
    notes: string
  ): Promise<void> {
    await this.db.query(
      `
        INSERT INTO shared.fare_enforcement_history (
          id,
          railroad_code,
          fare_record_id,
          action,
          actor_name,
          notes,
          created_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
      `,
      [`fare-history-${crypto.randomUUID()}`, propertyCode, recordId, action, actorName, notes]
    );
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
      items: await Promise.all(
        result.rows.map(async (row): Promise<TrainRun> => ({
          id: row.id,
          scheduleId: row.schedule_id,
          trainNumber: row.train_number,
          operatingDate: toIsoDate(row.operating_date),
          status: row.status,
          delayMinutes: row.delay_minutes,
          crewAssigned: row.crew_assigned,
          isApproved: row.is_approved,
          approvedAt: row.approved_at ? toIsoTimestamp(row.approved_at) : null,
          approvalBlockers: await this.loadApprovalBlockers(propertyCode, row.id)
        }))
      )
    };
  }

  async initializeTrainRuns(
    propertyCode: PropertyCode,
    request: TrainRunInitializeRequest
  ): Promise<TrainRunInitializeResult> {
    const createdRuns: TrainRun[] = [];
    const skippedScheduleIds: string[] = [];

    for (const scheduleId of request.scheduleIds) {
      const existingRun = await this.db.query<{ id: string }>(
        `
          SELECT id
          FROM shared.train_run
          WHERE railroad_code = $1
            AND schedule_id = $2
            AND operating_date = $3
        `,
        [propertyCode, scheduleId, request.operatingDate]
      );

      if (existingRun.rows[0]) {
        skippedScheduleIds.push(scheduleId);
        continue;
      }

      const result = await this.db.query<TrainRunRow>(
        `
          INSERT INTO shared.train_run (
            id,
            railroad_code,
            schedule_id,
            operating_date,
            status,
            delay_minutes,
            crew_assigned,
            is_approved,
            approved_at
          )
          SELECT
            $4,
            $1,
            ts.id,
            $3,
            'scheduled',
            0,
            0,
            FALSE,
            NULL
          FROM shared.train_schedule ts
          WHERE ts.railroad_code = $1
            AND ts.id = $2
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
            0::INTEGER AS stop_count,
            0::INTEGER AS consist_count,
            0::INTEGER AS crew_count
        `,
        [
          propertyCode,
          scheduleId,
          request.operatingDate,
          `run_${propertyCode}_${scheduleId}_${request.operatingDate.replaceAll("-", "_")}`
        ]
      );

      const row = result.rows[0];

      if (!row) {
        skippedScheduleIds.push(scheduleId);
        continue;
      }

      createdRuns.push({
        id: row.id,
        scheduleId: row.schedule_id,
        trainNumber: row.train_number,
        operatingDate: toIsoDate(row.operating_date),
        status: row.status,
        delayMinutes: row.delay_minutes,
        crewAssigned: row.crew_assigned,
        isApproved: row.is_approved,
        approvedAt: row.approved_at ? toIsoTimestamp(row.approved_at) : null,
        approvalBlockers: await this.loadApprovalBlockers(propertyCode, row.id)
      });
    }

    return {
      createdRuns,
      skippedScheduleIds
    };
  }

  async resetTrainRun(propertyCode: PropertyCode, runId: string): Promise<TrainRun> {
    await this.assertRunMutable(propertyCode, runId);

    await this.db.query(
      `
        UPDATE shared.station_stop
        SET
          actual_time = NULL,
          boardings = 0,
          alightings = 0
        WHERE train_run_id = $1
      `,
      [runId]
    );

    await this.db.query("DELETE FROM shared.delay_event WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.consist_equipment WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.crew_assignment WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.fare_enforcement WHERE train_run_id = $1", [runId]);

    const result = await this.db.query<TrainRunRow>(
      `
        UPDATE shared.train_run
        SET
          status = 'scheduled',
          delay_minutes = 0,
          crew_assigned = 0,
          is_approved = FALSE,
          approved_at = NULL
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
      [propertyCode, runId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("train_run.not_found");
    }

    await this.recordRunEvent(
      propertyCode,
      runId,
      "run-reset",
      "Local Development User",
      "Run reset and operational data cleared."
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
      approvalBlockers: await this.loadApprovalBlockers(propertyCode, row.id)
    };
  }

  async deleteTrainRun(propertyCode: PropertyCode, runId: string): Promise<TrainRunDeleteResult> {
    await this.assertRunMutable(propertyCode, runId);

    await this.recordRunEvent(
      propertyCode,
      runId,
      "run-deleted",
      "Local Development User",
      "Run deleted from the operating day."
    );

    await this.db.query("DELETE FROM shared.train_run_approval_history WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.fare_enforcement WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.delay_event WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.station_stop WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.consist_equipment WHERE train_run_id = $1", [runId]);
    await this.db.query("DELETE FROM shared.crew_assignment WHERE train_run_id = $1", [runId]);

    const result = await this.db.query<{ id: string }>(
      `
        DELETE FROM shared.train_run
        WHERE railroad_code = $1
          AND id = $2
        RETURNING id
      `,
      [propertyCode, runId]
    );

    if (!result.rows[0]) {
      throw new Error("train_run.not_found");
    }

    return {
      deletedRunId: runId
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
        `${runId}-${update.isApproved ? "approved" : "unapproved"}-${crypto.randomUUID()}`,
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
      approvalBlockers: await this.loadApprovalBlockers(propertyCode, row.id)
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

  async getTrainRunImpactSummary(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<TrainRunImpactSummary> {
    const runs = await this.listTrainRuns(propertyCode);
    const run = runs.items.find((candidate) => candidate.id === runId);

    if (!run) {
      throw new Error("train_run.not_found");
    }

    const stationStops = await this.listStationStops(propertyCode, runId);
    const delays = await this.listDelayEvents(propertyCode, runId);
    const delayAdditionalInfo = Object.fromEntries(
      await Promise.all(
        delays.items.map(async (delay) => [
          delay.id,
          await this.getDelayAdditionalInfo(propertyCode, delay.id)
        ])
      )
    );

    return deriveTrainRunImpactSummary(run, stationStops, delays, delayAdditionalInfo);
  }

  async getTrainRunStatus(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<TrainRunStatusRecord> {
    const result = await this.db.query<TrainRunStatusRow>(
      `
        SELECT
          id AS train_run_id,
          status,
          status_comment,
          status_updated_at,
          status_updated_by
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

    return {
      runId: row.train_run_id,
      status: row.status,
      comment: row.status_comment,
      updatedAt: row.status_updated_at ? toIsoTimestamp(row.status_updated_at) : null,
      updatedBy: row.status_updated_by
    };
  }

  async updateTrainRunStatus(
    propertyCode: PropertyCode,
    runId: string,
    update: TrainRunStatusUpdate,
    actorName: string
  ): Promise<TrainRunStatusRecord> {
    const result = await this.db.query<TrainRunStatusRow>(
      `
        UPDATE shared.train_run
        SET
          status = $3,
          status_comment = $4,
          status_updated_at = NOW(),
          status_updated_by = $5
        WHERE railroad_code = $1
          AND id = $2
        RETURNING
          id AS train_run_id,
          status,
          status_comment,
          status_updated_at,
          status_updated_by
      `,
      [propertyCode, runId, update.status, update.comment, actorName]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("train_run.not_found");
    }

    await this.recordRunEvent(
      propertyCode,
      runId,
      "status-updated",
      actorName,
      update.comment || `Run status updated to ${update.status}.`
    );

    return {
      runId: row.train_run_id,
      status: row.status,
      comment: row.status_comment,
      updatedAt: row.status_updated_at ? toIsoTimestamp(row.status_updated_at) : null,
      updatedBy: row.status_updated_by
    };
  }

  async listTrainRunEventHistory(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<TrainRunEventHistoryList> {
    const result = await this.db.query<TrainRunEventHistoryRow>(
      `
        SELECT
          id,
          train_run_id,
          action,
          actor_name,
          notes,
          created_at
        FROM shared.train_run_event_history
        WHERE railroad_code = $1
          AND train_run_id = $2
        ORDER BY created_at DESC
      `,
      [propertyCode, runId]
    );

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        runId: row.train_run_id,
        action: row.action,
        actorName: row.actor_name,
        notes: row.notes,
        createdAt: toIsoTimestamp(row.created_at)
      }))
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

  async getTrainScheduleApprovalSummary(
    propertyCode: PropertyCode,
    scheduleId: string
  ): Promise<TrainScheduleApprovalSummary> {
    const runs = await this.listTrainRuns(propertyCode);
    const impactsByRunId = Object.fromEntries(
      await Promise.all(
        runs.items
          .filter((run) => run.scheduleId === scheduleId)
          .map(async (run) => [run.id, await this.getTrainRunImpactSummary(propertyCode, run.id)])
      )
    );

    return deriveTrainScheduleApprovalSummary(scheduleId, runs, impactsByRunId);
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

  async listDelayCommonLocations(propertyCode: PropertyCode): Promise<DelayCommonLocationList> {
    const result = await this.db.query<DelayCommonLocationRow>(
      `
        SELECT id, location_label, usage_count
        FROM shared.delay_common_location
        WHERE railroad_code = $1
        ORDER BY usage_count DESC, location_label
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listDelayCommonLocations(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): DelayCommonLocation => ({
          id: row.id,
          label: row.location_label,
          usageCount: row.usage_count
        })
      )
    };
  }

  async listDelayTemplates(propertyCode: PropertyCode): Promise<DelayTemplateList> {
    const result = await this.db.query<DelayTemplateRow>(
      `
        SELECT
          id,
          template_name,
          category,
          minutes,
          notes,
          notable_delay_type,
          special_movement_id
        FROM shared.delay_template
        WHERE railroad_code = $1
        ORDER BY template_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listDelayTemplates(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): DelayTemplate => ({
          id: row.id,
          name: row.template_name,
          category: row.category,
          minutes: row.minutes,
          notes: row.notes,
          notableDelayType: row.notable_delay_type,
          specialMovementId: row.special_movement_id
        })
      )
    };
  }

  async listNotableDelayTypes(propertyCode: PropertyCode): Promise<NotableDelayTypeList> {
    const result = await this.db.query<NotableDelayTypeRow>(
      `
        SELECT
          id,
          delay_type_label,
          category,
          requires_work_order
        FROM shared.notable_delay_type
        WHERE railroad_code = $1
        ORDER BY delay_type_label
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listNotableDelayTypes(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): NotableDelayType => ({
          id: row.id,
          label: row.delay_type_label,
          category: row.category,
          requiresWorkOrder: row.requires_work_order
        })
      )
    };
  }

  async updateDelayCommonLocation(
    propertyCode: PropertyCode,
    locationId: string,
    update: DelayCommonLocationUpdate
  ): Promise<void> {
    const result = await this.db.query(
      `
        UPDATE shared.delay_common_location
        SET
          location_label = $3,
          usage_count = $4
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, locationId, update.label, update.usageCount]
    );

    if (!result.rowCount) {
      throw new Error("delay_common_location.not_found");
    }
  }

  async updateDelayTemplate(
    propertyCode: PropertyCode,
    templateId: string,
    update: DelayTemplateUpdate
  ): Promise<void> {
    const result = await this.db.query(
      `
        UPDATE shared.delay_template
        SET
          template_name = $3,
          category = $4,
          minutes = $5,
          notes = $6,
          notable_delay_type = $7,
          special_movement_id = $8
        WHERE railroad_code = $1
          AND id = $2
      `,
      [
        propertyCode,
        templateId,
        update.name,
        update.category,
        update.minutes,
        update.notes,
        update.notableDelayType,
        update.specialMovementId
      ]
    );

    if (!result.rowCount) {
      throw new Error("delay_template.not_found");
    }
  }

  async listSpecialMovements(propertyCode: PropertyCode): Promise<SpecialMovementList> {
    const result = await this.db.query<SpecialMovementRow>(
      `
        SELECT id, movement_label, description
        FROM shared.special_movement
        WHERE railroad_code = $1
        ORDER BY movement_label
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listSpecialMovements(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): SpecialMovement => ({
          id: row.id,
          label: row.movement_label,
          description: row.description
        })
      )
    };
  }

  async updateSpecialMovement(
    propertyCode: PropertyCode,
    movementId: string,
    update: SpecialMovementUpdate
  ): Promise<void> {
    const result = await this.db.query(
      `
        UPDATE shared.special_movement
        SET
          movement_label = $3,
          description = $4
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, movementId, update.label, update.description]
    );

    if (!result.rowCount) {
      throw new Error("special_movement.not_found");
    }
  }

  async getDelayAdditionalInfo(propertyCode: PropertyCode, delayId: string): Promise<DelayAdditionalInfo> {
    const result = await this.db.query<DelayAdditionalInfoRow>(
      `
        SELECT
          dai.delay_id,
          dai.location_detail,
          dai.responsible_party,
          dai.notable_delay_type,
          dai.special_movement_id,
          dai.work_order_id,
          dai.mechanical_notes,
          dai.passenger_impact_summary
        FROM shared.delay_additional_info dai
        JOIN shared.delay_event de ON de.id = dai.delay_id
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND dai.delay_id = $2
      `,
      [propertyCode, delayId]
    );

    const row = result.rows[0];

    if (!row) {
      return getDelayAdditionalInfo(propertyCode, delayId);
    }

    return {
      delayId: row.delay_id,
      locationDetail: row.location_detail,
      responsibleParty: row.responsible_party,
      notableDelayType: row.notable_delay_type,
      specialMovementId: row.special_movement_id,
      workOrderId: row.work_order_id,
      mechanicalNotes: row.mechanical_notes,
      passengerImpactSummary: row.passenger_impact_summary
    };
  }

  async getDelayWorkOrder(propertyCode: PropertyCode, delayId: string): Promise<DelayWorkOrder | null> {
    const result = await this.db.query<DelayWorkOrderRow>(
      `
        SELECT
          dwo.delay_id,
          dwo.work_order_id,
          dwo.notable_delay_type,
          dwo.asset_id,
          dwo.repair_type,
          dwo.priority,
          dwo.status,
          dwo.created_at,
          dwo.created_by
        FROM shared.delay_work_order dwo
        JOIN shared.delay_event de ON de.id = dwo.delay_id
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND dwo.delay_id = $2
      `,
      [propertyCode, delayId]
    );

    const row = result.rows[0];
    if (!row) {
      return getDelayWorkOrder(propertyCode, delayId);
    }

    return {
      delayId: row.delay_id,
      workOrderId: row.work_order_id,
      notableDelayType: row.notable_delay_type,
      assetId: row.asset_id,
      repairType: row.repair_type,
      priority: row.priority,
      status: row.status,
      createdAt: toIsoTimestamp(row.created_at),
      createdBy: row.created_by
    };
  }

  async createDelayWorkOrder(
    propertyCode: PropertyCode,
    delayId: string,
    input: DelayWorkOrderCreate,
    actorName: string
  ): Promise<DelayWorkOrder> {
    const workOrderId = `WO-${Math.floor(Math.random() * 9000) + 1000}`;
    const result = await this.db.query<DelayWorkOrderRow>(
      `
        INSERT INTO shared.delay_work_order (
          delay_id,
          work_order_id,
          notable_delay_type,
          asset_id,
          repair_type,
          priority,
          status,
          created_at,
          created_by
        )
        SELECT
          de.id,
          $3,
          $4,
          $5,
          $6,
          $7,
          'open',
          NOW(),
          $8
        FROM shared.delay_event de
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND de.id = $2
        ON CONFLICT (delay_id) DO UPDATE
        SET
          work_order_id = EXCLUDED.work_order_id,
          notable_delay_type = EXCLUDED.notable_delay_type,
          asset_id = EXCLUDED.asset_id,
          repair_type = EXCLUDED.repair_type,
          priority = EXCLUDED.priority,
          status = EXCLUDED.status,
          created_at = EXCLUDED.created_at,
          created_by = EXCLUDED.created_by
        RETURNING
          delay_id,
          work_order_id,
          notable_delay_type,
          asset_id,
          repair_type,
          priority,
          status,
          created_at,
          created_by
      `,
      [
        propertyCode,
        delayId,
        workOrderId,
        input.notableDelayType,
        input.assetId,
        input.repairType,
        input.priority,
        actorName
      ]
    );

    const row = result.rows[0];
    if (!row) {
      return createDelayWorkOrder(propertyCode, delayId, input, actorName);
    }

    await this.updateDelayAdditionalInfo(propertyCode, delayId, {
      ...(await this.getDelayAdditionalInfo(propertyCode, delayId)),
      notableDelayType: input.notableDelayType,
      workOrderId: row.work_order_id
    });

    const runLookup = await this.db.query<{ train_run_id: string }>(
      `
        SELECT de.train_run_id
        FROM shared.delay_event de
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND de.id = $2
      `,
      [propertyCode, delayId]
    );

    if (runLookup.rows[0]?.train_run_id) {
      await this.recordRunEvent(
        propertyCode,
        runLookup.rows[0].train_run_id,
        "delay-work-order-created",
        actorName,
        `Work order ${row.work_order_id} created for delay ${delayId}.`
      );
    }

    return {
      delayId: row.delay_id,
      workOrderId: row.work_order_id,
      notableDelayType: row.notable_delay_type,
      assetId: row.asset_id,
      repairType: row.repair_type,
      priority: row.priority,
      status: row.status,
      createdAt: toIsoTimestamp(row.created_at),
      createdBy: row.created_by
    };
  }

  async deleteDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string,
    actorName: string
  ): Promise<DelayAdditionalInfoDeleteResult> {
    const lookup = await this.db.query<{ train_run_id: string }>(
      `
        SELECT de.train_run_id
        FROM shared.delay_event de
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND de.id = $2
      `,
      [propertyCode, delayId]
    );

    const runId = lookup.rows[0]?.train_run_id;
    const result = await this.db.query(
      `
        DELETE FROM shared.delay_additional_info
        WHERE delay_id = $1
      `,
      [delayId]
    );

    if (!result.rowCount) {
      throw new Error("delay_additional_info.not_found");
    }

    if (runId) {
      await this.recordRunEvent(
        propertyCode,
        runId,
        "delay-metadata-cleared",
        actorName,
        `Delay metadata cleared for ${delayId}.`
      );
    }

    return {
      delayId
    };
  }

  async updateDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string,
    update: DelayAdditionalInfoUpdate
  ): Promise<DelayAdditionalInfo> {
    const result = await this.db.query<DelayAdditionalInfoRow>(
      `
        INSERT INTO shared.delay_additional_info (
          delay_id,
          railroad_code,
          location_detail,
          responsible_party,
          notable_delay_type,
          special_movement_id,
          work_order_id,
          mechanical_notes,
          passenger_impact_summary
        )
        SELECT
          de.id,
          tr.railroad_code,
          $3,
          $4,
          $5,
          $6,
          $7,
          $8,
          $9
        FROM shared.delay_event de
        JOIN shared.train_run tr ON tr.id = de.train_run_id
        WHERE tr.railroad_code = $1
          AND de.id = $2
        ON CONFLICT (delay_id) DO UPDATE
        SET
          location_detail = EXCLUDED.location_detail,
          responsible_party = EXCLUDED.responsible_party,
          notable_delay_type = EXCLUDED.notable_delay_type,
          special_movement_id = EXCLUDED.special_movement_id,
          work_order_id = EXCLUDED.work_order_id,
          mechanical_notes = EXCLUDED.mechanical_notes,
          passenger_impact_summary = EXCLUDED.passenger_impact_summary
        RETURNING
          delay_id,
          location_detail,
          responsible_party,
          notable_delay_type,
          special_movement_id,
          work_order_id,
          mechanical_notes,
          passenger_impact_summary
      `,
      [
        propertyCode,
        delayId,
        update.locationDetail,
        update.responsibleParty,
        update.notableDelayType,
        update.specialMovementId,
        update.workOrderId,
        update.mechanicalNotes,
        update.passengerImpactSummary
      ]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("delay_event.not_found");
    }

    return {
      delayId: row.delay_id,
      locationDetail: row.location_detail,
      responsibleParty: row.responsible_party,
      notableDelayType: row.notable_delay_type,
      specialMovementId: row.special_movement_id,
      workOrderId: row.work_order_id,
      mechanicalNotes: row.mechanical_notes,
      passengerImpactSummary: row.passenger_impact_summary
    };
  }

  async createDelayEvents(
    propertyCode: PropertyCode,
    runId: string,
    input: DelayEventBatchCreate
  ): Promise<DelayEventList> {
    await this.assertRunMutable(propertyCode, runId);

    const createdRows: DelayEvent[] = [];

    for (const delay of input.delays) {
      const result = await this.db.query<DelayEventRow>(
        `
          INSERT INTO shared.delay_event (
            id,
            train_run_id,
            category,
            minutes,
            notes,
            reported_at
          )
          SELECT
            $3,
            tr.id,
            $4,
            $5,
            $6,
            $7
          FROM shared.train_run tr
          WHERE tr.railroad_code = $1
            AND tr.id = $2
          RETURNING
            id,
            category,
            minutes,
            notes,
            reported_at
        `,
        [
          propertyCode,
          runId,
          `delay_${crypto.randomUUID()}`,
          delay.category,
          delay.minutes,
          delay.notes,
          delay.reportedAt
        ]
      );

      const row = result.rows[0];

      if (!row) {
        throw new Error("delay_event.create_failed");
      }

      createdRows.push({
        id: row.id,
        category: row.category,
        minutes: row.minutes,
        notes: row.notes,
        reportedAt: toIsoTimestamp(row.reported_at)
      });
    }

    const totals = await this.db.query<DelayMinutesRow>(
      `
        SELECT COALESCE(SUM(minutes), 0)::INTEGER AS delay_minutes
        FROM shared.delay_event
        WHERE train_run_id = $1
      `,
      [runId]
    );

    await this.db.query(
      `
        UPDATE shared.train_run
        SET
          delay_minutes = $2,
          status = CASE WHEN $2 > 0 AND status <> 'approved' THEN 'delayed' ELSE status END
        WHERE id = $1
      `,
      [runId, totals.rows[0]?.delay_minutes ?? 0]
    );

    await this.recordRunEvent(
      propertyCode,
      runId,
      "delay-created",
      "Local Development User",
      `${createdRows.length} delay event(s) created on the run.`
    );

    return {
      items: createdRows
    };
  }

  async createDelayFromTemplate(
    propertyCode: PropertyCode,
    runId: string,
    input: DelayTemplateCreateRequest
  ): Promise<DelayEvent> {
    await this.assertRunMutable(propertyCode, runId);

    const template = (await this.listDelayTemplates(propertyCode)).items.find(
      (item) => item.id === input.templateId
    );

    if (!template) {
      throw new Error("delay_template.not_found");
    }

    const created = await this.createDelayEvents(propertyCode, runId, {
      delays: [
        {
          category: template.category,
          minutes: template.minutes,
          notes: template.notes,
          reportedAt: input.reportedAt
        }
      ]
    });
    const delay = created.items[0];

    if (!delay) {
      throw new Error("delay_event.create_failed");
    }

    await this.updateDelayAdditionalInfo(propertyCode, delay.id, {
      locationDetail: "",
      responsibleParty: "",
      notableDelayType: template.notableDelayType,
      specialMovementId: template.specialMovementId,
      workOrderId: null,
      mechanicalNotes: "",
      passengerImpactSummary: ""
    });

    await this.recordRunEvent(
      propertyCode,
      runId,
      "delay-created",
      "Local Development User",
      `Delay created from template ${input.templateId}.`
    );

    return delay;
  }

  async deleteDelayEvent(
    propertyCode: PropertyCode,
    runId: string,
    delayId: string
  ): Promise<DelayEventDeleteResult> {
    await this.assertRunMutable(propertyCode, runId);

    const deleted = await this.db.query<{ id: string }>(
      `
        DELETE FROM shared.delay_event de
        USING shared.train_run tr
        WHERE tr.id = de.train_run_id
          AND tr.railroad_code = $1
          AND de.train_run_id = $2
          AND de.id = $3
        RETURNING de.id
      `,
      [propertyCode, runId, delayId]
    );

    if (!deleted.rows[0]) {
      throw new Error("delay_event.not_found");
    }

    const totals = await this.db.query<DelayMinutesRow>(
      `
        SELECT COALESCE(SUM(minutes), 0)::INTEGER AS delay_minutes
        FROM shared.delay_event
        WHERE train_run_id = $1
      `,
      [runId]
    );

    const delayMinutes = totals.rows[0]?.delay_minutes ?? 0;

    await this.db.query(
      `
        UPDATE shared.train_run
        SET
          delay_minutes = $2,
          status = CASE
            WHEN $2 > 0 AND status <> 'approved' THEN 'delayed'
            WHEN $2 = 0 AND status = 'delayed' THEN 'in_progress'
            ELSE status
          END
        WHERE id = $1
      `,
      [runId, delayMinutes]
    );

    await this.recordRunEvent(
      propertyCode,
      runId,
      "delay-deleted",
      "Local Development User",
      `Delay ${delayId} deleted from the run.`
    );

    return {
      deletedId: delayId,
      runId,
      delayMinutes
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
        SET
          delay_minutes = (
            SELECT COALESCE(SUM(minutes), 0)
            FROM shared.delay_event
            WHERE train_run_id = $1
          ),
          status = CASE
            WHEN (
              SELECT COALESCE(SUM(minutes), 0)
              FROM shared.delay_event
              WHERE train_run_id = $1
            ) > 0
              AND status <> 'approved'
            THEN 'delayed'
            WHEN status = 'delayed'
              AND (
                SELECT COALESCE(SUM(minutes), 0)
                FROM shared.delay_event
                WHERE train_run_id = $1
              ) = 0
            THEN 'in_progress'
            ELSE status
          END
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

  async getDelayPropagationPreview(
    propertyCode: PropertyCode,
    runId: string
  ): Promise<DelayPropagationPreview> {
    const delays = await this.listDelayEvents(propertyCode, runId);
    const stops = await this.listStationStops(propertyCode, runId);
    const notableDelayTypes = Array.from(
      new Set(
        (
          await Promise.all(
            delays.items.map(async (delay) =>
              (await this.getDelayAdditionalInfo(propertyCode, delay.id)).notableDelayType
            )
          )
        ).filter((value) => value.length > 0)
      )
    );

    if (!delays.items.length && !stops.items.length) {
      return getDelayPropagationPreview(propertyCode, runId);
    }

    const totalProjectedDelayMinutes = delays.items.reduce((total, delay) => total + delay.minutes, 0);

    return {
      runId,
      sourceDelayIds: delays.items.map((delay) => delay.id),
      totalProjectedDelayMinutes,
      impactedStopCount: stops.items.filter((_stop, index) => Math.max(totalProjectedDelayMinutes - index, 0) > 0)
        .length,
      requiresCmmsFollowup: notableDelayTypes.some((label) =>
        listNotableDelayTypes(propertyCode).items.some(
          (item) => item.label === label && item.requiresWorkOrder
        )
      ),
      notableDelayTypes,
      downstreamStops: stops.items.map((stop, index) => {
        const projectedDelayMinutes = Math.max(totalProjectedDelayMinutes - index, 0);
        return {
          stationCode: stop.stationCode,
          projectedDelayMinutes,
          severity:
            projectedDelayMinutes >= 10 ? "high" : projectedDelayMinutes >= 5 ? "medium" : "low"
        };
      })
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

  async listConsistTemplates(propertyCode: PropertyCode): Promise<ConsistTemplateList> {
    const result = await this.db.query<ConsistTemplateRow>(
      `
        SELECT
          ct.id AS template_id,
          ct.template_name,
          cti.id AS item_id,
          cti.equipment_number,
          cti.equipment_type,
          cti.position_index,
          cti.status
        FROM shared.consist_template ct
        JOIN shared.consist_template_item cti ON cti.template_id = ct.id
        WHERE ct.railroad_code = $1
        ORDER BY ct.template_name, cti.position_index
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listConsistTemplates(propertyCode);
    }

    const templates = new Map<string, ConsistTemplate>();

    for (const row of result.rows) {
      const template = templates.get(row.template_id) ?? {
        id: row.template_id,
        name: row.template_name,
        items: []
      };

      template.items.push({
        id: row.item_id,
        equipmentNumber: row.equipment_number,
        equipmentType: row.equipment_type,
        position: row.position_index,
        status: row.status
      });

      templates.set(row.template_id, template);
    }

    return {
      items: Array.from(templates.values())
    };
  }

  async swapConsistEquipment(
    propertyCode: PropertyCode,
    runId: string,
    request: ResourceSwapRequest
  ): Promise<ConsistEquipmentList> {
    await this.assertRunMutable(propertyCode, runId);

    const template = await this.listConsistTemplates(propertyCode);
    const selected = template.items.find((item) => item.id === request.templateId);

    if (!selected) {
      throw new Error("consist_template.not_found");
    }

    await this.db.query("DELETE FROM shared.consist_equipment WHERE train_run_id = $1", [runId]);

    for (const item of selected.items) {
      await this.db.query(
        `
          INSERT INTO shared.consist_equipment (
            id,
            train_run_id,
            equipment_number,
            equipment_type,
            position_index,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          `consist_${crypto.randomUUID()}`,
          runId,
          item.equipmentNumber,
          item.equipmentType,
          item.position,
          item.status
        ]
      );
    }

    return this.listConsistEquipment(propertyCode, runId);
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

  async listCrewTemplates(propertyCode: PropertyCode): Promise<CrewTemplateList> {
    const result = await this.db.query<CrewTemplateRow>(
      `
        SELECT
          ct.id AS template_id,
          ct.template_name,
          cti.id AS item_id,
          cti.employee_name,
          cti.role_name,
          cti.on_duty_time,
          cti.status
        FROM shared.crew_template ct
        JOIN shared.crew_template_item cti ON cti.template_id = ct.id
        WHERE ct.railroad_code = $1
        ORDER BY ct.template_name, cti.on_duty_time
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listCrewTemplates(propertyCode);
    }

    const templates = new Map<string, CrewTemplate>();

    for (const row of result.rows) {
      const template = templates.get(row.template_id) ?? {
        id: row.template_id,
        name: row.template_name,
        items: []
      };

      template.items.push({
        id: row.item_id,
        employeeName: row.employee_name,
        role: row.role_name,
        onDutyTime: row.on_duty_time,
        status: row.status
      });

      templates.set(row.template_id, template);
    }

    return {
      items: Array.from(templates.values())
    };
  }

  async swapCrewAssignments(
    propertyCode: PropertyCode,
    runId: string,
    request: ResourceSwapRequest
  ): Promise<CrewAssignmentList> {
    await this.assertRunMutable(propertyCode, runId);

    const template = await this.listCrewTemplates(propertyCode);
    const selected = template.items.find((item) => item.id === request.templateId);

    if (!selected) {
      throw new Error("crew_template.not_found");
    }

    await this.db.query("DELETE FROM shared.crew_assignment WHERE train_run_id = $1", [runId]);

    for (const item of selected.items) {
      await this.db.query(
        `
          INSERT INTO shared.crew_assignment (
            id,
            train_run_id,
            employee_name,
            role_name,
            on_duty_time,
            status
          )
          VALUES ($1, $2, $3, $4, $5, $6)
        `,
        [
          `crew_${crypto.randomUUID()}`,
          runId,
          item.employeeName,
          item.role,
          item.onDutyTime,
          item.status
        ]
      );
    }

    return this.listCrewAssignments(propertyCode, runId);
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

  async listFareEnforcementHistory(
    propertyCode: PropertyCode,
    recordId: string
  ): Promise<FareEnforcementHistoryList> {
    const result = await this.db.query<FareEnforcementHistoryRow>(
      `
        SELECT
          id,
          fare_record_id,
          action,
          actor_name,
          notes,
          created_at
        FROM shared.fare_enforcement_history
        WHERE railroad_code = $1
          AND fare_record_id = $2
        ORDER BY created_at DESC
      `,
      [propertyCode, recordId]
    );

    if (result.rows.length === 0) {
      return listFareEnforcementHistory(propertyCode, recordId);
    }

    return {
      items: result.rows.map((row): FareEnforcementHistoryEntry => ({
        id: row.id,
        recordId: row.fare_record_id,
        action: row.action,
        actorName: row.actor_name,
        notes: row.notes,
        createdAt: toIsoTimestamp(row.created_at)
      }))
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
    await this.db.query("BEGIN");

    try {
      const recordId = `fare-${crypto.randomUUID()}`;
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
          recordId,
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

      await this.recordFareHistory(
        propertyCode,
        row.id,
        "created",
        "Local Development User",
        "Fare enforcement record created."
      );
      await this.db.query("COMMIT");

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
    } catch (error) {
      await this.db.query("ROLLBACK");
      throw error;
    }
  }

  async updateFareEnforcement(
    propertyCode: PropertyCode,
    recordId: string,
    update: FareEnforcementUpdate
  ): Promise<FareEnforcementRecord> {
    await this.db.query("BEGIN");

    try {
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

      await this.recordFareHistory(
        propertyCode,
        recordId,
        "updated",
        "Local Development User",
        "Fare enforcement record updated."
      );
      await this.db.query("COMMIT");

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
    } catch (error) {
      await this.db.query("ROLLBACK");
      throw error;
    }
  }

  async deleteFareEnforcement(
    propertyCode: PropertyCode,
    recordId: string,
    actorName: string
  ): Promise<FareEnforcementDeleteResult> {
    await this.db.query("BEGIN");

    try {
      const result = await this.db.query<{ id: string; train_run_id: string }>(
        `
          DELETE FROM shared.fare_enforcement fe
          USING shared.train_run tr
          WHERE tr.id = fe.train_run_id
            AND tr.railroad_code = $1
            AND fe.id = $2
          RETURNING fe.id, fe.train_run_id
        `,
        [propertyCode, recordId]
      );

      const row = result.rows[0];

      if (!row) {
        throw new Error("fare_enforcement.not_found");
      }

      await this.recordFareHistory(
        propertyCode,
        recordId,
        "deleted",
        actorName,
        "Fare enforcement record deleted."
      );
      await this.db.query("COMMIT");

      return {
        deletedRecordId: row.id,
        runId: row.train_run_id
      };
    } catch (error) {
      await this.db.query("ROLLBACK");
      throw error;
    }
  }
}
