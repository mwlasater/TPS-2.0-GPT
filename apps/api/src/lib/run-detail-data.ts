import type {
  DelayEventBatchCreate,
  DelayEvent,
  DelayEventList,
  DelayEventUpdate,
  PropertyCode,
  StationStop,
  StationStopList
} from "@tps/types";

const defaultStops: StationStopList = {
  items: [
    {
      id: "stop-1",
      stationCode: "STA",
      sequence: 1,
      scheduledTime: "06:05",
      actualTime: "06:06",
      boardings: 42,
      alightings: 3
    },
    {
      id: "stop-2",
      stationCode: "STB",
      sequence: 2,
      scheduledTime: "06:18",
      actualTime: "06:23",
      boardings: 27,
      alightings: 11
    },
    {
      id: "stop-3",
      stationCode: "STC",
      sequence: 3,
      scheduledTime: "06:31",
      actualTime: null,
      boardings: 0,
      alightings: 0
    }
  ]
};

const streetcarStops: StationStopList = {
  items: [
    {
      id: "street-stop-1",
      stationCode: "ST01",
      sequence: 1,
      scheduledTime: "07:10",
      actualTime: "07:10",
      boardings: 14,
      alightings: 2
    },
    {
      id: "street-stop-2",
      stationCode: "ST02",
      sequence: 2,
      scheduledTime: "07:18",
      actualTime: "07:20",
      boardings: 8,
      alightings: 4
    }
  ]
};

const delayCatalog: Partial<Record<PropertyCode, Partial<Record<string, DelayEventList>>>> = {};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

const stopCatalog: Partial<Record<PropertyCode, Partial<Record<string, StationStopList>>>> = {};

function getRunStops(propertyCode: PropertyCode, runId: string): StationStopList {
  if (!stopCatalog[propertyCode]) {
    stopCatalog[propertyCode] = {};
  }

  if (!stopCatalog[propertyCode]![runId]) {
    stopCatalog[propertyCode]![runId] =
      runId.includes("streetcar") || streetcarProperties.has(propertyCode)
        ? {
            items: streetcarStops.items.map((stop) => ({ ...stop }))
          }
        : {
            items: defaultStops.items.map((stop) => ({ ...stop }))
          };
  }

  return stopCatalog[propertyCode]![runId]!;
}

function getRunDelays(propertyCode: PropertyCode, runId: string): DelayEventList {
  if (!delayCatalog[propertyCode]) {
    delayCatalog[propertyCode] = {};
  }

  if (!delayCatalog[propertyCode]![runId]) {
    delayCatalog[propertyCode]![runId] =
      runId.includes("streetcar") || streetcarProperties.has(propertyCode)
        ? {
            items: [
              {
                id: "street-delay-1",
                category: "Traffic hold",
                minutes: 2,
                notes: "Signalized crossing blocked by downtown traffic.",
                reportedAt: "2026-03-06T07:19:00Z"
              }
            ]
          }
        : {
            items: [
              {
                id: "delay-1",
                category: "Signal delay",
                minutes: 4,
                notes: "Signal clearance held at interlocking.",
                reportedAt: "2026-03-06T06:19:00Z"
              },
              {
                id: "delay-2",
                category: "Passenger loading",
                minutes: 3,
                notes: "Heavy boarding volume at central station.",
                reportedAt: "2026-03-06T06:24:00Z"
              }
            ]
          };
  }

  return delayCatalog[propertyCode]![runId]!;
}

export function listStationStops(propertyCode: PropertyCode, runId: string): StationStopList {
  return getRunStops(propertyCode, runId);
}

export function listDelayEvents(propertyCode: PropertyCode, runId: string): DelayEventList {
  return getRunDelays(propertyCode, runId);
}

export function createDelayEvents(
  propertyCode: PropertyCode,
  runId: string,
  input: DelayEventBatchCreate
): DelayEventList {
  const delays = getRunDelays(propertyCode, runId);
  const created = input.delays.map(
    (delay, index): DelayEvent => ({
      id: `${runId}-delay-${crypto.randomUUID()}-${index + 1}`,
      category: delay.category,
      minutes: delay.minutes,
      notes: delay.notes,
      reportedAt: delay.reportedAt
    })
  );

  delays.items.unshift(...created);

  return {
    items: created
  };
}

export function updateDelayEvent(
  propertyCode: PropertyCode,
  runId: string,
  delayId: string,
  update: DelayEventUpdate
): DelayEvent {
  const row = listDelayEvents(propertyCode, runId).items.find((candidate) => candidate.id === delayId);

  if (!row) {
    throw new Error("delay_event.not_found");
  }

  row.category = update.category;
  row.minutes = update.minutes;
  row.notes = update.notes;
  row.reportedAt = update.reportedAt;

  return row;
}

export function updateStationStop(
  propertyCode: PropertyCode,
  runId: string,
  stopId: string,
  update: {
    actualTime: string | null;
    boardings: number;
    alightings: number;
  }
): StationStop {
  const row = listStationStops(propertyCode, runId).items.find((candidate) => candidate.id === stopId);

  if (!row) {
    throw new Error("station_stop.not_found");
  }

  row.actualTime = update.actualTime;
  row.boardings = update.boardings;
  row.alightings = update.alightings;

  return row;
}

export function resetRunDetailData(): void {
  for (const propertyCode of Object.keys(stopCatalog) as PropertyCode[]) {
    delete stopCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(delayCatalog) as PropertyCode[]) {
    delete delayCatalog[propertyCode];
  }
}
