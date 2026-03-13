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
  DelayAdditionalInfoUpdate,
  DelayEventBatchCreate,
  DelayCommonLocationList,
  DelayEventDeleteResult,
  FileServiceList,
  JobProfile,
  JobProfileList,
  ManagedUserDetail,
  ManagedUserList,
  NotificationItem,
  NotificationList,
  PermissionGroupList,
  PowerBiEmbedList,
  PropertyCode,
  PropertySettings,
  PropertySettingsUpdate,
  ReferenceDataset,
  ResourceSwapRequest,
  ReportConfigRow,
  ReportConfigList,
  ReportConfigUpdate,
  SpecialMovementList,
  DelayEventList,
  DelayEvent,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementCreate,
  FareEnforcementDashboard,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
  TrainRunDeleteResult,
  TrainRunInitializeRequest,
  TrainRunInitializeResult,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunList,
  TrainScheduleList,
  NotificationUpdate,
  AttendanceExceptionUpdate,
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
}

export interface UserRepository {
  listUsers(propertyCode: PropertyCode): MaybePromise<ManagedUserList>;
  getUserDetail(userId: string, propertyCode: PropertyCode): MaybePromise<ManagedUserDetail>;
  updateUserPropertyAccess(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPropertyAccessUpdate
  ): MaybePromise<ManagedUserDetail>;
  updateUserPermissionGroups(
    userId: string,
    propertyCode: PropertyCode,
    update: UserPermissionGroupUpdate
  ): MaybePromise<ManagedUserDetail>;
  listUserAdminActions(): MaybePromise<UserAdminActionList>;
  listPermissionGroups(propertyCode: PropertyCode): MaybePromise<PermissionGroupList>;
  listJobProfiles(propertyCode: PropertyCode): MaybePromise<JobProfileList>;
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
}

export interface PlatformRepository {
  listReportConfig(propertyCode: PropertyCode): MaybePromise<ReportConfigList>;
  updateReportConfig(
    propertyCode: PropertyCode,
    reportId: string,
    update: ReportConfigUpdate
  ): MaybePromise<ReportConfigRow>;
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
  listTrainScheduleApprovalHistory(
    propertyCode: PropertyCode,
    scheduleId: string
  ): MaybePromise<TrainRunApprovalHistoryList>;
  listStationStops(propertyCode: PropertyCode, runId: string): MaybePromise<StationStopList>;
  updateStationStop(
    propertyCode: PropertyCode,
    runId: string,
    stopId: string,
    update: StationStopUpdate
  ): MaybePromise<StationStop>;
  listDelayEvents(propertyCode: PropertyCode, runId: string): MaybePromise<DelayEventList>;
  listDelayCommonLocations(propertyCode: PropertyCode): MaybePromise<DelayCommonLocationList>;
  listSpecialMovements(propertyCode: PropertyCode): MaybePromise<SpecialMovementList>;
  getDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string
  ): MaybePromise<DelayAdditionalInfo>;
  updateDelayAdditionalInfo(
    propertyCode: PropertyCode,
    delayId: string,
    update: DelayAdditionalInfoUpdate
  ): MaybePromise<DelayAdditionalInfo>;
  createDelayEvents(
    propertyCode: PropertyCode,
    runId: string,
    input: DelayEventBatchCreate
  ): MaybePromise<DelayEventList>;
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
}

export interface DataAccess {
  property: PropertyRepository;
  users: UserRepository;
  platform: PlatformRepository;
  operations: OperationsRepository;
}
