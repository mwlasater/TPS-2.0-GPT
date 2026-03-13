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

export interface PropertySettingsUpdate {
  supportEmail: string;
  timezone: string;
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

export interface ManagedUserDetail extends ManagedUser {
  propertyAccess: PropertyCode[];
  groups: string[];
  lastAction: string;
}

export interface UserPropertyAccessUpdate {
  propertyAccess: PropertyCode[];
}

export interface UserPermissionGroupUpdate {
  groups: string[];
}

export interface UserAdminAction {
  id: string;
  label: string;
  style: "primary" | "secondary" | "warning";
}

export interface UserAdminActionList {
  items: UserAdminAction[];
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
  isApproved: boolean;
  approvedAt: string | null;
  approvalBlockers: string[];
}

export interface TrainRunList {
  items: TrainRun[];
}

export interface TrainRunApprovalUpdate {
  isApproved: boolean;
  notes: string;
}

export interface TrainRunApprovalHistoryEntry {
  id: string;
  runId: string;
  action: "approved" | "unapproved";
  actorName: string;
  notes: string;
  createdAt: string;
}

export interface TrainRunApprovalHistoryList {
  items: TrainRunApprovalHistoryEntry[];
}

export interface StationStop {
  id: string;
  stationCode: string;
  sequence: number;
  scheduledTime: string;
  actualTime: string | null;
  boardings: number;
  alightings: number;
}

export interface StationStopList {
  items: StationStop[];
}

export interface StationStopUpdate {
  actualTime: string | null;
  boardings: number;
  alightings: number;
}

export interface DelayEvent {
  id: string;
  category: string;
  minutes: number;
  notes: string;
  reportedAt: string;
}

export interface DelayEventList {
  items: DelayEvent[];
}

export interface DelayEventUpdate {
  category: string;
  minutes: number;
  notes: string;
  reportedAt: string;
}

export interface ConsistEquipment {
  id: string;
  equipmentNumber: string;
  equipmentType: string;
  position: number;
  status: "active" | "bad_order" | "spare";
}

export interface ConsistEquipmentList {
  items: ConsistEquipment[];
}

export interface ConsistEquipmentUpdate {
  position: number;
  status: "active" | "bad_order" | "spare";
}

export interface CrewAssignment {
  id: string;
  employeeName: string;
  role: string;
  onDutyTime: string;
  status: "assigned" | "pending_relief" | "complete";
}

export interface CrewAssignmentList {
  items: CrewAssignment[];
}

export interface CrewAssignmentUpdate {
  role: string;
  onDutyTime: string;
  status: "assigned" | "pending_relief" | "complete";
}

export interface FareEnforcementRecord {
  id: string;
  runId: string;
  inspectorName: string;
  firstLocation: string;
  secondLocation: string;
  activityCount: number;
  amtrakTransfers: number;
  amtrakTickets: number;
  upassCount: number;
  ticketsSold: number;
  notes: string;
  capturedAt: string;
}

export interface FareEnforcementList {
  items: FareEnforcementRecord[];
}

export interface FareEnforcementUpdate {
  inspectorName: string;
  firstLocation: string;
  secondLocation: string;
  activityCount: number;
  amtrakTransfers: number;
  amtrakTickets: number;
  upassCount: number;
  ticketsSold: number;
  notes: string;
  capturedAt: string;
}

export interface FareEnforcementCreate {
  runId: string;
  inspectorName: string;
  firstLocation: string;
  secondLocation: string;
  activityCount: number;
  amtrakTransfers: number;
  amtrakTickets: number;
  upassCount: number;
  ticketsSold: number;
  notes: string;
  capturedAt: string;
}

export interface FareEnforcementSummary {
  runId: string;
  recordCount: number;
  activityCount: number;
  amtrakTransfers: number;
  amtrakTickets: number;
  upassCount: number;
  ticketsSold: number;
  inspectors: string[];
  latestCapturedAt: string | null;
}

export interface FareEnforcementSummaryList {
  items: FareEnforcementSummary[];
}

export interface FareEnforcementDashboard {
  totalRecords: number;
  totalActivityCount: number;
  totalAmtrakTransfers: number;
  totalAmtrakTickets: number;
  totalUpassCount: number;
  totalTicketsSold: number;
  coveredRuns: number;
  uncoveredRuns: string[];
  topInspectors: Array<{
    inspectorName: string;
    activityCount: number;
    recordCount: number;
  }>;
}

export interface PermissionGroup {
  id: string;
  name: string;
  description: string;
  members: number;
  permissions: string[];
}

export interface PermissionGroupList {
  items: PermissionGroup[];
}

export interface ReportConfigRow {
  id: string;
  reportName: string;
  audience: string;
  embedEnabled: boolean;
  schedule: string;
}

export interface ReportConfigUpdate {
  audience: string;
  embedEnabled: boolean;
  schedule: string;
}

export interface ReportConfigList {
  items: ReportConfigRow[];
}

export interface JobProfile {
  id: string;
  title: string;
  department: string;
  minimumHeadcount: number;
  reliefRequired: boolean;
}

export interface JobProfileUpdate {
  department: string;
  minimumHeadcount: number;
  reliefRequired: boolean;
}

export interface JobProfileList {
  items: JobProfile[];
}

export interface AttendanceException {
  id: string;
  employeeName: string;
  exceptionType: "absence" | "tardy";
  startDate: string;
  status: "open" | "approved" | "resolved";
  notes: string;
}

export interface AttendanceExceptionUpdate {
  status: "open" | "approved" | "resolved";
  notes: string;
}

export interface AttendanceExceptionList {
  items: AttendanceException[];
}

export interface FileServiceItem {
  id: string;
  fileName: string;
  category: string;
  uploadedAt: string;
  status: "available" | "processing" | "archived";
}

export interface FileServiceList {
  items: FileServiceItem[];
}

export interface NotificationItem {
  id: string;
  channel: "email" | "in_app";
  templateName: string;
  recipientGroup: string;
  enabled: boolean;
}

export interface NotificationUpdate {
  channel: "email" | "in_app";
  recipientGroup: string;
  enabled: boolean;
}

export interface NotificationList {
  items: NotificationItem[];
}

export interface PowerBiEmbed {
  id: string;
  reportName: string;
  workspace: string;
  embedUrl: string;
  enabled: boolean;
}

export interface PowerBiEmbedList {
  items: PowerBiEmbed[];
}
