import type {
  DelayEvent,
  DelayEventList,
  DelayEventUpdate,
  PropertyCode,
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

const delayCatalog: Partial<Record<PropertyCode, DelayEventList>> = {};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

export function listStationStops(propertyCode: PropertyCode, runId: string): StationStopList {
  if (runId.includes("streetcar") || streetcarProperties.has(propertyCode)) {
    return streetcarStops;
  }

  return defaultStops;
}

export function listDelayEvents(propertyCode: PropertyCode, runId: string): DelayEventList {
  if (!delayCatalog[propertyCode]) {
    delayCatalog[propertyCode] = runId.includes("streetcar") || streetcarProperties.has(propertyCode)
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

  return delayCatalog[propertyCode]!;
}

export function updateDelayEvent(
  propertyCode: PropertyCode,
  delayId: string,
  update: DelayEventUpdate
): DelayEvent {
  const row = listDelayEvents(propertyCode, "").items.find((candidate) => candidate.id === delayId);

  if (!row) {
    throw new Error("delay_event.not_found");
  }

  row.category = update.category;
  row.minutes = update.minutes;
  row.notes = update.notes;
  row.reportedAt = update.reportedAt;

  return row;
}
