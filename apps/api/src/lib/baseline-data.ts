import type {
  AttendanceExceptionList,
  JobProfileList,
  PropertyCode
} from "@tps/types";

const commuterProfiles: JobProfileList = {
  items: [
    {
      id: "engineer",
      title: "Engineer",
      department: "Transportation",
      minimumHeadcount: 1,
      reliefRequired: true
    },
    {
      id: "conductor",
      title: "Conductor",
      department: "Transportation",
      minimumHeadcount: 1,
      reliefRequired: true
    },
    {
      id: "dispatcher",
      title: "Dispatcher",
      department: "Control Center",
      minimumHeadcount: 2,
      reliefRequired: false
    }
  ]
};

const streetcarProfiles: JobProfileList = {
  items: [
    {
      id: "operator",
      title: "Operator",
      department: "Street Operations",
      minimumHeadcount: 1,
      reliefRequired: true
    },
    {
      id: "street-supervisor",
      title: "Street Supervisor",
      department: "Street Operations",
      minimumHeadcount: 1,
      reliefRequired: false
    }
  ]
};

const commuterAttendance: AttendanceExceptionList = {
  items: [
    {
      id: "att-1",
      employeeName: "Casey Morgan",
      exceptionType: "absence",
      startDate: "2026-03-06",
      status: "approved",
      notes: "Approved medical leave."
    },
    {
      id: "att-2",
      employeeName: "Taylor Brooks",
      exceptionType: "tardy",
      startDate: "2026-03-06",
      status: "open",
      notes: "Reported 12 minutes late due to traffic."
    }
  ]
};

const streetcarAttendance: AttendanceExceptionList = {
  items: [
    {
      id: "street-att-1",
      employeeName: "Jordan Reyes",
      exceptionType: "tardy",
      startDate: "2026-03-06",
      status: "resolved",
      notes: "Late sign-on resolved with supervisor approval."
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

export function listJobProfiles(propertyCode: PropertyCode): JobProfileList {
  return streetcarProperties.has(propertyCode) ? streetcarProfiles : commuterProfiles;
}

export function listAttendanceExceptions(propertyCode: PropertyCode): AttendanceExceptionList {
  return streetcarProperties.has(propertyCode) ? streetcarAttendance : commuterAttendance;
}
