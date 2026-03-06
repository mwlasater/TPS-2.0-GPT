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

export interface PropertyRepository {
  getSettings(propertyCode: PropertyCode): PropertySettings;
  getReferenceData(propertyCode: PropertyCode): ReferenceDataset;
}

export interface UserRepository {
  listUsers(propertyCode: PropertyCode): ManagedUserList;
  getUserDetail(userId: string, propertyCode: PropertyCode): ManagedUserDetail;
  listUserAdminActions(): UserAdminActionList;
  listPermissionGroups(propertyCode: PropertyCode): PermissionGroupList;
  listJobProfiles(propertyCode: PropertyCode): JobProfileList;
  listAttendanceExceptions(propertyCode: PropertyCode): AttendanceExceptionList;
}

export interface PlatformRepository {
  listReportConfig(propertyCode: PropertyCode): ReportConfigList;
  listFiles(propertyCode: PropertyCode): FileServiceList;
  listNotifications(propertyCode: PropertyCode): NotificationList;
  listPowerBiEmbeds(propertyCode: PropertyCode): PowerBiEmbedList;
}

export interface OperationsRepository {
  listTrainSchedules(propertyCode: PropertyCode): TrainScheduleList;
  listTrainRuns(propertyCode: PropertyCode): TrainRunList;
  listStationStops(propertyCode: PropertyCode, runId: string): StationStopList;
  listDelayEvents(propertyCode: PropertyCode, runId: string): DelayEventList;
  listConsistEquipment(propertyCode: PropertyCode, runId: string): import("@tps/types").ConsistEquipmentList;
  listCrewAssignments(propertyCode: PropertyCode, runId: string): import("@tps/types").CrewAssignmentList;
}

export interface DataAccess {
  property: PropertyRepository;
  users: UserRepository;
  platform: PlatformRepository;
  operations: OperationsRepository;
}

