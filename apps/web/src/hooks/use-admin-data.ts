import type {
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayTemplateList,
  DelayTemplateUpdate,
  PermissionGroupCreate,
  PermissionGroupList,
  PermissionGroupUpdate,
  PropertyCode,
  ReportConfigList,
  ReportPreferenceList,
  ReportPreferenceUpdate,
  ReportConfigUpdate,
  ScheduledReportEmailJobCreate,
  ScheduledReportEmailJobList,
  ScheduledReportEmailJobUpdate,
  SpecialMovementList,
  SpecialMovementUpdate
} from "@tps/types";
import { useEffect, useState } from "react";

import {
  createPermissionGroupDefinition,
  createScheduledReportEmailJob,
  deletePermissionGroupDefinition,
  deleteScheduledReportEmailJob,
  fetchAdminDelayCommonLocations,
  fetchAdminDelayTemplates,
  fetchAdminSpecialMovements,
  fetchPermissionGroups,
  fetchReportConfig,
  fetchReportPreferences,
  fetchScheduledReportEmailJobs,
  updatePermissionGroupDefinition,
  updateAdminDelayCommonLocation,
  updateAdminDelayTemplate,
  updateAdminSpecialMovement,
  updateReportConfig,
  updateReportPreference,
  updateScheduledReportEmailJob
} from "../lib/api.js";
import {
  demoDelayCommonLocations,
  demoDelayTemplates,
  demoPermissionGroups,
  demoReportConfig,
  demoReportPreferences,
  demoScheduledReportEmailJobs,
  demoSpecialMovements
} from "../lib/session.js";

interface AdminDataState {
  delayCommonLocations: DelayCommonLocationList;
  delayTemplates: DelayTemplateList;
  permissionGroups: PermissionGroupList;
  reportConfig: ReportConfigList;
  reportPreferences: ReportPreferenceList;
  scheduledReportEmails: ScheduledReportEmailJobList;
  specialMovements: SpecialMovementList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  createPermissionGroup: (input: PermissionGroupCreate) => Promise<void>;
  deletePermissionGroup: (groupId: string) => Promise<void>;
  savePermissionGroup: (groupId: string, update: PermissionGroupUpdate) => Promise<void>;
  saveDelayCommonLocation: (locationId: string, update: DelayCommonLocationUpdate) => Promise<void>;
  saveDelayTemplate: (templateId: string, update: DelayTemplateUpdate) => Promise<void>;
  saveReportConfig: (reportId: string, update: ReportConfigUpdate) => Promise<void>;
  saveReportPreference: (preferenceId: string, update: ReportPreferenceUpdate) => Promise<void>;
  createScheduledReportEmail: (input: ScheduledReportEmailJobCreate) => Promise<void>;
  saveScheduledReportEmail: (jobId: string, update: ScheduledReportEmailJobUpdate) => Promise<void>;
  deleteScheduledReportEmail: (jobId: string) => Promise<void>;
  saveSpecialMovement: (movementId: string, update: SpecialMovementUpdate) => Promise<void>;
}

