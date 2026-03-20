import { randomUUID } from "node:crypto";

import type {
  PropertyCode,
  TrainRunEventHistoryEntry,
  TrainRunEventHistoryList
} from "@tps/types";

const historyCatalog: Partial<Record<PropertyCode, TrainRunEventHistoryEntry[]>> = {};

export function listTrainRunEventHistory(
  propertyCode: PropertyCode,
  runId: string
): TrainRunEventHistoryList {
  return {
    items: (historyCatalog[propertyCode] ?? []).filter((entry) => entry.runId === runId)
  };
}

export function recordTrainRunEventHistory(
  propertyCode: PropertyCode,
  runId: string,
  action: TrainRunEventHistoryEntry["action"],
  actorName: string,
  notes: string
): TrainRunEventHistoryEntry {
  const entry: TrainRunEventHistoryEntry = {
    id: `train-run-event-${randomUUID()}`,
    runId,
    action,
    actorName,
    notes,
    createdAt: "2026-03-20T17:00:00Z"
  };

  if (!historyCatalog[propertyCode]) {
    historyCatalog[propertyCode] = [];
  }

  historyCatalog[propertyCode]!.unshift(entry);
  return entry;
}

export function deleteTrainRunEventHistory(propertyCode: PropertyCode, runId: string): void {
  if (!historyCatalog[propertyCode]) {
    return;
  }

  historyCatalog[propertyCode] = historyCatalog[propertyCode]!.filter((entry) => entry.runId !== runId);
}

export function resetTrainRunEventHistoryData(): void {
  for (const propertyCode of Object.keys(historyCatalog) as PropertyCode[]) {
    delete historyCatalog[propertyCode];
  }
}
