import type {
  PersonnelRecord,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PropertyCode
} from "@tps/types";

const commuterPersonnel: PersonnelRecordList = {
  items: [
    {
      id: "personnel-1",
      employeeId: "HZG-1001",
      employeeName: "Jordan Reyes",
      status: "active",
      primaryRole: "Engineer",
      certifications: ["FRA Engineer", "Rules Qualified"]
    },
    {
      id: "personnel-2",
      employeeId: "HZG-1002",
      employeeName: "Taylor Brooks",
      status: "on_leave",
      primaryRole: "Conductor",
      certifications: ["Conductor", "Roadway Worker Protection"]
    }
  ]
};

const streetcarPersonnel: PersonnelRecordList = {
  items: [
    {
      id: "personnel-street-1",
      employeeId: "HZG-2001",
      employeeName: "Morgan Lee",
      status: "active",
      primaryRole: "Operator",
      certifications: ["Streetcar Operations", "Traffic Control"]
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

const personnelCatalog: Partial<Record<PropertyCode, PersonnelRecordList>> = {};

export function listPersonnelRecords(propertyCode: PropertyCode): PersonnelRecordList {
  if (!personnelCatalog[propertyCode]) {
    personnelCatalog[propertyCode] = streetcarProperties.has(propertyCode)
      ? { items: streetcarPersonnel.items.map((item) => ({ ...item })) }
      : { items: commuterPersonnel.items.map((item) => ({ ...item })) };
  }

  return personnelCatalog[propertyCode]!;
}

export function updatePersonnelStatus(
  propertyCode: PropertyCode,
  personnelId: string,
  update: PersonnelStatusUpdate
): PersonnelRecord {
  const record = listPersonnelRecords(propertyCode).items.find((item) => item.id === personnelId);

  if (!record) {
    throw new Error("personnel_record.not_found");
  }

  record.status = update.status;
  record.primaryRole = update.primaryRole;

  return record;
}

export function resetPersonnelData(): void {
  for (const propertyCode of Object.keys(personnelCatalog) as PropertyCode[]) {
    delete personnelCatalog[propertyCode];
  }
}
