import type {
  PropertyCode,
  PropertySettings,
  PropertySettingsUpdate,
  ReferenceDataset
} from "@tps/types";

import { getReferenceData } from "../lib/reference-data.js";

import type { PropertyRepository } from "./contracts.js";
import type { Queryable } from "./postgres-client.js";

interface PropertySettingsRow {
  railroad_code: PropertyCode;
  display_name: string;
  profile: "commuter_rail" | "streetcar";
  support_email: string;
  timezone_name: string;
  primary_color: string;
  logo_mode: "herzog-default" | "property-override";
  power_bi_enabled: boolean;
  file_uploads_enabled: boolean;
  cmms_enabled: boolean;
}

export class PostgresPropertyRepository implements PropertyRepository {
  constructor(private readonly db: Queryable) {}

  async getReferenceData(propertyCode: PropertyCode): Promise<ReferenceDataset> {
    const [delayReasons, crewRoles, stationCodes] = await Promise.all([
      this.db.query<{ reason_text: string }>(
        `
          SELECT reason_text
          FROM shared.reference_delay_reason
          WHERE railroad_code = $1
          ORDER BY reason_text
        `,
        [propertyCode]
      ),
      this.db.query<{ role_name: string }>(
        `
          SELECT role_name
          FROM shared.reference_crew_role
          WHERE railroad_code = $1
          ORDER BY role_name
        `,
        [propertyCode]
      ),
      this.db.query<{ station_code: string }>(
        `
          SELECT station_code
          FROM shared.reference_station_code
          WHERE railroad_code = $1
          ORDER BY station_code
        `,
        [propertyCode]
      )
    ]);

    if (!delayReasons.rows.length && !crewRoles.rows.length && !stationCodes.rows.length) {
      return getReferenceData(propertyCode);
    }

    return {
      delayReasons: delayReasons.rows.map((row) => row.reason_text),
      crewRoles: crewRoles.rows.map((row) => row.role_name),
      stationCodes: stationCodes.rows.map((row) => row.station_code)
    };
  }

  async getSettings(propertyCode: PropertyCode): Promise<PropertySettings> {
    const result = await this.db.query<PropertySettingsRow>(
      `
        SELECT
          r.code AS railroad_code,
          r.display_name,
          r.profile,
          ps.support_email,
          ps.timezone_name,
          ps.primary_color,
          ps.logo_mode,
          ps.power_bi_enabled,
          ps.file_uploads_enabled,
          ps.cmms_enabled
        FROM shared.property_settings ps
        JOIN shared.railroad r ON r.code = ps.railroad_code
        WHERE ps.railroad_code = $1
      `,
      [propertyCode]
    );

    const row = result.rows[0];
    if (!row) {
      throw new Error("property.not_found");
    }

    return {
      propertyCode: row.railroad_code,
      displayName: row.display_name,
      supportEmail: row.support_email,
      timezone: row.timezone_name,
      profile: row.profile,
      branding: {
        primaryColor: row.primary_color,
        logoMode: row.logo_mode
      },
      features: {
        powerBi: row.power_bi_enabled,
        fileUploads: row.file_uploads_enabled,
        cmms: row.cmms_enabled
      }
    };
  }

  async updateSettings(
    propertyCode: PropertyCode,
    update: PropertySettingsUpdate
  ): Promise<PropertySettings> {
    await this.db.query(
      `
        UPDATE shared.property_settings
        SET
          support_email = $2,
          timezone_name = $3,
          primary_color = $4,
          logo_mode = $5,
          power_bi_enabled = $6,
          file_uploads_enabled = $7,
          cmms_enabled = $8
        WHERE railroad_code = $1
      `,
      [
        propertyCode,
        update.supportEmail,
        update.timezone,
        update.branding.primaryColor,
        update.branding.logoMode,
        update.features.powerBi,
        update.features.fileUploads,
        update.features.cmms
      ]
    );

    return this.getSettings(propertyCode);
  }
}
