import type { PropertyCode, PropertySettings, PropertySettingsUpdate } from "@tps/types";

const propertySettingsCatalog: Record<PropertyCode, Omit<PropertySettings, "propertyCode">> = {
  caltrain: {
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
  },
  texrail: {
    displayName: "TEXRail",
    supportEmail: "texrail-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  tre: {
    displayName: "Trinity Railway Express",
    supportEmail: "tre-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#086670", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: true }
  },
  trirail: {
    displayName: "Tri-Rail",
    supportEmail: "trirail-ops@herzog.com",
    timezone: "America/New_York",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  nmrx: {
    displayName: "New Mexico Rail Runner",
    supportEmail: "nmrx-ops@herzog.com",
    timezone: "America/Denver",
    profile: "commuter_rail",
    branding: { primaryColor: "#8A5700", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: false, cmms: false }
  },
  ctrail: {
    displayName: "CT Rail",
    supportEmail: "ctrail-ops@herzog.com",
    timezone: "America/New_York",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E3A5F", logoMode: "herzog-default" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  ace: {
    displayName: "ACE",
    supportEmail: "ace-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "commuter_rail",
    branding: { primaryColor: "#086670", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  capmetro: {
    displayName: "CapMetro",
    supportEmail: "capmetro-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#AB2D24", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: true }
  },
  kcstreetcar: {
    displayName: "KC Streetcar",
    supportEmail: "kcstreetcar-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "streetcar",
    branding: { primaryColor: "#AB2D24", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: false, cmms: false }
  },
  okcstreetcar: {
    displayName: "OKC Streetcar",
    supportEmail: "okcstreetcar-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "streetcar",
    branding: { primaryColor: "#8A5700", logoMode: "property-override" },
    features: { powerBi: false, fileUploads: false, cmms: false }
  },
  octastreetcar: {
    displayName: "OCTA Streetcar",
    supportEmail: "octa-streetcar-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "streetcar",
    branding: { primaryColor: "#086670", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: false, cmms: false }
  },
  metrolinkarrow: {
    displayName: "Metrolink Arrow",
    supportEmail: "metrolink-arrow-ops@herzog.com",
    timezone: "America/Los_Angeles",
    profile: "commuter_rail",
    branding: { primaryColor: "#1E6B38", logoMode: "property-override" },
    features: { powerBi: true, fileUploads: true, cmms: false }
  },
  silverline: {
    displayName: "Silver Line",
    supportEmail: "silverline-ops@herzog.com",
    timezone: "America/Chicago",
    profile: "commuter_rail",
    branding: { primaryColor: "#58595B", logoMode: "property-override" },
    features: { powerBi: false, fileUploads: true, cmms: false }
  }
};

export function getPropertySettings(propertyCode: PropertyCode): PropertySettings {
  return {
    propertyCode,
    ...propertySettingsCatalog[propertyCode]
  };
}

export function updatePropertySettings(
  propertyCode: PropertyCode,
  update: PropertySettingsUpdate
): PropertySettings {
  propertySettingsCatalog[propertyCode] = {
    ...propertySettingsCatalog[propertyCode],
    supportEmail: update.supportEmail,
    timezone: update.timezone,
    branding: { ...update.branding },
    features: { ...update.features }
  };

  return getPropertySettings(propertyCode);
}
