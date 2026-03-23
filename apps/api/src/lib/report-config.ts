import type {
  PropertyCode,
  ReportConfigList,
  ReportConfigRow,
  ReportConfigUpdate,
  ReportPreference,
  ReportPreferenceList,
  ReportPreferenceUpdate,
  ScheduledReportEmailJob,
  ScheduledReportEmailJobCreate,
  ScheduledReportEmailJobDeleteResult,
  ScheduledReportEmailJobList,
  ScheduledReportEmailJobUpdate
} from "@tps/types";

const commuterReportsSeed: ReportConfigList = {
  items: [
    {
      id: "report-1",
      reportName: "Daily OTP",
      audience: "Operations Leadership",
      embedEnabled: true,
      schedule: "06:00 daily"
    },
    {
      id: "report-2",
      reportName: "Delay Detail",
      audience: "Dispatch",
      embedEnabled: true,
      schedule: "Every 30 min"
    },
    {
      id: "report-3",
      reportName: "Crew Exceptions",
      audience: "Crew Management",
      embedEnabled: false,
      schedule: "08:00 weekdays"
    }
  ]
};

const streetcarReportsSeed: ReportConfigList = {
  items: [
    {
      id: "street-report-1",
      reportName: "Streetcar Service Summary",
      audience: "Operations Leadership",
      embedEnabled: true,
      schedule: "07:00 daily"
    },
    {
      id: "street-report-2",
      reportName: "Incident Log",
      audience: "Street Supervisors",
      embedEnabled: false,
      schedule: "On demand"
    }
  ]
};

const commuterPreferencesSeed: ReportPreferenceList = {
  items: [
    {
      id: "report-pref-1",
      reportName: "Daily OTP",
      visibleColumns: ["trainNumber", "otpPercent", "lateTrains"],
      sortOrder: "otpPercent desc",
      filtersSummary: "Weekday service only"
    },
    {
      id: "report-pref-2",
      reportName: "Delay Detail",
      visibleColumns: ["trainNumber", "delayType", "minutes"],
      sortOrder: "minutes desc",
      filtersSummary: "Exclude resolved delays"
    }
  ]
};

const streetcarPreferencesSeed: ReportPreferenceList = {
  items: [
    {
      id: "street-report-pref-1",
      reportName: "Streetcar Service Summary",
      visibleColumns: ["line", "headway", "ridership"],
      sortOrder: "headway asc",
      filtersSummary: "Peak service only"
    }
  ]
};

const commuterEmailJobsSeed: ScheduledReportEmailJobList = {
  items: [
    {
      id: "report-email-1",
      reportName: "Daily OTP",
      recipientGroup: "Operations Leadership",
      schedule: "06:15 daily",
      format: "pdf",
      enabled: true
    },
    {
      id: "report-email-2",
      reportName: "Delay Detail",
      recipientGroup: "Dispatch",
      schedule: "Every 30 min",
      format: "xlsx",
      enabled: true
    }
  ]
};

