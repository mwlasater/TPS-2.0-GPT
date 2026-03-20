import type { PermissionGroupList, PermissionGroupUpdate, PropertyCode } from "@tps/types";

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

function cloneGroupList(source: PermissionGroupList): PermissionGroupList {
  return {
    items: source.items.map((item) => ({
      ...item,
      permissions: [...item.permissions]
    }))
  };
}

const initialPermissionGroups: Record<"commuter" | "streetcar", PermissionGroupList> = {
  commuter: cloneGroupList(commuterGroups),
  streetcar: cloneGroupList(streetcarGroups)
};

function getGroupCatalog(propertyCode: PropertyCode): PermissionGroupList {
  return streetcarProperties.has(propertyCode) ? streetcarGroups : commuterGroups;
}

export function listPermissionGroups(propertyCode: PropertyCode): PermissionGroupList {
  return cloneGroupList(getGroupCatalog(propertyCode));
}

export function updatePermissionGroup(
  propertyCode: PropertyCode,
  groupId: string,
  update: PermissionGroupUpdate
): void {
  const catalog = getGroupCatalog(propertyCode);
  const group = catalog.items.find((candidate) => candidate.id === groupId);

  if (!group) {
    throw new Error("permission_group.not_found");
  }

  group.description = update.description;
  group.permissions = [...update.permissions];
}

export function resetPermissionGroups(): void {
  commuterGroups.items = cloneGroupList(initialPermissionGroups.commuter).items;
  streetcarGroups.items = cloneGroupList(initialPermissionGroups.streetcar).items;
}
