import {
  createFareEnforcement,
  deleteFareEnforcementForRun,
  getFareEnforcementDashboard,
  listFareEnforcement,
  listFareEnforcementSummary,
  updateFareEnforcement
} from "../lib/fare-enforcement-data.js";
import {
  createAttendanceNotificationRule,
  deleteAttendanceNotificationRule,
  listAttendanceExceptions,
  listAttendanceHistory,
  listAttendanceIssues,
  listAttendanceNotificationRules,
  listJobProfiles,
  updateAttendanceIssue,
  updateAttendanceNotificationRule,
  updateAttendanceException,
  updateJobProfile
} from "../lib/baseline-data.js";
import { listManagedUsers } from "../lib/managed-users.js";
import { listPersonnelRecords, updatePersonnelStatus } from "../lib/personnel-data.js";
import {
  deleteTrainRun,
  getTrainRun,
  initializeTrainRuns,
  listTrainRuns,
  resetTrainRun,
  listTrainSchedules,
  updateTrainRunApproval,
  updateTrainRunApprovalBatch
} from "../lib/operations-data.js";
import {
  createPermissionGroup,
  deletePermissionGroup,
  listPermissionGroups,
  updatePermissionGroup
} from "../lib/permission-groups.js";
import {
  listFiles,
  listNotifications,
  listPowerBiEmbeds,
  updateNotification
} from "../lib/platform-data.js";
import { getPropertySettings, updatePropertySettings } from "../lib/property-settings.js";
import { getReferenceData, updateReferenceData } from "../lib/reference-data.js";
import {
  createReportDelivery,
  createPassengerReportImport,
  createScheduledReportEmailJob,
  deleteScheduledReportEmailJob,
  listLiveReports,
  listPassengerReportImports,
  listReportDeliveries,
  listReportConfig,
  listReportPreferences,
  listScheduledReportEmailJobs,
  updateReportConfig,
  updateReportPreference,
  updateScheduledReportEmailJob
} from "../lib/report-config.js";
import {
  createDelayWorkOrder,
  createDelayFromTemplate,
  createDelayEvents,
  deleteDelayAdditionalInfo,
  deleteDelayEvent,
  deleteRunDetailState,
  getDelayPropagationPreview,
  getDelayAdditionalInfo,
  getDelayWorkOrder,
  listDelayTemplates,
  listDelayEvents,
  listDelayCommonLocations,
  listNotableDelayTypes,
  listSpecialMovements,
  listStationStops,
  resetRunDetailState,
  updateDelayCommonLocation,
  updateDelayAdditionalInfo,
  updateDelayEvent,
  updateDelayTemplate,
  updateSpecialMovement,
  updateStationStop
} from "../lib/run-detail-data.js";
import {
  deleteRunResourceState,
  listConsistEquipment,
  listConsistTemplates,
  listCrewTemplates,
  listCrewAssignments,
  resetRunResourceState,
  swapConsistEquipment,
  swapCrewAssignments,
  updateConsistEquipment,
  updateCrewAssignment
} from "../lib/run-resource-data.js";
import {
  deleteTrainRunApprovalHistory,
  listTrainRunApprovalHistory,
  listTrainScheduleApprovalHistory,
  recordTrainRunApprovalHistory
} from "../lib/approval-history-data.js";
import {
  deriveTrainRunImpactSummary,
  deriveTrainScheduleApprovalSummary
} from "../lib/run-impact-data.js";
import {
  deleteTrainRunStatus,
  getTrainRunStatus,
  syncTrainRunStatusFromRuns,
  updateTrainRunStatus
} from "../lib/train-run-status-data.js";
import {
  listTrainRunEventHistory,
  recordTrainRunEventHistory
} from "../lib/train-run-event-history-data.js";
import {
  createManagedUserDetail,
  executeUserAdminAction,
  getUserAdminActionSummary,
  getManagedUserDetail,
  listUserAdminActions,
  updateManagedUserPermissionGroups,
  updateManagedUserPropertyAccess
} from "../lib/user-admin-data.js";
import {
  listUserAdminHistory,
  recordUserAdminHistory
} from "../lib/user-admin-history-data.js";

