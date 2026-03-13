import { listFareEnforcement, updateFareEnforcement } from "../lib/fare-enforcement-data.js";
import {
  listAttendanceExceptions,
  listJobProfiles,
  updateAttendanceException,
  updateJobProfile
} from "../lib/baseline-data.js";
import { listManagedUsers } from "../lib/managed-users.js";
import { listTrainRuns, listTrainSchedules, updateTrainRunApproval } from "../lib/operations-data.js";
import { listPermissionGroups } from "../lib/permission-groups.js";
import {
  listFiles,
  listNotifications,
  listPowerBiEmbeds,
  updateNotification
} from "../lib/platform-data.js";
import { getPropertySettings, updatePropertySettings } from "../lib/property-settings.js";
import { getReferenceData } from "../lib/reference-data.js";
import { listReportConfig, updateReportConfig } from "../lib/report-config.js";
import {
  listDelayEvents,
  listStationStops,
  updateDelayEvent,
  updateStationStop
} from "../lib/run-detail-data.js";
import {
  listConsistEquipment,
  listCrewAssignments,
  updateConsistEquipment,
  updateCrewAssignment
} from "../lib/run-resource-data.js";
import {
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
      getReferenceData
    },
    users: {
      listUsers: listManagedUsers,
      getUserDetail: getManagedUserDetail,
      updateUserPropertyAccess: updateManagedUserPropertyAccess,
      updateUserPermissionGroups: updateManagedUserPermissionGroups,
      listUserAdminActions,
      listPermissionGroups,
      listJobProfiles,
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
      updateTrainRunApproval(propertyCode, runId, update, actorName) {
        const run = updateTrainRunApproval(propertyCode, runId, update);
        recordTrainRunApprovalHistory(propertyCode, runId, update, actorName);
        return run;
      },
      listTrainRunApprovalHistory,
      listStationStops,
      updateStationStop(propertyCode, runId, stopId, update) {
        assertRunMutable(propertyCode, runId);
        return updateStationStop(propertyCode, stopId, update);
      },
      listDelayEvents,
      updateDelayEvent(propertyCode, runId, delayId, update) {
        assertRunMutable(propertyCode, runId);
        return updateDelayEvent(propertyCode, delayId, update);
      },
      listConsistEquipment,
      updateConsistEquipment(propertyCode, runId, equipmentId, update) {
        assertRunMutable(propertyCode, runId);
        return updateConsistEquipment(propertyCode, equipmentId, update);
      },
      listCrewAssignments,
      updateCrewAssignment(propertyCode, runId, assignmentId, update) {
        assertRunMutable(propertyCode, runId);
        return updateCrewAssignment(propertyCode, assignmentId, update);
      },
      listFareEnforcement,
      updateFareEnforcement
    }
  };
}
import {
  listTrainRunApprovalHistory,
  recordTrainRunApprovalHistory
} from "../lib/approval-history-data.js";
