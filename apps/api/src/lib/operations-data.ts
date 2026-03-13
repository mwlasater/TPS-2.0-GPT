import type {
  PropertyCode,
  TrainRun,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainSchedule,
  TrainScheduleList
} from "@tps/types";

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

function getApprovalBlockers(runId: string): string[] {
  if (runId.endsWith("-run-2")) {
    return [
      "Crew assignment required before approval.",
      "Consist assignment required before approval.",
      "Station stop records required before approval."
    ];
  }

  return [];
}

function buildRuns(propertyCode: PropertyCode): TrainRun[] {
  const schedules = scheduleCatalog[propertyCode];

  return schedules.map((schedule, index) => {
    const isApproved = propertyCode === "capmetro";
    const runId = `${propertyCode}-run-${index + 1}`;

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
      approvalBlockers: getApprovalBlockers(runId)
    };
  });
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
  run.approvedAt = update.isApproved ? "2026-03-06T12:30:00Z" : null;
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
