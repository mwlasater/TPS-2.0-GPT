import type {
  AttendanceException,
  AttendanceExceptionList,
  AttendanceExceptionUpdate,
  AppBootstrap,
  ConsistEquipmentList,
  ConsistEquipmentUpdate,
  CrewAssignmentList,
  CrewAssignmentUpdate,
  DelayEventList,
  DelayEventUpdate,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  FileServiceList,
  JobProfile,
  JobProfileList,
  JobProfileUpdate,
  ManagedUserDetail,
  ManagedUserList,
  NotificationList,
  NotificationItem,
  NotificationUpdate,
  PermissionGroupList,
  PowerBiEmbedList,
  PropertyCode,
  PropertySettings,
  PropertySettingsUpdate,
  ReferenceDataset,
  ReportConfigList,
  ReportConfigRow,
  ReportConfigUpdate,
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRunList,
  TrainRun,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainScheduleList,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";
const developmentToken = import.meta.env.VITE_DEV_BEARER_TOKEN ?? "local-dev-token";

export async function fetchBootstrap(): Promise<AppBootstrap> {
  const response = await fetch(`${apiBaseUrl}/auth/session`, {
    headers: {
      Authorization: `Bearer ${developmentToken}`
    }
  });

  if (!response.ok) {
    throw new Error(`bootstrap.failed.${response.status}`);
  }

  return (await response.json()) as AppBootstrap;
}

async function fetchPropertyScoped<T>(path: string, propertyCode: PropertyCode): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: {
      Authorization: `Bearer ${developmentToken}`,
      "X-Property": propertyCode
    }
  });

  if (!response.ok) {
    throw new Error(`request.failed.${response.status}`);
  }

  return (await response.json()) as T;
}

