import type { PropertyCode, PropertySummary } from "@tps/types";

const propertyCatalog: Record<PropertyCode, Omit<PropertySummary, "code">> = {
  caltrain: {
    name: "CalTrain",
    profile: "commuter_rail",
    themeColor: "#1E3A5F"
  },
  texrail: {
    name: "TEXRail",
    profile: "commuter_rail",
    themeColor: "#1E3A5F"
  },
  tre: {
    name: "Trinity Railway Express",
    profile: "commuter_rail",
    themeColor: "#086670"
  },
  trirail: {
    name: "Tri-Rail",
    profile: "commuter_rail",
    themeColor: "#1E3A5F"
  },
  nmrx: {
    name: "New Mexico Rail Runner",
    profile: "commuter_rail",
    themeColor: "#8A5700"
  },
  ctrail: {
    name: "CT Rail",
    profile: "commuter_rail",
    themeColor: "#1E3A5F"
  },
  ace: {
    name: "ACE",
    profile: "commuter_rail",
    themeColor: "#086670"
  },
  capmetro: {
    name: "CapMetro",
    profile: "commuter_rail",
    themeColor: "#AB2D24"
  },
  kcstreetcar: {
    name: "KC Streetcar",
    profile: "streetcar",
    themeColor: "#AB2D24"
  },
  okcstreetcar: {
    name: "OKC Streetcar",
    profile: "streetcar",
    themeColor: "#8A5700"
  },
  octastreetcar: {
    name: "OCTA Streetcar",
    profile: "streetcar",
    themeColor: "#086670"
  },
  metrolinkarrow: {
    name: "Metrolink Arrow",
    profile: "commuter_rail",
    themeColor: "#1E6B38"
  },
  silverline: {
    name: "Silver Line",
    profile: "commuter_rail",
    themeColor: "#58595B"
  }
};

export function getPropertySummaries(propertyCodes: PropertyCode[]): PropertySummary[] {
  return propertyCodes.map((code) => ({
    code,
    ...propertyCatalog[code]
  }));
}
