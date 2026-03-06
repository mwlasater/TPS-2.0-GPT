export type PropertyCode =
  | "caltrain"
  | "texrail"
  | "tre"
  | "trirail"
  | "nmrx"
  | "ctrail"
  | "ace"
  | "capmetro"
  | "kcstreetcar"
  | "okcstreetcar"
  | "octastreetcar"
  | "metrolinkarrow"
  | "silverline";

export interface ErrorEnvelope {
  error: string;
  statusCode: number;
  details?: unknown;
}

export interface UserSession {
  id: string;
  email: string;
  displayName: string;
  allowedProperties: PropertyCode[];
}

export interface PropertySummary {
  code: PropertyCode;
  name: string;
  profile: "commuter_rail" | "streetcar";
  themeColor: string;
}

export interface AppBootstrap {
  user: UserSession;
  availableProperties: PropertySummary[];
  defaultProperty: PropertyCode;
}
