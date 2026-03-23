import crypto from "node:crypto";

import type {
  LiveReportCatalogList,
  LiveReportExecutionList,
  LiveReportExecutionRecord,
  LiveReportExecutionRequest,
  PassengerReportImportCreate,
  PassengerReportImportList,
  PropertyCode,
  ReportConfigList,
  ReportConfigRow,
  ReportConfigUpdate,
  ReportDeliveryRecord,
  ReportDeliveryRecordList,
  ReportDeliveryRequest,
  ReportDeliveryStatusUpdate,
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

const commuterLiveReportsSeed: LiveReportCatalogList = {
  items: [
    {
      id: "live-report-otp",
      reportName: "Daily OTP Live",
      provider: "power_bi",
      audience: "Operations Leadership",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp-live",
      status: "available"
    },
    {
      id: "live-report-dispatch",
      reportName: "Dispatcher Delay Board",
      provider: "paginated",
      audience: "Dispatch",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=dispatch-delay-board",
      status: "available"
    }
  ]
};

const streetcarLiveReportsSeed: LiveReportCatalogList = {
  items: [
    {
      id: "street-live-headway",
      reportName: "Street Headway Monitor",
      provider: "power_bi",
      audience: "Street Supervisors",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=street-headway-monitor",
      status: "available"
    }
  ]
};

const commuterPassengerImportsSeed: PassengerReportImportList = {
  items: [
    {
      id: "passenger-import-1",
      importName: "Weekday passenger reconciliation",
      sourceFileName: "caltrain-passenger-2026-03-06.csv",
      importedAt: "2026-03-06T13:05:00Z",
      importedBy: "Taylor Brooks",
      operatingDate: "2026-03-06",
      rowCount: 184,
      status: "processed",
      notes: "Matched to daily boarding feed with no rejected rows."
    }
  ]
};

const streetcarPassengerImportsSeed: PassengerReportImportList = {
  items: [
    {
      id: "street-passenger-import-1",
      importName: "Streetcar rider count import",
      sourceFileName: "kcstreetcar-passenger-2026-03-06.csv",
      importedAt: "2026-03-06T12:10:00Z",
      importedBy: "Jordan Reyes",
      operatingDate: "2026-03-06",
      rowCount: 44,
      status: "warning",
      notes: "Two rows flagged for missing stop codes and held for review."
    }
  ]
};

const commuterReportDeliveriesSeed: ReportDeliveryRecordList = {
  items: [
    {
      id: "report-delivery-1",
      reportName: "Daily OTP",
      format: "pdf",
      deliveryMode: "email",
      recipient: "operations.leadership@herzog.com",
      status: "sent",
      requestedAt: "2026-03-06T06:16:00Z",
      requestedBy: "Taylor Brooks",
      notes: "Morning leadership packet.",
      retryCount: 0,
      lastRetriedAt: null
    }
  ]
};

const streetcarReportDeliveriesSeed: ReportDeliveryRecordList = {
  items: [
    {
      id: "street-report-delivery-1",
      reportName: "Streetcar Service Summary",
      format: "pdf",
      deliveryMode: "download",
      recipient: "Street Supervisors",
      status: "generated",
      requestedAt: "2026-03-06T07:05:00Z",
      requestedBy: "Jordan Reyes",
      notes: "Supervisor handoff packet.",
      retryCount: 0,
      lastRetriedAt: null
    }
  ]
};

const commuterLiveReportExecutionsSeed: LiveReportExecutionList = {
  items: [
    {
      id: "live-execution-1",
      reportId: "live-report-otp",
      reportName: "Daily OTP Live",
      format: "interactive",
      deliveryMode: "view",
      recipient: "Operations Leadership",
      status: "ready",
      executedAt: "2026-03-06T06:10:00Z",
      executedBy: "Taylor Brooks",
      filtersSummary: "Weekday service, current operating day",
      notes: "Leadership standup review.",
      linkedDeliveryId: null
    }
  ]
};

const streetcarLiveReportExecutionsSeed: LiveReportExecutionList = {
  items: [
    {
      id: "street-live-execution-1",
      reportId: "street-live-headway",
      reportName: "Street Headway Monitor",
      format: "pdf",
      deliveryMode: "download",
      recipient: "Street Supervisors",
      status: "generated",
      executedAt: "2026-03-06T07:00:00Z",
      executedBy: "Jordan Reyes",
      filtersSummary: "Peak service only",
      notes: "Morning supervisor packet.",
      linkedDeliveryId: "street-report-delivery-1"
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

function cloneLiveReports(value: LiveReportCatalogList): LiveReportCatalogList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function cloneLiveReportExecutions(value: LiveReportExecutionList): LiveReportExecutionList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function clonePassengerImports(value: PassengerReportImportList): PassengerReportImportList {
  return {
    items: value.items.map((item) => ({ ...item }))
  };
}

function cloneReportDeliveries(value: ReportDeliveryRecordList): ReportDeliveryRecordList {
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
const liveReportsByProperty = new Map<PropertyCode, LiveReportCatalogList>();
const liveReportExecutionsByProperty = new Map<PropertyCode, LiveReportExecutionList>();
const passengerImportsByProperty = new Map<PropertyCode, PassengerReportImportList>();
const reportDeliveriesByProperty = new Map<PropertyCode, ReportDeliveryRecordList>();

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

function getLiveReportsStore(propertyCode: PropertyCode): LiveReportCatalogList {
  let value = liveReportsByProperty.get(propertyCode);

  if (!value) {
    value = isStreetcarProperty(propertyCode)
      ? cloneLiveReports(streetcarLiveReportsSeed)
      : cloneLiveReports(commuterLiveReportsSeed);
    liveReportsByProperty.set(propertyCode, value);
  }

  return value;
}

function getPassengerImportsStore(propertyCode: PropertyCode): PassengerReportImportList {
  let value = passengerImportsByProperty.get(propertyCode);

  if (!value) {
    value = isStreetcarProperty(propertyCode)
      ? clonePassengerImports(streetcarPassengerImportsSeed)
      : clonePassengerImports(commuterPassengerImportsSeed);
    passengerImportsByProperty.set(propertyCode, value);
  }

  return value;
}

function getLiveReportExecutionsStore(propertyCode: PropertyCode): LiveReportExecutionList {
  if (!liveReportExecutionsByProperty.has(propertyCode)) {
    liveReportExecutionsByProperty.set(
      propertyCode,
      streetcarProperties.has(propertyCode)
        ? cloneLiveReportExecutions(streetcarLiveReportExecutionsSeed)
        : cloneLiveReportExecutions(commuterLiveReportExecutionsSeed)
    );
  }

  return liveReportExecutionsByProperty.get(propertyCode)!;
}

function getReportDeliveriesStore(propertyCode: PropertyCode): ReportDeliveryRecordList {
  let value = reportDeliveriesByProperty.get(propertyCode);

  if (!value) {
    value = isStreetcarProperty(propertyCode)
      ? cloneReportDeliveries(streetcarReportDeliveriesSeed)
      : cloneReportDeliveries(commuterReportDeliveriesSeed);
    reportDeliveriesByProperty.set(propertyCode, value);
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

export function listLiveReports(propertyCode: PropertyCode): LiveReportCatalogList {
  return getLiveReportsStore(propertyCode);
}

export function listLiveReportExecutions(propertyCode: PropertyCode): LiveReportExecutionList {
  return getLiveReportExecutionsStore(propertyCode);
}

export function executeLiveReport(
  propertyCode: PropertyCode,
  reportId: string,
  input: LiveReportExecutionRequest,
  actorName: string
): LiveReportExecutionRecord {
  const liveReport = getLiveReportsStore(propertyCode).items.find((item) => item.id === reportId);

  if (!liveReport) {
    throw new Error("live_report.not_found");
  }

  let linkedDeliveryId: string | null = null;

  if (input.deliveryMode !== "view") {
    const delivery = createReportDelivery(
      propertyCode,
      {
        reportName: liveReport.reportName,
        format: input.format === "interactive" ? "pdf" : input.format,
        deliveryMode: input.deliveryMode === "email" ? "email" : "download",
        recipient: input.recipient,
        notes: input.notes
      },
      actorName
    );
    linkedDeliveryId = delivery.id;
  }

  const record: LiveReportExecutionRecord = {
    id: crypto.randomUUID(),
    reportId,
    reportName: liveReport.reportName,
    format: input.format,
    deliveryMode: input.deliveryMode,
    recipient: input.recipient,
    status:
      input.deliveryMode === "email"
        ? "sent"
        : input.deliveryMode === "view"
          ? "ready"
          : "generated",
    executedAt: new Date().toISOString(),
    executedBy: actorName,
    filtersSummary: input.filtersSummary,
    notes: input.notes,
    linkedDeliveryId
  };

  getLiveReportExecutionsStore(propertyCode).items.unshift(record);

  return record;
}

export function listPassengerReportImports(propertyCode: PropertyCode): PassengerReportImportList {
  return getPassengerImportsStore(propertyCode);
}

export function createPassengerReportImport(
  propertyCode: PropertyCode,
  input: PassengerReportImportCreate,
  actorName: string
): void {
  const source = getPassengerImportsStore(propertyCode);
  source.items.unshift({
    id: crypto.randomUUID(),
    importName: input.importName,
    sourceFileName: input.sourceFileName,
    importedAt: new Date().toISOString(),
    importedBy: actorName,
    operatingDate: input.operatingDate,
    rowCount: input.rowCount,
    status: input.status,
    notes: input.notes
  });
}

export function listReportDeliveries(propertyCode: PropertyCode): ReportDeliveryRecordList {
  return getReportDeliveriesStore(propertyCode);
}

export function createReportDelivery(
  propertyCode: PropertyCode,
  input: ReportDeliveryRequest,
  actorName: string
): ReportDeliveryRecord {
  const source = getReportDeliveriesStore(propertyCode);
  const record: ReportDeliveryRecord = {
    id: crypto.randomUUID(),
    reportName: input.reportName,
    format: input.format,
    deliveryMode: input.deliveryMode,
    recipient: input.recipient,
    status: input.deliveryMode === "email" ? "sent" : "generated",
    requestedAt: new Date().toISOString(),
    requestedBy: actorName,
    notes: input.notes,
    retryCount: 0,
    lastRetriedAt: null
  };
  source.items.unshift(record);
  return record;
}

export function updateReportDeliveryStatus(
  propertyCode: PropertyCode,
  deliveryId: string,
  input: ReportDeliveryStatusUpdate
): ReportDeliveryRecord {
  const source = getReportDeliveriesStore(propertyCode);
  const record = source.items.find((item) => item.id === deliveryId);

  if (!record) {
    throw new Error("report_delivery.not_found");
  }

  record.status = input.status;
  record.notes = input.notes;

  return record;
}

export function retryReportDelivery(
  propertyCode: PropertyCode,
  deliveryId: string
): ReportDeliveryRecord {
  const source = getReportDeliveriesStore(propertyCode);
  const record = source.items.find((item) => item.id === deliveryId);

  if (!record) {
    throw new Error("report_delivery.not_found");
  }

  record.retryCount += 1;
  record.lastRetriedAt = new Date().toISOString();
  record.status = record.deliveryMode === "email" ? "sent" : "generated";
  record.notes = `${record.notes} Retry #${record.retryCount} queued.`;

  return record;
}

export function resetReportConfigData() {
  reportConfigByProperty.clear();
  reportPreferencesByProperty.clear();
  scheduledEmailJobsByProperty.clear();
  liveReportsByProperty.clear();
  liveReportExecutionsByProperty.clear();
  passengerImportsByProperty.clear();
  reportDeliveriesByProperty.clear();
}
