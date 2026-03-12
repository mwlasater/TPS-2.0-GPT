import { listAttendanceExceptions, listJobProfiles } from "../lib/baseline-data.js";
import { listManagedUsers } from "../lib/managed-users.js";
import { listTrainRuns, listTrainSchedules } from "../lib/operations-data.js";
import { listPermissionGroups } from "../lib/permission-groups.js";
import { listFiles, listNotifications, listPowerBiEmbeds } from "../lib/platform-data.js";
import { getPropertySettings, updatePropertySettings } from "../lib/property-settings.js";
import { getReferenceData } from "../lib/reference-data.js";
import { listReportConfig } from "../lib/report-config.js";
import { listDelayEvents, listStationStops } from "../lib/run-detail-data.js";
import { listConsistEquipment, listCrewAssignments } from "../lib/run-resource-data.js";
import {
  getManagedUserDetail,
  listUserAdminActions,
  updateManagedUserPropertyAccess
} from "../lib/user-admin-data.js";

import type { DataAccess } from "./contracts.js";

export function createMockDataAccess(): DataAccess {
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
      listUserAdminActions,
      listPermissionGroups,
      listJobProfiles,
      listAttendanceExceptions
    },
    platform: {
      listReportConfig,
      listFiles,
      listNotifications,
      listPowerBiEmbeds
    },
    operations: {
      listTrainSchedules,
      listTrainRuns,
      listStationStops,
      listDelayEvents,
      listConsistEquipment,
      listCrewAssignments
    }
  };
}
