import type {
  FareEnforcementCreate,
  FareEnforcementDashboard,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementSummary,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  PropertyCode
} from "@tps/types";

const initialFareCatalog: Partial<Record<PropertyCode, FareEnforcementList>> = {
  caltrain: {
    items: [
      {
        id: "fare-caltrain-1",
        runId: "caltrain-run-1",
        inspectorName: "Morgan Lee",
        firstLocation: "SFC",
        secondLocation: "PAO",
        activityCount: 16,
        amtrakTransfers: 2,
        amtrakTickets: 3,
        upassCount: 5,
        ticketsSold: 4,
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
        amtrakTransfers: 0,
        amtrakTickets: 1,
        upassCount: 6,
        ticketsSold: 2,
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
        amtrakTransfers: 1,
        amtrakTickets: 2,
        upassCount: 4,
        ticketsSold: 3,
        notes: "Manual validation after dispatch hold.",
        capturedAt: "2026-03-06T08:08:00Z"
      }
    ]
  }
};

const fareCatalog: Partial<Record<PropertyCode, FareEnforcementList>> = cloneFareCatalog(initialFareCatalog);

function cloneFareCatalog(
  source: Partial<Record<PropertyCode, FareEnforcementList>>
): Partial<Record<PropertyCode, FareEnforcementList>> {
  return Object.fromEntries(
    Object.entries(source).map(([propertyCode, list]) => [
      propertyCode,
      {
        items: list.items.map((item) => ({ ...item }))
      }
    ])
  ) as Partial<Record<PropertyCode, FareEnforcementList>>;
}

export function listFareEnforcement(propertyCode: PropertyCode, runId?: string): FareEnforcementList {
  const items = fareCatalog[propertyCode]?.items ?? [];

  return {
    items: runId ? items.filter((item) => item.runId === runId) : items
  };
}

export function listFareEnforcementSummary(propertyCode: PropertyCode): FareEnforcementSummaryList {
  const items = fareCatalog[propertyCode]?.items ?? [];
  const summaryByRun = new Map<string, FareEnforcementSummary>();

  for (const item of items) {
    const current = summaryByRun.get(item.runId) ?? {
      runId: item.runId,
      recordCount: 0,
      activityCount: 0,
      amtrakTransfers: 0,
      amtrakTickets: 0,
      upassCount: 0,
      ticketsSold: 0,
      inspectors: [],
      latestCapturedAt: null
    };

    current.recordCount += 1;
    current.activityCount += item.activityCount;
    current.amtrakTransfers += item.amtrakTransfers;
    current.amtrakTickets += item.amtrakTickets;
    current.upassCount += item.upassCount;
    current.ticketsSold += item.ticketsSold;

    if (!current.inspectors.includes(item.inspectorName)) {
      current.inspectors.push(item.inspectorName);
    }

    current.latestCapturedAt =
      current.latestCapturedAt && current.latestCapturedAt > item.capturedAt
        ? current.latestCapturedAt
        : item.capturedAt;

    summaryByRun.set(item.runId, current);
  }

  return {
    items: Array.from(summaryByRun.values())
  };
}

export function getFareEnforcementDashboard(
  propertyCode: PropertyCode,
  propertyRunIds: string[]
): FareEnforcementDashboard {
  const items = fareCatalog[propertyCode]?.items ?? [];
  const topInspectors = new Map<string, { inspectorName: string; activityCount: number; recordCount: number }>();

  for (const item of items) {
    const current = topInspectors.get(item.inspectorName) ?? {
      inspectorName: item.inspectorName,
      activityCount: 0,
      recordCount: 0
    };

    current.activityCount += item.activityCount;
    current.recordCount += 1;
    topInspectors.set(item.inspectorName, current);
  }

  const coveredRuns = new Set(items.map((item) => item.runId));

  return {
    totalRecords: items.length,
    totalActivityCount: items.reduce((total, item) => total + item.activityCount, 0),
    totalAmtrakTransfers: items.reduce((total, item) => total + item.amtrakTransfers, 0),
    totalAmtrakTickets: items.reduce((total, item) => total + item.amtrakTickets, 0),
    totalUpassCount: items.reduce((total, item) => total + item.upassCount, 0),
    totalTicketsSold: items.reduce((total, item) => total + item.ticketsSold, 0),
    coveredRuns: coveredRuns.size,
    uncoveredRuns: propertyRunIds.filter((runId) => !coveredRuns.has(runId)),
    topInspectors: Array.from(topInspectors.values()).sort(
      (left, right) => right.activityCount - left.activityCount
    )
  };
}

export function updateFareEnforcement(
  propertyCode: PropertyCode,
  recordId: string,
  update: FareEnforcementUpdate
): FareEnforcementRecord {
  const source = fareCatalog[propertyCode] ?? { items: [] };
  fareCatalog[propertyCode] = source;

  const row = source.items.find((candidate) => candidate.id === recordId);

  if (!row) {
    throw new Error("fare_enforcement.not_found");
  }

  row.inspectorName = update.inspectorName;
  row.firstLocation = update.firstLocation;
  row.secondLocation = update.secondLocation;
  row.activityCount = update.activityCount;
  row.amtrakTransfers = update.amtrakTransfers;
  row.amtrakTickets = update.amtrakTickets;
  row.upassCount = update.upassCount;
  row.ticketsSold = update.ticketsSold;
  row.notes = update.notes;
  row.capturedAt = update.capturedAt;

  return row;
}

export function createFareEnforcement(
  propertyCode: PropertyCode,
  input: FareEnforcementCreate
): FareEnforcementRecord {
  const source = fareCatalog[propertyCode] ?? { items: [] };
  fareCatalog[propertyCode] = source;

  const record: FareEnforcementRecord = {
    id: `fare-${crypto.randomUUID()}`,
    runId: input.runId,
    inspectorName: input.inspectorName,
    firstLocation: input.firstLocation,
    secondLocation: input.secondLocation,
    activityCount: input.activityCount,
    amtrakTransfers: input.amtrakTransfers,
    amtrakTickets: input.amtrakTickets,
    upassCount: input.upassCount,
    ticketsSold: input.ticketsSold,
    notes: input.notes,
    capturedAt: input.capturedAt
  };

  source.items.unshift(record);

  return record;
}

export function resetFareEnforcementData(): void {
  for (const propertyCode of Object.keys(fareCatalog) as PropertyCode[]) {
    delete fareCatalog[propertyCode];
  }

  Object.assign(fareCatalog, cloneFareCatalog(initialFareCatalog));
}
