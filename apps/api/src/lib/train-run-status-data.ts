import type {
  PropertyCode,
  TrainRun,
  TrainRunList,
  TrainRunStatusRecord,
  TrainRunStatusUpdate
} from "@tps/types";

import { listTrainRuns } from "./operations-data.js";

const statusCatalog: Partial<Record<PropertyCode, Record<string, TrainRunStatusRecord>>> = {};

function defaultCommentForStatus(status: TrainRun["status"]): string {
  if (status === "approved") {
    return "Run approved and locked for closeout.";
  }

  if (status === "delayed") {
    return "Delay investigation remains active.";
  }

  if (status === "in_progress") {
    return "Run is actively being managed by dispatch.";
  }

  return "Run is ready for service.";
}

function ensureStatusCatalog(propertyCode: PropertyCode): Record<string, TrainRunStatusRecord> {
  if (!statusCatalog[propertyCode]) {
    statusCatalog[propertyCode] = Object.fromEntries(
      listTrainRuns(propertyCode).items.map((run) => [
        run.id,
        {
          runId: run.id,
          status: run.status,
          comment: defaultCommentForStatus(run.status),
          updatedAt: null,
          updatedBy: null
        }
      ])
    );
  }

  return statusCatalog[propertyCode];
}

export function getTrainRunStatus(propertyCode: PropertyCode, runId: string): TrainRunStatusRecord {
  const record = ensureStatusCatalog(propertyCode)[runId];

  if (!record) {
    throw new Error("train_run.not_found");
  }

  return { ...record };
}

export function updateTrainRunStatus(
  propertyCode: PropertyCode,
  runId: string,
  update: TrainRunStatusUpdate,
  actorName: string
): TrainRunStatusRecord {
  const record = ensureStatusCatalog(propertyCode)[runId];

  if (!record) {
    throw new Error("train_run.not_found");
  }

  const next: TrainRunStatusRecord = {
    runId,
    status: update.status,
    comment: update.comment,
    updatedAt: "2026-03-20T17:00:00Z",
    updatedBy: actorName
  };

  ensureStatusCatalog(propertyCode)[runId] = next;
  return { ...next };
}

export function syncTrainRunStatusFromRuns(
  propertyCode: PropertyCode,
  runs: TrainRunList
): void {
  const catalog = ensureStatusCatalog(propertyCode);

  for (const run of runs.items) {
    const existing = catalog[run.id];

    if (!existing) {
      catalog[run.id] = {
        runId: run.id,
        status: run.status,
        comment: defaultCommentForStatus(run.status),
        updatedAt: null,
        updatedBy: null
      };
      continue;
    }

    existing.status = run.status;
  }
}

export function deleteTrainRunStatus(propertyCode: PropertyCode, runId: string): void {
  if (!statusCatalog[propertyCode]) {
    return;
  }

  delete statusCatalog[propertyCode]![runId];
}

export function resetTrainRunStatusData(): void {
  for (const propertyCode of Object.keys(statusCatalog) as PropertyCode[]) {
    delete statusCatalog[propertyCode];
  }
}
