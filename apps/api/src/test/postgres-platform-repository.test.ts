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
