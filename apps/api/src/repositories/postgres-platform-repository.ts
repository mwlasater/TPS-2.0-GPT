import crypto from "node:crypto";

import type {
  CmmsSyncList,
  CmmsSyncRecord,
  CmmsSyncRequest,
  FileServiceItem,
  FileServiceList,
  FileServiceRequest,
  LiveReportCatalogItem,
  LiveReportCatalogList,
  LiveReportExecutionList,
  LiveReportExecutionRecord,
  LiveReportExecutionRequest,
  NotificationItem,
  NotificationList,
  NotificationUpdate,
  PassengerReportImportCreate,
  PassengerReportImportList,
  PowerBiEmbed,
  PowerBiEmbedList,
  PowerBiSession,
  PowerBiSessionList,
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

import {
  createPowerBiSession,
  listCmmsSync,
  listFiles,
  listNotifications,
  listPowerBiEmbeds,
  listPowerBiSessions
} from "../lib/platform-data.js";
import type { PowerBiClient } from "../lib/power-bi-client.js";
import {
  executeLiveReport,
  listLiveReports,
  listLiveReportExecutions,
  listPassengerReportImports,
  listReportDeliveries,
  listReportConfig,
  listReportPreferences,
  listScheduledReportEmailJobs
} from "../lib/report-config.js";

import type { PlatformRepository } from "./contracts.js";
import type { Queryable } from "./postgres-client.js";
import { toIsoTimestamp } from "./time.js";

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

interface PowerBiSessionDbRow {
  id: string;
  report_id: string;
  report_name: string;
  embed_url: string;
  access_token: string;
  expires_at: string | Date;
  requested_at: string | Date;
  requested_by: string;
}

interface CmmsSyncDbRow {
  id: string;
  work_order_id: string;
  asset_id: string | null;
  status: CmmsSyncRecord["status"];
  requested_at: string | Date;
  requested_by: string;
  notes: string;
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
  workspace_id: string | null;
  external_report_id: string | null;
  embed_url: string;
  enabled: boolean;
}

interface PassengerReportImportDbRow {
  id: string;
  import_name: string;
  source_file_name: string;
  imported_at: string | Date;
  imported_by: string;
  operating_date: string;
  row_count: number;
  status: "processed" | "warning";
  notes: string;
}

interface ReportDeliveryDbRow {
  id: string;
  report_name: string;
  delivery_format: ReportDeliveryRecord["format"];
  delivery_mode: ReportDeliveryRecord["deliveryMode"];
  recipient: string;
  status: ReportDeliveryRecord["status"];
  requested_at: string | Date;
  requested_by: string;
  notes: string;
  retry_count: number;
  last_retried_at: string | Date | null;
}

interface LiveReportExecutionDbRow {
  id: string;
  report_id: string;
  report_name: string;
  execution_format: LiveReportExecutionRecord["format"];
  delivery_mode: LiveReportExecutionRecord["deliveryMode"];
  recipient: string;
  status: LiveReportExecutionRecord["status"];
  executed_at: string | Date;
  executed_by: string;
  filters_summary: string;
  notes: string;
  linked_delivery_id: string | null;
}

export class PostgresPlatformRepository implements PlatformRepository {
  constructor(
    private readonly db: Queryable,
    private readonly powerBiClient?: PowerBiClient
  ) {}

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

  async listLiveReports(propertyCode: PropertyCode): Promise<LiveReportCatalogList> {
    const result = await this.db.query<PowerBiDbRow>(
      `
        SELECT
          id,
          report_name,
          workspace_name,
          workspace_id,
          external_report_id,
          embed_url,
          enabled
        FROM shared.power_bi_embed
        WHERE railroad_code = $1
        ORDER BY report_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listLiveReports(propertyCode);
    }

    return {
      items: result.rows.map(
        (row): LiveReportCatalogItem => ({
          id: row.id,
          reportName: row.report_name,
          provider: "power_bi",
          audience: row.workspace_name,
          embedUrl: row.embed_url,
          status: row.enabled ? "available" : "restricted"
        })
      )
    };
  }

  async listLiveReportExecutions(propertyCode: PropertyCode): Promise<LiveReportExecutionList> {
    const result = await this.db.query<LiveReportExecutionDbRow>(
      `
        SELECT
          id,
          report_id,
          report_name,
          execution_format,
          delivery_mode,
          recipient,
          status,
          executed_at,
          executed_by,
          filters_summary,
          notes,
          linked_delivery_id
        FROM shared.live_report_execution
        WHERE railroad_code = $1
        ORDER BY executed_at DESC, report_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listLiveReportExecutions(propertyCode);
    }

    return {
      items: result.rows.map((row): LiveReportExecutionRecord => ({
        id: row.id,
        reportId: row.report_id,
        reportName: row.report_name,
        format: row.execution_format,
        deliveryMode: row.delivery_mode,
        recipient: row.recipient,
        status: row.status,
        executedAt: toIsoTimestamp(row.executed_at),
        executedBy: row.executed_by,
        filtersSummary: row.filters_summary,
        notes: row.notes,
        linkedDeliveryId: row.linked_delivery_id
      }))
    };
  }

  async executeLiveReport(
    propertyCode: PropertyCode,
    reportId: string,
    input: LiveReportExecutionRequest,
    actorName: string
  ): Promise<LiveReportExecutionRecord> {
    const reportLookup = await this.db.query<{
      id: string;
      report_name: string;
    }>(
      `
        SELECT
          id,
          report_name
        FROM shared.power_bi_embed
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, reportId]
    );

    const report = reportLookup.rows[0];

    if (!report) {
      return executeLiveReport(propertyCode, reportId, input, actorName);
    }

    let linkedDeliveryId: string | null = null;

    if (input.deliveryMode !== "view") {
      linkedDeliveryId = crypto.randomUUID();
      const deliveryMode = input.deliveryMode === "email" ? "email" : "download";
      const deliveryFormat = input.format === "interactive" ? "pdf" : input.format;
      const deliveryStatus = deliveryMode === "email" ? "sent" : "generated";

      await this.db.query(
        `
          INSERT INTO shared.report_delivery_request (
            id,
            railroad_code,
            report_name,
            delivery_format,
            delivery_mode,
            recipient,
            status,
            requested_at,
            requested_by,
            notes,
            retry_count,
            last_retried_at
          )
          VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9, 0, NULL)
        `,
        [
          linkedDeliveryId,
          propertyCode,
          report.report_name,
          deliveryFormat,
          deliveryMode,
          input.recipient,
          deliveryStatus,
          actorName,
          input.notes
        ]
      );
    }

    const executionId = crypto.randomUUID();
    const status =
      input.deliveryMode === "email"
        ? "sent"
        : input.deliveryMode === "view"
          ? "ready"
          : "generated";

    await this.db.query(
      `
        INSERT INTO shared.live_report_execution (
          id,
          railroad_code,
          report_id,
          report_name,
          execution_format,
          delivery_mode,
          recipient,
          status,
          executed_at,
          executed_by,
          filters_summary,
          notes,
          linked_delivery_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), $9, $10, $11, $12)
      `,
      [
        executionId,
        propertyCode,
        report.id,
        report.report_name,
        input.format,
        input.deliveryMode,
        input.recipient,
        status,
        actorName,
        input.filtersSummary,
        input.notes,
        linkedDeliveryId
      ]
    );

    return {
      id: executionId,
      reportId: report.id,
      reportName: report.report_name,
      format: input.format,
      deliveryMode: input.deliveryMode,
      recipient: input.recipient,
      status,
      executedAt: new Date().toISOString(),
      executedBy: actorName,
      filtersSummary: input.filtersSummary,
      notes: input.notes,
      linkedDeliveryId
    };
  }

  async listPassengerReportImports(propertyCode: PropertyCode): Promise<PassengerReportImportList> {
    const result = await this.db.query<PassengerReportImportDbRow>(
      `
        SELECT
          id,
          import_name,
          source_file_name,
          imported_at,
          imported_by,
          operating_date,
          row_count,
          status,
          notes
        FROM shared.passenger_report_import
        WHERE railroad_code = $1
        ORDER BY imported_at DESC, import_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listPassengerReportImports(propertyCode);
    }

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        importName: row.import_name,
        sourceFileName: row.source_file_name,
        importedAt: toIsoTimestamp(row.imported_at),
        importedBy: row.imported_by,
        operatingDate: row.operating_date,
        rowCount: row.row_count,
        status: row.status,
        notes: row.notes
      }))
    };
  }

  async createPassengerReportImport(
    propertyCode: PropertyCode,
    input: PassengerReportImportCreate,
    actorName: string
  ): Promise<void> {
    const id = crypto.randomUUID();
    await this.db.query(
      `
        INSERT INTO shared.passenger_report_import (
          id,
          railroad_code,
          import_name,
          source_file_name,
          imported_at,
          imported_by,
          operating_date,
          row_count,
          status,
          notes
        )
        VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8, $9)
      `,
      [
        id,
        propertyCode,
        input.importName,
        input.sourceFileName,
        actorName,
        input.operatingDate,
        input.rowCount,
        input.status,
        input.notes
      ]
    );
  }

  async listReportDeliveries(propertyCode: PropertyCode): Promise<ReportDeliveryRecordList> {
    const result = await this.db.query<ReportDeliveryDbRow>(
      `
        SELECT
          id,
          report_name,
          delivery_format,
          delivery_mode,
          recipient,
          status,
          requested_at,
          requested_by,
          notes,
          retry_count,
          last_retried_at
        FROM shared.report_delivery_request
        WHERE railroad_code = $1
        ORDER BY requested_at DESC, report_name
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listReportDeliveries(propertyCode);
    }

    return {
      items: result.rows.map((row) => ({
        id: row.id,
        reportName: row.report_name,
        format: row.delivery_format,
        deliveryMode: row.delivery_mode,
        recipient: row.recipient,
        status: row.status,
        requestedAt: toIsoTimestamp(row.requested_at),
        requestedBy: row.requested_by,
        notes: row.notes,
        retryCount: row.retry_count,
        lastRetriedAt: row.last_retried_at ? toIsoTimestamp(row.last_retried_at) : null
      }))
    };
  }

  async createReportDelivery(
    propertyCode: PropertyCode,
    input: ReportDeliveryRequest,
    actorName: string
  ): Promise<ReportDeliveryRecord> {
    const id = crypto.randomUUID();
    const status = input.deliveryMode === "email" ? "sent" : "generated";

    await this.db.query(
      `
        INSERT INTO shared.report_delivery_request (
          id,
          railroad_code,
          report_name,
          delivery_format,
          delivery_mode,
          recipient,
          status,
          requested_at,
          requested_by,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, $9)
      `,
      [
        id,
        propertyCode,
        input.reportName,
        input.format,
        input.deliveryMode,
        input.recipient,
        status,
        actorName,
        input.notes
      ]
    );

    return {
      id,
      reportName: input.reportName,
      format: input.format,
      deliveryMode: input.deliveryMode,
      recipient: input.recipient,
      status,
      requestedAt: new Date().toISOString(),
      requestedBy: actorName,
      notes: input.notes,
      retryCount: 0,
      lastRetriedAt: null
    };
  }

  async updateReportDeliveryStatus(
    propertyCode: PropertyCode,
    deliveryId: string,
    input: ReportDeliveryStatusUpdate
  ): Promise<ReportDeliveryRecord> {
    await this.db.query(
      `
        UPDATE shared.report_delivery_request
        SET
          status = $3,
          notes = $4
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, deliveryId, input.status, input.notes]
    );

    const result = await this.db.query<ReportDeliveryDbRow>(
      `
        SELECT
          id,
          report_name,
          delivery_format,
          delivery_mode,
          recipient,
          status,
          requested_at,
          requested_by,
          notes,
          retry_count,
          last_retried_at
        FROM shared.report_delivery_request
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, deliveryId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("report_delivery.not_found");
    }

    return {
      id: row.id,
      reportName: row.report_name,
      format: row.delivery_format,
      deliveryMode: row.delivery_mode,
      recipient: row.recipient,
      status: row.status,
      requestedAt: toIsoTimestamp(row.requested_at),
      requestedBy: row.requested_by,
      notes: row.notes,
      retryCount: row.retry_count,
      lastRetriedAt: row.last_retried_at ? toIsoTimestamp(row.last_retried_at) : null
    };
  }

  async retryReportDelivery(
    propertyCode: PropertyCode,
    deliveryId: string,
    actorName: string
  ): Promise<ReportDeliveryRecord> {
    await this.db.query(
      `
        UPDATE shared.report_delivery_request
        SET
          retry_count = retry_count + 1,
          last_retried_at = NOW(),
          status = CASE
            WHEN delivery_mode = 'email' THEN 'sent'
            ELSE 'generated'
          END,
          notes = CONCAT(notes, ' Retry requested by ', $3, '.')
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, deliveryId, actorName]
    );

    const result = await this.db.query<ReportDeliveryDbRow>(
      `
        SELECT
          id,
          report_name,
          delivery_format,
          delivery_mode,
          recipient,
          status,
          requested_at,
          requested_by,
          notes,
          retry_count,
          last_retried_at
        FROM shared.report_delivery_request
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, deliveryId]
    );

    const row = result.rows[0];

    if (!row) {
      throw new Error("report_delivery.not_found");
    }

    return {
      id: row.id,
      reportName: row.report_name,
      format: row.delivery_format,
      deliveryMode: row.delivery_mode,
      recipient: row.recipient,
      status: row.status,
      requestedAt: toIsoTimestamp(row.requested_at),
      requestedBy: row.requested_by,
      notes: row.notes,
      retryCount: row.retry_count,
      lastRetriedAt: row.last_retried_at ? toIsoTimestamp(row.last_retried_at) : null
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

  async createFileRequest(
    propertyCode: PropertyCode,
    input: FileServiceRequest,
    actorName: string
  ): Promise<FileServiceItem> {
    void actorName;
    const id = crypto.randomUUID();
    const status = input.action === "upload" ? "processing" : "available";

    await this.db.query(
      `
        INSERT INTO shared.file_service_item (
          id,
          railroad_code,
          file_name,
          category,
          uploaded_at,
          status
        )
        VALUES ($1, $2, $3, $4, NOW(), $5)
      `,
      [id, propertyCode, input.fileName, input.category, status]
    );

    return {
      id,
      fileName: input.fileName,
      category: input.category,
      uploadedAt: new Date().toISOString(),
      status
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

  async listPowerBiSessions(propertyCode: PropertyCode): Promise<PowerBiSessionList> {
    const result = await this.db.query<PowerBiSessionDbRow>(
      `
        SELECT
          id,
          report_id,
          report_name,
          embed_url,
          access_token,
          expires_at,
          requested_at,
          requested_by
        FROM shared.power_bi_session
        WHERE railroad_code = $1
        ORDER BY requested_at DESC
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listPowerBiSessions(propertyCode);
    }

    return {
      items: result.rows.map((row): PowerBiSession => ({
        id: row.id,
        reportId: row.report_id,
        reportName: row.report_name,
        embedUrl: row.embed_url,
        accessToken: row.access_token,
        expiresAt: toIsoTimestamp(row.expires_at),
        requestedAt: toIsoTimestamp(row.requested_at),
        requestedBy: row.requested_by
      }))
    };
  }

  async createPowerBiSession(
    propertyCode: PropertyCode,
    reportId: string,
    actorName: string
  ): Promise<PowerBiSession> {
    const embedResult = await this.db.query<PowerBiDbRow>(
      `
        SELECT
          id,
          report_name,
          workspace_name,
          workspace_id,
          external_report_id,
          embed_url,
          enabled
        FROM shared.power_bi_embed
        WHERE railroad_code = $1
          AND id = $2
      `,
      [propertyCode, reportId]
    );

    const report = embedResult.rows[0];

    if (!report) {
      return createPowerBiSession(propertyCode, reportId, actorName);
    }

    if (!report.workspace_id || !report.external_report_id || !this.powerBiClient) {
      return createPowerBiSession(propertyCode, reportId, actorName);
    }

    const id = crypto.randomUUID();
    const issued = await this.powerBiClient.issueEmbedToken({
      reportName: report.report_name,
      workspaceId: report.workspace_id,
      reportId: report.external_report_id,
      embedUrl: report.embed_url,
      actorName
    });

    await this.db.query(
      `
        INSERT INTO shared.power_bi_session (
          id,
          railroad_code,
          report_id,
          report_name,
          embed_url,
          access_token,
          expires_at,
          requested_at,
          requested_by
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8)
      `,
      [
        id,
        propertyCode,
        report.id,
        report.report_name,
        issued.embedUrl,
        issued.accessToken,
        issued.expiresAt,
        actorName
      ]
    );

    return {
      id,
      reportId: report.id,
      reportName: report.report_name,
      embedUrl: issued.embedUrl,
      accessToken: issued.accessToken,
      expiresAt: issued.expiresAt,
      requestedAt: new Date().toISOString(),
      requestedBy: actorName
    };
  }

  async listCmmsSync(propertyCode: PropertyCode): Promise<CmmsSyncList> {
    const result = await this.db.query<CmmsSyncDbRow>(
      `
        SELECT
          id,
          work_order_id,
          asset_id,
          status,
          requested_at,
          requested_by,
          notes
        FROM shared.cmms_sync_job
        WHERE railroad_code = $1
        ORDER BY requested_at DESC
      `,
      [propertyCode]
    );

    if (!result.rows.length) {
      return listCmmsSync(propertyCode);
    }

    return {
      items: result.rows.map((row): CmmsSyncRecord => ({
        id: row.id,
        workOrderId: row.work_order_id,
        assetId: row.asset_id,
        status: row.status,
        requestedAt: toIsoTimestamp(row.requested_at),
        requestedBy: row.requested_by,
        notes: row.notes
      }))
    };
  }

  async createCmmsSync(
    propertyCode: PropertyCode,
    input: CmmsSyncRequest,
    actorName: string
  ): Promise<CmmsSyncRecord> {
    const id = crypto.randomUUID();
    const status: CmmsSyncRecord["status"] = input.assetId ? "synced" : "queued";

    await this.db.query(
      `
        INSERT INTO shared.cmms_sync_job (
          id,
          railroad_code,
          work_order_id,
          asset_id,
          status,
          requested_at,
          requested_by,
          notes
        )
        VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)
      `,
      [id, propertyCode, input.workOrderId, input.assetId, status, actorName, input.notes]
    );

    return {
      id,
      workOrderId: input.workOrderId,
      assetId: input.assetId,
      status,
      requestedAt: new Date().toISOString(),
      requestedBy: actorName,
      notes: input.notes
    };
  }
}
