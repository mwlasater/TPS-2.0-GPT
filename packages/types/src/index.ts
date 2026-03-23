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
  propertyPermissions: Partial<Record<PropertyCode, string[]>>;
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

export interface ManagedUserCreate {
  displayName: string;
  email: string;
  roleLabel: string;
  propertyAccess: PropertyCode[];
  groups: string[];
}

export interface PersonnelRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  status: "active" | "inactive" | "on_leave";
  primaryRole: string;
  certifications: string[];
}

export interface PersonnelRecordList {
  items: PersonnelRecord[];
}

export interface PersonnelStatusUpdate {
  status: "active" | "inactive" | "on_leave";
  primaryRole: string;
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
  requiredPermission: string;
  isAllowed: boolean;
}

export interface UserAdminActionList {
  items: UserAdminAction[];
}

export interface UserAdminHistoryEntry {
  id: string;
  userId: string;
  action: string;
  actorName: string;
  summary: string;
  createdAt: string;
}

export interface UserAdminHistoryList {
  items: UserAdminHistoryEntry[];
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

export interface DownstreamStationImpact {
  stationCode: string;
  scheduledTime: string;
  projectedTime: string;
  projectedDelayMinutes: number;
  boardings: number;
  alightings: number;
  passengerLoadDelta: number;
}

export interface TrainRunImpactSummary {
  runId: string;
  totalDelayMinutes: number;
  impactedStationCount: number;
  maxProjectedDelayMinutes: number;
  affectedPassengers: number;
  estimatedRecoveryTime: string | null;
  passengerImpactSummaries: string[];
  downstreamStations: DownstreamStationImpact[];
}

export interface ScheduleApprovalBlockedRunSummary {
  runId: string;
  trainNumber: string;
  delayMinutes: number;
  maxProjectedDelayMinutes: number;
  blockers: string[];
}

export interface TrainScheduleApprovalSummary {
  scheduleId: string;
  totalRuns: number;
  approvedCount: number;
  readyCount: number;
  blockedCount: number;
  totalDelayMinutes: number;
  readyRunIds: string[];
  approvedRunIds: string[];
  blockedRuns: ScheduleApprovalBlockedRunSummary[];
}

export interface TrainRunStatusRecord {
  runId: string;
  status: TrainRun["status"];
  comment: string;
  updatedAt: string | null;
  updatedBy: string | null;
}

export interface TrainRunStatusUpdate {
  status: TrainRun["status"];
  comment: string;
}

export interface TrainRunEventHistoryEntry {
  id: string;
  runId: string;
  action:
    | "status-updated"
    | "run-reset"
    | "run-deleted"
    | "delay-created"
    | "delay-deleted"
    | "delay-metadata-cleared"
    | "delay-work-order-created";
  actorName: string;
  notes: string;
  createdAt: string;
}

export interface TrainRunEventHistoryList {
  items: TrainRunEventHistoryEntry[];
}

export interface TrainRunInitializeRequest {
  operatingDate: string;
  scheduleIds: string[];
}

export interface TrainRunInitializeResult {
  createdRuns: TrainRun[];
  skippedScheduleIds: string[];
}

export interface TrainRunDeleteResult {
  deletedRunId: string;
}

export interface TrainRunApprovalUpdate {
  isApproved: boolean;
  notes: string;
}

export interface TrainRunBatchApprovalUpdate {
  runIds: string[];
  isApproved: boolean;
  notes: string;
}

export interface TrainRunBatchApprovalResult {
  updatedRuns: TrainRun[];
  blockedRuns: Array<{
    runId: string;
    blockers: string[];
  }>;
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

export interface DelayEventCreate {
  category: string;
  minutes: number;
  notes: string;
  reportedAt: string;
}

export interface DelayEventBatchCreate {
  delays: DelayEventCreate[];
}

export interface DelayTemplate {
  id: string;
  name: string;
  category: string;
  minutes: number;
  notes: string;
  notableDelayType: string;
  specialMovementId: string | null;
}

export interface DelayTemplateList {
  items: DelayTemplate[];
}

export interface DelayTemplateUpdate {
  name: string;
  category: string;
  minutes: number;
  notes: string;
  notableDelayType: string;
  specialMovementId: string | null;
}

export interface DelayTemplateCreateRequest {
  templateId: string;
  reportedAt: string;
}

export interface DelayEventDeleteResult {
  deletedId: string;
  runId: string;
  delayMinutes: number;
}

export interface DelayCommonLocation {
  id: string;
  label: string;
  usageCount: number;
}

export interface DelayCommonLocationList {
  items: DelayCommonLocation[];
}

export interface DelayCommonLocationUpdate {
  label: string;
  usageCount: number;
}

export interface SpecialMovement {
  id: string;
  label: string;
  description: string;
}

export interface SpecialMovementList {
  items: SpecialMovement[];
}

export interface SpecialMovementUpdate {
  label: string;
  description: string;
}

export interface DelayAdditionalInfo {
  delayId: string;
  locationDetail: string;
  responsibleParty: string;
  notableDelayType: string;
  specialMovementId: string | null;
  workOrderId: string | null;
  mechanicalNotes: string;
  passengerImpactSummary: string;
}

export interface DelayAdditionalInfoUpdate {
  locationDetail: string;
  responsibleParty: string;
  notableDelayType: string;
  specialMovementId: string | null;
  workOrderId: string | null;
  mechanicalNotes: string;
  passengerImpactSummary: string;
}

export interface DelayAdditionalInfoDeleteResult {
  delayId: string;
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

export interface ConsistTemplate {
  id: string;
  name: string;
  items: ConsistEquipment[];
}

export interface ConsistTemplateList {
  items: ConsistTemplate[];
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

export interface CrewTemplate {
  id: string;
  name: string;
  items: CrewAssignment[];
}

export interface CrewTemplateList {
  items: CrewTemplate[];
}

export interface CrewAssignmentUpdate {
  role: string;
  onDutyTime: string;
  status: "assigned" | "pending_relief" | "complete";
}

export interface ResourceSwapRequest {
  templateId: string;
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

export interface FareEnforcementDeleteResult {
  deletedRecordId: string;
  runId: string;
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

export interface FareEnforcementHistoryEntry {
  id: string;
  recordId: string;
  action: "created" | "updated" | "deleted";
  actorName: string;
  notes: string;
  createdAt: string;
}

export interface FareEnforcementHistoryList {
  items: FareEnforcementHistoryEntry[];
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

export interface PermissionGroupUpdate {
  description: string;
  permissions: string[];
}

export interface PermissionGroupCreate {
  name: string;
  description: string;
  permissions: string[];
}

export interface PermissionGroupDeleteResult {
  deletedGroupId: string;
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

export interface ReportPreference {
  id: string;
  reportName: string;
  visibleColumns: string[];
  sortOrder: string;
  filtersSummary: string;
}

export interface ReportPreferenceUpdate {
  visibleColumns: string[];
  sortOrder: string;
  filtersSummary: string;
}

export interface ReportPreferenceList {
  items: ReportPreference[];
}

export interface ScheduledReportEmailJob {
  id: string;
  reportName: string;
  recipientGroup: string;
  schedule: string;
  format: "pdf" | "xlsx";
  enabled: boolean;
}

export interface ScheduledReportEmailJobCreate {
  reportName: string;
  recipientGroup: string;
  schedule: string;
  format: "pdf" | "xlsx";
  enabled: boolean;
}

export interface ScheduledReportEmailJobUpdate {
  recipientGroup: string;
  schedule: string;
  format: "pdf" | "xlsx";
  enabled: boolean;
}

export interface ScheduledReportEmailJobDeleteResult {
  deletedJobId: string;
}

export interface ScheduledReportEmailJobList {
  items: ScheduledReportEmailJob[];
}

export interface LiveReportCatalogItem {
  id: string;
  reportName: string;
  provider: "power_bi" | "paginated";
  audience: string;
  embedUrl: string;
  status: "available" | "restricted";
}

export interface LiveReportCatalogList {
  items: LiveReportCatalogItem[];
}

export interface LiveReportExecutionRequest {
  format: "interactive" | "pdf" | "xlsx";
  deliveryMode: "view" | "download" | "email";
  recipient: string;
  filtersSummary: string;
  notes: string;
}

export interface LiveReportExecutionRecord {
  id: string;
  reportId: string;
  reportName: string;
  format: "interactive" | "pdf" | "xlsx";
  deliveryMode: "view" | "download" | "email";
  recipient: string;
  status: "ready" | "generated" | "sent";
  executedAt: string;
  executedBy: string;
  filtersSummary: string;
  notes: string;
  linkedDeliveryId: string | null;
}

export interface LiveReportExecutionList {
  items: LiveReportExecutionRecord[];
}

export interface PassengerReportImportRecord {
  id: string;
  importName: string;
  sourceFileName: string;
  importedAt: string;
  importedBy: string;
  operatingDate: string;
  rowCount: number;
  status: "processed" | "warning";
  notes: string;
}

export interface PassengerReportImportList {
  items: PassengerReportImportRecord[];
}

export interface PassengerReportImportCreate {
  importName: string;
  sourceFileName: string;
  operatingDate: string;
  rowCount: number;
  status: "processed" | "warning";
  notes: string;
}

export interface ReportDeliveryRequest {
  reportName: string;
  format: "pdf" | "xlsx";
  deliveryMode: "download" | "email";
  recipient: string;
  notes: string;
}

export interface ReportDeliveryStatusUpdate {
  status: "queued" | "generated" | "sent";
  notes: string;
}

export interface ReportDeliveryRecord {
  id: string;
  reportName: string;
  format: "pdf" | "xlsx";
  deliveryMode: "download" | "email";
  recipient: string;
  status: "queued" | "generated" | "sent";
  requestedAt: string;
  requestedBy: string;
  notes: string;
  retryCount: number;
  lastRetriedAt: string | null;
}

export interface ReportDeliveryRecordList {
  items: ReportDeliveryRecord[];
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
  employeeId?: string;
  employeeName: string;
  exceptionType: "absence" | "tardy";
  startDate: string;
  endDate?: string | null;
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

export interface AttendanceIssueRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  issueType: "absence" | "tardiness";
  startDate: string;
  endDate: string | null;
  status: "open" | "approved" | "resolved";
  notes: string;
}

export interface AttendanceIssueUpdate {
  status: "open" | "approved" | "resolved";
  notes: string;
  endDate: string | null;
}

export interface AttendanceIssueList {
  items: AttendanceIssueRecord[];
}

export interface AttendanceHistoryList {
  employeeId: string;
  items: AttendanceIssueRecord[];
}

export interface AttendanceNotificationRule {
  id: string;
  issueType: "absence" | "tardiness";
  triggerStatus: "open" | "approved" | "resolved";
  recipientGroup: string;
  templateName: string;
  enabled: boolean;
}

export interface AttendanceNotificationRuleCreate {
  issueType: "absence" | "tardiness";
  triggerStatus: "open" | "approved" | "resolved";
  recipientGroup: string;
  templateName: string;
  enabled: boolean;
}

export interface AttendanceNotificationRuleUpdate {
  triggerStatus: "open" | "approved" | "resolved";
  recipientGroup: string;
  templateName: string;
  enabled: boolean;
}

export interface AttendanceNotificationRuleDeleteResult {
  deletedRuleId: string;
}

export interface AttendanceNotificationRuleList {
  items: AttendanceNotificationRule[];
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

export interface NotableDelayType {
  id: string;
  label: string;
  category: "mechanical" | "traffic" | "operations" | "passenger";
  requiresWorkOrder: boolean;
}

export interface NotableDelayTypeList {
  items: NotableDelayType[];
}

export interface DelayWorkOrder {
  delayId: string;
  workOrderId: string;
  notableDelayType: string;
  assetId: string | null;
  repairType: string;
  priority: "low" | "medium" | "high";
  status: "open" | "scheduled" | "closed";
  createdAt: string;
  createdBy: string;
}

export interface DelayWorkOrderCreate {
  notableDelayType: string;
  assetId: string | null;
  repairType: string;
  priority: "low" | "medium" | "high";
}

export interface DelayPropagationPreviewStop {
  stationCode: string;
  projectedDelayMinutes: number;
  severity: "low" | "medium" | "high";
}

export interface DelayPropagationPreview {
  runId: string;
  sourceDelayIds: string[];
  totalProjectedDelayMinutes: number;
  impactedStopCount: number;
  requiresCmmsFollowup: boolean;
  notableDelayTypes: string[];
  downstreamStops: DelayPropagationPreviewStop[];
}
