import type {
  DelayCommonLocationList,
  DelayCommonLocationUpdate,
  DelayTemplateList,
  DelayTemplateUpdate,
  LiveReportCatalogList,
  LiveReportExecutionList,
  LiveReportExecutionRequest,
  PassengerReportImportCreate,
  PassengerReportImportList,
  PermissionGroupCreate,
  PermissionGroupList,
  PermissionGroupUpdate,
  PropertyCode,
  ReportConfigList,
  ReportDeliveryRecordList,
  ReportDeliveryRequest,
  ReportDeliveryStatusUpdate,
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
  createPassengerReportImport,
  createReportDelivery,
  createScheduledReportEmailJob,
  deletePermissionGroupDefinition,
  deleteScheduledReportEmailJob,
  executeLiveReportRequest,
  fetchAdminDelayCommonLocations,
  fetchAdminDelayTemplates,
  fetchAdminSpecialMovements,
  fetchLiveReports,
  fetchLiveReportExecutions,
  fetchPassengerReportImports,
  fetchReportDeliveries,
  fetchPermissionGroups,
  fetchReportConfig,
  fetchReportPreferences,
  fetchScheduledReportEmailJobs,
  retryReportDeliveryRequest,
  updatePermissionGroupDefinition,
  updateAdminDelayCommonLocation,
  updateAdminDelayTemplate,
  updateReportDeliveryStatus,
  updateAdminSpecialMovement,
  updateReportConfig,
  updateReportPreference,
  updateScheduledReportEmailJob
} from "../lib/api.js";
import {
  demoDelayCommonLocations,
  demoDelayTemplates,
  demoLiveReports,
  demoPassengerReportImports,
  demoPermissionGroups,
  demoReportConfig,
  demoReportDeliveries,
  demoReportPreferences,
  demoScheduledReportEmailJobs,
  demoSpecialMovements
} from "../lib/session.js";

interface AdminDataState {
  delayCommonLocations: DelayCommonLocationList;
  delayTemplates: DelayTemplateList;
  liveReports: LiveReportCatalogList;
  liveReportExecutions: LiveReportExecutionList;
  passengerReportImports: PassengerReportImportList;
  permissionGroups: PermissionGroupList;
  reportConfig: ReportConfigList;
  reportDeliveries: ReportDeliveryRecordList;
  reportPreferences: ReportPreferenceList;
  scheduledReportEmails: ScheduledReportEmailJobList;
  specialMovements: SpecialMovementList;
  source: "api" | "fallback";
  isLoading: boolean;
  isSaving: boolean;
  createPermissionGroup: (input: PermissionGroupCreate) => Promise<void>;
  createPassengerImport: (input: PassengerReportImportCreate) => Promise<void>;
  createReportDelivery: (input: ReportDeliveryRequest) => Promise<void>;
  executeLiveReport: (reportId: string, input: LiveReportExecutionRequest) => Promise<void>;
  deletePermissionGroup: (groupId: string) => Promise<void>;
  savePermissionGroup: (groupId: string, update: PermissionGroupUpdate) => Promise<void>;
  saveDelayCommonLocation: (locationId: string, update: DelayCommonLocationUpdate) => Promise<void>;
  saveDelayTemplate: (templateId: string, update: DelayTemplateUpdate) => Promise<void>;
  saveReportConfig: (reportId: string, update: ReportConfigUpdate) => Promise<void>;
  saveReportPreference: (preferenceId: string, update: ReportPreferenceUpdate) => Promise<void>;
  createScheduledReportEmail: (input: ScheduledReportEmailJobCreate) => Promise<void>;
  saveScheduledReportEmail: (jobId: string, update: ScheduledReportEmailJobUpdate) => Promise<void>;
  deleteScheduledReportEmail: (jobId: string) => Promise<void>;
  saveReportDeliveryStatus: (deliveryId: string, update: ReportDeliveryStatusUpdate) => Promise<void>;
  retryReportDelivery: (deliveryId: string) => Promise<void>;
  saveSpecialMovement: (movementId: string, update: SpecialMovementUpdate) => Promise<void>;
}

