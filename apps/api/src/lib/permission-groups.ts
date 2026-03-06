import type { PermissionGroupList, PropertyCode } from "@tps/types";

const commuterGroups: PermissionGroupList = {
  items: [
    {
      id: "ops-admin",
      name: "Operations Admin",
      description: "Full operational control across schedules, runs, delays, and crew.",
      members: 4,
      permissions: ["schedules.write", "runs.approve", "delays.write", "crew.assign"]
    },
    {
      id: "dispatch",
      name: "Dispatcher",
      description: "Day-of-service editing for train runs and delays.",
      members: 7,
      permissions: ["runs.write", "delays.write", "stops.write"]
    }
  ]
};

const streetcarGroups: PermissionGroupList = {
  items: [
    {
      id: "streetcar-ops",
      name: "Streetcar Operations",
      description: "Dispatch and service adjustments for streetcar operations.",
      members: 3,
      permissions: ["runs.write", "delays.write", "crew.assign"]
    },
    {
      id: "streetcar-reporting",
      name: "Streetcar Reporting",
      description: "Read-only reporting and export access.",
      members: 2,
      permissions: ["reports.view", "reports.export"]
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

export function listPermissionGroups(propertyCode: PropertyCode): PermissionGroupList {
  return streetcarProperties.has(propertyCode) ? streetcarGroups : commuterGroups;
}
