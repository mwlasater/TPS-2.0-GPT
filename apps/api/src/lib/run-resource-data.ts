import type {
  ConsistEquipment,
  ConsistEquipmentList,
  ConsistEquipmentUpdate,
  CrewAssignment,
  CrewAssignmentList,
  CrewAssignmentUpdate,
  PropertyCode
} from "@tps/types";

const commuterConsist: ConsistEquipmentList = {
  items: [
    {
      id: "equip-1",
      equipmentNumber: "CAB-901",
      equipmentType: "Cab Car",
      position: 1,
      status: "active"
    },
    {
      id: "equip-2",
      equipmentNumber: "COACH-442",
      equipmentType: "Coach",
      position: 2,
      status: "active"
    },
    {
      id: "equip-3",
      equipmentNumber: "LOCO-120",
      equipmentType: "Locomotive",
      position: 3,
      status: "active"
    }
  ]
};

const streetcarConsist: ConsistEquipmentList = {
  items: [
    {
      id: "street-equip-1",
      equipmentNumber: "SC-01",
      equipmentType: "Streetcar Vehicle",
      position: 1,
      status: "active"
    }
  ]
};

const commuterCrew: CrewAssignmentList = {
  items: [
    {
      id: "crew-1",
      employeeName: "Jordan Reyes",
      role: "Engineer",
      onDutyTime: "05:30",
      status: "assigned"
    },
    {
      id: "crew-2",
      employeeName: "Taylor Brooks",
      role: "Conductor",
      onDutyTime: "05:35",
      status: "assigned"
    },
    {
      id: "crew-3",
      employeeName: "Casey Morgan",
      role: "Assistant Conductor",
      onDutyTime: "05:40",
      status: "pending_relief"
    }
  ]
};

const streetcarCrew: CrewAssignmentList = {
  items: [
    {
      id: "street-crew-1",
      employeeName: "Jordan Reyes",
      role: "Operator",
      onDutyTime: "06:45",
      status: "assigned"
    },
    {
      id: "street-crew-2",
      employeeName: "Taylor Brooks",
      role: "Street Supervisor",
      onDutyTime: "06:50",
      status: "complete"
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

const consistCatalog: Partial<Record<PropertyCode, Partial<Record<string, ConsistEquipmentList>>>> = {};
const crewCatalog: Partial<Record<PropertyCode, Partial<Record<string, CrewAssignmentList>>>> = {};

function getRunConsist(propertyCode: PropertyCode, runId: string): ConsistEquipmentList {
  if (!consistCatalog[propertyCode]) {
    consistCatalog[propertyCode] = {};
  }

  if (!consistCatalog[propertyCode]![runId]) {
    consistCatalog[propertyCode]![runId] =
      runId.includes("streetcar") || streetcarProperties.has(propertyCode)
        ? {
            items: streetcarConsist.items.map((equipment) => ({ ...equipment }))
          }
        : {
            items: commuterConsist.items.map((equipment) => ({ ...equipment }))
          };
  }

  return consistCatalog[propertyCode]![runId]!;
}

function getRunCrew(propertyCode: PropertyCode, runId: string): CrewAssignmentList {
  if (!crewCatalog[propertyCode]) {
    crewCatalog[propertyCode] = {};
  }

  if (!crewCatalog[propertyCode]![runId]) {
    crewCatalog[propertyCode]![runId] =
      runId.includes("streetcar") || streetcarProperties.has(propertyCode)
        ? {
            items: streetcarCrew.items.map((assignment) => ({ ...assignment }))
          }
        : {
            items: commuterCrew.items.map((assignment) => ({ ...assignment }))
          };
  }

  return crewCatalog[propertyCode]![runId]!;
}

export function listConsistEquipment(propertyCode: PropertyCode, runId: string): ConsistEquipmentList {
  return getRunConsist(propertyCode, runId);
}

export function listCrewAssignments(propertyCode: PropertyCode, runId: string): CrewAssignmentList {
  return getRunCrew(propertyCode, runId);
}

export function updateConsistEquipment(
  propertyCode: PropertyCode,
  runId: string,
  equipmentId: string,
  update: ConsistEquipmentUpdate
): ConsistEquipment {
  const row = listConsistEquipment(propertyCode, runId).items.find(
    (candidate) => candidate.id === equipmentId
  );

  if (!row) {
    throw new Error("consist_equipment.not_found");
  }

  row.position = update.position;
  row.status = update.status;

  return row;
}

export function updateCrewAssignment(
  propertyCode: PropertyCode,
  runId: string,
  assignmentId: string,
  update: CrewAssignmentUpdate
): CrewAssignment {
  const row = listCrewAssignments(propertyCode, runId).items.find(
    (candidate) => candidate.id === assignmentId
  );

  if (!row) {
    throw new Error("crew_assignment.not_found");
  }

  row.role = update.role;
  row.onDutyTime = update.onDutyTime;
  row.status = update.status;

  return row;
}

export function resetRunResourceState(propertyCode: PropertyCode, runId: string): void {
  if (!consistCatalog[propertyCode]) {
    consistCatalog[propertyCode] = {};
  }

  if (!crewCatalog[propertyCode]) {
    crewCatalog[propertyCode] = {};
  }

  consistCatalog[propertyCode]![runId] = { items: [] };
  crewCatalog[propertyCode]![runId] = { items: [] };
}

export function deleteRunResourceState(propertyCode: PropertyCode, runId: string): void {
  delete consistCatalog[propertyCode]?.[runId];
  delete crewCatalog[propertyCode]?.[runId];
}

export function resetRunResourceData(): void {
  for (const propertyCode of Object.keys(consistCatalog) as PropertyCode[]) {
    delete consistCatalog[propertyCode];
  }

  for (const propertyCode of Object.keys(crewCatalog) as PropertyCode[]) {
    delete crewCatalog[propertyCode];
  }
}
