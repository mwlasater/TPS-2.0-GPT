import { describe, expect, it, vi } from "vitest";

import { PostgresPropertyRepository } from "../repositories/postgres-property-repository.js";

describe("PostgresPropertyRepository", () => {
  it("maps database rows into property settings", async () => {
    const query = vi.fn().mockResolvedValue({
      rows: [
        {
          railroad_code: "caltrain",
          display_name: "CalTrain",
          profile: "commuter_rail",
          support_email: "caltrain-ops@herzog.com",
          timezone_name: "America/Los_Angeles",
          primary_color: "#1E3A5F",
          logo_mode: "herzog-default",
          power_bi_enabled: true,
          file_uploads_enabled: true,
          cmms_enabled: false
        }
      ]
    });

    const repository = new PostgresPropertyRepository({ query });
    const settings = await repository.getSettings("caltrain");

    expect(settings).toEqual({
      propertyCode: "caltrain",
      displayName: "CalTrain",
      supportEmail: "caltrain-ops@herzog.com",
      timezone: "America/Los_Angeles",
      profile: "commuter_rail",
      branding: {
        primaryColor: "#1E3A5F",
        logoMode: "herzog-default"
      },
      features: {
        powerBi: true,
        fileUploads: true,
        cmms: false
      }
    });
  });

  it("updates property settings and returns the refreshed record", async () => {
    const query = vi
      .fn()
      .mockResolvedValueOnce({ rows: [] })
      .mockResolvedValueOnce({
        rows: [
          {
            railroad_code: "caltrain",
            display_name: "CalTrain",
            profile: "commuter_rail",
            support_email: "dispatch@caltrain.herzogops.com",
            timezone_name: "America/Chicago",
            primary_color: "#112233",
            logo_mode: "property-override",
            power_bi_enabled: false,
            file_uploads_enabled: true,
            cmms_enabled: true
          }
        ]
      });

    const repository = new PostgresPropertyRepository({ query });
    const settings = await repository.updateSettings("caltrain", {
      supportEmail: "dispatch@caltrain.herzogops.com",
      timezone: "America/Chicago",
      branding: {
        primaryColor: "#112233",
        logoMode: "property-override"
      },
      features: {
        powerBi: false,
        fileUploads: true,
        cmms: true
      }
    });

    expect(settings).toEqual({
      propertyCode: "caltrain",
      displayName: "CalTrain",
      supportEmail: "dispatch@caltrain.herzogops.com",
      timezone: "America/Chicago",
      profile: "commuter_rail",
      branding: {
        primaryColor: "#112233",
        logoMode: "property-override"
      },
      features: {
        powerBi: false,
        fileUploads: true,
        cmms: true
      }
    });
    expect(query).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("UPDATE shared.property_settings"),
      [
        "caltrain",
        "dispatch@caltrain.herzogops.com",
        "America/Chicago",
        "#112233",
        "property-override",
        false,
        true,
        true
      ]
    );
  });
});
