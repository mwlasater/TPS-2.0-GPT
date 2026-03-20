import {
  createFareEnforcement,
  deleteFareEnforcementForRun,
  getFareEnforcementDashboard,
  listFareEnforcement,
  listFareEnforcementSummary,
  updateFareEnforcement
} from "../lib/fare-enforcement-data.js";
import {
  listAttendanceExceptions,
  listJobProfiles,
  updateAttendanceException,
  updateJobProfile
} from "../lib/baseline-data.js";
import { listManagedUsers } from "../lib/managed-users.js";
import { listPersonnelRecords, updatePersonnelStatus } from "../lib/personnel-data.js";
import {
  deleteTrainRun,
  initializeTrainRuns,
  listTrainRuns,
  resetTrainRun,
  listTrainSchedules,
  updateTrainRunApproval,
  updateTrainRunApprovalBatch
} from "../lib/operations-data.js";
import { listPermissionGroups } from "../lib/permission-groups.js";
import {
  listFiles,
  listNotifications,
  listPowerBiEmbeds,
  updateNotification
} from "../lib/platform-data.js";
import { getPropertySettings, updatePropertySettings } from "../lib/property-settings.js";
import { getReferenceData, updateReferenceData } from "../lib/reference-data.js";
import { listReportConfig, updateReportConfig } from "../lib/report-config.js";
import {
  createDelayFromTemplate,
  createDelayEvents,
  deleteDelayEvent,
  deleteRunDetailState,
  getDelayAdditionalInfo,
  listDelayTemplates,
  listDelayEvents,
  listDelayCommonLocations,
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
  createManagedUserDetail,
  executeUserAdminAction,
  getManagedUserDetail,
  listUserAdminActions,
  updateManagedUserPermissionGroups,
  updateManagedUserPropertyAccess
} from "../lib/user-admin-data.js";

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
      createUser: createManagedUserDetail,
      getUserDetail: getManagedUserDetail,
      executeUserAdminAction,
      updateUserPropertyAccess: updateManagedUserPropertyAccess,
      updateUserPermissionGroups: updateManagedUserPermissionGroups,
      listUserAdminActions(_propertyCode, actorPermissions) {
        return listUserAdminActions(actorPermissions);
      },
      listPermissionGroups,
      listJobProfiles,
      listPersonnelRecords,
      updatePersonnelStatus,
      updateJobProfile,
      listAttendanceExceptions,
      updateAttendanceException
    },
    platform: {
      listReportConfig,
      updateReportConfig,
      listFiles,
      listNotifications,
      updateNotification,
      listPowerBiEmbeds
    },
    operations: {
      listTrainSchedules,
      listTrainRuns,
      initializeTrainRuns,
      resetTrainRun(propertyCode, runId) {
        assertRunMutable(propertyCode, runId);
        resetRunDetailState(propertyCode, runId);
        resetRunResourceState(propertyCode, runId);
        return resetTrainRun(propertyCode, runId);
      },
      deleteTrainRun(propertyCode, runId) {
        assertRunMutable(propertyCode, runId);
        deleteRunDetailState(propertyCode, runId);
        deleteRunResourceState(propertyCode, runId);
        deleteFareEnforcementForRun(propertyCode, runId);
        deleteTrainRunApprovalHistory(propertyCode, runId);
        return deleteTrainRun(propertyCode, runId);
      },
      updateTrainRunApproval(propertyCode, runId, update, actorName) {
        const run = updateTrainRunApproval(propertyCode, runId, update);
        recordTrainRunApprovalHistory(propertyCode, runId, update, actorName);
        return run;
      },
      updateTrainRunApprovalBatch(propertyCode, update, actorName) {
        const result = updateTrainRunApprovalBatch(propertyCode, update);

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
      listTrainScheduleApprovalHistory(propertyCode, scheduleId) {
        const runIds = listTrainRuns(propertyCode).items
          .filter((run) => run.scheduleId === scheduleId)
          .map((run) => run.id);
        return listTrainScheduleApprovalHistory(propertyCode, runIds);
      },
      listStationStops,
      updateStationStop(propertyCode, runId, stopId, update) {
        assertRunMutable(propertyCode, runId);
        return updateStationStop(propertyCode, runId, stopId, update);
      },
      listDelayEvents,
      listDelayCommonLocations,
      listDelayTemplates,
      listSpecialMovements,
      updateDelayCommonLocation,
      updateDelayTemplate,
      updateSpecialMovement,
      getDelayAdditionalInfo,
      updateDelayAdditionalInfo,
      createDelayFromTemplate(propertyCode, runId, input) {
        assertRunMutable(propertyCode, runId);
        return createDelayFromTemplate(propertyCode, runId, input);
      },
      createDelayEvents(propertyCode, runId, input) {
        assertRunMutable(propertyCode, runId);
        return createDelayEvents(propertyCode, runId, input);
      },
      deleteDelayEvent(propertyCode, runId, delayId) {
        assertRunMutable(propertyCode, runId);
        return deleteDelayEvent(propertyCode, runId, delayId);
      },
      updateDelayEvent(propertyCode, runId, delayId, update) {
        assertRunMutable(propertyCode, runId);
        return updateDelayEvent(propertyCode, runId, delayId, update);
      },
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
