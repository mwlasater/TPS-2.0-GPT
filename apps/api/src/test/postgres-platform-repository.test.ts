import { describe, expect, it, vi } from "vitest";

import { PostgresPlatformRepository } from "../repositories/postgres-platform-repository.js";

describe("PostgresPlatformRepository", () => {
  it("maps report config rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: 101,
          report_name: "Daily OTP",
          audience: "Operations Leadership",
          embed_enabled: true,
          schedule_text: "06:00 daily"
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const reports = await repository.listReportConfig("caltrain");

    expect(reports).toEqual({
      items: [
        {
          id: "101",
          reportName: "Daily OTP",
          audience: "Operations Leadership",
          embedEnabled: true,
          schedule: "06:00 daily"
        }
      ]
    });
  });

  it("maps file service rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "file_caltrain_1",
          file_name: "daily-delay-export.csv",
          category: "operations",
          uploaded_at: new Date("2026-03-06T11:20:00Z"),
          status: "available"
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const files = await repository.listFiles("caltrain");

    expect(files).toEqual({
      items: [
        {
          id: "file_caltrain_1",
          fileName: "daily-delay-export.csv",
          category: "operations",
          uploadedAt: "2026-03-06T11:20:00.000Z",
          status: "available"
        }
      ]
    });
  });

  it("maps notification rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "notif_caltrain_1",
          channel: "email",
          template_name: "Delay Escalation",
          recipient_group: "Dispatch Leadership",
          enabled: true
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const notifications = await repository.listNotifications("caltrain");

    expect(notifications).toEqual({
      items: [
        {
          id: "notif_caltrain_1",
          channel: "email",
          templateName: "Delay Escalation",
          recipientGroup: "Dispatch Leadership",
          enabled: true
        }
      ]
    });
  });

  it("maps Power BI rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "bi_caltrain_1",
          report_name: "Daily OTP",
          workspace_name: "Transit Ops",
          workspace_id: "11111111-1111-1111-1111-111111111111",
          external_report_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          embed_url: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
          enabled: true
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const embeds = await repository.listPowerBiEmbeds("caltrain");

    expect(embeds).toEqual({
      items: [
        {
          id: "bi_caltrain_1",
          reportName: "Daily OTP",
          workspace: "Transit Ops",
          embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
          enabled: true
        }
      ]
    });
  });

  it("creates file requests", async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    const repository = new PostgresPlatformRepository({ query });
    const record = await repository.createFileRequest(
      "caltrain",
      {
        fileName: "caltrain-ops-export.csv",
        category: "operations",
        action: "download"
      },
      "Taylor Brooks"
    );

    expect(record).toMatchObject({
      fileName: "caltrain-ops-export.csv",
      category: "operations",
      status: "available"
    });
    expect(record.id).toEqual(expect.any(String));
  });

  it("maps Power BI session rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "pbi-session-1",
          report_id: "bi_caltrain_1",
          report_name: "Daily OTP",
          embed_url: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
          access_token: "pbi-token-1",
          expires_at: new Date("2026-03-06T13:00:00Z"),
          requested_at: new Date("2026-03-06T12:00:00Z"),
          requested_by: "Taylor Brooks"
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const sessions = await repository.listPowerBiSessions("caltrain");

    expect(sessions).toEqual({
      items: [
        {
          id: "pbi-session-1",
          reportId: "bi_caltrain_1",
          reportName: "Daily OTP",
          embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
          accessToken: "pbi-token-1",
          expiresAt: "2026-03-06T13:00:00.000Z",
          requestedAt: "2026-03-06T12:00:00.000Z",
          requestedBy: "Taylor Brooks"
        }
      ]
    });
  });

  it("creates Power BI sessions from embed rows", async () => {
    const powerBiClient = {
      issueEmbedToken: vi.fn().mockResolvedValue({
        accessToken: "embed-token-1",
        embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
        expiresAt: "2026-03-06T13:00:00Z"
      })
    };
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: "bi_caltrain_1",
            report_name: "Daily OTP",
            workspace_name: "Transit Ops",
            workspace_id: "11111111-1111-1111-1111-111111111111",
            external_report_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
            embed_url: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
            enabled: true
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] });

    const repository = new PostgresPlatformRepository({ query }, powerBiClient);
    const session = await repository.createPowerBiSession(
      "caltrain",
      "bi_caltrain_1",
      "Taylor Brooks"
    );

    expect(session).toMatchObject({
      reportId: "bi_caltrain_1",
      reportName: "Daily OTP",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      accessToken: "embed-token-1",
      expiresAt: "2026-03-06T13:00:00Z",
      requestedBy: "Taylor Brooks"
    });
    expect(session.id).toEqual(expect.any(String));
    expect(powerBiClient.issueEmbedToken).toHaveBeenCalledWith({
      reportName: "Daily OTP",
      workspaceId: "11111111-1111-1111-1111-111111111111",
      reportId: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      embedUrl: "https://app.powerbi.com/reportEmbed?reportId=daily-otp",
      actorName: "Taylor Brooks"
    });
  });

  it("maps CMMS sync rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "cmms-sync-1",
          work_order_id: "WO-1427",
          asset_id: "LOCO-120",
          status: "synced",
          requested_at: new Date("2026-03-06T06:32:00Z"),
          requested_by: "Dispatch Supervisor",
          notes: "Sync locomotive fault work order to CMMS."
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const sync = await repository.listCmmsSync("caltrain");

    expect(sync).toEqual({
      items: [
        {
          id: "cmms-sync-1",
          workOrderId: "WO-1427",
          assetId: "LOCO-120",
          status: "synced",
          requestedAt: "2026-03-06T06:32:00.000Z",
          requestedBy: "Dispatch Supervisor",
          notes: "Sync locomotive fault work order to CMMS."
        }
      ]
    });
  });

  it("creates CMMS sync jobs", async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    const repository = new PostgresPlatformRepository({ query });
    const record = await repository.createCmmsSync(
      "caltrain",
      {
        workOrderId: "WO-1427",
        assetId: "LOCO-120",
        notes: "Sync locomotive fault work order to CMMS."
      },
      "Dispatch Supervisor"
    );

    expect(record).toMatchObject({
      workOrderId: "WO-1427",
      assetId: "LOCO-120",
      status: "synced",
      requestedBy: "Dispatch Supervisor",
      notes: "Sync locomotive fault work order to CMMS."
    });
    expect(record.id).toEqual(expect.any(String));
  });

  it("updates report config rows", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: 101,
            report_name: "Daily OTP",
            audience: "Dispatch Leadership",
            embed_enabled: false,
            schedule_text: "07:00 daily"
          }
        ]
      });

    const repository = new PostgresPlatformRepository({ query });
    const report = await repository.updateReportConfig("caltrain", "101", {
      audience: "Dispatch Leadership",
      embedEnabled: false,
      schedule: "07:00 daily"
    });

    expect(report).toEqual({
      id: "101",
      reportName: "Daily OTP",
      audience: "Dispatch Leadership",
      embedEnabled: false,
      schedule: "07:00 daily"
    });
  });

  it("maps report preference rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "report-pref-caltrain-1",
          report_name: "Daily OTP",
          visible_columns: ["trainNumber", "otpPercent"],
          sort_order: "otpPercent desc",
          filters_summary: "Weekday service only"
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const preferences = await repository.listReportPreferences("caltrain");

    expect(preferences).toEqual({
      items: [
        {
          id: "report-pref-caltrain-1",
          reportName: "Daily OTP",
          visibleColumns: ["trainNumber", "otpPercent"],
          sortOrder: "otpPercent desc",
          filtersSummary: "Weekday service only"
        }
      ]
    });
  });

  it("creates scheduled report email jobs", async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    const repository = new PostgresPlatformRepository({ query });
    const job = await repository.createScheduledReportEmailJob("caltrain", {
      reportName: "Daily OTP",
      recipientGroup: "Operations Leadership",
      schedule: "12:00 daily",
      format: "pdf",
      enabled: true
    });

    expect(job).toMatchObject({
      reportName: "Daily OTP",
      recipientGroup: "Operations Leadership",
      schedule: "12:00 daily",
      format: "pdf",
      enabled: true
    });
    expect(job.id).toEqual(expect.any(String));
  });

  it("maps report delivery rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "report-delivery-1",
          report_name: "Daily OTP",
          delivery_format: "pdf",
          delivery_mode: "email",
          recipient: "operations.leadership@herzog.com",
          status: "sent",
          requested_at: new Date("2026-03-06T06:16:00Z"),
          requested_by: "Taylor Brooks",
          notes: "Morning leadership packet.",
          retry_count: 0,
          last_retried_at: null
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const deliveries = await repository.listReportDeliveries("caltrain");

    expect(deliveries).toEqual({
      items: [
        {
          id: "report-delivery-1",
          reportName: "Daily OTP",
          format: "pdf",
          deliveryMode: "email",
          recipient: "operations.leadership@herzog.com",
          status: "sent",
          requestedAt: "2026-03-06T06:16:00.000Z",
          requestedBy: "Taylor Brooks",
          notes: "Morning leadership packet.",
          retryCount: 0,
          lastRetriedAt: null
        }
      ]
    });
  });

  it("creates report delivery rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({ rows: [] });

    const repository = new PostgresPlatformRepository({ query });
    const delivery = await repository.createReportDelivery("caltrain", {
      reportName: "Delay Detail",
      format: "xlsx",
      deliveryMode: "email",
      recipient: "dispatch.leadership@herzog.com",
      notes: "On-demand review packet."
    }, "Taylor Brooks");

    expect(delivery).toMatchObject({
      reportName: "Delay Detail",
      format: "xlsx",
      deliveryMode: "email",
      recipient: "dispatch.leadership@herzog.com",
      status: "sent",
      requestedBy: "Taylor Brooks",
      notes: "On-demand review packet.",
      retryCount: 0,
      lastRetriedAt: null
    });
  });

  it("maps live report execution rows", async () => {
    const query = vi.fn().mockResolvedValueOnce({
      rows: [
        {
          id: "live-execution-1",
          report_id: "bi_caltrain_1",
          report_name: "Daily OTP",
          execution_format: "interactive",
          delivery_mode: "view",
          recipient: "Operations Leadership",
          status: "ready",
          executed_at: new Date("2026-03-06T06:10:00Z"),
          executed_by: "Taylor Brooks",
          filters_summary: "Weekday service only",
          notes: "Leadership standup review.",
          linked_delivery_id: null
        }
      ]
    });

    const repository = new PostgresPlatformRepository({ query });
    const executions = await repository.listLiveReportExecutions("caltrain");

    expect(executions).toEqual({
      items: [
        {
          id: "live-execution-1",
          reportId: "bi_caltrain_1",
          reportName: "Daily OTP",
          format: "interactive",
          deliveryMode: "view",
          recipient: "Operations Leadership",
          status: "ready",
          executedAt: "2026-03-06T06:10:00.000Z",
          executedBy: "Taylor Brooks",
          filtersSummary: "Weekday service only",
          notes: "Leadership standup review.",
          linkedDeliveryId: null
        }
      ]
    });
  });

  it("updates report delivery status rows", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "report-delivery-1",
            report_name: "Daily OTP",
            delivery_format: "pdf",
            delivery_mode: "email",
            recipient: "operations.leadership@herzog.com",
            status: "queued",
            requested_at: new Date("2026-03-06T06:16:00Z"),
            requested_by: "Taylor Brooks",
            notes: "Held for review.",
            retry_count: 0,
            last_retried_at: null
          }
        ]
      });

    const repository = new PostgresPlatformRepository({ query });
    const delivery = await repository.updateReportDeliveryStatus("caltrain", "report-delivery-1", {
      status: "queued",
      notes: "Held for review."
    });

    expect(delivery).toMatchObject({
      id: "report-delivery-1",
      status: "queued",
      notes: "Held for review.",
      retryCount: 0
    });
  });

  it("creates live report execution rows", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({
        rows: [
          {
            id: "bi_caltrain_1",
            report_name: "Daily OTP"
          }
        ]
      })
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({ rows: [] });

    const repository = new PostgresPlatformRepository({ query });
    const execution = await repository.executeLiveReport(
      "caltrain",
      "bi_caltrain_1",
      {
        format: "pdf",
        deliveryMode: "download",
        recipient: "Operations Leadership",
        filtersSummary: "Current operating day",
        notes: "Generated leadership packet."
      },
      "Taylor Brooks"
    );

    expect(execution).toMatchObject({
      reportId: "bi_caltrain_1",
      reportName: "Daily OTP",
      format: "pdf",
      deliveryMode: "download",
      recipient: "Operations Leadership",
      status: "generated",
      executedBy: "Taylor Brooks"
    });
    expect(execution.linkedDeliveryId).toEqual(expect.any(String));
  });

  it("updates notification rows", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            id: "notif_caltrain_1",
            channel: "in_app",
            template_name: "Delay Escalation",
            recipient_group: "Operations Leadership",
            enabled: false
          }
        ]
      });

    const repository = new PostgresPlatformRepository({ query });
    const notification = await repository.updateNotification("caltrain", "notif_caltrain_1", {
      channel: "in_app",
      recipientGroup: "Operations Leadership",
      enabled: false
    });

    expect(notification).toEqual({
      id: "notif_caltrain_1",
      channel: "in_app",
      templateName: "Delay Escalation",
      recipientGroup: "Operations Leadership",
      enabled: false
    });
  });
});
