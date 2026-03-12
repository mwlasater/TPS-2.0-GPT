import type {
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementUpdate,
  PropertyCode
} from "@tps/types";

const fareCatalog: Partial<Record<PropertyCode, FareEnforcementList>> = {
  caltrain: {
    items: [
      {
        id: "fare-caltrain-1",
        runId: "caltrain-run-1",
        inspectorName: "Morgan Lee",
        firstLocation: "SFC",
        secondLocation: "PAO",
        activityCount: 16,
        notes: "Peak boarding checks completed before Palo Alto.",
        capturedAt: "2026-03-06T06:28:00Z"
      }
    ]
  },
  capmetro: {
    items: [
      {
        id: "fare-capmetro-1",
        runId: "capmetro-run-1",
        inspectorName: "Jordan Reyes",
        firstLocation: "LNR",
        secondLocation: "MLK",
        activityCount: 9,
        notes: "Morning commuter inspection pass.",
        capturedAt: "2026-03-06T07:24:00Z"
      }
    ]
  },
  tre: {
    items: [
      {
        id: "fare-tre-1",
        runId: "tre-run-1",
        inspectorName: "Taylor Brooks",
        firstLocation: "DAL",
        secondLocation: "CEN",
        activityCount: 12,
        notes: "Manual validation after dispatch hold.",
        capturedAt: "2026-03-06T08:08:00Z"
      }
    ]
  }
};

export function listFareEnforcement(propertyCode: PropertyCode, runId?: string): FareEnforcementList {
  const items = fareCatalog[propertyCode]?.items ?? [];

  return {
    items: runId ? items.filter((item) => item.runId === runId) : items
  };
}

export function updateFareEnforcement(
  propertyCode: PropertyCode,
  recordId: string,
  update: FareEnforcementUpdate
): FareEnforcementRecord {
  const source = fareCatalog[propertyCode] ?? { items: [] };
  fareCatalog[propertyCode] = source;

  const row = source.items.find((candidate) => candidate.id === recordId) ?? source.items[0];

  if (!row) {
    throw new Error("fare_enforcement.not_found");
  }

  row.inspectorName = update.inspectorName;
  row.firstLocation = update.firstLocation;
  row.secondLocation = update.secondLocation;
  row.activityCount = update.activityCount;
  row.notes = update.notes;
  row.capturedAt = update.capturedAt;

  return row;
}
