import type {
  DelayAdditionalInfo,
  DelayAdditionalInfoUpdate,
  DelayEventBatchCreate,
  DelayCommonLocationUpdate,
  DelayTemplateCreateRequest,
  DelayTemplateList,
  DelayTemplateUpdate,
  DelayCommonLocationList,
  DelayEventDeleteResult,
  DelayEvent,
  DelayEventList,
  DelayEventUpdate,
  PropertyCode,
  SpecialMovementList,
  SpecialMovementUpdate,
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

const commuterCommonLocations: DelayCommonLocationList = {
  items: [
    { id: "loc-sfc", label: "San Francisco", usageCount: 18 },
    { id: "loc-pao", label: "Palo Alto", usageCount: 11 },
    { id: "loc-sjc", label: "San Jose", usageCount: 9 }
  ]
};

const streetcarCommonLocations: DelayCommonLocationList = {
  items: [
    { id: "loc-main", label: "Main Street", usageCount: 10 },
    { id: "loc-river", label: "River Market", usageCount: 7 }
  ]
};

const commuterSpecialMovements: SpecialMovementList = {
  items: [
    {
      id: "movement-single-track",
      label: "Single-track meet",
      description: "Temporary meet requiring dispatch coordination."
    },
    {
      id: "movement-yard-out",
      label: "Yard departure",
      description: "Late release from yard or shop movement."
    }
  ]
};

const streetcarSpecialMovements: SpecialMovementList = {
  items: [
    {
      id: "movement-street-escort",
      label: "Street escort",
      description: "Manual escort through mixed-traffic segment."
    }
  ]
};

const commuterDelayTemplates: DelayTemplateList = {
  items: [
    {
      id: "delay-template-signal",
      name: "Signal Hold",
      category: "Signal delay",
      minutes: 4,
      notes: "Signal clearance held at interlocking.",
      notableDelayType: "Interlocking failure",
      specialMovementId: "movement-single-track"
    },
    {
      id: "delay-template-boarding",
      name: "Heavy Boarding",
      category: "Passenger loading",
      minutes: 3,
      notes: "Heavy boarding volume at central station.",
      notableDelayType: "Platform crowding",
      specialMovementId: null
    }
  ]
};

const streetcarDelayTemplates: DelayTemplateList = {
  items: [
    {
      id: "delay-template-traffic",
      name: "Traffic Hold",
      category: "Traffic hold",
      minutes: 2,
      notes: "Signalized crossing blocked by downtown traffic.",
      notableDelayType: "Signal priority override",
      specialMovementId: "movement-street-escort"
    }
  ]
};

const stopCatalog: Partial<Record<PropertyCode, Partial<Record<string, StationStopList>>>> = {};
const additionalInfoCatalog: Partial<Record<PropertyCode, Partial<Record<string, DelayAdditionalInfo>>>> =
  {};
const commonLocationCatalog: Partial<Record<PropertyCode, DelayCommonLocationList>> = {};
const specialMovementCatalog: Partial<Record<PropertyCode, SpecialMovementList>> = {};
const delayTemplateCatalog: Partial<Record<PropertyCode, DelayTemplateList>> = {};

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

function createDefaultDelayAdditionalInfo(delayId: string): DelayAdditionalInfo {
  return {
    delayId,
    locationDetail: "",
    responsibleParty: "",
    notableDelayType: "",
    specialMovementId: null,
    workOrderId: null,
    mechanicalNotes: "",
    passengerImpactSummary: ""
  };
}

function getDelayAdditionalInfoCatalog(propertyCode: PropertyCode): Partial<Record<string, DelayAdditionalInfo>> {
  if (!additionalInfoCatalog[propertyCode]) {
    additionalInfoCatalog[propertyCode] = {
      "delay-1": {
        delayId: "delay-1",
        locationDetail: "CP Coast interlocking",
        responsibleParty: "Signal Maintainer",
        notableDelayType: "Interlocking failure",
        specialMovementId: "movement-single-track",
        workOrderId: "WO-1427",
        mechanicalNotes: "",
        passengerImpactSummary: "Peak riders held through two downstream stops."
      },
      "delay-2": {
        delayId: "delay-2",
        locationDetail: "Palo Alto northbound platform",
        responsibleParty: "Station Operations",
        notableDelayType: "Platform crowding",
        specialMovementId: null,
        workOrderId: null,
        mechanicalNotes: "",
        passengerImpactSummary: "Boarding queue extended onto concourse."
      },
      "street-delay-1": {
        delayId: "street-delay-1",
        locationDetail: "Downtown crossing gate",
        responsibleParty: "Traffic Coordination",
        notableDelayType: "Signal priority override",
        specialMovementId: "movement-street-escort",
        workOrderId: null,
        mechanicalNotes: "",
        passengerImpactSummary: "Minor platform crowding at next stop."
      }
    };
  }

  return additionalInfoCatalog[propertyCode]!;
}

export function listStationStops(propertyCode: PropertyCode, runId: string): StationStopList {
  return getRunStops(propertyCode, runId);
}

export function listDelayEvents(propertyCode: PropertyCode, runId: string): DelayEventList {
  return getRunDelays(propertyCode, runId);
}

export function listDelayCommonLocations(propertyCode: PropertyCode): DelayCommonLocationList {
  if (!commonLocationCatalog[propertyCode]) {
    commonLocationCatalog[propertyCode] = streetcarProperties.has(propertyCode)
      ? { items: streetcarCommonLocations.items.map((item) => ({ ...item })) }
      : { items: commuterCommonLocations.items.map((item) => ({ ...item })) };
  }

  return commonLocationCatalog[propertyCode]!;
}

export function listDelayTemplates(propertyCode: PropertyCode): DelayTemplateList {
  if (!delayTemplateCatalog[propertyCode]) {
    delayTemplateCatalog[propertyCode] = streetcarProperties.has(propertyCode)
      ? { items: streetcarDelayTemplates.items.map((item) => ({ ...item })) }
      : { items: commuterDelayTemplates.items.map((item) => ({ ...item })) };
  }

  return delayTemplateCatalog[propertyCode]!;
}

export function listSpecialMovements(propertyCode: PropertyCode): SpecialMovementList {
  if (!specialMovementCatalog[propertyCode]) {
    specialMovementCatalog[propertyCode] = streetcarProperties.has(propertyCode)
      ? { items: streetcarSpecialMovements.items.map((item) => ({ ...item })) }
      : { items: commuterSpecialMovements.items.map((item) => ({ ...item })) };
  }

  return specialMovementCatalog[propertyCode]!;
}

export function updateDelayCommonLocation(
  propertyCode: PropertyCode,
  locationId: string,
  update: DelayCommonLocationUpdate
): void {
  const location = listDelayCommonLocations(propertyCode).items.find((item) => item.id === locationId);

  if (!location) {
    throw new Error("delay_common_location.not_found");
  }

  location.label = update.label;
  location.usageCount = update.usageCount;
}

export function updateDelayTemplate(
  propertyCode: PropertyCode,
  templateId: string,
  update: DelayTemplateUpdate
): void {
  const template = listDelayTemplates(propertyCode).items.find((item) => item.id === templateId);

  if (!template) {
    throw new Error("delay_template.not_found");
  }

  template.name = update.name;
  template.category = update.category;
  template.minutes = update.minutes;
  template.notes = update.notes;
  template.notableDelayType = update.notableDelayType;
  template.specialMovementId = update.specialMovementId;
}

export function updateSpecialMovement(
  propertyCode: PropertyCode,
  movementId: string,
  update: SpecialMovementUpdate
): void {
  const movement = listSpecialMovements(propertyCode).items.find((item) => item.id === movementId);

  if (!movement) {
    throw new Error("special_movement.not_found");
  }

  movement.label = update.label;
  movement.description = update.description;
}

export function getDelayAdditionalInfo(propertyCode: PropertyCode, delayId: string): DelayAdditionalInfo {
  const catalog = getDelayAdditionalInfoCatalog(propertyCode);

  if (!catalog[delayId]) {
    catalog[delayId] = createDefaultDelayAdditionalInfo(delayId);
  }

  return catalog[delayId]!;
}

export function updateDelayAdditionalInfo(
  propertyCode: PropertyCode,
  delayId: string,
  update: DelayAdditionalInfoUpdate
): DelayAdditionalInfo {
  const next = {
    delayId,
    ...update
  };

  getDelayAdditionalInfoCatalog(propertyCode)[delayId] = next;

  return next;
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
  const additionalInfo = getDelayAdditionalInfoCatalog(propertyCode);

  for (const delay of created) {
    additionalInfo[delay.id] = createDefaultDelayAdditionalInfo(delay.id);
  }

  return {
    items: created
  };
}

export function createDelayFromTemplate(
  propertyCode: PropertyCode,
  runId: string,
  input: DelayTemplateCreateRequest
): DelayEvent {
  const template = listDelayTemplates(propertyCode).items.find((item) => item.id === input.templateId);

  if (!template) {
    throw new Error("delay_template.not_found");
  }

  const [created] = createDelayEvents(propertyCode, runId, {
    delays: [
      {
        category: template.category,
        minutes: template.minutes,
        notes: template.notes,
        reportedAt: input.reportedAt
      }
    ]
  }).items;

  if (!created) {
    throw new Error("delay_event.create_failed");
  }

  getDelayAdditionalInfoCatalog(propertyCode)[created.id] = {
    delayId: created.id,
    locationDetail: "",
    responsibleParty: "",
    notableDelayType: template.notableDelayType,
    specialMovementId: template.specialMovementId,
    workOrderId: null,
    mechanicalNotes: "",
    passengerImpactSummary: ""
  };

  return created;
}

export function deleteDelayEvent(
  propertyCode: PropertyCode,
  runId: string,
  delayId: string
): DelayEventDeleteResult {
  const delays = getRunDelays(propertyCode, runId);
  const nextItems = delays.items.filter((delay) => delay.id !== delayId);

  if (nextItems.length === delays.items.length) {
    throw new Error("delay_event.not_found");
  }

  delays.items = nextItems;
  delete getDelayAdditionalInfoCatalog(propertyCode)[delayId];

  return {
    deletedId: delayId,
    runId,
    delayMinutes: nextItems.reduce((total, delay) => total + delay.minutes, 0)
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

export function resetRunDetailState(propertyCode: PropertyCode, runId: string): void {
  const stops = getRunStops(propertyCode, runId);
  const delays = getRunDelays(propertyCode, runId);

  stops.items = stops.items.map((stop) => ({
    ...stop,
    actualTime: null,
    boardings: 0,
    alightings: 0
  }));
  delays.items = [];
}

export function deleteRunDetailState(propertyCode: PropertyCode, runId: string): void {
  const existingDelays = delayCatalog[propertyCode]?.[runId]?.items ?? [];

  for (const delay of existingDelays) {
    delete getDelayAdditionalInfoCatalog(propertyCode)[delay.id];
  }

  delete stopCatalog[propertyCode]?.[runId];
  delete delayCatalog[propertyCode]?.[runId];
}

export function resetRunDetailData(): void {
  for (const propertyCode of Object.keys(stopCatalog) as PropertyCode[]) {
    delete stopCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(delayCatalog) as PropertyCode[]) {
    delete delayCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(additionalInfoCatalog) as PropertyCode[]) {
    delete additionalInfoCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(commonLocationCatalog) as PropertyCode[]) {
    delete commonLocationCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(specialMovementCatalog) as PropertyCode[]) {
    delete specialMovementCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(delayTemplateCatalog) as PropertyCode[]) {
    delete delayTemplateCatalog[propertyCode];
  }
}
