import type {
  FileServiceList,
  NotificationList,
  PowerBiEmbedList,
  PropertyCode
} from "@tps/types";

const commuterFiles: FileServiceList = {
  items: [
    {
      id: "file-1",
      fileName: "daily-delay-export.csv",
      category: "operations",
      uploadedAt: "2026-03-06T11:20:00Z",
      status: "available"
    },
    {
      id: "file-2",
      fileName: "crew-roster.xlsx",
      category: "crew",
      uploadedAt: "2026-03-06T10:05:00Z",
      status: "processing"
    }
  ]
};

const streetcarFiles: FileServiceList = {
  items: [
    {
      id: "street-file-1",
      fileName: "incident-log.pdf",
      category: "safety",
      uploadedAt: "2026-03-06T09:15:00Z",
      status: "available"
    }
  ]
};

const commuterNotifications: NotificationList = {
  items: [
    {
      id: "notif-1",
      channel: "email",
      templateName: "Delay Escalation",
      recipientGroup: "Dispatch Leadership",
      enabled: true
    },
    {
      id: "notif-2",
      channel: "in_app",
      templateName: "Crew Relief Needed",
      recipientGroup: "Crew Management",
      enabled: true
    }
  ]
};

const streetcarNotifications: NotificationList = {
  items: [
    {
      id: "street-notif-1",
      channel: "in_app",
      templateName: "Street Incident Alert",
      recipientGroup: "Street Supervisors",
      enabled: true
    }
  ]
};

const commuterPowerBi: PowerBiEmbedList = {
  items: [
    {
      id: "bi-1",
      reportName: "Daily OTP",
      workspace: "Transit Ops",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      enabled: true
    },
    {
      id: "bi-2",
      reportName: "Delay Detail",
      workspace: "Transit Ops",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=delay-detail",
      enabled: true
    }
  ]
};

const streetcarPowerBi: PowerBiEmbedList = {
  items: [
    {
      id: "street-bi-1",
      reportName: "Streetcar Service Summary",
      workspace: "Streetcar Ops",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=streetcar-service",
      enabled: true
    }
  ]
};

const streetcarProperties = new Set<PropertyCode>([
  "kcstreetcar",
  "okcstreetcar",
  "octastreetcar"
]);

export function listFiles(propertyCode: PropertyCode): FileServiceList {
  return streetcarProperties.has(propertyCode) ? streetcarFiles : commuterFiles;
}

export function listNotifications(propertyCode: PropertyCode): NotificationList {
  return streetcarProperties.has(propertyCode) ? streetcarNotifications : commuterNotifications;
}

export function listPowerBiEmbeds(propertyCode: PropertyCode): PowerBiEmbedList {
  return streetcarProperties.has(propertyCode) ? streetcarPowerBi : commuterPowerBi;
}
