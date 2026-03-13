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

const consistCatalog: Partial<Record<PropertyCode, ConsistEquipmentList>> = {};
const crewCatalog: Partial<Record<PropertyCode, CrewAssignmentList>> = {};

export function listConsistEquipment(propertyCode: PropertyCode, runId: string): ConsistEquipmentList {
  if (!consistCatalog[propertyCode]) {
    consistCatalog[propertyCode] =
      runId.includes("streetcar") || streetcarProperties.has(propertyCode)
        ? {
            items: streetcarConsist.items.map((equipment) => ({ ...equipment }))
          }
        : {
            items: commuterConsist.items.map((equipment) => ({ ...equipment }))
          };
  }

  return consistCatalog[propertyCode]!;
}

export function listCrewAssignments(propertyCode: PropertyCode, runId: string): CrewAssignmentList {
  if (!crewCatalog[propertyCode]) {
    crewCatalog[propertyCode] =
      runId.includes("streetcar") || streetcarProperties.has(propertyCode)
        ? {
            items: streetcarCrew.items.map((assignment) => ({ ...assignment }))
          }
        : {
            items: commuterCrew.items.map((assignment) => ({ ...assignment }))
          };
  }

  return crewCatalog[propertyCode]!;
}

export function updateConsistEquipment(
  propertyCode: PropertyCode,
  equipmentId: string,
  update: ConsistEquipmentUpdate
): ConsistEquipment {
  const row = listConsistEquipment(propertyCode, "").items.find((candidate) => candidate.id === equipmentId);

  if (!row) {
    throw new Error("consist_equipment.not_found");
  }

  row.position = update.position;
  row.status = update.status;

  return row;
}

export function updateCrewAssignment(
  propertyCode: PropertyCode,
  assignmentId: string,
  update: CrewAssignmentUpdate
): CrewAssignment {
  const row = listCrewAssignments(propertyCode, "").items.find(
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