async function mutatePropertyScoped<T>(
  path: string,
  propertyCode: PropertyCode,
  method: "PUT",
  body: unknown
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${developmentToken}`,
      "Content-Type": "application/json",
      "X-Property": propertyCode
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    throw new Error(`request.failed.${response.status}`);
  }

  return (await response.json()) as T;
}

export function fetchPropertySettings(propertyCode: PropertyCode): Promise<PropertySettings> {
  return fetchPropertyScoped<PropertySettings>("/settings/property", propertyCode);
}

export function updatePropertySettings(
  propertyCode: PropertyCode,
  payload: PropertySettingsUpdate
): Promise<PropertySettings> {
  return mutatePropertyScoped<PropertySettings>("/settings/property", propertyCode, "PUT", payload);
}

export function fetchManagedUsers(propertyCode: PropertyCode): Promise<ManagedUserList> {
  return fetchPropertyScoped<ManagedUserList>("/users", propertyCode);
}

export function fetchManagedUserDetail(
  propertyCode: PropertyCode,
  userId: string
): Promise<ManagedUserDetail> {
  return fetchPropertyScoped<ManagedUserDetail>(`/users/${userId}`, propertyCode);
}

export function updateManagedUserPropertyAccess(
  propertyCode: PropertyCode,
  userId: string,
  payload: UserPropertyAccessUpdate
): Promise<ManagedUserDetail> {
  return mutatePropertyScoped<ManagedUserDetail>(
    `/users/${userId}/property-access`,
    propertyCode,
    "PUT",
    payload
  );
}

export function updateManagedUserPermissionGroups(
  propertyCode: PropertyCode,
  userId: string,
  payload: UserPermissionGroupUpdate
): Promise<ManagedUserDetail> {
  return mutatePropertyScoped<ManagedUserDetail>(
    `/users/${userId}/permission-groups`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchUserAdminActions(
  propertyCode: PropertyCode,
  userId: string
): Promise<UserAdminActionList> {
  return fetchPropertyScoped<UserAdminActionList>(`/users/${userId}/actions`, propertyCode);
}

export function fetchPermissionGroups(propertyCode: PropertyCode): Promise<PermissionGroupList> {
  return fetchPropertyScoped<PermissionGroupList>("/permission-groups", propertyCode);
}

export function fetchReportConfig(propertyCode: PropertyCode): Promise<ReportConfigList> {
  return fetchPropertyScoped<ReportConfigList>("/report-config", propertyCode);
}

export function updateReportConfig(
  propertyCode: PropertyCode,
  reportId: string,
  payload: ReportConfigUpdate
): Promise<ReportConfigRow> {
  return mutatePropertyScoped<ReportConfigRow>(
    `/report-config/${reportId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchJobProfiles(propertyCode: PropertyCode): Promise<JobProfileList> {
  return fetchPropertyScoped<JobProfileList>("/job-profiles", propertyCode);
}

export function updateJobProfile(
  propertyCode: PropertyCode,
  profileId: string,
  payload: JobProfileUpdate
): Promise<JobProfile> {
  return mutatePropertyScoped<JobProfile>(`/job-profiles/${profileId}`, propertyCode, "PUT", payload);
}

export function fetchAttendanceExceptions(
  propertyCode: PropertyCode
): Promise<AttendanceExceptionList> {
  return fetchPropertyScoped<AttendanceExceptionList>("/attendance-exceptions", propertyCode);
}

export function updateAttendanceException(
  propertyCode: PropertyCode,
  exceptionId: string,
  payload: AttendanceExceptionUpdate
): Promise<AttendanceException> {
  return mutatePropertyScoped<AttendanceException>(
    `/attendance-exceptions/${exceptionId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchFiles(propertyCode: PropertyCode): Promise<FileServiceList> {
  return fetchPropertyScoped<FileServiceList>("/files", propertyCode);
}

export function fetchNotifications(propertyCode: PropertyCode): Promise<NotificationList> {
  return fetchPropertyScoped<NotificationList>("/notifications", propertyCode);
}

export function updateNotification(
  propertyCode: PropertyCode,
  notificationId: string,
  payload: NotificationUpdate
): Promise<NotificationItem> {
  return mutatePropertyScoped<NotificationItem>(
    `/notifications/${notificationId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchPowerBi(propertyCode: PropertyCode): Promise<PowerBiEmbedList> {
  return fetchPropertyScoped<PowerBiEmbedList>("/power-bi", propertyCode);
}

export function fetchReferenceData(propertyCode: PropertyCode): Promise<ReferenceDataset> {
  return fetchPropertyScoped<ReferenceDataset>("/reference-data", propertyCode);
}

export function fetchTrainSchedules(propertyCode: PropertyCode): Promise<TrainScheduleList> {
  return fetchPropertyScoped<TrainScheduleList>("/train-schedules", propertyCode);
}

export function fetchTrainRuns(propertyCode: PropertyCode): Promise<TrainRunList> {
  return fetchPropertyScoped<TrainRunList>("/train-runs", propertyCode);
}

export function updateTrainRunApproval(
  propertyCode: PropertyCode,
  runId: string,
  payload: TrainRunApprovalUpdate
): Promise<TrainRun> {
  return mutatePropertyScoped<TrainRun>(`/train-runs/${runId}/approval`, propertyCode, "PUT", payload);
}

export function fetchTrainRunApprovalHistory(
  propertyCode: PropertyCode,
  runId: string
): Promise<TrainRunApprovalHistoryList> {
  return fetchPropertyScoped<TrainRunApprovalHistoryList>(
    `/train-runs/${runId}/approval-history`,
    propertyCode
  );
}

export function fetchStationStops(
  propertyCode: PropertyCode,
  runId: string
): Promise<StationStopList> {
  return fetchPropertyScoped<StationStopList>(`/train-runs/${runId}/stops`, propertyCode);
}

export function updateStationStop(
  propertyCode: PropertyCode,
  runId: string,
  stopId: string,
  payload: StationStopUpdate
): Promise<StationStop> {
  return mutatePropertyScoped<StationStop>(
    `/train-runs/${runId}/stops/${stopId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchDelayEvents(
  propertyCode: PropertyCode,
  runId: string
): Promise<DelayEventList> {
  return fetchPropertyScoped<DelayEventList>(`/train-runs/${runId}/delays`, propertyCode);
}

export function updateDelayEvent(
  propertyCode: PropertyCode,
  runId: string,
  delayId: string,
  payload: DelayEventUpdate
): Promise<DelayEventList["items"][number]> {
  return mutatePropertyScoped<DelayEventList["items"][number]>(
    `/train-runs/${runId}/delays/${delayId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchConsistEquipment(
  propertyCode: PropertyCode,
  runId: string
): Promise<ConsistEquipmentList> {
  return fetchPropertyScoped<ConsistEquipmentList>(`/train-runs/${runId}/consist`, propertyCode);
}

export function updateConsistEquipment(
  propertyCode: PropertyCode,
  runId: string,
  equipmentId: string,
  payload: ConsistEquipmentUpdate
): Promise<ConsistEquipmentList["items"][number]> {
  return mutatePropertyScoped<ConsistEquipmentList["items"][number]>(
    `/train-runs/${runId}/consist/${equipmentId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchCrewAssignments(
  propertyCode: PropertyCode,
  runId: string
): Promise<CrewAssignmentList> {
  return fetchPropertyScoped<CrewAssignmentList>(`/train-runs/${runId}/crew`, propertyCode);
}

export function updateCrewAssignment(
  propertyCode: PropertyCode,
  runId: string,
  assignmentId: string,
  payload: CrewAssignmentUpdate
): Promise<CrewAssignmentList["items"][number]> {
  return mutatePropertyScoped<CrewAssignmentList["items"][number]>(
    `/train-runs/${runId}/crew/${assignmentId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchFareEnforcement(
  propertyCode: PropertyCode,
  runId?: string
): Promise<FareEnforcementList> {
  const query = runId ? `?runId=${encodeURIComponent(runId)}` : "";
  return fetchPropertyScoped<FareEnforcementList>(`/fare-enforcement${query}`, propertyCode);
}

export function fetchFareEnforcementSummary(
  propertyCode: PropertyCode
): Promise<FareEnforcementSummaryList> {
  return fetchPropertyScoped<FareEnforcementSummaryList>("/fare-enforcement/summary", propertyCode);
}

export function updateFareEnforcement(
  propertyCode: PropertyCode,
  recordId: string,
  payload: FareEnforcementUpdate
): Promise<FareEnforcementRecord> {
  return mutatePropertyScoped<FareEnforcementRecord>(
    `/fare-enforcement/${recordId}`,
    propertyCode,
    "PUT",
    payload
  );
}
