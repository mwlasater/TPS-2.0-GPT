import type {
  AttendanceExceptionList,
  FileServiceList,
  JobProfileList,
  ManagedUserDetail,
  ManagedUserList,
  NotificationList,
  PermissionGroupList,
  PowerBiEmbedList,
  PropertyCode,
  PropertySettings,
  ReferenceDataset,
  ReportConfigList,
  DelayEventList,
  StationStopList,
  TrainRunList,
  TrainScheduleList,
  UserAdminActionList
} from "@tps/types";

export type MaybePromise<T> = T | Promise<T>;

export interface PropertyRepository {
  getSettings(propertyCode: PropertyCode): MaybePromise<PropertySettings>;
  getReferenceData(propertyCode: PropertyCode): MaybePromise<ReferenceDataset>;
}

export interface UserRepository {
  listUsers(propertyCode: PropertyCode): MaybePromise<ManagedUserList>;
  getUserDetail(userId: string, propertyCode: PropertyCode): MaybePromise<ManagedUserDetail>;
  listUserAdminActions(): MaybePromise<UserAdminActionList>;
  listPermissionGroups(propertyCode: PropertyCode): MaybePromise<PermissionGroupList>;
  listJobProfiles(propertyCode: PropertyCode): MaybePromise<JobProfileList>;
  listAttendanceExceptions(propertyCode: PropertyCode): MaybePromise<AttendanceExceptionList>;
}

export interface PlatformRepository {
  listReportConfig(propertyCode: PropertyCode): MaybePromise<ReportConfigList>;
  listFiles(propertyCode: PropertyCode): MaybePromise<FileServiceList>;
  listNotifications(propertyCode: PropertyCode): MaybePromise<NotificationList>;
  listPowerBiEmbeds(propertyCode: PropertyCode): MaybePromise<PowerBiEmbedList>;
}

export interface OperationsRepository {
  listTrainSchedules(propertyCode: PropertyCode): MaybePromise<TrainScheduleList>;
  listTrainRuns(propertyCode: PropertyCode): MaybePromise<TrainRunList>;
  listStationStops(propertyCode: PropertyCode, runId: string): MaybePromise<StationStopList>;
  listDelayEvents(propertyCode: PropertyCode, runId: string): MaybePromise<DelayEventList>;
  listConsistEquipment(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<import("@tps/types").ConsistEquipmentList>;
  listCrewAssignments(
    propertyCode: PropertyCode,
    runId: string
  ): MaybePromise<import("@tps/types").CrewAssignmentList>;
}

export interface DataAccess {
  property: PropertyRepository;
  users: UserRepository;
  platform: PlatformRepository;
  operations: OperationsRepository;
}
