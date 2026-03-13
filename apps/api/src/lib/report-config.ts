import type { PropertyCode, ReportConfigList, ReportConfigRow, ReportConfigUpdate } from "@tps/types";

const commuterReports: ReportConfigList = {
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

const streetcarReports: ReportConfigList = {
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

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

export function listReportConfig(propertyCode: PropertyCode): ReportConfigList {
  return streetcarProperties.has(propertyCode) ? streetcarReports : commuterReports;
}

export function updateReportConfig(
  propertyCode: PropertyCode,
  reportId: string,
  update: ReportConfigUpdate
): ReportConfigRow {
  const source = streetcarProperties.has(propertyCode) ? streetcarReports : commuterReports;
  const row = source.items.find((item) => item.id === reportId);

  if (!row) {
    throw new Error("report_config.not_found");
  }

  row.audience = update.audience;
  row.embedEnabled = update.embedEnabled;
  row.schedule = update.schedule;

  return row;
}
