import crypto from "node:crypto";

import type {
  FileServiceItem,
  FileServiceList,
  NotificationItem,
  NotificationList,
  NotificationUpdate,
  PowerBiEmbed,
  PowerBiEmbedList,
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

import { listFiles, listNotifications, listPowerBiEmbeds } from "../lib/platform-data.js";
import {
  listReportConfig,
  listReportPreferences,
  listScheduledReportEmailJobs
} from "../lib/report-config.js";

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

interface ReportPreferenceDbRow {
  id: string;
  report_name: string;
  visible_columns: string[];
  sort_order: string;
  filters_summary: string;
}

interface ScheduledReportEmailDbRow {
  id: string;
  report_name: string;
  recipient_group: string;
  schedule_text: string;
  delivery_format: ScheduledReportEmailJob["format"];
  enabled: boolean;
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

  async updateReportConfig(
    propertyCode: PropertyCode,
    reportId: string,
    update: ReportConfigUpdate
  ): Promise<ReportConfigRow> {
    const numericId = Number(reportId);
    await this.db.query(
      `
        UPDATE shared.report_config
        SET
          audience = $3,
          embed_enabled = $4,
          schedule_text = $5
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, numericId, update.audience, update.embedEnabled, update.schedule]
    );

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
          AND id = $2
      `,
      [propertyCode, numericId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("report_config.not_found");
    }

    return {
      id: String(row.id),
      reportName: row.report_name,
      audience: row.audience,
      embedEnabled: row.embed_enabled,
      schedule: row.schedule_text
    };
  }

  async listReportPreferences(propertyCode: PropertyCode): Promise<ReportPreferenceList> {
    const result = await this.db.query<ReportPreferenceDbRow>(
      `
        SELECT
          id,
          report_name,
          visible_columns,
          sort_order,
          filters_summary
        FROM shared.report_preference
        WHERE railroad_code = $1
        ORDER BY report_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listReportPreferences(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): ReportPreference => ({
          id: row.id,
          reportName: row.report_name,
          visibleColumns: row.visible_columns,
          sortOrder: row.sort_order,
          filtersSummary: row.filters_summary
        })
      )
    };
  }

  async updateReportPreference(
    propertyCode: PropertyCode,
    preferenceId: string,
    update: ReportPreferenceUpdate
  ): Promise<ReportPreference> {
    await this.db.query(
      `
        UPDATE shared.report_preference
        SET
          visible_columns = $3,
          sort_order = $4,
          filters_summary = $5
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, preferenceId, update.visibleColumns, update.sortOrder, update.filtersSummary]
    );

    const result = await this.db.query<ReportPreferenceDbRow>(
      `
        SELECT
          id,
          report_name,
          visible_columns,
          sort_order,
          filters_summary
        FROM shared.report_preference
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, preferenceId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("report_preference.not_found");
    }

    return {
      id: row.id,
      reportName: row.report_name,
      visibleColumns: row.visible_columns,
      sortOrder: row.sort_order,
      filtersSummary: row.filters_summary
    };
  }

  async listScheduledReportEmailJobs(
    propertyCode: PropertyCode
  ): Promise<ScheduledReportEmailJobList> {
    const result = await this.db.query<ScheduledReportEmailDbRow>(
      `
        SELECT
          id,
          report_name,
          recipient_group,
          schedule_text,
          delivery_format,
          enabled
        FROM shared.scheduled_report_email_job
        WHERE railroad_code = $1
        ORDER BY report_name, schedule_text
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listScheduledReportEmailJobs(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): ScheduledReportEmailJob => ({
          id: row.id,
          reportName: row.report_name,
          recipientGroup: row.recipient_group,
          schedule: row.schedule_text,
          format: row.delivery_format,
          enabled: row.enabled
        })
      )
    };
  }

  async createScheduledReportEmailJob(
    propertyCode: PropertyCode,
    input: ScheduledReportEmailJobCreate
  ): Promise<ScheduledReportEmailJob> {
    const id = crypto.randomUUID();
    await this.db.query(
      `
        INSERT INTO shared.scheduled_report_email_job (
          id,
          railroad_code,
          report_name,
          recipient_group,
          schedule_text,
          delivery_format,
          enabled
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7)
      `,
      [
        id,
        propertyCode,
        input.reportName,
        input.recipientGroup,
        input.schedule,
        input.format,
        input.enabled
      ]
    );

    return {
      id,
      reportName: input.reportName,
      recipientGroup: input.recipientGroup,
      schedule: input.schedule,
      format: input.format,
      enabled: input.enabled
    };
  }

  async updateScheduledReportEmailJob(
    propertyCode: PropertyCode,
    jobId: string,
    update: ScheduledReportEmailJobUpdate
  ): Promise<ScheduledReportEmailJob> {
    await this.db.query(
      `
        UPDATE shared.scheduled_report_email_job
        SET
          recipient_group = $3,
          schedule_text = $4,
          delivery_format = $5,
          enabled = $6
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, jobId, update.recipientGroup, update.schedule, update.format, update.enabled]
    );

    const result = await this.db.query<ScheduledReportEmailDbRow>(
      `
        SELECT
          id,
          report_name,
          recipient_group,
          schedule_text,
          delivery_format,
          enabled
        FROM shared.scheduled_report_email_job
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, jobId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("scheduled_report_email.not_found");
    }

    return {
      id: row.id,
      reportName: row.report_name,
      recipientGroup: row.recipient_group,
      schedule: row.schedule_text,
      format: row.delivery_format,
      enabled: row.enabled
    };
  }

  async deleteScheduledReportEmailJob(
    propertyCode: PropertyCode,
    jobId: string
  ): Promise<ScheduledReportEmailJobDeleteResult> {
    const result = await this.db.query<{ id: string }>(
      `
        DELETE FROM shared.scheduled_report_email_job
        WHERE railroad_code = $1
          AND id = $2
        RETURNING id
      `,
      [propertyCode, jobId]
    );

    if (!result.rows[0]) {
      throw new Error("scheduled_report_email.not_found");
    }

    return {
      deletedJobId: jobId
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

  async updateNotification(
    propertyCode: PropertyCode,
    notificationId: string,
    update: NotificationUpdate
  ): Promise<NotificationItem> {
    await this.db.query(
      `
        UPDATE shared.notification_template
        SET
          channel = $3,
          recipient_group = $4,
          enabled = $5
        WHERE railroad_code = $1
          AND id = $2
      `,
      [
        propertyCode,
        notificationId,
        update.channel,
        update.recipientGroup,
        update.enabled
      ]
    );

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
          AND id = $2
      `,
      [propertyCode, notificationId]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("notification.not_found");
    }

    return {
      id: row.id,
      channel: row.channel,
      templateName: row.template_name,
      recipientGroup: row.recipient_group,
      enabled: row.enabled
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
