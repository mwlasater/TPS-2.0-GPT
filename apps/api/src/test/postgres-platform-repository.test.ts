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
          notes: "Morning leadership packet."
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
          notes: "Morning leadership packet."
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
      notes: "On-demand review packet."
    });
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