const streetcarEmailJobsSeed: ScheduledReportEmailJobList = {
  items: [
    {
      id: "street-report-email-1",
      reportName: "Streetcar Service Summary",
      recipientGroup: "Street Supervisors",
      schedule: "07:00 daily",
      format: "pdf",
      enabled: true
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

function cloneReportConfig(value: ReportConfigList): ReportConfigList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function cloneReportPreferences(value: ReportPreferenceList): ReportPreferenceList {
  return {
    items: value.items.map((item) => ({ ...item, visibleColumns: [...item.visibleColumns] }))
  };
}

function cloneScheduledEmailJobs(value: ScheduledReportEmailJobList): ScheduledReportEmailJobList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function isStreetcarProperty(propertyCode: PropertyCode): boolean {
  return streetcarProperties.has(propertyCode);
}

const reportConfigByProperty = new Map<PropertyCode, ReportConfigList>();
const reportPreferencesByProperty = new Map<PropertyCode, ReportPreferenceList>();
const scheduledEmailJobsByProperty = new Map<PropertyCode, ScheduledReportEmailJobList>();

function getReportConfigStore(propertyCode: PropertyCode): ReportConfigList {
  let value = reportConfigByProperty.get(propertyCode);

  if (!value) {
    value = isStreetcarProperty(propertyCode)
      ? cloneReportConfig(streetcarReportsSeed)
      : cloneReportConfig(commuterReportsSeed);
    reportConfigByProperty.set(propertyCode, value);
  }

  return value;
}

function getReportPreferencesStore(propertyCode: PropertyCode): ReportPreferenceList {
  let value = reportPreferencesByProperty.get(propertyCode);

  if (!value) {
    value = isStreetcarProperty(propertyCode)
      ? cloneReportPreferences(streetcarPreferencesSeed)
      : cloneReportPreferences(commuterPreferencesSeed);
    reportPreferencesByProperty.set(propertyCode, value);
  }

  return value;
}

function getScheduledEmailJobsStore(propertyCode: PropertyCode): ScheduledReportEmailJobList {
  let value = scheduledEmailJobsByProperty.get(propertyCode);

  if (!value) {
    value = isStreetcarProperty(propertyCode)
      ? cloneScheduledEmailJobs(streetcarEmailJobsSeed)
      : cloneScheduledEmailJobs(commuterEmailJobsSeed);
    scheduledEmailJobsByProperty.set(propertyCode, value);
  }

  return value;
}

export function listReportConfig(propertyCode: PropertyCode): ReportConfigList {
  return getReportConfigStore(propertyCode);
}

export function updateReportConfig(
  propertyCode: PropertyCode,
  reportId: string,
  update: ReportConfigUpdate
): ReportConfigRow {
  const source = getReportConfigStore(propertyCode);
  const row = source.items.find((item) => item.id === reportId);

  if (!row) {
    throw new Error("report_config.not_found");
  }

  row.audience = update.audience;
  row.embedEnabled = update.embedEnabled;
  row.schedule = update.schedule;

  return row;
}

export function listReportPreferences(propertyCode: PropertyCode): ReportPreferenceList {
  return getReportPreferencesStore(propertyCode);
}

export function updateReportPreference(
  propertyCode: PropertyCode,
  preferenceId: string,
  update: ReportPreferenceUpdate
): ReportPreference {
  const source = getReportPreferencesStore(propertyCode);
  const row = source.items.find((item) => item.id === preferenceId);

  if (!row) {
    throw new Error("report_preference.not_found");
  }

  row.visibleColumns = [...update.visibleColumns];
  row.sortOrder = update.sortOrder;
  row.filtersSummary = update.filtersSummary;

  return row;
}

export function listScheduledReportEmailJobs(
  propertyCode: PropertyCode
): ScheduledReportEmailJobList {
  return getScheduledEmailJobsStore(propertyCode);
}

export function createScheduledReportEmailJob(
  propertyCode: PropertyCode,
  input: ScheduledReportEmailJobCreate
): ScheduledReportEmailJob {
  const source = getScheduledEmailJobsStore(propertyCode);
  const job: ScheduledReportEmailJob = {
    id: crypto.randomUUID(),
    reportName: input.reportName,
    recipientGroup: input.recipientGroup,
    schedule: input.schedule,
    format: input.format,
    enabled: input.enabled
  };
  source.items.unshift(job);
  return job;
}

export function updateScheduledReportEmailJob(
  propertyCode: PropertyCode,
  jobId: string,
  update: ScheduledReportEmailJobUpdate
): ScheduledReportEmailJob {
  const source = getScheduledEmailJobsStore(propertyCode);
  const row = source.items.find((item) => item.id === jobId);

  if (!row) {
    throw new Error("scheduled_report_email.not_found");
  }

  row.recipientGroup = update.recipientGroup;
  row.schedule = update.schedule;
  row.format = update.format;
  row.enabled = update.enabled;

  return row;
}

export function deleteScheduledReportEmailJob(
  propertyCode: PropertyCode,
  jobId: string
): ScheduledReportEmailJobDeleteResult {
  const source = getScheduledEmailJobsStore(propertyCode);
  const jobIndex = source.items.findIndex((item) => item.id === jobId);

  if (jobIndex === -1) {
    throw new Error("scheduled_report_email.not_found");
  }

  source.items.splice(jobIndex, 1);

  return {
    deletedJobId: jobId
  };
}

export function resetReportConfigData() {
  reportConfigByProperty.clear();
  reportPreferencesByProperty.clear();
  scheduledEmailJobsByProperty.clear();
}
