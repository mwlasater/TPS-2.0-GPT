import type {
  AttendanceException,
  AttendanceExceptionList,
  AttendanceExceptionUpdate,
  AttendanceHistoryList,
  AttendanceIssueList,
  AttendanceIssueRecord,
  AttendanceIssueUpdate,
  AttendanceNotificationRule,
  AttendanceNotificationRuleCreate,
  AttendanceNotificationRuleDeleteResult,
  AttendanceNotificationRuleList,
  AttendanceNotificationRuleUpdate,
  JobProfile,
  JobProfileList,
  JobProfileUpdate,
  PropertyCode
} from "@tps/types";

const commuterProfilesSeed: JobProfileList = {
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

const streetcarProfilesSeed: JobProfileList = {
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

const commuterAttendanceIssuesSeed: AttendanceIssueList = {
  items: [
    {
      id: "att-1",
      employeeId: "personnel-2",
      employeeName: "Taylor Brooks",
      issueType: "absence",
      startDate: "2026-03-06",
      endDate: "2026-03-07",
      status: "approved",
      notes: "Approved medical leave."
    },
    {
      id: "att-2",
      employeeId: "personnel-2",
      employeeName: "Taylor Brooks",
      issueType: "tardiness",
      startDate: "2026-03-06",
      endDate: null,
      status: "open",
      notes: "Reported 12 minutes late due to traffic."
    },
    {
      id: "att-3",
      employeeId: "personnel-2",
      employeeName: "Taylor Brooks",
      issueType: "absence",
      startDate: "2026-02-24",
      endDate: "2026-02-24",
      status: "resolved",
      notes: "Prior approved absence retained for history."
    }
  ]
};

const streetcarAttendanceIssuesSeed: AttendanceIssueList = {
  items: [
    {
      id: "street-att-1",
      employeeId: "personnel-3",
      employeeName: "Jordan Reyes",
      issueType: "tardiness",
      startDate: "2026-03-06",
      endDate: "2026-03-06",
      status: "resolved",
      notes: "Late sign-on resolved with supervisor approval."
    }
  ]
};

const commuterAttendanceNotificationRulesSeed: AttendanceNotificationRuleList = {
  items: [
    {
      id: "attendance-rule-1",
      issueType: "absence",
      triggerStatus: "open",
      recipientGroup: "Operations Leadership",
      templateName: "Absence Open Alert",
      enabled: true
    },
    {
      id: "attendance-rule-2",
      issueType: "tardiness",
      triggerStatus: "approved",
      recipientGroup: "Crew Management",
      templateName: "Tardiness Supervisor Notice",
      enabled: true
    }
  ]
};

const streetcarAttendanceNotificationRulesSeed: AttendanceNotificationRuleList = {
  items: [
    {
      id: "street-attendance-rule-1",
      issueType: "tardiness",
      triggerStatus: "open",
      recipientGroup: "Street Operations",
      templateName: "Streetcar Tardiness Alert",
      enabled: true
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

function cloneJobProfiles(value: JobProfileList): JobProfileList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function cloneAttendanceIssues(value: AttendanceIssueList): AttendanceIssueList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function cloneAttendanceNotificationRules(
  value: AttendanceNotificationRuleList
): AttendanceNotificationRuleList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function isStreetcarProperty(propertyCode: PropertyCode): boolean {
  return streetcarProperties.has(propertyCode);
}

function buildProfilesSeed(propertyCode: PropertyCode): JobProfileList {
  return isStreetcarProperty(propertyCode) ? cloneJobProfiles(streetcarProfilesSeed) : cloneJobProfiles(commuterProfilesSeed);
}

function buildAttendanceIssuesSeed(propertyCode: PropertyCode): AttendanceIssueList {
  return isStreetcarProperty(propertyCode)
    ? cloneAttendanceIssues(streetcarAttendanceIssuesSeed)
    : cloneAttendanceIssues(commuterAttendanceIssuesSeed);
}

function buildAttendanceNotificationRulesSeed(
  propertyCode: PropertyCode
): AttendanceNotificationRuleList {
  return isStreetcarProperty(propertyCode)
    ? cloneAttendanceNotificationRules(streetcarAttendanceNotificationRulesSeed)
    : cloneAttendanceNotificationRules(commuterAttendanceNotificationRulesSeed);
}

const jobProfilesByProperty = new Map<PropertyCode, JobProfileList>();
const attendanceIssuesByProperty = new Map<PropertyCode, AttendanceIssueList>();
const attendanceNotificationRulesByProperty = new Map<PropertyCode, AttendanceNotificationRuleList>();

function getJobProfilesStore(propertyCode: PropertyCode): JobProfileList {
  let value = jobProfilesByProperty.get(propertyCode);

  if (!value) {
    value = buildProfilesSeed(propertyCode);
    jobProfilesByProperty.set(propertyCode, value);
  }

  return value;
}

function getAttendanceIssuesStore(propertyCode: PropertyCode): AttendanceIssueList {
  let value = attendanceIssuesByProperty.get(propertyCode);

  if (!value) {
    value = buildAttendanceIssuesSeed(propertyCode);
    attendanceIssuesByProperty.set(propertyCode, value);
  }

  return value;
}

function getAttendanceNotificationRulesStore(
  propertyCode: PropertyCode
): AttendanceNotificationRuleList {
  let value = attendanceNotificationRulesByProperty.get(propertyCode);

  if (!value) {
    value = buildAttendanceNotificationRulesSeed(propertyCode);
    attendanceNotificationRulesByProperty.set(propertyCode, value);
  }

  return value;
}

export function listJobProfiles(propertyCode: PropertyCode): JobProfileList {
  return getJobProfilesStore(propertyCode);
}

export function updateJobProfile(
  propertyCode: PropertyCode,
  profileId: string,
  update: JobProfileUpdate
): JobProfile {
  const source = getJobProfilesStore(propertyCode);
  const row = source.items.find((item) => item.id === profileId);

  if (!row) {
    throw new Error("job_profile.not_found");
  }

  row.department = update.department;
  row.minimumHeadcount = update.minimumHeadcount;
  row.reliefRequired = update.reliefRequired;

  return row;
}

function toAttendanceException(record: AttendanceIssueRecord): AttendanceException {
  return {
    id: record.id,
    employeeId: record.employeeId,
    employeeName: record.employeeName,
    exceptionType: record.issueType === "tardiness" ? "tardy" : "absence",
    startDate: record.startDate,
    endDate: record.endDate,
    status: record.status,
    notes: record.notes
  };
}

export function listAttendanceExceptions(propertyCode: PropertyCode): AttendanceExceptionList {
  return {
    items: getAttendanceIssuesStore(propertyCode).items.map(toAttendanceException)
  };
}

export function updateAttendanceException(
  propertyCode: PropertyCode,
  exceptionId: string,
  update: AttendanceExceptionUpdate
): AttendanceException {
  const record = updateAttendanceIssue(propertyCode, exceptionId, {
    status: update.status,
    notes: update.notes,
    endDate: null
  });

  return toAttendanceException(record);
}

export function listAttendanceIssues(propertyCode: PropertyCode): AttendanceIssueList {
  return getAttendanceIssuesStore(propertyCode);
}

export function listAttendanceHistory(
  propertyCode: PropertyCode,
  employeeId: string,
  issueType?: AttendanceIssueRecord["issueType"]
): AttendanceHistoryList {
  const items = getAttendanceIssuesStore(propertyCode).items
    .filter((item) => item.employeeId === employeeId)
    .filter((item) => (issueType ? item.issueType === issueType : true))
    .sort((left, right) => right.startDate.localeCompare(left.startDate));

  return {
    employeeId,
    items
  };
}

export function updateAttendanceIssue(
  propertyCode: PropertyCode,
  issueId: string,
  update: AttendanceIssueUpdate
): AttendanceIssueRecord {
  const source = getAttendanceIssuesStore(propertyCode);
  const row = source.items.find((item) => item.id === issueId);

  if (!row) {
    throw new Error("attendance_issue.not_found");
  }

  row.status = update.status;
  row.notes = update.notes;
  row.endDate = update.endDate;

  return row;
}

export function listAttendanceNotificationRules(
  propertyCode: PropertyCode
): AttendanceNotificationRuleList {
  return getAttendanceNotificationRulesStore(propertyCode);
}

export function createAttendanceNotificationRule(
  propertyCode: PropertyCode,
  input: AttendanceNotificationRuleCreate
): AttendanceNotificationRule {
  const source = getAttendanceNotificationRulesStore(propertyCode);
  const rule: AttendanceNotificationRule = {
    id: crypto.randomUUID(),
    issueType: input.issueType,
    triggerStatus: input.triggerStatus,
    recipientGroup: input.recipientGroup,
    templateName: input.templateName,
    enabled: input.enabled
  };
  source.items.unshift(rule);
  return rule;
}

export function updateAttendanceNotificationRule(
  propertyCode: PropertyCode,
  ruleId: string,
  update: AttendanceNotificationRuleUpdate
): AttendanceNotificationRule {
  const source = getAttendanceNotificationRulesStore(propertyCode);
  const row = source.items.find((item) => item.id === ruleId);

  if (!row) {
    throw new Error("attendance_notification_rule.not_found");
  }

  row.triggerStatus = update.triggerStatus;
  row.recipientGroup = update.recipientGroup;
  row.templateName = update.templateName;
  row.enabled = update.enabled;

  return row;
}

export function deleteAttendanceNotificationRule(
  propertyCode: PropertyCode,
  ruleId: string
): AttendanceNotificationRuleDeleteResult {
  const source = getAttendanceNotificationRulesStore(propertyCode);
  const rowIndex = source.items.findIndex((item) => item.id === ruleId);

  if (rowIndex === -1) {
    throw new Error("attendance_notification_rule.not_found");
  }

  source.items.splice(rowIndex, 1);

  return {
    deletedRuleId: ruleId
  };
}

export function resetBaselineData() {
  jobProfilesByProperty.clear();
  attendanceIssuesByProperty.clear();
  attendanceNotificationRulesByProperty.clear();
}
