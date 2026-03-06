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

export interface PropertySettings {
  propertyCode: PropertyCode;
  displayName: string;
  supportEmail: string;
  timezone: string;
  profile: "commuter_rail" | "streetcar";
  branding: {
    primaryColor: string;
    logoMode: "herzog-default" | "property-override";
  };
  features: {
    powerBi: boolean;
    fileUploads: boolean;
    cmms: boolean;
  };
}

export interface ManagedUser {
  id: string;
  displayName: string;
  email: string;
  status: "active" | "invited" | "disabled";
  roleLabel: string;
  lastSeen: string;
}

export interface ManagedUserList {
  items: ManagedUser[];
}

export interface ReferenceDataset {
  delayReasons: string[];
  crewRoles: string[];
  stationCodes: string[];
}

export interface TrainSchedule {
  id: string;
  trainNumber: string;
  routeName: string;
  direction: "eastbound" | "westbound" | "northbound" | "southbound";
  serviceDays: string[];
  stopCount: number;
}

export interface TrainScheduleList {
  items: TrainSchedule[];
}

export interface TrainRun {
  id: string;
  scheduleId: string;
  trainNumber: string;
  operatingDate: string;
  status: "scheduled" | "in_progress" | "approved" | "delayed";
  delayMinutes: number;
  crewAssigned: number;
}

export interface TrainRunList {
  items: TrainRun[];
}
