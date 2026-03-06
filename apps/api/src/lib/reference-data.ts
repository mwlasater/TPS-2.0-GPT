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
  return streetcarProperties.has(propertyCode) ? streetcarReference : commuterReference;
}
