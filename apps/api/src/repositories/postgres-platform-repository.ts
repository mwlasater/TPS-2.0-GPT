import type {
  FileServiceItem,
  FileServiceList,
  NotificationItem,
  NotificationList,
  PowerBiEmbed,
  PowerBiEmbedList,
  PropertyCode,
  ReportConfigList,
  ReportConfigRow
} from "@tps/types";

import { listFiles, listNotifications, listPowerBiEmbeds } from "../lib/platform-data.js";
import { listReportConfig } from "../lib/report-config.js";

import type { PlatformRepository } from "./contracts.js";
import type { Queryable } from "./postgres-client.js";

interface ReportConfigDbRow {
  id: number;
  report_name: string;
  audience: string;
  embed_enabled: boolean;
  schedule_text: string;
}

interface FileServiceDbRow {
  id: string;
  file_name: string;
  category: string;
  uploaded_at: string | Date;
  status: FileServiceItem["status"];
}

interface NotificationDbRow {
  id: string;
  channel: NotificationItem["channel"];
  template_name: string;
  recipient_group: string;
  enabled: boolean;
}

interface PowerBiDbRow {
  id: string;
  report_name: string;
  workspace_name: string;
  embed_url: string;
  enabled: boolean;
}

function toIsoTimestamp(value: string | Date): string {
  if (value instanceof Date) {
    return value.toISOString();
  }

  return value;
}

export class PostgresPlatformRepository implements PlatformRepository {
  constructor(private readonly db: Queryable) {}

  async listReportConfig(propertyCode: PropertyCode): Promise<ReportConfigList> {
    const result = await this.db.query<ReportConfigDbRow>(
      `
        SELECT
          id,
          report_name,
          audience,
          embed_enabled,
          schedule_text
        FROM shared.report_config
        WHERE railroad_code = $1
        ORDER BY report_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listReportConfig(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): ReportConfigRow => ({
          id: String(row.id),
          reportName: row.report_name,
          audience: row.audience,
          embedEnabled: row.embed_enabled,
          schedule: row.schedule_text
        })
      )
    };
  }

  async listFiles(propertyCode: PropertyCode): Promise<FileServiceList> {
    const result = await this.db.query<FileServiceDbRow>(
      `
        SELECT
          id,
          file_name,
          category,
          uploaded_at,
          status
        FROM shared.file_service_item
        WHERE railroad_code = $1
        ORDER BY uploaded_at DESC, file_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listFiles(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): FileServiceItem => ({
          id: row.id,
          fileName: row.file_name,
          category: row.category,
          uploadedAt: toIsoTimestamp(row.uploaded_at),
          status: row.status
        })
      )
    };
  }

  async listNotifications(propertyCode: PropertyCode): Promise<NotificationList> {
    const result = await this.db.query<NotificationDbRow>(
      `
        SELECT
          id,
          channel,
          template_name,
          recipient_group,
          enabled
        FROM shared.notification_template
        WHERE railroad_code = $1
        ORDER BY template_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listNotifications(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): NotificationItem => ({
          id: row.id,
          channel: row.channel,
          templateName: row.template_name,
          recipientGroup: row.recipient_group,
          enabled: row.enabled
        })
      )
    };
  }

  async listPowerBiEmbeds(propertyCode: PropertyCode): Promise<PowerBiEmbedList> {
    const result = await this.db.query<PowerBiDbRow>(
      `
        SELECT
          id,
          report_name,
          workspace_name,
          embed_url,
          enabled
        FROM shared.power_bi_embed
        WHERE railroad_code = $1
        ORDER BY report_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listPowerBiEmbeds(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): PowerBiEmbed => ({
          id: row.id,
          reportName: row.report_name,
          workspace: row.workspace_name,
          embedUrl: row.embed_url,
          enabled: row.enabled
        })
      )
    };
  }
}
