import type {
  AttendanceException,
  AttendanceExceptionList,
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
  AppBootstrap,
  ConsistEquipmentList,
  ConsistTemplateList,
  ConsistEquipmentUpdate,
  CrewAssignmentList,
  CrewTemplateList,
  CrewAssignmentUpdate,
  DelayAdditionalInfo,
  DelayAdditionalInfoDeleteResult,
  DelayAdditionalInfoUpdate,
  DelayPropagationPreview,
  DelayWorkOrder,
  DelayWorkOrderCreate,
  DelayEventBatchCreate,
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayEventDeleteResult,
  DelayEventList,
  DelayTemplateCreateRequest,
  DelayTemplateList,
  DelayTemplateUpdate,
  DelayEventUpdate,
  FareEnforcementCreate,
  FareEnforcementDashboard,
  FareEnforcementList,
  FareEnforcementRecord,
  FareEnforcementSummaryList,
  FareEnforcementUpdate,
  FileServiceList,
  JobProfile,
  JobProfileList,
  JobProfileUpdate,
  ManagedUserCreate,
  UserAdminHistoryList,
  ManagedUserDetail,
  ManagedUserList,
  NotificationList,
  NotificationItem,
  NotificationUpdate,
  NotableDelayTypeList,
  PassengerReportImportCreate,
  PassengerReportImportList,
  PersonnelRecord,
  PersonnelRecordList,
  PersonnelStatusUpdate,
  PermissionGroupCreate,
  PermissionGroupDeleteResult,
  PermissionGroupUpdate,
  PermissionGroupList,
  LiveReportCatalogList,
  PowerBiEmbedList,
  PropertyCode,
  PropertySettings,
  PropertySettingsUpdate,
  ReferenceDataset,
  ResourceSwapRequest,
  ReportConfigList,
  ReportConfigRow,
  ReportConfigUpdate,
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
  StationStop,
  StationStopList,
  StationStopUpdate,
  TrainRunList,
  TrainRun,
  TrainRunDeleteResult,
  TrainRunInitializeRequest,
  TrainRunInitializeResult,
  TrainRunBatchApprovalResult,
  TrainRunBatchApprovalUpdate,
  TrainRunApprovalHistoryList,
  TrainRunApprovalUpdate,
  TrainRunEventHistoryList,
  TrainRunImpactSummary,
  TrainScheduleApprovalSummary,
  TrainScheduleList,
  TrainRunStatusRecord,
  TrainRunStatusUpdate,
  UserPermissionGroupUpdate,
  UserPropertyAccessUpdate,
  UserAdminActionList
} from "@tps/types";

import { buildAuthorizedHeaders } from "./auth-client.js";

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000/api/v1";

export async function fetchBootstrap(): Promise<AppBootstrap> {
  const response = await fetch(`${apiBaseUrl}/auth/session`, {
    headers: await buildAuthorizedHeaders()
  });

  if (!response.ok) {
    throw new Error(`bootstrap.failed.${response.status}`);
  }

  return (await response.json()) as AppBootstrap;
}

async function fetchPropertyScoped<T>(path: string, propertyCode: PropertyCode): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    headers: await buildAuthorizedHeaders({
      "X-Property": propertyCode
    })
  });

  if (!response.ok) {
    throw new Error(`request.failed.${response.status}`);
  }

  return (await response.json()) as T;
}

