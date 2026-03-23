import type {
  AttendanceException,
  AttendanceExceptionList,
  ConsistEquipment,
  ConsistEquipmentList,
  ConsistTemplateList,
  ConsistEquipmentUpdate,
  CrewAssignment,
  CrewAssignmentList,
  CrewTemplateList,
  CrewAssignmentUpdate,
  DelayAdditionalInfo,
  DelayAdditionalInfoDeleteResult,
  DelayAdditionalInfoUpdate,
  DelayEventBatchCreate,
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayEventDeleteResult,
  DelayTemplateCreateRequest,
  DelayTemplateList,
  DelayTemplateUpdate,
  FileServiceList,
  JobProfile,
  JobProfileList,
  ManagedUserDetail,
  ManagedUserCreate,
  ManagedUserList,
  UserAdminHistoryList,
  NotificationItem,
  NotificationList,
  PassengerReportImportCreate,
  PassengerReportImportList,
  PersonnelRecord,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PermissionGroupList,
  PermissionGroupCreate,
  PermissionGroupUpdate,
  PermissionGroupDeleteResult,
  PowerBiEmbedList,
  PropertyCode,
  PropertySettings,
  PropertySettingsUpdate,
  ReferenceDataset,
  ResourceSwapRequest,
  DelayPropagationPreview,
  DelayWorkOrder,
  DelayWorkOrderCreate,
  LiveReportCatalogList,
  NotableDelayTypeList,
  ReportConfigRow,
  ReportConfigList,
  ReportConfigUpdate,
  ReportDeliveryRecord,
  ReportDeliveryRecordList,
  ReportDeliveryRequest,
  ReportPreference,
  ReportPreferenceList,
  ReportPreferenceUpdate,
  ScheduledReportEmailJob,
  ScheduledReportEmailJobCreate,
  ScheduledReportEmailJobDeleteResult,
  ScheduledReportEmailJobList,
  ScheduledReportEmailJobUpdate,
  SpecialMovementList,
  SpecialMovementUpdate,
  DelayEventList,
  DelayEvent,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementCreate,
  FareEnforcementDeleteResult,
  FareEnforcementDashboard,
  FareEnforcementHistoryList,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
  TrainRunImpactSummary,
  TrainRunDeleteResult,
  TrainRunInitializeRequest,
  TrainRunInitializeResult,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunEventHistoryList,
  TrainScheduleApprovalSummary,
  TrainRunList,
  TrainRunStatusRecord,
  TrainRunStatusUpdate,
  TrainScheduleList,
  NotificationUpdate,
  AttendanceExceptionUpdate,
  AttendanceHistoryList,
  AttendanceIssueList,
  AttendanceIssueRecord,
  AttendanceIssueUpdate,
  AttendanceNotificationRule,
  AttendanceNotificationRuleCreate,
  AttendanceNotificationRuleDeleteResult,
  AttendanceNotificationRuleList,
  AttendanceNotificationRuleUpdate,
  JobProfileUpdate,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";

export type MaybePromise<T> = T | Promise<T>;

export interface PropertyRepository {
  getSettings(propertyCode: PropertyCode): MaybePromise<PropertySettings>;
  updateSettings(
    propertyCode: PropertyCode,
    update: PropertySettingsUpdate
  ): MaybePromise<PropertySettings>;
  getReferenceData(propertyCode: PropertyCode): MaybePromise<ReferenceDataset>;
  updateReferenceData(
    propertyCode: PropertyCode,
    update: ReferenceDataset
  ): MaybePromise<ReferenceDataset>;
}

export interface UserRepository {
  listUsers(propertyCode: PropertyCode): MaybePromise<ManagedUserList>;
  createUser(
    propertyCode: PropertyCode,
    input: ManagedUserCreate,
    actorName: string
  ): MaybePromise<ManagedUserDetail>;
  getUserDetail(userId: string, propertyCode: PropertyCode): MaybePromise<ManagedUserDetail>;
  listUserAdminHistory(
    userId: string,
    propertyCode: PropertyCode
  ): MaybePromise<UserAdminHistoryList>;
  executeUserAdminAction(
    userId: string,
    propertyCode: PropertyCode,
    actionId: string,
    actorName: string
  ): MaybePromise<ManagedUserDetail>;
  updateUserPropertyAccess(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPropertyAccessUpdate,
    actorName: string
  ): MaybePromise<ManagedUserDetail>;
  updateUserPermissionGroups(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPermissionGroupUpdate,
    actorName: string
  ): MaybePromise<ManagedUserDetail>;
  listUserAdminActions(
    propertyCode: PropertyCode,
    actorPermissions: string[]
  ): MaybePromise<UserAdminActionList>;
  listPermissionGroups(propertyCode: PropertyCode): MaybePromise<PermissionGroupList>;
  updatePermissionGroup(
    propertyCode: PropertyCode,
    groupId: string,
    update: PermissionGroupUpdate
  ): MaybePromise<void>;
  createPermissionGroup(
    propertyCode: PropertyCode,
    input: PermissionGroupCreate
  ): MaybePromise<void>;
  deletePermissionGroup(
    propertyCode: PropertyCode,
    groupId: string
  ): MaybePromise<PermissionGroupDeleteResult>;
  listJobProfiles(propertyCode: PropertyCode): MaybePromise<JobProfileList>;
  listPersonnelRecords(propertyCode: PropertyCode): MaybePromise<PersonnelRecordList>;
  updatePersonnelStatus(
    propertyCode: PropertyCode,
    personnelId: string,
    update: PersonnelStatusUpdate
  ): MaybePromise<PersonnelRecord>;
  updateJobProfile(
    propertyCode: PropertyCode,
    profileId: string,
    update: JobProfileUpdate
  ): MaybePromise<JobProfile>;
  listAttendanceExceptions(propertyCode: PropertyCode): MaybePromise<AttendanceExceptionList>;
  updateAttendanceException(
    propertyCode: PropertyCode,
    exceptionId: string,
    update: AttendanceExceptionUpdate
  ): MaybePromise<AttendanceException>;
  listAttendanceIssues(propertyCode: PropertyCode): MaybePromise<AttendanceIssueList>;
  listAttendanceHistory(
    propertyCode: PropertyCode,
    employeeId: string,
    issueType?: AttendanceIssueRecord["issueType"]
  ): MaybePromise<AttendanceHistoryList>;
  updateAttendanceIssue(
    propertyCode: PropertyCode,
    issueId: string,
    update: AttendanceIssueUpdate
  ): MaybePromise<AttendanceIssueRecord>;
  listAttendanceNotificationRules(
    propertyCode: PropertyCode
  ): MaybePromise<AttendanceNotificationRuleList>;
  createAttendanceNotificationRule(
    propertyCode: PropertyCode,
    input: AttendanceNotificationRuleCreate
  ): MaybePromise<AttendanceNotificationRule>;
  updateAttendanceNotificationRule(
    propertyCode: PropertyCode,
    ruleId: string,
    update: AttendanceNotificationRuleUpdate
  ): MaybePromise<AttendanceNotificationRule>;
  deleteAttendanceNotificationRule(
    propertyCode: PropertyCode,
    ruleId: string
  ): MaybePromise<AttendanceNotificationRuleDeleteResult>;
}

export interface PlatformRepository {
  listReportConfig(propertyCode: PropertyCode): MaybePromise<ReportConfigList>;
  updateReportConfig(
    propertyCode: PropertyCode,
    reportId: string,
    update: ReportConfigUpdate
  ): MaybePromise<ReportConfigRow>;
  listReportPreferences(propertyCode: PropertyCode): MaybePromise<ReportPreferenceList>;
  updateReportPreference(
    propertyCode: PropertyCode,
    preferenceId: string,
    update: ReportPreferenceUpdate
  ): MaybePromise<ReportPreference>;
  listScheduledReportEmailJobs(propertyCode: PropertyCode): MaybePromise<ScheduledReportEmailJobList>;
  createScheduledReportEmailJob(
    propertyCode: PropertyCode,
    input: ScheduledReportEmailJobCreate
  ): MaybePromise<ScheduledReportEmailJob>;
  updateScheduledReportEmailJob(
    propertyCode: PropertyCode,
    jobId: string,
    update: ScheduledReportEmailJobUpdate
  ): MaybePromise<ScheduledReportEmailJob>;
  deleteScheduledReportEmailJob(
    propertyCode: PropertyCode,
    jobId: string
  ): MaybePromise<ScheduledReportEmailJobDeleteResult>;
  listLiveReports(propertyCode: PropertyCode): MaybePromise<LiveReportCatalogList>;
  listPassengerReportImports(propertyCode: PropertyCode): MaybePromise<PassengerReportImportList>;
  createPassengerReportImport(
    propertyCode: PropertyCode,
    input: PassengerReportImportCreate,
    actorName: string
  ): MaybePromise<void>;
  listReportDeliveries(propertyCode: PropertyCode): MaybePromise<ReportDeliveryRecordList>;
  createReportDelivery(
    propertyCode: PropertyCode,
    input: ReportDeliveryRequest,
    actorName: string
  ): MaybePromise<ReportDeliveryRecord>;
  listFiles(propertyCode: PropertyCode): MaybePromise<FileServiceList>;
  listNotifications(propertyCode: PropertyCode): MaybePromise<NotificationList>;
  updateNotification(
    propertyCode: PropertyCode,
    notificationId: string,
    update: NotificationUpdate
  ): MaybePromise<NotificationItem>;
  listPowerBiEmbeds(propertyCode: PropertyCode): MaybePromise<PowerBiEmbedList>;
}

export interface OperationsRepository {
  listTrainSchedules(propertyCode: PropertyCode): MaybePromise<TrainScheduleList>;
  listTrainRuns(propertyCode: PropertyCode): MaybePromise<TrainRunList>;
  initializeTrainRuns(
    propertyCode: PropertyCode,
    request: TrainRunInitializeRequest
  ): MaybePromise<TrainRunInitializeResult>;
  resetTrainRun(propertyCode: PropertyCode, runId: string): MaybePromise<TrainRun>;
  deleteTrainRun(propertyCode: PropertyCode, runId: string): MaybePromise<TrainRunDeleteResult>;
  updateTrainRunApproval(
    propertyCode: PropertyCode,
    runId: string,
    update: TrainRunApprovalUpdate,
    actorName: string
  ): MaybePromise<TrainRun>;
  updateTrainRunApprovalBatch(
    propertyCode: PropertyCode,
    update: TrainRunBatchApprovalUpdate,
    actorName: string
  ): MaybePromise<TrainRunBatchApprovalResult>;
  listTrainRunApprovalHistory(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<TrainRunApprovalHistoryList>;
  getTrainRunImpactSummary(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<TrainRunImpactSummary>;
  getTrainRunStatus(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<TrainRunStatusRecord>;
  updateTrainRunStatus(
    propertyCode: PropertyCode,
    runId: string,
    update: TrainRunStatusUpdate,
    actorName: string
  ): MaybePromise<TrainRunStatusRecord>;
  listTrainRunEventHistory(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<TrainRunEventHistoryList>;
  listTrainScheduleApprovalHistory(
    propertyCode: PropertyCode,
    scheduleId: string
  ): MaybePromise<TrainRunApprovalHistoryList>;
  getTrainScheduleApprovalSummary(
    propertyCode: PropertyCode,
    scheduleId: string
  ): MaybePromise<TrainScheduleApprovalSummary>;
  listStationStops(propertyCode: PropertyCode, runId: string): MaybePromise<StationStopList>;
  updateStationStop(
    propertyCode: PropertyCode,
    runId: string,
    stopId: string,
    update: StationStopUpdate
  ): MaybePromise<StationStop>;
  listDelayEvents(propertyCode: PropertyCode, runId: string): MaybePromise<DelayEventList>;
  listDelayCommonLocations(propertyCode: PropertyCode): MaybePromise<DelayCommonLocationList>;
  listDelayTemplates(propertyCode: PropertyCode): MaybePromise<DelayTemplateList>;
  listNotableDelayTypes(propertyCode: PropertyCode): MaybePromise<NotableDelayTypeList>;
  listSpecialMovements(propertyCode: PropertyCode): MaybePromise<SpecialMovementList>;
  updateDelayCommonLocation(
    propertyCode: PropertyCode,
    locationId: string,
    update: DelayCommonLocationUpdate
  ): MaybePromise<void>;
  updateDelayTemplate(
    propertyCode: PropertyCode,
    templateId: string,
    update: DelayTemplateUpdate
  ): MaybePromise<void>;
  updateSpecialMovement(
    propertyCode: PropertyCode,
    movementId: string,
    update: SpecialMovementUpdate
  ): MaybePromise<void>;
  getDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string
  ): MaybePromise<DelayAdditionalInfo>;
  getDelayWorkOrder(propertyCode: PropertyCode, delayId: string): MaybePromise<DelayWorkOrder | null>;
  createDelayWorkOrder(
    propertyCode: PropertyCode,
    delayId: string,
    input: DelayWorkOrderCreate,
    actorName: string
  ): MaybePromise<DelayWorkOrder>;
  updateDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string,
    update: DelayAdditionalInfoUpdate
  ): MaybePromise<DelayAdditionalInfo>;
  deleteDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string,
    actorName: string
  ): MaybePromise<DelayAdditionalInfoDeleteResult>;
  createDelayEvents(
    propertyCode: PropertyCode,
    runId: string,
    input: DelayEventBatchCreate
  ): MaybePromise<DelayEventList>;
  createDelayFromTemplate(
    propertyCode: PropertyCode,
    runId: string,
    input: DelayTemplateCreateRequest
  ): MaybePromise<DelayEvent>;
  deleteDelayEvent(
    propertyCode: PropertyCode,
    runId: string,
    delayId: string
  ): MaybePromise<DelayEventDeleteResult>;
  updateDelayEvent(
    propertyCode: PropertyCode,
    runId: string,
    delayId: string,
    update: DelayEventUpdate
  ): MaybePromise<DelayEvent>;
  getDelayPropagationPreview(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<DelayPropagationPreview>;
  listConsistEquipment(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<ConsistEquipmentList>;
  listConsistTemplates(propertyCode: PropertyCode): MaybePromise<ConsistTemplateList>;
  swapConsistEquipment(
    propertyCode: PropertyCode,
    runId: string,
    request: ResourceSwapRequest
  ): MaybePromise<ConsistEquipmentList>;
  updateConsistEquipment(
    propertyCode: PropertyCode,
    runId: string,
    equipmentId: string,
    update: ConsistEquipmentUpdate
  ): MaybePromise<ConsistEquipment>;
  listCrewAssignments(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<CrewAssignmentList>;
  listCrewTemplates(propertyCode: PropertyCode): MaybePromise<CrewTemplateList>;
  swapCrewAssignments(
    propertyCode: PropertyCode,
    runId: string,
    request: ResourceSwapRequest
  ): MaybePromise<CrewAssignmentList>;
  updateCrewAssignment(
    propertyCode: PropertyCode,
    runId: string,
    assignmentId: string,
    update: CrewAssignmentUpdate
  ): MaybePromise<CrewAssignment>;
  listFareEnforcement(
    propertyCode: PropertyCode,
    runId?: string
  ): MaybePromise<FareEnforcementList>;
  listFareEnforcementHistory(
    propertyCode: PropertyCode,
    recordId: string
  ): MaybePromise<FareEnforcementHistoryList>;
  listFareEnforcementSummary(propertyCode: PropertyCode): MaybePromise<FareEnforcementSummaryList>;
  getFareEnforcementDashboard(propertyCode: PropertyCode): MaybePromise<FareEnforcementDashboard>;
  createFareEnforcement(
    propertyCode: PropertyCode,
    input: FareEnforcementCreate
  ): MaybePromise<FareEnforcementRecord>;
  updateFareEnforcement(
    propertyCode: PropertyCode,
    recordId: string,
    update: FareEnforcementUpdate
  ): MaybePromise<FareEnforcementRecord>;
  deleteFareEnforcement(
    propertyCode: PropertyCode,
    recordId: string,
    actorName: string
  ): MaybePromise<FareEnforcementDeleteResult>;
}

export interface DataAccess {
  property: PropertyRepository;
  users: UserRepository;
  platform: PlatformRepository;
  operations: OperationsRepository;
}
