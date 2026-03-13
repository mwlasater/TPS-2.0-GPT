import type {
  AttendanceException,
  AttendanceExceptionList,
  ConsistEquipment,
  ConsistEquipmentList,
  ConsistEquipmentUpdate,
  CrewAssignment,
  CrewAssignmentList,
  CrewAssignmentUpdate,
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
  ReportConfigRow,
  ReportConfigList,
  ReportConfigUpdate,
  DelayEventList,
  DelayEvent,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementUpdate,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRun,
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
  updateTrainRunApproval(
    propertyCode: PropertyCode,
    runId: string,
    update: TrainRunApprovalUpdate
  ): MaybePromise<TrainRun>;
  listStationStops(propertyCode: PropertyCode, runId: string): MaybePromise<StationStopList>;
  updateStationStop(
    propertyCode: PropertyCode,
    runId: string,
    stopId: string,
    update: StationStopUpdate
  ): MaybePromise<StationStop>;
  listDelayEvents(propertyCode: PropertyCode, runId: string): MaybePromise<DelayEventList>;
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