export function useAdminData(propertyCode: PropertyCode): AdminDataState {
  const [state, setState] = useState<AdminDataState>({
    delayCommonLocations: demoDelayCommonLocations[propertyCode],
    delayTemplates: demoDelayTemplates[propertyCode],
    permissionGroups: demoPermissionGroups[propertyCode],
    reportConfig: demoReportConfig[propertyCode],
    reportPreferences: demoReportPreferences[propertyCode],
    scheduledReportEmails: demoScheduledReportEmailJobs[propertyCode],
    specialMovements: demoSpecialMovements[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    createPermissionGroup: async () => undefined,
    deletePermissionGroup: async () => undefined,
    savePermissionGroup: async () => undefined,
    saveDelayCommonLocation: async () => undefined,
    saveDelayTemplate: async () => undefined,
    saveReportConfig: async () => undefined,
    saveReportPreference: async () => undefined,
    createScheduledReportEmail: async () => undefined,
    saveScheduledReportEmail: async () => undefined,
    deleteScheduledReportEmail: async () => undefined,
    saveSpecialMovement: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      delayCommonLocations: demoDelayCommonLocations[propertyCode],
      delayTemplates: demoDelayTemplates[propertyCode],
      permissionGroups: demoPermissionGroups[propertyCode],
      reportConfig: demoReportConfig[propertyCode],
      reportPreferences: demoReportPreferences[propertyCode],
      scheduledReportEmails: demoScheduledReportEmailJobs[propertyCode],
      specialMovements: demoSpecialMovements[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      createPermissionGroup: state.createPermissionGroup,
      deletePermissionGroup: state.deletePermissionGroup,
      savePermissionGroup: state.savePermissionGroup,
      saveDelayCommonLocation: state.saveDelayCommonLocation,
      saveDelayTemplate: state.saveDelayTemplate,
      saveReportConfig: state.saveReportConfig,
      saveReportPreference: state.saveReportPreference,
      createScheduledReportEmail: state.createScheduledReportEmail,
      saveScheduledReportEmail: state.saveScheduledReportEmail,
      deleteScheduledReportEmail: state.deleteScheduledReportEmail,
      saveSpecialMovement: state.saveSpecialMovement
    });

    void Promise.all([
      fetchAdminDelayCommonLocations(propertyCode),
      fetchAdminDelayTemplates(propertyCode),
      fetchAdminSpecialMovements(propertyCode),
      fetchPermissionGroups(propertyCode),
      fetchReportConfig(propertyCode),
      fetchReportPreferences(propertyCode),
      fetchScheduledReportEmailJobs(propertyCode)
    ])
      .then(([
        delayCommonLocations,
        delayTemplates,
        specialMovements,
        permissionGroups,
        reportConfig,
        reportPreferences,
        scheduledReportEmails
      ]) => {
        if (isMounted) {
          setState({
            delayCommonLocations,
            delayTemplates,
            permissionGroups,
            reportConfig,
            reportPreferences,
            scheduledReportEmails,
            specialMovements,
            source: "api",
            isLoading: false,
            isSaving: false,
            createPermissionGroup: state.createPermissionGroup,
            deletePermissionGroup: state.deletePermissionGroup,
            savePermissionGroup: state.savePermissionGroup,
            saveDelayCommonLocation: state.saveDelayCommonLocation,
            saveDelayTemplate: state.saveDelayTemplate,
            saveReportConfig: state.saveReportConfig,
            saveReportPreference: state.saveReportPreference,
            createScheduledReportEmail: state.createScheduledReportEmail,
            saveScheduledReportEmail: state.saveScheduledReportEmail,
            deleteScheduledReportEmail: state.deleteScheduledReportEmail,
            saveSpecialMovement: state.saveSpecialMovement
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            delayCommonLocations: demoDelayCommonLocations[propertyCode],
            delayTemplates: demoDelayTemplates[propertyCode],
            permissionGroups: demoPermissionGroups[propertyCode],
            reportConfig: demoReportConfig[propertyCode],
            reportPreferences: demoReportPreferences[propertyCode],
            scheduledReportEmails: demoScheduledReportEmailJobs[propertyCode],
            specialMovements: demoSpecialMovements[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            createPermissionGroup: state.createPermissionGroup,
            deletePermissionGroup: state.deletePermissionGroup,
            savePermissionGroup: state.savePermissionGroup,
            saveDelayCommonLocation: state.saveDelayCommonLocation,
            saveDelayTemplate: state.saveDelayTemplate,
            saveReportConfig: state.saveReportConfig,
            saveReportPreference: state.saveReportPreference,
            createScheduledReportEmail: state.createScheduledReportEmail,
            saveScheduledReportEmail: state.saveScheduledReportEmail,
            deleteScheduledReportEmail: state.deleteScheduledReportEmail,
            saveSpecialMovement: state.saveSpecialMovement
          });
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propertyCode]);

  async function savePermissionGroup(groupId: string, update: PermissionGroupUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updatePermissionGroupDefinition(propertyCode, groupId, update);
      setState((current) => ({
        ...current,
        permissionGroups: {
          items: current.permissionGroups.items.map((item) =>
            item.id === groupId ? { ...item, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("permission_group.update_failed");
    }
  }

  async function createPermissionGroup(input: PermissionGroupCreate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await createPermissionGroupDefinition(propertyCode, input);
      const permissionGroups = await fetchPermissionGroups(propertyCode);
      setState((current) => ({
        ...current,
        permissionGroups,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("permission_group.create_failed");
    }
  }

  async function deletePermissionGroup(groupId: string): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await deletePermissionGroupDefinition(propertyCode, groupId);
      setState((current) => ({
        ...current,
        permissionGroups: {
          items: current.permissionGroups.items.filter((item) => item.id !== groupId)
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("permission_group.delete_failed");
    }
  }

  async function saveReportConfig(reportId: string, update: ReportConfigUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateReportConfig(propertyCode, reportId, update);
      setState((current) => ({
        ...current,
        reportConfig: {
          items: current.reportConfig.items.map((item) => (item.id === reportId ? updated : item))
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("report_config.update_failed");
    }
  }

  async function saveReportPreference(
    preferenceId: string,
    update: ReportPreferenceUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateReportPreference(propertyCode, preferenceId, update);
      setState((current) => ({
        ...current,
        reportPreferences: {
          items: current.reportPreferences.items.map((item) =>
            item.id === preferenceId ? updated : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("report_preference.update_failed");
    }
  }

  async function createScheduledReportEmail(
    input: ScheduledReportEmailJobCreate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createScheduledReportEmailJob(propertyCode, input);
      setState((current) => ({
        ...current,
        scheduledReportEmails: {
          items: [created, ...current.scheduledReportEmails.items]
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("scheduled_report_email.create_failed");
    }
  }

  async function saveScheduledReportEmail(
    jobId: string,
    update: ScheduledReportEmailJobUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateScheduledReportEmailJob(propertyCode, jobId, update);
      setState((current) => ({
        ...current,
        scheduledReportEmails: {
          items: current.scheduledReportEmails.items.map((item) =>
            item.id === jobId ? updated : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("scheduled_report_email.update_failed");
    }
  }

  async function deleteScheduledReportEmail(jobId: string): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await deleteScheduledReportEmailJob(propertyCode, jobId);
      setState((current) => ({
        ...current,
        scheduledReportEmails: {
          items: current.scheduledReportEmails.items.filter((item) => item.id !== jobId)
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("scheduled_report_email.delete_failed");
    }
  }

  async function saveDelayCommonLocation(
    locationId: string,
    update: DelayCommonLocationUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updateAdminDelayCommonLocation(propertyCode, locationId, update);
      setState((current) => ({
        ...current,
        delayCommonLocations: {
          items: current.delayCommonLocations.items.map((item) =>
            item.id === locationId ? { ...item, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("delay_common_location.update_failed");
    }
  }

  async function saveDelayTemplate(templateId: string, update: DelayTemplateUpdate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updateAdminDelayTemplate(propertyCode, templateId, update);
      setState((current) => ({
        ...current,
        delayTemplates: {
          items: current.delayTemplates.items.map((item) =>
            item.id === templateId ? { id: item.id, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("delay_template.update_failed");
    }
  }

  async function saveSpecialMovement(
    movementId: string,
    update: SpecialMovementUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await updateAdminSpecialMovement(propertyCode, movementId, update);
      setState((current) => ({
        ...current,
        specialMovements: {
          items: current.specialMovements.items.map((item) =>
            item.id === movementId ? { ...item, ...update } : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("special_movement.update_failed");
    }
  }

  return {
    ...state,
    createPermissionGroup,
    deletePermissionGroup,
    savePermissionGroup,
    saveDelayCommonLocation,
    saveDelayTemplate,
    saveReportConfig,
    saveReportPreference,
    createScheduledReportEmail,
    saveScheduledReportEmail,
    deleteScheduledReportEmail,
    saveSpecialMovement
  };
}
