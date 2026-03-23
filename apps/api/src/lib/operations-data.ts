import type {
  PropertyCode,
  TrainRun,
  TrainRunDeleteResult,
  TrainRunInitializeRequest,
  TrainRunInitializeResult,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

import {
  getDelayAdditionalInfo,
  listDelayEvents,
  listStationStops,
  peekDelayAdditionalInfo,
  peekDelayEvents,
  peekStationStops
} from "./run-detail-data.js";
import {
  listConsistEquipment,
  listCrewAssignments,
  peekConsistEquipment,
  peekCrewAssignments
} from "./run-resource-data.js";

const scheduleCatalog: Record<PropertyCode, TrainSchedule[]> = {
  caltrain: [
    {
      id: "ct-101",
      trainNumber: "101",
      routeName: "San Francisco to San Jose",
      direction: "southbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 10
    },
    {
      id: "ct-154",
      trainNumber: "154",
      routeName: "San Jose to San Francisco",
      direction: "northbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 10
    }
  ],
  texrail: [
    {
      id: "tx-201",
      trainNumber: "201",
      routeName: "T&P to DFW Airport",
      direction: "westbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
      stopCount: 9
    }
  ],
  tre: [
    {
      id: "tre-401",
      trainNumber: "401",
      routeName: "Dallas Union to Fort Worth T&P",
      direction: "westbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 8
    },
    {
      id: "tre-402",
      trainNumber: "402",
      routeName: "Fort Worth T&P to Dallas Union",
      direction: "eastbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 8
    }
  ],
  trirail: [],
  nmrx: [],
  ctrail: [],
  ace: [],
  capmetro: [
    {
      id: "cm-701",
      trainNumber: "701",
      routeName: "Leander to Downtown Austin",
      direction: "southbound",
      serviceDays: ["Mon", "Tue", "Wed", "Thu", "Fri"],
      stopCount: 9
    }
  ],
  kcstreetcar: [
    {
      id: "kc-01",
      trainNumber: "SC-01",
      routeName: "Main Street Line",
      direction: "northbound",
      serviceDays: ["Daily"],
      stopCount: 6
    }
  ],
  okcstreetcar: [],
  octastreetcar: [],
  metrolinkarrow: [],
  silverline: []
};

const runCatalog: Partial<Record<PropertyCode, TrainRun[]>> = {};

function getApprovalBlockers(propertyCode: PropertyCode, runId: string): string[] {
  const blockers: string[] = [];
  const stops = peekStationStops(propertyCode, runId)?.items ?? [];
  const consist = peekConsistEquipment(propertyCode, runId)?.items ?? [];
  const crew = peekCrewAssignments(propertyCode, runId)?.items ?? [];
  const delays = peekDelayEvents(propertyCode, runId)?.items ?? [];

  if (!crew.length) {
    blockers.push("Crew assignment required before approval.");
  } else if (crew.some((assignment) => assignment.status === "pending_relief")) {
    blockers.push("Pending crew relief must be resolved before approval.");
  }

  if (!consist.length) {
    blockers.push("Consist assignment required before approval.");
  } else if (consist.some((equipment) => equipment.status !== "active")) {
    blockers.push("Consist must be active before approval.");
  }

  if (!stops.length) {
    blockers.push("Station stop records required before approval.");
  }

  const hasIncompleteDelayMetadata = delays.some((delay) => {
    const info = peekDelayAdditionalInfo(propertyCode, delay.id);
    if (!info) {
      return true;
    }

    return (
      !info.locationDetail.trim() ||
      !info.responsibleParty.trim() ||
      !info.passengerImpactSummary.trim()
    );
  });

  if (hasIncompleteDelayMetadata) {
    blockers.push("Delay metadata must be completed before approval.");
  }

  return blockers;
}

function buildRuns(propertyCode: PropertyCode): TrainRun[] {
  const schedules = scheduleCatalog[propertyCode];

  return schedules.map((schedule, index) => {
    const isApproved = propertyCode === "capmetro";
    const runId = `${propertyCode}-run-${index + 1}`;

    if (index === 0 || isApproved) {
      listStationStops(propertyCode, runId);
      const delays = listDelayEvents(propertyCode, runId);
      listConsistEquipment(propertyCode, runId);
      listCrewAssignments(propertyCode, runId);
      delays.items.forEach((delay) => {
        getDelayAdditionalInfo(propertyCode, delay.id);
      });
    }

    return {
      id: runId,
      scheduleId: schedule.id,
      trainNumber: schedule.trainNumber,
      operatingDate: "2026-03-06",
      status: isApproved ? "approved" : index === 0 ? "in_progress" : "scheduled",
      delayMinutes: isApproved ? 2 : 7,
      crewAssigned: propertyCode === "capmetro" ? 2 : 3,
      isApproved,
      approvedAt: isApproved ? "2026-03-06T12:15:00Z" : null,
      approvalBlockers: getApprovalBlockers(propertyCode, runId)
    };
  });
}

function getRunStatusFromDelayMinutes(delayMinutes: number): TrainRun["status"] {
  return delayMinutes > 0 ? "delayed" : "scheduled";
}

export function listTrainSchedules(propertyCode: PropertyCode): TrainScheduleList {
  return {
    items: scheduleCatalog[propertyCode]
  };
}

export function listTrainRuns(propertyCode: PropertyCode): TrainRunList {
  if (!runCatalog[propertyCode]) {
    runCatalog[propertyCode] = buildRuns(propertyCode);
  }

  return {
    items: runCatalog[propertyCode] ?? []
  };
}

export function getTrainRun(propertyCode: PropertyCode, runId: string): TrainRun {
  const run = listTrainRuns(propertyCode).items.find((candidate) => candidate.id === runId);

  if (!run) {
    throw new Error("train_run.not_found");
  }

  return run;
}

export function initializeTrainRuns(
  propertyCode: PropertyCode,
  request: TrainRunInitializeRequest
): TrainRunInitializeResult {
  const schedules = listTrainSchedules(propertyCode).items;
  const runs = listTrainRuns(propertyCode).items;
  const createdRuns: TrainRun[] = [];
  const skippedScheduleIds: string[] = [];

  for (const scheduleId of request.scheduleIds) {
    const schedule = schedules.find((candidate) => candidate.id === scheduleId);

    if (!schedule) {
      skippedScheduleIds.push(scheduleId);
      continue;
    }

    const existingRun = runs.find(
      (candidate) => candidate.scheduleId === scheduleId && candidate.operatingDate === request.operatingDate
    );

    if (existingRun) {
      skippedScheduleIds.push(scheduleId);
      continue;
    }

    const newRun: TrainRun = {
      id: `${propertyCode}-${schedule.id}-${request.operatingDate.replaceAll("-", "_")}`,
      scheduleId: schedule.id,
      trainNumber: schedule.trainNumber,
      operatingDate: request.operatingDate,
      status: getRunStatusFromDelayMinutes(0),
      delayMinutes: 0,
      crewAssigned: 0,
      isApproved: false,
      approvedAt: null,
      approvalBlockers: getApprovalBlockers(
        propertyCode,
        `${propertyCode}-${schedule.id}-${request.operatingDate.replaceAll("-", "_")}`
      )
    };

    runs.unshift(newRun);
    createdRuns.push(newRun);
  }

  return {
    createdRuns,
    skippedScheduleIds
  };
}

export function updateTrainRunApproval(
  propertyCode: PropertyCode,
  runId: string,
  update: TrainRunApprovalUpdate
): TrainRun {
  const runs = listTrainRuns(propertyCode).items;
  const run = runs.find((candidate) => candidate.id === runId);

  if (!run) {
    throw new Error("train_run.not_found");
  }

  if (update.isApproved && run.approvalBlockers.length) {
    throw new Error("train_run.approval_blocked");
  }

  run.isApproved = update.isApproved;
  run.approvedAt = update.isApproved ? new Date().toISOString() : null;
  run.status = update.isApproved ? "approved" : "in_progress";

  return run;
}

export function updateTrainRunApprovalBatch(
  propertyCode: PropertyCode,
  update: TrainRunBatchApprovalUpdate
): TrainRunBatchApprovalResult {
  const runs = listTrainRuns(propertyCode).items;
  const updatedRuns: TrainRun[] = [];
  const blockedRuns: TrainRunBatchApprovalResult["blockedRuns"] = [];

  for (const runId of update.runIds) {
    const run = runs.find((candidate) => candidate.id === runId);

    if (!run) {
      blockedRuns.push({
        runId,
        blockers: ["Train run not found."]
      });
      continue;
    }

    if (update.isApproved && run.approvalBlockers.length) {
      blockedRuns.push({
        runId,
        blockers: run.approvalBlockers
      });
      continue;
    }

    updatedRuns.push(
      updateTrainRunApproval(propertyCode, runId, {
        isApproved: update.isApproved,
        notes: update.notes
      })
    );
  }

  return {
    updatedRuns,
    blockedRuns
  };
}

export function resetTrainRun(propertyCode: PropertyCode, runId: string): TrainRun {
  const run = listTrainRuns(propertyCode).items.find((candidate) => candidate.id === runId);

  if (!run) {
    throw new Error("train_run.not_found");
  }

  run.status = "scheduled";
  run.delayMinutes = 0;
  run.crewAssigned = 0;
  run.isApproved = false;
  run.approvedAt = null;

  return run;
}

export function deleteTrainRun(propertyCode: PropertyCode, runId: string): TrainRunDeleteResult {
  const runs = listTrainRuns(propertyCode).items;
  const nextRuns = runs.filter((candidate) => candidate.id !== runId);

  if (nextRuns.length === runs.length) {
    throw new Error("train_run.not_found");
  }

  runCatalog[propertyCode] = nextRuns;

  return {
    deletedRunId: runId
  };
}

export function resetOperationsData(): void {
  for (const propertyCode of Object.keys(runCatalog) as PropertyCode[]) {
    delete runCatalog[propertyCode];
  }
}