export function useAdminData(propertyCode: PropertyCode): AdminDataState {
  const [state, setState] = useState<AdminDataState>({
    delayCommonLocations: demoDelayCommonLocations[propertyCode],
    delayTemplates: demoDelayTemplates[propertyCode],
    liveReports: demoLiveReports[propertyCode],
    liveReportExecutions: { items: [] },
    passengerReportImports: demoPassengerReportImports[propertyCode],
    permissionGroups: demoPermissionGroups[propertyCode],
    reportConfig: demoReportConfig[propertyCode],
    reportDeliveries: demoReportDeliveries[propertyCode],
    reportPreferences: demoReportPreferences[propertyCode],
    scheduledReportEmails: demoScheduledReportEmailJobs[propertyCode],
    specialMovements: demoSpecialMovements[propertyCode],
    source: "fallback",
    isLoading: true,
    isSaving: false,
    createPermissionGroup: async () => undefined,
    createPassengerImport: async () => undefined,
    createReportDelivery: async () => undefined,
    executeLiveReport: async () => undefined,
    deletePermissionGroup: async () => undefined,
    savePermissionGroup: async () => undefined,
    saveDelayCommonLocation: async () => undefined,
    saveDelayTemplate: async () => undefined,
    saveReportConfig: async () => undefined,
    saveReportPreference: async () => undefined,
    createScheduledReportEmail: async () => undefined,
    saveScheduledReportEmail: async () => undefined,
    deleteScheduledReportEmail: async () => undefined,
    saveReportDeliveryStatus: async () => undefined,
    retryReportDelivery: async () => undefined,
    saveSpecialMovement: async () => undefined
  });

  useEffect(() => {
    let isMounted = true;

    setState({
      delayCommonLocations: demoDelayCommonLocations[propertyCode],
      delayTemplates: demoDelayTemplates[propertyCode],
      liveReports: demoLiveReports[propertyCode],
      liveReportExecutions: { items: [] },
      passengerReportImports: demoPassengerReportImports[propertyCode],
      permissionGroups: demoPermissionGroups[propertyCode],
      reportConfig: demoReportConfig[propertyCode],
      reportDeliveries: demoReportDeliveries[propertyCode],
      reportPreferences: demoReportPreferences[propertyCode],
      scheduledReportEmails: demoScheduledReportEmailJobs[propertyCode],
      specialMovements: demoSpecialMovements[propertyCode],
      source: "fallback",
      isLoading: true,
      isSaving: false,
      createPermissionGroup: state.createPermissionGroup,
      createPassengerImport: state.createPassengerImport,
      createReportDelivery: state.createReportDelivery,
      executeLiveReport: state.executeLiveReport,
      deletePermissionGroup: state.deletePermissionGroup,
      savePermissionGroup: state.savePermissionGroup,
      saveDelayCommonLocation: state.saveDelayCommonLocation,
      saveDelayTemplate: state.saveDelayTemplate,
      saveReportConfig: state.saveReportConfig,
      saveReportPreference: state.saveReportPreference,
      createScheduledReportEmail: state.createScheduledReportEmail,
      saveScheduledReportEmail: state.saveScheduledReportEmail,
      deleteScheduledReportEmail: state.deleteScheduledReportEmail,
      saveReportDeliveryStatus: state.saveReportDeliveryStatus,
      retryReportDelivery: state.retryReportDelivery,
      saveSpecialMovement: state.saveSpecialMovement
    });

    void Promise.all([
      fetchAdminDelayCommonLocations(propertyCode),
      fetchAdminDelayTemplates(propertyCode),
      fetchAdminSpecialMovements(propertyCode),
      fetchLiveReports(propertyCode),
      fetchLiveReportExecutions(propertyCode),
      fetchPassengerReportImports(propertyCode),
      fetchPermissionGroups(propertyCode),
      fetchReportConfig(propertyCode),
      fetchReportDeliveries(propertyCode),
      fetchReportPreferences(propertyCode),
      fetchScheduledReportEmailJobs(propertyCode)
    ])
      .then(([
        delayCommonLocations,
        delayTemplates,
        specialMovements,
        liveReports,
        liveReportExecutions,
        passengerReportImports,
        permissionGroups,
        reportConfig,
        reportDeliveries,
        reportPreferences,
        scheduledReportEmails
      ]) => {
        if (isMounted) {
          setState({
            delayCommonLocations,
            delayTemplates,
            liveReports,
            liveReportExecutions,
            passengerReportImports,
            permissionGroups,
            reportConfig,
            reportDeliveries,
            reportPreferences,
            scheduledReportEmails,
            specialMovements,
            source: "api",
            isLoading: false,
            isSaving: false,
            createPermissionGroup: state.createPermissionGroup,
            createPassengerImport: state.createPassengerImport,
            createReportDelivery: state.createReportDelivery,
            executeLiveReport: state.executeLiveReport,
            deletePermissionGroup: state.deletePermissionGroup,
            savePermissionGroup: state.savePermissionGroup,
            saveDelayCommonLocation: state.saveDelayCommonLocation,
            saveDelayTemplate: state.saveDelayTemplate,
            saveReportConfig: state.saveReportConfig,
            saveReportPreference: state.saveReportPreference,
            createScheduledReportEmail: state.createScheduledReportEmail,
            saveScheduledReportEmail: state.saveScheduledReportEmail,
            deleteScheduledReportEmail: state.deleteScheduledReportEmail,
            saveReportDeliveryStatus: state.saveReportDeliveryStatus,
            retryReportDelivery: state.retryReportDelivery,
            saveSpecialMovement: state.saveSpecialMovement
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({
            delayCommonLocations: demoDelayCommonLocations[propertyCode],
            delayTemplates: demoDelayTemplates[propertyCode],
            liveReports: demoLiveReports[propertyCode],
            liveReportExecutions: { items: [] },
            passengerReportImports: demoPassengerReportImports[propertyCode],
            permissionGroups: demoPermissionGroups[propertyCode],
            reportConfig: demoReportConfig[propertyCode],
            reportDeliveries: demoReportDeliveries[propertyCode],
            reportPreferences: demoReportPreferences[propertyCode],
            scheduledReportEmails: demoScheduledReportEmailJobs[propertyCode],
            specialMovements: demoSpecialMovements[propertyCode],
            source: "fallback",
            isLoading: false,
            isSaving: false,
            createPermissionGroup: state.createPermissionGroup,
            createPassengerImport: state.createPassengerImport,
            createReportDelivery: state.createReportDelivery,
            executeLiveReport: state.executeLiveReport,
            deletePermissionGroup: state.deletePermissionGroup,
            savePermissionGroup: state.savePermissionGroup,
            saveDelayCommonLocation: state.saveDelayCommonLocation,
            saveDelayTemplate: state.saveDelayTemplate,
            saveReportConfig: state.saveReportConfig,
            saveReportPreference: state.saveReportPreference,
            createScheduledReportEmail: state.createScheduledReportEmail,
            saveScheduledReportEmail: state.saveScheduledReportEmail,
            deleteScheduledReportEmail: state.deleteScheduledReportEmail,
            saveReportDeliveryStatus: state.saveReportDeliveryStatus,
            retryReportDelivery: state.retryReportDelivery,
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

  async function createPassengerImport(input: PassengerReportImportCreate): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      await createPassengerReportImport(propertyCode, input);
      const passengerReportImports = await fetchPassengerReportImports(propertyCode);
      setState((current) => ({
        ...current,
        passengerReportImports,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("passenger_report_import.create_failed");
    }
  }

  async function queueReportDelivery(input: ReportDeliveryRequest): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await createReportDelivery(propertyCode, input);
      setState((current) => ({
        ...current,
        reportDeliveries: {
          items: [created, ...current.reportDeliveries.items]
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("report_delivery.create_failed");
    }
  }

  async function runLiveReport(reportId: string, input: LiveReportExecutionRequest): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const created = await executeLiveReportRequest(propertyCode, reportId, input);
      setState((current) => ({
        ...current,
        liveReportExecutions: {
          items: [created, ...current.liveReportExecutions.items]
        },
        reportDeliveries:
          created.linkedDeliveryId && created.deliveryMode !== "view"
            ? {
                items: [
                  {
                    id: created.linkedDeliveryId,
                    reportName: created.reportName,
                    format: created.format === "interactive" ? "pdf" : created.format,
                    deliveryMode: created.deliveryMode === "email" ? "email" : "download",
                    recipient: created.recipient,
                    status: created.deliveryMode === "email" ? "sent" : "generated",
                    requestedAt: created.executedAt,
                    requestedBy: created.executedBy,
                    notes: created.notes,
                    retryCount: 0,
                    lastRetriedAt: null
                  },
                  ...current.reportDeliveries.items
                ]
              }
            : current.reportDeliveries,
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("live_report.execute_failed");
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

  async function saveReportDelivery(
    deliveryId: string,
    update: ReportDeliveryStatusUpdate
  ): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await updateReportDeliveryStatus(propertyCode, deliveryId, update);
      setState((current) => ({
        ...current,
        reportDeliveries: {
          items: current.reportDeliveries.items.map((item) =>
            item.id === deliveryId ? updated : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("report_delivery.update_failed");
    }
  }

  async function retryReportDelivery(deliveryId: string): Promise<void> {
    setState((current) => ({ ...current, isSaving: true }));

    try {
      const updated = await retryReportDeliveryRequest(propertyCode, deliveryId);
      setState((current) => ({
        ...current,
        reportDeliveries: {
          items: current.reportDeliveries.items.map((item) =>
            item.id === deliveryId ? updated : item
          )
        },
        source: "api",
        isSaving: false
      }));
    } catch {
      setState((current) => ({ ...current, isSaving: false }));
      throw new Error("report_delivery.retry_failed");
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
    createPassengerImport,
    createReportDelivery: queueReportDelivery,
    executeLiveReport: runLiveReport,
    deletePermissionGroup,
    savePermissionGroup,
    saveDelayCommonLocation,
    saveDelayTemplate,
    saveReportConfig,
    saveReportPreference,
    createScheduledReportEmail,
    saveScheduledReportEmail,
    deleteScheduledReportEmail,
    saveReportDeliveryStatus: saveReportDelivery,
    retryReportDelivery,
    saveSpecialMovement
  };
}
