import type { PropertyCode, ReferenceDataset } from "@tps/types";

const streetcarReference: ReferenceDataset = {
  delayReasons: ["Traffic hold", "Signal issue", "Passenger assistance", "Vehicle reset"],
  crewRoles: ["Operator", "Street Supervisor", "Service Lead"],
  stationCodes: ["ST01", "ST02", "ST03", "ST04"]
};

const commuterReference: ReferenceDataset = {
  delayReasons: ["Mechanical", "Signal delay", "Late crew", "Passenger loading"],
  crewRoles: ["Engineer", "Conductor", "Assistant Conductor", "Dispatcher"],
  stationCodes: ["STA", "STB", "STC", "STD", "STE"]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

export function getReferenceData(propertyCode: PropertyCode): ReferenceDataset {
  if (!referenceCatalog[propertyCode]) {
    referenceCatalog[propertyCode] = streetcarProperties.has(propertyCode)
      ? {
          delayReasons: [...streetcarReference.delayReasons],
          crewRoles: [...streetcarReference.crewRoles],
          stationCodes: [...streetcarReference.stationCodes]
        }
      : {
          delayReasons: [...commuterReference.delayReasons],
          crewRoles: [...commuterReference.crewRoles],
          stationCodes: [...commuterReference.stationCodes]
        };
  }

  return referenceCatalog[propertyCode]!;
}

const referenceCatalog: Partial<Record<PropertyCode, ReferenceDataset>> = {};

export function updateReferenceData(propertyCode: PropertyCode, update: ReferenceDataset): ReferenceDataset {
  referenceCatalog[propertyCode] = {
    delayReasons: [...update.delayReasons],
    crewRoles: [...update.crewRoles],
    stationCodes: [...update.stationCodes]
  };

  return referenceCatalog[propertyCode]!;
}

export function resetReferenceData(): void {
  for (const propertyCode of Object.keys(referenceCatalog) as PropertyCode[]) {
    delete referenceCatalog[propertyCode];
  }
}
