import type {
  PropertyCode,
  TrainRunApprovalHistoryEntry,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate
} from "@tps/types";

const initialHistoryCatalog: Partial<Record<PropertyCode, TrainRunApprovalHistoryEntry[]>> = {
  caltrain: [
    {
      id: "approval-caltrain-1",
      runId: "caltrain-run-1",
      action: "approved",
      actorName: "Jordan Reyes",
      notes: "Ready for dispatch closeout after final delay reconciliation.",
      createdAt: "2026-03-06T12:15:00Z"
    }
  ],
  capmetro: [
    {
      id: "approval-capmetro-1",
      runId: "capmetro-run-1",
      action: "approved",
      actorName: "Jordan Reyes",
      notes: "Morning service packet completed.",
      createdAt: "2026-03-06T07:26:00Z"
    }
  ]
};

const historyCatalog: Partial<Record<PropertyCode, TrainRunApprovalHistoryEntry[]>> =
  cloneHistoryCatalog(initialHistoryCatalog);

function cloneHistoryCatalog(
  source: Partial<Record<PropertyCode, TrainRunApprovalHistoryEntry[]>>
): Partial<Record<PropertyCode, TrainRunApprovalHistoryEntry[]>> {
  return Object.fromEntries(
    Object.entries(source).map(([propertyCode, items]) => [
      propertyCode,
      items.map((item) => ({ ...item }))
    ])
  ) as Partial<Record<PropertyCode, TrainRunApprovalHistoryEntry[]>>;
}

export function listTrainRunApprovalHistory(
  propertyCode: PropertyCode,
  runId: string
): TrainRunApprovalHistoryList {
  return {
    items: (historyCatalog[propertyCode] ?? []).filter((entry) => entry.runId === runId)
  };
}

export function listTrainScheduleApprovalHistory(
  propertyCode: PropertyCode,
  runIds: string[]
): TrainRunApprovalHistoryList {
  return {
    items: (historyCatalog[propertyCode] ?? []).filter((entry) => runIds.includes(entry.runId))
  };
}

export function recordTrainRunApprovalHistory(
  propertyCode: PropertyCode,
  runId: string,
  update: TrainRunApprovalUpdate,
  actorName: string
): TrainRunApprovalHistoryEntry {
  const entry: TrainRunApprovalHistoryEntry = {
    id: `${runId}-${update.isApproved ? "approved" : "unapproved"}-${Date.now()}`,
    runId,
    action: update.isApproved ? "approved" : "unapproved",
    actorName,
    notes: update.notes,
    createdAt: new Date().toISOString()
  };

  if (!historyCatalog[propertyCode]) {
    historyCatalog[propertyCode] = [];
  }

  historyCatalog[propertyCode]!.unshift(entry);

  return entry;
}

export function resetApprovalHistoryData(): void {
  for (const propertyCode of Object.keys(historyCatalog) as PropertyCode[]) {
    delete historyCatalog[propertyCode];
  }

  Object.assign(historyCatalog, cloneHistoryCatalog(initialHistoryCatalog));
}