async function mutatePropertyScoped<T>(
  path: string,
  propertyCode: PropertyCode,
  method: "POST" | "PUT",
  body: unknown
): Promise<T> {
  const response = await fetch(`${apiBaseUrl}${path}`, {
    method,
    headers: await buildAuthorizedHeaders({
      "Content-Type": "application/json",
      "X-Property": propertyCode
    }),
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

export function fetchReferenceData(propertyCode: PropertyCode): Promise<ReferenceDataset> {
  return fetchPropertyScoped<ReferenceDataset>("/reference-data", propertyCode);
}

export function updatePropertySettings(
  propertyCode: PropertyCode,
  payload: PropertySettingsUpdate
): Promise<PropertySettings> {
  return mutatePropertyScoped<PropertySettings>("/settings/property", propertyCode, "PUT", payload);
}

export function updateReferenceData(
  propertyCode: PropertyCode,
  payload: ReferenceDataset
): Promise<ReferenceDataset> {
  return mutatePropertyScoped<ReferenceDataset>("/reference-data", propertyCode, "PUT", payload);
}

export function fetchManagedUsers(propertyCode: PropertyCode): Promise<ManagedUserList> {
  return fetchPropertyScoped<ManagedUserList>("/users", propertyCode);
}

export function createManagedUser(
  propertyCode: PropertyCode,
  payload: ManagedUserCreate
): Promise<ManagedUserDetail> {
  return mutatePropertyScoped<ManagedUserDetail>("/users", propertyCode, "POST", payload);
}

export function fetchManagedUserDetail(
  propertyCode: PropertyCode,
  userId: string
): Promise<ManagedUserDetail> {
  return fetchPropertyScoped<ManagedUserDetail>(`/users/${userId}`, propertyCode);
}

export function fetchUserAdminHistory(
  propertyCode: PropertyCode,
  userId: string
): Promise<UserAdminHistoryList> {
  return fetchPropertyScoped<UserAdminHistoryList>(`/users/${userId}/history`, propertyCode);
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

export function executeUserAdminAction(
  propertyCode: PropertyCode,
  userId: string,
  actionId: string
): Promise<ManagedUserDetail> {
  return mutatePropertyScoped<ManagedUserDetail>(
    `/users/${userId}/actions/${actionId}`,
    propertyCode,
    "POST",
    {}
  );
}

export function fetchPermissionGroups(propertyCode: PropertyCode): Promise<PermissionGroupList> {
  return fetchPropertyScoped<PermissionGroupList>("/permission-groups", propertyCode);
}

export function updatePermissionGroupDefinition(
  propertyCode: PropertyCode,
  groupId: string,
  payload: PermissionGroupUpdate
): Promise<{ ok: true }> {
  return mutatePropertyScoped<{ ok: true }>(
    `/permission-groups/${groupId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function createPermissionGroupDefinition(
  propertyCode: PropertyCode,
  payload: PermissionGroupCreate
): Promise<{ ok: true }> {
  return mutatePropertyScoped<{ ok: true }>("/permission-groups", propertyCode, "POST", payload);
}

export function deletePermissionGroupDefinition(
  propertyCode: PropertyCode,
  groupId: string
): Promise<PermissionGroupDeleteResult> {
  return buildAuthorizedHeaders({
    "X-Property": propertyCode
  }).then((headers) => fetch(`${apiBaseUrl}/permission-groups/${groupId}`, {
    method: "DELETE",
    headers
  })).then(async (response) => {
    if (!response.ok) {
      throw new Error(`request.failed.${response.status}`);
    }

    return (await response.json()) as PermissionGroupDeleteResult;
  });
}

export function fetchReportConfig(propertyCode: PropertyCode): Promise<ReportConfigList> {
  return fetchPropertyScoped<ReportConfigList>("/report-config", propertyCode);
}

export function fetchReportPreferences(propertyCode: PropertyCode): Promise<ReportPreferenceList> {
  return fetchPropertyScoped<ReportPreferenceList>("/reports/preferences", propertyCode);
}

export function fetchLiveReports(propertyCode: PropertyCode): Promise<LiveReportCatalogList> {
  return fetchPropertyScoped<LiveReportCatalogList>("/reports/live", propertyCode);
}

export function fetchPassengerReportImports(
  propertyCode: PropertyCode
): Promise<PassengerReportImportList> {
  return fetchPropertyScoped<PassengerReportImportList>("/reports/passenger-report", propertyCode);
}

export function createPassengerReportImport(
  propertyCode: PropertyCode,
  payload: PassengerReportImportCreate
): Promise<{ ok: true }> {
  return mutatePropertyScoped<{ ok: true }>(
    "/reports/passenger-report",
    propertyCode,
    "POST",
    payload
  );
}

export function updateReportPreference(
  propertyCode: PropertyCode,
  preferenceId: string,
  payload: ReportPreferenceUpdate
): Promise<ReportPreference> {
  return mutatePropertyScoped<ReportPreference>(
    `/reports/preferences/${preferenceId}`,
    propertyCode,
    "POST",
    payload
  );
}

export function fetchScheduledReportEmailJobs(
  propertyCode: PropertyCode
): Promise<ScheduledReportEmailJobList> {
  return fetchPropertyScoped<ScheduledReportEmailJobList>("/reports/scheduled-emails", propertyCode);
}

export function createScheduledReportEmailJob(
  propertyCode: PropertyCode,
  payload: ScheduledReportEmailJobCreate
): Promise<ScheduledReportEmailJob> {
  return mutatePropertyScoped<ScheduledReportEmailJob>(
    "/reports/scheduled-emails",
    propertyCode,
    "POST",
    payload
  );
}

export function updateScheduledReportEmailJob(
  propertyCode: PropertyCode,
  jobId: string,
  payload: ScheduledReportEmailJobUpdate
): Promise<ScheduledReportEmailJob> {
  return mutatePropertyScoped<ScheduledReportEmailJob>(
    `/reports/scheduled-emails/${jobId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function deleteScheduledReportEmailJob(
  propertyCode: PropertyCode,
  jobId: string
): Promise<ScheduledReportEmailJobDeleteResult> {
  return buildAuthorizedHeaders({
    "X-Property": propertyCode
  }).then((headers) => fetch(`${apiBaseUrl}/reports/scheduled-emails/${jobId}`, {
    method: "DELETE",
    headers
  })).then(async (response) => {
    if (!response.ok) {
      throw new Error(`request.failed.${response.status}`);
    }

    return (await response.json()) as ScheduledReportEmailJobDeleteResult;
  });
}

export function fetchAdminDelayCommonLocations(
  propertyCode: PropertyCode
): Promise<DelayCommonLocationList> {
  return fetchPropertyScoped<DelayCommonLocationList>("/delay-common-locations", propertyCode);
}

export function updateAdminDelayCommonLocation(
  propertyCode: PropertyCode,
  locationId: string,
  payload: DelayCommonLocationUpdate
): Promise<{ ok: true }> {
  return mutatePropertyScoped<{ ok: true }>(
    `/delay-common-locations/${locationId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchAdminDelayTemplates(propertyCode: PropertyCode): Promise<DelayTemplateList> {
  return fetchPropertyScoped<DelayTemplateList>("/delay-templates", propertyCode);
}

export function updateAdminDelayTemplate(
  propertyCode: PropertyCode,
  templateId: string,
  payload: DelayTemplateUpdate
): Promise<{ ok: true }> {
  return mutatePropertyScoped<{ ok: true }>(
    `/delay-templates/${templateId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchAdminSpecialMovements(propertyCode: PropertyCode): Promise<SpecialMovementList> {
  return fetchPropertyScoped<SpecialMovementList>("/special-movements", propertyCode);
}

export function updateAdminSpecialMovement(
  propertyCode: PropertyCode,
  movementId: string,
  payload: SpecialMovementUpdate
): Promise<{ ok: true }> {
  return mutatePropertyScoped<{ ok: true }>(
    `/special-movements/${movementId}`,
    propertyCode,
    "PUT",
    payload
  );
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

export function fetchPersonnelRecords(propertyCode: PropertyCode): Promise<PersonnelRecordList> {
  return fetchPropertyScoped<PersonnelRecordList>("/personnel", propertyCode);
}

export function updatePersonnelStatus(
  propertyCode: PropertyCode,
  personnelId: string,
  payload: PersonnelStatusUpdate
): Promise<PersonnelRecord> {
  return mutatePropertyScoped<PersonnelRecord>(
    `/personnel/${personnelId}/status`,
    propertyCode,
    "PUT",
    payload
  );
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

export function fetchAttendanceIssues(propertyCode: PropertyCode): Promise<AttendanceIssueList> {
  return fetchPropertyScoped<AttendanceIssueList>("/attendance-issues", propertyCode);
}

export function fetchAttendanceHistory(
  propertyCode: PropertyCode,
  employeeId: string,
  issueType?: AttendanceIssueRecord["issueType"]
): Promise<AttendanceHistoryList> {
  const query = issueType ? `?issueType=${encodeURIComponent(issueType)}` : "";
  return fetchPropertyScoped<AttendanceHistoryList>(
    `/attendance-history/${employeeId}${query}`,
    propertyCode
  );
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

export function updateAttendanceIssue(
  propertyCode: PropertyCode,
  issueId: string,
  payload: AttendanceIssueUpdate
): Promise<AttendanceIssueRecord> {
  return mutatePropertyScoped<AttendanceIssueRecord>(
    `/attendance-issues/${issueId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchAttendanceNotificationRules(
  propertyCode: PropertyCode
): Promise<AttendanceNotificationRuleList> {
  return fetchPropertyScoped<AttendanceNotificationRuleList>("/attendance-notifications", propertyCode);
}

export function createAttendanceNotificationRule(
  propertyCode: PropertyCode,
  payload: AttendanceNotificationRuleCreate
): Promise<AttendanceNotificationRule> {
  return mutatePropertyScoped<AttendanceNotificationRule>(
    "/attendance-notifications",
    propertyCode,
    "POST",
    payload
  );
}

export function updateAttendanceNotificationRule(
  propertyCode: PropertyCode,
  ruleId: string,
  payload: AttendanceNotificationRuleUpdate
): Promise<AttendanceNotificationRule> {
  return mutatePropertyScoped<AttendanceNotificationRule>(
    `/attendance-notifications/${ruleId}`,
    propertyCode,
    "PUT",
    payload
  );
}

export function deleteAttendanceNotificationRule(
  propertyCode: PropertyCode,
  ruleId: string
): Promise<AttendanceNotificationRuleDeleteResult> {
  return buildAuthorizedHeaders({
    "X-Property": propertyCode
  }).then((headers) => fetch(`${apiBaseUrl}/attendance-notifications/${ruleId}`, {
    method: "DELETE",
    headers
  })).then(async (response) => {
    if (!response.ok) {
      throw new Error(`request.failed.${response.status}`);
    }

    return (await response.json()) as AttendanceNotificationRuleDeleteResult;
  });
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

export function fetchTrainSchedules(propertyCode: PropertyCode): Promise<TrainScheduleList> {
  return fetchPropertyScoped<TrainScheduleList>("/train-schedules", propertyCode);
}

export function fetchTrainRuns(propertyCode: PropertyCode): Promise<TrainRunList> {
  return fetchPropertyScoped<TrainRunList>("/train-runs", propertyCode);
}

export function initializeTrainRuns(
  propertyCode: PropertyCode,
  payload: TrainRunInitializeRequest
): Promise<TrainRunInitializeResult> {
  return mutatePropertyScoped<TrainRunInitializeResult>(
    "/train-runs/initialize",
    propertyCode,
    "PUT",
    payload
  );
}

export function updateTrainRunApproval(
  propertyCode: PropertyCode,
  runId: string,
  payload: TrainRunApprovalUpdate
): Promise<TrainRun> {
  return mutatePropertyScoped<TrainRun>(`/train-runs/${runId}/approval`, propertyCode, "PUT", payload);
}

export function resetTrainRun(propertyCode: PropertyCode, runId: string): Promise<TrainRun> {
  return mutatePropertyScoped<TrainRun>(`/train-runs/${runId}/reset`, propertyCode, "PUT", {});
}

export function deleteTrainRun(
  propertyCode: PropertyCode,
  runId: string
): Promise<TrainRunDeleteResult> {
  return buildAuthorizedHeaders({
    "X-Property": propertyCode
  }).then((headers) => fetch(`${apiBaseUrl}/train-runs/${runId}`, {
    method: "DELETE",
    headers
  })).then(async (response) => {
    if (!response.ok) {
      throw new Error(`request.failed.${response.status}`);
    }

    return (await response.json()) as TrainRunDeleteResult;
  });
}

export function updateTrainRunApprovalBatch(
  propertyCode: PropertyCode,
  payload: TrainRunBatchApprovalUpdate
): Promise<TrainRunBatchApprovalResult> {
  return mutatePropertyScoped<TrainRunBatchApprovalResult>(
    "/train-runs/approval/batch",
    propertyCode,
    "PUT",
    payload
  );
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

export function fetchTrainRunImpactSummary(
  propertyCode: PropertyCode,
  runId: string
): Promise<TrainRunImpactSummary> {
  return fetchPropertyScoped<TrainRunImpactSummary>(`/train-runs/${runId}/impacts`, propertyCode);
}

export function fetchTrainRunStatus(
  propertyCode: PropertyCode,
  runId: string
): Promise<TrainRunStatusRecord> {
  return fetchPropertyScoped<TrainRunStatusRecord>(`/train-runs/${runId}/status`, propertyCode);
}

export function updateTrainRunStatus(
  propertyCode: PropertyCode,
  runId: string,
  payload: TrainRunStatusUpdate
): Promise<TrainRunStatusRecord> {
  return mutatePropertyScoped<TrainRunStatusRecord>(
    `/train-runs/${runId}/status`,
    propertyCode,
    "PUT",
    payload
  );
}

export function fetchTrainRunEventHistory(
  propertyCode: PropertyCode,
  runId: string
): Promise<TrainRunEventHistoryList> {
  return fetchPropertyScoped<TrainRunEventHistoryList>(`/train-runs/${runId}/events`, propertyCode);
}

export function fetchTrainScheduleApprovalHistory(
  propertyCode: PropertyCode,
  scheduleId: string
): Promise<TrainRunApprovalHistoryList> {
  return fetchPropertyScoped<TrainRunApprovalHistoryList>(
    `/train-schedules/${scheduleId}/approval-history`,
    propertyCode
  );
}

export function fetchTrainScheduleApprovalSummary(
  propertyCode: PropertyCode,
  scheduleId: string
): Promise<TrainScheduleApprovalSummary> {
  return fetchPropertyScoped<TrainScheduleApprovalSummary>(
    `/train-schedules/${scheduleId}/approval-summary`,
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

export function fetchDelayCommonLocations(
  propertyCode: PropertyCode
): Promise<DelayCommonLocationList> {
  return fetchPropertyScoped<DelayCommonLocationList>("/delays/common-locations", propertyCode);
}

export function fetchDelayTemplates(propertyCode: PropertyCode): Promise<DelayTemplateList> {
  return fetchPropertyScoped<DelayTemplateList>("/delays/templates", propertyCode);
}

export function fetchNotableDelayTypes(propertyCode: PropertyCode): Promise<NotableDelayTypeList> {
  return fetchPropertyScoped<NotableDelayTypeList>("/delays/notable-delay-types", propertyCode);
}

export function fetchSpecialMovements(
  propertyCode: PropertyCode
): Promise<SpecialMovementList> {
  return fetchPropertyScoped<SpecialMovementList>("/delays/special-movements", propertyCode);
}

export function fetchDelayAdditionalInfo(
  propertyCode: PropertyCode,
  delayId: string
): Promise<DelayAdditionalInfo> {
  return fetchPropertyScoped<DelayAdditionalInfo>(`/delays/${delayId}/additional-info`, propertyCode);
}

export function fetchDelayWorkOrder(
  propertyCode: PropertyCode,
  delayId: string
): Promise<DelayWorkOrder | null> {
  return fetchPropertyScoped<DelayWorkOrder | null>(`/delays/${delayId}/work-order`, propertyCode);
}

export function createDelayWorkOrder(
  propertyCode: PropertyCode,
  delayId: string,
  payload: DelayWorkOrderCreate
): Promise<DelayWorkOrder> {
  return mutatePropertyScoped<DelayWorkOrder>(
    `/delays/${delayId}/work-order`,
    propertyCode,
    "POST",
    payload
  );
}

export function updateDelayAdditionalInfo(
  propertyCode: PropertyCode,
  delayId: string,
  payload: DelayAdditionalInfoUpdate
): Promise<DelayAdditionalInfo> {
  return mutatePropertyScoped<DelayAdditionalInfo>(
    `/delays/${delayId}/additional-info`,
    propertyCode,
    "PUT",
    payload
  );
}

export function deleteDelayAdditionalInfo(
  propertyCode: PropertyCode,
  delayId: string
): Promise<DelayAdditionalInfoDeleteResult> {
  return buildAuthorizedHeaders({
    "X-Property": propertyCode
  }).then((headers) => fetch(`${apiBaseUrl}/delays/${delayId}/additional-info`, {
    method: "DELETE",
    headers
  })).then(async (response) => {
    if (!response.ok) {
      throw new Error(`request.failed.${response.status}`);
    }

    return (await response.json()) as DelayAdditionalInfoDeleteResult;
  });
}

export function createDelayEvents(
  propertyCode: PropertyCode,
  runId: string,
  payload: DelayEventBatchCreate
): Promise<DelayEventList> {
  return mutatePropertyScoped<DelayEventList>(
    `/train-runs/${runId}/delays/batch`,
    propertyCode,
    "POST",
    payload
  );
}

export function fetchDelayPropagationPreview(
  propertyCode: PropertyCode,
  runId: string
): Promise<DelayPropagationPreview> {
  return fetchPropertyScoped<DelayPropagationPreview>(
    `/train-runs/${runId}/delay-propagation`,
    propertyCode
  );
}

export function createDelayFromTemplate(
  propertyCode: PropertyCode,
  runId: string,
  payload: DelayTemplateCreateRequest
): Promise<DelayEventList["items"][number]> {
  return mutatePropertyScoped<DelayEventList["items"][number]>(
    `/train-runs/${runId}/delays/template`,
    propertyCode,
    "POST",
    payload
  );
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

export function deleteDelayEvent(
  propertyCode: PropertyCode,
  runId: string,
  delayId: string
): Promise<DelayEventDeleteResult> {
  return buildAuthorizedHeaders({
    "X-Property": propertyCode
  }).then((headers) => fetch(`${apiBaseUrl}/train-runs/${runId}/delays/${delayId}`, {
    method: "DELETE",
    headers
  })).then(async (response) => {
    if (!response.ok) {
      throw new Error(`request.failed.${response.status}`);
    }

    return (await response.json()) as DelayEventDeleteResult;
  });
}

export function fetchConsistEquipment(
  propertyCode: PropertyCode,
  runId: string
): Promise<ConsistEquipmentList> {
  return fetchPropertyScoped<ConsistEquipmentList>(`/train-runs/${runId}/consist`, propertyCode);
}

export function fetchConsistTemplates(propertyCode: PropertyCode): Promise<ConsistTemplateList> {
  return fetchPropertyScoped<ConsistTemplateList>("/consist/templates", propertyCode);
}

export function swapConsistEquipment(
  propertyCode: PropertyCode,
  runId: string,
  payload: ResourceSwapRequest
): Promise<ConsistEquipmentList> {
  return mutatePropertyScoped<ConsistEquipmentList>(
    `/train-runs/${runId}/consist/swap`,
    propertyCode,
    "POST",
    payload
  );
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

export function fetchCrewTemplates(propertyCode: PropertyCode): Promise<CrewTemplateList> {
  return fetchPropertyScoped<CrewTemplateList>("/crew/templates", propertyCode);
}

export function swapCrewAssignments(
  propertyCode: PropertyCode,
  runId: string,
  payload: ResourceSwapRequest
): Promise<CrewAssignmentList> {
  return mutatePropertyScoped<CrewAssignmentList>(
    `/train-runs/${runId}/crew/swap`,
    propertyCode,
    "POST",
    payload
  );
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

export function createFareEnforcement(
  propertyCode: PropertyCode,
  payload: FareEnforcementCreate
): Promise<FareEnforcementRecord> {
  return mutatePropertyScoped<FareEnforcementRecord>(
    "/fare-enforcement",
    propertyCode,
    "POST",
    payload
  );
}

export function fetchFareEnforcementSummary(
  propertyCode: PropertyCode
): Promise<FareEnforcementSummaryList> {
  return fetchPropertyScoped<FareEnforcementSummaryList>("/fare-enforcement/summary", propertyCode);
}

export function fetchFareEnforcementDashboard(
  propertyCode: PropertyCode
): Promise<FareEnforcementDashboard> {
  return fetchPropertyScoped<FareEnforcementDashboard>("/fare-enforcement/dashboard", propertyCode);
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
