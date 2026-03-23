import crypto from "node:crypto";

import type {
  CmmsSyncList,
  CmmsSyncRecord,
  CmmsSyncRequest,
  FileServiceItem,
  FileServiceList,
  FileServiceRequest,
  NotificationItem,
  NotificationList,
  NotificationUpdate,
  PowerBiSession,
  PowerBiSessionList,
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

const powerBiSessionsByProperty: Partial<Record<PropertyCode, PowerBiSessionList>> = {};
const cmmsSyncByProperty: Partial<Record<PropertyCode, CmmsSyncList>> = {};

export function listFiles(propertyCode: PropertyCode): FileServiceList {
  return streetcarProperties.has(propertyCode) ? streetcarFiles : commuterFiles;
}

export function createFileRequest(
  propertyCode: PropertyCode,
  input: FileServiceRequest,
  actorName: string
): FileServiceItem {
  void actorName;
  const source = listFiles(propertyCode);
  const record: FileServiceItem = {
    id: crypto.randomUUID(),
    fileName: input.fileName,
    category: input.category,
    uploadedAt: new Date().toISOString(),
    status: input.action === "upload" ? "processing" : "available"
  };

  source.items.unshift(record);
  return record;
}

export function listNotifications(propertyCode: PropertyCode): NotificationList {
  return streetcarProperties.has(propertyCode) ? streetcarNotifications : commuterNotifications;
}

export function updateNotification(
  propertyCode: PropertyCode,
  notificationId: string,
  update: NotificationUpdate
): NotificationItem {
  const source = streetcarProperties.has(propertyCode) ? streetcarNotifications : commuterNotifications;
  const row = source.items.find((item) => item.id === notificationId);

  if (!row) {
    throw new Error("notification.not_found");
  }

  row.channel = update.channel;
  row.recipientGroup = update.recipientGroup;
  row.enabled = update.enabled;

  return row;
}

export function listPowerBiEmbeds(propertyCode: PropertyCode): PowerBiEmbedList {
  return streetcarProperties.has(propertyCode) ? streetcarPowerBi : commuterPowerBi;
}

export function listPowerBiSessions(propertyCode: PropertyCode): PowerBiSessionList {
  return powerBiSessionsByProperty[propertyCode] ?? { items: [] };
}

export function createPowerBiSession(
  propertyCode: PropertyCode,
  reportId: string,
  actorName: string
): PowerBiSession {
  const report = listPowerBiEmbeds(propertyCode).items.find((item) => item.id === reportId);

  if (!report) {
    throw new Error("power_bi.not_found");
  }

  if (!powerBiSessionsByProperty[propertyCode]) {
    powerBiSessionsByProperty[propertyCode] = { items: [] };
  }

  const record: PowerBiSession = {
    id: crypto.randomUUID(),
    reportId,
    reportName: report.reportName,
    embedUrl: report.embedUrl,
    accessToken: `pbi-${crypto.randomUUID()}`,
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    requestedAt: new Date().toISOString(),
    requestedBy: actorName
  };

  powerBiSessionsByProperty[propertyCode]!.items.unshift(record);
  return record;
}

export function listCmmsSync(propertyCode: PropertyCode): CmmsSyncList {
  return cmmsSyncByProperty[propertyCode] ?? { items: [] };
}

export function createCmmsSync(
  propertyCode: PropertyCode,
  input: CmmsSyncRequest,
  actorName: string
): CmmsSyncRecord {
  if (!cmmsSyncByProperty[propertyCode]) {
    cmmsSyncByProperty[propertyCode] = { items: [] };
  }

  const record: CmmsSyncRecord = {
    id: crypto.randomUUID(),
    workOrderId: input.workOrderId,
    assetId: input.assetId,
    status: input.assetId ? "synced" : "queued",
    requestedAt: new Date().toISOString(),
    requestedBy: actorName,
    notes: input.notes
  };

  cmmsSyncByProperty[propertyCode]!.items.unshift(record);
  return record;
}

export function resetPlatformData(): void {
  const resetCommuterFiles: FileServiceItem[] = [
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
  ];
  const resetStreetcarFiles: FileServiceItem[] = [
    {
      id: "street-file-1",
      fileName: "incident-log.pdf",
      category: "safety",
      uploadedAt: "2026-03-06T09:15:00Z",
      status: "available"
    }
  ];
  const resetCommuterNotifications: NotificationItem[] = [
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
  ];
  const resetStreetcarNotifications: NotificationItem[] = [
    {
      id: "street-notif-1",
      channel: "in_app",
      templateName: "Street Incident Alert",
      recipientGroup: "Street Supervisors",
      enabled: true
    }
  ];

  commuterFiles.items.splice(0, commuterFiles.items.length, ...resetCommuterFiles);
  streetcarFiles.items.splice(0, streetcarFiles.items.length, ...resetStreetcarFiles);
  commuterNotifications.items.splice(
    0,
    commuterNotifications.items.length,
    ...resetCommuterNotifications
  );
  streetcarNotifications.items.splice(
    0,
    streetcarNotifications.items.length,
    ...resetStreetcarNotifications
  );

  for (const propertyCode of Object.keys(powerBiSessionsByProperty) as PropertyCode[]) {
    delete powerBiSessionsByProperty[propertyCode];
  }

  for (const propertyCode of Object.keys(cmmsSyncByProperty) as PropertyCode[]) {
    delete cmmsSyncByProperty[propertyCode];
  }
}