import type { DataAccess } from "./contracts.js";

export function createMockDataAccess(): DataAccess {
  function assertRunMutable(propertyCode: Parameters<typeof listTrainRuns>[0], runId: string): void {
    const run = listTrainRuns(propertyCode).items.find((candidate) => candidate.id === runId);

    if (!run) {
      throw new Error("train_run.not_found");
    }

    if (run.isApproved) {
      throw new Error("train_run.locked");
    }
  }

  return {
    property: {
      getSettings: getPropertySettings,
      updateSettings: updatePropertySettings,
      getReferenceData,
      updateReferenceData
    },
    users: {
      listUsers: listManagedUsers,
      createUser(propertyCode, input, actorName) {
        const detail = createManagedUserDetail(propertyCode, input);
        recordUserAdminHistory(
          propertyCode,
          detail.id,
          "invite-user",
          actorName,
          "Invitation sent on 2026-03-20"
        );
        return detail;
      },
      getUserDetail: getManagedUserDetail,
      listUserAdminHistory(userId, propertyCode) {
        return listUserAdminHistory(propertyCode, userId);
      },
      executeUserAdminAction(userId, propertyCode, actionId, actorName) {
        const detail = executeUserAdminAction(userId, propertyCode, actionId);
        recordUserAdminHistory(
          propertyCode,
          userId,
          actionId,
          actorName,
          getUserAdminActionSummary(actionId)
        );
        return detail;
      },
      updateUserPropertyAccess(userId, propertyCode, update, actorName) {
        const detail = updateManagedUserPropertyAccess(userId, propertyCode, update);
        recordUserAdminHistory(
          propertyCode,
          userId,
          "property-access-updated",
          actorName,
          `Property access updated to ${update.propertyAccess.join(", ")}`
        );
        return detail;
      },
      updateUserPermissionGroups(userId, propertyCode, update, actorName) {
        const detail = updateManagedUserPermissionGroups(userId, propertyCode, update);
        recordUserAdminHistory(
          propertyCode,
          userId,
          "permission-groups-updated",
          actorName,
          `Permission groups updated to ${update.groups.join(", ")}`
        );
        return detail;
      },
      listUserAdminActions(_propertyCode, actorPermissions) {
        return listUserAdminActions(actorPermissions);
      },
      createPermissionGroup,
      deletePermissionGroup,
      listPermissionGroups,
      updatePermissionGroup,
      listJobProfiles,
      listPersonnelRecords,
      updatePersonnelStatus,
      updateJobProfile,
      listAttendanceExceptions,
      updateAttendanceException,
      listAttendanceIssues,
      listAttendanceHistory,
      updateAttendanceIssue,
      listAttendanceNotificationRules,
      createAttendanceNotificationRule,
      updateAttendanceNotificationRule,
      deleteAttendanceNotificationRule
    },
    platform: {
      listReportConfig,
      updateReportConfig,
      listReportPreferences,
      updateReportPreference,
      listScheduledReportEmailJobs,
      createScheduledReportEmailJob,
      updateScheduledReportEmailJob,
      deleteScheduledReportEmailJob,
      listLiveReports,
      listPassengerReportImports,
      createPassengerReportImport,
      listReportDeliveries,
      createReportDelivery,
      listFiles,
      listNotifications,
      updateNotification,
      listPowerBiEmbeds
    },
    operations: {
      listTrainSchedules,
      listTrainRuns(propertyCode) {
        const runs = listTrainRuns(propertyCode);
        syncTrainRunStatusFromRuns(propertyCode, runs);
        return runs;
      },
      initializeTrainRuns(propertyCode, request) {
        const result = initializeTrainRuns(propertyCode, request);
        syncTrainRunStatusFromRuns(propertyCode, listTrainRuns(propertyCode));
        return result;
      },
      resetTrainRun(propertyCode, runId) {
        assertRunMutable(propertyCode, runId);
        resetRunDetailState(propertyCode, runId);
        resetRunResourceState(propertyCode, runId);
        const run = resetTrainRun(propertyCode, runId);
        syncTrainRunStatusFromRuns(propertyCode, listTrainRuns(propertyCode));
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "run-reset",
          "Local Development User",
          "Run reset and operational data cleared."
        );
        return run;
      },
      deleteTrainRun(propertyCode, runId) {
        assertRunMutable(propertyCode, runId);
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "run-deleted",
          "Local Development User",
          "Run deleted from the operating day."
        );
        deleteRunDetailState(propertyCode, runId);
        deleteRunResourceState(propertyCode, runId);
        deleteFareEnforcementForRun(propertyCode, runId);
        deleteTrainRunApprovalHistory(propertyCode, runId);
        const result = deleteTrainRun(propertyCode, runId);
        deleteTrainRunStatus(propertyCode, runId);
        return result;
      },
      updateTrainRunApproval(propertyCode, runId, update, actorName) {
        const run = updateTrainRunApproval(propertyCode, runId, update);
        syncTrainRunStatusFromRuns(propertyCode, listTrainRuns(propertyCode));
        recordTrainRunApprovalHistory(propertyCode, runId, update, actorName);
        return run;
      },
      updateTrainRunApprovalBatch(propertyCode, update, actorName) {
        const result = updateTrainRunApprovalBatch(propertyCode, update);
        syncTrainRunStatusFromRuns(propertyCode, listTrainRuns(propertyCode));

        for (const run of result.updatedRuns) {
          recordTrainRunApprovalHistory(
            propertyCode,
            run.id,
            {
              isApproved: update.isApproved,
              notes: update.notes
            },
            actorName
          );
        }

        return result;
      },
      listTrainRunApprovalHistory,
      getTrainRunStatus,
      updateTrainRunStatus(propertyCode, runId, update, actorName) {
        const record = updateTrainRunStatus(propertyCode, runId, update, actorName);
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "status-updated",
          actorName,
          update.comment || `Run status updated to ${update.status}.`
        );
        return record;
      },
      listTrainRunEventHistory,
      getTrainRunImpactSummary(propertyCode, runId) {
        const run = getTrainRun(propertyCode, runId);
        const delays = listDelayEvents(propertyCode, runId);
        const delayAdditionalInfo = Object.fromEntries(
          delays.items.map((delay) => [delay.id, getDelayAdditionalInfo(propertyCode, delay.id)])
        );

        return deriveTrainRunImpactSummary(
          run,
          listStationStops(propertyCode, runId),
          delays,
          delayAdditionalInfo
        );
      },
      listTrainScheduleApprovalHistory(propertyCode, scheduleId) {
        const runIds = listTrainRuns(propertyCode).items
          .filter((run) => run.scheduleId === scheduleId)
          .map((run) => run.id);
        return listTrainScheduleApprovalHistory(propertyCode, runIds);
      },
      getTrainScheduleApprovalSummary(propertyCode, scheduleId) {
        const runs = listTrainRuns(propertyCode);
        const impactsByRunId = Object.fromEntries(
          runs.items
            .filter((run) => run.scheduleId === scheduleId)
            .map((run) => {
              const delays = listDelayEvents(propertyCode, run.id);
              const delayAdditionalInfo = Object.fromEntries(
                delays.items.map((delay) => [delay.id, getDelayAdditionalInfo(propertyCode, delay.id)])
              );

              return [
                run.id,
                deriveTrainRunImpactSummary(
                  run,
                  listStationStops(propertyCode, run.id),
                  delays,
                  delayAdditionalInfo
                )
              ];
            })
        );

        return deriveTrainScheduleApprovalSummary(scheduleId, runs, impactsByRunId);
      },
      listStationStops,
      updateStationStop(propertyCode, runId, stopId, update) {
        assertRunMutable(propertyCode, runId);
        return updateStationStop(propertyCode, runId, stopId, update);
      },
      listDelayEvents,
      listDelayCommonLocations,
      listDelayTemplates,
      listNotableDelayTypes,
      listSpecialMovements,
      updateDelayCommonLocation,
      updateDelayTemplate,
      updateSpecialMovement,
      getDelayAdditionalInfo,
      getDelayWorkOrder,
      createDelayWorkOrder(propertyCode, delayId, input, actorName) {
        const workOrder = createDelayWorkOrder(propertyCode, delayId, input, actorName);
        const runId =
          listTrainRuns(propertyCode).items.find((run) =>
            listDelayEvents(propertyCode, run.id).items.some((delay) => delay.id === delayId)
          )?.id ?? "unknown-run";
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "delay-work-order-created",
          actorName,
          `Work order ${workOrder.workOrderId} created for delay ${delayId}.`
        );
        return workOrder;
      },
      updateDelayAdditionalInfo,
      deleteDelayAdditionalInfo(propertyCode, delayId, actorName) {
        const result = deleteDelayAdditionalInfo(propertyCode, delayId);
        const runId =
          listTrainRuns(propertyCode).items.find((run) =>
            listDelayEvents(propertyCode, run.id).items.some((delay) => delay.id === delayId)
          )?.id ?? "unknown-run";
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "delay-metadata-cleared",
          actorName,
          `Delay metadata cleared for ${delayId}.`
        );
        return result;
      },
      createDelayFromTemplate(propertyCode, runId, input) {
        assertRunMutable(propertyCode, runId);
        const created = createDelayFromTemplate(propertyCode, runId, input);
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "delay-created",
          "Local Development User",
          `Delay created from template ${input.templateId}.`
        );
        return created;
      },
      createDelayEvents(propertyCode, runId, input) {
        assertRunMutable(propertyCode, runId);
        const created = createDelayEvents(propertyCode, runId, input);
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "delay-created",
          "Local Development User",
          `${created.items.length} delay event(s) created on the run.`
        );
        return created;
      },
      deleteDelayEvent(propertyCode, runId, delayId) {
        assertRunMutable(propertyCode, runId);
        const result = deleteDelayEvent(propertyCode, runId, delayId);
        recordTrainRunEventHistory(
          propertyCode,
          runId,
          "delay-deleted",
          "Local Development User",
          `Delay ${delayId} deleted from the run.`
        );
        return result;
      },
      updateDelayEvent(propertyCode, runId, delayId, update) {
        assertRunMutable(propertyCode, runId);
        return updateDelayEvent(propertyCode, runId, delayId, update);
      },
      getDelayPropagationPreview,
      listConsistEquipment,
      listConsistTemplates,
      swapConsistEquipment(propertyCode, runId, request) {
        assertRunMutable(propertyCode, runId);
        return swapConsistEquipment(propertyCode, runId, request);
      },
      updateConsistEquipment(propertyCode, runId, equipmentId, update) {
        assertRunMutable(propertyCode, runId);
        return updateConsistEquipment(propertyCode, runId, equipmentId, update);
      },
      listCrewAssignments,
      listCrewTemplates,
      swapCrewAssignments(propertyCode, runId, request) {
        assertRunMutable(propertyCode, runId);
        return swapCrewAssignments(propertyCode, runId, request);
      },
      updateCrewAssignment(propertyCode, runId, assignmentId, update) {
        assertRunMutable(propertyCode, runId);
        return updateCrewAssignment(propertyCode, runId, assignmentId, update);
      },
      listFareEnforcement,
      listFareEnforcementSummary,
      getFareEnforcementDashboard(propertyCode) {
        return getFareEnforcementDashboard(
          propertyCode,
          listTrainRuns(propertyCode).items.map((run) => run.id)
        );
      },
      createFareEnforcement,
      updateFareEnforcement
    }
  };
}
